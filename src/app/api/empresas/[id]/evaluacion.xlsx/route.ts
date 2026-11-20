import { usuarioActual } from "@/lib/auth/sesion";
import { db } from "@/lib/db";
import { construirContexto, contextoEvaluacion } from "@/lib/generador/contexto";
import { evaluacionXlsx } from "@/lib/generador/excel";

/** Excel de la autoevaluación. Con `?ev=<id>` exporta esa evaluación; sin él, la última. */
export async function GET(req: Request, { params }: RouteContext<"/api/empresas/[id]/evaluacion.xlsx">) {
  await usuarioActual();
  const { id } = await params;
  const ctx = await construirContexto(id);
  const evId = new URL(req.url).searchParams.get("ev");
  let ev = ctx.evaluacion, plan = ctx.planMejora;
  if (evId && evId !== ctx.evaluacion.id) {
    const x = await db.evaluacion.findFirst({ where: { id: evId, empresaId: id }, include: { items: { include: { estandar: true } }, planMejora: true } });
    if (x) {
      ev = contextoEvaluacion(x, await db.estandar.findMany({ orderBy: { orden: "asc" } }));
      plan = x.planMejora.map((p) => ({ estandar: p.estandarCodigo, actividad: p.actividad, responsable: p.responsable ?? "", fecha: p.fechaLimite ? p.fechaLimite.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : "", recursos: p.recursos ?? "", soporte: p.soporte ?? "" }));
    }
  }
  const buf = await evaluacionXlsx(ctx, ev, plan);
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`Autoevaluacion estandares minimos ${ctx.empresa.razonSocial}.xlsx`)}`,
  } });
}
