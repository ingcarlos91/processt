// Calificación de estándares mínimos — Resolución 0312 de 2019, arts. 27 y 28.
// En 7 y 21 estándares la empresa se califica sobre los ítems de su nivel (arts. 3 y 9): puntos obtenidos sobre el
// valor de esos ítems, llevado a 100. Un ítem de su nivel que de verdad no aplique, con justificación, recibe su
// valor máximo (art. 27). Los estándares que no le corresponden al nivel NO se suman: hacerlo daría "aceptable" a
// una empresa que no cumple nada (corregido el 20 nov 2026).
// En 60 estándares no hay "No aplica": los 60 ítems aplican a la empresa (Res. 0312/2019 art. 16) y la regla del
// porcentaje máximo del art. 27 es solo para menos de 50 trabajadores con riesgo I, II o III. Un "No aplica" que ya
// esté registrado en nivel 60 cuenta como no cumplido hasta que se recalifique.
export type ItemEval = { codigo: string; puntaje: number; estado: string };

/** ¿El estado suma los puntos del ítem? En nivel 60 solo "cumple"; en 7 y 21 también "no aplica" (justificado). */
export function sumaPuntos(estado: string, nivel: number) {
  const e = estado.toUpperCase();
  return e === "CUMPLE" || (e === "NO_APLICA" && nivel !== 60);
}

/** "No aplica" solo se ofrece en 7 y 21 estándares (Res. 0312/2019 arts. 16 y 27). */
export const permiteNoAplica = (nivel: number) => nivel !== 60;

export function calificar(items: ItemEval[], nivel: number) {
  const maximo = items.reduce((s, i) => s + i.puntaje, 0);
  const obtenido = items.reduce((s, i) => s + (sumaPuntos(i.estado, nivel) ? i.puntaje : 0), 0);
  // Puntos obtenidos en los ítems del nivel.
  const puntajeBruto = Math.round(obtenido * 100) / 100;
  // Sobre 100: obtenido / valor de los ítems del nivel (en 60 estándares el valor total ya es 100).
  const puntajeAjustado = maximo ? Math.round((obtenido / maximo) * 10000) / 100 : 0;
  const puntaje = nivel === 60 ? puntajeBruto : puntajeAjustado;
  const pendientes = items.filter((i) => i.estado === "PENDIENTE").length;
  // Ítems marcados "No aplica" en nivel 60 (por recalificar): cuentan como no cumplidos.
  const noAplicaInvalidos = nivel === 60 ? items.filter((i) => i.estado.toUpperCase() === "NO_APLICA").map((i) => i.codigo) : [];
  return { puntajeBruto, puntajeAjustado, puntaje, maximo, obtenido, pendientes, noAplicaInvalidos, ...valorar(puntaje) };
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
