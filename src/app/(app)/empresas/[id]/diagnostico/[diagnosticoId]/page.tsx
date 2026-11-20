import { usuarioActual } from "@/lib/auth/sesion";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { aArchivoUI } from "@/lib/archivos-ui";
import type { ItemDiag } from "@/lib/diagnostico";
import { DiagnosticoEditor } from "@/components/diagnostico/editor";

export const dynamic = "force-dynamic";

export default async function Diagnostico({ params }: PageProps<"/empresas/[id]/diagnostico/[diagnosticoId]">) {
  const { id, diagnosticoId } = await params;
  const d = await db.diagnostico.findUnique({ where: { id: diagnosticoId }, include: { archivos: { orderBy: { subidoEn: "desc" } }, empresa: { select: { etapa: true } } } });
  if (!d || d.empresaId !== id) notFound();
  const consultora = await db.consultora.findUnique({ where: { id: (await usuarioActual()).consultoraId } });
  return (
    <DiagnosticoEditor empresaId={id} etapa={d.empresa.etapa} profesional={consultora?.profesional ?? ""} licencia={consultora?.licenciaSst ?? ""}
      d={{ id: d.id, fecha: d.fecha.toISOString().slice(0, 10), nivel: d.nivel, estado: d.estado, conclusiones: d.conclusiones ?? "", items: (d.items ?? []) as ItemDiag[], iniciado: !!d.evaluacionId, archivos: d.archivos.map(aArchivoUI) }} />
  );
}
