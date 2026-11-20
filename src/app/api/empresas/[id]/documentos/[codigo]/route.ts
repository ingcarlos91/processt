import { docxDocumento } from "@/lib/generador/archivos";
import { usuarioActual } from "@/lib/auth/sesion";
import { puedeVerEmpresa } from "@/lib/auth/acceso";

const TIPO = { docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", pdf: "application/pdf" } as const;

/** Documento en Word (por defecto) o en PDF con ?formato=pdf. */
export async function GET(req: Request, { params }: RouteContext<"/api/empresas/[id]/documentos/[codigo]">) {
  const sesion = await usuarioActual();
  const { id, codigo } = await params;
  if (!(await puedeVerEmpresa(id, sesion.consultoraId))) return new Response("No encontrado", { status: 404 });
  const formato = new URL(req.url).searchParams.get("formato") === "pdf" ? "pdf" : "docx";
  const r = await docxDocumento(id, codigo, formato);
  if (!r) return new Response("Documento no generado", { status: 404 });
  return new Response(new Uint8Array(r.buf), { headers: { "Content-Type": TIPO[formato], "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(r.nombre)}` } });
}
