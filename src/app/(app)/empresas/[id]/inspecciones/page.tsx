import { db } from "@/lib/db";
import { aArchivoUI } from "@/lib/archivos-ui";
import { InspeccionesEditor } from "@/components/inspecciones/editor";

export const dynamic = "force-dynamic";
const iso = (d?: Date | null) => d?.toISOString().slice(0, 10) ?? "";

export default async function Inspecciones({ params }: PageProps<"/empresas/[id]/inspecciones">) {
  const { id } = await params;
  const [ins, listas, e] = await Promise.all([
    db.inspeccion.findMany({ where: { empresaId: id }, orderBy: { fecha: "desc" }, include: { acciones: { select: { id: true, descripcion: true, estado: true, responsable: true, fechaLimite: true } }, archivos: { orderBy: { subidoEn: "desc" } } } }),
    db.catalogoItem.findMany({ where: { tipo: "LISTA_INSPECCION", OR: [{ empresaId: null }, { empresaId: id }] }, orderBy: { nombre: "asc" } }),
    db.empresa.findUniqueOrThrow({ where: { id }, select: { responsableSst: true, sedes: { select: { nombre: true } }, zonas: { select: { nombre: true } }, comites: { select: { miembros: { select: { nombre: true } } } } } }),
  ]);
  const resp = (e.responsableSst ?? {}) as { nombre?: string };
  return (
    <InspeccionesEditor
      empresaId={id}
      listas={listas.map((l) => { const d = (l.detalle ?? {}) as { items?: string[]; frecuenciaDias?: number }; return { nombre: l.nombre, descripcion: l.descripcion ?? "", items: d.items ?? [], frecuenciaDias: d.frecuenciaDias ?? 0 }; })}
      lugares={[...new Set([...e.zonas, ...e.sedes].map((x) => x.nombre))]}
      personas={[...new Set([resp.nombre, ...e.comites.flatMap((c) => c.miembros.map((m) => m.nombre))].filter(Boolean) as string[])]}
      responsable={resp.nombre ?? ""}
      inspecciones={ins.map((i) => ({
        id: i.id, lista: i.lista, fecha: iso(i.fecha), lugar: i.lugar ?? "", responsable: i.responsable ?? "", participantes: i.participantes ?? "", observaciones: i.observaciones ?? "",
        items: (i.items ?? []) as { pregunta: string; resultado: "cumple" | "no_cumple" | "na"; observacion: string }[],
        acciones: i.acciones.map((a) => ({ id: a.id, descripcion: a.descripcion, estado: a.estado, responsable: a.responsable ?? "", fechaLimite: iso(a.fechaLimite) })),
        archivos: i.archivos.map(aArchivoUI),
      }))}
    />
  );
}
