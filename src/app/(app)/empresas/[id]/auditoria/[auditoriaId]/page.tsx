import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { aArchivoUI } from "@/lib/archivos-ui";
import { evidenciasSistema, type ItemAuditoria } from "@/lib/auditoria";
import { AuditoriaDetalle } from "@/components/auditoria/detalle";

export const dynamic = "force-dynamic";
const iso = (d?: Date | null) => d?.toISOString().slice(0, 10) ?? "";

export default async function Auditoria({ params }: PageProps<"/empresas/[id]/auditoria/[auditoriaId]">) {
  const { id, auditoriaId } = await params;
  const a = await db.auditoria.findUnique({ where: { id: auditoriaId }, include: { acciones: { orderBy: { fecha: "asc" } }, archivos: { orderBy: { subidoEn: "desc" } } } });
  if (!a || a.empresaId !== id) notFound();
  const [sistema, e] = await Promise.all([evidenciasSistema(id), db.empresa.findUniqueOrThrow({ where: { id }, select: { responsableSst: true, representanteLegal: true } })]);
  return (
    <AuditoriaDetalle empresaId={id} sistema={sistema} responsableSst={(e.responsableSst as { nombre?: string } | null)?.nombre ?? ""}
      responsables={[...new Set([(e.responsableSst as { nombre?: string } | null)?.nombre, e.representanteLegal].filter(Boolean) as string[])]}
      a={{ id: a.id, anio: a.anio, fechaInicio: iso(a.fechaInicio), fechaCierre: iso(a.fechaCierre), auditor: a.auditor, auditorPerfil: a.auditorPerfil ?? "", independiente: a.independiente, comunicadoA: a.comunicadoA ?? "", comunicadoFecha: iso(a.comunicadoFecha), participantes: a.participantes ?? "", alcance: a.alcance ?? "", estado: a.estado, conclusiones: a.conclusiones ?? "",
        items: (a.items ?? []) as ItemAuditoria[], acciones: a.acciones.map((x) => ({ id: x.id, hallazgo: x.hallazgo, descripcion: x.descripcion, responsable: x.responsable ?? "", fechaLimite: iso(x.fechaLimite), estado: x.estado, causa: x.causa ?? "" })), archivos: a.archivos.map(aArchivoUI) }} />
  );
}
