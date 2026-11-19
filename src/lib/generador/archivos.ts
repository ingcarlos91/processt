import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";
import { markdownDocumento } from "./documentos";
import { mdADocx } from "./exportar";

async function logoEmpresa(logoUrl: string | null) {
  if (!logoUrl || !logoUrl.startsWith("/")) return null;
  try { return await readFile(join(process.cwd(), "public", logoUrl)); } catch { return null; }
}

export async function docxDocumento(empresaId: string, codigo: string) {
  const doc = await db.documento.findUnique({ where: { empresaId_codigo: { empresaId, codigo } }, include: { secciones: true, empresa: { include: { consultora: true } }, plantilla: true } });
  if (!doc) return null;
  const e = doc.empresa;
  const buf = await mdADocx(markdownDocumento(doc), {
    codigo: doc.codigo, nombre: doc.nombre, version: doc.version, fecha: doc.fechaEmision.toLocaleDateString("es-CO"),
    empresa: e.razonSocial, nit: e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit,
    elaboro: e.consultora.profesional ?? e.consultora.nombre, aprobo: e.representanteLegal ?? "Representante legal",
    horizontal: ["MTZ-02", "MTZ-01", "PLN-01", "MTZ-04", "FOR-02", "FOR-06"].includes(doc.codigo),
    logo: await logoEmpresa(e.logoUrl),
  });
  const nombre = `${doc.codigo} ${doc.nombre}`.replace(/[\\/:*?"<>|]/g, "").slice(0, 120);
  return { buf, nombre: `${nombre}.docx`, carpeta: doc.plantilla.carpeta ?? "Otros" };
}
