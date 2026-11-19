import { db } from "@/lib/db";
import { usuarioActual } from "@/lib/auth/sesion";
import { construirContexto } from "@/lib/generador/contexto";
import { matrizXlsx } from "@/lib/generador/excel";
import { filasDeVersion } from "@/lib/matriz/versiones";

/** Matriz vigente o, con ?version=N, una versión cerrada. */
export async function GET(req: Request, { params }: RouteContext<"/api/empresas/[id]/matriz.xlsx">) {
  await usuarioActual();
  const { id } = await params;
  const ctx = await construirContexto(id);
  const n = Number(new URL(req.url).searchParams.get("version")) || 0;
  let buf, nombre = `MTZ-02 Matriz de peligros ${ctx.empresa.razonSocial}`;
  if (n) {
    const v = await db.matrizVersion.findFirst({ where: { empresaId: id, numero: n } });
    if (!v) return new Response("Versión no encontrada", { status: 404 });
    const filas = await filasDeVersion(id, v.snapshot);
    const fecha = v.fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" });
    buf = await matrizXlsx({ ...ctx, matriz: { ...ctx.matriz, filas } }, { numero: v.numero, fecha, motivo: v.motivo });
    nombre += ` v${v.numero}`;
  } else buf = await matrizXlsx(ctx);
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nombre + ".xlsx")}`,
  } });
}
