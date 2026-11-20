import { db } from "@/lib/db";
import { leerSeguimiento } from "@/lib/matriz/seguimiento";
import { MatrizEditor } from "@/components/matriz/editor";
import { relevanciaEmpresa, relevancia } from "@/lib/biblioteca/relevancia";
import { avisosActualizacion } from "@/lib/matriz/versiones";

export const dynamic = "force-dynamic";

export default async function Matriz({ params }: PageProps<"/empresas/[id]/matriz">) {
  const { id } = await params;
  const [e, cargosTipo, tareasTipo, catalogo, zonasTipo] = await Promise.all([
    db.empresa.findUniqueOrThrow({
      where: { id },
      include: {
        procesos: { orderBy: { orden: "asc" } }, zonas: true, matrizVersiones: { orderBy: { numero: "desc" }, take: 1 },
        cargos: { orderBy: { nombre: "asc" }, include: { cargoTipo: { select: { nombre: true } }, tareas: { select: { tareaId: true } } } },
        tareas: { orderBy: { nombre: "asc" }, include: { cargos: { select: { cargoId: true } } } },
        peligros: { orderBy: { creadoEn: "asc" } },
      },
    }),
    db.cargoTipo.findMany({ where: { OR: [{ empresaId: null }, { empresaId: id }] }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true, sectorTipoId: true, empresaId: true } }),
    db.tareaTipo.findMany({ where: { OR: [{ empresaId: null }, { empresaId: id }] }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true, actividad: true, empresaId: true } }),
    db.peligroCatalogo.findMany({ where: { OR: [{ empresaId: null }, { empresaId: id }] }, orderBy: [{ clasificacion: "asc" }, { descripcion: "asc" }], select: { id: true, clasificacion: true, descripcion: true, empresaId: true } }),
    db.zonaTipo.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);
  const rel = await relevanciaEmpresa(id);
  const [avisos, nVersiones] = await Promise.all([avisosActualizacion(id), db.matrizVersion.count({ where: { empresaId: id } })]);
  return (
    <MatrizEditor
      empresaId={id}
      sectorTipoId={e.sectorTipoId}
      avisos={avisos} nVersiones={nVersiones}
      version={e.matrizVersiones[0] ? { numero: e.matrizVersiones[0].numero, fecha: e.matrizVersiones[0].fecha.toISOString(), motivo: e.matrizVersiones[0].motivo } : null}
      procesos={e.procesos.map((p) => ({ id: p.id, nombre: p.nombre }))}
      zonas={e.zonas.map((z) => ({ id: z.id, nombre: z.nombre }))}
      cargos={e.cargos.map((c) => ({ id: c.id, nombre: c.nombre, nPersonas: c.nPersonas, funciones: c.descripcionFunciones ?? "", periodicidadMeses: c.periodicidadMeses ?? null, periodicidadMotivo: c.periodicidadMotivo ?? "", tipo: c.cargoTipo?.nombre ?? null, zonaId: c.zonaId, tareaIds: c.tareas.map((t) => t.tareaId) }))}
      tareas={e.tareas.map((t) => ({ id: t.id, nombre: t.nombre, procesoId: t.procesoId, zonaId: t.zonaId, rutinaria: t.rutinaria, altoRiesgo: t.altoRiesgo, estado: t.estado, fuente: t.fuente, tareaTipoId: t.tareaTipoId, cargoIds: t.cargos.map((c) => c.cargoId) }))}
      peligros={e.peligros.map((p) => ({
        id: p.id, origen: p.origen as "tarea" | "zona" | "cargo", tareaId: p.tareaId, zonaId: p.zonaId, cargoId: p.cargoId, peligroId: p.peligroId,
        clasificacion: p.clasificacion, descripcion: p.descripcion, efectosPosibles: p.efectosPosibles ?? "", controlesFuente: p.controlesFuente ?? "", controlesMedio: p.controlesMedio ?? "", controlesIndividuo: p.controlesIndividuo ?? "",
        nd: p.nd, ne: p.ne, nc: p.nc, medidaEliminacion: p.medidaEliminacion ?? "", medidaSustitucion: p.medidaSustitucion ?? "", medidaIngenieria: p.medidaIngenieria ?? "",
        medidaAdministrativa: p.medidaAdministrativa ?? "", medidaEpp: p.medidaEpp ?? "", requisitoLegal: p.requisitoLegal, estado: p.estado, fuente: p.fuente, seguimiento: leerSeguimiento(p.seguimiento),
      }))}
      cargosTipo={cargosTipo.map((c) => ({ ...c, relevancia: relevancia(!!c.empresaId, !!c.sectorTipoId && c.sectorTipoId === e.sectorTipoId) }))}
      tareasTipo={tareasTipo.map((t) => ({ ...t, relevancia: relevancia(!!t.empresaId, rel.tareas.has(t.id)) }))}
      catalogo={catalogo.map((p) => ({ ...p, relevancia: relevancia(!!p.empresaId, rel.peligros.has(p.id)) }))}
      zonasTipo={zonasTipo.map((z) => ({ ...z, relevancia: relevancia(false, rel.zonas.has(z.id)) }))}
    />
  );
}
