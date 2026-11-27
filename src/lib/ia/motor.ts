import { generateText, Output } from "ai";
import { anthropic, type AnthropicLanguageModelOptions } from "@ai-sdk/anthropic";
import type { z } from "zod";
import { db } from "@/lib/db";

/**
 * Motor único de IA de PROCESST. La IA solo propone (salida estructurada); nada se aprueba sin la consultora.
 *
 * - Con ANTHROPIC_API_KEY llama directo a la API de Anthropic (créditos de la organización del dueño de PROCESST);
 *   si no está, usa Vercel AI Gateway (AI_GATEWAY_API_KEY).
 * - Dos niveles de modelo, configurables sin tocar código:
 *     IA_MODELO_BASICO  (por defecto claude-haiku-5-5): redacción y propuestas sencillas.
 *     IA_MODELO_TECNICO (por defecto claude-haiku-5-5): matriz de peligros y análisis de accidentes.
 *   Piloto con Haiku en todo (en accidentes dio la misma calidad que Sonnet a 1/16 del costo). Si hace falta más
 *   criterio técnico: IA_MODELO_TECNICO=claude-sonnet-5-5.
 * - Cada llamada queda en UsoIa con tokens y costo; si la consultora pasó su tope mensual, no se llama.
 * - Privacidad (Ley 1581/2012): quien llama no envía nombres, documentos ni datos de salud de trabajadores (ver anonimizar).
 */

export type NivelIA = "basico" | "tecnico";
export type TareaIA = "matriz" | "accidente" | "accion" | "observaciones" | "biblioteca" | "asistente";

export const MODELOS: Record<NivelIA | "asistente", string> = {
  basico: process.env.IA_MODELO_BASICO || "claude-haiku-5-5",
  tecnico: process.env.IA_MODELO_TECNICO || "claude-haiku-5-5",
  // Asistente flotante (docs/11-asistente-ia.md): conversa y consulta la base de PROCESST con herramientas.
  asistente: process.env.IA_MODELO_ASISTENTE || "claude-haiku-5-5",
};

// USD por millón de tokens (entrada, salida). Tarifas de la API de Anthropic.
const PRECIOS: Record<string, [number, number]> = {
  "claude-haiku-5-5": [0.1, 0.5],
  "claude-sonnet-5-5": [2, 10],
  "claude-opus-5-5": [4, 20],
};

export const iaDisponible = () => !!(process.env.ANTHROPIC_API_KEY || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
export const proveedorIA = () => (process.env.ANTHROPIC_API_KEY ? "API de Anthropic" : "Vercel AI Gateway");

const modelo = (id: string) => (process.env.ANTHROPIC_API_KEY ? anthropic(id) : `anthropic/${id}`);

/** Costo en USD. Los tokens leídos de la caché cuestan el 10 % y los escritos en ella el 125 % del precio de entrada. */
export function costoUsd(modeloId: string, entrada: number, salida: number, cacheLeidos = 0, cacheEscritos = 0) {
  const [pe, ps] = PRECIOS[modeloId] ?? PRECIOS["claude-sonnet-5-5"];
  const normal = Math.max(0, entrada - cacheLeidos - cacheEscritos);
  return (normal * pe + cacheLeidos * pe * 0.1 + cacheEscritos * pe * 1.25 + salida * ps) / 1e6;
}

const inicioMes = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);

/** Gasto de IA de la consultora en el mes calendario actual (USD). */
export async function gastoMesIA(consultoraId: string) {
  const r = await db.usoIa.aggregate({ where: { consultoraId, creadoEn: { gte: inicioMes() } }, _sum: { costoUsd: true }, _count: true });
  return { usd: r._sum.costoUsd ?? 0, usos: r._count };
}

/** Consumo de IA del mes de la consultora frente a su tope, con lo que gastó el asistente. */
export async function consumoIA(consultoraId: string) {
  const [c, total, asis] = await Promise.all([
    db.consultora.findUnique({ where: { id: consultoraId }, select: { iaTopeMensualUsd: true } }),
    gastoMesIA(consultoraId),
    db.usoIa.aggregate({ where: { consultoraId, tarea: "asistente", creadoEn: { gte: inicioMes() } }, _sum: { costoUsd: true }, _count: true }),
  ]);
  const tope = c?.iaTopeMensualUsd ?? null;
  return {
    usd: total.usd, usos: total.usos, tope, pct: tope ? Math.min(100, Math.round((total.usd / tope) * 100)) : null,
    disponible: tope != null ? Math.max(0, tope - total.usd) : null, asistenteUsd: asis._sum.costoUsd ?? 0, asistenteUsos: asis._count,
  };
}

export class ErrorIA extends Error {}

/** Lanza ErrorIA si la IA no está configurada o la consultora pasó su tope mensual. */
export async function verificarTopeIA(consultoraId: string) {
  if (!iaDisponible()) throw new ErrorIA("La IA no está configurada (falta ANTHROPIC_API_KEY).");
  const c = await db.consultora.findUnique({ where: { id: consultoraId }, select: { iaTopeMensualUsd: true } });
  if (c?.iaTopeMensualUsd != null) {
    const { usd } = await gastoMesIA(consultoraId);
    if (usd >= c.iaTopeMensualUsd) throw new ErrorIA(`Su consultora alcanzó el tope de IA de este mes (USD ${c.iaTopeMensualUsd.toFixed(2)}). Se usan las sugerencias de la biblioteca; el administrador de PROCESST puede ampliar el tope.`);
  }
}

/** Registra una llamada en UsoIa con su costo (no falla si no se puede registrar). */
export function registrarUsoIA(o: { consultoraId: string; usuarioId?: string | null; tarea: TareaIA; modelo: string; entrada: number; salida: number; ok: boolean; leidos?: number; escritos?: number }) {
  return db.usoIa.create({ data: {
    consultoraId: o.consultoraId, usuarioId: o.usuarioId ?? null, tarea: o.tarea, modelo: o.modelo, tokensEntrada: o.entrada, tokensSalida: o.salida,
    costoUsd: costoUsd(o.modelo, o.entrada, o.salida, o.leidos ?? 0, o.escritos ?? 0), ok: o.ok,
  } }).catch(() => null);
}

/** Modelo del proveedor configurado (API de Anthropic directa o AI Gateway). */
export const modeloIA = (id: string) => modelo(id);

/** Llama a la IA con salida estructurada, controla el tope y registra el uso. Lanza ErrorIA con un mensaje para mostrar. */
export async function generarConIA<S extends z.ZodType>(o: {
  consultoraId: string; usuarioId?: string | null; tarea: TareaIA; nivel: NivelIA; schema: S; system: string; prompt: string;
  /** Contexto grande y estable (p. ej. la biblioteca): va en caché, así las consultas seguidas lo leen al 10 % del precio. */
  contexto?: string;
  effort?: "low" | "medium" | "high";
}): Promise<z.infer<S>> {
  await verificarTopeIA(o.consultoraId);
  const id = MODELOS[o.nivel];
  const registrar = (entrada: number, salida: number, ok: boolean, leidos = 0, escritos = 0) =>
    registrarUsoIA({ consultoraId: o.consultoraId, usuarioId: o.usuarioId, tarea: o.tarea, modelo: id, entrada, salida, ok, leidos, escritos });
  try {
    const r = await generateText({
      model: modelo(id),
      output: Output.object({ schema: o.schema }),
      instructions: [
        { role: "system", content: o.system },
        ...(o.contexto ? [{ role: "system" as const, content: o.contexto, providerOptions: { anthropic: { cacheControl: { type: "ephemeral" as const } } } }] : []),
      ],
      prompt: o.prompt,
      maxRetries: 1,
      providerOptions: { anthropic: { effort: o.effort ?? (o.nivel === "tecnico" ? "medium" : "low") } satisfies AnthropicLanguageModelOptions },
    });
    const d = r.usage.inputTokenDetails;
    await registrar(r.usage.inputTokens ?? 0, r.usage.outputTokens ?? 0, true, d?.cacheReadTokens ?? 0, d?.cacheWriteTokens ?? 0);
    return r.output as z.infer<S>;
  } catch (e) {
    await registrar(0, 0, false);
    console.error(`[ia] ${o.tarea} con ${id}:`, e instanceof Error ? e.message : e);
    throw new ErrorIA("La IA no respondió. Intente de nuevo o use las sugerencias de la biblioteca.");
  }
}

/**
 * Quita de un texto los nombres y documentos de personas conocidas (trabajadores, testigos, investigadores) antes de
 * enviarlo a la IA. Los reemplaza por «[persona]» o «[documento]» (Ley 1581/2012: minimización de datos personales).
 */
export function anonimizar(texto: string, nombres: (string | null | undefined)[], documentos: (string | null | undefined)[] = []) {
  let t = texto;
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const d of documentos) if (d && d.trim().length >= 5) t = t.replace(new RegExp(esc(d.trim()).replace(/\\\./g, "\\.?"), "g"), "[documento]");
  // Nombre completo y, además, cada nombre o apellido de 4 o más letras.
  const partes = new Set<string>();
  for (const n of nombres) {
    if (!n?.trim()) continue;
    partes.add(n.trim());
    for (const p of n.trim().split(/\s+/)) if (p.length >= 4) partes.add(p);
  }
  for (const p of [...partes].sort((a, b) => b.length - a.length)) t = t.replace(new RegExp(`(?<![\\p{L}])${esc(p)}(?![\\p{L}])`, "giu"), "[persona]");
  return t.replace(/\[persona\](\s+\[persona\])+/g, "[persona]");
}

/** Nombres y documentos de las personas de la empresa, para quitarlos de lo que se envía a la IA (Ley 1581/2012). */
export async function personasDe(empresaId: string) {
  const t = await db.trabajador.findMany({ where: { empresaId }, select: { nombres: true, documento: true } });
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { representanteLegal: true, responsableSst: true } });
  const miembros = await db.comiteMiembro.findMany({ where: { comite: { empresaId } }, select: { nombre: true } }).catch(() => [] as { nombre: string }[]);
  return {
    nombres: [...t.map((x) => x.nombres), ...miembros.map((m) => m.nombre), e.representanteLegal, (e.responsableSst as { nombre?: string } | null)?.nombre],
    docs: t.map((x) => x.documento),
  };
}
