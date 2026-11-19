// Escalas y cálculo de la GTC 45 (2012).
export const ND = [
  { valor: 10, etiqueta: "Muy alto (10)" }, { valor: 6, etiqueta: "Alto (6)" },
  { valor: 2, etiqueta: "Medio (2)" }, { valor: 0, etiqueta: "Bajo (sin valor)" },
];
export const NE = [
  { valor: 4, etiqueta: "Continua (4)" }, { valor: 3, etiqueta: "Frecuente (3)" },
  { valor: 2, etiqueta: "Ocasional (2)" }, { valor: 1, etiqueta: "Esporádica (1)" },
];
export const NC = [
  { valor: 100, etiqueta: "Mortal o catastrófico (100)" }, { valor: 60, etiqueta: "Muy grave (60)" },
  { valor: 25, etiqueta: "Grave (25)" }, { valor: 10, etiqueta: "Leve (10)" },
];
export const CLASIFICACIONES = ["Biologico", "Fisico", "Quimico", "Psicosocial", "Biomecanico", "Condiciones de seguridad", "Fenomenos naturales"] as const;
export const CLASIFICACION_ETIQUETA: Record<string, string> = {
  Biologico: "Biológico", Fisico: "Físico", Quimico: "Químico", Psicosocial: "Psicosocial", Biomecanico: "Biomecánico",
  "Condiciones de seguridad": "Condiciones de seguridad", "Fenomenos naturales": "Fenómenos naturales",
};

export function interpretarNP(np: number) {
  if (np >= 24) return "Muy alto";
  if (np >= 10) return "Alto";
  if (np >= 6) return "Medio";
  return "Bajo";
}

export function nivelRiesgo(nr: number): "I" | "II" | "III" | "IV" {
  if (nr >= 600) return "I";
  if (nr >= 150) return "II";
  if (nr >= 40) return "III";
  return "IV";
}

export const ACEPTABILIDAD: Record<string, string> = {
  I: "No aceptable",
  II: "No aceptable o aceptable con control específico",
  III: "Mejorable",
  IV: "Aceptable",
};
export const SIGNIFICADO_NR: Record<string, string> = {
  I: "Situación crítica. Suspender actividades hasta que el riesgo esté bajo control. Intervención urgente.",
  II: "Corregir y adoptar medidas de control de inmediato.",
  III: "Mejorar si es posible. Justificar la intervención y su rentabilidad.",
  IV: "Mantener las medidas de control existentes.",
};

export function calcular(nd: number, ne: number, nc: number) {
  // GTC 45: con ND bajo no se asigna valor; se trata como riesgo aceptable.
  const np = nd * ne;
  const nr = np * nc;
  const nivel = nd === 0 ? "IV" : nivelRiesgo(nr);
  return { np, interpNp: nd === 0 ? "Bajo" : interpretarNP(np), nr, nivel, aceptabilidad: ACEPTABILIDAD[nivel] };
}

export const COLOR_NIVEL: Record<string, string> = {
  I: "bg-red-600 text-white", II: "bg-orange-500 text-white", III: "bg-yellow-300 text-black", IV: "bg-green-600 text-white",
};
