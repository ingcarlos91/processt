"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereUsuario, crearSesion } from "@/lib/auth/sesion";
import { cifrarPassword, validarPassword, verificarPassword } from "@/lib/auth/password";

const ROLES = ["admin", "consultor"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function soloAdmin() {
  const u = await requiereUsuario();
  if (u.rol !== "admin") throw new Error("Solo un administrador puede gestionar usuarios.");
  return u;
}

/** Siempre debe quedar al menos un administrador activo. */
async function quedaOtroAdmin(consultoraId: string, excepto: string) {
  return (await db.usuario.count({ where: { consultoraId, rol: "admin", activo: true, id: { not: excepto } } })) > 0;
}

async function delMismoEquipo(adminConsultora: string, id: string) {
  const u = await db.usuario.findUnique({ where: { id } });
  if (!u || u.consultoraId !== adminConsultora) throw new Error("Usuario no encontrado.");
  return u;
}

const rv = () => { revalidatePath("/usuarios"); revalidatePath("/", "layout"); };

export async function crearUsuario(d: { nombre: string; email: string; password: string; rol: string }) {
  const admin = await soloAdmin();
  const email = d.email.trim().toLowerCase();
  if (!d.nombre.trim() || !email) return { error: "Nombre y correo son obligatorios." };
  if (!EMAIL.test(email)) return { error: "El correo no es válido." };
  if (!ROLES.includes(d.rol)) return { error: "Rol no válido." };
  const e = validarPassword(d.password); if (e) return { error: e };
  if (await db.usuario.findUnique({ where: { email } })) return { error: "Ya existe un usuario con ese correo." };
  await db.usuario.create({ data: { consultoraId: admin.consultoraId, nombre: d.nombre.trim(), email, rol: d.rol, passwordHash: await cifrarPassword(d.password) } });
  rv();
  return { ok: true };
}

export async function actualizarUsuario(id: string, d: { nombre: string; email: string; rol: string }) {
  const admin = await soloAdmin();
  const u = await delMismoEquipo(admin.consultoraId, id);
  const email = d.email.trim().toLowerCase();
  if (!d.nombre.trim() || !email) return { error: "Nombre y correo son obligatorios." };
  if (!EMAIL.test(email)) return { error: "El correo no es válido." };
  if (!ROLES.includes(d.rol)) return { error: "Rol no válido." };
  if (email !== u.email && (await db.usuario.findUnique({ where: { email } }))) return { error: "Ya existe un usuario con ese correo." };
  if (u.rol === "admin" && d.rol !== "admin") {
    if (u.id === admin.id) return { error: "No puede quitarse a sí mismo el rol de administrador." };
    if (!(await quedaOtroAdmin(admin.consultoraId, u.id))) return { error: "Debe quedar al menos un administrador activo." };
  }
  await db.usuario.update({ where: { id }, data: { nombre: d.nombre.trim(), email, rol: d.rol } });
  rv();
  return { ok: true };
}

/** El administrador asigna una contraseña nueva; las sesiones abiertas de esa persona se cierran. */
export async function restablecerPassword(id: string, password: string) {
  const admin = await soloAdmin();
  await delMismoEquipo(admin.consultoraId, id);
  const e = validarPassword(password); if (e) return { error: e };
  await db.usuario.update({ where: { id }, data: { passwordHash: await cifrarPassword(password), sesionesDesde: new Date() } });
  if (id === admin.id) await crearSesion(admin.id, admin.rol);
  rv();
  return { ok: true };
}

export async function cambiarEstadoUsuario(id: string, activo: boolean) {
  const admin = await soloAdmin();
  const u = await delMismoEquipo(admin.consultoraId, id);
  if (!activo) {
    if (admin.id === id) return { error: "No puede desactivar su propio usuario." };
    if (u.rol === "admin" && !(await quedaOtroAdmin(admin.consultoraId, id))) return { error: "Debe quedar al menos un administrador activo." };
  }
  await db.usuario.update({ where: { id }, data: { activo, ...(activo ? {} : { sesionesDesde: new Date() }) } });
  rv();
  return { ok: true };
}

/** Elimina el acceso. Los documentos y archivos que la persona trabajó no se pierden (no dependen del usuario). */
export async function eliminarUsuario(id: string) {
  const admin = await soloAdmin();
  const u = await delMismoEquipo(admin.consultoraId, id);
  if (admin.id === id) return { error: "No puede eliminar su propio usuario." };
  if (u.rol === "admin" && !(await quedaOtroAdmin(admin.consultoraId, id))) return { error: "Debe quedar al menos un administrador activo." };
  await db.usuario.delete({ where: { id } });
  rv();
  return { ok: true };
}

/** Cada usuario puede cambiar su propia contraseña; se cierran sus otras sesiones y esta sigue abierta. */
export async function cambiarMiPassword(actual: string, nueva: string) {
  const u = await requiereUsuario();
  const full = await db.usuario.findUniqueOrThrow({ where: { id: u.id } });
  if (!(await verificarPassword(actual, full.passwordHash))) return { error: "La contraseña actual no es correcta." };
  const e = validarPassword(nueva); if (e) return { error: e };
  await db.usuario.update({ where: { id: u.id }, data: { passwordHash: await cifrarPassword(nueva), sesionesDesde: new Date() } });
  await crearSesion(u.id, u.rol);
  return { ok: true };
}

/** Cada usuario puede cambiar su nombre y correo. */
export async function actualizarMiPerfil(d: { nombre: string; email: string }) {
  const u = await requiereUsuario();
  const email = d.email.trim().toLowerCase();
  if (!d.nombre.trim() || !EMAIL.test(email)) return { error: "Escriba un nombre y un correo válido." };
  const otro = await db.usuario.findUnique({ where: { email } });
  if (otro && otro.id !== u.id) return { error: "Ya existe un usuario con ese correo." };
  await db.usuario.update({ where: { id: u.id }, data: { nombre: d.nombre.trim(), email } });
  rv();
  return { ok: true };
}
