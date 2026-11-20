import { valorPlazo } from "@/lib/plazos";
// Evaluaciones médicas ocupacionales — Resolución 1843 de 2025.
import { sumarHabiles } from "@/lib/eventos";
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

/**
 * Plazo para adaptar las condiciones de trabajo según las recomendaciones o restricciones:
 * máximo veinte (20) días hábiles después de la evaluación (Res. 1843/2025 art. 5 lit. f).
 */
export const DIAS_ADAPTACION = valorPlazo("adaptacion"); // catálogo src/lib/plazos.ts (Res. 1843/2025 art. 5 lit. f)
export const requiereAdaptacion = (concepto: string, restricciones?: string | null) =>
  concepto === "apto_recomendaciones" || concepto === "apto_restricciones" || (concepto !== "apto" && !!restricciones?.trim());
export const limiteAdaptacion = (fecha: Date) => sumarHabiles(fecha, DIAS_ADAPTACION);

/** Fecha (AAAA-MM-DD) más n meses. */
export const sumarMeses = (iso: string, n: number) => {
  const d = new Date(iso + "T12:00:00Z"); const dia = d.getUTCDate();
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n);
  d.setUTCDate(Math.min(dia, new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()));
  return d.toISOString().slice(0, 10);
};

/**
 * Periodicidad de las evaluaciones periódicas: la define la empresa con justificación técnica;
 * tres (3) años solo en caso excepcional (Res. 1843/2025 art. 15).
 */
export function avisoPeriodicidad(meses?: number | null, motivo?: string | null): string | null {
  if (!meses) return null;
  if (meses > 36) return "Supera tres (3) años, el máximo que la norma admite y solo en caso excepcional (Res. 1843/2025 art. 15).";
  if (meses > 12 && !motivo?.trim()) return "Más de 12 meses requiere justificación técnica según la exposición del cargo (Res. 1843/2025 art. 15).";
  return null;
}
export const textoPeriodicidad = (meses?: number | null) => (!meses ? "" : meses % 12 === 0 ? `Cada ${meses / 12 === 1 ? "año" : `${meses / 12} años`}` : `Cada ${meses} meses`);

/**
 * Los exámenes no se borran: el registro se conserva veinte (20) años (Decreto 1072/2015 art. 2.2.4.6.13).
 * Solo se permite borrar un error de captura el mismo día en que se registró.
 */
export const puedeBorrarExamen = (creadoEn: Date, ahora = new Date()) => ahora.getTime() - creadoEn.getTime() < 864e5;
