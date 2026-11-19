// Almacenamiento de archivos: en Vercel usa Vercel Blob; en local, la carpeta uploads/.
// Las rutas guardadas en la base son siempre relativas ("uploads/..."), igual en ambos casos.
// Acceso del Blob: privado por defecto. Si el store se creó público, definir BLOB_ACCESS=public:
// los nombres llevan un UUID aleatorio y la URL del Blob nunca se entrega al navegador (todo archivo
// se descarga por /api/archivos con sesión iniciada).
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const usaBlob = () => !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
const acceso = (): "public" | "private" => (process.env.BLOB_ACCESS === "public" ? "public" : "private");
const valida = (ruta: string) => { if (!ruta.startsWith("uploads/") || ruta.includes("..")) throw new Error("Ruta inválida"); };

export async function guardar(ruta: string, buf: Buffer, contentType?: string) {
  valida(ruta);
  if (usaBlob()) {
    const { put } = await import("@vercel/blob");
    await put(ruta, buf, { access: acceso(), allowOverwrite: true, contentType });
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
    const r = await get(ruta, { access: acceso() });
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

/** Borra todos los archivos que empiezan por un prefijo (por ejemplo, los logos anteriores de una empresa). */
export async function borrarPrefijo(prefijo: string) {
  valida(prefijo);
  if (usaBlob()) {
    const { list, del } = await import("@vercel/blob");
    const { blobs } = await list({ prefix: prefijo });
    if (blobs.length) await del(blobs.map((b) => b.url)).catch(() => null);
    return;
  }
  const { readdir } = await import("node:fs/promises");
  const dir = join(process.cwd(), dirname(prefijo));
  const base = prefijo.split("/").pop()!;
  for (const f of await readdir(dir).catch(() => [] as string[])) if (f.startsWith(base)) await unlink(join(dir, f)).catch(() => null);
}
