import { usuarioActual } from "@/lib/auth/sesion";
import { puedeVerEmpresa } from "@/lib/auth/acceso";
import { db } from "@/lib/db";
import { leerLogo } from "@/lib/logos";

export async function GET(_: Request, { params }: RouteContext<"/api/empresas/[id]/logo">) {
  const sesion = await usuarioActual();
  const { id } = await params;
  if (!(await puedeVerEmpresa(id, sesion.consultoraId))) return new Response("No encontrado", { status: 404 });
  const e = await db.empresa.findUnique({ where: { id }, select: { logoUrl: true } });
  const l = await leerLogo(e?.logoUrl);
  if (!l) return new Response("Sin logo", { status: 404 });
  return new Response(new Uint8Array(l.buf), { headers: { "Content-Type": l.tipo === "png" ? "image/png" : "image/jpeg", "Cache-Control": "no-cache" } });
}
