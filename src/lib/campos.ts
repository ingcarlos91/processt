/**
 * Deja solo los campos permitidos de un objeto que llega a una acción del servidor. Las acciones se pueden invocar con
 * cualquier argumento: pasar el objeto tal cual a Prisma permitiría operaciones anidadas (connect, update, create) o
 * llaves foráneas sobre datos de otra consultora.
 */
export function solo<T extends object, K extends keyof T & string>(d: T, campos: readonly K[]): Partial<Pick<T, K>> {
  const out: Partial<Pick<T, K>> = {};
  for (const k of campos) if (k in d) {
    const v = d[k] as unknown;
    // Solo valores simples: nunca objetos (operaciones anidadas de Prisma).
    if (v === null || ["string", "number", "boolean"].includes(typeof v) || (Array.isArray(v) && v.every((x) => typeof x === "string"))) out[k] = d[k];
  }
  return out;
}
