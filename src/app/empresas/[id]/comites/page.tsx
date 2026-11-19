import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { composicionCopasst } from "@/lib/reglas/motor";
import { ComitesEditor } from "@/components/comites/editor";

export const dynamic = "force-dynamic";

export default async function Comites({ params }: PageProps<"/empresas/[id]/comites">) {
  const { id } = await params;
  const rr = await recalcularEmpresa(id);
  const comites = await db.comite.findMany({ where: { empresaId: id }, include: { miembros: true }, orderBy: { tipo: "asc" } });
  const cop = composicionCopasst(rr.trabajadores);
  return (
    <ComitesEditor
      empresaId={id}
      requeridos={rr.comites.map((c) => (c === "COPASST" && cop.tipo === "VIGIA" ? "VIGIA" : c))}
      composicion={cop.texto}
      refs={Object.fromEntries(rr.conclusiones.filter((c) => c.tipo === "comite").map((c) => [c.valor, c.normaRef]))}
      porques={Object.fromEntries(rr.conclusiones.filter((c) => c.tipo === "comite").map((c) => [c.valor, `${c.porque}${c.valor === "COPASST" ? ` ${cop.texto}.` : ""}`]))}
      comites={comites.map((c) => ({ id: c.id, tipo: c.tipo, inicio: c.periodoInicio?.toISOString().slice(0, 10) ?? "", fin: c.periodoFin?.toISOString().slice(0, 10) ?? "", normaRef: c.normaRef ?? "", miembros: c.miembros.map((m) => ({ id: m.id, nombre: m.nombre, cedula: m.cedula ?? "", cargo: m.cargo ?? "", rol: m.rol, representa: m.representa ?? "" })) }))}
    />
  );
}
