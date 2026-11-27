import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, isStepCount, streamText, toUIMessageStream, type UIMessage } from "ai";
import type { AnthropicLanguageModelOptions } from "@ai-sdk/anthropic";
import { requiereUsuario } from "@/lib/auth/sesion";
import { db } from "@/lib/db";
import { puedeVerEmpresa } from "@/lib/auth/acceso";
import { ErrorIA, MODELOS, anonimizar, consumoIA, modeloIA, personasDe, registrarUsoIA, verificarTopeIA } from "@/lib/ia/motor";
import { INSTRUCCIONES, herramientasAsistente, hoyColombia } from "@/lib/ia/asistente";
import { buscarConocimiento, resolverHref } from "@/lib/conocimiento";

// Asistente flotante (docs/11-asistente-ia.md). Solo lee: responde con la base de PROCESST y los datos de la consultora.
export const maxDuration = 60;

const MAX_MENSAJES = 12;

/** Consumo de IA del mes de la consultora (para el encabezado del panel). */
export async function GET() {
  const u = await requiereUsuario().catch(() => null);
  if (!u) return Response.json({ error: "Sin sesión." }, { status: 401 });
  return Response.json(await consumoIA(u.consultoraId), { headers: { "Cache-Control": "no-store" } });
}

const textoDe = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();

export async function POST(req: Request) {
  // Usuario activo de una consultora activa, con sesión vigente (el super administrador no tiene asistente).
  const u = await requiereUsuario().catch(() => null);
  if (!u) return Response.json({ error: "Sesión vencida o sin acceso. Vuelva a ingresar." }, { status: 401 });
  const consultoraId = u.consultoraId;

  const body = (await req.json().catch(() => null)) as { messages?: UIMessage[]; pathname?: string; empresaId?: string | null } | null;
  if (!body?.messages?.length) return Response.json({ error: "Sin mensajes." }, { status: 400 });
  const pathname = typeof body.pathname === "string" ? body.pathname.slice(0, 200) : "/";
  // La empresa sale de la pantalla y se valida aquí; si no es de la consultora, se ignora sin revelar nada.
  const empresaId = typeof body.empresaId === "string" && (await puedeVerEmpresa(body.empresaId, consultoraId)) ? body.empresaId : null;
  const personas = empresaId ? await personasDe(empresaId) : { nombres: [], docs: [] };

  // Historial corto y sin nombres ni documentos de las personas de la empresa (Ley 1581/2012).
  const mensajes = body.messages.slice(-MAX_MENSAJES).map((m) => (m.role !== "user" || !empresaId ? m : {
    ...m, parts: m.parts.map((p) => (p.type === "text" ? { ...p, text: anonimizar(p.text, personas.nombres, personas.docs) } : p)),
  }));
  const ultima = textoDe(body.messages.at(-1)!);

  try {
    await verificarTopeIA(consultoraId);
  } catch (e) {
    // Respaldo sin IA: lo que la base de conocimiento encuentra para la última pregunta, como mensaje del chat.
    const r = await buscarConocimiento(ultima, { limite: 6 });
    const aviso = e instanceof ErrorIA ? e.message : "La IA no está disponible.";
    const lineas = r.map((x) => {
      const href = resolverHref(x.href, empresaId);
      return `- **${x.titulo}**${x.articulo ? ` (${x.articulo})` : ""}: ${x.extracto}${href ? ` [Ir](${href})` : ""}${x.urlOficial ? ` [Norma oficial](${x.urlOficial})` : ""}`;
    });
    const texto = `_${aviso} Le muestro lo que encontré en la base de PROCESST, sin redactar una respuesta:_\n\n${lineas.length ? lineas.join("\n") : "No encontré nada con esas palabras. Intente con otras (p. ej. el nombre del comité, el código del documento o el número del estándar)."}`;
    return createUIMessageStreamResponse({ stream: createUIMessageStream({ execute: ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: "r" });
      writer.write({ type: "text-delta", id: "r", delta: texto });
      writer.write({ type: "text-end", id: "r" });
      writer.write({ type: "finish" });
    } }) });
  }

  const empresa = empresaId ? await db.empresa.findUnique({ where: { id: empresaId }, select: { razonSocial: true } }) : null;
  const contexto = `Pantalla actual: ${pathname}. ${empresa ? `Empresa abierta: ${empresa.razonSocial}.` : "No hay una empresa abierta (la usuaria está en una pantalla general)."} Fecha de hoy en Colombia: ${hoyColombia()}.`;
  const modelo = MODELOS.asistente;

  const result = streamText({
    model: modeloIA(modelo),
    instructions: [
      { role: "system", content: INSTRUCCIONES, providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } } },
      { role: "system", content: contexto },
    ],
    messages: await convertToModelMessages(mensajes),
    tools: herramientasAsistente({ consultoraId, empresaId, pathname, personas }),
    stopWhen: isStepCount(6),
    maxOutputTokens: 1200,
    maxRetries: 1,
    providerOptions: { anthropic: { effort: "low" } satisfies AnthropicLanguageModelOptions },
    onEnd: async ({ totalUsage }) => {
      const d = totalUsage.inputTokenDetails;
      await registrarUsoIA({ consultoraId, usuarioId: u.id, tarea: "asistente", modelo, entrada: totalUsage.inputTokens ?? 0, salida: totalUsage.outputTokens ?? 0, ok: true, leidos: d?.cacheReadTokens ?? 0, escritos: d?.cacheWriteTokens ?? 0 });
    },
    onError: async ({ error }) => {
      console.error("[ia] asistente:", error instanceof Error ? error.message : error);
      await registrarUsoIA({ consultoraId, usuarioId: u.id, tarea: "asistente", modelo, entrada: 0, salida: 0, ok: false });
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: () => "El asistente no respondió. Intente de nuevo.",
    }),
  });
}
