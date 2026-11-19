import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";

export const MAX_BYTES = 10 * 1024 * 1024;
export const TIPOS: Record<string, string> = {
  "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/heic": "heic",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
};
export const ACEPTA = Object.keys(TIPOS).join(",");

/** Guarda un archivo de una empresa y devuelve su ruta relativa. */
export async function guardarArchivo(empresaId: string, file: File) {
  const ext = TIPOS[file.type] ?? extname(file.name).slice(1).toLowerCase();
  if (!Object.values(TIPOS).includes(ext)) throw new Error("Tipo de archivo no permitido. Use PDF, imagen (JPG, PNG), Word o Excel.");
  if (file.size > MAX_BYTES) throw new Error("El archivo no puede superar 10 MB.");
  const dir = join(process.cwd(), "uploads", "empresas", empresaId);
  await mkdir(dir, { recursive: true });
  const nombre = `${randomUUID()}.${ext}`;
  await writeFile(join(dir, nombre), Buffer.from(await file.arrayBuffer()));
  return { ruta: `uploads/empresas/${empresaId}/${nombre}`, ext };
}

export async function leerArchivo(ruta: string) {
  if (!ruta.startsWith("uploads/") || ruta.includes("..")) throw new Error("Ruta inválida");
  return readFile(join(process.cwd(), ruta));
}

/** Estándar que soporta el acta de cada comité (Res. 0312/2019). */
export const ESTANDAR_COMITE: Record<string, string> = { COPASST: "1.1.6", VIGIA: "1.1.6", CCL: "1.1.8", BRIGADA: "5.1.2" };
