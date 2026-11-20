// Evaluaciones médicas ocupacionales — Resolución 1843 de 2025.
// Tipos: art. 8. Concepto: art. 19 (el parágrafo prohíbe "no apto" salvo en los regímenes especiales del art. 2).

export const TIPOS_EXAMEN: Record<string, string> = {
  ingreso: "Pre-ingreso", periodico: "Periódico", cambio_ocupacion: "Periódico por cambio de ocupación", retiro: "Egreso",
  post_incapacidad: "Post-incapacidad", retorno_laboral: "Retorno laboral", seguimiento: "Seguimiento o control",
};

/** Regímenes con certificado propio (Res. 1843/2025 art. 2 y art. 15 par. 1): solo en ellos se admite "no apto". */
export const REGIMENES_ESPECIALES: Record<string, string> = {
  alturas: "Trabajo en alturas", conduccion: "Conducción de vehículos", alimentos: "Manipulación de alimentos",
  armas: "Porte de armas de fuego", electrico: "Trabajo con energía eléctrica", confinados: "Espacios confinados",
};

export const CONCEPTOS_APTITUD: Record<string, string> = {
  apto: "Apto", apto_recomendaciones: "Apto con recomendaciones", apto_restricciones: "Apto con restricciones", aplazado: "Aplazado", no_apto: "No apto",
};

/** Conceptos que se pueden elegir según el examen: "no apto" solo si el examen es de un régimen especial. */
export const conceptosPermitidos = (regimen?: string | null) => Object.keys(CONCEPTOS_APTITUD).filter((k) => k !== "no_apto" || !!regimen);
