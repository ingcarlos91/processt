import { db } from "@/lib/db";
import { evaluarEmpresa } from "@/lib/reglas/motor";
import { datosReglas } from "@/lib/generador/contexto";
import { disparadoresDesdeMatriz } from "@/lib/reglas/matriz-disparadores";
import type { Disparador } from "@/lib/reglas/condicion";

/** Recalcula nivel de estándares y resultado de reglas, y lo guarda en la empresa. */
export async function recalcularEmpresa(empresaId: string) {
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, include: { consultora: true } });
  // Lo que se registra persona por persona en Trabajadores manda sobre los números del cuestionario (se toma el mayor).
  const [nSedes, ts] = await Promise.all([db.sede.count({ where: { empresaId } }), db.trabajador.findMany({ where: { empresaId, activo: true }, select: { sexo: true, conduce: true, modalidad: true, turnoNocturno: true, altoRiesgoPension: true, manipulaAlimentos: true, vinculacion: true } })]);
  const n = (f: (t: (typeof ts)[number]) => boolean) => ts.filter(f).length;
  const registro: Partial<Record<Disparador, string>> = {};
  const marca = (k: Disparador, cuantos: number, que: string) => { if (cuantos > 0) registro[k] = `${cuantos} trabajador(es) registrados ${que} en Trabajadores`; };
  marca("teletrabajo", n((t) => t.modalidad === "teletrabajo" || t.modalidad === "remoto"), "en teletrabajo o trabajo remoto");
  marca("trabajoEnCasa", n((t) => t.modalidad === "trabajo_en_casa"), "en trabajo en casa");
  marca("trabajoNocturno", n((t) => t.turnoNocturno), "con turno nocturno (7:00 p. m. a 6:00 a. m.)");
  marca("altoRiesgoPension", n((t) => t.altoRiesgoPension), "en actividad de alto riesgo pensional");
  marca("manipulacionAlimentos", n((t) => t.manipulaAlimentos), "como manipuladores de alimentos");
  marca("conduccion", n((t) => t.conduce), "como conductores");
  const rr = evaluarEmpresa({
    ...e, nSedes: Math.max(1, nSedes), nMujeres: n((t) => t.sexo === "F"),
    nConductores: Math.max(e.nConductores ?? 0, n((t) => t.conduce)),
    nContratistas: Math.max(e.nContratistas ?? 0, n((t) => t.vinculacion === "contratista")),
    nAprendices: Math.max(e.nAprendices ?? 0, n((t) => t.vinculacion === "aprendiz")),
    disparadoresMatriz: { ...registro, ...(await disparadoresDesdeMatriz(empresaId)) },
  }, await datosReglas());
  await db.empresa.update({ where: { id: empresaId }, data: { nivelEstandares: rr.nivel, resultadoReglas: rr as object } });
  return rr;
}
