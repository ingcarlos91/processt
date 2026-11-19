import { db } from "@/lib/db";
import { construirContexto, type Contexto } from "./contexto";
import { render, dividirSecciones } from "./plantilla";

/** Genera (o regenera) los documentos aplicables de una empresa. Conserva ediciones manuales por sección. */
export async function generarDocumentos(empresaId: string, codigos?: string[]) {
  const ctx = await construirContexto(empresaId);
  const aplicables = ctx._reglas.documentos.map((d) => d.codigo).filter((c) => !codigos || codigos.includes(c));
  const plantillas = await db.plantilla.findMany({ where: { codigo: { in: aplicables } } });
  const resultado: { codigo: string; secciones: number; revisar: number }[] = [];

  for (const p of plantillas) {
    const md = render(p.contenidoMd, ctx);
    const secciones = dividirSecciones(md);
    const existente = await db.documento.findUnique({ where: { empresaId_codigo: { empresaId, codigo: p.codigo } }, include: { secciones: true } });
    let revisar = 0;
    if (!existente) {
      await db.documento.create({
        data: { empresaId, plantillaId: p.id, codigo: p.codigo, nombre: p.nombre, secciones: { create: secciones.map((s, i) => ({ orden: i, titulo: s.titulo, contenidoGenerado: s.contenido })) } },
      });
    } else {
      // Emparejar por título; si no existe, crear. Las secciones que ya no existen en la plantilla se eliminan si no tienen edición.
      const usados = new Set<string>();
      let cambio = false;
      for (const [i, s] of secciones.entries()) {
        const prev = existente.secciones.find((x) => x.titulo === s.titulo && !usados.has(x.id));
        if (prev) {
          usados.add(prev.id);
          if (prev.contenidoGenerado !== s.contenido) {
            cambio = true;
            const req = !!prev.contenidoEditado;
            if (req) revisar++;
            await db.documentoSeccion.update({ where: { id: prev.id }, data: { contenidoGenerado: s.contenido, orden: i, requiereRevision: req } });
          } else if (prev.orden !== i) await db.documentoSeccion.update({ where: { id: prev.id }, data: { orden: i } });
        } else {
          cambio = true;
          await db.documentoSeccion.create({ data: { documentoId: existente.id, orden: i, titulo: s.titulo, contenidoGenerado: s.contenido } });
        }
      }
      for (const x of existente.secciones) if (!usados.has(x.id) && !x.contenidoEditado) await db.documentoSeccion.delete({ where: { id: x.id } });
      await db.documento.update({
        where: { id: existente.id },
        data: { nombre: p.nombre, generadoEn: new Date(), ...(cambio ? { version: existente.version + 1, estado: "BORRADOR" } : {}) },
      });
    }
    resultado.push({ codigo: p.codigo, secciones: secciones.length, revisar });
  }
  return resultado;
}

/** Markdown final de un documento (usa la edición manual cuando existe). */
export function markdownDocumento(doc: { secciones: { orden: number; titulo: string; contenidoGenerado: string; contenidoEditado: string | null }[] }) {
  return [...doc.secciones]
    .sort((a, b) => a.orden - b.orden)
    .map((s) => (s.titulo ? `## ${s.titulo}\n\n` : "") + (s.contenidoEditado ?? s.contenidoGenerado))
    .join("\n\n");
}

export type { Contexto };

/** Al cambiar datos de la empresa, los documentos ya generados se actualizan solos (las ediciones manuales se conservan). */
export async function actualizarDocumentosExistentes(empresaId: string) {
  const docs = await db.documento.findMany({ where: { empresaId }, select: { codigo: true } });
  if (docs.length) await generarDocumentos(empresaId, docs.map((d) => d.codigo));
}

/** Regenera solo algunos documentos, si ya existen (para cambios puntuales: eventos, acciones). */
export async function actualizarDocumentos(empresaId: string, codigos: string[]) {
  const docs = await db.documento.findMany({ where: { empresaId, codigo: { in: codigos } }, select: { codigo: true } });
  if (docs.length) await generarDocumentos(empresaId, docs.map((d) => d.codigo));
}
