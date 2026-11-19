"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requiereUsuario } from "@/lib/auth/sesion";
import { cifrarPassword, validarPassword } from "@/lib/auth/password";

async function soloAdmin() {
  const u = await requiereUsuario();
  if (u.rol !== "admin") throw new Error("Solo un administrador puede gestionar usuarios.");
  return u;
}

export async function crearUsuario(d: { nombre: string; email: string; password: string; rol: string }) {
  const admin = await soloAdmin();
  const email = d.email.trim().toLowerCase();
  if (!d.nombre.trim() || !email) return { error: "Nombre y correo son obligatorios." };
  const e = validarPassword(d.password); if (e) return { error: e };
  if (await db.usuario.findUnique({ where: { email } })) return { error: "Ya existe un usuario con ese correo." };
  await db.usuario.create({ data: { consultoraId: admin.consultoraId, nombre: d.nombre.trim(), email, rol: d.rol, passwordHash: await cifrarPassword(d.password) } });
  revalidatePath("/usuarios");
  return { ok: true };
}

export async function restablecerPassword(id: string, password: string) {
  await soloAdmin();
  const e = validarPassword(password); if (e) return { error: e };
  await db.usuario.update({ where: { id }, data: { passwordHash: await cifrarPassword(password) } });
  return { ok: true };
}

export async function cambiarEstadoUsuario(id: string, activo: boolean) {
  const admin = await soloAdmin();
  if (admin.id === id && !activo) return { error: "No puede desactivar su propio usuario." };
  await db.usuario.update({ where: { id }, data: { activo } });
  revalidatePath("/usuarios");
  return { ok: true };
}

/** Cada usuario puede cambiar su propia contraseña. */
export async function cambiarMiPassword(actual: string, nueva: string) {
  const u = await requiereUsuario();
  const full = await db.usuario.findUniqueOrThrow({ where: { id: u.id } });
  const { verificarPassword } = await import("@/lib/auth/password");
  if (!(await verificarPassword(actual, full.passwordHash))) return { error: "La contraseña actual no es correcta." };
  const e = validarPassword(nueva); if (e) return { error: e };
  await db.usuario.update({ where: { id: u.id }, data: { passwordHash: await cifrarPassword(nueva) } });
  return { ok: true };
}
