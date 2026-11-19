import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { calificar } from "@/lib/evaluacion";
import { EvaluacionEditor } from "@/components/evaluacion/editor";
import { aArchivoUI } from "@/lib/archivos-ui";

export const dynamic = "force-dynamic";

export default async function Evaluacion({ params, searchParams }: PageProps<"/empresas/[id]/evaluacion">) {
  const { id } = await params;
  const sp = await searchParams;
  const rr = await recalcularEmpresa(id);
  const evaluaciones = await db.evaluacion.findMany({ where: { empresaId: id }, orderBy: { fecha: "desc" }, include: { items: { include: { estandar: true } }, planMejora: { orderBy: { estandarCodigo: "asc" } } } });
  const sel = evaluaciones.find((e) => e.id === sp.ev) ?? evaluaciones[0];
  const items = sel ? sel.items.sort((a, b) => a.estandar.orden - b.estandar.orden) : [];
  // Soportes por estándar: evidencias ligadas al ítem y documentos firmados cuyas plantillas lo respaldan.
  const [evs, docs] = await Promise.all([
    db.evidencia.findMany({ where: { empresaId: id }, orderBy: { subidoEn: "desc" } }),
    db.documento.findMany({ where: { empresaId: id }, select: { id: true, plantilla: { select: { estandares: true } } } }),
  ]);
  const estandaresDeDoc = new Map(docs.map((d) => [d.id, d.plantilla.estandares]));
  const soportes = (codigo: string) => evs.filter((e) => e.estandarCodigo === codigo || (e.documentoId && estandaresDeDoc.get(e.documentoId)?.includes(codigo))).map(aArchivoUI);
  const cal = sel ? calificar(items.map((i) => ({ codigo: i.estandar.codigo, puntaje: i.estandar.puntaje, estado: i.estado })), sel.nivel) : null;
  return (
    <EvaluacionEditor
      empresaId={id} nivel={rr.nivel}
      evaluaciones={evaluaciones.map((e) => ({ id: e.id, tipo: e.tipo, anio: e.anio, fecha: e.fecha.toISOString(), cerrada: e.cerrada, valoracion: e.valoracion, puntaje: e.nivel === 60 ? e.puntajeBruto : e.puntajeAjustado }))}
      actual={sel ? {
        id: sel.id, tipo: sel.tipo, anio: sel.anio, nivel: sel.nivel, cerrada: sel.cerrada, cal: cal!,
        items: items.map((i) => ({ id: i.id, codigo: i.estandar.codigo, ciclo: i.estandar.ciclo, grupo: i.estandar.grupo, subgrupo: i.estandar.subgrupo, descripcion: i.estandar.descripcion, puntaje: i.estandar.puntaje, modo: i.estandar.modoVerificacion ?? "", soportes: soportes(i.estandar.codigo), estado: i.estado, justificacion: i.justificacion ?? "", observacion: i.observacion ?? "" })),
        plan: sel.planMejora.map((p) => ({ id: p.id, estandar: p.estandarCodigo, actividad: p.actividad, responsable: p.responsable ?? "", fecha: p.fechaLimite?.toISOString().slice(0, 10) ?? "", recursos: p.recursos ?? "", soporte: p.soporte ?? "", estado: p.estado })),
      } : null}
    />
  );
}
