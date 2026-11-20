// Informe de auditoría interna del SG-SST (Decreto 1072/2015 arts. 2.2.4.6.29 y 2.2.4.6.30).
import { db } from "@/lib/db";
import { resumenAuditoria, type ItemAuditoria } from "@/lib/auditoria";
import { docTexto } from "@/lib/documento-identidad";

const c = (t: unknown) => String(t ?? "").replace(/\|/g, "/").replace(/\n/g, " ");
const fecha = (d?: Date | null) => (d ? d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "______");
const RES: Record<string, string> = { conforme: "Conforme", no_conforme: "No conforme", observacion: "Observación", na: "No aplica", "": "Sin calificar" };

export async function informeAuditoria(auditoriaId: string) {
  const a = await db.auditoria.findUniqueOrThrow({ where: { id: auditoriaId }, include: { empresa: { include: { consultora: true } }, acciones: { orderBy: { fecha: "asc" } } } });
  const e = a.empresa;
  const items = (a.items ?? []) as ItemAuditoria[];
  const r = resumenAuditoria(items);
  // Auditoría anterior: sus no conformidades y el estado de sus acciones (Decreto 1072/2015 art. 2.2.4.6.29 par.).
  const prev = await db.auditoria.findFirst({ where: { empresaId: a.empresaId, id: { not: a.id }, fechaInicio: { lt: a.fechaInicio } }, orderBy: { fechaInicio: "desc" }, include: { acciones: { orderBy: { fecha: "asc" } } } });
  const prevNc = prev ? ((prev.items ?? []) as ItemAuditoria[]).filter((i) => i.resultado === "no_conforme") : [];
  const anterior = !prev ? "No hay auditoría anterior registrada en el sistema." : `Auditoría interna ${prev.anio}${prev.fechaCierre ? `, cerrada el ${fecha(prev.fechaCierre)}` : " (sin cerrar)"}: ${prevNc.length} no conformidad(es).

${prevNc.length ? `| Aspecto | No conformidad | Acción | Estado de la acción |
|---|---|---|---|
${prevNc.map((i) => { const ac = prev.acciones.find((x) => x.hallazgo.startsWith(`Auditoría ${prev.anio} — ${i.aspecto}`)); return `| ${i.n}. ${c(i.aspecto)} | ${c(i.hallazgo)} | ${c(ac?.descripcion ?? i.accion?.descripcion ?? "Sin acción registrada")} | ${ac ? (ac.estado === "cerrada" ? `Cerrada${ac.fechaCierre ? ` el ${fecha(ac.fechaCierre)}` : ""}` : `Abierta${ac.fechaLimite ? ` (fecha límite ${fecha(ac.fechaLimite)})` : ""}`) : "Sin acción"} |`; }).join("\n")}` : "No dejó no conformidades."}

Los resultados de la auditoría anterior se tuvieron en cuenta para definir el alcance y verificar el cierre de sus acciones.`;
  const md = `## Datos de la auditoría

| Campo | Información |
|---|---|
| Empresa | ${c(e.razonSocial)} — NIT ${c(e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit)} |
| Periodo auditado | ${a.anio} |
| Fecha de inicio | ${fecha(a.fechaInicio)} |
| Fecha de cierre | ${fecha(a.fechaCierre)} |
| Auditor | ${c(a.auditor)}${a.auditorPerfil ? ` — ${c(a.auditorPerfil)}` : ""} |
| Independencia del auditor | ${a.independiente ? "Declarada: no audita su propio trabajo" : "Sin declarar"} |
| Planificada con | ${c(a.participantes || "______")} |

## Objetivo y alcance

Verificar el cumplimiento del SG-SST de **${c(e.razonSocial)}** y su eficacia, según los aspectos del artículo 2.2.4.6.30 del Decreto 1072 de 2015. La auditoría es anual y se planifica con la participación del COPASST o Vigía (Resolución 0312 de 2019, estándares 6.1.2 y 6.1.4).

${a.alcance ? `Alcance definido: ${c(a.alcance)}` : ""}

${a.metodologia ? `Metodología: ${c(a.metodologia)}` : "Metodología: revisión documental, entrevistas y observación en campo."}

## Independencia del auditor

${a.independiente ? `${c(a.auditor)} declara que es independiente de las actividades auditadas: no audita su propio trabajo ni las actividades del SG-SST que diseñó o ejecutó (Decreto 1072 de 2015, art. 2.2.4.6.29).` : "**Pendiente:** no se ha registrado la declaración de independencia del auditor, que exige el Decreto 1072 de 2015 (art. 2.2.4.6.29)."}

## Auditoría anterior

${anterior}

## Resumen de resultados

| Resultado | N.º |
|---|---|
| Aspectos evaluados | ${r.evaluados} |
| Conformes | ${r.conformes} |
| No conformidades | ${r.noConformes} |
| Observaciones | ${r.observaciones} |
| Porcentaje de conformidad | ${r.pct} % |

## Resultados por aspecto (art. 2.2.4.6.30)

| N.º | Aspecto | Resultado | Evidencia revisada | Hallazgo |
|---|---|---|---|---|
${items.map((i) => `| ${i.n} | ${c(i.aspecto)} | ${RES[i.resultado] ?? i.resultado} | ${c(i.evidencia)} | ${c(i.hallazgo)} |`).join("\n")}

## Acciones correctivas y de mejora

${a.acciones.length ? `| Hallazgo | Causa raíz | Acción | Responsable | Fecha límite | Estado |
|---|---|---|---|---|---|
${a.acciones.map((x) => `| ${c(x.hallazgo)} | ${c(x.causa || "Sin registrar")} | ${c(x.descripcion)} | ${c(x.responsable)} | ${fecha(x.fechaLimite)} | ${x.estado === "cerrada" ? "Cerrada" : "Abierta"} |`).join("\n")}

Las acciones se registran en el formato de acciones correctivas, preventivas y de mejora (FOR-06).` : "No se generaron acciones."}

## Conclusiones

${c(a.conclusiones || "______")}

## Comunicación de resultados

${a.comunicadoA ? `Los resultados se comunicaron el ${fecha(a.comunicadoFecha)} a: ${c(a.comunicadoA)}.` : "**Pendiente:** registrar a quién y cuándo se comunicaron los resultados."} Se comunican a los responsables de adoptar las medidas preventivas, correctivas o de mejora (Decreto 1072 de 2015, art. 2.2.4.6.29) y alimentan la revisión por la alta dirección (art. 2.2.4.6.31).

______________________________________
**${c(a.auditor)}** — Auditor

______________________________________
**${c(e.representanteLegal || "Representante legal")}** — Representante Legal — ${docTexto(e.representanteTipoDoc, e.representanteCedula)}
`;
  return { md, titulo: `Informe de auditoría interna del SG-SST ${a.anio}`, empresa: e, anio: a.anio };
}
