// Informe de diagnóstico inicial del SG-SST, membreteado por la consultora (PROCESST) y firmado por su profesional.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";
import { valorar } from "@/lib/evaluacion";
import { CICLOS, calcularDiagnostico, rutaImplementacion, type ItemDiag } from "@/lib/diagnostico";
import { docTexto } from "@/lib/documento-identidad";

const c = (t: unknown) => String(t ?? "").replace(/\|/g, "/").replace(/\n/g, " ");
const fecha = (d: Date) => d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const color = (p: number | null) => (p == null ? "#94a3b8" : p < 60 ? "#dc2626" : p <= 85 ? "#f59e0b" : "#16a34a");

/** Barras horizontales por ciclo PHVA. */
function graficaCiclos(porCiclo: Record<string, { pct: number | null }>) {
  const filas = CICLOS.map((x, i) => {
    const p = porCiclo[x.k]?.pct; const y = 18 + i * 34; const w = Math.round(((p ?? 0) / 100) * 330);
    return `<text x="0" y="${y + 14}" font-size="12" fill="#334155">${x.t}</text><rect x="90" y="${y}" width="330" height="20" rx="4" fill="#e2e8f0"/><rect x="90" y="${y}" width="${w}" height="20" rx="4" fill="${color(p ?? null)}"/><text x="430" y="${y + 14}" font-size="12" font-weight="bold" fill="#0f172a">${p == null ? "N/A" : `${p} %`}</text>`;
  }).join("");
  return `<div style="margin:6pt 0 12pt"><svg width="480" height="160" viewBox="0 0 480 160" xmlns="http://www.w3.org/2000/svg">${filas}</svg></div>`;
}

/** Indicador circular del puntaje global. */
function graficaGlobal(pct: number, valoracion: string) {
  const r = 52, cfun = 2 * Math.PI * r, lleno = (pct / 100) * cfun;
  return `<div style="display:flex;align-items:center;gap:18pt;margin:6pt 0 12pt"><svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg"><circle cx="70" cy="70" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="14"/><circle cx="70" cy="70" r="${r}" fill="none" stroke="${color(pct)}" stroke-width="14" stroke-dasharray="${lleno} ${cfun}" transform="rotate(-90 70 70)" stroke-linecap="round"/><text x="70" y="76" text-anchor="middle" font-size="24" font-weight="bold" fill="#0f172a">${Math.round(pct)}%</text></svg><div><div style="font-size:9pt;color:#64748b">Valoración (Res. 0312/2019 art. 28)</div><div style="font-size:16pt;font-weight:bold;color:${color(pct)}">${valoracion}</div></div></div>`;
}

export async function informeDiagnostico(diagnosticoId: string) {
  const dg = await db.diagnostico.findUniqueOrThrow({ where: { id: diagnosticoId }, include: { empresa: { include: { consultora: true, sedes: true } } } });
  const e = dg.empresa, co = e.consultora;
  const items = (dg.items ?? []) as ItemDiag[];
  const cal = calcularDiagnostico(items, dg.nivel);
  const v = valorar(cal.puntaje);
  const ruta = rutaImplementacion(items, cal.valoracion);
  const brechas = items.filter((i) => i.estado === "no_cumple").sort((a, b) => b.puntaje - a.puntaje);
  const cumple = items.filter((i) => i.estado === "cumple");
  const obs = items.filter((i) => i.observacion.trim() && i.estado !== "no_aplica");
  const ROMANO = ["", "I", "II", "III", "IV", "V"];
  const md = `## Datos de la empresa diagnosticada

| Campo | |
|---|---|
| Empresa | ${c(e.razonSocial)} — NIT ${c(e.nit)} |
| Actividad económica | ${c(e.descripcionActividad || e.ciiu || "—")} |
| Clase de riesgo | ${ROMANO[e.claseRiesgo] ?? e.claseRiesgo} |
| Trabajadores | ${e.nTrabajadoresPlanta + e.nEnMision} |
| Estándares mínimos que aplican | ${dg.nivel} (Resolución 0312 de 2019) |
| Ciudad | ${c(e.ciudad || e.sedes[0]?.ciudad || "—")} |
| Fecha del diagnóstico | ${fecha(dg.fecha)} |

## Objetivo y metodología

Establecer el estado actual del Sistema de Gestión de la Seguridad y Salud en el Trabajo de **${c(e.razonSocial)}** frente a los estándares mínimos que le aplican (Resolución 0312 de 2019) y el Decreto 1072 de 2015, como línea base para su diseño e implementación (evaluación inicial, art. 2.2.4.6.16).

Se verificó cada estándar mediante revisión de documentos, entrevistas y observación. La calificación usa la tabla de valores de la Resolución 0312 de 2019 (arts. 27 y 28): cada estándar que se cumple o no aplica (justificado) suma su peso.

## Resultado general

[[GLOBAL]]

| Resultado | |
|---|---|
| Estándares evaluados | ${cal.total} |
| Cumplen | ${cumple.length} |
| No cumplen | ${brechas.length} |
| No aplican | ${items.filter((i) => i.estado === "no_aplica").length} |
| Puntaje | ${cal.puntaje} % |
| Valoración | ${cal.valoracion} |

**Qué implica:** ${v.accion}

## Cumplimiento por ciclo PHVA

[[CICLOS]]

| Ciclo | Qué incluye | Cumplimiento | Brechas |
|---|---|---|---|
${CICLOS.map((x) => `| ${x.t} | ${x.d} | ${cal.porCiclo[x.k]?.pct == null ? "N/A" : `${cal.porCiclo[x.k].pct} %`} | ${cal.porCiclo[x.k]?.noCumple ?? 0} |`).join("\n")}

## Brechas encontradas (por peso)

${brechas.length ? `| Estándar | Qué falta | Peso | Qué se debe evidenciar |
|---|---|---|---|
${brechas.map((b) => `| ${b.codigo} | ${c(b.descripcion)}${b.observacion ? ` — ${c(b.observacion)}` : ""} | ${b.puntaje} | ${c(b.modo)} |`).join("\n")}` : "No se encontraron brechas."}

${cumple.length ? `## Fortalezas

La empresa ya cumple ${cumple.length} estándar(es), entre ellos: ${cumple.slice(0, 10).map((x) => `${x.codigo} ${c(x.descripcion)}`).join("; ")}${cumple.length > 10 ? "…" : ""}.
` : ""}
${obs.length ? `## Observaciones de la visita

${obs.map((o) => `- **${o.codigo}:** ${c(o.observacion)}`).join("\n")}
` : ""}
## Ruta de implementación propuesta

${ruta.map((f) => `### Fase ${f.fase}. ${f.nombre} (${f.plazo})

${f.que}${f.brechas.length ? `

${f.brechas.map((b) => `- ${b.codigo} ${c(b.actividad || b.descripcion)}`).join("\n")}` : "\n\nSin brechas en esta fase."}`).join("\n\n")}

${cal.valoracion === "CRÍTICO" ? "Por la valoración crítica, el plan de mejoramiento debe tenerse de inmediato y reportar avances a la ARL en máximo tres meses (Resolución 0312 de 2019, art. 28)." : ""}

## Conclusiones de la consultora

${c(dg.conclusiones || "______")}

Este diagnóstico es la línea base para diseñar el SG-SST y medir su avance en las autoevaluaciones siguientes.

______________________________________
**${c(co?.profesional || "Profesional en SST")}** — ${c(co?.cargo || "Consultora en SST")}${co?.licenciaSst ? `, licencia SST ${c(co.licenciaSst)}` : ""} — ${docTexto(co?.tipoDoc, co?.cedula)}
`;
  const logo = await readFile(join(process.cwd(), "public", "brand", "logo.png")).catch(() => null);
  return {
    md, empresa: e, consultora: co,
    meta: {
      codigo: "DIAG", nombre: `Diagnóstico inicial del SG-SST — ${e.razonSocial}`, version: 1, fecha: fecha(dg.fecha),
      empresa: co?.nombre || "PROCESST", nit: co?.nit || "", elaboro: co?.profesional || "", aprobo: [co?.correo, co?.telefono].filter(Boolean).join(" · ") || "PROCESST",
      sistema: "PROCESST — CONSULTORÍA EN SEGURIDAD Y SALUD EN EL TRABAJO",
      logo: logo ? { buf: logo, tipo: "png" as const, ancho: 120, alto: 30 } : null,
      insertar: { GLOBAL: graficaGlobal(cal.puntaje, cal.valoracion), CICLOS: graficaCiclos(cal.porCiclo) },
    },
  };
}
