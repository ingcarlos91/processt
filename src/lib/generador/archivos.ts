import { db } from "@/lib/db";
import { leerLogo } from "@/lib/logos";
import { markdownDocumento } from "./documentos";
import { mdADocx } from "./exportar";
import { mdAPdf } from "./pdf";

/** Documento en Word o PDF, con el mismo encabezado, firmas y pie. */
export async function docxDocumento(empresaId: string, codigo: string, formato: "docx" | "pdf" = "docx") {
  const doc = await db.documento.findUnique({ where: { empresaId_codigo: { empresaId, codigo } }, include: { secciones: true, empresa: { include: { consultora: true } }, plantilla: true } });
  if (!doc) return null;
  const e = doc.empresa;
  // Elaboró: el responsable del SG-SST registrado en la empresa.
  const r = (e.responsableSst ?? {}) as { nombre?: string; licencia?: string };
  const quien = { nombre: r.nombre?.trim() || "________________", licencia: r.licencia?.trim() ?? "" };
  const meta = {
    codigo: doc.codigo, nombre: doc.nombre, version: doc.version, fecha: doc.fechaEmision.toLocaleDateString("es-CO"),
    empresa: e.razonSocial, nit: e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit,
    elaboro: [quien.nombre, quien.licencia ? `Lic. SST ${quien.licencia}` : ""].filter(Boolean).join(", "), aprobo: e.representanteLegal ?? "Representante legal",
    horizontal: ["MTZ-02", "MTZ-01", "MTZ-03", "PLN-01", "MTZ-04", "FOR-02", "FOR-06", "FOR-08", "PRG-07"].includes(doc.codigo),
    logo: await leerLogo(e.logoUrl, { ancho: 110, alto: 50 }),
  };
  const md = markdownDocumento(doc);
  const buf = formato === "pdf" ? await mdAPdf(md, meta) : await mdADocx(md, meta);
  const nombre = `${doc.codigo} ${doc.nombre}`.replace(/[\\/:*?"<>|]/g, "").slice(0, 120);
  return { buf, nombre: `${nombre}.${formato}`, carpeta: doc.plantilla.carpeta ?? "Otros" };
}
