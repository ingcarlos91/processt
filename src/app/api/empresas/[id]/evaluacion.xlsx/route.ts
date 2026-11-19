import { construirContexto } from "@/lib/generador/contexto";
import { evaluacionXlsx } from "@/lib/generador/excel";

export async function GET(_: Request, { params }: RouteContext<"/api/empresas/[id]/evaluacion.xlsx">) {
  const { id } = await params;
  const ctx = await construirContexto(id);
  const buf = await evaluacionXlsx(ctx);
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`Autoevaluacion estandares minimos ${ctx.empresa.razonSocial}.xlsx`)}`,
  } });
}
