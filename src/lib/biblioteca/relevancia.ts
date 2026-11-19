import { db } from "@/lib/db";
import type { Relevancia } from "@/components/app/buscador";

/** Qué elementos de la biblioteca son del sector de la empresa (para ordenar los selectores). */
export async function relevanciaEmpresa(empresaId: string) {
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { sectorTipoId: true } });
  const s = e.sectorTipoId;
  if (!s) return { tareas: new Set<string>(), peligros: new Set<string>(), zonas: new Set<string>(), sectorTipoId: null };
  const [procTareas, cargoTareas, zonas, cargoPeligros, enUso] = await Promise.all([
    db.procesoTipoTarea.findMany({ where: { procesoTipo: { sectorTipoId: s } }, select: { tareaTipoId: true } }),
    db.cargoTipoTarea.findMany({ where: { cargoTipo: { sectorTipoId: s } }, select: { tareaTipoId: true } }),
    db.sectorZonaTipo.findMany({ where: { sectorTipoId: s }, select: { zonaTipoId: true } }),
    db.cargoTipoPeligro.findMany({ where: { cargoTipo: { sectorTipoId: s } }, select: { peligroId: true } }),
    db.peligroEvaluado.findMany({ where: { empresaId, peligroId: { not: null } }, select: { peligroId: true } }),
  ]);
  const tareas = new Set([...procTareas, ...cargoTareas].map((x) => x.tareaTipoId));
  const zonasSet = new Set(zonas.map((z) => z.zonaTipoId));
  const [tp, zp] = await Promise.all([
    db.tareaTipoPeligro.findMany({ where: { tareaTipoId: { in: [...tareas] } }, select: { peligroId: true } }),
    db.zonaTipoPeligro.findMany({ where: { zonaTipoId: { in: [...zonasSet] } }, select: { peligroId: true } }),
  ]);
  const peligros = new Set([...tp, ...zp, ...cargoPeligros, ...enUso].map((x) => x.peligroId as string));
  return { tareas, peligros, zonas: zonasSet, sectorTipoId: s };
}

export function relevancia(empresaPropia: boolean, delSector: boolean): Relevancia {
  return empresaPropia ? "propio" : delSector ? "sector" : "otro";
}
