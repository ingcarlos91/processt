"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereUsuario } from "@/lib/auth/sesion";
import { actualizarDocumentos } from "@/lib/generador/documentos";
import { ASPECTOS, type ItemAuditoria } from "@/lib/auditoria";

const dia = (s?: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + "T12:00:00Z") : null);
const DOCS = ["FOR-06", "PRG-10", "ACT-06"];
async function listo(empresaId: string, id?: string) {
  await actualizarDocumentos(empresaId, DOCS);
  revalidatePath(`/empresas/${empresaId}`, "layout");
  if (id) revalidatePath(`/empresas/${empresaId}/auditoria/${id}`);
  revalidatePath("/planeador");
}
async function delaEmpresa(empresaId: string, id: string) {
  const a = await db.auditoria.findUnique({ where: { id } });
  if (!a || a.empresaId !== empresaId) throw new Error("Auditoría no encontrada.");
  return a;
}

export type PlanAuditoria = { anio: number; fechaInicio: string; auditor: string; auditorPerfil?: string; participantes?: string; alcance?: string; metodologia?: string };

/** Crea la auditoría del año con los 13 aspectos del Decreto 1072/2015 art. 2.2.4.6.30. */
export async function crearAuditoria(empresaId: string, d: PlanAuditoria) {
  await requiereUsuario();
  const fechaInicio = dia(d.fechaInicio);
  if (!fechaInicio || !d.auditor.trim()) return { error: "Escriba la fecha y el auditor." };
  const items: ItemAuditoria[] = ASPECTOS.map((a) => ({ ...a, resultado: "", evidencia: "", hallazgo: "" }));
  const a = await db.auditoria.create({ data: {
    empresaId, anio: d.anio, fechaInicio, auditor: d.auditor.trim(), auditorPerfil: d.auditorPerfil || null, participantes: d.participantes || null,
    alcance: d.alcance || null, metodologia: d.metodologia || null, items: items as object[],
  } });
  await listo(empresaId);
  return { ok: true as const, id: a.id };
}

export async function guardarAuditoria(empresaId: string, id: string, d: Partial<PlanAuditoria> & { items: ItemAuditoria[]; conclusiones?: string }) {
  await requiereUsuario();
  const a = await delaEmpresa(empresaId, id);
  if (a.estado === "cerrada") return { error: "La auditoría está cerrada; reábrala para editarla." };
  await db.auditoria.update({ where: { id }, data: {
    items: d.items.map(({ accion, ...x }) => ({ ...x, accion: accion ?? null })) as object[], conclusiones: d.conclusiones ?? a.conclusiones,
    ...(d.auditor ? { auditor: d.auditor } : {}), ...(d.auditorPerfil !== undefined ? { auditorPerfil: d.auditorPerfil || null } : {}),
    ...(d.participantes !== undefined ? { participantes: d.participantes || null } : {}), ...(d.alcance !== undefined ? { alcance: d.alcance || null } : {}),
    ...(d.metodologia !== undefined ? { metodologia: d.metodologia || null } : {}), ...(d.fechaInicio ? { fechaInicio: dia(d.fechaInicio) ?? a.fechaInicio } : {}),
  } });
  await listo(empresaId, id);
  return { ok: true as const };
}

/** Cierra la auditoría: exige todos los aspectos calificados y crea las acciones de las no conformidades (FOR-06). */
export async function cerrarAuditoria(empresaId: string, id: string, fechaCierre: string) {
  await requiereUsuario();
  const a = await delaEmpresa(empresaId, id);
  const items = (a.items ?? []) as ItemAuditoria[];
  const faltan = items.filter((i) => !i.resultado).map((i) => i.n);
  if (faltan.length) return { error: `Falta calificar los aspectos ${faltan.join(", ")}.` };
  if (items.some((i) => i.resultado === "no_conforme" && !i.hallazgo?.trim())) return { error: "Describa el hallazgo de cada no conformidad." };
  const fecha = dia(fechaCierre) ?? new Date();
  let n = 0;
  for (const i of items) {
    if (i.resultado !== "no_conforme" || !i.accion?.descripcion?.trim()) continue;
    const ya = await db.accion.findFirst({ where: { auditoriaId: id, hallazgo: { startsWith: `Auditoría ${a.anio} — ${i.aspecto}` } } });
    if (ya) continue;
    await db.accion.create({ data: {
      empresaId, auditoriaId: id, origen: "auditoria", fecha, hallazgo: `Auditoría ${a.anio} — ${i.aspecto}: ${i.hallazgo}`, causa: i.accion.causa?.trim() || null,
      tipo: "correctiva", jerarquia: "administrativo", descripcion: i.accion.descripcion.trim(), responsable: i.accion.responsable || null, fechaLimite: dia(i.accion.fechaLimite),
    } });
    n++;
  }
  await db.auditoria.update({ where: { id }, data: { estado: "cerrada", fechaCierre: fecha } });
  await listo(empresaId, id);
  return { ok: true as const, acciones: n };
}

export async function reabrirAuditoria(empresaId: string, id: string) {
  await requiereUsuario();
  await delaEmpresa(empresaId, id);
  await db.auditoria.update({ where: { id }, data: { estado: "en_curso", fechaCierre: null } });
  await listo(empresaId, id);
  return { ok: true as const };
}

export async function eliminarAuditoria(empresaId: string, id: string) {
  await requiereUsuario();
  await delaEmpresa(empresaId, id);
  await db.auditoria.delete({ where: { id } });
  await listo(empresaId);
  return { ok: true as const };
}
