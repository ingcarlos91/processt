import JSZip from "jszip";
import { db } from "@/lib/db";
import { docxDocumento } from "@/lib/generador/archivos";
import { construirContexto } from "@/lib/generador/contexto";
import { matrizXlsx, evaluacionXlsx } from "@/lib/generador/excel";

export async function GET(_: Request, { params }: RouteContext<"/api/empresas/[id]/paquete.zip">) {
  const { id } = await params;
  const docs = await db.documento.findMany({ where: { empresaId: id }, select: { codigo: true }, orderBy: { codigo: "asc" } });
  const ctx = await construirContexto(id);
  const zip = new JSZip();
  const raiz = `SG-SST ${ctx.empresa.razonSocial}`.replace(/[\\/:*?"<>|]/g, "");
  for (const d of docs) {
    const r = await docxDocumento(id, d.codigo);
    if (r) zip.file(`${raiz}/${r.carpeta}/${r.nombre}`, r.buf);
  }
  zip.file(`${raiz}/4. Gestión de peligros y riesgos/MTZ-02 Matriz de peligros (GTC 45).xlsx`, await matrizXlsx(ctx));
  if ((ctx.evaluacion as { existe: boolean }).existe) zip.file(`${raiz}/2. Gestión integral del SG-SST/Autoevaluación de estándares mínimos.xlsx`, await evaluacionXlsx(ctx));
  const buf = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" });
  return new Response(buf, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(raiz + ".zip")}` } });
}
