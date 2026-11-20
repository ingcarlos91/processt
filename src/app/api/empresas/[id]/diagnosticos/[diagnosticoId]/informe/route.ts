import { db } from "@/lib/db";
import { usuarioActual } from "@/lib/auth/sesion";
import { puedeVerEmpresa } from "@/lib/auth/acceso";
import { mdAPdf } from "@/lib/generador/pdf";
import { informeDiagnostico } from "@/lib/informe-diagnostico";

/** Informe de diagnóstico en PDF, membreteado por la consultora. */
export async function GET(_: Request, { params }: RouteContext<"/api/empresas/[id]/diagnosticos/[diagnosticoId]/informe">) {
  const sesion = await usuarioActual();
  const { id, diagnosticoId } = await params;
  if (!(await puedeVerEmpresa(id, sesion.consultoraId))) return new Response("No encontrado", { status: 404 });
  const d = await db.diagnostico.findUnique({ where: { id: diagnosticoId } });
  if (!d || d.empresaId !== id) return new Response("No encontrado", { status: 404 });
  const { md, meta, empresa } = await informeDiagnostico(diagnosticoId);
  const buf = await mdAPdf(md, meta);
  const nombre = `Diagnostico SG-SST ${empresa.razonSocial}`.replace(/[\\/:*?"<>|]/g, "");
  return new Response(new Uint8Array(buf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nombre + ".pdf")}` } });
}
