// Ruta de implementación del SG-SST: los pasos en el orden del Decreto 1072/2015 cap. 6 y la Res. 0312/2019.
// Cada paso se cumple solo con los datos de la empresa (nadie marca casillas): cuando algo se hace, el paso avanza.
// La ruta es orientativa: muestra el orden ideal y el siguiente paso, pero no impide trabajar en otra pestaña;
// solo bloquea lo que depende de montar el SG-SST (empresa en etapa de diagnóstico).
import { db } from "@/lib/db";
import { completitud } from "@/lib/completitud";
import { estadoDocumento } from "@/lib/estado-documento";
import { anioPlanVigente } from "@/lib/plan/generar";

export type EstadoPaso = "hecho" | "actual" | "pendiente" | "bloqueado" | "continuo";
export type Paso = {
  n: number;
  clave: string;
  titulo: string;
  /** Qué se hace, en una frase. */
  que: string;
  norma: string;
  estado: EstadoPaso;
  /** Avance del paso cuando se puede contar (p. ej. documentos aprobados). */
  avance?: { hechos: number; total: number };
  /** Lo que falta, en frases cortas (máximo 4). */
  falta: string[];
  href: string;
  boton: string;
  /** Pestaña de la empresa donde se trabaja el paso (para el aviso dentro de la pestaña). */
  pestana: string;
};
export type Ruta = { pasos: Paso[]; actual: Paso | null; hechos: number; total: number; pct: number };

const RE_INDUCCION = /inducci/i;

export async function rutaEmpresa(empresaId: string, hoy = new Date()): Promise<Ruta> {
  const anio = hoy.getFullYear();
  const e = await db.empresa.findUniqueOrThrow({
    where: { id: empresaId },
    select: {
      etapa: true, nTrabajadoresPlanta: true, nEnMision: true, resultadoReglas: true,
      diagnosticos: { select: { estado: true } },
      evaluaciones: { select: { tipo: true, cerrada: true, anio: true } },
      cargos: { select: { id: true } },
      peligros: { select: { estado: true, medidaEpp: true } },
      matrizVersiones: { select: { id: true }, take: 1 },
      trabajadores: { where: { activo: true }, select: { id: true, _count: { select: { examenes: true, entregasEpp: true } } } },
      capacitaciones: { select: { tema: true, asistentes: { select: { trabajadorId: true } } } },
      documentos: { select: { codigo: true, estado: true, version: true, secciones: { select: { requiereRevision: true } }, archivos: { where: { activo: true, tipo: "DOCUMENTO_FIRMADO" }, orderBy: { subidoEn: "desc" }, take: 1, select: { documentoVersion: true } } } },
      actividades: { select: { anio: true, mes: true, estado: true } },
      auditorias: { where: { anio }, select: { estado: true } },
    },
  });
  const B = `/empresas/${empresaId}`;
  const rr = (e.resultadoReglas ?? {}) as { documentos?: { codigo: string }[] };
  const enDiagnostico = e.etapa === "diagnostico";
  const comp = enDiagnostico ? null : await completitud(empresaId);
  const pasos: Omit<Paso, "n" | "estado">[] = [];
  const hecho = new Map<string, boolean>();
  const add = (p: Omit<Paso, "n" | "estado">, ok: boolean) => { pasos.push(p); hecho.set(p.clave, ok); };
  const s = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

  // 1. Diagnóstico e inicio
  const diagCerrado = e.diagnosticos.some((d) => d.estado === "cerrado");
  const tieneInicial = e.evaluaciones.some((x) => x.tipo === "inicial");
  add({
    clave: "inicio", titulo: "Diagnóstico e inicio del SG-SST", que: "Calificar los estándares mínimos, entregar el informe y montar el sistema con ese resultado.",
    norma: "Decreto 1072/2015 art. 2.2.4.6.16", href: `${B}/diagnostico`, boton: "Ir al diagnóstico", pestana: "diagnostico",
    falta: [!diagCerrado && !tieneInicial && "Cerrar el diagnóstico y descargar el informe", enDiagnostico && "Iniciar el SG-SST con el diagnóstico"].filter(Boolean) as string[],
  }, !enDiagnostico);

  // 2. Datos para los documentos
  const gruposDatos = ["Datos de la empresa", "Responsable del SG-SST", "Mi consultora (todas las empresas)"];
  const faltDatos = comp?.faltantes.filter((f) => gruposDatos.includes(f.grupo)) ?? [];
  add({
    clave: "datos", titulo: "Datos de la empresa y del responsable", que: "Completar los datos que usan los documentos: contactos, emergencias, presupuesto y responsable del SG-SST.",
    norma: "Decreto 1072/2015 arts. 2.2.4.6.8 y 2.2.4.6.12", href: `${B}/datos`, boton: "Ir a Datos", pestana: "datos",
    falta: faltDatos.slice(0, 4).map((f) => f.dato + (f.detalle ? ` (${f.detalle})` : "")),
  }, !enDiagnostico && faltDatos.length === 0);

  // 3. Cargos y matriz de peligros
  const sugeridos = e.peligros.filter((p) => p.estado === "sugerido").length;
  const aprobados = e.peligros.length - sugeridos;
  add({
    clave: "matriz", titulo: "Cargos y matriz de peligros", que: "Revisar los peligros sugeridos por cargo, ajustar su valoración y cerrar la primera versión de la matriz.",
    norma: "Decreto 1072/2015 art. 2.2.4.6.15; GTC 45", href: `${B}/matriz`, boton: "Ir a Cargos y matriz", pestana: "matriz",
    avance: e.peligros.length ? { hechos: aprobados, total: e.peligros.length } : undefined,
    falta: [!e.cargos.length && "Registrar los cargos", sugeridos > 0 && `Revisar ${s(sugeridos, "peligro sugerido", "peligros sugeridos")}`, !e.matrizVersiones.length && "Cerrar la primera versión de la matriz"].filter(Boolean) as string[],
  }, e.cargos.length > 0 && aprobados > 0 && sugeridos === 0 && e.matrizVersiones.length > 0);

  // 4. Trabajadores
  const esperados = e.nTrabajadoresPlanta + e.nEnMision;
  const activos = e.trabajadores.length;
  add({
    clave: "trabajadores", titulo: "Trabajadores", que: "Registrar a las personas (se pueden importar de Excel) con su cargo y sus condiciones: conduce, turno nocturno, alto riesgo.",
    norma: "Decreto 1072/2015 art. 2.2.4.6.16 num. 7; Res. 0312/2019 est. 1.1.4", href: `${B}/trabajadores`, boton: "Ir a Trabajadores", pestana: "trabajadores",
    avance: esperados ? { hechos: Math.min(activos, esperados), total: esperados } : undefined,
    falta: activos < Math.max(1, esperados) ? [`Registrar ${esperados ? `${esperados - activos} de ${esperados}` : "a los"} trabajadores`] : [],
  }, activos >= Math.max(1, esperados));

  // 5. Comités
  const faltCom = comp?.faltantes.filter((f) => f.grupo === "Comités") ?? [];
  add({
    clave: "comites", titulo: "Comités", que: "Conformar el COPASST o Vigía, el Comité de Convivencia y la brigada, con integrantes, periodo y datos de la elección.",
    norma: "Res. 2013/1986; Res. 3461/2025; Decreto 1072/2015 art. 2.2.4.6.25", href: `${B}/comites`, boton: "Ir a Comités", pestana: "comites",
    falta: faltCom.slice(0, 4).map((f) => f.dato),
  }, !enDiagnostico && faltCom.length === 0);

  // 6. Documentos
  const aplicables = rr.documentos?.map((d) => d.codigo) ?? [];
  const est = aplicables.map((c) => {
    const d = e.documentos.find((x) => x.codigo === c);
    return estadoDocumento(d ? { estado: d.estado, version: d.version, firmadoVersion: d.archivos[0]?.documentoVersion, revisar: d.secciones.some((x) => x.requiereRevision) } : null);
  });
  const nEst = (k: string) => est.filter((x) => x === k).length;
  const listos = nEst("aprobado") + nEst("firmado");
  add({
    clave: "documentos", titulo: "Documentos del SG-SST", que: "Generar los documentos, revisarlos, aprobarlos y subir los firmados (política, designación, objetivos, procedimientos…).",
    norma: "Decreto 1072/2015 art. 2.2.4.6.12", href: `${B}/documentos`, boton: "Ir a Documentos", pestana: "documentos",
    avance: aplicables.length ? { hechos: listos, total: aplicables.length } : undefined,
    falta: [
      nEst("sin_generar") > 0 && `Generar ${s(nEst("sin_generar"), "documento", "documentos")}`,
      nEst("por_revisar") > 0 && `Revisar ${s(nEst("por_revisar"), "documento con cambios", "documentos con cambios")}`,
      nEst("borrador") > 0 && `Revisar y aprobar ${s(nEst("borrador"), "borrador", "borradores")}`,
      nEst("volver_a_firmar") > 0 && `Volver a firmar ${s(nEst("volver_a_firmar"), "documento", "documentos")}`,
    ].filter(Boolean) as string[],
  }, aplicables.length > 0 && listos === aplicables.length);

  // 7. Plan anual
  const anioPlan = anioPlanVigente(e.actividades);
  const delPlan = e.actividades.filter((a) => a.anio === anioPlan);
  const pln = e.documentos.find((d) => d.codigo === "PLN-01");
  const plnListo = !!pln && ["aprobado", "firmado"].includes(estadoDocumento({ estado: pln.estado, version: pln.version, firmadoVersion: pln.archivos[0]?.documentoVersion, revisar: pln.secciones.some((x) => x.requiereRevision) }));
  add({
    clave: "plan", titulo: "Plan anual de trabajo", que: "Generar el plan del año con sus actividades, responsables y recursos, y hacerlo firmar.",
    norma: "Decreto 1072/2015 art. 2.2.4.6.17; Res. 0312/2019 est. 2.4.1", href: `${B}/plan`, boton: "Ir a Plan anual", pestana: "plan",
    falta: [!delPlan.length && "Generar el plan anual", delPlan.length > 0 && !plnListo && "Aprobar y firmar el PLN-01"].filter(Boolean) as string[],
  }, delPlan.length > 0 && plnListo);

  // 8. Arranque: inducción, exámenes y EPP
  const conInduccion = new Set(e.capacitaciones.filter((c) => RE_INDUCCION.test(c.tema)).flatMap((c) => c.asistentes.map((a) => a.trabajadorId)));
  const sinInduccion = e.trabajadores.filter((t) => !conInduccion.has(t.id)).length;
  const sinExamen = e.trabajadores.filter((t) => !t._count.examenes).length;
  const usaEpp = e.peligros.some((p) => p.estado !== "sugerido" && !!p.medidaEpp?.trim());
  const sinEpp = usaEpp ? e.trabajadores.filter((t) => !t._count.entregasEpp).length : 0;
  const pendArranque = sinInduccion + sinExamen + sinEpp;
  add({
    clave: "arranque", titulo: "Inducción, exámenes y EPP", que: "Hacer la inducción en SST, los exámenes médicos de ingreso o periódicos y la entrega de EPP a cada trabajador.",
    norma: "Decreto 1072/2015 arts. 2.2.4.6.11 y 2.2.4.6.24; Res. 1843/2025", href: `${B}/trabajadores`, boton: "Ir a Trabajadores", pestana: "trabajadores",
    avance: activos ? { hechos: activos * (usaEpp ? 3 : 2) - pendArranque, total: activos * (usaEpp ? 3 : 2) } : undefined,
    falta: [
      sinInduccion > 0 && `Inducción: ${s(sinInduccion, "trabajador sin registrar", "trabajadores sin registrar")}`,
      sinExamen > 0 && `Exámenes médicos: ${s(sinExamen, "trabajador sin examen", "trabajadores sin examen")}`,
      sinEpp > 0 && `EPP: ${s(sinEpp, "trabajador sin entrega", "trabajadores sin entrega")}`,
    ].filter(Boolean) as string[],
  }, activos > 0 && pendArranque === 0);

  // 9. Operación mensual (continua): lo vencido del plan.
  const mesActual = hoy.getMonth() + 1;
  const vencidas = delPlan.filter((a) => a.estado === "PENDIENTE" && (a.anio < anio || (a.anio === anio && a.mes < mesActual))).length;
  add({
    clave: "operacion", titulo: "Operación del sistema", que: "Ejecutar el plan mes a mes: reuniones de comités, capacitaciones, inspecciones, seguimiento de acciones e indicadores.",
    norma: "Decreto 1072/2015 arts. 2.2.4.6.17 y 2.2.4.6.19", href: `${B}/planeador`, boton: "Ir al Planeador", pestana: "planeador",
    falta: vencidas ? [`${s(vencidas, "actividad del plan vencida", "actividades del plan vencidas")}`] : [],
  }, false);

  // 10. Cierre del año
  const autoeval = e.evaluaciones.some((x) => x.tipo !== "inicial" && x.anio === anio && x.cerrada);
  const auditoria = e.auditorias.some((a) => a.estado === "cerrada");
  const revision = e.documentos.find((d) => d.codigo === "ACT-06");
  const revisionLista = !!revision && ["aprobado", "firmado"].includes(estadoDocumento({ estado: revision.estado, version: revision.version, firmadoVersion: revision.archivos[0]?.documentoVersion }));
  add({
    clave: "cierre", titulo: `Cierre del año ${anio}`, que: "Autoevaluación de estándares, auditoría interna y revisión por la alta dirección; con eso se formula el plan del año siguiente.",
    norma: "Res. 0312/2019 art. 26; Decreto 1072/2015 arts. 2.2.4.6.29 y 2.2.4.6.31", href: `${B}/evaluacion`, boton: "Ir a Evaluación", pestana: "evaluacion",
    falta: [!autoeval && `Autoevaluación ${anio}`, !auditoria && `Auditoría interna ${anio}`, !revisionLista && "Revisión por la dirección (ACT-06)"].filter(Boolean) as string[],
  }, autoeval && auditoria && revisionLista);

  // Estados: el primer paso de implementación sin terminar es el actual. La operación es continua y el cierre
  // del año solo se vuelve actual desde octubre (o cuando todo lo demás está hecho).
  const implementacion = pasos.filter((p) => !["operacion", "cierre"].includes(p.clave));
  const actualImpl = implementacion.find((p) => !hecho.get(p.clave));
  const cierreTemporada = mesActual >= 10;
  const out: Paso[] = pasos.map((p, i) => {
    let estado: EstadoPaso;
    if (hecho.get(p.clave)) estado = "hecho";
    else if (enDiagnostico && p.clave !== "inicio") estado = "bloqueado";
    else if (p.clave === "operacion") estado = actualImpl ? "pendiente" : "continuo";
    else if (p.clave === "cierre") estado = !actualImpl && cierreTemporada ? "actual" : "pendiente";
    else estado = p === actualImpl ? "actual" : "pendiente";
    return { ...p, n: i + 1, estado };
  });
  const actual = out.find((p) => p.estado === "actual") ?? out.find((p) => p.estado === "continuo") ?? null;
  const contables = out.filter((p) => p.clave !== "operacion");
  const hechos = contables.filter((p) => p.estado === "hecho").length;
  return { pasos: out, actual, hechos, total: contables.length, pct: Math.round((hechos / contables.length) * 100) };
}
