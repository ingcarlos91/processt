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

const ND_TXT: Record<number, string> = { 10: "Muy alto: no hay controles o no sirven", 6: "Alto: los controles existentes son poco eficaces", 2: "Medio: los controles funcionan a medias", 0: "Bajo: los controles son eficaces" };
const NE_TXT: Record<number, string> = { 4: "Continua: varias veces al día por tiempo prolongado", 3: "Frecuente: varias veces al día por poco tiempo", 2: "Ocasional: alguna vez al día por poco tiempo", 1: "Esporádica: de vez en cuando" };
const NC_TXT: Record<number, string> = { 100: "Mortal o catastrófico", 60: "Muy grave: lesión permanente o invalidez", 25: "Grave: incapacidad temporal", 10: "Leve: sin incapacidad" };

/** Explica paso a paso cómo se obtuvo el nivel de riesgo (GTC 45). */
export function explicarRiesgo(nd: number, ne: number, nc: number) {
  const c = calcular(nd, ne, nc);
  return {
    ...c,
    pasos: [
      `Deficiencia (ND) = ${nd}: ${ND_TXT[nd] ?? ""}.`,
      `Exposición (NE) = ${ne}: ${NE_TXT[ne] ?? ""}.`,
      nd === 0 ? "Con deficiencia baja la GTC 45 no asigna valor: el riesgo se considera aceptable." : `Probabilidad (NP) = ND × NE = ${nd} × ${ne} = ${c.np} → ${c.interpNp}.`,
      `Consecuencia (NC) = ${nc}: ${NC_TXT[nc] ?? ""}.`,
      nd === 0 ? "" : `Riesgo (NR) = NP × NC = ${c.np} × ${nc} = ${c.nr} → Nivel ${c.nivel}.`,
      `Nivel ${c.nivel}: ${SIGNIFICADO_NR[c.nivel]} Aceptabilidad: ${c.aceptabilidad}.`,
    ].filter(Boolean),
  };
}
