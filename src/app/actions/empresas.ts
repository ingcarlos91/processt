"use server";
import { requiereUsuario } from "@/lib/auth/sesion";
import { revalidatePath } from "next/cache";
import { actualizarDocumentosExistentes } from "@/lib/generador/documentos";
import { redirect } from "next/navigation";
import { db, consultoraActual } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { prepararEstructura, aplicarCargoTipo, sugerirCargoTipo } from "@/lib/matriz/instanciar";
import { guardarLogo, borrarLogo } from "@/lib/logos";
import { TURNOS_NOCTURNOS } from "@/lib/ayuda";

export type IntakeData = {
  razonSocial: string; nit: string; digitoVerificacion?: string; direccion?: string; ciudad?: string; departamento?: string; telefono?: string; correo?: string;
  representanteLegal?: string; representanteTipoDoc?: string; representanteCedula?: string; logoUrl?: string;
  ciiu?: string; descripcionActividad?: string; claseRiesgo: number; claseRiesgoJustificacion?: string; arl?: string; epsPrincipal?: string; sectorTipoId?: string | null; esUpa?: boolean;
  nTrabajadoresPlanta: number; nContratistas: number; nAprendices: number; nEnMision: number; nVehiculos: number; nConductores?: number; horario?: string; turnos?: string;
  sedes: { nombre: string; direccion?: string; ciudad?: string }[];
  cargos: { nombre: string; nPersonas: number; cargoTipoId?: string | null; funciones?: string }[];
  disparadores: Record<string, boolean>;
  estadoActual: Record<string, boolean>;
  responsableSst: { nombre?: string; tipoDoc?: string; cedula?: string; cargo?: string; perfil?: string; licencia?: string; licenciaFecha?: string; curso50h?: boolean; curso50hFecha?: string; curso20hFecha?: string; rol?: string; experienciaAnios?: string | number };
};

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

function datosEmpresa(d: IntakeData) {
  return {
    razonSocial: d.razonSocial.trim(), nit: d.nit.replace(/[^\d]/g, ""), digitoVerificacion: d.digitoVerificacion || null, direccion: d.direccion, ciudad: d.ciudad, departamento: d.departamento,
    telefono: d.telefono, correo: d.correo, representanteLegal: d.representanteLegal, representanteTipoDoc: d.representanteTipoDoc || "CC", representanteCedula: d.representanteCedula,
    ciiu: d.ciiu, descripcionActividad: d.descripcionActividad, claseRiesgo: Math.min(5, Math.max(1, n(d.claseRiesgo) || 1)), claseRiesgoJustificacion: d.claseRiesgoJustificacion,
    arl: d.arl, epsPrincipal: d.epsPrincipal, sectorTipoId: d.sectorTipoId || null, esUpa: !!d.esUpa,
    nTrabajadoresPlanta: n(d.nTrabajadoresPlanta), nContratistas: n(d.nContratistas), nAprendices: n(d.nAprendices), nEnMision: n(d.nEnMision), nVehiculos: n(d.nVehiculos), nConductores: n(d.nConductores ?? 0),
    horario: d.horario, turnos: d.turnos,
    // Turnos nocturnos o rotativos activan el peligro especial de trabajo nocturno (Res. 2646/2008).
    disparadores: { ...(d.disparadores ?? {}), ...((d.turnos ?? "").split(",").some((t) => TURNOS_NOCTURNOS.includes(t)) ? { trabajoNocturno: true } : {}) }, estadoActual: d.estadoActual ?? {}, responsableSst: d.responsableSst ?? {},
  };
}

/**
 * Crea la empresa. Con modo "diagnostico" queda en etapa de diagnóstico: no se arma la matriz por cargos
 * ni se generan documentos; se crea el diagnóstico inicial y se inicia el SG-SST después desde él.
 */
export async function crearEmpresa(d: IntakeData, modo: "completo" | "diagnostico" = "completo") {
  await requiereUsuario();
  if (!d.razonSocial?.trim() || !d.nit?.trim()) return { error: "Razón social y NIT son obligatorios." };
  const c = await consultoraActual();
  const sedes = d.sedes.filter((s) => s.nombre?.trim());
  const e = await db.empresa.create({
    data: {
      consultoraId: c.id, ...datosEmpresa(d), fechaInicioSgsst: modo === "diagnostico" ? null : new Date(), etapa: modo === "diagnostico" ? "diagnostico" : "activa",
      sedes: { create: (sedes.length ? sedes : [{ nombre: "Sede principal", direccion: d.direccion, ciudad: d.ciudad }]).map((s, i) => ({ ...s, principal: i === 0 })) },
    },
  });
  if (modo === "completo") await prepararEstructura(e.id, "aprobado");
  for (const cg of d.cargos.filter((x) => x.nombre?.trim())) {
    const tipoId = cg.cargoTipoId || (await sugerirCargoTipo(cg.nombre, e.sectorTipoId))?.id;
    const cargo = await db.cargo.create({ data: { empresaId: e.id, nombre: cg.nombre.trim(), nPersonas: Math.max(1, n(cg.nPersonas)), descripcionFunciones: cg.funciones || null, cargoTipoId: modo === "diagnostico" ? tipoId ?? null : undefined } });
    if (modo === "completo" && tipoId) await aplicarCargoTipo(e.id, cargo.id, tipoId, "aprobado");
  }
  await recalcularEmpresa(e.id);
  revalidatePath("/", "layout");
  return { id: e.id };
}

/** Sube o reemplaza el logo de la empresa. Se usa en los encabezados de los documentos. */
export async function subirLogo(empresaId: string, fd: FormData) {
  await requiereUsuario();
  const file = fd.get("logo");
  if (!(file instanceof File) || file.size === 0) return { error: "Seleccione un archivo." };
  try {
    const ruta = await guardarLogo(empresaId, file);
    await db.empresa.update({ where: { id: empresaId }, data: { logoUrl: ruta } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  revalidatePath(`/empresas/${empresaId}`, "layout");
  return { ok: true };
}

export async function quitarLogo(empresaId: string) {
  await requiereUsuario();
  await borrarLogo(empresaId);
  await db.empresa.update({ where: { id: empresaId }, data: { logoUrl: null } });
  revalidatePath(`/empresas/${empresaId}`, "layout");
}

export async function actualizarEmpresa(id: string, d: IntakeData) {
  await requiereUsuario();
  const prev = await db.empresa.findUniqueOrThrow({ where: { id } });
  await db.empresa.update({ where: { id }, data: datosEmpresa(d) });
  if (d.sectorTipoId && d.sectorTipoId !== prev.sectorTipoId) await prepararEstructura(id, "aprobado");
  await recalcularEmpresa(id);
  await actualizarDocumentosExistentes(id);
  revalidatePath(`/empresas/${id}`, "layout");
  return { ok: true };
}


export async function eliminarEmpresa(id: string) {
  await requiereUsuario();
  await db.empresa.delete({ where: { id } });
  revalidatePath("/");
  redirect("/");
}

export async function guardarSede(empresaId: string, s: { id?: string; nombre: string; direccion?: string; ciudad?: string }) {
  await requiereUsuario();
  if (s.id) await db.sede.update({ where: { id: s.id }, data: { nombre: s.nombre, direccion: s.direccion, ciudad: s.ciudad } });
  else await db.sede.create({ data: { empresaId, nombre: s.nombre, direccion: s.direccion, ciudad: s.ciudad } });
  revalidatePath(`/empresas/${empresaId}`, "layout");
}

export type DatosConsultora = { nombre: string; nit?: string; profesional?: string; tipoDoc?: string; cedula?: string; cargo?: string; perfil?: string; licenciaSst?: string; licenciaFecha?: string; curso50h?: boolean; curso50hFecha?: string; curso20hFecha?: string; telefono?: string; correo?: string };

export async function guardarConsultora(d: DatosConsultora) {
  await requiereUsuario();
  const c = await consultoraActual();
  await db.consultora.update({ where: { id: c.id }, data: { ...d, licenciaFecha: d.licenciaFecha ? new Date(d.licenciaFecha) : null } });
  // Los datos de la consultora salen en firmas y encabezados: se actualizan los documentos de todas las empresas.
  const { actualizarDocumentosExistentes } = await import("@/lib/generador/documentos");
  for (const e of await db.empresa.findMany({ where: { consultoraId: c.id, etapa: "activa" }, select: { id: true } })) await actualizarDocumentosExistentes(e.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Plazos de criterio de la empresa (src/lib/plazos.ts): solo los editables y dentro de sus límites. */
export async function guardarParametrosPlazos(valores: Record<string, number>) {
  await requiereUsuario();
  const { PLAZOS } = await import("@/lib/plazos");
  const c = await consultoraActual();
  const actuales = ((c as { parametros?: unknown }).parametros ?? {}) as Record<string, number>;
  const nuevos: Record<string, number> = { ...actuales };
  for (const [k, v] of Object.entries(valores)) {
    const r = PLAZOS.find((p) => p.clave === k);
    if (!r?.editable) return { error: "Ese plazo es legal y no se puede cambiar." };
    const n = Math.round(Number(v));
    if (!Number.isFinite(n) || n < r.editable.min || n > r.editable.max) return { error: `"${r.tarea}": use un valor entre ${r.editable.min} y ${r.editable.max}.` };
    nuevos[k] = n;
  }
  await db.consultora.update({ where: { id: c.id }, data: { parametros: nuevos } });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

/** Observaciones de la consultora para el informe de gestión de un periodo (se guardan por empresa y periodo). */
export async function guardarObservacionesInforme(empresaId: string, periodo: string, texto: string) {
  await requiereUsuario();
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { datosComplementarios: true } });
  const dc = (e.datosComplementarios ?? {}) as Record<string, unknown>;
  const obs = { ...((dc.observacionesInforme ?? {}) as Record<string, string>), [periodo]: texto.trim() };
  await db.empresa.update({ where: { id: empresaId }, data: { datosComplementarios: { ...dc, observacionesInforme: obs } } });
  return { ok: true as const };
}
