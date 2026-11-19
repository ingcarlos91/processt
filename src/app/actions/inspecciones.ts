"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereUsuario } from "@/lib/auth/sesion";
import { actualizarDocumentos } from "@/lib/generador/documentos";

export type ItemInspeccion = { pregunta: string; resultado: "cumple" | "no_cumple" | "na" | ""; observacion?: string; accion?: { descripcion: string; responsable?: string; fechaLimite?: string } | null };
const dia = (s?: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + "T12:00:00Z") : null);

/** Guarda la inspección y crea una acción (FOR-06) por cada hallazgo marcado para seguimiento. */
export async function guardarInspeccion(empresaId: string, d: { id?: string; lista: string; fecha: string; lugar?: string; responsable?: string; participantes?: string; observaciones?: string; items: ItemInspeccion[] }) {
  await requiereUsuario();
  const fecha = dia(d.fecha);
  if (!fecha) return { error: "Escriba la fecha de la inspección." };
  if (d.items.some((i) => !i.resultado)) return { error: "Califique todos los ítems (cumple, no cumple o no aplica)." };
  const items = d.items.map(({ pregunta, resultado, observacion }) => ({ pregunta, resultado, observacion: observacion?.trim() || "" }));
  const data = { lista: d.lista, fecha, lugar: d.lugar || null, responsable: d.responsable || null, participantes: d.participantes || null, observaciones: d.observaciones || null, items };
  const insp = d.id ? await db.inspeccion.update({ where: { id: d.id }, data }) : await db.inspeccion.create({ data: { empresaId, ...data } });
  let acciones = 0;
  for (const it of d.items) {
    if (it.resultado !== "no_cumple" || !it.accion?.descripcion?.trim()) continue;
    await db.accion.create({ data: {
      empresaId, inspeccionId: insp.id, origen: "inspeccion", fecha,
      hallazgo: `${d.lista}${d.lugar ? ` (${d.lugar})` : ""}: ${it.pregunta}${it.observacion ? ` — ${it.observacion}` : ""}`,
      tipo: "correctiva", jerarquia: "administrativo", descripcion: it.accion.descripcion.trim(), responsable: it.accion.responsable || null, fechaLimite: dia(it.accion.fechaLimite),
    } });
    acciones++;
  }
  await actualizarDocumentos(empresaId, ["FOR-06", "PRG-06"]);
  revalidatePath(`/empresas/${empresaId}`, "layout");
  revalidatePath("/planeador");
  return { ok: true as const, id: insp.id, acciones };
}

export async function eliminarInspeccion(empresaId: string, id: string) {
  await requiereUsuario();
  const i = await db.inspeccion.findUniqueOrThrow({ where: { id } });
  if (i.empresaId !== empresaId) return { error: "No encontrada." };
  await db.inspeccion.delete({ where: { id } });
  await actualizarDocumentos(empresaId, ["FOR-06", "PRG-06"]);
  revalidatePath(`/empresas/${empresaId}`, "layout");
  return { ok: true as const };
}
