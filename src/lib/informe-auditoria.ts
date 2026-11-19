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
  const md = `## Datos de la auditoría

| Campo | |
|---|---|
| Empresa | ${c(e.razonSocial)} — NIT ${c(e.nit)} |
| Periodo auditado | ${a.anio} |
| Fecha de inicio | ${fecha(a.fechaInicio)} |
| Fecha de cierre | ${fecha(a.fechaCierre)} |
| Auditor | ${c(a.auditor)}${a.auditorPerfil ? ` — ${c(a.auditorPerfil)}` : ""} |
| Planificada con | ${c(a.participantes || "______")} |

## Objetivo y alcance

Verificar el cumplimiento del SG-SST de **${c(e.razonSocial)}** y su eficacia, según los aspectos del artículo 2.2.4.6.30 del Decreto 1072 de 2015. La auditoría es anual y se planifica con la participación del COPASST o Vigía (Resolución 0312 de 2019, estándares 6.1.2 y 6.1.4).

${a.alcance ? `Alcance definido: ${c(a.alcance)}` : ""}

${a.metodologia ? `Metodología: ${c(a.metodologia)}` : "Metodología: revisión documental, entrevistas y observación en campo."}

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

${a.acciones.length ? `| Hallazgo | Acción | Responsable | Fecha límite | Estado |
|---|---|---|---|---|
${a.acciones.map((x) => `| ${c(x.hallazgo)} | ${c(x.descripcion)} | ${c(x.responsable)} | ${fecha(x.fechaLimite)} | ${x.estado === "cerrada" ? "Cerrada" : "Abierta"} |`).join("\n")}

Las acciones se registran en el formato de acciones correctivas, preventivas y de mejora (FOR-06).` : "No se generaron acciones."}

## Conclusiones

${c(a.conclusiones || "______")}

Los resultados se comunican a los responsables de adoptar las medidas correctivas y alimentan la revisión por la alta dirección (Decreto 1072 de 2015, art. 2.2.4.6.31).

______________________________________
**${c(a.auditor)}** — Auditor

______________________________________
**${c(e.representanteLegal || "Representante legal")}** — Representante Legal — ${docTexto(e.representanteTipoDoc, e.representanteCedula)}
`;
  return { md, titulo: `Informe de auditoría interna del SG-SST ${a.anio}`, empresa: e, anio: a.anio };
}
