import { db } from "@/lib/db";
import { usuarioActual } from "@/lib/auth/sesion";
import { leerLogo } from "@/lib/logos";
import { render } from "@/lib/generador/plantilla";
import { contextoEvento } from "@/lib/generador/contexto";
import { mdADocx } from "@/lib/generador/exportar";

/** Informe de investigación del evento (FOR-07), en Word, listo para firmar. */
export async function GET(_: Request, { params }: RouteContext<"/api/empresas/[id]/eventos/[eventoId]/informe">) {
  await usuarioActual();
  const { id, eventoId } = await params;
  const ev = await db.evento.findUnique({ where: { id: eventoId }, include: { empresa: true } });
  if (!ev || ev.empresaId !== id) return new Response("No encontrado", { status: 404 });
  const p = await db.plantilla.findUniqueOrThrow({ where: { codigo: "FOR-07" } });
  const ctx = await contextoEvento(eventoId);
  const md = render(p.contenidoMd, ctx);
  const e = ev.empresa;
  const r = (e.responsableSst ?? {}) as { nombre?: string; licencia?: string };
  const fecha = ev.fecha.toISOString().slice(0, 10);
  const buf = await mdADocx(md, {
    codigo: "FOR-07", nombre: p.nombre, version: p.version, fecha: new Date().toLocaleDateString("es-CO"),
    empresa: e.razonSocial, nit: e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit,
    elaboro: [r.nombre?.trim() || "________________", r.licencia ? `Lic. SST ${r.licencia}` : ""].filter(Boolean).join(", "), aprobo: e.representanteLegal ?? "Representante legal",
    logo: await leerLogo(e.logoUrl, { ancho: 110, alto: 50 }),
  });
  const nombre = `FOR-07 Investigacion ${fecha} ${ev.trabajadorNombre ?? ev.cargo ?? ""}`.replace(/[\\/:*?"<>|]/g, "").trim();
  return new Response(new Uint8Array(buf), { headers: {
    "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(nombre + ".docx")}`,
  } });
}
