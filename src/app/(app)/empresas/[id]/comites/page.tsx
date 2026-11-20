import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { composicionCopasst } from "@/lib/reglas/motor";
import { ComitesEditor } from "@/components/comites/editor";
import { aArchivoUI } from "@/lib/archivos-ui";

export const dynamic = "force-dynamic";

export default async function Comites({ params }: PageProps<"/empresas/[id]/comites">) {
  const { id } = await params;
  const rr = await recalcularEmpresa(id);
  const comites = await db.comite.findMany({ where: { empresaId: id }, include: { miembros: true, archivos: { orderBy: { fecha: "desc" } } }, orderBy: { tipo: "asc" } });
  const trabajadores = await db.trabajador.findMany({ where: { empresaId: id, activo: true }, orderBy: { nombres: "asc" }, select: { nombres: true, tipoDoc: true, documento: true, cargo: { select: { nombre: true } } } });
  const ORDEN = ["COPASST", "VIGIA", "CCL", "BRIGADA"];
  const cop = composicionCopasst(rr.trabajadores);
  return (
    <ComitesEditor
      empresaId={id}
      requeridos={rr.comites.map((c) => (c === "COPASST" && cop.tipo === "VIGIA" ? "VIGIA" : c)).sort((a, b) => ORDEN.indexOf(a) - ORDEN.indexOf(b))}
      trabajadores={trabajadores.map((t) => ({ nombre: t.nombres, tipoDoc: t.tipoDoc ?? "CC", documento: t.documento ?? "", cargo: t.cargo?.nombre ?? "" }))}
      composicion={cop.texto}
      refs={Object.fromEntries(rr.conclusiones.filter((c) => c.tipo === "comite").map((c) => [c.valor, c.normaRef]))}
      porques={Object.fromEntries(rr.conclusiones.filter((c) => c.tipo === "comite").map((c) => [c.valor, `${c.porque}${c.valor === "COPASST" ? ` ${cop.texto}.` : ""}`]))}
      comites={comites.map((c) => ({ id: c.id, tipo: c.tipo, inicio: c.periodoInicio?.toISOString().slice(0, 10) ?? "", fin: c.periodoFin?.toISOString().slice(0, 10) ?? "", normaRef: c.normaRef ?? "", datos: (c.datos ?? {}) as Record<string, unknown>, actas: c.archivos.map(aArchivoUI), miembros: c.miembros.map((m) => ({ id: m.id, nombre: m.nombre, tipoDoc: m.tipoDoc, cedula: m.cedula ?? "", cargo: m.cargo ?? "", rol: m.rol, representa: m.representa ?? "" })) }))}
    />
  );
}
