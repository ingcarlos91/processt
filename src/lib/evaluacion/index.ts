// Calificación de estándares mínimos — Resolución 0312 de 2019, arts. 27 y 28.
// Art. 27: los ítems que no aplican reciben el porcentaje máximo. Para las empresas de menos de 50 trabajadores
// con riesgo I, II o III (7 y 21 estándares) los ítems que no les corresponden también son "no aplica", así que
// el puntaje es 100 menos lo que se deja de cumplir en los ítems que sí les aplican.
export type ItemEval = { codigo: string; puntaje: number; estado: string };

export function calificar(items: ItemEval[], nivel: number) {
  const maximo = items.reduce((s, i) => s + i.puntaje, 0);
  const obtenido = items.reduce((s, i) => s + (i.estado === "CUMPLE" || i.estado === "NO_APLICA" ? i.puntaje : 0), 0);
  const perdido = maximo - obtenido;
  // Puntos de los ítems evaluados (sin los que no le corresponden al nivel).
  const puntajeBruto = Math.round(obtenido * 100) / 100;
  // Puntaje del art. 27 sobre 100: los ítems que no le corresponden al nivel suman su máximo.
  const puntajeAjustado = items.length ? Math.round((100 - perdido) * 100) / 100 : 0;
  const puntaje = nivel === 60 ? puntajeBruto : puntajeAjustado;
  const pendientes = items.filter((i) => i.estado === "PENDIENTE").length;
  return { puntajeBruto, puntajeAjustado, puntaje, maximo, obtenido, noAplicanPorNivel: Math.round((100 - maximo) * 100) / 100, pendientes, ...valorar(puntaje) };
}

export function valorar(p: number) {
  if (p < 60) return {
    valoracion: "CRÍTICO" as const,
    accion: "Realizar y tener a disposición del Ministerio del Trabajo un plan de mejoramiento de inmediato; enviar a la ARL un reporte de avances en máximo tres (3) meses; seguimiento anual y plan de visita del Ministerio del Trabajo.",
    mesesReporte: 3,
  };
  if (p <= 85) return {
    valoracion: "MODERADAMENTE ACEPTABLE" as const,
    accion: "Realizar y tener a disposición del Ministerio del Trabajo un plan de mejoramiento; enviar a la ARL un reporte de avances en máximo seis (6) meses; plan de visita del Ministerio del Trabajo.",
    mesesReporte: 6,
  };
  return {
    valoracion: "ACEPTABLE" as const,
    accion: "Mantener la calificación y evidencias a disposición del Ministerio del Trabajo, e incluir en el plan anual de trabajo las mejoras detectadas.",
    mesesReporte: 12,
  };
}

export const ESTADOS = [
  { valor: "CUMPLE", etiqueta: "Cumple totalmente" },
  { valor: "NO_CUMPLE", etiqueta: "No cumple" },
  { valor: "NO_APLICA", etiqueta: "No aplica (justificar)" },
  { valor: "PENDIENTE", etiqueta: "Sin evaluar" },
];
