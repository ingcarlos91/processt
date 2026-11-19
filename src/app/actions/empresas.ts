"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, consultoraActual } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { prepararEstructura, aplicarCargoTipo, sugerirCargoTipo } from "@/lib/matriz/instanciar";

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
    telefono: d.telefono, correo: d.correo, representanteLegal: d.representanteLegal, representanteCedula: d.representanteCedula, logoUrl: d.logoUrl || null,
    ciiu: d.ciiu, descripcionActividad: d.descripcionActividad, claseRiesgo: Math.min(5, Math.max(1, n(d.claseRiesgo) || 1)), claseRiesgoJustificacion: d.claseRiesgoJustificacion,
    arl: d.arl, epsPrincipal: d.epsPrincipal, sectorTipoId: d.sectorTipoId || null, esUpa: !!d.esUpa,
    nTrabajadoresPlanta: n(d.nTrabajadoresPlanta), nContratistas: n(d.nContratistas), nAprendices: n(d.nAprendices), nEnMision: n(d.nEnMision), nVehiculos: n(d.nVehiculos),
    horario: d.horario, turnos: d.turnos, disparadores: d.disparadores ?? {}, estadoActual: d.estadoActual ?? {}, responsableSst: d.responsableSst ?? {},
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
  redirect(`/empresas/${e.id}`);
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

export async function guardarConsultora(d: { nombre: string; nit?: string; profesional?: string; cedula?: string; licenciaSst?: string; telefono?: string; correo?: string }) {
  const c = await consultoraActual();
  await db.consultora.update({ where: { id: c.id }, data: d });
  revalidatePath("/", "layout");
  return { ok: true };
}
