import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { mdAHtml } from "@/lib/generador/exportar";
import { DocumentoEditor } from "@/components/documentos/editor";
import { aArchivoUI } from "@/lib/archivos-ui";
import { completitud, normasMatrizLegal } from "@/lib/completitud";
import { AvisoFaltantesDocumento } from "@/components/trazabilidad/faltantes";
import { CumplimientoLegal } from "@/components/trazabilidad/cumplimiento-legal";
import { SustentoNormativo } from "@/components/trazabilidad/sustento-normativo";
import { REQUISITOS, coberturaRequisitos, perfilDe } from "@/lib/requisitos";

export const dynamic = "force-dynamic";

export default async function DocumentoPage({ params }: PageProps<"/empresas/[id]/documentos/[codigo]">) {
  const { id, codigo } = await params;
  const d = await db.documento.findUnique({ where: { empresaId_codigo: { empresaId: id, codigo } }, include: { secciones: { orderBy: { orden: "asc" } }, plantilla: true, archivos: { orderBy: { subidoEn: "desc" } } } });
  if (!d) notFound();
  // Solo las normas que el motor aplica a esta empresa (p. ej. el Decreto 2157 o la Res. 4272 no se muestran si no le aplican).
  const rr = (await db.empresa.findUniqueOrThrow({ where: { id }, select: { resultadoReglas: true } })).resultadoReglas as Parameters<typeof perfilDe>[0];
  const aplicables = rr?.normas ? new Set(rr.normas.map((n) => n.codigo)) : undefined;
  const normas = await db.norma.findMany({ where: { codigo: { in: d.plantilla.normas.filter((c) => !aplicables || aplicables.has(c)) } }, select: { codigo: true, nombre: true, tipo: true, numero: true, anio: true } });
  const secciones = await Promise.all(d.secciones.map(async (s) => ({
    id: s.id, titulo: s.titulo, generado: s.contenidoGenerado, editado: s.contenidoEditado, revisar: s.requiereRevision,
    html: await mdAHtml(s.contenidoEditado ?? s.contenidoGenerado),
  })));
  // Requisitos de la norma frente a las secciones vigentes (editadas o generadas).
  const cobertura = coberturaRequisitos(codigo, d.secciones.map((s) => ({ titulo: s.titulo, contenido: s.contenidoEditado ?? s.contenidoGenerado })), perfilDe(rr));
  const normasReq = await db.norma.findMany({ where: { codigo: { in: [...new Set((REQUISITOS[codigo] ?? []).map((r) => r.norma))] } }, select: { codigo: true, tipo: true, numero: true, anio: true } });
  const corta = (c: string) => { const n = normasReq.find((x) => x.codigo === c); return n ? `${n.tipo === "Resolucion" ? "Res." : n.tipo === "GuiaTecnica" ? "GTC" : n.tipo} ${n.numero}/${n.anio}` : c; };
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
    <SustentoNormativo requisitos={cobertura.map((r) => ({ id: r.id, texto: r.texto, cita: `${corta(r.norma)} ${r.articulo}`, seccion: r.seccion, cubierto: r.cubierto, motivo: r.motivo }))} />
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
