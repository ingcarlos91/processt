import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;

/** Consultora original (la más antigua). Solo para scripts de terminal; la aplicación usa la consultora del usuario. */
export async function consultoraActual() {
  const c = await db.consultora.findFirst({ orderBy: { creadoEn: "asc" } });
  if (c) return c;
  return db.consultora.create({ data: { nombre: "Mi consultora SST" } });
}
