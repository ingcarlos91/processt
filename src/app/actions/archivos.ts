"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereEmpresa, requiereRegistro } from "@/lib/auth/acceso";
import { guardarArchivo, ESTANDAR_COMITE } from "@/lib/archivos";

const rv = (id: string) => revalidatePath(`/empresas/${id}`, "layout");

/**
 * Sube un archivo. Efectos según el tipo:
 * - DOCUMENTO_FIRMADO: el documento pasa a "Firmado" y se guarda qué versión se firmó.
 * - EVIDENCIA de una actividad del plan: la actividad pasa a "Ejecutada".
 * - ACTA de un comité: queda asociada al estándar del comité.
 */
export async function subirArchivo(empresaId: string, fd: FormData) {
  const u = await requiereEmpresa(empresaId);
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

  // Estándar de la evidencia: el primero de la lista que aplique a la empresa (7, 21 o 60 estándares),
  // para que la evidencia aparezca en Evidencias bajo un estándar que la empresa sí tiene.
  const emp = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { resultadoReglas: true } });
  const aplican = new Set(((emp.resultadoReglas as { estandares?: string[] } | null)?.estandares ?? []));
  const pref = (...codigos: string[]) => codigos.find((c) => aplican.has(c)) ?? codigos[0];

  let documentoVersion: number | null = null;
  if (documentoId) {
    const d = await db.documento.findUniqueOrThrow({ where: { id: documentoId } });
    if (d.empresaId !== empresaId) return { error: "Documento no encontrado." };
    documentoVersion = d.version;
    descripcion ||= `${d.codigo} ${d.nombre} (firmado, versión ${d.version})`;
  }
  if (actividadId) {
    const a = await db.actividadPlan.findUniqueOrThrow({ where: { id: actividadId } });
    if (a.empresaId !== empresaId) return { error: "Actividad no encontrada." };
    estandarCodigo ||= a.estandarCodigo;
    descripcion ||= a.nombre;
  }
  if (comiteId) {
    const c = await db.comite.findUniqueOrThrow({ where: { id: comiteId } });
    if (c.empresaId !== empresaId) return { error: "Comité no encontrado." };
    estandarCodigo ||= c.tipo === "BRIGADA" ? pref("5.1.2", "5.1.1") : c.tipo === "CCL" ? pref("1.1.8", "1.1.6") : pref(ESTANDAR_COMITE[c.tipo] ?? "1.1.6", "1.1.1");
    descripcion ||= `Acta ${c.tipo}`;
  }
  if (eventoId) {
    const ev = await db.evento.findUniqueOrThrow({ where: { id: eventoId } });
    if (ev.empresaId !== empresaId) return { error: "Evento no encontrado." };
    estandarCodigo ||= pref("3.2.2", "3.2.1", "1.1.4");
    descripcion ||= `Soporte del evento del ${ev.fecha.toISOString().slice(0, 10)}`;
  }
  if (inspeccionId) {
    const ins = await db.inspeccion.findUniqueOrThrow({ where: { id: inspeccionId } });
    if (ins.empresaId !== empresaId) return { error: "Inspección no encontrada." };
    estandarCodigo ||= pref("4.2.4", "4.2.1", "4.1.2");
    descripcion ||= `Registro de ${ins.lista}`;
  }
  if (auditoriaId) {
    const au = await db.auditoria.findUniqueOrThrow({ where: { id: auditoriaId } });
    if (au.empresaId !== empresaId) return { error: "Auditoría no encontrada." };
    estandarCodigo ||= pref("6.1.2", "6.1.3", "2.4.1");
    descripcion ||= `Auditoría interna ${au.anio}`;
  }
  if (diagnosticoId) {
    const dg = await db.diagnostico.findUniqueOrThrow({ where: { id: diagnosticoId } });
    if (dg.empresaId !== empresaId) return { error: "Diagnóstico no encontrado." };
    estandarCodigo ||= pref("2.3.1", "2.4.1");
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
  await requiereRegistro("evidencia", id, empresaId);
  await db.evidencia.update({ where: { id }, data: { activo: false, motivoBaja: motivo || "Retirado por el usuario" } });
  rv(empresaId);
  return { ok: true };
}

export async function restaurarArchivo(empresaId: string, id: string) {
  await requiereRegistro("evidencia", id, empresaId);
  await db.evidencia.update({ where: { id }, data: { activo: true, motivoBaja: null } });
  rv(empresaId);
  return { ok: true };
}
