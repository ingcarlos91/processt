import { db } from "@/lib/db";
import { alcanceBiblioteca } from "@/lib/alcance-biblioteca";

export type Medida = { descripcion: string; jerarquia: "eliminacion" | "sustitucion" | "ingenieria" | "administrativo" | "epp"; tipo: "correctiva" | "preventiva" | "mejora" };
export type FormaEvento = {
  id: string; nombre: string; descripcion: string; clasificaciones: string[]; claves: string[];
  actos: string[]; condiciones: string[]; personales: string[]; trabajo: string[]; medidas: Medida[];
  lesiones: string[]; agentes: string[]; partes: string[]; leccion: string;
};
export type ItemSimple = { id: string; nombre: string; descripcion: string; sugiereGrave?: boolean };
export type CatalogoAccidentes = { formas: FormaEvento[]; agentes: ItemSimple[]; lesiones: ItemSimple[]; partes: ItemSimple[] };

const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);

/** Biblioteca global de accidentes (Biblioteca → Accidentes). Ordenada como la definió la consultora. */
/** Base PROCESST más lo que agregó la consultora (sin consultora: solo la base). */
export async function cargarCatalogoAccidentes(consultoraId?: string): Promise<CatalogoAccidentes> {
  const items = await db.catalogoItem.findMany({ where: { ...(consultoraId ? alcanceBiblioteca(consultoraId) : { consultoraId: null, empresaId: null }), tipo: { in: ["FORMA_EVENTO", "AGENTE_EVENTO", "LESION", "PARTE_CUERPO"] } } });
  const orden = (d: unknown) => Number((d as { orden?: number })?.orden ?? 999);
  items.sort((a, b) => orden(a.detalle) - orden(b.detalle) || a.nombre.localeCompare(b.nombre));
  const simple = (t: string) => items.filter((i) => i.tipo === t).map((i) => ({ id: i.id, nombre: i.nombre, descripcion: i.descripcion ?? "", sugiereGrave: !!(i.detalle as { sugiereGrave?: boolean })?.sugiereGrave }));
  return {
    formas: items.filter((i) => i.tipo === "FORMA_EVENTO").map((i) => {
      const d = (i.detalle ?? {}) as Record<string, unknown>;
      return { id: i.id, nombre: i.nombre, descripcion: i.descripcion ?? "", clasificaciones: arr(d.clasificaciones), claves: arr(d.claves), actos: arr(d.actos), condiciones: arr(d.condiciones), personales: arr(d.personales), trabajo: arr(d.trabajo), medidas: (Array.isArray(d.medidas) ? d.medidas : []) as Medida[], lesiones: arr(d.lesiones), agentes: arr(d.agentes), partes: arr(d.partes), leccion: String(d.leccion ?? "") };
    }),
    agentes: simple("AGENTE_EVENTO"), lesiones: simple("LESION"), partes: simple("PARTE_CUERPO"),
  };
}
