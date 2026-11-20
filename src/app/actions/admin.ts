"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereSuperadmin } from "@/lib/auth/sesion";
import { cifrarPassword, validarPassword } from "@/lib/auth/password";

// Panel del super administrador: crea y administra consultoras y sus usuarios. No ve ni modifica los datos de las
// empresas cliente ni de sus trabajadores (Ley 1581/2012): solo nombres de consultoras, usuarios y totales.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ["admin", "consultor"];
const rv = () => revalidatePath("/admin", "layout");
type Res = { ok: true } | { error: string };

async function validarUsuario(d: { nombre: string; email: string; password: string }): Promise<{ error: string } | { email: string }> {
  const email = d.email.trim().toLowerCase();
  if (!d.nombre.trim() || !email) return { error: "Nombre y correo del usuario son obligatorios." };
  if (!EMAIL.test(email)) return { error: "El correo no es válido." };
  const e = validarPassword(d.password); if (e) return { error: e };
  if (await db.usuario.findUnique({ where: { email } })) return { error: "Ya existe un usuario con ese correo." };
  return { email };
}

/** Crea una consultora con su administrador. La consultora completa sus datos (licencia, firma, logo) en «Mi consultora». */
export async function crearConsultora(d: { nombre: string; nit: string; admin: { nombre: string; email: string; password: string } }): Promise<Res> {
  await requiereSuperadmin();
  if (!d.nombre.trim()) return { error: "Escriba el nombre de la consultora." };
  const nit = d.nit.replace(/[^\d-]/g, "") || null;
  if (nit && (await db.consultora.findFirst({ where: { nit } }))) return { error: `Ya existe una consultora con el NIT ${nit}.` };
  const v = await validarUsuario(d.admin); if ("error" in v) return v;
  await db.consultora.create({ data: {
    nombre: d.nombre.trim(), nit,
    usuarios: { create: { nombre: d.admin.nombre.trim(), email: v.email, rol: "admin", passwordHash: await cifrarPassword(d.admin.password) } },
  } });
  rv();
  return { ok: true };
}

export async function actualizarConsultora(id: string, d: { nombre: string; nit: string }): Promise<Res> {
  await requiereSuperadmin();
  if (!d.nombre.trim()) return { error: "Escriba el nombre de la consultora." };
  const nit = d.nit.replace(/[^\d-]/g, "") || null;
  if (nit && (await db.consultora.findFirst({ where: { nit, NOT: { id } } }))) return { error: `Ya existe otra consultora con el NIT ${nit}.` };
  await db.consultora.update({ where: { id }, data: { nombre: d.nombre.trim(), nit } });
  rv();
  return { ok: true };
}

/** Desactivar: nadie de la consultora puede entrar (las sesiones abiertas dejan de valer de inmediato). Los datos se conservan. */
export async function cambiarEstadoConsultora(id: string, activa: boolean): Promise<Res> {
  await requiereSuperadmin();
  await db.consultora.update({ where: { id }, data: { activa } });
  rv();
  return { ok: true };
}

export async function agregarUsuarioConsultora(consultoraId: string, d: { nombre: string; email: string; password: string; rol: string }): Promise<Res> {
  await requiereSuperadmin();
  if (!ROLES.includes(d.rol)) return { error: "Rol no válido." };
  if (!(await db.consultora.findUnique({ where: { id: consultoraId } }))) return { error: "Consultora no encontrada." };
  const v = await validarUsuario(d); if ("error" in v) return v;
  await db.usuario.create({ data: { consultoraId, nombre: d.nombre.trim(), email: v.email, rol: d.rol, passwordHash: await cifrarPassword(d.password) } });
  rv();
  return { ok: true };
}

/** Usuario de una consultora (nunca otro super administrador). */
async function usuarioDeConsultora(id: string) {
  const u = await db.usuario.findUnique({ where: { id } });
  if (!u || u.rol === "superadmin" || !u.consultoraId) throw new Error("Usuario no encontrado.");
  return u;
}

export async function restablecerPasswordUsuario(id: string, password: string): Promise<Res> {
  await requiereSuperadmin();
  await usuarioDeConsultora(id);
  const e = validarPassword(password); if (e) return { error: e };
  await db.usuario.update({ where: { id }, data: { passwordHash: await cifrarPassword(password), sesionesDesde: new Date() } });
  rv();
  return { ok: true };
}

export async function cambiarEstadoUsuarioConsultora(id: string, activo: boolean): Promise<Res> {
  await requiereSuperadmin();
  const u = await usuarioDeConsultora(id);
  if (!activo && u.rol === "admin" && !(await db.usuario.count({ where: { consultoraId: u.consultoraId, rol: "admin", activo: true, id: { not: id } } }))) {
    return { error: "Es el único administrador activo de la consultora. Agregue o active otro administrador primero." };
  }
  await db.usuario.update({ where: { id }, data: { activo, ...(activo ? {} : { sesionesDesde: new Date() }) } });
  rv();
  return { ok: true };
}

/** Cambia el rol de un usuario de una consultora (administrador o consultor). */
export async function cambiarRolUsuarioConsultora(id: string, rol: string): Promise<Res> {
  await requiereSuperadmin();
  const u = await usuarioDeConsultora(id);
  if (!ROLES.includes(rol)) return { error: "Rol no válido." };
  if (u.rol === "admin" && rol !== "admin" && !(await db.usuario.count({ where: { consultoraId: u.consultoraId, rol: "admin", activo: true, id: { not: id } } }))) {
    return { error: "Debe quedar al menos un administrador activo en la consultora." };
  }
  await db.usuario.update({ where: { id }, data: { rol } });
  rv();
  return { ok: true };
}

/** Tope mensual de gasto de IA de la consultora en USD (vacío = sin tope). Al alcanzarlo, se usan las sugerencias de la biblioteca. */
export async function fijarTopeIA(id: string, tope: number | null): Promise<Res> {
  await requiereSuperadmin();
  if (tope != null && (!Number.isFinite(tope) || tope < 0)) return { error: "Escriba un valor en USD mayor o igual a cero, o déjelo vacío para no tener tope." };
  await db.consultora.update({ where: { id }, data: { iaTopeMensualUsd: tope == null ? null : Math.round(tope * 100) / 100 } });
  rv();
  return { ok: true };
}
