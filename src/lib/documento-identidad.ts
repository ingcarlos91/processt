// Tipos de documento de identidad usados en Colombia. Se muestran con su abreviatura en documentos y firmas.
export const TIPOS_DOC = [
  { valor: "CC", etiqueta: "Cédula de ciudadanía", abrev: "C.C." },
  { valor: "CE", etiqueta: "Cédula de extranjería", abrev: "C.E." },
  { valor: "PA", etiqueta: "Pasaporte", abrev: "Pasaporte" },
  { valor: "PPT", etiqueta: "Permiso por Protección Temporal (PPT)", abrev: "PPT" },
  { valor: "PEP", etiqueta: "Permiso Especial de Permanencia (PEP)", abrev: "PEP" },
  { valor: "TI", etiqueta: "Tarjeta de identidad", abrev: "T.I." },
] as const;

export const abrevDoc = (tipo?: string | null) => TIPOS_DOC.find((t) => t.valor === tipo)?.abrev ?? "C.C.";

/** "C.C. 1061751421", "C.E. 345678"… Sin número deja la línea para llenar a mano. */
export function docTexto(tipo?: string | null, numero?: string | null) {
  const n = (numero ?? "").trim();
  return `${abrevDoc(tipo)} ${n || "______________"}`;
}

/** Reconoce el documento al inicio de un texto de firma (C.C., C.E., Pasaporte, PPT, PEP, T.I.). */
export const RE_DOC = /^(C\.?\s?C\.?|C\.?\s?E\.?|Pasaporte|PPT|PEP|T\.?\s?I\.?)(\s|$)/i;
