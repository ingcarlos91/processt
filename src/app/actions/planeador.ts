"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereUsuario } from "@/lib/auth/sesion";

const dia = (s: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + "T12:00:00Z") : null);
const rv = () => { revalidatePath("/planeador"); revalidatePath("/", "layout"); };

export async function guardarRecordatorio(d: { id?: string; empresaId?: string | null; fecha: string; titulo: string; notas?: string }) {
  await requiereUsuario();
  const fecha = dia(d.fecha);
  if (!fecha || !d.titulo.trim()) return { error: "Escriba el título y la fecha." };
  const data = { empresaId: d.empresaId || null, fecha, titulo: d.titulo.trim(), notas: d.notas?.trim() || null };
  if (d.id) await db.recordatorio.update({ where: { id: d.id }, data }); else await db.recordatorio.create({ data });
  rv();
  return { ok: true as const };
}

export async function marcarRecordatorio(id: string, hecho: boolean) {
  await requiereUsuario();
  await db.recordatorio.update({ where: { id }, data: { hecho, hechoEn: hecho ? new Date() : null } });
  rv();
  return { ok: true as const };
}

export async function eliminarRecordatorio(id: string) {
  await requiereUsuario();
  await db.recordatorio.delete({ where: { id } });
  rv();
  return { ok: true as const };
}
