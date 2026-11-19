"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereUsuario } from "@/lib/auth/sesion";
import { recalcularEmpresa } from "@/lib/empresa";
import { prepararEstructura, aplicarCargoTipo, sugerirCargoTipo } from "@/lib/matriz/instanciar";
import { MAPA_ESTADO_ACTUAL, calcularDiagnostico, aEstadoEvaluacion, type ItemDiag } from "@/lib/diagnostico";
import { cerrarEvaluacion, generarPlanAnual, generarTodo } from "@/app/actions/sgsst";
import { anioPlanDefecto } from "@/lib/plan/generar";

const rv = (id: string) => { revalidatePath(`/empresas/${id}`, "layout"); revalidatePath("/"); };
async function delaEmpresa(empresaId: string, id: string) {
  const d = await db.diagnostico.findUnique({ where: { id } });
  if (!d || d.empresaId !== empresaId) throw new Error("Diagnóstico no encontrado.");
  return d;
}

/** Crea el diagnóstico con los estándares que aplican; lo marcado en “Estado actual” se precarga como “cumple”. */
export async function crearDiagnostico(empresaId: string) {
  await requiereUsuario();
  const rr = await recalcularEmpresa(empresaId);
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId } });
  const est = (e.estadoActual ?? {}) as Record<string, boolean>;
  const cumple = new Set(Object.entries(MAPA_ESTADO_ACTUAL).filter(([k]) => est[k]).flatMap(([, v]) => v));
  const estandares = await db.estandar.findMany({ where: { codigo: { in: rr.estandares } }, orderBy: { orden: "asc" } });
  const items: ItemDiag[] = estandares.map((s) => ({ codigo: s.codigo, ciclo: s.ciclo, grupo: s.grupo, descripcion: s.descripcion, puntaje: s.puntaje, modo: s.modoVerificacion ?? "", actividad: s.actividadSugerida ?? "", estado: cumple.has(s.codigo) ? "cumple" : "", observacion: "" }));
  const cal = calcularDiagnostico(items, rr.nivel);
  const d = await db.diagnostico.create({ data: { empresaId, nivel: rr.nivel, items: items as object[], puntaje: cal.puntaje, valoracion: cal.valoracion, porCiclo: cal.porCiclo as object } });
  rv(empresaId);
  return { ok: true as const, id: d.id };
}

export async function guardarDiagnostico(empresaId: string, id: string, d: { items: ItemDiag[]; conclusiones?: string; fecha?: string }) {
  await requiereUsuario();
  const x = await delaEmpresa(empresaId, id);
  if (x.estado === "cerrado") return { error: "El diagnóstico está cerrado; reábralo para editarlo." };
  const cal = calcularDiagnostico(d.items, x.nivel);
  await db.diagnostico.update({ where: { id }, data: {
    items: d.items as object[], conclusiones: d.conclusiones ?? x.conclusiones, puntaje: cal.puntaje, valoracion: cal.valoracion, porCiclo: cal.porCiclo as object,
    ...(d.fecha && /^\d{4}-\d{2}-\d{2}$/.test(d.fecha) ? { fecha: new Date(d.fecha + "T12:00:00Z") } : {}),
  } });
  rv(empresaId);
  return { ok: true as const, ...cal };
}

/** Cierra el diagnóstico: todos los estándares evaluados y los “no aplica” justificados (Res. 0312/2019 art. 27). */
export async function cerrarDiagnostico(empresaId: string, id: string) {
  await requiereUsuario();
  const x = await delaEmpresa(empresaId, id);
  const items = (x.items ?? []) as ItemDiag[];
  const sin = items.filter((i) => !i.estado).map((i) => i.codigo);
  if (sin.length) return { error: `Falta evaluar: ${sin.slice(0, 8).join(", ")}${sin.length > 8 ? "…" : ""}.` };
  const sinJust = items.filter((i) => i.estado === "no_aplica" && !i.observacion.trim()).map((i) => i.codigo);
  if (sinJust.length) return { error: `Justifique los “no aplica”: ${sinJust.join(", ")}.` };
  await db.diagnostico.update({ where: { id }, data: { estado: "cerrado", cerradoEn: new Date() } });
  rv(empresaId);
  return { ok: true as const };
}

export async function reabrirDiagnostico(empresaId: string, id: string) {
  await requiereUsuario();
  const x = await delaEmpresa(empresaId, id);
  if (x.evaluacionId) return { error: "Este diagnóstico ya dio inicio al SG-SST; los cambios se hacen en la evaluación." };
  await db.diagnostico.update({ where: { id }, data: { estado: "borrador", cerradoEn: null } });
  rv(empresaId);
  return { ok: true as const };
}

/**
 * Inicia el SG-SST: arma la estructura de la matriz por cargos, crea la evaluación inicial con las respuestas
 * del diagnóstico (y su plan de mejoramiento), genera el plan anual y todos los documentos.
 */
export async function iniciarSgsst(empresaId: string, diagnosticoId?: string) {
  await requiereUsuario();
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, include: { cargos: { include: { tareas: true } } } });
  await prepararEstructura(empresaId, "aprobado");
  for (const c of e.cargos.filter((x) => !x.tareas.length)) {
    const tipo = c.cargoTipoId ?? (await sugerirCargoTipo(c.nombre, e.sectorTipoId, empresaId))?.id;
    if (tipo) await aplicarCargoTipo(empresaId, c.id, tipo, "aprobado");
  }
  await db.empresa.update({ where: { id: empresaId }, data: { etapa: "activa", fechaInicioSgsst: new Date() } });
  const rr = await recalcularEmpresa(empresaId);
  let evaluacionId: string | null = null;
  if (diagnosticoId) {
    const dg = await delaEmpresa(empresaId, diagnosticoId);
    if (dg.estado !== "cerrado") return { error: "Cierre primero el diagnóstico." };
    const items = (dg.items ?? []) as ItemDiag[];
    const estandares = await db.estandar.findMany({ where: { codigo: { in: rr.estandares } } });
    const ev = await db.evaluacion.create({ data: {
      empresaId, tipo: "inicial", anio: dg.fecha.getUTCFullYear(), fecha: dg.fecha, nivel: rr.nivel, observaciones: "Tomada del diagnóstico inicial de la consultora.",
      items: { create: estandares.map((s) => { const it = items.find((i) => i.codigo === s.codigo); return { estandarId: s.id, estado: it ? aEstadoEvaluacion(it.estado) : "PENDIENTE", justificacion: it?.estado === "no_aplica" ? it.observacion : null, observacion: it && it.estado !== "no_aplica" ? it.observacion || null : null }; }) },
    } });
    evaluacionId = ev.id;
    await cerrarEvaluacion(empresaId, ev.id);
    await db.diagnostico.update({ where: { id: diagnosticoId }, data: { evaluacionId } });
  }
  await generarPlanAnual(empresaId, anioPlanDefecto());
  const docs = await generarTodo(empresaId);
  rv(empresaId);
  return { ok: true as const, evaluacionId, documentos: docs.total };
}
