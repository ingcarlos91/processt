import { db } from "@/lib/db";
import { usuarioActual } from "@/lib/auth/sesion";
import { leerLogo } from "@/lib/logos";
import { mdADocx } from "@/lib/generador/exportar";
import { mdAPdf } from "@/lib/generador/pdf";
import { informeAuditoria } from "@/lib/informe-auditoria";

/** Informe de auditoría interna en Word o PDF (?formato=pdf). */
export async function GET(req: Request, { params }: RouteContext<"/api/empresas/[id]/auditorias/[auditoriaId]/informe">) {
  await usuarioActual();
  const { id, auditoriaId } = await params;
  const a = await db.auditoria.findUnique({ where: { id: auditoriaId } });
  if (!a || a.empresaId !== id) return new Response("No encontrada", { status: 404 });
  const { md, titulo, empresa: e, anio } = await informeAuditoria(auditoriaId);
  const meta = {
    codigo: "INF-AUD", nombre: titulo, version: 1, fecha: new Date().toLocaleDateString("es-CO"),
    empresa: e.razonSocial, nit: e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit,
    elaboro: a.auditor, aprobo: e.representanteLegal ?? "Representante legal", logo: await leerLogo(e.logoUrl, { ancho: 110, alto: 50 }),
  };
  const pdf = new URL(req.url).searchParams.get("formato") === "pdf";
  const buf = pdf ? await mdAPdf(md, meta) : await mdADocx(md, meta);
  const nombre = `Informe de auditoria SG-SST ${anio} ${e.razonSocial}`.replace(/[\\/:*?"<>|]/g, "");
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": pdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nombre + (pdf ? ".pdf" : ".docx"))}`,
  } });
}
