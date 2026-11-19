import { db } from "@/lib/db";
import { PlanEditor } from "@/components/plan/editor";
import { anioPlanDefecto } from "@/lib/plan/generar";
import { aArchivoUI } from "@/lib/archivos-ui";

export const dynamic = "force-dynamic";

export default async function Plan({ params, searchParams }: PageProps<"/empresas/[id]/plan">) {
  const { id } = await params;
  const sp = await searchParams;
  const anio = Number(sp.anio) || anioPlanDefecto();
  const acts = await db.actividadPlan.findMany({ where: { empresaId: id, anio }, orderBy: [{ mes: "asc" }, { nombre: "asc" }], include: { evidencias: { orderBy: { subidoEn: "desc" } } } });
  return <PlanEditor empresaId={id} anio={anio} actividades={acts.map((a) => ({ id: a.id, mes: a.mes, nombre: a.nombre, estandar: a.estandarCodigo ?? "", normaRef: a.normaRef ?? "", responsable: a.responsable ?? "", estado: a.estado, origen: a.origen, evidencias: a.evidencias.map(aArchivoUI) }))} />;
}
