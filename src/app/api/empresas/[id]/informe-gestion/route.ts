import { usuarioActual } from "@/lib/auth/sesion";
import { leerLogo } from "@/lib/logos";
import { mdADocx } from "@/lib/generador/exportar";
import { mdAPdf } from "@/lib/generador/pdf";
import { informeGestion } from "@/lib/informe-gestion";

/** Informe mensual de gestión en Word: ?anio=2026&mes=11 */
export async function GET(req: Request, { params }: RouteContext<"/api/empresas/[id]/informe-gestion">) {
  await usuarioActual();
  const { id } = await params;
  const u = new URL(req.url).searchParams;
  const hoy = new Date();
  const anio = Number(u.get("anio")) || hoy.getFullYear(), mes = Math.min(12, Math.max(1, Number(u.get("mes")) || hoy.getMonth() + 1));
  const { md, titulo, empresa: e } = await informeGestion(id, anio, mes);
  const r = (e.responsableSst ?? {}) as { nombre?: string; licencia?: string };
  const pdf = u.get("formato") === "pdf";
  const meta = {
    codigo: "INF-GES", nombre: titulo, version: 1, fecha: hoy.toLocaleDateString("es-CO"),
    empresa: e.razonSocial, nit: e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit,
    elaboro: [r.nombre?.trim() || e.consultora?.profesional || "________________", r.licencia ? `Lic. SST ${r.licencia}` : ""].filter(Boolean).join(", "), aprobo: e.representanteLegal ?? "Representante legal",
    logo: await leerLogo(e.logoUrl, { ancho: 110, alto: 50 }),
  };
  const buf = pdf ? await mdAPdf(md, meta) : await mdADocx(md, meta);
  const nombre = `Informe de gestion SG-SST ${e.razonSocial} ${anio}-${String(mes).padStart(2, "0")}`.replace(/[\\/:*?"<>|]/g, "");
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": pdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nombre + (pdf ? ".pdf" : ".docx"))}`,
  } });
}
