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

/** Usuario de la sesión actual (verificado contra la base de datos). Redirige a /login si no hay sesión válida. */
/** La sesión se emitió antes de un cambio de contraseña: ya no vale. */
const vencida = (s: { iat?: number }, desde: Date | null) => !!desde && (s.iat ?? 0) * 1000 < desde.getTime() - 1000;

export const usuarioActual = cache(async () => {
  const s = await verificarToken((await cookies()).get(COOKIE)?.value);
  if (!s) redirect("/login");
  const u = await db.usuario.findUnique({ where: { id: s.usuarioId }, select: { id: true, nombre: true, email: true, rol: true, activo: true, consultoraId: true, empresaId: true, sesionesDesde: true } });
  if (!u || !u.activo || vencida(s, u.sesionesDesde)) redirect("/login");
  return u;
});

/** Para server actions: exige sesión válida (las acciones se pueden invocar desde cualquier ruta). */
export async function requiereUsuario() {
  const s = await verificarToken((await cookies()).get(COOKIE)?.value);
  if (!s) throw new Error("No autenticado: inicie sesión de nuevo.");
  const u = await db.usuario.findUnique({ where: { id: s.usuarioId }, select: { id: true, rol: true, activo: true, consultoraId: true, sesionesDesde: true } });
  if (!u || !u.activo || vencida(s, u.sesionesDesde)) throw new Error("Usuario inactivo o inexistente.");
  return u;
}
