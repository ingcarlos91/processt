// Sincroniza las plantillas de la base con los archivos prisma/seed/plantillas/*.md.
// Las que la consultora editó a mano (editadaPorUsuario) no se tocan. Se usa en la siembra y en cada build.
import type { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parsePlantilla } from "../../src/lib/generador/plantilla";

export async function sincronizarPlantillas(db: PrismaClient) {
  const dir = join(__dirname, "plantillas");
  const archivos = readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  let actualizadas = 0, respetadas = 0;
  for (const f of archivos) {
    const { meta, cuerpo } = parsePlantilla(readFileSync(join(dir, f), "utf8"));
    const data = {
      nombre: meta.nombre, tipo: meta.tipo, nivelMin: meta.nivelMin, condicion: (meta.condicion ?? undefined) as object | undefined,
      estandares: meta.estandares ?? [], normas: meta.normas ?? [], contenidoMd: cuerpo, carpeta: meta.carpeta, descripcion: meta.descripcion,
    };
    const prev = await db.plantilla.findUnique({ where: { codigo: meta.codigo } });
    if (!prev) { await db.plantilla.create({ data: { codigo: meta.codigo, ...data } }); actualizadas++; continue; }
    if (prev.editadaPorUsuario) { respetadas++; continue; }
    if (prev.contenidoMd !== cuerpo || prev.nombre !== meta.nombre) {
      await db.plantilla.update({ where: { codigo: meta.codigo }, data: { ...data, version: prev.version + 1, vigenteDesde: new Date() } });
      actualizadas++;
    } else await db.plantilla.update({ where: { codigo: meta.codigo }, data });
  }
  return { total: archivos.length, actualizadas, respetadas };
}
