import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Búsqueda en la base de conocimiento del asistente (tabla `conocimiento`, llena por scripts/indexar-conocimiento.ts).
 * Búsqueda de texto en español sin tildes de Postgres (configuración es_sin_tildes): primero todas las palabras; si no
 * hay resultados, cualquiera de ellas. El título pesa más que el texto.
 */

export const FUENTES = ["norma", "articulo", "requisito", "estandar", "manual", "campo", "plazo", "decision", "plantilla"] as const;
export type Fuente = (typeof FUENTES)[number];

export type Resultado = {
  clave: string; fuente: Fuente; titulo: string; extracto: string;
  normaCodigo: string | null; articulo: string | null; href: string | null; urlOficial: string | null; literal: boolean;
};

const VECTOR = Prisma.sql`setweight(to_tsvector('es_sin_tildes', titulo), 'A') || setweight(to_tsvector('es_sin_tildes', texto), 'B')`;

// Palabras que no ayudan a buscar (el diccionario español ya quita artículos y preposiciones).
const VACIAS = new Set(["como", "hago", "hacer", "que", "cual", "cuales", "donde", "cuando", "debo", "puedo", "tengo", "necesito", "sobre", "dice", "segun", "esta", "este", "esto"]);

function terminos(q: string) {
  return q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ.\s-]/g, " ")
    .split(/\s+/).filter((w) => w.length > 1 && !VACIAS.has(w));
}

async function consulta(tsq: Prisma.Sql, o: { fuentes?: Fuente[]; normaCodigo?: string; limite: number }) {
  const filtros = [Prisma.sql`(${VECTOR}) @@ ${tsq}`];
  if (o.fuentes?.length) filtros.push(Prisma.sql`fuente IN (${Prisma.join(o.fuentes)})`);
  if (o.normaCodigo) filtros.push(Prisma.sql`norma_codigo = ${o.normaCodigo}`);
  return db.$queryRaw<Resultado[]>`
    SELECT clave, fuente, titulo, norma_codigo AS "normaCodigo", articulo, href, url_oficial AS "urlOficial", literal,
      ts_headline('es_sin_tildes', texto, ${tsq}, 'MaxWords=60, MinWords=25, MaxFragments=2, FragmentDelimiter=" … ", StartSel="", StopSel=""') AS extracto
    FROM conocimiento
    WHERE ${Prisma.join(filtros, " AND ")}
    ORDER BY ts_rank(${VECTOR}, ${tsq}) DESC
    LIMIT ${o.limite}`;
}

export async function buscarConocimiento(q: string, o: { fuentes?: Fuente[]; normaCodigo?: string; limite?: number } = {}): Promise<Resultado[]> {
  const ws = terminos(q);
  const limite = Math.min(Math.max(o.limite ?? 8, 1), 20);
  if (!ws.length) return [];
  const y = Prisma.sql`plainto_tsquery('es_sin_tildes', ${ws.join(" ")})`;
  const r = await consulta(y, { ...o, limite });
  if (r.length || ws.length === 1) return r;
  const o_ = Prisma.sql`to_tsquery('es_sin_tildes', ${ws.map((w) => w.replace(/[^a-z0-9ñ]/g, "")).filter(Boolean).join(" | ")})`;
  return consulta(o_, { ...o, limite });
}

/** Reemplaza "{empresa}" en un enlace; sin empresa, los enlaces de empresa no sirven y se quitan. */
export function resolverHref(href: string | null, empresaId?: string | null) {
  if (!href) return null;
  if (href.includes("{empresa}")) return empresaId ? href.replace("{empresa}", empresaId) : null;
  return href;
}
