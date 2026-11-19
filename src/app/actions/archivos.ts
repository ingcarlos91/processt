"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereUsuario } from "@/lib/auth/sesion";
import { guardarArchivo, ESTANDAR_COMITE } from "@/lib/archivos";

const rv = (id: string) => revalidatePath(`/empresas/${id}`, "layout");

/**
 * Sube un archivo. Efectos según el tipo:
 * - DOCUMENTO_FIRMADO: el documento pasa a "Firmado" y se guarda qué versión se firmó.
 * - EVIDENCIA de una actividad del plan: la actividad pasa a "Ejecutada".
 * - ACTA de un comité: queda asociada al estándar del comité.
 */
export async function subirArchivo(empresaId: string, fd: FormData) {
  const u = await requiereUsuario();
  const file = fd.get("archivo");
  if (!(file instanceof File) || file.size === 0) return { error: "Seleccione un archivo." };
  const tipo = String(fd.get("tipo") ?? "EVIDENCIA");
  const documentoId = (fd.get("documentoId") as string) || null;
  const actividadId = (fd.get("actividadId") as string) || null;
  const comiteId = (fd.get("comiteId") as string) || null;
  const eventoId = (fd.get("eventoId") as string) || null;
  const inspeccionId = (fd.get("inspeccionId") as string) || null;
  const auditoriaId = (fd.get("auditoriaId") as string) || null;
  const diagnosticoId = (fd.get("diagnosticoId") as string) || null;
  let estandarCodigo = (fd.get("estandarCodigo") as string) || null;
  const fechaTxt = (fd.get("fecha") as string) || "";
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(fechaTxt) ? new Date(fechaTxt + "T12:00:00Z") : new Date();
  let descripcion = String(fd.get("descripcion") ?? "").trim();

  let documentoVersion: number | null = null;
  if (documentoId) {
    const d = await db.documento.findUniqueOrThrow({ where: { id: documentoId } });
    documentoVersion = d.version;
    descripcion ||= `${d.codigo} ${d.nombre} (firmado, versión ${d.version})`;
  }
  if (actividadId) {
    const a = await db.actividadPlan.findUniqueOrThrow({ where: { id: actividadId } });
    estandarCodigo ||= a.estandarCodigo;
    descripcion ||= a.nombre;
  }
  if (comiteId) {
    const c = await db.comite.findUniqueOrThrow({ where: { id: comiteId } });
    estandarCodigo ||= ESTANDAR_COMITE[c.tipo] ?? null;
    descripcion ||= `Acta ${c.tipo}`;
  }
  if (eventoId) {
    const ev = await db.evento.findUniqueOrThrow({ where: { id: eventoId } });
    if (ev.empresaId !== empresaId) return { error: "Evento no encontrado." };
    estandarCodigo ||= "3.2.2";
    descripcion ||= `Soporte del evento del ${ev.fecha.toISOString().slice(0, 10)}`;
  }
  if (inspeccionId) {
    const ins = await db.inspeccion.findUniqueOrThrow({ where: { id: inspeccionId } });
    if (ins.empresaId !== empresaId) return { error: "Inspección no encontrada." };
    estandarCodigo ||= "4.2.4";
    descripcion ||= `Registro de ${ins.lista}`;
  }
  if (auditoriaId) {
    const au = await db.auditoria.findUniqueOrThrow({ where: { id: auditoriaId } });
    if (au.empresaId !== empresaId) return { error: "Auditoría no encontrada." };
    estandarCodigo ||= "6.1.2";
    descripcion ||= `Auditoría interna ${au.anio}`;
  }
  if (diagnosticoId) {
    const dg = await db.diagnostico.findUniqueOrThrow({ where: { id: diagnosticoId } });
    if (dg.empresaId !== empresaId) return { error: "Diagnóstico no encontrado." };
    estandarCodigo ||= "2.3.1";
    descripcion ||= "Diagnóstico inicial";
  }
  descripcion ||= file.name;

  let guardado;
  try { guardado = await guardarArchivo(empresaId, file); } catch (e) { return { error: e instanceof Error ? e.message : String(e) }; }
  const nombreUsuario = (await db.usuario.findUnique({ where: { id: u.id }, select: { nombre: true } }))?.nombre;
  await db.evidencia.create({ data: {
    empresaId, tipo, documentoId, documentoVersion, actividadId, comiteId, eventoId, inspeccionId, auditoriaId, diagnosticoId, estandarCodigo, descripcion, fecha,
    archivoUrl: guardado.ruta, nombreArchivo: file.name, mime: file.type, tamano: file.size, subidoPor: nombreUsuario,
  } });
  if (documentoId) await db.documento.update({ where: { id: documentoId }, data: { estado: "FIRMADO" } });
  if (eventoId) revalidatePath(`/empresas/${empresaId}/accidentes/${eventoId}`);
  if (actividadId) await db.actividadPlan.update({ where: { id: actividadId }, data: { estado: "EJECUTADA", fechaEjecucion: fecha } });
  rv(empresaId);
  return { ok: true };
}

/** Retira un archivo sin borrarlo (queda en el historial; la norma exige conservar registros). */
export async function retirarArchivo(empresaId: string, id: string, motivo: string) {
  await requiereUsuario();
  await db.evidencia.update({ where: { id }, data: { activo: false, motivoBaja: motivo || "Retirado por el usuario" } });
  rv(empresaId);
  return { ok: true };
}

export async function restaurarArchivo(empresaId: string, id: string) {
  await requiereUsuario();
  await db.evidencia.update({ where: { id }, data: { activo: true, motivoBaja: null } });
  rv(empresaId);
  return { ok: true };
}
