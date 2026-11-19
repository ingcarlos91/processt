import { db, consultoraActual } from "@/lib/db";
import { evaluarEmpresa, composicionCopasst, type ResultadoReglas } from "@/lib/reglas/motor";
import { calcular, CLASIFICACION_ETIQUETA } from "@/lib/gtc45";
import { INDICADORES } from "@/lib/indicadores";
import { calificar } from "@/lib/evaluacion";
import { generarPlan, MESES } from "@/lib/plan/generar";

const ROMANO = ["", "I", "II", "III", "IV", "V"];
const PERFIL_TEXTO: Record<string, string> = { tecnico: "Técnico en SST", tecnologo: "Tecnólogo en SST", profesional: "Profesional en SST", especialista: "Profesional con posgrado en SST" };
const PVE_NOMBRE: Record<string, string> = { osteomuscular: "Prevención de desórdenes musculoesqueléticos", auditivo: "Conservación auditiva", visual: "Conservación visual", quimico: "Riesgo químico", psicosocial: "Riesgo psicosocial", respiratorio: "Protección respiratoria", biologico: "Riesgo biológico" };
const fmt = (d?: Date | null) => (d ? d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : "");

export async function cargarEmpresa(id: string) {
  return db.empresa.findUniqueOrThrow({
    where: { id },
    include: {
      consultora: true, sedes: true, zonas: true, procesos: { orderBy: { orden: "asc" } }, sectorTipo: true,
      cargos: { include: { tareas: { include: { tarea: true } } }, orderBy: { nombre: "asc" } },
      tareas: { include: { proceso: true, zona: true, cargos: { include: { cargo: true } } } },
      peligros: { include: { peligro: true, tarea: { include: { proceso: true, zona: true, cargos: { include: { cargo: true } } } }, zona: true, cargo: true } },
      evaluaciones: { include: { items: { include: { estandar: true } }, planMejora: true }, orderBy: { fecha: "desc" } },
      actividades: { orderBy: [{ mes: "asc" }] },
      comites: { include: { miembros: true } },
      documentos: { select: { codigo: true, nombre: true, version: true, plantilla: { select: { carpeta: true } } } },
    },
  });
}
export type EmpresaCompleta = Awaited<ReturnType<typeof cargarEmpresa>>;

export async function datosReglas() {
  const [reglas, plantillas, normas, estandares] = await Promise.all([
    db.reglaAplicabilidad.findMany(), db.plantilla.findMany({ orderBy: { codigo: "asc" } }), db.norma.findMany(), db.estandar.findMany({ orderBy: { orden: "asc" } }),
  ]);
  return { reglas, plantillas, normas, estandares };
}

export async function resultadoReglas(e: EmpresaCompleta): Promise<ResultadoReglas> {
  return evaluarEmpresa(e, await datosReglas());
}

/** Filas de matriz con cálculo GTC 45 y personas expuestas. */
export function filasMatriz(e: EmpresaCompleta) {
  // Cargos presentes en una zona: los asignados a ella o que ejecutan alguna tarea en ella.
  const cargosZona = (zonaId: string) => {
    const xs = e.cargos.filter((c) => c.zonaId === zonaId || c.tareas.some((ct) => ct.tarea.zonaId === zonaId));
    return xs.length ? xs : e.zonas.length === 1 ? e.cargos : [];
  };
  return e.peligros
    .filter((p) => p.estado === "aprobado")
    .map((p) => {
      const c = calcular(p.nd, p.ne, p.nc);
      let proceso = "", zona = "", actividad = "", tarea = "", rutinaria = "Sí", expuestos = 0, cargos: string[] = [];
      if (p.origen === "tarea" && p.tarea) {
        proceso = p.tarea.proceso?.nombre ?? ""; zona = p.tarea.zona?.nombre ?? ""; actividad = p.tarea.actividad ?? ""; tarea = p.tarea.nombre;
        rutinaria = p.tarea.rutinaria ? "Sí" : "No";
        expuestos = p.tarea.cargos.reduce((s, ct) => s + ct.cargo.nPersonas, 0);
        cargos = p.tarea.cargos.map((ct) => ct.cargo.nombre);
      } else if (p.origen === "zona" && p.zona) {
        proceso = "Todos"; zona = p.zona.nombre; actividad = "Permanencia en el lugar de trabajo"; tarea = "Todas las tareas en la zona";
        const cz = cargosZona(p.zona.id);
        expuestos = cz.reduce((s, c) => s + c.nPersonas, 0);
        cargos = cz.map((x) => x.nombre);
      } else if (p.origen === "cargo" && p.cargo) {
        proceso = "Todos"; zona = "Todas"; actividad = `Funciones del cargo ${p.cargo.nombre}`; tarea = "Condiciones del cargo";
        expuestos = p.cargo.nPersonas; cargos = [p.cargo.nombre];
      }
      return {
        id: p.id, origen: p.origen, proceso, zona, actividad, tarea, rutinaria, cargos,
        clasificacion: CLASIFICACION_ETIQUETA[p.clasificacion] ?? p.clasificacion, clasificacionClave: p.clasificacion,
        descripcion: p.descripcion, efectos: p.efectosPosibles ?? "",
        controlesFuente: p.controlesFuente ?? "", controlesMedio: p.controlesMedio ?? "", controlesIndividuo: p.controlesIndividuo ?? "",
        nd: p.nd, ne: p.ne, nc: p.nc, np: c.np, interpNp: c.interpNp, nr: c.nr, nivelRiesgo: c.nivel, aceptabilidad: c.aceptabilidad,
        expuestos, peorConsecuencia: p.peorConsecuencia ?? (p.nc >= 100 ? "Muerte" : p.nc >= 60 ? "Lesión con incapacidad permanente" : p.nc >= 25 ? "Lesión con incapacidad temporal" : "Lesión sin incapacidad"),
        requisitoLegal: p.requisitoLegal ? "Sí" : "No",
        eliminacion: p.medidaEliminacion ?? "", sustitucion: p.medidaSustitucion ?? "", ingenieria: p.medidaIngenieria ?? "", administrativa: p.medidaAdministrativa ?? "", epp: p.medidaEpp ?? "",
        catalogo: p.peligro,
      };
    })
    .sort((a, b) => b.nr - a.nr);
}

const MES_CAP: Record<string, number> = {};
function mesPara(i: number) { return [2, 3, 4, 5, 6, 8, 9, 10, 11][i % 9]; }

export async function construirContexto(empresaId: string) {
  const e = await cargarEmpresa(empresaId);
  const consultora = e.consultora ?? (await consultoraActual());
  const rr = await resultadoReglas(e);
  const filas = filasMatriz(e);
  const prioritarios = filas.filter((f) => f.nivelRiesgo === "I" || f.nivelRiesgo === "II");
  const resp = (e.responsableSst ?? {}) as Record<string, string | boolean | undefined>;
  const dis = (e.disparadores ?? {}) as Record<string, boolean>;

  // Cargos con derivados (profesiograma, EPP, capacitaciones)
  const cargos = e.cargos.map((c) => {
    const propias = filas.filter((f) => f.cargos.includes(c.nombre));
    const catalogos = propias.map((f) => f.catalogo).filter(Boolean);
    const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))];
    const examenes = uniq(["Examen médico ocupacional (ingreso, periódico, retiro)", ...catalogos.flatMap((p) => p!.examenesSugeridos)]);
    return {
      nombre: c.nombre, nPersonas: c.nPersonas, area: c.area ?? "", funciones: c.descripcionFunciones ?? "",
      tareas: c.tareas.map((t) => t.tarea.nombre),
      peligros: uniq(propias.map((f) => `${f.clasificacion}|${f.descripcion}|${f.nivelRiesgo}`)).map((s) => { const [clasificacion, descripcion, nivelRiesgo] = s.split("|"); return { clasificacion, descripcion, nivelRiesgo }; }),
      epp: uniq(catalogos.flatMap((p) => p!.eppSugerido)),
      examenes: examenes.filter((x, i) => !(x.startsWith("Examen médico ocupacional (ingreso") && examenes.some((y, j) => j !== i && y.startsWith("Examen médico ocupacional (ingreso, periódico, retiro) con")))),
      capacitaciones: uniq(catalogos.flatMap((p) => p!.capacitacionesSugeridas)),
      altoRiesgo: uniq(c.tareas.map((t) => t.tarea.altoRiesgo ?? "")),
    };
  });

  // Capacitaciones del programa: obligatorias + derivadas de la matriz + por reglas
  const obligatorias = [
    { tema: "Inducción en SST: política, peligros del cargo, emergencias, reporte de incidentes", dirigidoA: "Todo trabajador nuevo y contratistas", norma: "Decreto 1072/2015 art. 2.2.4.6.11" },
    { tema: "Plan de emergencias, evacuación y uso de extintores", dirigidoA: "Todos los trabajadores", norma: "Decreto 1072/2015 art. 2.2.4.6.25 num. 9" },
    { tema: "Reporte de accidentes, incidentes y autorreporte de condiciones", dirigidoA: "Todos los trabajadores", norma: "Decreto 1072/2015 art. 2.2.4.6.10" },
    { tema: "Prevención del acoso laboral y convivencia", dirigidoA: "Todos los trabajadores", norma: "Ley 1010/2006; Res. 3461/2025" },
    { tema: "Promoción de la salud mental y prevención del consumo de SPA", dirigidoA: "Todos los trabajadores", norma: "Decreto 728/2025" },
    { tema: "Primeros auxilios", dirigidoA: "Brigada de emergencias", norma: "Decreto 1072/2015 art. 2.2.4.6.25 num. 11" },
  ];
  const deMatriz = new Map<string, Set<string>>();
  for (const c of cargos) for (const t of c.capacitaciones) { if (!deMatriz.has(t)) deMatriz.set(t, new Set()); deMatriz.get(t)!.add(c.nombre); }
  const capacitaciones = [
    ...obligatorias,
    ...[...deMatriz.entries()].filter(([t]) => !obligatorias.some((o) => o.tema.toLowerCase().includes(t.toLowerCase().slice(0, 15)))).map(([tema, cs]) => ({ tema, dirigidoA: [...cs].join(", "), norma: "Matriz de peligros (GTC 45)" })),
    ...rr.capacitaciones.filter((t) => !deMatriz.has(t)).map((tema) => ({ tema, dirigidoA: "Trabajadores expuestos", norma: "Regla de aplicabilidad" })),
  ].map((c, i) => ({ ...c, mesNum: i === 0 ? 1 : mesPara(i), mes: MESES[(i === 0 ? 1 : mesPara(i)) - 1] }));
  void MES_CAP;

  // PVE
  const pveMap = new Map<string, { peligros: Set<string>; cargos: Set<string>; examenes: Set<string> }>();
  for (const f of prioritarios.concat(filas.filter((x) => x.catalogo?.pveAsociado && x.nivelRiesgo === "III"))) {
    const k = f.catalogo?.pveAsociado; if (!k) continue;
    if (!pveMap.has(k)) pveMap.set(k, { peligros: new Set(), cargos: new Set(), examenes: new Set() });
    const v = pveMap.get(k)!; v.peligros.add(f.descripcion); f.cargos.forEach((c) => v.cargos.add(c)); f.catalogo!.examenesSugeridos.forEach((x) => v.examenes.add(x));
  }
  const pve = [...pveMap.entries()].map(([k, v]) => ({ nombre: PVE_NOMBRE[k] ?? k, peligro: [...v.peligros].join("; "), cargos: [...v.cargos].join(", "), examenes: [...v.examenes].join("; ") }));

  // Amenazas (plan de emergencias)
  const amenazas = [
    { amenaza: "Sismo", tipo: "Natural", origen: "Geológico", calificacion: "Posible", descripcion: "Colombia tiene zonas de amenaza sísmica alta e intermedia (NSR-10)" },
    { amenaza: "Incendio", tipo: "Tecnológico", origen: "Interno", calificacion: "Posible", descripcion: "Presencia de material combustible, instalaciones eléctricas y equipos" },
    { amenaza: "Inundación / lluvias fuertes", tipo: "Natural", origen: "Hidrometeorológico", calificacion: "Posible", descripcion: "Temporadas de lluvia; posibles fallas en desagües" },
    { amenaza: "Atención de lesionados / emergencia médica", tipo: "Social", origen: "Interno", calificacion: "Probable", descripcion: "Accidentes o afecciones de salud súbitas de trabajadores o visitantes" },
    ...(dis.atencionPublico || e.zonas.length ? [{ amenaza: "Robo, atraco o alteración del orden público", tipo: "Social", origen: "Externo", calificacion: "Posible", descripcion: "Exposición a delincuencia en la zona" }] : []),
    ...(dis.quimicos ? [{ amenaza: "Derrame o fuga de sustancias químicas", tipo: "Tecnológico", origen: "Interno", calificacion: "Posible", descripcion: "Almacenamiento y uso de sustancias químicas" }] : []),
    ...(filas.some((f) => f.descripcion.toLowerCase().includes("gas")) ? [{ amenaza: "Fuga de gas / explosión", tipo: "Tecnológico", origen: "Interno", calificacion: "Posible", descripcion: "Uso de gas natural o propano" }] : []),
    ...(dis.conduccion || e.nVehiculos > 0 ? [{ amenaza: "Accidente de tránsito", tipo: "Tecnológico", origen: "Externo", calificacion: "Probable", descripcion: "Desplazamientos en vehículos en misión" }] : []),
  ];

  // Alto riesgo
  const tiposAR: Record<string, string> = { alturas: "Res. 4272/2021", confinado: "Res. 0491/2020", electrico: "Res. 2400/1979; RETIE", izaje: "Res. 2400/1979", caliente: "Res. 2400/1979" };
  const altoRiesgo = Object.keys(tiposAR).map((tipo) => {
    const ts = e.tareas.filter((t) => t.altoRiesgo === tipo);
    return { tipo, tareas: ts.map((t) => t.nombre).join(", "), cargos: [...new Set(ts.flatMap((t) => t.cargos.map((c) => c.cargo.nombre)))].join(", "), norma: tiposAR[tipo] };
  }).filter((x) => x.tareas);

  // Evaluación
  const ev = e.evaluaciones[0];
  let evaluacion: Record<string, unknown> = { existe: false, items: [] };
  let planMejora: { estandar: string; actividad: string; responsable: string; fecha: string; recursos: string; soporte: string }[] = [];
  if (ev) {
    const items = ev.items.filter((i) => rr.estandares.includes(i.estandar.codigo)).sort((a, b) => a.estandar.orden - b.estandar.orden);
    const cal = calificar(items.map((i) => ({ codigo: i.estandar.codigo, puntaje: i.estandar.puntaje, estado: i.estado })), rr.nivel);
    const ET: Record<string, string> = { CUMPLE: "Cumple", NO_CUMPLE: "No cumple", NO_APLICA: "No aplica", PENDIENTE: "Sin evaluar" };
    evaluacion = {
      existe: true, fecha: fmt(ev.fecha), tipo: ev.tipo === "inicial" ? "evaluación inicial" : `autoevaluación ${ev.anio}`,
      puntaje: cal.puntaje, valoracion: cal.valoracion, accion: cal.accion,
      items: items.map((i) => ({ codigo: i.estandar.codigo, descripcion: i.estandar.descripcion, estado: ET[i.estado], puntaje: i.estandar.puntaje, obtenido: i.estado === "CUMPLE" || i.estado === "NO_APLICA" ? i.estandar.puntaje : 0, observacion: i.observacion ?? "" })),
    };
    planMejora = ev.planMejora.map((p) => ({ estandar: p.estandarCodigo, actividad: p.actividad, responsable: p.responsable ?? "", fecha: fmt(p.fechaLimite), recursos: p.recursos ?? "", soporte: p.soporte ?? "" }));
  }

  // Plan anual: persistido o generado en memoria
  const anio = new Date().getFullYear();
  const anioPlan = e.actividades.length ? e.actividades[0].anio : anio;
  const plan = (e.actividades.length
    ? e.actividades.map((a) => ({ mes: a.mes, nombre: a.nombre, estandarCodigo: a.estandarCodigo ?? "", normaRef: a.normaRef ?? "", responsable: a.responsable ?? "", recursos: a.recursos ?? "" }))
    : generarPlan({
        nivel: rr.nivel, comites: rr.comites, disparadores: dis,
        capacitaciones: capacitaciones.map((c) => ({ tema: c.tema, mes: c.mesNum, norma: c.norma })),
        prioritarios: prioritarios.map((p) => ({ descripcion: p.descripcion, medida: p.ingenieria || p.administrativa || p.epp || "Definir medida" })),
        mejoras: planMejora.map((p, i) => ({ estandar: p.estandar, actividad: p.actividad, mes: Math.min(12, 2 + (i % 6)) })),
      })
  ).map((a) => ({ mes: a.mes, mesNombre: MESES[a.mes - 1], actividad: a.nombre, estandar: a.estandarCodigo ?? "", responsable: a.responsable, recursos: a.recursos ?? "", normaRef: a.normaRef }));

  const presupuesto = [
    { rubro: "Evaluaciones médicas ocupacionales", descripcion: "Ingreso, periódicas, retiro y complementarios según profesiograma", estandar: "3.1.4" },
    { rubro: "Elementos de protección personal", descripcion: "Dotación y reposición según matriz de EPP", estandar: "4.2.6" },
    { rubro: "Capacitación", descripcion: "Programa anual, brigada, COPASST/Vigía, certificaciones", estandar: "1.2.1" },
    { rubro: "Emergencias", descripcion: "Extintores (recarga), botiquín, camilla, señalización", estandar: "5.1.1" },
    { rubro: "Asesoría profesional en SST", descripcion: "Diseño, implementación y seguimiento del SG-SST", estandar: "1.1.1" },
    { rubro: "Mantenimiento preventivo", descripcion: "Instalaciones, equipos y herramientas", estandar: "4.2.5" },
    { rubro: "Promoción de la salud y salud mental", descripcion: "Actividades de PyP, semana de la salud, salud mental", estandar: "3.1.7" },
    ...(rr.nivel >= 21 ? [{ rubro: "Evaluación de riesgo psicosocial", descripcion: "Aplicación de batería por psicólogo especialista", estandar: "4.1.2" }] : []),
    ...(rr.nivel >= 60 ? [{ rubro: "Mediciones ambientales", descripcion: "Higiene industrial de riesgos prioritarios", estandar: "4.1.4" }] : []),
    ...(dis.alturas ? [{ rubro: "Trabajo en alturas", descripcion: "Certificación, equipos de protección contra caídas, coordinador", estandar: "4.2.3" }] : []),
  ];

  const porClas = new Map<string, { total: number; prioritarios: number }>();
  for (const f of filas) { const v = porClas.get(f.clasificacion) ?? { total: 0, prioritarios: 0 }; v.total++; if (f.nivelRiesgo === "I" || f.nivelRiesgo === "II") v.prioritarios++; porClas.set(f.clasificacion, v); }

  const normasSet = new Set(rr.normas.map((n) => n.codigo));
  for (const f of filas) f.catalogo?.normas.forEach((n) => normasSet.add(n));
  const normasDb = await db.norma.findMany({ where: { codigo: { in: [...normasSet] }, vigente: true }, orderBy: [{ anio: "asc" }] });
  const trabajadores = rr.trabajadores;
  const cop = composicionCopasst(trabajadores);
  const plantillas = await db.plantilla.findMany({ where: { codigo: { in: rr.documentos.map((d) => d.codigo) } }, orderBy: { codigo: "asc" } });

  return {
    empresa: {
      id: e.id, razonSocial: e.razonSocial, nit: e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit,
      direccion: e.direccion ?? "", ciudad: e.ciudad ?? "", departamento: e.departamento ?? "", telefono: e.telefono ?? "", correo: e.correo ?? "",
      representanteLegal: e.representanteLegal ?? "", representanteCedula: e.representanteCedula ?? "", ciiu: e.ciiu ?? "", actividad: e.descripcionActividad ?? "",
      claseRiesgo: e.claseRiesgo, claseRiesgoRomano: ROMANO[e.claseRiesgo], arl: e.arl ?? "", eps: e.epsPrincipal ?? "",
      trabajadores, contratistas: e.nContratistas, aprendices: e.nAprendices, vehiculos: e.nVehiculos, horario: e.horario ?? "", turnos: e.turnos ?? "",
      nivel: rr.nivel, sector: e.sectorTipo?.nombre ?? "",
    },
    responsable: {
      nombre: (resp.nombre as string) ?? "", cedula: (resp.cedula as string) ?? "", cargo: (resp.cargo as string) ?? "",
      perfilTexto: PERFIL_TEXTO[(resp.perfil as string) ?? ""] ?? "", licencia: (resp.licencia as string) ?? "", licenciaFecha: (resp.licenciaFecha as string) ?? "",
      curso50hFecha: resp.curso50h ? ((resp.curso50hFecha as string) || "Aprobado") : "",
    },
    consultora: { nombre: consultora.nombre, profesional: consultora.profesional ?? "", cedula: consultora.cedula ?? "", licencia: consultora.licenciaSst ?? "", correo: consultora.correo ?? "", telefono: consultora.telefono ?? "" },
    fecha: fmt(new Date()), anio: anioPlan, anioSiguiente: anioPlan + 1,
    sedes: e.sedes.map((s) => ({ nombre: s.nombre, direccion: s.direccion ?? "", ciudad: s.ciudad ?? "" })),
    procesos: e.procesos.map((p) => ({ nombre: p.nombre, descripcion: p.descripcion ?? "", tareas: e.tareas.filter((t) => t.procesoId === p.id).map((t) => t.nombre) })),
    cargos,
    matriz: { filas, prioritarios, porClasificacion: [...porClas.entries()].map(([clasificacion, v]) => ({ clasificacion, ...v })), tieneFilas: filas.length > 0 },
    normas: normasDb.map((n) => ({ codigo: n.codigo, tipo: n.tipo === "Resolucion" ? "Resolución" : n.tipo === "GuiaTecnica" ? "Guía técnica" : n.tipo, numero: n.numero, anio: n.anio, entidad: n.entidad, nombre: n.nombre, articulosClave: n.articulosClave ?? "", resumen: n.resumen, evidenciaCumplimiento: n.evidenciaCumplimiento ?? "" })),
    estandares: (await db.estandar.findMany({ where: { codigo: { in: rr.estandares } }, orderBy: { orden: "asc" } })).map((s) => ({ codigo: s.codigo, ciclo: s.ciclo, grupo: s.grupo, descripcion: s.descripcion, puntaje: s.puntaje })),
    comites: { copasst: { aplica: true, esVigia: cop.tipo === "VIGIA", composicion: cop.texto, porParte: cop.porParte }, ccl: { aplica: rr.comites.includes("CCL") }, brigada: { aplica: true } },
    capacitaciones, plan, evaluacion, planMejora, dis, indicadores: INDICADORES, pve, amenazas, presupuesto, altoRiesgo,
    documentosLista: plantillas.map((p) => ({ codigo: p.codigo, nombre: p.nombre, version: e.documentos.find((d) => d.codigo === p.codigo)?.version ?? 1, carpeta: p.carpeta ?? "" })),
    _reglas: rr,
  };
}
export type Contexto = Awaited<ReturnType<typeof construirContexto>>;
