"use server";
import { revalidatePath } from "next/cache";
import { recalcularEmpresa } from "@/lib/empresa";
import { db } from "@/lib/db";
import { requiereUsuario } from "@/lib/auth/sesion";
import { actualizarDocumentos } from "@/lib/generador/documentos";

const DOCS = ["FOR-02", "MTZ-04", "PRG-01", "FOR-01"];
const dia = (s?: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + "T12:00:00Z") : null);
async function listo(empresaId: string) {
  // Las marcas por trabajador (conduce, teletrabajo, turno nocturno, alto riesgo, sexo) alimentan las reglas.
  await recalcularEmpresa(empresaId).catch(() => null);
  await actualizarDocumentos(empresaId, DOCS);
  revalidatePath(`/empresas/${empresaId}`, "layout");
  revalidatePath("/planeador");
}
async function delaEmpresa(empresaId: string, trabajadorId: string) {
  const t = await db.trabajador.findUnique({ where: { id: trabajadorId } });
  if (!t || t.empresaId !== empresaId) throw new Error("Trabajador no encontrado.");
  return t;
}

export type DatosTrabajador = {
  id?: string; nombres: string; tipoDoc?: string; documento?: string; cargoId?: string; vinculacion?: string; fechaIngreso?: string;
  sexo?: string; fechaNacimiento?: string; escolaridad?: string; telefono?: string; correo?: string; eps?: string; afp?: string;
  conduce?: boolean; modalidad?: string; turnoNocturno?: boolean; altoRiesgoPension?: boolean; manipulaAlimentos?: boolean;
};

export async function guardarTrabajador(empresaId: string, d: DatosTrabajador) {
  await requiereUsuario();
  if (!d.nombres?.trim()) return { error: "Escriba el nombre." };
  const documento = d.documento?.trim() || null;
  if (documento) {
    const otro = await db.trabajador.findFirst({ where: { empresaId, documento, NOT: d.id ? { id: d.id } : undefined } });
    if (otro) return { error: `Ya existe un trabajador con el documento ${documento}: ${otro.nombres}.` };
  }
  const data = {
    nombres: d.nombres.trim(), tipoDoc: d.tipoDoc || "CC", documento, cargoId: d.cargoId || null, vinculacion: d.vinculacion || "planta",
    fechaIngreso: dia(d.fechaIngreso), sexo: d.sexo || null, fechaNacimiento: dia(d.fechaNacimiento), escolaridad: d.escolaridad || null,
    conduce: !!d.conduce, modalidad: d.modalidad || "presencial", turnoNocturno: !!d.turnoNocturno, altoRiesgoPension: !!d.altoRiesgoPension, manipulaAlimentos: !!d.manipulaAlimentos,
    telefono: d.telefono || null, correo: d.correo || null, eps: d.eps || null, afp: d.afp || null,
  };
  if (d.id) { await delaEmpresa(empresaId, d.id); await db.trabajador.update({ where: { id: d.id }, data }); }
  else await db.trabajador.create({ data: { empresaId, ...data } });
  await listo(empresaId);
  return { ok: true as const };
}

export async function retirarTrabajador(empresaId: string, id: string, fecha: string) {
  await requiereUsuario();
  await delaEmpresa(empresaId, id);
  await db.trabajador.update({ where: { id }, data: { activo: false, fechaRetiro: dia(fecha) ?? new Date() } });
  await listo(empresaId);
  return { ok: true as const };
}

export async function reactivarTrabajador(empresaId: string, id: string) {
  await requiereUsuario();
  await delaEmpresa(empresaId, id);
  await db.trabajador.update({ where: { id }, data: { activo: true, fechaRetiro: null } });
  await listo(empresaId);
  return { ok: true as const };
}

export async function eliminarTrabajador(empresaId: string, id: string) {
  await requiereUsuario();
  await delaEmpresa(empresaId, id);
  await db.trabajador.delete({ where: { id } });
  await listo(empresaId);
  return { ok: true as const };
}

/**
 * Importa trabajadores pegados desde Excel: una fila por trabajador con
 * nombre, documento, cargo y, opcionales, fecha de ingreso (AAAA-MM-DD o DD/MM/AAAA) y vinculación.
 * Si el documento ya existe, actualiza el registro.
 */
export async function importarTrabajadores(empresaId: string, texto: string) {
  await requiereUsuario();
  const cargos = await db.cargo.findMany({ where: { empresaId } });
  const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  const fecha = (t: string) => { const x = t.trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return dia(x); const m = x.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/); return m ? dia(`${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`) : null; };
  const VINC: Record<string, string> = { planta: "planta", contratista: "contratista", aprendiz: "aprendiz", practicante: "aprendiz", mision: "mision", "en mision": "mision" };
  let creados = 0, actualizados = 0; const sinCargo: string[] = [];
  for (const linea of texto.split(/\r?\n/)) {
    const cols = linea.split(/\t|;/).map((x) => x.trim());
    if (!cols[0] || /^nombre/i.test(cols[0])) continue;
    const [nombres, documento = "", cargoTxt = "", ingreso = "", vinc = ""] = cols;
    const cargo = cargoTxt ? cargos.find((c) => norm(c.nombre) === norm(cargoTxt)) : undefined;
    if (cargoTxt && !cargo) sinCargo.push(cargoTxt);
    const data = { nombres, documento: documento || null, cargoId: cargo?.id ?? null, fechaIngreso: fecha(ingreso), vinculacion: VINC[norm(vinc)] ?? "planta" };
    const prev = documento ? await db.trabajador.findFirst({ where: { empresaId, documento } }) : null;
    if (prev) { await db.trabajador.update({ where: { id: prev.id }, data: { ...data, cargoId: data.cargoId ?? prev.cargoId, fechaIngreso: data.fechaIngreso ?? prev.fechaIngreso } }); actualizados++; }
    else { await db.trabajador.create({ data: { empresaId, ...data } }); creados++; }
  }
  await listo(empresaId);
  return { ok: true as const, creados, actualizados, sinCargo: [...new Set(sinCargo)] };
}

// ───────── Exámenes médicos ocupacionales (FOR-02) ─────────
export async function guardarExamen(empresaId: string, d: { id?: string; trabajadorId: string; tipo: string; fecha: string; ips?: string; concepto: string; restricciones?: string; comunicadoTrabajador?: string; proximo?: string }) {
  await requiereUsuario();
  await delaEmpresa(empresaId, d.trabajadorId);
  const fecha = dia(d.fecha);
  if (!fecha) return { error: "Escriba la fecha del examen." };
  const data = { trabajadorId: d.trabajadorId, tipo: d.tipo, fecha, ips: d.ips || null, concepto: d.concepto, restricciones: d.restricciones?.trim() || null, comunicadoTrabajador: dia(d.comunicadoTrabajador), proximo: dia(d.proximo) };
  if (d.id) await db.examenMedico.update({ where: { id: d.id }, data }); else await db.examenMedico.create({ data });
  await listo(empresaId);
  return { ok: true as const };
}
export async function eliminarExamen(empresaId: string, id: string) {
  await requiereUsuario();
  const x = await db.examenMedico.findUniqueOrThrow({ where: { id }, include: { trabajador: true } });
  if (x.trabajador.empresaId !== empresaId) return { error: "No encontrado." };
  await db.examenMedico.delete({ where: { id } });
  await listo(empresaId);
  return { ok: true as const };
}

// ───────── Entrega de EPP (MTZ-04) ─────────
export async function guardarEntregas(empresaId: string, d: { trabajadorIds: string[]; fecha: string; elementos: string[]; cantidad?: number; tipo?: string; capacitado?: boolean; proximaReposicion?: string }) {
  await requiereUsuario();
  const fecha = dia(d.fecha);
  if (!fecha || !d.trabajadorIds.length || !d.elementos.filter(Boolean).length) return { error: "Elija trabajadores, elementos y fecha." };
  for (const t of d.trabajadorIds) await delaEmpresa(empresaId, t);
  await db.entregaEpp.createMany({ data: d.trabajadorIds.flatMap((trabajadorId) => d.elementos.filter(Boolean).map((elemento) => ({
    trabajadorId, fecha, elemento, cantidad: Math.max(1, Number(d.cantidad) || 1), tipo: d.tipo || "dotacion", capacitado: d.capacitado ?? true, proximaReposicion: dia(d.proximaReposicion),
  }))) });
  await listo(empresaId);
  return { ok: true as const, n: d.trabajadorIds.length * d.elementos.filter(Boolean).length };
}
export async function eliminarEntrega(empresaId: string, id: string) {
  await requiereUsuario();
  const x = await db.entregaEpp.findUniqueOrThrow({ where: { id }, include: { trabajador: true } });
  if (x.trabajador.empresaId !== empresaId) return { error: "No encontrado." };
  await db.entregaEpp.delete({ where: { id } });
  await listo(empresaId);
  return { ok: true as const };
}

// ───────── Capacitaciones ejecutadas (PRG-01) ─────────
export async function guardarCapacitacion(empresaId: string, d: { id?: string; fecha: string; tema: string; horas?: number; facilitador?: string; modalidad?: string; actividadId?: string; asistentes: string[] }) {
  await requiereUsuario();
  const fecha = dia(d.fecha);
  if (!fecha || !d.tema.trim()) return { error: "Escriba el tema y la fecha." };
  const data = { empresaId, fecha, tema: d.tema.trim(), horas: Math.max(0.5, Number(d.horas) || 1), facilitador: d.facilitador || null, modalidad: d.modalidad || "presencial", actividadId: d.actividadId || null };
  const cap = d.id ? await db.capacitacion.update({ where: { id: d.id }, data }) : await db.capacitacion.create({ data });
  await db.asistenciaCapacitacion.deleteMany({ where: { capacitacionId: cap.id, trabajadorId: { notIn: d.asistentes } } });
  for (const trabajadorId of d.asistentes) await db.asistenciaCapacitacion.upsert({ where: { capacitacionId_trabajadorId: { capacitacionId: cap.id, trabajadorId } }, update: {}, create: { capacitacionId: cap.id, trabajadorId } });
  if (d.actividadId) await db.actividadPlan.update({ where: { id: d.actividadId }, data: { estado: "EJECUTADA", fechaEjecucion: fecha } });
  await listo(empresaId);
  return { ok: true as const };
}
export async function eliminarCapacitacion(empresaId: string, id: string) {
  await requiereUsuario();
  const c = await db.capacitacion.findUniqueOrThrow({ where: { id } });
  if (c.empresaId !== empresaId) return { error: "No encontrada." };
  await db.capacitacion.delete({ where: { id } });
  await listo(empresaId);
  return { ok: true as const };
}
