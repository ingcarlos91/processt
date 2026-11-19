"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereUsuario } from "@/lib/auth/sesion";

const dia = (s?: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + "T12:00:00Z") : null);
const rv = (id: string) => { revalidatePath(`/empresas/${id}`, "layout"); revalidatePath("/planeador"); revalidatePath("/"); };

export async function guardarVisita(empresaId: string, d: { id?: string; fecha: string; horas: number; modalidad: string; atendio?: string; actividades: string; compromisos?: string }) {
  await requiereUsuario();
  const fecha = dia(d.fecha);
  if (!fecha || !d.actividades.trim()) return { error: "Escriba la fecha y lo que se hizo." };
  const data = { fecha, horas: Math.max(0.25, Number(d.horas) || 1), modalidad: d.modalidad || "presencial", atendio: d.atendio || null, actividades: d.actividades.trim(), compromisos: d.compromisos?.trim() || null };
  if (d.id) {
    const v = await db.visita.findUniqueOrThrow({ where: { id: d.id } });
    if (v.empresaId !== empresaId) return { error: "No encontrada." };
    await db.visita.update({ where: { id: d.id }, data });
  } else await db.visita.create({ data: { empresaId, ...data } });
  rv(empresaId);
  return { ok: true as const };
}

export async function eliminarVisita(empresaId: string, id: string) {
  await requiereUsuario();
  const v = await db.visita.findUniqueOrThrow({ where: { id } });
  if (v.empresaId !== empresaId) return { error: "No encontrada." };
  await db.visita.delete({ where: { id } });
  rv(empresaId);
  return { ok: true as const };
}

export async function guardarContrato(empresaId: string, d: { horasMes?: number | null; valorMes?: number | null }) {
  await requiereUsuario();
  await db.empresa.update({ where: { id: empresaId }, data: { contratoHorasMes: d.horasMes ? Number(d.horasMes) : null, contratoValorMes: d.valorMes ? Math.round(Number(d.valorMes)) : null } });
  rv(empresaId);
  return { ok: true as const };
}
