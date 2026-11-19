// Auditoría interna del SG-SST: aspectos del Decreto 1072/2015 art. 2.2.4.6.30 y la evidencia que
// PROCESST ya tiene de cada uno (para que el auditor parta de datos reales).
import { db } from "@/lib/db";
import { estadoDocumento, ESTADOS_DOC } from "@/lib/estado-documento";

export type ResultadoAud = "conforme" | "no_conforme" | "observacion" | "na" | "";
export type ItemAuditoria = { n: number; aspecto: string; criterio: string; estandares: string[]; resultado: ResultadoAud; evidencia: string; hallazgo: string; accion?: { descripcion: string; causa?: string; responsable?: string; fechaLimite?: string } | null };

export const ASPECTOS: Omit<ItemAuditoria, "resultado" | "evidencia" | "hallazgo">[] = [
  { n: 1, aspecto: "Cumplimiento de la política de SST", criterio: "La política está firmada, fechada, divulgada, disponible para los trabajadores y se revisa anualmente.", estandares: ["2.1.1"] },
  { n: 2, aspecto: "Resultado de los indicadores de estructura, proceso y resultado", criterio: "Los indicadores están definidos con ficha técnica, se miden con la periodicidad establecida y se analizan.", estandares: ["6.1.1"] },
  { n: 3, aspecto: "Participación de los trabajadores", criterio: "El COPASST o Vigía está conformado y vigente, se reúne y participa; los trabajadores reportan condiciones y participan en la identificación de peligros.", estandares: ["1.1.6", "4.2.4"] },
  { n: 4, aspecto: "Responsabilidad y obligación de rendir cuentas", criterio: "Las responsabilidades en SST están asignadas por escrito y quienes las tienen rinden cuentas al menos una vez al año.", estandares: ["1.1.2"] },
  { n: 5, aspecto: "Mecanismo de comunicación del SG-SST", criterio: "Existen mecanismos de comunicación interna y externa y de autorreporte, y se usan.", estandares: ["2.8.1"] },
  { n: 6, aspecto: "Planificación, desarrollo y aplicación del SG-SST", criterio: "El plan anual tiene objetivos, metas, responsables, recursos y cronograma, y se ejecuta.", estandares: ["2.4.1"] },
  { n: 7, aspecto: "Gestión del cambio", criterio: "Los cambios internos y externos se evalúan en su impacto sobre la SST antes de implementarlos.", estandares: ["2.11.1"] },
  { n: 8, aspecto: "Consideración de la SST en las nuevas adquisiciones", criterio: "Las compras de productos y servicios consideran los requisitos de SST.", estandares: ["2.9.1"] },
  { n: 9, aspecto: "Alcance y aplicación del SG-SST frente a proveedores y contratistas", criterio: "Los contratistas y proveedores se seleccionan y evalúan con criterios de SST y cumplen sus obligaciones.", estandares: ["2.10.1"] },
  { n: 10, aspecto: "Supervisión y medición de los resultados", criterio: "Se realizan inspecciones, se verifica el cumplimiento y las acciones correctivas se cierran con verificación de eficacia.", estandares: ["4.2.4", "7.1.1"] },
  { n: 11, aspecto: "Proceso de investigación de incidentes, accidentes y enfermedades laborales", criterio: "Los eventos se reportan e investigan dentro de los plazos, con equipo investigador y medidas de control.", estandares: ["3.2.1", "3.2.2"] },
  { n: 12, aspecto: "Desarrollo del proceso de auditoría", criterio: "La auditoría se planifica con el COPASST o Vigía y la realiza personal idóneo e independiente.", estandares: ["6.1.2", "6.1.4"] },
  { n: 13, aspecto: "Evaluación por parte de la alta dirección", criterio: "La alta dirección revisa el SG-SST al menos una vez al año y comunica sus resultados.", estandares: ["6.1.3"] },
];

/** Lo que PROCESST ya muestra de cada aspecto (texto breve por número de aspecto). */
export async function evidenciasSistema(empresaId: string, hoy = new Date()) {
  const hace12 = new Date(hoy.getTime() - 365 * 864e5);
  const [docs, comites, plan, ev, eventos, insp, acciones, tm, audPrev, trabajadores] = await Promise.all([
    db.documento.findMany({ where: { empresaId }, select: { codigo: true, estado: true, version: true, secciones: { select: { requiereRevision: true } }, archivos: { where: { activo: true, tipo: "DOCUMENTO_FIRMADO" }, orderBy: { subidoEn: "desc" }, take: 1, select: { documentoVersion: true } } } }),
    db.comite.findMany({ where: { empresaId }, select: { tipo: true, periodoFin: true, _count: { select: { miembros: true } }, archivos: { where: { activo: true, fecha: { gte: hace12 } }, select: { id: true } } } }),
    db.actividadPlan.findMany({ where: { empresaId, anio: hoy.getUTCFullYear() }, select: { estado: true } }),
    db.evaluacion.findFirst({ where: { empresaId }, orderBy: { fecha: "desc" } }),
    db.evento.findMany({ where: { empresaId, fecha: { gte: hace12 }, invEstado: { not: "no_aplica" } }, select: { invEstado: true } }),
    db.inspeccion.count({ where: { empresaId, fecha: { gte: hace12 } } }),
    db.accion.findMany({ where: { empresaId }, select: { estado: true, fechaLimite: true } }),
    db.trabajadoresMes.count({ where: { empresaId, anio: hoy.getUTCFullYear() } }),
    db.auditoria.findFirst({ where: { empresaId, estado: "cerrada" }, orderBy: { fechaInicio: "desc" } }),
    db.trabajador.count({ where: { empresaId, activo: true, vinculacion: "contratista" } }),
  ]);
  const doc = (c: string) => {
    const d = docs.find((x) => x.codigo === c);
    if (!d) return `${c}: no generado`;
    const e = estadoDocumento({ estado: d.estado, version: d.version, firmadoVersion: d.archivos[0]?.documentoVersion, revisar: d.secciones.some((s) => s.requiereRevision) });
    return `${c}: ${ESTADOS_DOC[e].t.toLowerCase()}`;
  };
  const cop = comites.find((c) => c.tipo === "COPASST" || c.tipo === "VIGIA");
  const ejec = plan.filter((a) => a.estado === "EJECUTADA").length;
  const abiertasVencidas = acciones.filter((a) => a.estado === "abierta" && a.fechaLimite && a.fechaLimite < hoy).length;
  return {
    1: doc("POL-01"),
    2: `${doc("DOC-01")}; ${tm} mes(es) con trabajadores registrados para los indicadores en el año`,
    3: cop ? `${cop.tipo === "VIGIA" ? "Vigía" : "COPASST"} con ${cop._count.miembros} integrante(s)${cop.periodoFin ? `, vigente hasta ${cop.periodoFin.toISOString().slice(0, 10)}` : ""}; ${cop.archivos.length} acta(s) subidas en los últimos 12 meses` : "COPASST o Vigía no registrado",
    4: `${doc("DOC-02")}; ${doc("DOC-03")}; ${doc("DOC-11")}`,
    5: doc("PRC-02"),
    6: `${doc("PLN-01")}; plan ${hoy.getUTCFullYear()}: ${ejec} de ${plan.length} actividades ejecutadas${ev ? `; última autoevaluación: ${ev.valoracion ?? "en curso"}` : "; sin autoevaluación"}`,
    7: doc("PRC-05"),
    8: doc("PRC-04"),
    9: `${doc("PRC-04")}; ${trabajadores} contratista(s) registrados`,
    10: `${insp} inspección(es) en los últimos 12 meses; ${acciones.filter((a) => a.estado === "cerrada").length} acciones cerradas, ${acciones.filter((a) => a.estado === "abierta").length} abiertas (${abiertasVencidas} vencidas)`,
    11: eventos.length ? `${eventos.filter((e) => e.invEstado === "cerrada").length} de ${eventos.length} eventos de los últimos 12 meses investigados; ${doc("PRC-09")}` : `Sin eventos en los últimos 12 meses; ${doc("PRC-09")}`,
    12: `${doc("PRG-10")}${audPrev ? `; auditoría anterior cerrada el ${audPrev.fechaCierre?.toISOString().slice(0, 10) ?? audPrev.anio}` : "; sin auditoría anterior registrada"}`,
    13: doc("ACT-06"),
  } as Record<number, string>;
}

export function resumenAuditoria(items: { resultado: string }[]) {
  const ap = items.filter((i) => i.resultado && i.resultado !== "na");
  const conformes = ap.filter((i) => i.resultado === "conforme").length;
  return { evaluados: ap.length, conformes, noConformes: items.filter((i) => i.resultado === "no_conforme").length, observaciones: items.filter((i) => i.resultado === "observacion").length, pct: ap.length ? Math.round((conformes / ap.length) * 100) : 0 };
}
