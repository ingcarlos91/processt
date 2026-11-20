import { avisoPlazo, fechaLarga, type ParametrosPlazos } from "@/lib/plazos";
import { plazos, type Plazo } from "@/lib/eventos";

export type PlazoUI = Omit<Plazo, "vence" | "hecho"> & { vence: string; hecho: string | null };
export const aPlazosUI = (ps: Plazo[]): PlazoUI[] => ps.map((p) => ({ ...p, vence: p.vence.toISOString(), hecho: p.hecho?.toISOString() ?? null }));
export const plazosUI = (...a: Parameters<typeof plazos>) => aPlazosUI(plazos(...a));

/** Tareas que se programan al registrar un evento con estos datos (para avisar antes y después de guardar). */
export function tareasDeEvento(d: { tipo: string; fecha: string; gravedad?: string; vinculacion?: string | null }, params?: ParametrosPlazos | null) {
  if (!d.fecha) return [];
  const ps = plazos({ tipo: d.tipo, fecha: new Date(d.fecha + "T12:00:00Z"), gravedad: d.gravedad ?? "leve", vinculacion: d.vinculacion ?? null, fechaReporte: null, reportadoArl: false, invEstado: "pendiente", invCierre: null, invRemitidaArl: null, reporteMinisterio: null }, new Date(), params);
  return ps.map((p) => ({ tarea: p.t, fecha: fechaLarga(p.vence), plazo: avisoPlazo(p.clave).plazo, norma: p.normaRef, tipo: "legal" as const }));
}
