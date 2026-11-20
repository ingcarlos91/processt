import { db } from "@/lib/db";
import { alcanceBiblioteca } from "@/lib/alcance-biblioteca";

export type Entidades = { arl: string[]; eps: string[]; afp: string[]; escolaridad: string[] };

/** EPS, fondos de pensiones, ARL y escolaridad de la biblioteca global, en el orden definido. */
/** Base PROCESST más lo que agregó la consultora (sin consultora: solo la base). */
export async function cargarEntidades(consultoraId?: string): Promise<Entidades> {
  const xs = await db.catalogoItem.findMany({ where: { ...(consultoraId ? alcanceBiblioteca(consultoraId) : { consultoraId: null, empresaId: null }), tipo: { in: ["ARL", "EPS", "AFP", "ESCOLARIDAD"] } }, select: { tipo: true, nombre: true, detalle: true } });
  const orden = (d: unknown) => Number((d as { orden?: number })?.orden ?? 999);
  const de = (t: string) => xs.filter((x) => x.tipo === t).sort((a, b) => orden(a.detalle) - orden(b.detalle) || a.nombre.localeCompare(b.nombre)).map((x) => x.nombre);
  return { arl: de("ARL"), eps: de("EPS"), afp: de("AFP"), escolaridad: de("ESCOLARIDAD") };
}
