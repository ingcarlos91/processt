"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, consultoraActual } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { prepararEstructura, aplicarCargoTipo, sugerirCargoTipo } from "@/lib/matriz/instanciar";
import { guardarLogo, borrarLogo } from "@/lib/logos";
import { TURNOS_NOCTURNOS } from "@/lib/ayuda";

export type IntakeData = {
  razonSocial: string; nit: string; digitoVerificacion?: string; direccion?: string; ciudad?: string; departamento?: string; telefono?: string; correo?: string;
  representanteLegal?: string; representanteCedula?: string; logoUrl?: string;
  ciiu?: string; descripcionActividad?: string; claseRiesgo: number; claseRiesgoJustificacion?: string; arl?: string; epsPrincipal?: string; sectorTipoId?: string | null; esUpa?: boolean;
  nTrabajadoresPlanta: number; nContratistas: number; nAprendices: number; nEnMision: number; nVehiculos: number; horario?: string; turnos?: string;
  sedes: { nombre: string; direccion?: string; ciudad?: string }[];
  cargos: { nombre: string; nPersonas: number; cargoTipoId?: string | null; funciones?: string }[];
  disparadores: Record<string, boolean>;
  estadoActual: Record<string, boolean>;
  responsableSst: { nombre?: string; cedula?: string; cargo?: string; perfil?: string; licencia?: string; licenciaFecha?: string; curso50h?: boolean; curso50hFecha?: string };
};

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

function datosEmpresa(d: IntakeData) {
  return {
    razonSocial: d.razonSocial.trim(), nit: d.nit.replace(/[^\d]/g, ""), digitoVerificacion: d.digitoVerificacion || null, direccion: d.direccion, ciudad: d.ciudad, departamento: d.departamento,
    telefono: d.telefono, correo: d.correo, representanteLegal: d.representanteLegal, representanteCedula: d.representanteCedula,
    ciiu: d.ciiu, descripcionActividad: d.descripcionActividad, claseRiesgo: Math.min(5, Math.max(1, n(d.claseRiesgo) || 1)), claseRiesgoJustificacion: d.claseRiesgoJustificacion,
    arl: d.arl, epsPrincipal: d.epsPrincipal, sectorTipoId: d.sectorTipoId || null, esUpa: !!d.esUpa,
    nTrabajadoresPlanta: n(d.nTrabajadoresPlanta), nContratistas: n(d.nContratistas), nAprendices: n(d.nAprendices), nEnMision: n(d.nEnMision), nVehiculos: n(d.nVehiculos),
    horario: d.horario, turnos: d.turnos,
    // Turnos nocturnos o rotativos activan el peligro especial de trabajo nocturno (Res. 2646/2008).
    disparadores: { ...(d.disparadores ?? {}), ...((d.turnos ?? "").split(",").some((t) => TURNOS_NOCTURNOS.includes(t)) ? { trabajoNocturno: true } : {}) }, estadoActual: d.estadoActual ?? {}, responsableSst: d.responsableSst ?? {},
  };
}

export async function crearEmpresa(d: IntakeData) {
  if (!d.razonSocial?.trim() || !d.nit?.trim()) return { error: "Razón social y NIT son obligatorios." };
  const c = await consultoraActual();
  const sedes = d.sedes.filter((s) => s.nombre?.trim());
  const e = await db.empresa.create({
    data: {
      consultoraId: c.id, ...datosEmpresa(d), fechaInicioSgsst: new Date(),
      sedes: { create: (sedes.length ? sedes : [{ nombre: "Sede principal", direccion: d.direccion, ciudad: d.ciudad }]).map((s, i) => ({ ...s, principal: i === 0 })) },
    },
  });
  await prepararEstructura(e.id, "aprobado");
  for (const cg of d.cargos.filter((x) => x.nombre?.trim())) {
    const cargo = await db.cargo.create({ data: { empresaId: e.id, nombre: cg.nombre.trim(), nPersonas: Math.max(1, n(cg.nPersonas)), descripcionFunciones: cg.funciones || null } });
    const tipoId = cg.cargoTipoId || (await sugerirCargoTipo(cg.nombre, e.sectorTipoId))?.id;
    if (tipoId) await aplicarCargoTipo(e.id, cargo.id, tipoId, "aprobado");
  }
  await recalcularEmpresa(e.id);
  revalidatePath("/", "layout");
  return { id: e.id };
}

/** Sube o reemplaza el logo de la empresa. Se usa en los encabezados de los documentos. */
export async function subirLogo(empresaId: string, fd: FormData) {
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
  await borrarLogo(empresaId);
  await db.empresa.update({ where: { id: empresaId }, data: { logoUrl: null } });
  revalidatePath(`/empresas/${empresaId}`, "layout");
}

export async function actualizarEmpresa(id: string, d: IntakeData) {
  const prev = await db.empresa.findUniqueOrThrow({ where: { id } });
  await db.empresa.update({ where: { id }, data: datosEmpresa(d) });
  if (d.sectorTipoId && d.sectorTipoId !== prev.sectorTipoId) await prepararEstructura(id, "aprobado");
  await recalcularEmpresa(id);
  revalidatePath(`/empresas/${id}`, "layout");
  return { ok: true };
}

export async function eliminarEmpresa(id: string) {
  await db.empresa.delete({ where: { id } });
  revalidatePath("/");
  redirect("/");
}

export async function guardarSede(empresaId: string, s: { id?: string; nombre: string; direccion?: string; ciudad?: string }) {
  if (s.id) await db.sede.update({ where: { id: s.id }, data: { nombre: s.nombre, direccion: s.direccion, ciudad: s.ciudad } });
  else await db.sede.create({ data: { empresaId, nombre: s.nombre, direccion: s.direccion, ciudad: s.ciudad } });
  revalidatePath(`/empresas/${empresaId}`, "layout");
}

export type DatosConsultora = { nombre: string; nit?: string; profesional?: string; cedula?: string; cargo?: string; perfil?: string; licenciaSst?: string; licenciaFecha?: string; curso50h?: boolean; curso50hFecha?: string; telefono?: string; correo?: string };

export async function guardarConsultora(d: DatosConsultora) {
  const c = await consultoraActual();
  await db.consultora.update({ where: { id: c.id }, data: { ...d, licenciaFecha: d.licenciaFecha ? new Date(d.licenciaFecha) : null } });
  revalidatePath("/", "layout");
  return { ok: true };
}
