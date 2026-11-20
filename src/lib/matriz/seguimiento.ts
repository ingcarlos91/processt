// Implementación y verificación de las medidas de control de cada peligro (Res. 0312/2019 est. 4.2.1 y 4.2.2).
// Se guarda en PeligroEvaluado.seguimiento (Json). Las fechas van como "AAAA-MM-DD".

export const ESTADOS_MEDIDA = [
  { valor: "pendiente", etiqueta: "Pendiente" },
  { valor: "en_curso", etiqueta: "En implementación" },
  { valor: "implementada", etiqueta: "Implementada" },
] as const;

export const EFICAZ = [
  { valor: "si", etiqueta: "Sí" },
  { valor: "no", etiqueta: "No" },
  { valor: "parcial", etiqueta: "Parcialmente" },
] as const;

export type Seguimiento = {
  responsable?: string;
  fecha?: string; // fecha (prevista o real) de implementación
  estado?: string; // pendiente | en_curso | implementada
  verificadoFecha?: string; // fecha de la verificación en sitio
  metodo?: string; // observación directa, inspección, revisión de registros…
  resultado?: string;
  eficaz?: string; // si | no | parcial
};

const CAMPOS = ["responsable", "fecha", "estado", "verificadoFecha", "metodo", "resultado", "eficaz"] as const;

/** Normaliza lo que venga de la base o del formulario: solo campos conocidos y como texto recortado. */
export function leerSeguimiento(v: unknown): Seguimiento {
  const o = v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  const s: Seguimiento = {};
  for (const k of CAMPOS) if (typeof o[k] === "string" && (o[k] as string).trim()) s[k] = (o[k] as string).trim().slice(0, 1000);
  if (s.estado && !ESTADOS_MEDIDA.some((e) => e.valor === s.estado)) delete s.estado;
  if (s.eficaz && !EFICAZ.some((e) => e.valor === s.eficaz)) delete s.eficaz;
  for (const k of ["fecha", "verificadoFecha"] as const) if (s[k] && !/^\d{4}-\d{2}-\d{2}$/.test(s[k]!)) delete s[k];
  return s;
}

const fechaTexto = (iso?: string) => (iso ? iso.split("-").reverse().join("/") : "");

/** Textos listos para el documento (MTZ-02). */
export function seguimientoTexto(v: unknown) {
  const s = leerSeguimiento(v);
  const verificacion = [fechaTexto(s.verificadoFecha), s.metodo, s.resultado].filter(Boolean).join(" — ");
  return {
    responsable: s.responsable ?? "",
    fecha: fechaTexto(s.fecha),
    estado: ESTADOS_MEDIDA.find((e) => e.valor === s.estado)?.etiqueta ?? "",
    verificacion,
    eficaz: EFICAZ.find((e) => e.valor === s.eficaz)?.etiqueta ?? "",
    registrado: Object.keys(s).length > 0,
  };
}
