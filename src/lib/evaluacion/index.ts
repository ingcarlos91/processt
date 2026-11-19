// Calificación de estándares mínimos — Resolución 0312 de 2019, arts. 27 y 28.
// "No aplica" justificado otorga el puntaje máximo del ítem (art. 27).
export type ItemEval = { codigo: string; puntaje: number; estado: string };

export function calificar(items: ItemEval[], nivel: number) {
  const aplicables = items;
  const maximo = aplicables.reduce((s, i) => s + i.puntaje, 0);
  const obtenido = aplicables.reduce((s, i) => s + (i.estado === "CUMPLE" || i.estado === "NO_APLICA" ? i.puntaje : 0), 0);
  // Para nivel 60 el máximo es 100. Para 7/21 se normaliza sobre el máximo de los ítems aplicables.
  const puntajeBruto = Math.round(obtenido * 100) / 100;
  const puntajeAjustado = maximo ? Math.round((obtenido / maximo) * 10000) / 100 : 0;
  const puntaje = nivel === 60 ? puntajeBruto : puntajeAjustado;
  const pendientes = items.filter((i) => i.estado === "PENDIENTE").length;
  return { puntajeBruto, puntajeAjustado, puntaje, maximo, obtenido, pendientes, ...valorar(puntaje) };
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
