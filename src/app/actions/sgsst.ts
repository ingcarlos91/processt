"use server";
import { actualizarDocumentosExistentes } from "@/lib/generador/documentos";
import { requiereUsuario } from "@/lib/auth/sesion";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { generarDocumentos } from "@/lib/generador/documentos";
import { construirContexto } from "@/lib/generador/contexto";
import { generarPlan } from "@/lib/plan/generar";
import { calificar } from "@/lib/evaluacion";

const rv = (id: string) => revalidatePath(`/empresas/${id}`, "layout");

// ───────── Evaluación de estándares mínimos (Res. 0312 arts. 27-28) ─────────
const MAPA_ESTADO_ACTUAL: Record<string, string[]> = {
  responsable: ["1.1.1"], afiliacion: ["1.1.4"], copasst: ["1.1.6"], convivencia: ["1.1.8"], capacitacion: ["1.2.1"], induccion: ["1.2.2"],
  curso50h: ["1.2.3"], politica: ["2.1.1"], planAnual: ["2.4.1"], examenes: ["3.1.4"], reporteAT: ["3.2.1"], investigacion: ["3.2.2"],
  matriz: ["4.1.2"], epp: ["4.2.6"], mantenimiento: ["4.2.5"], emergencias: ["5.1.1"], brigada: ["5.1.2"], revision: ["6.1.3"],
};

export async function crearEvaluacion(empresaId: string, tipo: "inicial" | "anual", anio: number) {
  await requiereUsuario();
  const rr = await recalcularEmpresa(empresaId);
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId } });
  const est = (e.estadoActual ?? {}) as Record<string, boolean>;
  const cumple = new Set(Object.entries(MAPA_ESTADO_ACTUAL).filter(([k]) => est[k]).flatMap(([, v]) => v));
  const estandares = await db.estandar.findMany({ where: { codigo: { in: rr.estandares } } });
  const ev = await db.evaluacion.create({
    data: { empresaId, tipo, anio, nivel: rr.nivel, items: { create: estandares.map((s) => ({ estandarId: s.id, estado: tipo === "inicial" && cumple.has(s.codigo) ? "CUMPLE" : "PENDIENTE" })) } },
  });
  rv(empresaId);
  return ev.id;
}

export async function actualizarItemEvaluacion(empresaId: string, itemId: string, d: { estado?: string; justificacion?: string; observacion?: string }) {
  await requiereUsuario();
  await db.evaluacionItem.update({ where: { id: itemId }, data: d });
  rv(empresaId);
}

export async function cerrarEvaluacion(empresaId: string, evaluacionId: string) {
  await requiereUsuario();
  const ev = await db.evaluacion.findUniqueOrThrow({ where: { id: evaluacionId }, include: { items: { include: { estandar: true } } } });
  const faltaJust = ev.items.filter((i) => i.estado === "NO_APLICA" && !i.justificacion?.trim());
  if (faltaJust.length) return { error: `Los ítems marcados "No aplica" requieren justificación: ${faltaJust.map((i) => i.estandar.codigo).join(", ")}` };
  const cal = calificar(ev.items.map((i) => ({ codigo: i.estandar.codigo, puntaje: i.estandar.puntaje, estado: i.estado })), ev.nivel);
  await db.evaluacion.update({ where: { id: ev.id }, data: { puntajeBruto: cal.puntajeBruto, puntajeAjustado: cal.puntajeAjustado, valoracion: cal.valoracion, cerrada: true } });
  // Plan de mejoramiento: un renglón por ítem no cumplido (sin duplicar)
  const existentes = await db.planMejoramientoItem.findMany({ where: { evaluacionId } });
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId } });
  const resp = ((e.responsableSst ?? {}) as { nombre?: string }).nombre || "Responsable del SG-SST";
  const limite = new Date(); limite.setMonth(limite.getMonth() + cal.mesesReporte);
  for (const i of ev.items.filter((x) => x.estado === "NO_CUMPLE" || x.estado === "PENDIENTE")) {
    if (existentes.some((x) => x.estandarCodigo === i.estandar.codigo)) continue;
    await db.planMejoramientoItem.create({ data: {
      evaluacionId, estandarCodigo: i.estandar.codigo, actividad: i.estandar.actividadSugerida ?? i.estandar.descripcion, responsable: resp,
      fechaLimite: limite, recursos: "Humanos y financieros según presupuesto SST", soporte: i.estandar.modoVerificacion ?? "",
    } });
  }
  await generarDocumentos(empresaId, ["DOC-05", "PLN-02"]).catch(() => null);
  rv(empresaId);
  return { ok: true, ...cal };
}

export async function reabrirEvaluacion(empresaId: string, evaluacionId: string) {
  await requiereUsuario();
  await db.evaluacion.update({ where: { id: evaluacionId }, data: { cerrada: false } });
  rv(empresaId);
}

export async function eliminarEvaluacion(empresaId: string, evaluacionId: string) {
  await requiereUsuario();
  await db.evaluacion.delete({ where: { id: evaluacionId } });
  rv(empresaId);
}

export async function actualizarPlanMejora(empresaId: string, id: string, d: { actividad?: string; responsable?: string; fechaLimite?: string; recursos?: string; soporte?: string; estado?: string; avance?: string }) {
  await requiereUsuario();
  await db.planMejoramientoItem.update({ where: { id }, data: { ...d, fechaLimite: d.fechaLimite ? new Date(d.fechaLimite) : undefined } });
  rv(empresaId);
}

// ───────── Documentos ─────────
export async function generarTodo(empresaId: string) {
  await requiereUsuario();
  await recalcularEmpresa(empresaId);
  const r = await generarDocumentos(empresaId);
  rv(empresaId);
  return { total: r.length, revisar: r.reduce((s, x) => s + x.revisar, 0) };
}

export async function regenerarDocumento(empresaId: string, codigo: string) {
  await requiereUsuario();
  const r = await generarDocumentos(empresaId, [codigo]);
  rv(empresaId);
  return r[0];
}

export async function guardarSeccion(empresaId: string, seccionId: string, contenido: string) {
  await requiereUsuario();
  const s = await db.documentoSeccion.findUniqueOrThrow({ where: { id: seccionId } });
  const editado = contenido.trim() === s.contenidoGenerado.trim() ? null : contenido;
  await db.documentoSeccion.update({ where: { id: seccionId }, data: { contenidoEditado: editado, requiereRevision: false } });
  rv(empresaId);
}

export async function restaurarSeccion(empresaId: string, seccionId: string) {
  await requiereUsuario();
  await db.documentoSeccion.update({ where: { id: seccionId }, data: { contenidoEditado: null, requiereRevision: false } });
  rv(empresaId);
}

export async function marcarRevisada(empresaId: string, seccionId: string) {
  await requiereUsuario();
  await db.documentoSeccion.update({ where: { id: seccionId }, data: { requiereRevision: false } });
  rv(empresaId);
}

export async function cambiarEstadoDocumento(empresaId: string, documentoId: string, estado: "BORRADOR" | "APROBADO" | "FIRMADO") {
  await requiereUsuario();
  await db.documento.update({ where: { id: documentoId }, data: { estado } });
  rv(empresaId);
}

export async function guardarPlantilla(id: string, contenidoMd: string) {
  await requiereUsuario();
  const p = await db.plantilla.findUniqueOrThrow({ where: { id } });
  if (p.contenidoMd === contenidoMd) return;
  await db.plantilla.update({ where: { id }, data: { contenidoMd, version: p.version + 1, vigenteDesde: new Date() } });
  revalidatePath("/plantillas", "layout");
}

// ───────── Plan anual (Res. 0312 art. 26; Decreto 1072 art. 2.2.4.6.17) ─────────
export async function generarPlanAnual(empresaId: string, anio: number) {
  await requiereUsuario();
  const ctx = await construirContexto(empresaId);
  // Se reemplazan solo las actividades generadas que siguen pendientes; se conservan las ejecutadas y las manuales.
  await db.actividadPlan.deleteMany({ where: { empresaId, anio, estado: "PENDIENTE", origen: { not: "manual" } } });
  const conservadas = await db.actividadPlan.findMany({ where: { empresaId, anio } });
  const acts = generarPlan({
    nivel: ctx.empresa.nivel, comites: ctx._reglas.comites, disparadores: ctx.dis,
    capacitaciones: ctx.capacitaciones.map((c) => ({ tema: c.tema, mes: c.mesNum, norma: c.norma })),
    prioritarios: ctx.matriz.prioritarios.map((p) => ({ descripcion: p.descripcion, medida: p.ingenieria || p.administrativa || p.epp || "Definir medida" })),
    mejoras: ctx.planMejora.map((p, i) => ({ estandar: p.estandar, actividad: p.actividad, mes: Math.min(12, new Date().getMonth() + 2 + (i % 4)) })),
  }).filter((a) => !conservadas.some((c) => c.nombre === a.nombre && c.mes === a.mes));
  await db.actividadPlan.createMany({ data: acts.map((a) => ({ empresaId, anio, mes: a.mes, nombre: a.nombre, estandarCodigo: a.estandarCodigo, normaRef: a.normaRef, responsable: a.responsable, recursos: a.recursos, origen: a.origen })) });
  await generarDocumentos(empresaId, ["PLN-01"]).catch(() => null);
  rv(empresaId);
  return acts.length;
}

export async function actualizarActividad(empresaId: string, id: string, d: { estado?: string; responsable?: string; mes?: number; nombre?: string }) {
  await requiereUsuario();
  await db.actividadPlan.update({ where: { id }, data: { ...d, fechaEjecucion: d.estado === "EJECUTADA" ? new Date() : d.estado ? null : undefined } });
  rv(empresaId);
}

export async function agregarActividad(empresaId: string, d: { anio: number; mes: number; nombre: string; responsable?: string; estandarCodigo?: string }) {
  await requiereUsuario();
  await db.actividadPlan.create({ data: { ...d, empresaId, origen: "manual", normaRef: "Definida por la consultora" } });
  rv(empresaId);
}

export async function eliminarActividad(empresaId: string, id: string) {
  await requiereUsuario();
  await db.actividadPlan.delete({ where: { id } });
  rv(empresaId);
}

// ───────── Comités ─────────
export async function crearComite(empresaId: string, tipo: string, periodoInicio: string) {
  await requiereUsuario();
  const ini = new Date(periodoInicio);
  const fin = new Date(ini); fin.setFullYear(fin.getFullYear() + 2);
  const NR: Record<string, string> = { COPASST: "Res. 2013/1986", VIGIA: "Res. 2013/1986; Decreto 1072/2015", CCL: "Res. 3461/2025", BRIGADA: "Decreto 1072/2015 art. 2.2.4.6.25" };
  await db.comite.create({ data: { empresaId, tipo, periodoInicio: ini, periodoFin: tipo === "BRIGADA" ? null : fin, normaRef: NR[tipo] } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
}
export async function agregarMiembro(empresaId: string, comiteId: string, d: { nombre: string; cedula?: string; cargo?: string; rol: string; representa?: string }) {
  await requiereUsuario();
  await db.comiteMiembro.create({ data: { comiteId, ...d } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
}
export async function eliminarMiembro(empresaId: string, id: string) {
  await requiereUsuario();
  await db.comiteMiembro.delete({ where: { id } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
}
export async function eliminarComite(empresaId: string, id: string) {
  await requiereUsuario();
  await db.comite.delete({ where: { id } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
}

// ───────── Eventos e indicadores (Res. 0312 art. 30) ─────────
export async function registrarEvento(empresaId: string, d: { tipo: string; fecha: string; descripcion?: string; cargo?: string; diasIncapacidad?: number; diasCargados?: number; mortal?: boolean; casoNuevo?: boolean; reportadoArl?: boolean }) {
  await requiereUsuario();
  await db.evento.create({ data: { empresaId, tipo: d.tipo, fecha: new Date(d.fecha), descripcion: d.descripcion, cargo: d.cargo, diasIncapacidad: Number(d.diasIncapacidad) || 0, diasCargados: Number(d.diasCargados) || 0, mortal: !!d.mortal, casoNuevo: d.casoNuevo ?? true, reportadoArl: !!d.reportadoArl } });
  rv(empresaId);
}
export async function eliminarEvento(empresaId: string, id: string) {
  await requiereUsuario();
  await db.evento.delete({ where: { id } });
  rv(empresaId);
}
export async function guardarTrabajadoresMes(empresaId: string, anio: number, mes: number, nTrabajadores: number, diasProgramados?: number) {
  await requiereUsuario();
  await db.trabajadoresMes.upsert({
    where: { empresaId_anio_mes: { empresaId, anio, mes } },
    update: { nTrabajadores, diasProgramados: diasProgramados ?? null },
    create: { empresaId, anio, mes, nTrabajadores, diasProgramados: diasProgramados ?? null },
  });
  rv(empresaId);
}

// ───────── Biblioteca ─────────
export async function actualizarPeligroCatalogo(id: string, d: Record<string, string | number | boolean | string[]>) {
  await requiereUsuario();
  const permitidos = ["clasificacion", "subclasificacion", "descripcion", "efectosPosibles", "ndDefault", "neDefault", "ncDefault", "controlesFuente", "controlesMedio", "controlesIndividuo", "medidaEliminacion", "medidaSustitucion", "medidaIngenieria", "medidaAdministrativa", "medidaEpp", "eppSugerido", "examenesSugeridos", "capacitacionesSugeridas", "normas", "pveAsociado", "requisitoLegalEspecifico", "validado"];
  const data: Record<string, unknown> = {};
  for (const k of permitidos) if (k in d) data[k] = ["ndDefault", "neDefault", "ncDefault"].includes(k) ? Number(d[k]) : d[k];
  await db.peligroCatalogo.update({ where: { id }, data });
  revalidatePath("/biblioteca");
}

// ───────── Datos complementarios y datos de comités ─────────
export async function guardarComplementarios(empresaId: string, datos: Record<string, unknown>) {
  await requiereUsuario();
  await db.empresa.update({ where: { id: empresaId }, data: { datosComplementarios: datos as object } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
  return { ok: true };
}

export async function guardarDatosComite(empresaId: string, comiteId: string, datos: Record<string, unknown>) {
  await requiereUsuario();
  await db.comite.update({ where: { id: comiteId }, data: { datos: datos as object } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
  return { ok: true };
}
