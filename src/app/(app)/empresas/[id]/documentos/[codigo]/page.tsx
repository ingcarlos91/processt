import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { mdAHtml } from "@/lib/generador/exportar";
import { DocumentoEditor } from "@/components/documentos/editor";
import { aArchivoUI } from "@/lib/archivos-ui";
import { completitud, normasMatrizLegal } from "@/lib/completitud";
import { AvisoFaltantesDocumento } from "@/components/trazabilidad/faltantes";
import { CumplimientoLegal } from "@/components/trazabilidad/cumplimiento-legal";

export const dynamic = "force-dynamic";

export default async function DocumentoPage({ params }: PageProps<"/empresas/[id]/documentos/[codigo]">) {
  const { id, codigo } = await params;
  const d = await db.documento.findUnique({ where: { empresaId_codigo: { empresaId: id, codigo } }, include: { secciones: { orderBy: { orden: "asc" } }, plantilla: true, archivos: { orderBy: { subidoEn: "desc" } } } });
  if (!d) notFound();
  const normas = await db.norma.findMany({ where: { codigo: { in: d.plantilla.normas } }, select: { codigo: true, nombre: true, tipo: true, numero: true, anio: true } });
  const secciones = await Promise.all(d.secciones.map(async (s) => ({
    id: s.id, titulo: s.titulo, generado: s.contenidoGenerado, editado: s.contenidoEditado, revisar: s.requiereRevision,
    html: await mdAHtml(s.contenidoEditado ?? s.contenidoGenerado),
  })));
  const comp = await completitud(id);
  let legal: React.ReactNode = null;
  if (codigo === "MTZ-01") {
    const cods = await normasMatrizLegal(id);
    const ns = await db.norma.findMany({ where: { codigo: { in: cods } }, orderBy: { anio: "asc" } });
    const emp = await db.empresa.findUniqueOrThrow({ where: { id }, select: { datosComplementarios: true } });
    const inicial = (((emp.datosComplementarios ?? {}) as Record<string, unknown>).cumplimientoLegal ?? {}) as Record<string, { cumple?: string; evidencia?: string }>;
    legal = <CumplimientoLegal empresaId={id} inicial={inicial} normas={ns.map((n) => ({ codigo: n.codigo, titulo: `${n.tipo === "Resolucion" ? "Resolución" : n.tipo === "GuiaTecnica" ? "GTC" : n.tipo} ${n.numero} de ${n.anio} — ${n.nombre}`, evidenciaSugerida: n.evidenciaCumplimiento ?? "" }))} />;
  }
  return (
    <div className="space-y-4">
    <AvisoFaltantesDocumento faltantes={comp.porDocumento[codigo] ?? []} />
    {legal}
    <DocumentoEditor
      empresaId={id}
      doc={{ id: d.id, codigo: d.codigo, nombre: d.nombre, version: d.version, estado: d.estado, generadoEn: d.generadoEn.toISOString(), estandares: d.plantilla.estandares }}
      normas={normas.map((n) => `${n.tipo === "Resolucion" ? "Res." : n.tipo} ${n.numero}/${n.anio}`)}
      secciones={secciones}
      firmados={d.archivos.map(aArchivoUI)}
    />
    </div>
  );
}
