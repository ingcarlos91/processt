import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (pwd: string, salt: Buffer, keylen: number) => Promise<Buffer>;

/** Cifra una contraseña con scrypt y sal aleatoria. Formato: sal:hash (hex). */
export async function cifrarPassword(password: string) {
  const sal = randomBytes(16);
  const hash = await scrypt(password, sal, 64);
  return `${sal.toString("hex")}:${hash.toString("hex")}`;
}

export async function verificarPassword(password: string, guardado: string) {
  const [salHex, hashHex] = guardado.split(":");
  if (!salHex || !hashHex) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const hash = await scrypt(password, Buffer.from(salHex, "hex"), esperado.length);
  return timingSafeEqual(hash, esperado);
}

export function validarPassword(p: string) {
  if (p.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Za-z]/.test(p) || !/\d/.test(p)) return "La contraseña debe tener letras y números.";
  return null;
}
