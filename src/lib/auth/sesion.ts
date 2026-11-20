import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { COOKIE, DURACION_DIAS, firmar, verificarToken } from "./token";

export async function crearSesion(usuarioId: string, rol: string) {
  const expira = new Date(Date.now() + DURACION_DIAS * 24 * 60 * 60 * 1000);
  const token = await firmar({ usuarioId, rol, expira: expira.toISOString() });
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires: expira });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}

/** La sesión se emitió antes de un cambio de contraseña: ya no vale. */
const vencida = (s: { iat?: number }, desde: Date | null) => !!desde && (s.iat ?? 0) * 1000 < desde.getTime() - 1000;

const CAMPOS = { id: true, nombre: true, email: true, rol: true, activo: true, consultoraId: true, empresaId: true, sesionesDesde: true, consultora: { select: { activa: true } } } as const;

/** Lee y valida la sesión contra la base de datos: usuario activo, sesión vigente y consultora activa. */
async function leerSesion() {
  const s = await verificarToken((await cookies()).get(COOKIE)?.value);
  if (!s) return null;
  const u = await db.usuario.findUnique({ where: { id: s.usuarioId }, select: CAMPOS });
  if (!u || !u.activo || vencida(s, u.sesionesDesde)) return null;
  if (u.rol !== "superadmin" && (!u.consultoraId || !u.consultora?.activa)) return null;
  return u;
}

/** Cualquier usuario con sesión válida, incluido el super administrador (páginas). */
export const sesionActual = cache(async () => {
  const u = await leerSesion();
  if (!u) redirect("/login");
  return u;
});

/**
 * Usuario de una consultora (páginas de la aplicación). El super administrador no trabaja empresas: va a su panel.
 * Devuelve consultoraId como texto (nunca null).
 */
export const usuarioActual = cache(async () => {
  const u = await sesionActual();
  if (u.rol === "superadmin" || !u.consultoraId) redirect("/admin");
  return { ...u, consultoraId: u.consultoraId };
});

/** Para server actions de cualquier usuario con sesión (p. ej. cambiar su propia contraseña). */
export async function requiereSesion() {
  const u = await leerSesion();
  if (!u) throw new Error("No autenticado: inicie sesión de nuevo.");
  return u;
}

/** Para server actions: exige un usuario de una consultora (las acciones se pueden invocar desde cualquier ruta). */
export async function requiereUsuario() {
  const u = await requiereSesion();
  if (u.rol === "superadmin" || !u.consultoraId) throw new Error("Esta acción es de una consultora.");
  return { ...u, consultoraId: u.consultoraId };
}

/** Para server actions del panel del super administrador. */
export async function requiereSuperadmin() {
  const u = await requiereSesion();
  if (u.rol !== "superadmin") throw new Error("Solo el super administrador puede hacer esto.");
  return u;
}
