// Fusiona peligros globales duplicados por descripción (quedan cuando una descripción de la semilla cambia
// antes de existir la clave de semilla): conserva el que tiene claveSemilla, repunta las referencias y borra el otro.
import type { PrismaClient } from "@prisma/client";

export async function deduplicarPeligros(db: PrismaClient) {
  const globales = await db.peligroCatalogo.findMany({ where: { empresaId: null }, select: { id: true, descripcion: true, claveSemilla: true, validado: true } });
  const porDesc = new Map<string, typeof globales>();
  for (const p of globales) { const k = p.descripcion.trim().toLowerCase(); porDesc.set(k, [...(porDesc.get(k) ?? []), p]); }
  let fusionados = 0;
  for (const grupo of porDesc.values()) {
    if (grupo.length < 2) continue;
    const keep = grupo.find((p) => p.claveSemilla) ?? grupo.find((p) => p.validado) ?? grupo[0];
    for (const dup of grupo.filter((p) => p.id !== keep.id)) {
      // Referencias con clave única compuesta: si ya existe el enlace hacia `keep`, se borra el duplicado; si no, se mueve.
      for (const [tabla, campo] of [["tareaTipoPeligro", "tareaTipoId"], ["zonaTipoPeligro", "zonaTipoId"], ["cargoTipoPeligro", "cargoTipoId"]] as const) {
        const modelo = db[tabla] as unknown as { findMany: (a: unknown) => Promise<Record<string, string>[]>; deleteMany: (a: unknown) => Promise<unknown>; updateMany: (a: unknown) => Promise<unknown> };
        const enlaces = await modelo.findMany({ where: { peligroId: dup.id } });
        for (const e of enlaces) {
          const existe = await modelo.findMany({ where: { peligroId: keep.id, [campo]: e[campo] } });
          if (existe.length) await modelo.deleteMany({ where: { peligroId: dup.id, [campo]: e[campo] } });
          else await modelo.updateMany({ where: { peligroId: dup.id, [campo]: e[campo] }, data: { peligroId: keep.id } });
        }
      }
      await db.peligroEvaluado.updateMany({ where: { peligroId: dup.id }, data: { peligroId: keep.id } });
      await db.evento.updateMany({ where: { peligroId: dup.id }, data: { peligroId: keep.id } }).catch(() => null);
      await db.peligroCatalogo.delete({ where: { id: dup.id } });
      fusionados++;
    }
  }
  return fusionados;
}
