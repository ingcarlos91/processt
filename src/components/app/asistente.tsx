"use client";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ArrowUp, BookOpenText, Loader2, RotateCcw, Square, X } from "lucide-react";
import { Isotipo } from "@/components/app/isotipo";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { seccionDeRuta } from "@/lib/manual";
import { cn } from "@/lib/utils";

// Asistente flotante (docs/11-asistente-ia.md): guía a la consultora con la base de PROCESST. Solo lee y propone.

const CLAVE = "processt-asistente";

const HERRAMIENTAS: Record<string, string> = {
  buscar: "Buscando en la base de PROCESST", pantalla_actual: "Leyendo la ayuda de esta pantalla", estado_empresa: "Revisando el estado de la empresa",
  pendientes_empresa: "Revisando pendientes y fechas", por_que_empresa: "Revisando por qué aplica cada cosa", cartera: "Revisando la cartera",
  consultar_biblioteca: "Consultando la biblioteca de peligros", calcular_plazo: "Calculando la fecha límite", leer_articulo: "Leyendo el artículo oficial", consumo_ia: "Revisando el consumo de IA",
};

function sugerencias(seccion: string, hayEmpresa: boolean): string[] {
  if (!hayEmpresa) return ["¿Qué empresa debo atender primero?", "¿Cada cuánto se reúne el COPASST?", "¿Cuál es el plazo para reportar un accidente de trabajo?", "¿Cómo creo una empresa nueva?"];
  const porPantalla: Record<string, string> = {
    resumen: "¿Qué hago ahora en esta empresa?", matriz: "¿Cómo armo la matriz de peligros de un cargo?", trabajadores: "¿Qué exámenes médicos debo programar?",
    comites: "¿Cómo hago la elección del COPASST?", documentos: "¿Qué me falta para completar los documentos?", documento: "¿Qué exige la norma para este documento?",
    accidentes: "¿Qué plazos tengo después de un accidente?", evaluacion: "¿Cómo califico los estándares mínimos?", plan: "¿Qué debe tener el plan anual?",
    inspecciones: "¿Cada cuánto debo hacer inspecciones?", auditoria: "¿Qué revisa la auditoría interna?", indicadores: "¿Qué indicadores son obligatorios?",
  };
  return [porPantalla[seccion] ?? "¿Qué hago ahora en esta empresa?", "¿Qué me falta y qué está vencido?", "¿Cómo se usa esta pantalla?", "¿Por qué le aplica el COPASST o el Vigía?"].filter((x, i, a) => a.indexOf(x) === i);
}

// ── Markdown mínimo (negrita, cursiva, enlaces, código, listas, títulos) sin HTML crudo ──
function enLinea(t: string, cerrar: () => void): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|(?<![\w*])[_*]([^_*]+)[_*](?![\w*])|`([^`]+)`/g;
  let i = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(t))) {
    if (m.index > i) out.push(t.slice(i, m.index));
    if (m[1]) {
      const href = m[2];
      if (href.startsWith("/")) out.push(<Link key={k++} href={href} onClick={() => { if (window.innerWidth < 640) cerrar(); }} className="font-medium text-primary underline underline-offset-2">{m[1]}</Link>);
      else if (/^https:\/\//.test(href)) out.push(<a key={k++} href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">{m[1]}</a>);
      else out.push(m[1]);
    } else if (m[3]) out.push(<strong key={k++}>{m[3]}</strong>);
    else if (m[4]) out.push(<em key={k++}>{m[4]}</em>);
    else if (m[5]) out.push(<code key={k++} className="rounded bg-muted px-1 text-[0.85em]">{m[5]}</code>);
    i = m.index + m[0].length;
  }
  if (i < t.length) out.push(t.slice(i));
  return out;
}

function Markdown({ texto, cerrar }: { texto: string; cerrar: () => void }) {
  const bloques: React.ReactNode[] = [];
  let lista: { tipo: "ul" | "ol"; items: string[] } | null = null;
  const vaciar = () => {
    if (!lista) return;
    const L = lista.tipo;
    bloques.push(L === "ul"
      ? <ul key={bloques.length} className="ml-4 list-disc space-y-1">{lista.items.map((x, i) => <li key={i}>{enLinea(x, cerrar)}</li>)}</ul>
      : <ol key={bloques.length} className="ml-4 list-decimal space-y-1">{lista.items.map((x, i) => <li key={i}>{enLinea(x, cerrar)}</li>)}</ol>);
    lista = null;
  };
  let tabla: string[][] | null = null;
  const celdas = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const vaciarTabla = () => {
    if (!tabla) return;
    const [cab, ...filas] = tabla;
    bloques.push(
      <div key={bloques.length} className="overflow-x-auto rounded-md border">
        <table className="w-full text-xs">
          <thead className="bg-muted/60"><tr>{cab.map((c, i) => <th key={i} className="px-2 py-1.5 text-left font-medium">{enLinea(c, cerrar)}</th>)}</tr></thead>
          <tbody>{filas.map((f, i) => <tr key={i} className="border-t align-top">{f.map((c, j) => <td key={j} className="px-2 py-1.5">{enLinea(c, cerrar)}</td>)}</tr>)}</tbody>
        </table>
      </div>);
    tabla = null;
  };
  for (const linea of texto.split("\n")) {
    const l = linea.trimEnd();
    if (/^\s*\|.*\|\s*$/.test(l)) {
      vaciar();
      if (/^[\s|:-]+$/.test(l)) continue; // fila separadora
      (tabla ??= []).push(celdas(l));
      continue;
    }
    vaciarTabla();
    const ul = l.match(/^\s*[-*•]\s+(.*)$/), ol = l.match(/^\s*\d+[.)]\s+(.*)$/), h = l.match(/^#{1,4}\s+(.*)$/);
    if (ul || ol) {
      const tipo = ul ? "ul" : "ol";
      if (lista && lista.tipo !== tipo) vaciar();
      if (!lista) lista = { tipo, items: [] };
      lista.items.push((ul ?? ol)![1]);
      continue;
    }
    vaciar();
    if (!l.trim()) continue;
    if (h) bloques.push(<p key={bloques.length} className="font-semibold">{enLinea(h[1], cerrar)}</p>);
    else bloques.push(<p key={bloques.length}>{enLinea(l, cerrar)}</p>);
  }
  vaciar();
  vaciarTabla();
  return <div className="space-y-2 text-sm leading-relaxed">{bloques}</div>;
}

type Consumo = { usd: number; tope: number | null; pct: number | null; disponible: number | null; asistenteUsd: number };
const usd = (n: number) => `USD ${n.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Gasto de IA de la consultora este mes frente a su tope (lo fija el super administrador). */
function BarraConsumo({ c }: { c: Consumo }) {
  const pct = c.pct ?? 0;
  const color = pct >= 90 ? "bg-destructive" : pct >= 70 ? "bg-amber-500" : "bg-primary";
  const titulo = `PrudencIA este mes: ${usd(c.asistenteUsd)}. Incluye todas las funciones de IA (matriz, accidentes, acciones e informes).`;
  return (
    <div className="border-b px-3.5 py-1.5 text-[11px] text-muted-foreground" title={titulo}>
      <div className="flex items-center justify-between gap-2">
        <span>IA este mes: <span className="font-medium text-foreground">{usd(c.usd)}</span>{c.tope != null ? <> de {usd(c.tope)}</> : " · sin tope"}</span>
        {c.disponible != null && <span>{pct >= 100 ? "Tope alcanzado" : `Quedan ${usd(c.disponible)}`}</span>}
      </div>
      {c.tope != null && <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.max(pct, c.usd > 0 ? 2 : 0)}%` }} /></div>}
    </div>
  );
}

type ParteHerramienta = { type: string; state?: string; input?: unknown; output?: unknown };

/** Fuentes normativas o del manual que las herramientas devolvieron (para mostrarlas bajo la respuesta). */
function fuentesDe(m: UIMessage) {
  const out = new Map<string, { titulo: string; href?: string | null; url?: string | null }>();
  for (const p of m.parts as ParteHerramienta[]) {
    if (p.type !== "tool-buscar" || p.state !== "output-available" || !Array.isArray(p.output)) continue;
    for (const f of p.output as { titulo: string; href?: string | null; urlOficial?: string | null }[]) if (!out.has(f.titulo)) out.set(f.titulo, { titulo: f.titulo, href: f.href, url: f.urlOficial });
  }
  return [...out.values()].slice(0, 6);
}

function Mensaje({ m, cerrar }: { m: UIMessage; cerrar: () => void }) {
  if (m.role === "user") {
    const t = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
    return <div className="ml-8 self-end rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground whitespace-pre-wrap">{t}</div>;
  }
  const fuentes = fuentesDe(m);
  const partes = m.parts as (ParteHerramienta & { text?: string })[];
  const enCurso = partes.filter((p) => p.type.startsWith("tool-") && p.state !== "output-available" && p.state !== "output-error");
  return (
    <div className="mr-4 space-y-2">
      {partes.map((p, i) => p.type === "text" && p.text ? <Markdown key={i} texto={p.text} cerrar={cerrar} /> : null)}
      {enCurso.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-3 animate-spin" />{HERRAMIENTAS[p.type.slice(5)] ?? "Consultando"}…</div>
      ))}
      {fuentes.length > 0 && (
        <details className="rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs">
          <summary className="cursor-pointer select-none text-muted-foreground">Fuentes consultadas ({fuentes.length})</summary>
          <ul className="mt-1.5 space-y-1">
            {fuentes.map((f) => (
              <li key={f.titulo} className="leading-snug">
                {f.titulo}
                {f.href && <> · <Link href={f.href} className="text-primary underline">ir</Link></>}
                {f.url && <> · <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">norma oficial</a></>}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export function Asistente({ empresas }: { empresas: { id: string; razonSocial: string }[] }) {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const empresaId = pathname.match(/^\/empresas\/([^/]+)/)?.[1];
  const empresa = empresaId && empresaId !== "nueva" ? empresas.find((e) => e.id === empresaId) : undefined;
  const seccion = seccionDeRuta(pathname);

  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/asistente" }), []);
  const { messages, sendMessage, status, stop, setMessages, error, clearError } = useChat({ transport });

  // Conversación en la pestaña del navegador (no se guarda en la base).
  useEffect(() => {
    try {
      const g = sessionStorage.getItem(CLAVE);
      if (g) setMessages(JSON.parse(g));
    } catch { /* sin almacenamiento */ }
  }, [setMessages]);
  useEffect(() => {
    if (status === "ready" || status === "error") try { sessionStorage.setItem(CLAVE, JSON.stringify(messages.slice(-30))); } catch { /* lleno */ }
  }, [messages, status]);

  const fin = useRef<HTMLDivElement>(null);
  useEffect(() => { fin.current?.scrollIntoView({ block: "end" }); }, [messages, abierto]);
  const entrada = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (abierto) entrada.current?.focus(); }, [abierto]);

  const ocupado = status === "submitted" || status === "streaming";
  const enviar = (t: string) => {
    const q = t.trim();
    if (!q || ocupado) return;
    clearError();
    // La pantalla y la empresa viajan en cada mensaje; el servidor valida que la empresa sea de la consultora.
    sendMessage({ text: q }, { body: { pathname, empresaId: empresa?.id ?? null } });
    setTexto("");
  };
  const cerrar = () => setAbierto(false);

  // Consumo de IA del mes frente al tope: al abrir el panel y al terminar cada respuesta.
  const [consumo, setConsumo] = useState<Consumo | null>(null);
  useEffect(() => {
    if (!abierto || ocupado) return;
    let vivo = true;
    fetch("/api/asistente", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((c) => { if (vivo && c) setConsumo(c); }).catch(() => {});
    return () => { vivo = false; };
  }, [abierto, ocupado]);

  return (
    <div className="print:hidden">
      {!abierto && (
        <button
          type="button" onClick={() => setAbierto(true)} aria-label="Abrir PrudencIA, el asistente" title="PrudencIA: pregúnteme qué sigue o qué dice la norma"
          className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border bg-background py-1.5 pl-1.5 pr-1.5 shadow-lg transition hover:shadow-xl sm:pr-4"
        >
          <span className="asistente-halo flex size-11 items-center justify-center rounded-full bg-background">
            <Isotipo className="isotipo-ratos size-10" />
          </span>
          <span className="hidden text-sm font-medium sm:inline">Prudenc<span className="text-primary">IA</span></span>
        </button>
      )}
      {abierto && (
        <section
          aria-label="PrudencIA, asistente de PROCESST"
          className="fixed inset-x-2 bottom-2 z-40 flex h-[82dvh] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:h-[min(680px,calc(100dvh_-_6rem))] sm:w-[410px]"
        >
          <header className="flex items-start gap-2 border-b bg-muted/40 px-3.5 py-2.5">
            <Isotipo girando={ocupado} className="mt-0.5 size-6 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">Prudenc<span className="text-primary">IA</span> <span className="font-normal text-muted-foreground">· asistente</span></div>
              <div className="truncate text-xs text-muted-foreground">{empresa ? `Sobre: ${empresa.razonSocial}` : "Sobre toda la cartera"} · {seccion.titulo}</div>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" className="size-7" title="Nueva conversación" onClick={() => { stop(); setMessages([]); clearError(); try { sessionStorage.removeItem(CLAVE); } catch { /* */ } }}>
                <RotateCcw className="size-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="size-7" title="Cerrar" onClick={cerrar}><X className="size-4" /></Button>
          </header>
          {consumo && <BarraConsumo c={consumo} />}

          <div className="flex-1 overflow-y-auto px-3.5 py-3">
            {messages.length === 0 ? (
              <div className="space-y-4">
                <div className="flex gap-2.5 rounded-lg border bg-card p-3 text-sm">
                  <BookOpenText className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-muted-foreground"><span className="font-medium text-foreground">Hola, soy PrudencIA.</span> Pregúnteme qué sigue, qué le falta, cómo se hace algo en PROCESST o qué dice la norma. Respondo con la base de PROCESST y los datos de sus empresas; no busco en internet ni cambio datos.</p>
                </div>
                <div className="space-y-1.5">
                  {sugerencias(seccion.id, !!empresa).map((s) => (
                    <button key={s} type="button" onClick={() => enviar(s)} className="block w-full rounded-lg border px-3 py-2 text-left text-sm transition hover:bg-muted">{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((m) => <Fragment key={m.id}><Mensaje m={m} cerrar={cerrar} /></Fragment>)}
                {status === "submitted" && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Isotipo girando className="size-4" />Pensando…</div>}
                {error && <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">El asistente no respondió. Intente de nuevo.</div>}
              </div>
            )}
            <div ref={fin} />
          </div>

          <form className="border-t p-2.5" onSubmit={(e) => { e.preventDefault(); enviar(texto); }}>
            <div className="flex items-end gap-2">
              <Textarea
                ref={entrada} value={texto} onChange={(e) => setTexto(e.target.value)} rows={1} maxLength={1500}
                placeholder="Escriba su pregunta…" className="max-h-32 min-h-10 resize-none text-sm"
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(texto); } }}
              />
              {ocupado
                ? <Button type="button" size="icon" variant="secondary" title="Detener" onClick={() => stop()}><Square className="size-4" /></Button>
                : <Button type="submit" size="icon" title="Enviar" disabled={!texto.trim()}><ArrowUp className="size-4" /></Button>}
            </div>
            <p className={cn("mt-1.5 text-center text-[11px] text-muted-foreground")}>Responde con la base de PROCESST. Verifique lo importante en la norma.</p>
          </form>
        </section>
      )}
    </div>
  );
}
