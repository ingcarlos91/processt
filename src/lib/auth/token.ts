// Firma y verificación del token de sesión (sin dependencias de servidor: lo usa también proxy.ts).
import { SignJWT, jwtVerify } from "jose";

export type Sesion = { usuarioId: string; rol: string; expira: string; iat?: number };
export const COOKIE = "processt_sesion";
export const DURACION_DIAS = 7;

const clave = () => {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("Falta AUTH_SECRET en el archivo .env");
  return new TextEncoder().encode(s);
};

export async function firmar(s: Sesion) {
  return new SignJWT(s).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(`${DURACION_DIAS}d`).sign(clave());
}

export async function verificarToken(token?: string): Promise<Sesion | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, clave(), { algorithms: ["HS256"] });
    return payload as unknown as Sesion;
  } catch {
    return null;
  }
}
