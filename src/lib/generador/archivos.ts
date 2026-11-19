import { db } from "@/lib/db";
import { leerLogo } from "@/lib/logos";
import { markdownDocumento } from "./documentos";
import { mdADocx } from "./exportar";

export async function docxDocumento(empresaId: string, codigo: string) {
  const doc = await db.documento.findUnique({ where: { empresaId_codigo: { empresaId, codigo } }, include: { secciones: true, empresa: { include: { consultora: true } }, plantilla: true } });
  if (!doc) return null;
  const e = doc.empresa;
  // Elaboró: el responsable del SG-SST registrado en la empresa.
  const r = (e.responsableSst ?? {}) as { nombre?: string; licencia?: string };
  const quien = { nombre: r.nombre?.trim() || "________________", licencia: r.licencia?.trim() ?? "" };
  const buf = await mdADocx(markdownDocumento(doc), {
    codigo: doc.codigo, nombre: doc.nombre, version: doc.version, fecha: doc.fechaEmision.toLocaleDateString("es-CO"),
    empresa: e.razonSocial, nit: e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit,
    elaboro: [quien.nombre, quien.licencia ? `Lic. SST ${quien.licencia}` : ""].filter(Boolean).join(", "), aprobo: e.representanteLegal ?? "Representante legal",
    horizontal: ["MTZ-02", "MTZ-01", "PLN-01", "MTZ-04", "FOR-02", "FOR-06"].includes(doc.codigo),
    logo: await leerLogo(e.logoUrl, { ancho: 110, alto: 50 }),
  });
  const nombre = `${doc.codigo} ${doc.nombre}`.replace(/[\\/:*?"<>|]/g, "").slice(0, 120);
  return { buf, nombre: `${nombre}.docx`, carpeta: doc.plantilla.carpeta ?? "Otros" };
}
