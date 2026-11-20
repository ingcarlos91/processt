// Informe mensual de gestión del SG-SST para el cliente: lo que se hizo en el mes, cómo va el año,
// accidentalidad, acciones, documentos, comités y lo que viene. Se genera en Word con los datos registrados.
import { db } from "@/lib/db";
import { calcularMensuales, calcularAnuales } from "@/lib/indicadores";
import { estadoDocumento } from "@/lib/estado-documento";
import { fechasPlaneador } from "@/lib/planeador";
import { docTexto } from "@/lib/documento-identidad";
import { comparativoDiagnostico } from "@/lib/diagnostico";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const c = (t: unknown) => String(t ?? "").replace(/\|/g, "/").replace(/\n/g, " ");
const f2 = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("es-CO", { maximumFractionDigits: 2 }));
const fecha = (d: Date) => d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
/** Barra de avance en texto (se ve en Word sin imágenes). */
const barra = (pct: number) => { const n = Math.round(Math.max(0, Math.min(100, pct)) / 10); return `${"█".repeat(n)}${"░".repeat(10 - n)} ${Math.round(pct)} %`; };

export async function informeGestion(empresaId: string, anio: number, mes: number) {
  const ini = new Date(Date.UTC(anio, mes - 1, 1)), fin = new Date(Date.UTC(anio, mes, 0, 23, 59, 59));
  const enMes = (d?: Date | null) => !!d && d >= ini && d <= fin;
  const e = await db.empresa.findUniqueOrThrow({
    where: { id: empresaId },
    include: {
      consultora: true,
      evaluaciones: { orderBy: { fecha: "desc" }, take: 1 },
      actividades: { where: { anio }, include: { evidencias: { where: { activo: true } } }, orderBy: [{ mes: "asc" }, { nombre: "asc" }] },
      eventos: { orderBy: { fecha: "asc" } },
      acciones: { orderBy: { fecha: "asc" } },
      documentos: { include: { secciones: { select: { requiereRevision: true } }, archivos: { where: { activo: true, tipo: "DOCUMENTO_FIRMADO" }, orderBy: { subidoEn: "desc" } } }, orderBy: { codigo: "asc" } },
      comites: { include: { archivos: { where: { activo: true } } } },
      trabajadoresMes: true,
      visitas: { orderBy: { fecha: "asc" } },
    },
  });
  const nombreMes = `${MESES[mes - 1]} de ${anio}`;
  const comparativo = await comparativoDiagnostico(empresaId);
  const ev = e.evaluaciones[0];
  const puntaje = ev ? (ev.nivel === 60 ? ev.puntajeBruto : ev.puntajeAjustado) : null;

  // Plan anual
  const delMes = e.actividades.filter((a) => a.mes === mes);
  const hastaMes = e.actividades.filter((a) => a.mes <= mes && a.estado !== "CANCELADA");
  const ejecHasta = hastaMes.filter((a) => a.estado === "EJECUTADA").length;
  const totalAnio = e.actividades.filter((a) => a.estado !== "CANCELADA").length;
  const ejecAnio = e.actividades.filter((a) => a.estado === "EJECUTADA").length;
  const vencidas = e.actividades.filter((a) => a.mes < mes && a.estado === "PENDIENTE");

  // Accidentalidad
  const eventosMes = e.eventos.filter((x) => enMes(x.fecha));
  const mensuales = calcularMensuales(e.eventos, e.trabajadoresMes, anio, e.nTrabajadoresPlanta + e.nEnMision);
  const anuales = calcularAnuales(e.eventos, e.trabajadoresMes, anio, e.nTrabajadoresPlanta + e.nEnMision);
  const m = mensuales[mes - 1];

  // Acciones
  const abiertas = e.acciones.filter((a) => a.estado === "abierta");
  const cerradasMes = e.acciones.filter((a) => a.estado === "cerrada" && enMes(a.fechaCierre));
  const accVencidas = abiertas.filter((a) => a.fechaLimite && a.fechaLimite < fin);

  // Documentos
  const estados = e.documentos.map((d) => ({ d, est: estadoDocumento({ estado: d.estado, version: d.version, firmadoVersion: d.archivos[0]?.documentoVersion, revisar: d.secciones.some((s) => s.requiereRevision) }) }));
  const firmadosMes = e.documentos.flatMap((d) => d.archivos.filter((a) => enMes(a.subidoEn)).map((a) => ({ d, a })));
  const porFirmar = estados.filter((x) => x.est !== "firmado");
  const firmados = estados.filter((x) => x.est === "firmado").length;

  // Comités
  const actasMes = e.comites.flatMap((cm) => cm.archivos.filter((a) => enMes(a.fecha)).map((a) => ({ cm, a })));

  // Próximo mes
  const sig = new Date(Date.UTC(anio, mes, 1)), sigFin = new Date(Date.UTC(anio, mes + 1, 0, 23, 59));
  const proximas = (await fechasPlaneador({ empresaId, desde: sig, hasta: sigFin })).filter((x) => x.estado !== "hecho" && x.estado !== "vencido");

  // Recomendaciones automáticas
  const rec: string[] = [];
  if (vencidas.length) rec.push(`Ejecutar las ${vencidas.length} actividades del plan anual vencidas o reprogramarlas con justificación.`);
  if (accVencidas.length) rec.push(`Cerrar las ${accVencidas.length} acciones correctivas o preventivas con fecha vencida y verificar su eficacia.`);
  if (porFirmar.length) rec.push(`Firmar y entregar ${porFirmar.length} documentos del SG-SST pendientes de firma.`);
  if (!ev) rec.push("Realizar la autoevaluación de estándares mínimos (Res. 0312/2019).");
  else if (ev.valoracion === "CRÍTICO") rec.push("El resultado de estándares es crítico: priorizar el plan de mejoramiento.");
  if (eventosMes.some((x) => x.invEstado !== "cerrada" && x.invEstado !== "no_aplica")) rec.push("Completar la investigación de los eventos del mes dentro del plazo (Res. 1401/2007).");
  if (!rec.length) rec.push("Mantener la ejecución del plan anual y el seguimiento a las acciones abiertas.");

  const r = (e.responsableSst ?? {}) as { nombre?: string; tipoDoc?: string; cedula?: string };
  const md = `## Datos del informe

| Campo | Información |
|---|---|
| Empresa | ${c(e.razonSocial)} — NIT ${c(e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit)} |
| Periodo | ${nombreMes} |
| Nivel de estándares | ${e.nivelEstandares} estándares mínimos |
| Elaboró | ${c(r.nombre || e.consultora?.profesional || "______")} |
| Fecha de elaboración | ${fecha(new Date())} |

## Resumen del mes

| Indicador | Resultado |
|---|---|
| Estándares mínimos | ${puntaje != null ? `${puntaje} % — ${c(ev?.valoracion ?? "en curso")}` : "Sin autoevaluación"} |
${comparativo ? `| Línea base (diagnóstico del ${comparativo.fecha}) | ${comparativo.base.puntaje} % — ${comparativo.base.valoracion}${comparativo.actual ? `; avance: ${comparativo.actual.puntaje - comparativo.base.puntaje >= 0 ? "+" : ""}${Math.round(comparativo.actual.puntaje - comparativo.base.puntaje)} puntos` : ""} |` : ""}
| Plan anual: ejecutado a la fecha | ${hastaMes.length ? `${barra((ejecHasta / hastaMes.length) * 100)} (${ejecHasta} de ${hastaMes.length})` : "Sin actividades programadas"} |
| Plan anual: avance del año | ${totalAnio ? `${barra((ejecAnio / totalAnio) * 100)} (${ejecAnio} de ${totalAnio})` : "—"} |
| Actividades del mes ejecutadas | ${delMes.filter((a) => a.estado === "EJECUTADA").length} de ${delMes.length} |
| Actividades vencidas | ${vencidas.length} |
| Accidentes de trabajo en el mes | ${eventosMes.filter((x) => x.tipo === "AT").length} |
| Documentos firmados | ${e.documentos.length ? `${barra((firmados / e.documentos.length) * 100)} (${firmados} de ${e.documentos.length})` : "—"} |
| Acciones abiertas / vencidas | ${abiertas.length} / ${accVencidas.length} |

## Visitas y acompañamiento de la consultora

${(() => { const vs = e.visitas.filter((v) => enMes(v.fecha)); const h = vs.reduce((s, v) => s + v.horas, 0); return vs.length ? `${vs.length} visita(s) y ${h.toLocaleString("es-CO")} horas de asesoría${e.contratoHorasMes ? ` (${e.contratoHorasMes} horas pactadas al mes)` : ""}.

| Fecha | Horas | Modalidad | Actividades | Compromisos |
|---|---|---|---|---|
${vs.map((v) => `| ${fecha(v.fecha)} | ${v.horas} | ${v.modalidad === "virtual" ? "Virtual" : "Presencial"} | ${c(v.actividades).replace(/ {2,}/g, " ")} | ${c(v.compromisos)} |`).join("\n")}` : "No se registraron visitas en el mes."; })()}

## Actividades del plan anual en ${MESES[mes - 1]}

| Actividad | Estándar | Estado | Evidencias |
|---|---|---|---|
${delMes.length ? delMes.map((a) => `| ${c(a.nombre)} | ${c(a.estandarCodigo)} | ${a.estado === "EJECUTADA" ? "Ejecutada" : a.estado === "CANCELADA" ? "Cancelada" : "Pendiente"} | ${a.evidencias.length || "—"} |`).join("\n") : "| Sin actividades programadas en el mes | | | |"}

${vencidas.length ? `### Actividades vencidas de meses anteriores

| Mes | Actividad | Responsable |
|---|---|---|
${vencidas.map((a) => `| ${MESES[a.mes - 1]} | ${c(a.nombre)} | ${c(a.responsable)} |`).join("\n")}
` : ""}
## Accidentalidad e indicadores

| Indicador (Res. 0312/2019 art. 30) | ${MESES[mes - 1]} |
|---|---|
| Trabajadores del mes | ${m.trabajadores || "Sin registrar"} |
| Accidentes de trabajo | ${m.accidentes} |
| Frecuencia de accidentalidad (%) | ${f2(m.frecuencia)} |
| Severidad de accidentalidad (%) | ${f2(m.severidad)} |
| Ausentismo por causa médica (%) | ${f2(m.ausentismo)} |
| Proporción de accidentes mortales en el año (%) | ${f2(anuales.mortalidad)} |

${eventosMes.length ? `| Fecha | Evento | Cargo | Días | Reporte ARL | Investigación |
|---|---|---|---|---|---|
${eventosMes.map((x) => `| ${fecha(x.fecha)} | ${x.tipo === "AT" ? "Accidente de trabajo" : x.tipo === "INCIDENTE" ? "Incidente" : x.tipo === "EL" ? "Enfermedad laboral" : "Ausentismo"} | ${c(x.cargo)} | ${x.diasIncapacidad} | ${x.fechaReporte ? fecha(x.fechaReporte) : x.tipo === "AT" || x.tipo === "EL" ? "Pendiente" : "No aplica"} | ${x.invEstado === "cerrada" ? "Cerrada" : x.invEstado === "no_aplica" ? "No aplica" : "En curso"} |`).join("\n")}` : "No se registraron accidentes, incidentes ni enfermedades laborales en el mes."}

## Acciones correctivas, preventivas y de mejora

- Abiertas: ${abiertas.length}${accVencidas.length ? ` (${accVencidas.length} vencidas)` : ""}.
- Cerradas en el mes: ${cerradasMes.length}.

${abiertas.length ? `| Acción | Responsable | Fecha límite | Estado |
|---|---|---|---|
${abiertas.map((a) => `| ${c(a.descripcion)} | ${c(a.responsable)} | ${a.fechaLimite ? fecha(a.fechaLimite) : "—"} | ${a.fechaLimite && a.fechaLimite < fin ? "Vencida" : "En curso"} |`).join("\n")}` : ""}

## Documentos del SG-SST

- Documentos generados: ${e.documentos.length}.
- Firmados en el mes: ${firmadosMes.length ? firmadosMes.map((x) => `${x.d.codigo} ${c(x.d.nombre)}`).join("; ") : "ninguno"}.

| Estado | Documentos |
|---|---|
| Firmados y vigentes | ${firmados} |
| Aprobados, por firmar | ${estados.filter((x) => x.est === "aprobado").length} |
| Por volver a firmar (cambiaron después de firmarse) | ${estados.filter((x) => x.est === "volver_a_firmar").length} |
| En borrador o por revisar | ${estados.filter((x) => x.est === "borrador" || x.est === "por_revisar").length} |

${estados.some((x) => x.est === "aprobado" || x.est === "volver_a_firmar") ? `Para firmar este mes:

${estados.filter((x) => x.est === "aprobado" || x.est === "volver_a_firmar").slice(0, 20).map((x) => `- ${x.d.codigo} ${c(x.d.nombre)}${x.est === "volver_a_firmar" ? " (volver a firmar)" : ""}`).join("\n")}
` : ""}
## Comités

${actasMes.length ? actasMes.map((x) => `- ${x.cm.tipo === "VIGIA" ? "Vigía de SST" : x.cm.tipo === "CCL" ? "Comité de Convivencia" : x.cm.tipo === "BRIGADA" ? "Brigada" : "COPASST"}: ${c(x.a.descripcion)} (${fecha(x.a.fecha)}).`).join("\n") : "No se subieron actas de comités en el mes."}

## Programado para ${MESES[mes % 12]}

${proximas.length ? `| Fecha | Qué | Norma |
|---|---|---|
${proximas.slice(0, 30).map((x) => `| ${x.mesCompleto ? "En el mes" : fecha(new Date(x.fecha))} | ${c(x.titulo)} | ${c(x.normaRef)} |`).join("\n")}` : "Sin fechas programadas."}

## Recomendaciones y compromisos

${rec.map((x, i) => `${i + 1}. ${x}`).join("\n")}

Observaciones de la consultora: ______________________________________________

______________________________________
**${c(r.nombre || e.consultora?.profesional || "Responsable del SG-SST")}** — Responsable del SG-SST — ${docTexto(r.tipoDoc, r.cedula)}

______________________________________
**${c(e.representanteLegal || "Representante legal")}** — Recibido, representante legal — ${docTexto(e.representanteTipoDoc, e.representanteCedula)}
`;
  return { md, titulo: `Informe de gestión del SG-SST — ${nombreMes}`, empresa: e };
}
