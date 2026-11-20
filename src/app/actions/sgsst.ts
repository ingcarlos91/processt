"use server";
import { valorPlazo } from "@/lib/plazos";
import { MAPA_ESTADO_ACTUAL, noAplicaInvalidos } from "@/lib/diagnostico";
import { actualizarDocumentosExistentes } from "@/lib/generador/documentos";
import { requiereUsuario } from "@/lib/auth/sesion";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { generarDocumentos } from "@/lib/generador/documentos";
import { construirContexto } from "@/lib/generador/contexto";
import { generarPlan } from "@/lib/plan/generar";
import { calcularComposicion, calidadDe, composicionGuardada } from "@/lib/comites";
import { calificar, permiteNoAplica } from "@/lib/evaluacion";

const rv = (id: string) => revalidatePath(`/empresas/${id}`, "layout");

// ───────── Evaluación de estándares mínimos (Res. 0312 arts. 27-28) ─────────

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
  if (d.estado === "NO_APLICA") {
    const it = await db.evaluacionItem.findUniqueOrThrow({ where: { id: itemId }, select: { evaluacion: { select: { nivel: true, empresaId: true } } } });
    if (it.evaluacion.empresaId !== empresaId) return { error: "Ítem no encontrado." };
    if (!permiteNoAplica(it.evaluacion.nivel)) return { error: "En 60 estándares no existe «No aplica»: todos los ítems aplican (Res. 0312/2019 arts. 16 y 27). Califique «Cumple» o «No cumple»." };
  }
  await db.evaluacionItem.update({ where: { id: itemId }, data: d });
  rv(empresaId);
}

export async function cerrarEvaluacion(empresaId: string, evaluacionId: string) {
  await requiereUsuario();
  const ev = await db.evaluacion.findUniqueOrThrow({ where: { id: evaluacionId }, include: { items: { include: { estandar: true } } } });
  // La autoevaluación se cierra con todos los estándares calificados (Res. 0312/2019 art. 27).
  const pendientes = ev.items.filter((i) => i.estado === "PENDIENTE").map((i) => i.estandar.codigo);
  if (pendientes.length) return { error: `Faltan ${pendientes.length} ítem(s) por calificar (Res. 0312/2019 art. 27): ${pendientes.slice(0, 10).join(", ")}${pendientes.length > 10 ? "…" : ""}.` };
  if (!permiteNoAplica(ev.nivel)) {
    const na = ev.items.filter((i) => i.estado === "NO_APLICA").map((i) => i.estandar.codigo);
    if (na.length) return { error: `En 60 estándares no existe «No aplica» (Res. 0312/2019 arts. 16 y 27). Recalifique como «Cumple» o «No cumple»: ${na.join(", ")}.` };
  }
  const faltaJust = ev.items.filter((i) => i.estado === "NO_APLICA" && !i.justificacion?.trim());
  if (faltaJust.length) return { error: `Los ítems marcados "No aplica" requieren justificación: ${faltaJust.map((i) => i.estandar.codigo).join(", ")}` };
  const empR = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { resultadoReglas: true } });
  const invalidos = noAplicaInvalidos(ev.items.map((i) => ({ codigo: i.estandar.codigo, estado: i.estado })), ((empR.resultadoReglas as { comites?: string[] } | null)?.comites ?? []));
  if (invalidos.length) return { error: `${invalidos.join(", ")} no puede ser «no aplica»: la norma exige ese comité a esta empresa.` };
  const cal = calificar(ev.items.map((i) => ({ codigo: i.estandar.codigo, puntaje: i.estandar.puntaje, estado: i.estado })), ev.nivel);
  await db.evaluacion.update({ where: { id: ev.id }, data: { puntajeBruto: cal.puntajeBruto, puntajeAjustado: cal.puntajeAjustado, valoracion: cal.valoracion, cerrada: true } });
  // Plan de mejoramiento: un renglón por ítem no cumplido (sin duplicar)
  const existentes = await db.planMejoramientoItem.findMany({ where: { evaluacionId } });
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId } });
  const resp = ((e.responsableSst ?? {}) as { nombre?: string }).nombre || "Responsable del SG-SST";
  const limite = new Date(); limite.setMonth(limite.getMonth() + cal.mesesReporte);
  for (const i of ev.items.filter((x) => x.estado === "NO_CUMPLE")) {
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
  await db.plantilla.update({ where: { id }, data: { contenidoMd, version: p.version + 1, vigenteDesde: new Date(), editadaPorUsuario: true } });
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
const NR_COMITE: Record<string, string> = {
  COPASST: "Res. 2013/1986",
  VIGIA: "Decreto Ley 1295/1994 art. 35 par.; Decreto 1072/2015 art. 2.2.4.6.12 num. 10",
  CCL: "Res. 3461/2025",
  BRIGADA: "Decreto 1072/2015 art. 2.2.4.6.25",
};
/** Verifica que el comité sea de la empresa. */
async function comiteDe(empresaId: string, id: string) {
  const c = await db.comite.findUniqueOrThrow({ where: { id } });
  if (c.empresaId !== empresaId) throw new Error("Comité no encontrado.");
  return c;
}
/**
 * Registra el comité y congela su composición con los trabajadores de ese momento (Res. 3461/2025 art. 5 par. 1;
 * Res. 2013/1986 art. 2). Un solo comité por tipo, salvo el CCL, que puede tener uno por centro de trabajo (Res. 3461/2025 art. 3).
 */
export async function crearComite(empresaId: string, tipo: string, periodoInicio: string, opciones: { sede?: string; trabajadores?: number } = {}) {
  await requiereUsuario();
  const sede = tipo === "CCL" ? opciones.sede?.trim() || null : null;
  const existentes = await db.comite.findMany({ where: { empresaId, tipo }, select: { sede: true } });
  if (existentes.some((x) => (x.sede ?? null) === sede)) throw new Error(sede ? `Ya hay un Comité de Convivencia para la sede ${sede}.` : "Ese comité ya está registrado.");
  const ini = new Date(periodoInicio);
  const fin = new Date(ini); fin.setFullYear(fin.getFullYear() + valorPlazo("comite_periodo"));
  const n = opciones.trabajadores && opciones.trabajadores > 0 ? Math.round(opciones.trabajadores) : (await recalcularEmpresa(empresaId)).trabajadores;
  const composicion = calcularComposicion(tipo, n, periodoInicio, sede);
  await db.comite.create({ data: { empresaId, tipo, sede, periodoInicio: ini, periodoFin: tipo === "BRIGADA" ? null : fin, normaRef: NR_COMITE[tipo], datos: composicion ? { composicion: { ...composicion, origen: "conformacion" } } : {} } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
}
/** Corrige las fechas del periodo del comité y, si se indica, los trabajadores que tenía al conformarse (recalcula la composición congelada). */
export async function actualizarPeriodoComite(empresaId: string, id: string, inicio: string, fin: string, trabajadoresConformacion?: number) {
  await requiereUsuario();
  const c = await comiteDe(empresaId, id);
  if (!inicio) throw new Error("La fecha de conformación es obligatoria.");
  if (fin && fin < inicio) throw new Error("La fecha de vencimiento no puede ser anterior a la de conformación.");
  const datos = (c.datos ?? {}) as Record<string, unknown>;
  const previa = composicionGuardada(datos);
  const n = trabajadoresConformacion && trabajadoresConformacion > 0 ? Math.round(trabajadoresConformacion) : previa?.trabajadores;
  const composicion = n ? calcularComposicion(c.tipo, n, inicio, c.sede) : null;
  await db.comite.update({ where: { id }, data: { periodoInicio: new Date(inicio), periodoFin: c.tipo === "BRIGADA" ? null : fin ? new Date(fin) : null, ...(composicion ? { datos: { ...datos, composicion: { ...composicion, origen: "conformacion" } } as object } : {}) } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
}
type DatosMiembro = { nombre: string; tipoDoc?: string; cedula?: string; cargo?: string; rol: string; calidad?: string; representa?: string };
const limpiarMiembro = (tipo: string, d: { rol: string; calidad?: string; representa?: string }) => ({
  rol: d.rol,
  calidad: tipo === "BRIGADA" ? null : calidadDe(d.rol, d.calidad),
  representa: tipo === "BRIGADA" || tipo === "VIGIA" ? null : d.representa || null,
});
export async function agregarMiembro(empresaId: string, comiteId: string, d: DatosMiembro) {
  await requiereUsuario();
  const c = await comiteDe(empresaId, comiteId);
  await db.comiteMiembro.create({ data: { comiteId, nombre: d.nombre.trim(), tipoDoc: d.tipoDoc || "CC", cedula: d.cedula?.trim() || null, cargo: d.cargo?.trim() || null, ...limpiarMiembro(c.tipo, d) } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
}
/** Edita un integrante (documento, calidad, cargo en el comité, a quién representa). Los documentos se actualizan solos. */
export async function actualizarMiembro(empresaId: string, id: string, d: Partial<DatosMiembro> & { nombre: string }) {
  await requiereUsuario();
  const m = await db.comiteMiembro.findUniqueOrThrow({ where: { id }, include: { comite: true } });
  if (m.comite.empresaId !== empresaId) throw new Error("Integrante no encontrado.");
  const rol = limpiarMiembro(m.comite.tipo, { rol: d.rol || m.rol, calidad: d.calidad ?? m.calidad ?? undefined, representa: d.representa ?? m.representa ?? undefined });
  await db.comiteMiembro.update({ where: { id }, data: { nombre: d.nombre.trim() || m.nombre, tipoDoc: d.tipoDoc || "CC", cedula: d.cedula?.trim() || null, cargo: d.cargo?.trim() || null, ...rol } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
}
export async function eliminarMiembro(empresaId: string, id: string) {
  await requiereUsuario();
  const m = await db.comiteMiembro.findUniqueOrThrow({ where: { id }, include: { comite: true } });
  if (m.comite.empresaId !== empresaId) throw new Error("Integrante no encontrado.");
  await db.comiteMiembro.delete({ where: { id } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
}
export async function eliminarComite(empresaId: string, id: string) {
  await requiereUsuario();
  await comiteDe(empresaId, id);
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

/** Guarda los datos de la elección (convocatoria, votación, escrutinio). Conserva la composición congelada. */
export async function guardarDatosComite(empresaId: string, comiteId: string, datos: Record<string, unknown>) {
  await requiereUsuario();
  const c = await comiteDe(empresaId, comiteId);
  const previos = (c.datos ?? {}) as Record<string, unknown>;
  await db.comite.update({ where: { id: comiteId }, data: { datos: { ...previos, ...datos, ...(previos.composicion ? { composicion: previos.composicion } : {}) } as object } });
  await actualizarDocumentosExistentes(empresaId);
  rv(empresaId);
  return { ok: true };
}

/** Guarda la evaluación de cumplimiento de la matriz legal (columna «Cumple» de MTZ-01). */
export async function guardarCumplimientoLegal(empresaId: string, evaluacion: Record<string, { cumple?: string; evidencia?: string }>) {
  await requiereUsuario();
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { datosComplementarios: true } });
  await db.empresa.update({ where: { id: empresaId }, data: { datosComplementarios: { ...((e.datosComplementarios ?? {}) as object), cumplimientoLegal: evaluacion } } });
  await generarDocumentos(empresaId, ["MTZ-01"]).catch(() => null);
  rv(empresaId);
  return { ok: true };
}
