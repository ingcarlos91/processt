import { db } from "@/lib/db";
import { evaluarEmpresa } from "@/lib/reglas/motor";
import { datosReglas } from "@/lib/generador/contexto";
import { disparadoresDesdeMatriz } from "@/lib/reglas/matriz-disparadores";

/** Recalcula nivel de estándares y resultado de reglas, y lo guarda en la empresa. */
export async function recalcularEmpresa(empresaId: string) {
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, include: { consultora: true } });
  const r = (e.responsableSst ?? {}) as { nombre?: string };
  const responsableSst = r.nombre?.trim() ? e.responsableSst : { nombre: e.consultora.profesional, perfil: e.consultora.perfil, licencia: e.consultora.licenciaSst, curso50h: e.consultora.curso50h };
  const rr = evaluarEmpresa({ ...e, responsableSst, disparadoresMatriz: await disparadoresDesdeMatriz(empresaId) }, await datosReglas());
  await db.empresa.update({ where: { id: empresaId }, data: { nivelEstandares: rr.nivel, resultadoReglas: rr as object } });
  return rr;
}
