import ExcelJS from "exceljs";
import type { Contexto } from "./contexto";

const COLOR: Record<string, string> = { I: "FFDC2626", II: "FFF97316", III: "FFFDE047", IV: "FF16A34A" };
const NAVY = "FF22314F";

function encabezado(ws: ExcelJS.Worksheet, titulo: string, ctx: Contexto, columnas: number) {
  ws.mergeCells(1, 1, 1, columnas);
  ws.getCell(1, 1).value = titulo;
  ws.getCell(1, 1).font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  ws.getCell(1, 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
  ws.mergeCells(2, 1, 2, columnas);
  ws.getCell(2, 1).value = `${ctx.empresa.razonSocial} — NIT ${ctx.empresa.nit} — ${ctx.empresa.actividad} — Fecha: ${ctx.fecha} — Elaboró: ${ctx.consultora.profesional} (Licencia SST ${ctx.consultora.licencia})`;
}

export async function matrizXlsx(ctx: Contexto) {
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
  encabezado(ws, "MATRIZ DE IDENTIFICACIÓN DE PELIGROS, EVALUACIÓN Y VALORACIÓN DE RIESGOS (GTC 45)", ctx, total);
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
    ["Nivel de riesgo (NR = ND × NE × NC)"], ["I", "4000 - 600", "No aceptable"], ["II", "500 - 150", "No aceptable o aceptable con control específico"], ["III", "120 - 40", "Mejorable"], ["IV", "20", "Aceptable"],
  ]);
  esc.getColumn(1).width = 30; esc.getColumn(2).width = 20; esc.getColumn(3).width = 45;
  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function evaluacionXlsx(ctx: Contexto) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Tabla de valores");
  encabezado(ws, "AUTOEVALUACIÓN DE ESTÁNDARES MÍNIMOS — RESOLUCIÓN 0312 DE 2019", ctx, 6);
  ws.addRow([]);
  const h = ws.addRow(["Ítem", "Estándar", "Valor", "Calificación", "Puntaje obtenido", "Observación"]);
  h.eachCell((c) => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } }; });
  const ev = ctx.evaluacion as { items: { codigo: string; descripcion: string; puntaje: number; estado: string; obtenido: number; observacion: string }[]; puntaje?: number; valoracion?: string; accion?: string };
  for (const i of ev.items) ws.addRow([i.codigo, i.descripcion, i.puntaje, i.estado, i.obtenido, i.observacion]).eachCell((c) => (c.alignment = { wrapText: true, vertical: "top" }));
  ws.addRow([]);
  ws.addRow(["", "PUNTAJE TOTAL (%)", "", "", ev.puntaje ?? ""]).font = { bold: true };
  ws.addRow(["", "VALORACIÓN", "", "", ev.valoracion ?? ""]).font = { bold: true };
  ws.addRow(["", "ACCIÓN (Res. 0312 art. 28)", ev.accion ?? ""]);
  [8, 70, 8, 16, 14, 40].forEach((w, i) => (ws.getColumn(i + 1).width = w));

  const pm = wb.addWorksheet("Plan de mejoramiento");
  const hp = pm.addRow(["Estándar", "Actividad", "Responsable", "Fecha límite", "Recursos", "Soporte de efectividad"]);
  hp.eachCell((c) => { c.font = { bold: true, color: { argb: "FFFFFFFF" } }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } }; });
  for (const p of ctx.planMejora) pm.addRow([p.estandar, p.actividad, p.responsable, p.fecha, p.recursos, p.soporte]).eachCell((c) => (c.alignment = { wrapText: true, vertical: "top" }));
  [10, 50, 22, 16, 24, 50].forEach((w, i) => (pm.getColumn(i + 1).width = w));
  return Buffer.from(await wb.xlsx.writeBuffer());
}
