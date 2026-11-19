"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { crearSesion, cerrarSesion } from "@/lib/auth/sesion";
import { verificarPassword } from "@/lib/auth/password";

export type EstadoLogin = { error?: string; email?: string } | undefined;

// Retraso fijo ante fallos para dificultar ataques de fuerza bruta.
const espera = () => new Promise((r) => setTimeout(r, 600));

export async function iniciarSesion(_: EstadoLogin, fd: FormData): Promise<EstadoLogin> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const desde = String(fd.get("desde") ?? "/");
  if (!email || !password) return { error: "Escriba su correo y su contraseña.", email };
  const u = await db.usuario.findUnique({ where: { email } });
  if (!u || !u.activo || !(await verificarPassword(password, u.passwordHash))) {
    await espera();
    return { error: "Correo o contraseña incorrectos.", email };
  }
  await db.usuario.update({ where: { id: u.id }, data: { ultimoAcceso: new Date() } });
  await crearSesion(u.id, u.rol);
  redirect(desde.startsWith("/") && !desde.startsWith("//") ? desde : "/");
}

export async function salir() {
  await cerrarSesion();
  redirect("/login");
}
