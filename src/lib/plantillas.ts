import "server-only";
import type { Plantilla, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type PlantillaEfectiva = Plantilla & {
  /** La consultora tiene su propia versión de esta plantilla. */
  propia: boolean;
  /** Versión de la base sobre la que la consultora hizo su ajuste (para avisar si la base cambió después). */
  baseVersion: number | null;
  /** Versión actual de la base de PROCESST. */
  versionBase: number;
};

/**
 * Plantillas tal como las usa una consultora: la base de PROCESST, o su versión propia donde la ajustó.
 * Todo lo que renderiza documentos debe pasar por aquí.
 */
export async function plantillasDe(consultoraId: string, where: Prisma.PlantillaWhereInput = {}, orderBy: Prisma.PlantillaOrderByWithRelationInput = { codigo: "asc" }): Promise<PlantillaEfectiva[]> {
  const ps = await db.plantilla.findMany({ where, orderBy, include: { ajustes: { where: { consultoraId } } } });
  return ps.map(({ ajustes, ...p }) => {
    const a = ajustes[0];
    return { ...p, contenidoMd: a?.contenidoMd ?? p.contenidoMd, version: a?.version ?? p.version, vigenteDesde: a?.vigenteDesde ?? p.vigenteDesde, propia: !!a, baseVersion: a?.baseVersion ?? null, versionBase: p.version };
  });
}

export async function plantillaDe(consultoraId: string, codigo: string) {
  return (await plantillasDe(consultoraId, { codigo }))[0] ?? null;
}

/** Consultora de una empresa (para renderizar sus documentos con las plantillas de su consultora). */
export async function consultoraDe(empresaId: string) {
  return (await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { consultoraId: true } })).consultoraId;
}
