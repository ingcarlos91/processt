import { plazos, type Plazo } from "@/lib/eventos";

export type PlazoUI = Omit<Plazo, "vence" | "hecho"> & { vence: string; hecho: string | null };
export const aPlazosUI = (ps: Plazo[]): PlazoUI[] => ps.map((p) => ({ ...p, vence: p.vence.toISOString(), hecho: p.hecho?.toISOString() ?? null }));
export const plazosUI = (...a: Parameters<typeof plazos>) => aPlazosUI(plazos(...a));
