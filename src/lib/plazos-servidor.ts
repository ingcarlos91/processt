// Lectura de los parámetros de plazos de la consultora (solo servidor).
import { consultoraActual } from "@/lib/db";
import type { ParametrosPlazos } from "@/lib/plazos";

export async function parametrosPlazos(): Promise<ParametrosPlazos> {
  const c = await consultoraActual();
  return ((c as { parametros?: unknown }).parametros ?? {}) as ParametrosPlazos;
}
