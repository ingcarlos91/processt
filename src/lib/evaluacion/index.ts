// Calificación de estándares mínimos — Resolución 0312 de 2019, arts. 27 y 28.
// Art. 27: los ítems que no aplican reciben el porcentaje máximo. Para las empresas de menos de 50 trabajadores
// con riesgo I, II o III (7 y 21 estándares) los ítems que no les corresponden también son "no aplica", así que
// el puntaje es 100 menos lo que se deja de cumplir en los ítems que sí les aplican.
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
  const perdido = maximo - obtenido;
  // Puntos de los ítems evaluados (sin los que no le corresponden al nivel).
  const puntajeBruto = Math.round(obtenido * 100) / 100;
  // Puntaje del art. 27 sobre 100: los ítems que no le corresponden al nivel suman su máximo.
  const puntajeAjustado = items.length ? Math.round((100 - perdido) * 100) / 100 : 0;
  const puntaje = nivel === 60 ? puntajeBruto : puntajeAjustado;
  const pendientes = items.filter((i) => i.estado === "PENDIENTE").length;
  // Ítems marcados "No aplica" en nivel 60 (por recalificar): cuentan como no cumplidos.
  const noAplicaInvalidos = nivel === 60 ? items.filter((i) => i.estado.toUpperCase() === "NO_APLICA").map((i) => i.codigo) : [];
  return { puntajeBruto, puntajeAjustado, puntaje, maximo, obtenido, noAplicanPorNivel: Math.round((100 - maximo) * 100) / 100, pendientes, noAplicaInvalidos, ...valorar(puntaje) };
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
