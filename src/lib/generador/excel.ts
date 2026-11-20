import ExcelJS from "exceljs";
import type { Contexto } from "./contexto";
import { leerLogo } from "@/lib/logos";
import { SIGNIFICADO_NR } from "@/lib/gtc45";

const COLOR: Record<string, string> = { I: "FFDC2626", II: "FFF97316", III: "FFFDE047", IV: "FF16A34A" };
const NAVY = "FF22314F";

async function ponerLogo(wb: ExcelJS.Workbook, ws: ExcelJS.Worksheet, ctx: Contexto, columna: number) {
  const l = await leerLogo(ctx.empresa.logoUrl, { ancho: 160, alto: 40 });
  if (!l) return;
  const id = wb.addImage({ buffer: l.buf as unknown as ExcelJS.Buffer, extension: l.tipo === "png" ? "png" : "jpeg" });
  ws.addImage(id, { tl: { col: columna, row: 0.1 }, ext: { width: l.ancho, height: l.alto } });
}

function encabezado(ws: ExcelJS.Worksheet, titulo: string, ctx: Contexto, columnas: number, extra = "") {
  ws.mergeCells(1, 1, 1, columnas);
  ws.getCell(1, 1).value = titulo;
  ws.getCell(1, 1).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  ws.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  ws.getCell(1, 1).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  ws.getRow(1).height = 34;
  // Impresión: carta horizontal, ajustada al ancho de la hoja; el encabezado se repite en cada página.
  ws.pageSetup = { paperSize: 1 as ExcelJS.PageSetup["paperSize"], orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 } };
  ws.mergeCells(2, 1, 2, columnas);
  ws.getCell(2, 1).value = `${ctx.empresa.razonSocial} — NIT ${ctx.empresa.nit} — ${ctx.empresa.actividad} — Fecha: ${ctx.fecha} — Elaboró: ${ctx.responsable.nombre}${ctx.responsable.licencia ? ` (Licencia SST ${ctx.responsable.licencia})` : ""}${extra ? ` — ${extra}` : ""}`;
}

/** Matriz GTC 45 en Excel. Con `version`, exporta esa versión cerrada (sus filas ya vienen en ctx.matriz.filas). */
export async function matrizXlsx(ctx: Contexto, version?: { numero: number; fecha: string; motivo: string } | null) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "PROCESST";
  const ws = wb.addWorksheet("Matriz GTC 45", { views: [{ state: "frozen", ySplit: 5, xSplit: 4 }] });
  const grupos: [string, string[]][] = [
    ["Proceso y tarea", ["Proceso", "Zona / lugar", "Actividad", "Tarea", "Rutinaria"]],
    ["Peligro", ["Descripción", "Clasificación"]],
    ["", ["Efectos posibles"]],
    ["Controles existentes", ["Fuente", "Medio", "Individuo"]],
    ["Evaluación del riesgo", ["ND", "NE", "NP", "Interpretación NP", "NC", "NR", "Nivel de riesgo"]],
    ["Valoración", ["Aceptabilidad"]],
    ["Criterios para establecer controles", ["N.º expuestos", "Peor consecuencia", "Requisito legal específico"]],
    ["Medidas de intervención", ["Eliminación", "Sustitución", "Controles de ingeniería", "Controles administrativos, señalización", "EPP"]],
  ];
  const total = grupos.reduce((s, g) => s + g[1].length, 0);
  const v = version ?? null;
  encabezado(ws, `MATRIZ DE IDENTIFICACIÓN DE PELIGROS, EVALUACIÓN Y VALORACIÓN DE RIESGOS (GTC 45)${v ? ` — VERSIÓN ${v.numero}` : ""}`, ctx, total,
    v ? `Versión ${v.numero} cerrada el ${v.fecha} (${v.motivo})` : ctx.matriz.version ? `Matriz vigente; última versión cerrada: v${ctx.matriz.version.numero} el ${ctx.matriz.version.fecha}` : "Versión en elaboración");
  ws.getRow(1).height = 36;
  await ponerLogo(wb, ws, ctx, total - 2);
  let col = 1;
  for (const [g, cols] of grupos) {
    if (cols.length > 1) ws.mergeCells(4, col, 4, col + cols.length - 1);
    ws.getCell(4, col).value = g;
    cols.forEach((c, i) => (ws.getCell(5, col + i).value = c));
    col += cols.length;
  }
  for (const r of [4, 5]) ws.getRow(r).eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 };
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: r === 4 ? NAVY : "FF1680B0" } };
    c.alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
  });
  for (const f of ctx.matriz.filas) {
    const row = ws.addRow([
      f.proceso, f.zona, f.actividad, f.tarea, f.rutinaria, f.descripcion, f.clasificacion, f.efectos,
      f.controlesFuente, f.controlesMedio, f.controlesIndividuo, f.nd, f.ne, f.np, f.interpNp, f.nc, f.nr, f.nivelRiesgo,
      f.aceptabilidad, f.expuestos, f.peorConsecuencia, f.requisitoLegal, f.eliminacion, f.sustitucion, f.ingenieria, f.administrativa, f.epp,
    ]);
    row.eachCell((c) => { c.alignment = { wrapText: true, vertical: "top" }; c.font = { size: 9 }; c.border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } }; });
    const nivel = row.getCell(18);
    nivel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR[f.nivelRiesgo] } };
    nivel.font = { bold: true, size: 9, color: { argb: f.nivelRiesgo === "III" ? "FF000000" : "FFFFFFFF" } };
    nivel.alignment = { horizontal: "center", vertical: "top" };
  }
  const anchos = [18, 16, 18, 24, 8, 34, 16, 30, 18, 18, 18, 5, 5, 5, 10, 5, 7, 7, 18, 8, 16, 9, 22, 22, 26, 30, 24];
  anchos.forEach((w, i) => (ws.getColumn(i + 1).width = w));
  ws.getRow(5).height = 30;

  const esc = wb.addWorksheet("Escalas GTC 45");
  esc.addRows([
    ["Nivel de deficiencia (ND)"], ["Muy alto", 10], ["Alto", 6], ["Medio", 2], ["Bajo", "No se asigna valor"], [],
    ["Nivel de exposición (NE)"], ["Continua", 4], ["Frecuente", 3], ["Ocasional", 2], ["Esporádica", 1], [],
    ["Nivel de consecuencia (NC)"], ["Mortal o catastrófico", 100], ["Muy grave", 60], ["Grave", 25], ["Leve", 10], [],
    ["Nivel de probabilidad (NP = ND × NE)", "Valor de NP", "Significado"],
    ["Muy alto (MA)", "40 - 24", "Situación deficiente con exposición continua, o muy deficiente con exposición frecuente. Normalmente la materialización del riesgo ocurre con frecuencia."],
    ["Alto (A)", "20 - 10", "Situación deficiente con exposición frecuente u ocasional, o muy deficiente con exposición ocasional o esporádica. Es posible que suceda el daño alguna vez en la vida laboral."],
    ["Medio (M)", "8 - 6", "Situación deficiente con exposición esporádica, o mejorable con exposición continua o frecuente. Es posible que suceda el daño alguna vez."],
    ["Bajo (B)", "4 - 2", "Situación mejorable con exposición ocasional o esporádica, o situación sin anomalía destacable con cualquier nivel de exposición. No es esperable que se materialice el riesgo, aunque puede ser concebible."],
    [],
    ["Nivel de riesgo (NR = NP × NC; NP = ND × NE)", "Valor de NR", "Significado", "Aceptabilidad"],
    ["I", "4000 - 600", SIGNIFICADO_NR.I, "No aceptable"], ["II", "500 - 150", SIGNIFICADO_NR.II, "No aceptable o aceptable con control específico"], ["III", "120 - 40", SIGNIFICADO_NR.III, "Mejorable"], ["IV", "20", SIGNIFICADO_NR.IV, "Aceptable"],
    [],
    ["Fuente: GTC 45 de 2012 (ICONTEC), tablas 2 a 8. Metodología adoptada por la empresa (Decreto 1072/2015 art. 2.2.4.6.15)."],
  ]);
  esc.getColumn(1).width = 34; esc.getColumn(2).width = 18; esc.getColumn(3).width = 80; esc.getColumn(4).width = 40;
  esc.eachRow((r) => {
    r.eachCell((c) => (c.alignment = { wrapText: true, vertical: "top" }));
    if (typeof r.getCell(1).value === "string" && /^Nivel /.test(r.getCell(1).value as string)) r.font = { bold: true };
    const n = r.getCell(1).value;
    if (typeof n === "string" && COLOR[n] && r.cellCount >= 3) { r.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLOR[n] } }; r.getCell(1).font = { bold: true, color: { argb: n === "III" ? "FF000000" : "FFFFFFFF" } }; }
  });
  return Buffer.from(await wb.xlsx.writeBuffer());
}

/**
 * Tabla de valores de la autoevaluación (Res. 0312/2019 art. 27): ciclo PHVA, grupo con su peso, ítem, valor,
 * calificación y justificación del "No aplica". En 7 y 21 estándares se listan también los ítems que no le
 * corresponden a la empresa, con su valor máximo, para que el total quede sobre 100. Cierra con fecha y firmas.
 * `ev`: la evaluación a exportar (por defecto, la última).
 */
export async function evaluacionXlsx(ctx: Contexto, ev: Contexto["evaluacion"] = ctx.evaluacion, planMejora: Contexto["planMejora"] = ctx.planMejora) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "PROCESST";
  const ws = wb.addWorksheet("Tabla de valores", { views: [{ state: "frozen", ySplit: 4 }] });
  const COLS = ["Ciclo PHVA", "Grupo (peso)", "Subgrupo (peso)", "Ítem", "Estándar", "Valor del ítem", "Calificación", "Puntaje obtenido", "Justificación del «No aplica»", "Observación"];
  const n = COLS.length;
  encabezado(ws, "AUTOEVALUACIÓN DE ESTÁNDARES MÍNIMOS DEL SG-SST — RESOLUCIÓN 0312 DE 2019 (TABLA DE VALORES, ART. 27)", ctx, n,
    ev.existe ? `${ev.tipo} del ${ev.fecha} — ${ev.nivel} estándares` : "Sin evaluación registrada");
  ws.getRow(1).height = 36;
  await ponerLogo(wb, ws, ctx, n - 2);
  const h = ws.getRow(4);
  COLS.forEach((c, k) => (h.getCell(k + 1).value = c));
  h.eachCell((c) => { c.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 9 }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } }; c.alignment = { wrapText: true, vertical: "middle", horizontal: "center" }; });
  h.height = 30;
  const CICLO: Record<string, string> = { PLANEAR: "I. Planear", HACER: "II. Hacer", VERIFICAR: "III. Verificar", ACTUAR: "IV. Actuar" };
  const CALIF: Record<string, string> = { Cumple: "Cumple totalmente", "No cumple": "No cumple", "No aplica": "No aplica (justificado)", "Sin evaluar": "Sin evaluar" };
  const borde = { top: { style: "thin" as const }, left: { style: "thin" as const }, bottom: { style: "thin" as const }, right: { style: "thin" as const } };
  const orden = (c: string) => c.split(".").map((x) => x.padStart(3, "0")).join(".");
  const filas = [
    ...ev.items.map((i) => ({ ...i, calif: CALIF[i.estado] ?? i.estado, just: i.justificacion, obs: i.observacion, gris: false })),
    ...ev.noCorresponden.map((i) => ({ ...i, calif: "No aplica (art. 27)", obtenido: i.puntaje, just: `No le corresponde a la empresa: ${ev.nivel} estándares por su número de trabajadores y clase de riesgo; recibe el valor máximo (Res. 0312/2019 art. 27).`, obs: "", gris: true })),
  ].sort((a, b) => orden(a.codigo).localeCompare(orden(b.codigo)));
  for (const f of filas) {
    const row = ws.addRow([CICLO[f.ciclo] ?? f.ciclo, f.grupo, f.subgrupo, f.codigo, f.descripcion, f.puntaje, f.calif, f.obtenido, f.just, f.obs]);
    row.eachCell({ includeEmpty: true }, (c) => { c.alignment = { wrapText: true, vertical: "top" }; c.font = { size: 9, color: f.gris ? { argb: "FF6B7280" } : undefined }; c.border = borde; });
    if (f.calif === "No cumple" || f.calif.startsWith("Sin evaluar") || f.calif.includes("no válido")) row.getCell(7).font = { size: 9, bold: true, color: { argb: "FFDC2626" } };
  }
  ws.addRow([]);
  const fila = (etiqueta: string, valor: string | number, negrita = true) => {
    const r = ws.addRow([]);
    ws.mergeCells(r.number, 1, r.number, 5); ws.mergeCells(r.number, 6, r.number, n);
    r.getCell(1).value = etiqueta; r.getCell(6).value = valor;
    r.getCell(1).font = { bold: true }; r.getCell(6).font = { bold: negrita };
    r.getCell(6).alignment = { wrapText: true, vertical: "top" };
    return r;
  };
  if (ev.existe) {
    const sumaItems = Math.round(ev.items.reduce((s, i) => s + i.puntaje, 0) * 100) / 100;
    fila("Valor de los ítems evaluados", `${sumaItems}${ev.noCorresponden.length ? ` + ${ev.puntajeNoCorresponden} de los ${ev.noCorresponden.length} ítems que no le corresponden = 100` : " (total posible 100)"}`, false);
    fila("PUNTAJE TOTAL (sobre 100 %)", ev.puntaje);
    fila("VALORACIÓN (Res. 0312/2019 art. 28)", ev.valoracion);
    fila("ACCIÓN EXIGIDA (Res. 0312/2019 art. 28)", ev.accion, false).height = 45;
    if (ev.pendientes) fila("ÍTEMS SIN EVALUAR", `${ev.pendientes}: cuentan como no cumplidos; la autoevaluación se cierra con todos calificados (art. 27).`, false);
    if (ev.nivel === 60 && ev.items.some((i) => i.estado.startsWith("No aplica"))) fila("ATENCIÓN", "En 60 estándares no existe «No aplica» (Res. 0312/2019 arts. 16 y 27): esos ítems cuentan como no cumplidos.", false);
  } else fila("Sin evaluación", "No hay evaluación de estándares mínimos registrada.", false);
  ws.addRow([]);
  fila("Fecha de la autoevaluación", ev.existe ? ev.fecha : "", false);
  ws.addRow([]); ws.addRow([]);
  const firmas = ws.addRow([]);
  ws.mergeCells(firmas.number, 1, firmas.number, 4); ws.mergeCells(firmas.number, 6, firmas.number, n);
  firmas.getCell(1).value = `______________________________\nRepresentante legal: ${ctx.empresa.representanteLegal}\n${ctx.empresa.representanteDoc}`;
  firmas.getCell(6).value = `______________________________\nResponsable del SG-SST: ${ctx.responsable.nombre}\n${ctx.responsable.doc}${ctx.responsable.licencia ? ` — Licencia SST ${ctx.responsable.licencia}` : ""}`;
  firmas.height = 60;
  [1, 6].forEach((k) => (firmas.getCell(k).alignment = { wrapText: true, vertical: "bottom" }));
  ws.addRow([]);
  const nota = ws.addRow([]);
  ws.mergeCells(nota.number, 1, nota.number, n);
  nota.getCell(1).value = "La autoevaluación se hace en diciembre de cada año (Res. 0312/2019 art. 26). Se registra con el plan de mejoramiento en la aplicación del Fondo de Riesgos Laborales (sgrl.mintrabajo.gov.co) con copia a la ARL, en el plazo que fije la circular de cada vigencia (vigencia 2025: hasta el 31 de julio de 2026, Circular 027/2026).";
  nota.getCell(1).font = { size: 8, italic: true }; nota.getCell(1).alignment = { wrapText: true }; nota.height = 30;
  [12, 22, 26, 7, 60, 9, 18, 10, 40, 34].forEach((w, k) => (ws.getColumn(k + 1).width = w));

  const pm = wb.addWorksheet("Plan de mejoramiento");
  const hp = pm.addRow(["Estándar", "Actividad", "Responsable", "Fecha límite", "Recursos", "Soporte de efectividad"]);
  hp.eachCell((c) => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } }; });
  for (const p of planMejora) pm.addRow([p.estandar, p.actividad, p.responsable, p.fecha, p.recursos, p.soporte]).eachCell((c) => (c.alignment = { wrapText: true, vertical: "top" }));
  [10, 50, 22, 16, 24, 50].forEach((w, k) => (pm.getColumn(k + 1).width = w));
  return Buffer.from(await wb.xlsx.writeBuffer());
}
