import { db } from "@/lib/db";
import { leerArchivo } from "@/lib/archivos";
import { usuarioActual } from "@/lib/auth/sesion";

export async function GET(req: Request, { params }: RouteContext<"/api/archivos/[id]">) {
  await usuarioActual();
  const { id } = await params;
  const a = await db.evidencia.findUnique({ where: { id } });
  if (!a?.archivoUrl) return new Response("No encontrado", { status: 404 });
  const buf = await leerArchivo(a.archivoUrl);
  const descargar = new URL(req.url).searchParams.has("descargar");
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": a.mime || "application/octet-stream",
    "Content-Disposition": `${descargar ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(a.nombreArchivo ?? "archivo")}`,
    "Cache-Control": "private, no-store",
  } });
}
