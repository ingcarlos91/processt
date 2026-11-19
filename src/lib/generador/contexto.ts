import { abrevDoc, docTexto, RE_DOC } from "@/lib/documento-identidad";
import { ROLES_EQUIPO, TIPO_ACCIDENTE, rolesExigidos, type Integrante } from "@/lib/eventos";
import { db, consultoraActual } from "@/lib/db";
import { evaluarEmpresa, composicionCopasst, type ResultadoReglas } from "@/lib/reglas/motor";
import { calcular, CLASIFICACION_ETIQUETA } from "@/lib/gtc45";
import { INDICADORES } from "@/lib/indicadores";
import { calificar } from "@/lib/evaluacion";
import { generarPlan, MESES, anioPlanDefecto } from "@/lib/plan/generar";
import { disparadoresDesdeMatriz } from "@/lib/reglas/matriz-disparadores";
import { contexto as ctxReglas } from "@/lib/reglas/motor";
import { composicionCcl, nivelPesv } from "@/lib/reglas/condicion";
import { TURNOS } from "@/lib/ayuda";
import type { Complementarios, Persona } from "@/lib/complementarios";

const ROMANO = ["", "I", "II", "III", "IV", "V"];
const PERFIL_TEXTO: Record<string, string> = { tecnico: "Técnico en SST", tecnologo: "Tecnólogo en SST", profesional: "Profesional en SST", especialista: "Profesional con posgrado en SST" };
const PVE_NOMBRE: Record<string, string> = { osteomuscular: "Prevención de desórdenes musculoesqueléticos", auditivo: "Conservación auditiva", visual: "Conservación visual", quimico: "Riesgo químico", psicosocial: "Riesgo psicosocial", respiratorio: "Protección respiratoria", biologico: "Riesgo biológico" };
const fmt = (d?: Date | null) => (d ? d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : "");
/** Fechas guardadas sin hora (solo día): se muestran en UTC para no correrse un día por la zona horaria. */
const fmtDia = (d?: Date | null) => (d ? d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "");
const fmtIso = (v: unknown) => { const t = String(v ?? ""); return /^\d{4}-\d{2}-\d{2}$/.test(t) ? fmtDia(new Date(t + "T00:00:00Z")) : t; };

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
    db.reglaAplicabilidad.findMany(), db.plantilla.findMany({ where: { tipo: { not: "INF" } }, orderBy: { codigo: "asc" } }), db.norma.findMany(), db.estandar.findMany({ orderBy: { orden: "asc" } }),
  ]);
  return { reglas, plantillas, normas, estandares };
}

export async function resultadoReglas(e: EmpresaCompleta): Promise<ResultadoReglas> {
  return evaluarEmpresa({ ...e, disparadoresMatriz: await disparadoresDesdeMatriz(e.id) }, await datosReglas());
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
  const ctxR = ctxReglas({ ...e, disparadoresMatriz: await disparadoresDesdeMatriz(e.id) });
  const dis = ctxR.disparadores as Record<string, boolean>;
  const pesv = contextoPesv(ctxR);

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
  const anioObjetivo = anioPlanDefecto();
  const anioPlan = e.actividades.some((a) => a.anio === anioObjetivo) ? anioObjetivo : e.actividades.length ? Math.max(...e.actividades.map((a) => a.anio)) : anioObjetivo;
  const actsAnio = e.actividades.filter((a) => a.anio === anioPlan);
  const plan = (actsAnio.length
    ? actsAnio.map((a) => ({ mes: a.mes, nombre: a.nombre, estandarCodigo: a.estandarCodigo ?? "", normaRef: a.normaRef ?? "", responsable: a.responsable ?? "", recursos: a.recursos ?? "" }))
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
    { rubro: "Evaluación de riesgo psicosocial", descripcion: "Aplicación de la batería por psicólogo con licencia (Res. 2764/2022: obligatoria para todo empleador)", estandar: "4.1.2" },
    ...(rr.nivel >= 60 ? [{ rubro: "Mediciones ambientales", descripcion: "Higiene industrial de riesgos prioritarios", estandar: "4.1.4" }] : []),
    ...(dis.alturas ? [{ rubro: "Trabajo en alturas", descripcion: "Certificación, equipos de protección contra caídas, coordinador", estandar: "4.2.3" }] : []),
  ];

  // Cada rubro cita un estándar que aplique a la empresa (7, 21 o 60): si el sugerido no aplica, el equivalente más cercano.
  const ALTERNO: Record<string, string[]> = { "3.1.7": ["3.1.2", "2.4.1"], "4.2.3": ["4.2.1", "4.1.2"], "4.2.1": ["4.1.2"], "4.2.5": ["4.1.2"], "4.1.4": ["4.1.2"], "5.1.1": ["2.4.1"], "1.1.3": ["2.4.1"] };
  const aplicaEst = new Set(rr.estandares);
  for (const r of presupuesto) if (!aplicaEst.has(r.estandar)) r.estandar = (ALTERNO[r.estandar] ?? []).find((x) => aplicaEst.has(x)) ?? r.estandar;

  // ── Datos complementarios (con espacios en blanco si faltan, para que el documento siga siendo imprimible) ──
  const comp = (e.datosComplementarios ?? {}) as Complementarios;
  const B = "______________________";
  const txt = (k: string, def = B) => { const v = comp[k]; return typeof v === "string" && v.trim() ? v.trim() : def; };
  const persona = (k: string) => { const p = (comp[k] ?? {}) as Persona; return { nombre: p.nombre?.trim() || B, cargo: p.cargo?.trim() || "", cedula: p.cedula?.trim() || "", correo: p.correo?.trim() || "", registrado: !!p.nombre?.trim() }; };
  const tabla = (k: string) => ((Array.isArray(comp[k]) ? comp[k] : []) as Record<string, string>[]).filter((f) => Object.values(f).some((x) => String(x ?? "").trim())).map((f) => Object.fromEntries(Object.entries(f).map(([kk, vv]) => [kk, fmtIso(vv)])));
  const pesos = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  const valores = tabla("presupuesto");
  // Rubros sugeridos con su valor, más los rubros que la consultora agregó como filas nuevas.
  const norm = (t: unknown) => String(t ?? "").trim().toLowerCase();
  const presupuestoConValor = [
    ...presupuesto.map((r) => { const v = Number(valores.find((x) => norm(x.rubro) === norm(r.rubro))?.valor ?? 0); return { ...r, valor: v ? pesos(v) : "Por definir", valorNum: v }; }),
    ...valores.filter((x) => norm(x.rubro) && !presupuesto.some((r) => norm(r.rubro) === norm(x.rubro))).map((x) => {
      const v = Number(x.valor ?? 0);
      return { rubro: String(x.rubro).trim(), descripcion: "Rubro agregado por la consultora", estandar: "", valor: v ? pesos(v) : "", valorNum: v };
    }),
  ];
  const totalPresupuesto = presupuestoConValor.reduce((s2, r) => s2 + r.valorNum, 0);
  const legal = (comp.cumplimientoLegal ?? {}) as unknown as Record<string, { cumple?: string; evidencia?: string }>;
  const MESES_N = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const actsBrigada = await db.actividadPlan.findMany({ where: { empresaId: e.id, OR: [{ nombre: { contains: "brigada", mode: "insensitive" } }, { nombre: { contains: "simulacro", mode: "insensitive" } }] }, orderBy: [{ anio: "desc" }, { mes: "asc" }], select: { nombre: true, mes: true } });
  const mesDe = (re: RegExp, def: number) => MESES_N[(actsBrigada.find((a) => re.test(a.nombre))?.mes ?? def) - 1];
  const brigadaPlan = { capacitacion: mesDe(/capacitaci[oó]n de la brigada/i, 5), simulacro: mesDe(/simulacro/i, 10) };
  const op = {
    arlLinea: txt("arlLinea"), telefonoSst: txt("telefonoSst", consultora.telefono || B), correoQuejas: txt("correoQuejas", e.correo || B),
    acosoSexual: persona("acosoSexual"), ips: txt("ips"), medicoIps: persona("medicoIps"), puntoEncuentro: txt("puntoEncuentro"), alarma: txt("alarma"),
    brigadaPlan, recursosEmergencia: tabla("recursosEmergencia"), coordinadorAlturas: persona("coordinadorAlturas"),
    espaciosConfinados: tabla("espaciosConfinados"), quimicos: tabla("quimicos"), equipos: tabla("equipos"),
    presupuestoTotal: totalPresupuesto ? pesos(totalPresupuesto) : "Por definir",
  };

  // ── Comités: integrantes por rol ──
  const ROL: Record<string, string> = { presidente: "Presidente", secretario: "Secretario", principal: "Principal", suplente: "Suplente", vigia: "Vigía", jefe_brigada: "Jefe de brigada", brigadista: "Brigadista", principal_empleador: "Principal", principal_trabajadores: "Principal", suplente_empleador: "Suplente", suplente_trabajadores: "Suplente" };
  const comite = (tipos: string[]) => {
    const c = e.comites.find((x) => tipos.includes(x.tipo));
    const miembros = (c?.miembros ?? []).map((m) => ({ nombre: m.nombre, cedula: m.cedula ?? "", doc: m.cedula ? docTexto(m.tipoDoc, m.cedula) : "", cargo: m.cargo ?? "", rol: m.rol, rolTexto: ROL[m.rol] ?? m.rol, representa: m.representa === "empleador" ? "Empleador" : m.representa === "trabajadores" ? "Trabajadores" : "" }));
    const d = (c?.datos ?? {}) as Record<string, unknown>;
    return {
      registrado: !!c, inicio: fmtDia(c?.periodoInicio) || B, fin: fmtDia(c?.periodoFin) || B, miembros, hayMiembros: miembros.length > 0,
      presidente: miembros.find((m) => m.rol === "presidente")?.nombre ?? B, secretario: miembros.find((m) => m.rol === "secretario")?.nombre ?? B,
      empleador: miembros.filter((m) => m.representa === "Empleador"), trabajadores: miembros.filter((m) => m.representa === "Trabajadores"),
      eleccion: {
        // La convocatoria abre las inscripciones: se fecha el día en que inician (antes de la votación), no el de generación.
        convocatoria: fmtIso(d.fechaConvocatoria) || fmtIso(d.inscripcionDesde) || "",
        inscripcionDesde: fmtIso(d.inscripcionDesde) || "______", inscripcionHasta: fmtIso(d.inscripcionHasta) || "______",
        fechaVotacion: fmtIso(d.fechaVotacion) || "______", lugar: String(d.lugar ?? "") || "______", horario: String(d.horario ?? "") || "______",
        resultados: (Array.isArray(d.resultados) ? d.resultados : []) as { candidato: string; votos: string }[],
        blanco: String(d.blanco ?? ""), nulos: String(d.nulos ?? ""), votantes: String(d.votantes ?? ""), jurados: String(d.jurados ?? "") || B,
      },
    };
  };
  // Composición del CCL por tramos de la Res. 3461/2025 art. 3.
  const integrantes = { copasst: comite(["COPASST", "VIGIA"]), ccl: { ...comite(["CCL"]), composicion: composicionCcl(rr.trabajadores) }, brigada: comite(["BRIGADA"]) };

  const porClas = new Map<string, { total: number; prioritarios: number }>();
  for (const f of filas) { const v = porClas.get(f.clasificacion) ?? { total: 0, prioritarios: 0 }; v.total++; if (f.nivelRiesgo === "I" || f.nivelRiesgo === "II") v.prioritarios++; porClas.set(f.clasificacion, v); }

  const normasSet = new Set(rr.normas.map((n) => n.codigo));
  for (const f of filas) f.catalogo?.normas.forEach((n) => normasSet.add(n));
  const normasDb = await db.norma.findMany({ where: { codigo: { in: [...normasSet] }, vigente: true }, orderBy: [{ anio: "asc" }] });
  const trabajadores = rr.trabajadores;
  const cop = composicionCopasst(trabajadores);
  const plantillas = await db.plantilla.findMany({ where: { codigo: { in: rr.documentos.map((d) => d.codigo) } }, orderBy: { codigo: "asc" } });

  // Accidentalidad (FOR-08, FOR-06, ACT-06, ACT-02): Res. 1401/2007; Decreto 1072/2015 arts. 2.2.4.6.32-34; Res. 0312/2019 art. 30.
  const accidentalidad = await contextoAccidentalidad(e.id);
  const ultimaVersion = await db.matrizVersion.findFirst({ where: { empresaId: e.id }, orderBy: { numero: "desc" } });
  const nomina = await contextoNomina(e.id);
  const auditoriasDb = await db.auditoria.findMany({ where: { empresaId: e.id }, orderBy: { fechaInicio: "asc" }, include: { _count: { select: { acciones: true } } } });
  const auditorias = auditoriasDb.map((a) => {
    const its = (a.items ?? []) as { resultado: string }[]; const ap = its.filter((x) => x.resultado && x.resultado !== "na");
    return { anio: a.anio, fecha: ddmm(a.fechaInicio), cierre: ddmm(a.fechaCierre), auditor: a.auditor, estado: a.estado === "cerrada" ? "Cerrada" : "En curso", conformidad: ap.length ? `${Math.round((ap.filter((x) => x.resultado === "conforme").length / ap.length) * 100)} %` : "—", noConformes: its.filter((x) => x.resultado === "no_conforme").length, acciones: a._count.acciones };
  });
  const ultimaAuditoria = auditorias.filter((a) => a.estado === "Cerrada").at(-1) ?? null;
  const inspeccionesDb = await db.inspeccion.findMany({ where: { empresaId: e.id }, orderBy: { fecha: "asc" }, include: { _count: { select: { acciones: true } } } });
  const inspecciones = inspeccionesDb.map((i) => {
    const its = (i.items ?? []) as { resultado: string }[]; const ap = its.filter((x) => x.resultado !== "na");
    return { fecha: ddmm(i.fecha), lista: i.lista, lugar: i.lugar?.trim() || "Sin registrar", responsable: i.responsable?.trim() || "Sin registrar", cumplimiento: ap.length ? `${Math.round((ap.filter((x) => x.resultado === "cumple").length / ap.length) * 100)} %` : "100 %", hallazgos: its.filter((x) => x.resultado === "no_cumple").length, acciones: i._count.acciones };
  });

  return {
    empresa: {
      id: e.id, razonSocial: e.razonSocial, nit: e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit,
      direccion: e.direccion ?? "", ciudad: e.ciudad ?? "", departamento: e.departamento ?? "", telefono: e.telefono ?? "", correo: e.correo ?? "",
      representanteLegal: e.representanteLegal?.trim() || "______________________", representanteCedula: e.representanteCedula ?? "", representanteTipoDoc: abrevDoc(e.representanteTipoDoc), representanteDoc: docTexto(e.representanteTipoDoc, e.representanteCedula), ciiu: e.ciiu ?? "", actividad: e.descripcionActividad ?? "",
      claseRiesgo: e.claseRiesgo, claseRiesgoRomano: ROMANO[e.claseRiesgo], arl: e.arl ?? "", eps: e.epsPrincipal ?? "",
      trabajadores, contratistas: e.nContratistas, aprendices: e.nAprendices, vehiculos: e.nVehiculos, conductores: ctxR.conductores, esTransporte: ctxR.esTransporte, horario: e.horario ?? "", turnos: (e.turnos ?? "").split(",").map((t) => TURNOS.find((x) => x.valor === t)?.etiqueta ?? t).filter(Boolean).join("; "),
      nivel: rr.nivel, sector: e.sectorTipo?.nombre ?? "", logoUrl: e.logoUrl ?? "", tieneLogo: !!e.logoUrl,
    },
    // Responsable del SG-SST registrado en cada empresa. Si falta, quedan espacios para llenar a mano.
    responsable: (() => {
      const r = resp;
      return {
        nombre: (r.nombre as string)?.trim() || "______________________", cedula: (r.cedula as string)?.trim() || "______________", doc: docTexto(r.tipoDoc as string, r.cedula as string), cargo: (r.cargo as string) ?? "",
        perfilTexto: PERFIL_TEXTO[(r.perfil as string) ?? ""] ?? "", licencia: (r.licencia as string) ?? "", licenciaFecha: (r.licenciaFecha as string) ?? "",
        curso50hFecha: r.curso50h ? ((r.curso50hFecha as string) || "Aprobado") : "", esConsultora: false,
      };
    })(),
    consultora: {
      nombre: consultora.nombre, profesional: consultora.profesional ?? "", cedula: consultora.cedula ?? "", doc: docTexto(consultora.tipoDoc, consultora.cedula), cargo: consultora.cargo ?? "",
      perfilTexto: PERFIL_TEXTO[consultora.perfil ?? ""] ?? "", licencia: consultora.licenciaSst ?? "", licenciaFecha: fmt(consultora.licenciaFecha),
      curso50hFecha: consultora.curso50h ? consultora.curso50hFecha || "Aprobado" : "", correo: consultora.correo ?? "", telefono: consultora.telefono ?? "",
    },
    fecha: fmt(new Date()), anio: anioPlan, anioSiguiente: anioPlan + 1,
    sedes: e.sedes.map((s) => ({ nombre: s.nombre, direccion: s.direccion ?? "", ciudad: s.ciudad ?? "" })),
    procesos: e.procesos.map((p) => ({ nombre: p.nombre, descripcion: p.descripcion ?? "", tareas: e.tareas.filter((t) => t.procesoId === p.id).map((t) => t.nombre) })),
    cargos,
    matriz: { version: ultimaVersion ? { numero: ultimaVersion.numero, fecha: fmtDia(ultimaVersion.fecha), motivo: ultimaVersion.motivo } : null, filas, prioritarios, porClasificacion: [...porClas.entries()].map(([clasificacion, v]) => ({ clasificacion, ...v })), tieneFilas: filas.length > 0 },
    normas: normasDb.map((n) => ({ codigo: n.codigo, tipo: n.tipo === "Resolucion" ? "Resolución" : n.tipo === "GuiaTecnica" ? "Guía técnica" : n.tipo, numero: n.numero, anio: n.anio, entidad: n.entidad, nombre: n.nombre, articulosClave: n.articulosClave ?? "", resumen: n.resumen, evidenciaCumplimiento: legal[n.codigo]?.evidencia?.trim() || n.evidenciaCumplimiento || "", cumple: legal[n.codigo]?.cumple || "Por evaluar" })),
    estandares: (await db.estandar.findMany({ where: { codigo: { in: rr.estandares } }, orderBy: { orden: "asc" } })).map((s) => ({ codigo: s.codigo, ciclo: s.ciclo, grupo: s.grupo, descripcion: s.descripcion, puntaje: s.puntaje })),
    comites: { copasst: { aplica: true, esVigia: cop.tipo === "VIGIA", composicion: cop.texto, porParte: cop.porParte }, ccl: { aplica: rr.comites.includes("CCL") }, brigada: { aplica: true } },
    capacitaciones, plan, evaluacion, planMejora, dis, pesv, indicadores: INDICADORES, pve, amenazas, presupuesto: presupuestoConValor, altoRiesgo, op, integrantes, accidentalidad, acciones: accidentalidad.acciones, nomina, inspecciones, hayInspecciones: inspecciones.length > 0, auditorias, hayAuditorias: auditorias.length > 0, ultimaAuditoria,
    documentosLista: plantillas.map((p) => ({ codigo: p.codigo, nombre: p.nombre, version: e.documentos.find((d) => d.codigo === p.codigo)?.version ?? 1, carpeta: p.carpeta ?? "" })),
    _reglas: rr,
  };
}
export type Contexto = Awaited<ReturnType<typeof construirContexto>>;

/** Los 24 pasos de la metodología del PESV (Res. 40595/2022, anexo) y el nivel mínimo en que cada uno aplica. */
const PASOS_PESV: { n: number; fase: string; nombre: string; desde: "basico" | "estandar" | "avanzado" }[] = [
  { n: 1, fase: "Planificación", nombre: "Líder del diseño e implementación del PESV", desde: "basico" },
  { n: 2, fase: "Planificación", nombre: "Comité de seguridad vial", desde: "estandar" },
  { n: 3, fase: "Planificación", nombre: "Política de seguridad vial de la organización", desde: "basico" },
  { n: 4, fase: "Planificación", nombre: "Liderazgo, compromiso y corresponsabilidad del nivel directivo", desde: "basico" },
  { n: 5, fase: "Planificación", nombre: "Diagnóstico", desde: "basico" },
  { n: 6, fase: "Planificación", nombre: "Caracterización, evaluación y control de riesgos viales", desde: "basico" },
  { n: 7, fase: "Planificación", nombre: "Objetivos y metas del PESV", desde: "basico" },
  { n: 8, fase: "Planificación", nombre: "Programas de gestión de riesgos críticos y factores de desempeño", desde: "basico" },
  { n: 9, fase: "Planificación", nombre: "Plan anual de trabajo", desde: "basico" },
  { n: 10, fase: "Implementación", nombre: "Competencia y plan anual de formación", desde: "basico" },
  { n: 11, fase: "Implementación", nombre: "Responsabilidad y comportamiento seguro", desde: "avanzado" },
  { n: 12, fase: "Implementación", nombre: "Plan de preparación y respuesta ante emergencias viales", desde: "basico" },
  { n: 13, fase: "Implementación", nombre: "Investigación interna de siniestros viales", desde: "estandar" },
  { n: 14, fase: "Implementación", nombre: "Vías seguras administradas por la organización", desde: "basico" },
  { n: 15, fase: "Implementación", nombre: "Planificación de desplazamientos laborales", desde: "basico" },
  { n: 16, fase: "Implementación", nombre: "Inspección de vehículos y equipos", desde: "basico" },
  { n: 17, fase: "Implementación", nombre: "Mantenimiento y control de vehículos seguros y equipos", desde: "basico" },
  { n: 18, fase: "Implementación", nombre: "Gestión del cambio y gestión de contratistas", desde: "estandar" },
  { n: 19, fase: "Implementación", nombre: "Archivo y retención documental", desde: "estandar" },
  { n: 20, fase: "Seguimiento", nombre: "Indicadores y reporte de autogestión", desde: "basico" },
  { n: 21, fase: "Seguimiento", nombre: "Registro y análisis estadístico de siniestros viales", desde: "avanzado" },
  { n: 22, fase: "Seguimiento", nombre: "Auditoría anual", desde: "basico" },
  { n: 23, fase: "Mejora", nombre: "Mecanismos de comunicación y participación", desde: "basico" },
  { n: 24, fase: "Mejora", nombre: "Mejora continua: acciones preventivas y correctivas", desde: "basico" },
];
const ORDEN_NIVEL = { basico: 0, estandar: 1, avanzado: 2 } as const;
const NIVEL_PESV_TEXTO = { basico: "Básico", estandar: "Estándar", avanzado: "Avanzado" } as const;

/** PESV: obligados y nivel (Ley 1503/2011 art. 12; Decreto 1079/2015 art. 2.3.2.3.2; Res. 40595/2022 Tabla 1). */
function contextoPesv(c: { vehiculos: number; conductores: number; esTransporte: boolean }) {
  const nivel = nivelPesv(c);
  const pasos = nivel ? PASOS_PESV.filter((p) => ORDEN_NIVEL[p.desde] <= ORDEN_NIVEL[nivel]) : [];
  return {
    aplica: !!nivel, nivel, nivelTexto: nivel ? NIVEL_PESV_TEXTO[nivel] : "No obligado",
    vehiculos: c.vehiculos, conductores: c.conductores, esTransporte: c.esTransporte,
    misionalidad: c.esTransporte ? 1 : 2,
    esBasico: nivel === "basico", esEstandar: nivel === "estandar", esAvanzado: nivel === "avanzado",
    pasos, totalPasos: pasos.length,
  };
}

const TIPO_EV: Record<string, string> = { AT: "Accidente de trabajo", INCIDENTE: "Incidente", EL: "Enfermedad laboral", AUSENTISMO: "Ausentismo (enfermedad común)" };
const INV_EV: Record<string, string> = { pendiente: "Pendiente", en_curso: "En curso", cerrada: "Cerrada", no_aplica: "No aplica" };
const JER: Record<string, string> = { eliminacion: "Eliminación", sustitucion: "Sustitución", ingenieria: "Ingeniería", administrativo: "Administrativo", epp: "EPP" };
const ORIG: Record<string, string> = { investigacion: "Investigación", inspeccion: "Inspección", auditoria: "Auditoría", revision: "Revisión por la dirección", arl: "ARL", autoridad: "Autoridad", trabajador: "Trabajador" };
const ddmm = (d?: Date | null) => (d ? d.toISOString().slice(0, 10).split("-").reverse().join("/") : "");

function contar<T>(xs: T[], k: (x: T) => string | null | undefined) {
  const m = new Map<string, number>();
  for (const x of xs) { const v = k(x) || "Sin dato"; m.set(v, (m.get(v) ?? 0) + 1); }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([nombre, n]) => ({ nombre, n }));
}

/** Datos de accidentes, incidentes, enfermedades laborales y acciones para las plantillas. */
export async function contextoAccidentalidad(empresaId: string) {
  const anio = new Date().getUTCFullYear();
  const [eventos, acciones] = await Promise.all([
    db.evento.findMany({ where: { empresaId }, orderBy: { fecha: "desc" }, include: { acciones: true } }),
    db.accion.findMany({ where: { empresaId }, orderBy: { fecha: "asc" }, include: { evento: { select: { fecha: true, tipo: true } } } }),
  ]);
  const delAnio = eventos.filter((e) => e.fecha.getUTCFullYear() === anio);
  const lesivos = delAnio.filter((e) => e.tipo === "AT" || e.tipo === "INCIDENTE");
  const investigables = delAnio.filter((e) => e.invEstado !== "no_aplica");
  const at = delAnio.filter((e) => e.tipo === "AT");
  const r = {
    anio, total: delAnio.length, at: at.length, incidentes: delAnio.filter((e) => e.tipo === "INCIDENTE").length, el: delAnio.filter((e) => e.tipo === "EL").length,
    graves: at.filter((e) => e.gravedad === "grave").length, mortales: at.filter((e) => e.gravedad === "mortal").length,
    diasAt: at.reduce((s, e) => s + e.diasIncapacidad + e.diasCargados, 0),
    diasAusentismo: delAnio.filter((e) => e.tipo === "AUSENTISMO").reduce((s, e) => s + e.diasIncapacidad, 0),
    investigados: investigables.filter((e) => e.invEstado === "cerrada").length, investigables: investigables.length,
    reportados: delAnio.filter((e) => (e.tipo === "AT" || e.tipo === "EL") && e.reportadoArl).length, reportables: delAnio.filter((e) => e.tipo === "AT" || e.tipo === "EL").length,
    // FOR-08 informa solo las acciones de accidentes, incidentes y enfermedades (no las de inspecciones o auditorías).
    accionesAbiertas: acciones.filter((a) => a.eventoId && a.estado === "abierta").length, accionesCerradas: acciones.filter((a) => a.eventoId && a.estado === "cerrada").length,
  };
  const texto = r.total
    ? `En ${anio}: ${r.at} accidente(s) de trabajo${r.graves ? ` (${r.graves} grave(s))` : ""}${r.mortales ? `, ${r.mortales} mortal(es)` : ""}, ${r.incidentes} incidente(s) y ${r.el} enfermedad(es) laboral(es); ${r.diasAt} día(s) perdidos por accidentes. Investigados ${r.investigados} de ${r.investigables}; reportados a la ARL ${r.reportados} de ${r.reportables}. Acciones: ${r.accionesCerradas} cerrada(s) y ${r.accionesAbiertas} abierta(s).`
    : `En ${anio} no se registran accidentes, incidentes ni enfermedades laborales.`;
  const fila = (e: (typeof eventos)[number]) => ({
    id: e.id, fecha: ddmm(e.fecha), tipo: TIPO_EV[e.tipo] ?? e.tipo, gravedad: e.tipo === "AT" ? (e.gravedad === "grave" ? "Grave" : e.gravedad === "mortal" ? "Mortal" : "Leve") : "",
    trabajador: e.trabajadorNombre ?? "", cargo: e.cargo ?? "", lugar: e.lugar ?? "", mecanismo: e.mecanismo ?? "", lesion: e.lesion ?? "", parteCuerpo: e.parteCuerpo ?? "",
    dias: e.diasIncapacidad + e.diasCargados, reporte: e.fechaReporte ? ddmm(e.fechaReporte) : e.tipo === "AT" || e.tipo === "EL" ? "Pendiente" : "No aplica",
    investigacion: INV_EV[e.invEstado] ?? e.invEstado, acciones: e.acciones.length, descripcion: e.descripcion ?? "",
  });
  return {
    resumen: { ...r, texto }, hay: eventos.length > 0, hayAnio: delAnio.length > 0,
    eventos: eventos.filter((e) => e.tipo !== "AUSENTISMO").slice(0, 200).map(fila),
    pendientes: eventos.filter((e) => e.invEstado === "pendiente" || e.invEstado === "en_curso").map(fila),
    porCargo: contar(lesivos, (e) => e.cargo), porMecanismo: contar(lesivos, (e) => e.mecanismo), porParte: contar(at, (e) => e.parteCuerpo), porLugar: contar(lesivos, (e) => e.lugar),
    acciones: acciones.map((a, i) => ({
      n: i + 1, fecha: ddmm(a.fecha), origen: ORIG[a.origen] ?? a.origen, hallazgo: a.hallazgo, causa: a.causa?.trim() || (a.estado === "cerrada" ? "No registrada" : "Por analizar"), tipo: a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1),
      jerarquia: a.jerarquia ? JER[a.jerarquia] ?? a.jerarquia : "", descripcion: a.descripcion, responsable: a.responsable ?? "", fechaLimite: ddmm(a.fechaLimite),
      fechaCierre: ddmm(a.fechaCierre) || (a.estado === "cerrada" ? "Sin fecha" : "Abierta"), eficacia: a.eficacia?.trim() || (a.estado === "cerrada" ? "Sin registrar" : "Pendiente (acción abierta)"), estado: a.estado === "cerrada" ? "Cerrada" : "Abierta",
    })),
    hayAcciones: acciones.length > 0,
  };
}

/** Contexto del informe de investigación de un evento (FOR-07). */
export async function contextoEvento(eventoId: string) {
  const ev = await db.evento.findUniqueOrThrow({ where: { id: eventoId }, include: { acciones: { orderBy: { fecha: "asc" } }, peligro: true, archivos: { where: { activo: true } } } });
  const base = await construirContexto(ev.empresaId);
  const a = (ev.analisis ?? {}) as { porques?: string[]; actos?: string[]; condiciones?: string[]; personales?: string[]; trabajo?: string[]; conclusion?: string };
  const equipo = ((ev.equipo ?? []) as Integrante[]);
  const VINC: Record<string, string> = { planta: "Trabajador de planta", contratista: "Contratista", aprendiz: "Aprendiz o practicante", mision: "Trabajador en misión", visitante: "Visitante" };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const esGrave = ev.tipo === "AT" && (ev.gravedad === "grave" || ev.gravedad === "mortal");
  const direccionEmpresa = [base.empresa.direccion, base.empresa.ciudad].filter(Boolean).join(", ");
  return {
    ...base,
    // Variables del informe de investigación (Res. 1401/2007 arts. 9 a 13). Ver _CONTRATO.md.
    ev: {
      tipo: TIPO_EV[ev.tipo] ?? ev.tipo, esAT: ev.tipo === "AT", esIncidente: ev.tipo === "INCIDENTE", esEL: ev.tipo === "EL",
      gravedad: ev.gravedad === "grave" ? "Grave" : ev.gravedad === "mortal" ? "Mortal" : "Leve", esGrave, esMortal: ev.tipo === "AT" && ev.gravedad === "mortal",
      fecha: fmtDia(ev.fecha), hora: ev.hora ?? "", diaSemana: DIAS[ev.fecha.getUTCDay()], lugar: ev.lugar ?? "", sitioExacto: ev.sitioExacto ?? "", descripcion: ev.descripcion ?? "",
      tipoAccidente: TIPO_ACCIDENTE[ev.tipoAccidente ?? ""] ?? "", jornadaHabitual: ev.jornadaHabitual === true ? "Sí" : ev.jornadaHabitual === false ? "No" : "", turno: ev.turno ?? "", tiempoLaborado: ev.tiempoLaborado ?? "",
      versionTrabajador: ev.versionTrabajador ?? "", versionTestigos: ev.versionTestigos ?? "",
      trabajador: ev.trabajadorNombre ?? "", cedula: ev.trabajadorCedula ?? "", doc: ev.trabajadorCedula ? docTexto(ev.trabajadorTipoDoc, ev.trabajadorCedula) : "", vinculacion: VINC[ev.vinculacion ?? ""] ?? "", antiguedad: ev.antiguedad ?? "", tiempoEmpresa: ev.tiempoEmpresa ?? "",
      cargo: ev.cargo ?? "", tarea: ev.tarea ?? "", mecanismo: ev.mecanismo ?? "", agente: ev.agente ?? "", lesion: ev.lesion ?? "", parteCuerpo: ev.parteCuerpo ?? "",
      testigos: ev.testigos ?? "", dias: ev.diasIncapacidad, diasCargados: ev.diasCargados,
      fechaReporte: ev.fechaReporte ? fmtDia(ev.fechaReporte) : "", furat: ev.furatNumero ?? "", reporteMinisterio: ev.reporteMinisterio ? fmtDia(ev.reporteMinisterio) : "",
      invInicio: ev.invInicio ? fmtDia(ev.invInicio) : "", invCierre: ev.invCierre ? fmtDia(ev.invCierre) : "", remitidaArl: ev.invRemitidaArl ? fmtDia(ev.invRemitidaArl) : "",
      invLugar: ev.invLugar?.trim() || direccionEmpresa, invFechas: ev.invFechas ?? "", invCerrada: ev.invEstado === "cerrada",
      plazoRemision: esGrave ? fmtDia(new Date(ev.fecha.getTime() + 15 * 864e5)) : "",
      // El documento lleva su tipo para que el bloque de firmas lo reconozca (RE_DOC); si solo escribieron el número, se asume cédula.
      equipo: equipo.map((x) => ({ nombre: x.nombre, cargo: x.cargo ?? "", documento: x.documento?.trim() ? (RE_DOC.test(x.documento.trim()) ? x.documento.trim() : `C.C. ${x.documento.trim()}`) : "", rol: ROLES_EQUIPO[x.rol] ?? x.rol })), hayEquipo: equipo.length > 0,
      rolesMinimos: rolesExigidos(ev.tipo, ev.gravedad).map((r) => ROLES_EQUIPO[r]),
      porques: a.porques ?? [], actos: a.actos ?? [], condiciones: a.condiciones ?? [], personales: a.personales ?? [], trabajo: a.trabajo ?? [], conclusion: a.conclusion ?? "",
      peligro: ev.peligro ? `${ev.peligro.descripcion} (${ev.peligro.clasificacion})` : "",
      lecciones: ev.lecciones ?? "",
      acciones: ev.acciones.map((x, i) => ({ n: i + 1, descripcion: x.descripcion, tipo: x.tipo, jerarquia: x.jerarquia ? JER[x.jerarquia] ?? x.jerarquia : "", responsable: x.responsable ?? "", fechaLimite: ddmm(x.fechaLimite), estado: x.estado === "cerrada" ? "Cerrada" : "Abierta" })),
      soportes: ev.archivos.map((x) => x.descripcion),
    },
  };
}


const TIPO_EXAMEN: Record<string, string> = { ingreso: "Ingreso", periodico: "Periódico", retiro: "Retiro", post_incapacidad: "Post incapacidad", cambio_ocupacion: "Cambio de ocupación" };
const CONCEPTO: Record<string, string> = { apto: "Apto", apto_restricciones: "Apto con restricciones", aplazado: "Aplazado", no_apto: "No apto" };

/** Trabajadores, exámenes (solo conceptos), entregas de EPP, capacitaciones y perfil sociodemográfico consolidado. */
export async function contextoNomina(empresaId: string) {
  const ts = await db.trabajador.findMany({ where: { empresaId }, orderBy: { nombres: "asc" }, include: { cargo: true, examenes: { orderBy: { fecha: "desc" } }, entregasEpp: { orderBy: { fecha: "desc" } } } });
  const caps = await db.capacitacion.findMany({ where: { empresaId }, orderBy: { fecha: "asc" }, include: { _count: { select: { asistentes: true } }, asistentes: { select: { trabajadorId: true } } } });
  const activos = ts.filter((t) => t.activo);
  const doc = (t: (typeof ts)[number]) => (t.documento ? docTexto(t.tipoDoc, t.documento) : "");
  const examenes = ts.flatMap((t) => t.examenes.map((x) => ({ t, x }))).sort((a, b) => b.x.fecha.getTime() - a.x.fecha.getTime()).map(({ t, x }, i) => ({
    n: i + 1, trabajador: t.nombres, doc: doc(t), cargo: t.cargo?.nombre ?? "", tipo: TIPO_EXAMEN[x.tipo] ?? x.tipo, fecha: ddmm(x.fecha),
    concepto: CONCEPTO[x.concepto] ?? x.concepto, restricciones: x.restricciones?.trim() || (x.concepto === "apto" ? "Ninguna" : "Sin registrar"), comunicado: ddmm(x.comunicadoTrabajador) || "Sin registrar", proximo: ddmm(x.proximo),
  }));
  const entregas = ts.flatMap((t) => t.entregasEpp.map((x) => ({ t, x }))).sort((a, b) => b.x.fecha.getTime() - a.x.fecha.getTime()).map(({ t, x }) => ({
    fecha: ddmm(x.fecha), trabajador: t.nombres, doc: doc(t), cargo: t.cargo?.nombre ?? "", elemento: x.elemento, cantidad: x.cantidad, tipo: x.tipo === "reposicion" ? "Reposición" : "Dotación", capacitado: x.capacitado ? "S" : "N", proxima: ddmm(x.proximaReposicion) || "Según desgaste",
  }));
  const capacitados = new Set(caps.flatMap((c) => c.asistentes.map((a) => a.trabajadorId)));
  const hoy = new Date();
  const edad = (d: Date) => Math.floor((hoy.getTime() - d.getTime()) / (365.25 * 864e5));
  const pct = (n: number, d: number) => (d ? `${Math.round((n / d) * 100)} %` : "—");
  const tabla = (pares: [string, number][]) => pares.filter(([, n]) => n > 0).map(([nombre, n]) => ({ nombre, n, pct: pct(n, activos.length) }));
  const cuenta = (f: (t: (typeof activos)[number]) => string | null | undefined) => { const m = new Map<string, number>(); for (const t of activos) { const k = f(t) || "Sin dato"; m.set(k, (m.get(k) ?? 0) + 1); } return [...m.entries()].sort((a, b) => b[1] - a[1]); };
  const conEdad = activos.filter((t) => t.fechaNacimiento);
  const rangos: [string, (e: number) => boolean][] = [["Menos de 25", (e) => e < 25], ["25 a 34", (e) => e >= 25 && e < 35], ["35 a 44", (e) => e >= 35 && e < 45], ["45 a 54", (e) => e >= 45 && e < 55], ["55 o más", (e) => e >= 55]];
  const antig: [string, (a: number) => boolean][] = [["Menos de 1 año", (a) => a < 1], ["1 a 5 años", (a) => a >= 1 && a < 5], ["5 a 10 años", (a) => a >= 5 && a < 10], ["10 o más años", (a) => a >= 10]];
  const VINC: Record<string, string> = { planta: "Planta", contratista: "Contratista", aprendiz: "Aprendiz", mision: "En misión" };
  return {
    hay: ts.length > 0, total: activos.length, examenes, hayExamenes: examenes.length > 0, entregas, hayEntregas: entregas.length > 0,
    capacitaciones: caps.map((c) => ({ fecha: ddmm(c.fecha), tema: c.tema, horas: c.horas, modalidad: c.modalidad === "virtual" ? "Virtual" : "Presencial", facilitador: c.facilitador?.trim() || "Sin registrar", asistentes: c._count.asistentes })),
    hayCapacitaciones: caps.length > 0, horasCapacitacion: caps.reduce((s, c) => s + c.horas, 0),
    cobertura: pct(activos.filter((t) => capacitados.has(t.id)).length, activos.length),
    perfil: {
      hay: activos.length > 0,
      sexo: tabla(cuenta((t) => (t.sexo === "F" ? "Mujeres" : t.sexo === "M" ? "Hombres" : t.sexo ? "Otro" : null))),
      edad: tabla(rangos.map(([n, f]) => [n, conEdad.filter((t) => f(edad(t.fechaNacimiento!))).length])),
      escolaridad: tabla(cuenta((t) => t.escolaridad)),
      vinculacion: tabla(cuenta((t) => VINC[t.vinculacion] ?? t.vinculacion)),
      antiguedad: tabla(antig.map(([n, f]) => [n, activos.filter((t) => t.fechaIngreso && f((hoy.getTime() - t.fechaIngreso.getTime()) / (365.25 * 864e5))).length])),
      cargos: tabla(cuenta((t) => t.cargo?.nombre)),
    },
  };
}
