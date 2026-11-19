import { db } from "@/lib/db";
import { usuarioActual } from "@/lib/auth/sesion";
import { fechasPlaneador, aIcs } from "@/lib/planeador";

/** Calendario del planeador (todas las empresas o ?empresa=id) para Google Calendar, Outlook o el celular. */
export async function GET(req: Request) {
  await usuarioActual();
  const empresaId = new URL(req.url).searchParams.get("empresa") || undefined;
  const hoy = new Date();
  const fechas = await fechasPlaneador({ empresaId, desde: new Date(hoy.getTime() - 30 * 864e5), hasta: new Date(hoy.getTime() + 400 * 864e5) });
  const nombre = empresaId ? `SG-SST ${(await db.empresa.findUnique({ where: { id: empresaId }, select: { razonSocial: true } }))?.razonSocial ?? ""}` : "PROCESST — Planeador SG-SST";
  return new Response(aIcs(fechas, nombre), { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nombre + ".ics")}` } });
}
