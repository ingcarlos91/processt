// Lectura de los parámetros de plazos de una consultora (solo servidor).
import { db } from "@/lib/db";
import type { ParametrosPlazos } from "@/lib/plazos";

export async function parametrosPlazos(consultoraId: string): Promise<ParametrosPlazos> {
  const c = await db.consultora.findUnique({ where: { id: consultoraId }, select: { parametros: true } });
  return (c?.parametros ?? {}) as ParametrosPlazos;
}
