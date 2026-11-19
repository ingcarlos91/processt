import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { mdAHtml } from "@/lib/generador/exportar";
import { DocumentoEditor } from "@/components/documentos/editor";

export const dynamic = "force-dynamic";

export default async function DocumentoPage({ params }: PageProps<"/empresas/[id]/documentos/[codigo]">) {
  const { id, codigo } = await params;
  const d = await db.documento.findUnique({ where: { empresaId_codigo: { empresaId: id, codigo } }, include: { secciones: { orderBy: { orden: "asc" } }, plantilla: true } });
  if (!d) notFound();
  const normas = await db.norma.findMany({ where: { codigo: { in: d.plantilla.normas } }, select: { codigo: true, nombre: true, tipo: true, numero: true, anio: true } });
  const secciones = await Promise.all(d.secciones.map(async (s) => ({
    id: s.id, titulo: s.titulo, generado: s.contenidoGenerado, editado: s.contenidoEditado, revisar: s.requiereRevision,
    html: await mdAHtml(s.contenidoEditado ?? s.contenidoGenerado),
  })));
  return (
    <DocumentoEditor
      empresaId={id}
      doc={{ id: d.id, codigo: d.codigo, nombre: d.nombre, version: d.version, estado: d.estado, generadoEn: d.generadoEn.toISOString(), estandares: d.plantilla.estandares }}
      normas={normas.map((n) => `${n.tipo === "Resolucion" ? "Res." : n.tipo} ${n.numero}/${n.anio}`)}
      secciones={secciones}
    />
  );
}
