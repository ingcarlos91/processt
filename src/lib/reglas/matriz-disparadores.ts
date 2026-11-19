import { db } from "@/lib/db";
import { NORMA_A_DISPARADOR, type Disparador } from "./condicion";

/** Detecta peligros especiales a partir de la matriz aprobada (por las normas que regulan cada peligro). */
export async function disparadoresDesdeMatriz(empresaId: string) {
  const ps = await db.peligroEvaluado.findMany({ where: { empresaId, estado: "aprobado", peligroId: { not: null } }, select: { descripcion: true, peligro: { select: { normas: true } } } });
  const out: Partial<Record<Disparador, string>> = {};
  for (const p of ps) for (const n of p.peligro?.normas ?? []) {
    const d = NORMA_A_DISPARADOR[n];
    if (d && !out[d]) out[d] = p.descripcion;
  }
  return out;
}
