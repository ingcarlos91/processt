import { guardar, leer, borrar } from "@/lib/almacen";
import { imageSize } from "image-size";

const TIPOS: Record<string, "png" | "jpg"> = { "image/png": "png", "image/jpeg": "jpg" };
export const LOGO_MAX_BYTES = 2 * 1024 * 1024;

/** Guarda el logo de una empresa (PNG o JPG, máx. 2 MB) y devuelve la ruta relativa. */
export async function guardarLogo(empresaId: string, file: File) {
  const ext = TIPOS[file.type];
  if (!ext) throw new Error("El logo debe ser PNG o JPG.");
  if (file.size > LOGO_MAX_BYTES) throw new Error("El logo no puede superar 2 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  imageSize(buf); // valida que sea una imagen legible
  for (const e of Object.values(TIPOS)) await borrar(`uploads/logos/${empresaId}.${e}`);
  await guardar(`uploads/logos/${empresaId}.${ext}`, buf, file.type);
  return `uploads/logos/${empresaId}.${ext}`;
}

export async function borrarLogo(empresaId: string) {
  for (const e of Object.values(TIPOS)) await borrar(`uploads/logos/${empresaId}.${e}`);
}

/** Lee el logo y calcula su tamaño para que quepa en una caja manteniendo la proporción. */
export async function leerLogo(logoUrl: string | null | undefined, caja = { ancho: 110, alto: 50 }) {
  if (!logoUrl || !logoUrl.startsWith("uploads/")) return null;
  try {
    const buf = await leer(logoUrl);
    const { width = 1, height = 1 } = imageSize(buf);
    const escala = Math.min(caja.ancho / width, caja.alto / height);
    const tipo: "png" | "jpg" = logoUrl.endsWith(".png") ? "png" : "jpg";
    return { buf, tipo, ancho: Math.round(width * escala), alto: Math.round(height * escala), anchoOriginal: width, altoOriginal: height };
  } catch {
    return null;
  }
}
