import { usuarioActual } from "@/lib/auth/sesion";
import JSZip from "jszip";
import { extname } from "node:path";
import { db } from "@/lib/db";
import { leerArchivo } from "@/lib/archivos";
import { expedientePorEstandar } from "@/lib/expediente";
import { docxDocumento } from "@/lib/generador/archivos";
import { construirContexto } from "@/lib/generador/contexto";
import { matrizXlsx, evaluacionXlsx } from "@/lib/generador/excel";

const limpio = (t: string) => t.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ").trim().slice(0, 90);

/** Expediente para visitas del Ministerio o la ARL: una carpeta por estándar con documentos firmados y evidencias. */
export async function GET(_: Request, { params }: RouteContext<"/api/empresas/[id]/expediente.zip">) {
  await usuarioActual();
  const { id } = await params;
  const e = await db.empresa.findUniqueOrThrow({ where: { id }, select: { razonSocial: true } });
  const exp = await expedientePorEstandar(id);
  const ctx = await construirContexto(id);
  const zip = new JSZip();
  const raiz = limpio(`Expediente SG-SST ${e.razonSocial}`);
  const indice: string[] = [`EXPEDIENTE DEL SG-SST — ${e.razonSocial}`, `Generado: ${new Date().toLocaleString("es-CO")}`, `Estándares aplicables: ${exp.length} · con soporte: ${exp.filter((x) => x.conSoporte).length}`, ""];
  const docxCache = new Map<string, Awaited<ReturnType<typeof docxDocumento>>>();

  for (const s of exp) {
    const carpeta = `${raiz}/${limpio(`${s.codigo} ${s.descripcion}`)}`;
    indice.push(`${s.codigo} ${s.descripcion}`, `   Estado en la evaluación: ${s.estado}`);
    for (const d of s.documentos) {
      if (d.firmado?.archivoUrl) {
        zip.file(`${carpeta}/${limpio(`${d.codigo} ${d.nombre} - firmado v${d.firmado.documentoVersion ?? d.version}`)}${extname(d.firmado.archivoUrl)}`, await leerArchivo(d.firmado.archivoUrl));
        indice.push(`   [firmado] ${d.codigo} ${d.nombre}`);
      } else {
        if (!docxCache.has(d.codigo)) docxCache.set(d.codigo, await docxDocumento(id, d.codigo));
        const r = docxCache.get(d.codigo);
        if (r) zip.file(`${carpeta}/${limpio(`${d.codigo} ${d.nombre} - SIN FIRMAR`)}.docx`, r.buf);
        indice.push(`   [SIN FIRMAR] ${d.codigo} ${d.nombre}`);
      }
    }
    for (const ev of s.evidencias) {
      if (!ev.archivoUrl) continue;
      const fecha = ev.fecha.toISOString().slice(0, 10);
      zip.file(`${carpeta}/Evidencias/${limpio(`${fecha} ${ev.descripcion}`)}${extname(ev.archivoUrl)}`, await leerArchivo(ev.archivoUrl));
      indice.push(`   [evidencia ${fecha}] ${ev.descripcion}`);
    }
    if (!s.documentos.length && !s.evidencias.length) indice.push("   (sin documentos ni evidencias)");
    indice.push("");
  }
  zip.file(`${raiz}/00 Matriz de peligros (GTC 45).xlsx`, await matrizXlsx(ctx));
  if ((ctx.evaluacion as { existe: boolean }).existe) zip.file(`${raiz}/00 Autoevaluación de estándares mínimos.xlsx`, await evaluacionXlsx(ctx));
  zip.file(`${raiz}/00 Índice del expediente.txt`, indice.join("\r\n"));
  const buf = await zip.generateAsync({ type: "arraybuffer", compression: "DEFLATE" });
  return new Response(buf, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(raiz + ".zip")}` } });
}
