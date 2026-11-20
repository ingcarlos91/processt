import { usuarioActual } from "@/lib/auth/sesion";
import { puedeVerEmpresa } from "@/lib/auth/acceso";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { leerLogo } from "@/lib/logos";
import { mdADocx } from "@/lib/generador/exportar";
import { mdAPdf } from "@/lib/generador/pdf";
import { informeGestion } from "@/lib/informe-gestion";

/** Informe de gestión para la gerencia del cliente, en Word o PDF (?formato=pdf), del periodo elegido. */
export async function GET(req: Request, { params }: RouteContext<"/api/empresas/[id]/informe-gestion">) {
  const sesion = await usuarioActual();
  const { id } = await params;
  if (!(await puedeVerEmpresa(id, sesion.consultoraId))) return new Response("No encontrado", { status: 404 });
  const u = new URL(req.url).searchParams;
  const hoy = new Date();
  // ?p=mes:2026-11 | trim:2026-4 | sem:2026-2 | anio:2026 | inicio  (compatible con ?anio=&mes=)
  const p = u.get("p") ?? `mes:${Number(u.get("anio")) || hoy.getFullYear()}-${Number(u.get("mes")) || hoy.getMonth() + 1}`;
  const { md, titulo, empresa: e, periodo } = await informeGestion(id, p);
  const r = (e.responsableSst ?? {}) as { nombre?: string };
  const pdf = u.get("formato") === "pdf";
  // Membrete de la consultora: es su entregable para la gerencia del cliente.
  const co = e.consultora;
  const logoBrand = await readFile(join(process.cwd(), "public", "brand", "logo.png")).catch(() => null);
  const meta = {
    codigo: "INF-GES", nombre: titulo, version: 1, fecha: hoy.toLocaleDateString("es-CO"),
    empresa: co?.nombre || "PROCESST", nit: co?.nit || "",
    elaboro: [co?.profesional || r.nombre?.trim() || "________________", co?.licenciaSst ? `Lic. SST ${co.licenciaSst}` : ""].filter(Boolean).join(", "), aprobo: e.representanteLegal ?? "Representante legal",
    sistema: `${(co?.nombre || "PROCESST").toUpperCase()} — CONSULTORÍA EN SEGURIDAD Y SALUD EN EL TRABAJO`,
    logo: (await leerLogo(co?.logoUrl, { ancho: 110, alto: 50 })) ?? (logoBrand ? { buf: logoBrand, tipo: "png" as const, ancho: 120, alto: 30 } : null),
  };
  const buf = pdf ? await mdAPdf(md, meta) : await mdADocx(md, meta);
  const nombre = `Informe de gestion SG-SST ${e.razonSocial} ${periodo.corto}`.replace(/[\\/:*?"<>|]/g, "");
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": pdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nombre + (pdf ? ".pdf" : ".docx"))}`,
  } });
}
