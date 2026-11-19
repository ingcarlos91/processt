import { docxDocumento } from "@/lib/generador/archivos";

export async function GET(_: Request, { params }: RouteContext<"/api/empresas/[id]/documentos/[codigo]">) {
  const { id, codigo } = await params;
  const r = await docxDocumento(id, codigo);
  if (!r) return new Response("Documento no generado", { status: 404 });
  return new Response(new Uint8Array(r.buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(r.nombre)}`,
  } });
}
