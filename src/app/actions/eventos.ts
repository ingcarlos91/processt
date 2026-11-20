"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereUsuario } from "@/lib/auth/sesion";
import { actualizarDocumentos } from "@/lib/generador/documentos";
import { agregarPeligroCatalogo } from "@/lib/matriz/instanciar";
import { TIPOS_EVENTO, faltasParaCerrar, type Analisis, type Integrante } from "@/lib/eventos";
import { sugerirInvestigacion } from "@/lib/ia/investigacion";

// Documentos que se alimentan de eventos y acciones.
const DOCS = ["FOR-08", "FOR-06", "ACT-06", "DOC-11", "ACT-02", "DOC-12"];
const dia = (s?: string | null) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(s + "T12:00:00Z") : null);
async function listo(empresaId: string, eventoId?: string) {
  await actualizarDocumentos(empresaId, DOCS);
  revalidatePath(`/empresas/${empresaId}`, "layout");
  if (eventoId) revalidatePath(`/empresas/${empresaId}/accidentes/${eventoId}`);
}
async function delaEmpresa(empresaId: string, eventoId: string) {
  const ev = await db.evento.findUnique({ where: { id: eventoId } });
  if (!ev || ev.empresaId !== empresaId) throw new Error("Evento no encontrado.");
  return ev;
}

export type DatosEvento = {
  tipo: string; fecha: string; hora?: string; lugar?: string; descripcion?: string;
  trabajadorNombre?: string; trabajadorTipoDoc?: string; trabajadorCedula?: string; vinculacion?: string; antiguedad?: string;
  cargoId?: string; cargo?: string; tarea?: string; mecanismo?: string; agente?: string; lesion?: string; parteCuerpo?: string;
  gravedad?: string; testigos?: string; diasIncapacidad?: number; diasCargados?: number; casoNuevo?: boolean; origenAusencia?: string;
  // Variables del FURAT que el informe retoma (Res. 1401/2007 arts. 9 y 10)
  sitioExacto?: string; tipoAccidente?: string; jornadaHabitual?: string; turno?: string; tiempoEmpresa?: string; tiempoLaborado?: string;
  versionTrabajador?: string; versionTestigos?: string;
  // Datos FURAT de la persona (Res. 156/2005 anexo; Res. 1401/2007 art. 9), precargados del trabajador elegido
  sexo?: string; fechaNacimiento?: string; eps?: string; afp?: string; sede?: string;
  // Trabajadores potencialmente expuestos y acciones para ellos (Res. 0312/2019 estándar 3.2.2)
  expuestos?: string;
};

function datos(d: DatosEvento) {
  const t = TIPOS_EVENTO[d.tipo];
  if (!t) throw new Error("Tipo de evento no válido.");
  const fecha = dia(d.fecha);
  if (!fecha) throw new Error("La fecha del evento es obligatoria.");
  // AT: leve, grave o mortal (Res. 1401/2007 art. 3). EL: solo se distingue si causó la muerte (Decreto 1072/2015 art. 2.2.4.1.6).
  const gravedad = d.tipo === "AT" ? (d.gravedad ?? "leve") : d.tipo === "EL" && d.gravedad === "mortal" ? "mortal" : "leve";
  return {
    tipo: d.tipo, fecha, hora: d.hora || null, lugar: d.lugar || null, descripcion: d.descripcion || null,
    trabajadorNombre: d.trabajadorNombre || null, trabajadorTipoDoc: d.trabajadorTipoDoc || "CC", trabajadorCedula: d.trabajadorCedula || null, vinculacion: d.vinculacion || null, antiguedad: d.antiguedad || null,
    cargoId: d.cargoId || null, cargo: d.cargo || null, tarea: d.tarea || null, mecanismo: d.mecanismo || null, agente: d.agente || null,
    lesion: d.lesion || null, parteCuerpo: d.parteCuerpo || null, gravedad, mortal: gravedad === "mortal", testigos: d.testigos || null,
    diasIncapacidad: Math.max(0, Number(d.diasIncapacidad) || 0), diasCargados: Math.max(0, Number(d.diasCargados) || 0),
    casoNuevo: d.casoNuevo ?? true, origenAusencia: d.origenAusencia || null,
    sitioExacto: d.sitioExacto || null, tipoAccidente: d.tipo === "AT" ? d.tipoAccidente || null : null,
    jornadaHabitual: d.jornadaHabitual === "si" ? true : d.jornadaHabitual === "no" ? false : null, turno: d.turno || null,
    tiempoEmpresa: d.tiempoEmpresa || null, tiempoLaborado: d.tiempoLaborado || null,
    versionTrabajador: d.versionTrabajador || null, versionTestigos: d.versionTestigos || null,
    sexo: d.sexo || null, fechaNacimiento: dia(d.fechaNacimiento), eps: d.eps?.trim() || null, afp: d.afp?.trim() || null, sede: d.sede?.trim() || null,
    expuestos: d.expuestos?.trim() || null,
  };
}

export async function crearEvento(empresaId: string, d: DatosEvento) {
  await requiereUsuario();
  try {
    const x = datos(d);
    if (x.cargoId) x.cargo = (await db.cargo.findUnique({ where: { id: x.cargoId } }))?.nombre ?? x.cargo;
    const ev = await db.evento.create({ data: { empresaId, ...x, invEstado: TIPOS_EVENTO[d.tipo].investiga ? "pendiente" : "no_aplica" } });
    await listo(empresaId);
    return { ok: true as const, id: ev.id };
  } catch (e) { return { error: e instanceof Error ? e.message : String(e) }; }
}

export async function actualizarEvento(empresaId: string, eventoId: string, d: DatosEvento) {
  await requiereUsuario();
  const prev = await delaEmpresa(empresaId, eventoId);
  try {
    const x = datos(d);
    if (x.cargoId) x.cargo = (await db.cargo.findUnique({ where: { id: x.cargoId } }))?.nombre ?? x.cargo;
    const invEstado = !TIPOS_EVENTO[d.tipo].investiga ? "no_aplica" : prev.invEstado === "no_aplica" ? "pendiente" : prev.invEstado;
    await db.evento.update({ where: { id: eventoId }, data: { ...x, invEstado } });
    await listo(empresaId, eventoId);
    return { ok: true as const };
  } catch (e) { return { error: e instanceof Error ? e.message : String(e) }; }
}

export async function eliminarEventoCompleto(empresaId: string, eventoId: string) {
  await requiereUsuario();
  await delaEmpresa(empresaId, eventoId);
  await db.evento.delete({ where: { id: eventoId } });
  await listo(empresaId);
  return { ok: true as const };
}

export async function guardarReporte(empresaId: string, eventoId: string, d: { fechaReporte?: string; furatNumero?: string; reporteMinisterio?: string; invRemitidaArl?: string }) {
  await requiereUsuario();
  await delaEmpresa(empresaId, eventoId);
  const fechaReporte = dia(d.fechaReporte);
  await db.evento.update({ where: { id: eventoId }, data: { fechaReporte, reportadoArl: !!fechaReporte, furatNumero: d.furatNumero || null, reporteMinisterio: dia(d.reporteMinisterio), invRemitidaArl: dia(d.invRemitidaArl) } });
  await listo(empresaId, eventoId);
  return { ok: true as const };
}

export type DatosInvestigacion = { equipo: Integrante[]; analisis: Analisis; lecciones?: string; peligroId?: string | null; invInicio?: string; invLugar?: string; invFechas?: string };

export async function guardarInvestigacion(empresaId: string, eventoId: string, d: DatosInvestigacion) {
  await requiereUsuario();
  const ev = await delaEmpresa(empresaId, eventoId);
  const limpio = (xs?: string[]) => (xs ?? []).map((x) => x.trim()).filter(Boolean);
  const analisis: Analisis = { porques: limpio(d.analisis.porques), actos: limpio(d.analisis.actos), condiciones: limpio(d.analisis.condiciones), personales: limpio(d.analisis.personales), trabajo: limpio(d.analisis.trabajo), conclusion: d.analisis.conclusion?.trim() || "" };
  const equipo: Integrante[] = d.equipo.filter((x) => x.nombre.trim()).map((x) => ({ nombre: x.nombre.trim(), cargo: x.cargo?.trim() || "", documento: x.documento?.trim() || "", rol: x.rol || "otro" }));
  await db.evento.update({ where: { id: eventoId }, data: {
    equipo, analisis, lecciones: d.lecciones || null, peligroId: d.peligroId || null,
    invInicio: dia(d.invInicio) ?? ev.invInicio ?? new Date(), invLugar: d.invLugar?.trim() || null, invFechas: d.invFechas?.trim() || null,
    invEstado: ev.invEstado === "cerrada" ? "cerrada" : "en_curso",
  } });
  await listo(empresaId, eventoId);
  return { ok: true as const };
}

/**
 * Cierra la investigación. Exige lo que la Res. 1401/2007 pide en el informe: descripción (art. 10), equipo según la gravedad
 * con identificación (arts. 7 y 13), causas inmediatas y básicas (art. 11) y medidas con responsable y fecha (art. 12).
 */
export async function cerrarInvestigacion(empresaId: string, eventoId: string, fechaCierre: string) {
  await requiereUsuario();
  const ev = await db.evento.findUniqueOrThrow({ where: { id: eventoId }, include: { acciones: true } });
  if (ev.empresaId !== empresaId) return { error: "Evento no encontrado." };
  const faltas = faltasParaCerrar(ev);
  if (faltas.length) return { error: `Para cerrar la investigación falta (Res. 1401/2007): ${faltas.join("; ")}.` };
  const cierre = dia(fechaCierre) ?? new Date();
  if (cierre < ev.fecha) return { error: "La fecha de cierre no puede ser anterior a la fecha del evento." };
  await db.evento.update({ where: { id: eventoId }, data: { invEstado: "cerrada", investigado: true, invCierre: cierre, invInicio: ev.invInicio ?? cierre } });
  await listo(empresaId, eventoId);
  return { ok: true as const };
}

export async function reabrirInvestigacion(empresaId: string, eventoId: string) {
  await requiereUsuario();
  await delaEmpresa(empresaId, eventoId);
  await db.evento.update({ where: { id: eventoId }, data: { invEstado: "en_curso", investigado: false, invCierre: null } });
  await listo(empresaId, eventoId);
  return { ok: true as const };
}

export async function sugerirAnalisis(empresaId: string, eventoId: string) {
  await requiereUsuario();
  await delaEmpresa(empresaId, eventoId);
  return sugerirInvestigacion(eventoId);
}

/** Agrega el peligro identificado a la matriz del cargo (retroalimentación de la investigación, GTC 45). */
export async function agregarPeligroDelEvento(empresaId: string, eventoId: string) {
  await requiereUsuario();
  const ev = await delaEmpresa(empresaId, eventoId);
  if (!ev.peligroId) return { error: "Seleccione primero el peligro relacionado." };
  if (!ev.cargoId) return { error: "El evento no tiene un cargo de la empresa asociado." };
  const ya = await db.peligroEvaluado.findFirst({ where: { empresaId, peligroId: ev.peligroId, OR: [{ cargoId: ev.cargoId }, { tarea: { cargos: { some: { cargoId: ev.cargoId } } } }] } });
  if (ya) return { error: "Ese peligro ya está en la matriz de este cargo. Revise su valoración y controles en Cargos y matriz." };
  await agregarPeligroCatalogo(empresaId, "cargo", ev.cargoId, ev.peligroId, "sugerido", "investigacion");
  revalidatePath(`/empresas/${empresaId}`, "layout");
  return { ok: true as const };
}

// ───────── Acciones correctivas, preventivas y de mejora (FOR-06) ─────────
export type DatosAccion = { hallazgo: string; causa?: string; tipo: string; jerarquia?: string; dirigidaA?: string; descripcion: string; responsable?: string; fechaLimite?: string; origen?: string };

export async function guardarAccion(empresaId: string, d: DatosAccion & { id?: string; eventoId?: string }) {
  await requiereUsuario();
  if (!d.descripcion?.trim()) return { error: "Describa la acción." };
  const data = {
    hallazgo: d.hallazgo?.trim() || "Hallazgo de investigación", causa: d.causa || null, tipo: d.tipo || "correctiva", jerarquia: d.jerarquia || null, dirigidaA: d.dirigidaA || null,
    descripcion: d.descripcion.trim(), responsable: d.responsable || null, fechaLimite: dia(d.fechaLimite), origen: d.origen || (d.eventoId ? "investigacion" : "inspeccion"),
  };
  if (d.id) {
    const a = await db.accion.findUniqueOrThrow({ where: { id: d.id } });
    if (a.empresaId !== empresaId) return { error: "Acción no encontrada." };
    await db.accion.update({ where: { id: d.id }, data });
  } else await db.accion.create({ data: { empresaId, eventoId: d.eventoId || null, ...data } });
  await listo(empresaId, d.eventoId);
  return { ok: true as const };
}

export async function cerrarAccion(empresaId: string, id: string, d: { fechaCierre: string; eficacia: string }) {
  await requiereUsuario();
  const a = await db.accion.findUniqueOrThrow({ where: { id } });
  if (a.empresaId !== empresaId) return { error: "Acción no encontrada." };
  if (!d.eficacia?.trim()) return { error: "Describa cómo se verificó la eficacia de la acción (Decreto 1072/2015 art. 2.2.4.6.33)." };
  await db.accion.update({ where: { id }, data: { estado: "cerrada", fechaCierre: dia(d.fechaCierre) ?? new Date(), eficacia: d.eficacia.trim() } });
  if (a.actividadId) await db.actividadPlan.update({ where: { id: a.actividadId }, data: { estado: "EJECUTADA", fechaEjecucion: dia(d.fechaCierre) ?? new Date() } });
  await listo(empresaId, a.eventoId ?? undefined);
  return { ok: true as const };
}

export async function eliminarAccion(empresaId: string, id: string) {
  await requiereUsuario();
  const a = await db.accion.findUniqueOrThrow({ where: { id } });
  if (a.empresaId !== empresaId) return { error: "Acción no encontrada." };
  await db.accion.delete({ where: { id } });
  await listo(empresaId, a.eventoId ?? undefined);
  return { ok: true as const };
}

/** Lleva la acción al plan anual de trabajo, en el mes de su fecha límite. */
export async function enviarAccionAlPlan(empresaId: string, id: string) {
  await requiereUsuario();
  const a = await db.accion.findUniqueOrThrow({ where: { id }, include: { evento: true } });
  if (a.empresaId !== empresaId) return { error: "Acción no encontrada." };
  if (a.actividadId) return { error: "Esta acción ya está en el plan anual." };
  const f = a.fechaLimite ?? new Date(Date.now() + 30 * 864e5);
  const act = await db.actividadPlan.create({ data: {
    empresaId, anio: f.getUTCFullYear(), mes: f.getUTCMonth() + 1, nombre: `Acción ${a.tipo}: ${a.descripcion}`.slice(0, 250),
    descripcion: a.evento ? `Derivada de la investigación del evento del ${a.evento.fecha.toISOString().slice(0, 10)}` : a.hallazgo,
    estandarCodigo: a.eventoId ? "3.2.2" : "7.1.1", normaRef: a.eventoId ? "Res. 1401/2007; Decreto 1072/2015 art. 2.2.4.6.33" : "Decreto 1072/2015 art. 2.2.4.6.33",
    responsable: a.responsable, origen: "accion",
  } });
  await db.accion.update({ where: { id }, data: { actividadId: act.id } });
  await listo(empresaId, a.eventoId ?? undefined);
  return { ok: true as const, anio: act.anio, mes: act.mes };
}

/** Registra o corrige la causa raíz de una acción (de cualquier origen: inspección, auditoría, evento). */
export async function actualizarCausaAccion(empresaId: string, id: string, causa: string) {
  await requiereUsuario();
  const a = await db.accion.findUniqueOrThrow({ where: { id } });
  if (a.empresaId !== empresaId) return { error: "Acción no encontrada." };
  await db.accion.update({ where: { id }, data: { causa: causa.trim() || null } });
  await listo(empresaId, a.eventoId ?? undefined);
  return { ok: true as const };
}
