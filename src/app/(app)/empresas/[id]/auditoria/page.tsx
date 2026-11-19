import { db } from "@/lib/db";
import { AuditoriasLista } from "@/components/auditoria/lista";

export const dynamic = "force-dynamic";

export default async function Auditorias({ params }: PageProps<"/empresas/[id]/auditoria">) {
  const { id } = await params;
  const [aud, e, consultora] = await Promise.all([
    db.auditoria.findMany({ where: { empresaId: id }, orderBy: { fechaInicio: "desc" }, include: { _count: { select: { acciones: true } } } }),
    db.empresa.findUniqueOrThrow({ where: { id }, select: { nivelEstandares: true, comites: { where: { tipo: { in: ["COPASST", "VIGIA"] } }, select: { miembros: { select: { nombre: true } } } }, responsableSst: true } }),
    db.consultora.findFirst(),
  ]);
  return (
    <AuditoriasLista empresaId={id} nivel={e.nivelEstandares ?? 7}
      personasCopasst={[...new Set(e.comites.flatMap((c) => c.miembros.map((m) => m.nombre)))]}
      sugerenciaAuditor={consultora?.profesional ?? ""}
      responsable={(e.responsableSst as { nombre?: string } | null)?.nombre ?? ""}
      auditorias={aud.map((a) => {
        const its = (a.items ?? []) as { resultado: string }[]; const ap = its.filter((x) => x.resultado && x.resultado !== "na");
        return { id: a.id, anio: a.anio, fechaInicio: a.fechaInicio.toISOString().slice(0, 10), fechaCierre: a.fechaCierre?.toISOString().slice(0, 10) ?? "", auditor: a.auditor, estado: a.estado, calificados: its.filter((x) => x.resultado).length, total: its.length, conformidad: ap.length ? Math.round((ap.filter((x) => x.resultado === "conforme").length / ap.length) * 100) : null, noConformes: its.filter((x) => x.resultado === "no_conforme").length, acciones: a._count.acciones };
      })} />
  );
}
