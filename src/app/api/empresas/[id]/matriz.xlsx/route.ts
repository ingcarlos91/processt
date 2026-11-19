import { construirContexto } from "@/lib/generador/contexto";
import { matrizXlsx } from "@/lib/generador/excel";

export async function GET(_: Request, { params }: RouteContext<"/api/empresas/[id]/matriz.xlsx">) {
  const { id } = await params;
  const ctx = await construirContexto(id);
  const buf = await matrizXlsx(ctx);
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`MTZ-02 Matriz de peligros ${ctx.empresa.razonSocial}.xlsx`)}`,
  } });
}
