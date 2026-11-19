// Almacenamiento de archivos: en Vercel usa Vercel Blob privado; en local, la carpeta uploads/.
// Las rutas guardadas en la base son siempre relativas ("uploads/..."), igual en ambos casos.
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const usaBlob = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
const valida = (ruta: string) => { if (!ruta.startsWith("uploads/") || ruta.includes("..")) throw new Error("Ruta inválida"); };

export async function guardar(ruta: string, buf: Buffer, contentType?: string) {
  valida(ruta);
  if (usaBlob()) {
    const { put } = await import("@vercel/blob");
    await put(ruta, buf, { access: "private", allowOverwrite: true, contentType });
    return;
  }
  const abs = join(process.cwd(), ruta);
  await mkdir(dirname(abs), { recursive: true });
  await writeFile(abs, buf);
}

export async function leer(ruta: string): Promise<Buffer> {
  valida(ruta);
  if (usaBlob()) {
    const { get } = await import("@vercel/blob");
    const r = await get(ruta, { access: "private" });
    if (!r) throw new Error("Archivo no encontrado");
    return Buffer.from(await new Response(r.stream).arrayBuffer());
  }
  return readFile(join(process.cwd(), ruta));
}

export async function borrar(ruta: string) {
  valida(ruta);
  if (usaBlob()) {
    const { del } = await import("@vercel/blob");
    await del(ruta).catch(() => null);
    return;
  }
  await unlink(join(process.cwd(), ruta)).catch(() => null);
}
