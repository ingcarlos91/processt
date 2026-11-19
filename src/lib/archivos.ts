import { extname } from "node:path";
import { guardar, leer } from "@/lib/almacen";
import { randomUUID } from "node:crypto";

// En Vercel el cuerpo de una petición no puede superar 4.5 MB: se limita a 4 MB en todos lados.
export const MAX_BYTES = 4 * 1024 * 1024;
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
  if (file.size > MAX_BYTES) throw new Error(`El archivo no puede superar ${MAX_BYTES / 1024 / 1024} MB.`);
  const ruta = `uploads/empresas/${empresaId}/${randomUUID()}.${ext}`;
  await guardar(ruta, Buffer.from(await file.arrayBuffer()), file.type || undefined);
  return { ruta, ext };
}

export async function leerArchivo(ruta: string) {
  return leer(ruta);
}

/** Estándar que soporta el acta de cada comité (Res. 0312/2019). */
export const ESTANDAR_COMITE: Record<string, string> = { COPASST: "1.1.6", VIGIA: "1.1.6", CCL: "1.1.8", BRIGADA: "5.1.2" };
