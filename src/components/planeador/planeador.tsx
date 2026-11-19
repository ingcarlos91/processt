"use client";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarDays, CalendarPlus, Check, ChevronLeft, ChevronRight, Download, List, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Stat, NormaRef } from "@/components/app/ui";
import { Selector } from "@/components/app/selector";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { CATEGORIAS, type Categoria, type EstadoFecha, type Fecha } from "@/lib/planeador";
import * as A from "@/app/actions/planeador";
import { cn } from "@/lib/utils";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const DIAS = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const ESTADO: Record<EstadoFecha, { t: string; c: string }> = {
  vencido: { t: "Vencido", c: "border-red-300 bg-red-50 text-red-700" },
  hoy: { t: "Hoy", c: "border-orange-300 bg-orange-50 text-orange-700" },
  proximo: { t: "Próximo", c: "border-amber-300 bg-amber-50 text-amber-800" },
  pendiente: { t: "Pendiente", c: "border-slate-200 text-slate-600" },
  hecho: { t: "Hecho", c: "border-emerald-300 bg-emerald-50 text-emerald-700" },
};
const ymd = (s: string) => s.slice(0, 10);
const hoyIso = () => new Date().toISOString().slice(0, 10);

type Recordatorio = { id?: string; empresaId: string; fecha: string; titulo: string; notas: string };

export function Planeador({ fechas, empresas, empresaId, icsHref }: { fechas: Fecha[]; empresas: { id: string; nombre: string }[]; empresaId?: string; icsHref: string }) {
  const [pend, start] = useTransition();
  const [vista, setVista] = useState<"agenda" | "calendario">("agenda");
  const [filtroEstado, setFiltroEstado] = useState("abiertos");
  const [empresa, setEmpresa] = useState(empresaId ?? "todas");
  const [cats, setCats] = useState<Set<Categoria>>(new Set(Object.keys(CATEGORIAS) as Categoria[]));
  const [mes, setMes] = useState(() => { const d = new Date(); return { anio: d.getFullYear(), mes: d.getMonth() }; });
  const [diaSel, setDiaSel] = useState<string | null>(null);
  const [rec, setRec] = useState<Recordatorio | null>(null);
  const [ahora] = useState(() => Date.now());

  const visibles = useMemo(() => fechas.filter((f) =>
    cats.has(f.categoria) && (empresa === "todas" || f.empresaId === empresa || (empresa === "consultora" && !f.empresaId))
    && (filtroEstado === "todos" || (filtroEstado === "abiertos" ? f.estado !== "hecho" : filtroEstado === "vencidos" ? f.estado === "vencido" : filtroEstado === "semana" ? ["hoy", "proximo"].includes(f.estado) && new Date(f.fecha).getTime() - ahora <= 7 * 864e5 : f.estado === filtroEstado))
  ), [fechas, cats, empresa, filtroEstado, ahora]);

  const n = (fn: (f: Fecha) => boolean) => fechas.filter((f) => (empresa === "todas" || f.empresaId === empresa) && fn(f)).length;
  const en = (d: number) => ahora + d * 864e5;
  const run = (fn: () => Promise<{ error?: string } | { ok: true }>, ok: string, despues?: () => void) => start(async () => { const r = await fn(); if ("error" in r && r.error) toast.error(r.error); else { toast.success(ok); despues?.(); } });

  const porMes = useMemo(() => {
    const m = new Map<string, Fecha[]>();
    for (const f of visibles) { const k = f.fecha.slice(0, 7); m.set(k, [...(m.get(k) ?? []), f]); }
    return [...m.entries()];
  }, [visibles]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Vencidos" value={n((f) => f.estado === "vencido")} hint="Sin cumplir y con fecha pasada" tone={n((f) => f.estado === "vencido") ? "bad" : "ok"} />
        <Stat label="Esta semana" value={n((f) => f.estado !== "hecho" && f.estado !== "vencido" && new Date(f.fecha).getTime() <= en(7))} hint="Próximos 7 días" tone="warn" />
        <Stat label="Próximos 30 días" value={n((f) => f.estado !== "hecho" && f.estado !== "vencido" && new Date(f.fecha).getTime() <= en(30))} />
        <Stat label="Cumplidos" value={n((f) => f.estado === "hecho")} hint="En el periodo cargado" tone="ok" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border p-0.5">
          <Button size="sm" variant={vista === "agenda" ? "secondary" : "ghost"} onClick={() => setVista("agenda")}><List /> Agenda</Button>
          <Button size="sm" variant={vista === "calendario" ? "secondary" : "ghost"} onClick={() => setVista("calendario")}><CalendarDays /> Calendario</Button>
        </div>
        <Selector className="w-48" value={filtroEstado} onChange={setFiltroEstado} opciones={[
          { valor: "abiertos", etiqueta: "Pendientes y vencidos" }, { valor: "vencidos", etiqueta: "Solo vencidos" }, { valor: "semana", etiqueta: "Esta semana" },
          { valor: "hecho", etiqueta: "Cumplidos" }, { valor: "todos", etiqueta: "Todos" },
        ]} />
        {!empresaId && <Selector className="w-60" value={empresa} onChange={setEmpresa} opciones={[{ valor: "todas", etiqueta: "Todas las empresas" }, { valor: "consultora", etiqueta: "Solo de la consultora" }, ...empresas.map((e) => ({ valor: e.id, etiqueta: e.nombre }))]} />}
        <div className="flex-1" />
        <a href={icsHref} className={buttonVariants({ variant: "outline", size: "sm" })} title="Archivo .ics para importar en Google Calendar, Outlook o el celular"><Download /> Exportar a Google Calendar</a>
        <Button size="sm" onClick={() => setRec({ empresaId: empresaId ?? "", fecha: hoyIso(), titulo: "", notas: "" })}><CalendarPlus /> Agregar fecha</Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(CATEGORIAS) as Categoria[]).map((k) => {
          const on = cats.has(k);
          return (
            <button key={k} type="button" onClick={() => setCats((s) => { const x = new Set(s); if (on) x.delete(k); else x.add(k); return x; })}
              className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-opacity", on ? "bg-background" : "opacity-40")}>
              <span className={cn("size-2 rounded-full", CATEGORIAS[k].color)} />{CATEGORIAS[k].t}
            </button>
          );
        })}
      </div>

      {vista === "agenda" ? (
        visibles.length === 0 ? (
          <EstadoVacio ilustracion="plan" titulo="No hay fechas con estos filtros" descripcion="Cambie los filtros o agregue una fecha propia (visita, entrega, reunión)." />
        ) : (
          <div className="space-y-6">
            {porMes.map(([k, xs]) => (
              <section key={k}>
                <h3 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">{MESES[Number(k.slice(5, 7)) - 1]} {k.slice(0, 4)} <span className="font-normal">· {xs.length}</span></h3>
                <ul className="divide-y rounded-xl border bg-background">
                  {xs.map((f) => <Fila key={f.id} f={f} global={!empresaId} pend={pend}
                    onHecho={(h) => f.recordatorioId && run(() => A.marcarRecordatorio(f.recordatorioId!, h), h ? "Marcado como hecho" : "Reabierto")}
                    onEditar={() => f.recordatorioId && setRec({ id: f.recordatorioId, empresaId: f.empresaId ?? "", fecha: ymd(f.fecha), titulo: f.titulo, notas: f.detalle ?? "" })}
                    onEliminar={() => f.recordatorioId && run(() => A.eliminarRecordatorio(f.recordatorioId!), "Fecha eliminada")} />)}
                </ul>
              </section>
            ))}
          </div>
        )
      ) : (
        <Calendario fechas={visibles} mes={mes} setMes={setMes} diaSel={diaSel} setDiaSel={setDiaSel} global={!empresaId} />
      )}

      <Dialog open={!!rec} onOpenChange={(o) => !o && setRec(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{rec?.id ? "Editar fecha" : "Agregar fecha"}</DialogTitle><DialogDescription>Visitas, entregas, reuniones, vencimientos de documentos externos… Aparece en el planeador y en el calendario exportado.</DialogDescription></DialogHeader>
          {rec && (
            <div className="space-y-4">
              {!empresaId && <Field><FieldLabel>Empresa</FieldLabel><Selector value={rec.empresaId || "consultora"} onChange={(v) => setRec({ ...rec, empresaId: v === "consultora" ? "" : v })} opciones={[{ valor: "consultora", etiqueta: "De la consultora (sin empresa)" }, ...empresas.map((e) => ({ valor: e.id, etiqueta: e.nombre }))]} /></Field>}
              <Field><FieldLabel htmlFor="r-t">Qué</FieldLabel><Input id="r-t" value={rec.titulo} placeholder="Ej: Visita de seguimiento, entrega de informe mensual" onChange={(e) => setRec({ ...rec, titulo: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="r-f">Fecha</FieldLabel><Input id="r-f" type="date" value={rec.fecha} onChange={(e) => setRec({ ...rec, fecha: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="r-n">Notas</FieldLabel><Textarea id="r-n" rows={2} value={rec.notas} onChange={(e) => setRec({ ...rec, notas: e.target.value })} /></Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRec(null)}>Cancelar</Button>
            <Button disabled={pend || !rec?.titulo.trim()} onClick={() => rec && run(() => A.guardarRecordatorio(rec), "Fecha guardada", () => setRec(null))}>{pend && <Spinner />} Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Fila({ f, global, pend, onHecho, onEditar, onEliminar }: { f: Fecha; global: boolean; pend: boolean; onHecho: (h: boolean) => void; onEditar: () => void; onEliminar: () => void }) {
  const d = new Date(f.fecha);
  return (
    <li className={cn("flex items-start gap-3 px-4 py-3", f.estado === "hecho" && "opacity-60")}>
      <div className="w-12 shrink-0 text-center">
        {f.mesCompleto ? <div className="pt-1 text-[11px] leading-tight text-muted-foreground">en el<br />mes</div> : <><div className="text-lg font-semibold leading-none">{d.getUTCDate()}</div><div className="text-[11px] uppercase text-muted-foreground">{DIAS[(d.getUTCDay() + 6) % 7]}</div></>}
      </div>
      <span className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", CATEGORIAS[f.categoria].color)} />
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm font-medium", f.estado === "hecho" && "line-through")}>{f.titulo}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {global && <span className="font-medium text-foreground/70">{f.empresa}</span>}
          <span>{CATEGORIAS[f.categoria].t}</span>
          {f.normaRef && <NormaRef>{f.normaRef}</NormaRef>}
        </div>
        {f.detalle && <p className="mt-1 text-xs text-muted-foreground">{f.detalle}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
      <Badge variant="outline" className={cn("shrink-0", ESTADO[f.estado].c)}>{ESTADO[f.estado].t}</Badge>
      <div className="flex items-center gap-0.5">
        {f.recordatorioId ? (
          <>
            {f.estado === "hecho"
              ? <Button size="icon-sm" variant="ghost" aria-label="Reabrir" disabled={pend} onClick={() => onHecho(false)}><RotateCcw /></Button>
              : <Button size="icon-sm" variant="ghost" aria-label="Marcar como hecho" disabled={pend} onClick={() => onHecho(true)}><Check /></Button>}
            <Button size="icon-sm" variant="ghost" aria-label="Editar" onClick={onEditar}><Pencil /></Button>
            <Button size="icon-sm" variant="ghost" aria-label="Eliminar" disabled={pend} onClick={onEliminar}><Trash2 /></Button>
          </>
        ) : <Link href={f.href} className={buttonVariants({ size: "sm", variant: "ghost" })}>Abrir</Link>}
      </div>
      </div>
    </li>
  );
}

function Calendario({ fechas, mes, setMes, diaSel, setDiaSel, global }: { fechas: Fecha[]; mes: { anio: number; mes: number }; setMes: (m: { anio: number; mes: number }) => void; diaSel: string | null; setDiaSel: (d: string | null) => void; global: boolean }) {
  const primero = new Date(Date.UTC(mes.anio, mes.mes, 1));
  const offset = (primero.getUTCDay() + 6) % 7;
  const diasMes = new Date(Date.UTC(mes.anio, mes.mes + 1, 0)).getUTCDate();
  const celdas = Array.from({ length: Math.ceil((offset + diasMes) / 7) * 7 }, (_, i) => i - offset + 1);
  const key = (d: number) => `${mes.anio}-${String(mes.mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const delDia = (k: string) => fechas.filter((f) => !f.mesCompleto && ymd(f.fecha) === k);
  const delMes = fechas.filter((f) => f.mesCompleto && f.fecha.slice(0, 7) === `${mes.anio}-${String(mes.mes + 1).padStart(2, "0")}`);
  const mover = (n: number) => { const d = new Date(Date.UTC(mes.anio, mes.mes + n, 1)); setMes({ anio: d.getUTCFullYear(), mes: d.getUTCMonth() }); setDiaSel(null); };
  const hoy = hoyIso();
  const sel = diaSel ? delDia(diaSel) : [];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button size="icon-sm" variant="outline" aria-label="Mes anterior" onClick={() => mover(-1)}><ChevronLeft /></Button>
        <div className="w-44 text-center font-semibold capitalize">{MESES[mes.mes]} {mes.anio}</div>
        <Button size="icon-sm" variant="outline" aria-label="Mes siguiente" onClick={() => mover(1)}><ChevronRight /></Button>
        <Button size="sm" variant="ghost" onClick={() => { const d = new Date(); setMes({ anio: d.getFullYear(), mes: d.getMonth() }); setDiaSel(hoy); }}>Hoy</Button>
      </div>
      {delMes.length > 0 && (
        <div className="rounded-xl border bg-sky-50/40 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actividades del plan anual en este mes ({delMes.length}) · sin día exacto</div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {delMes.map((f) => (
              <li key={f.id} className={cn("flex items-center gap-2 text-sm", f.estado === "hecho" && "line-through opacity-60")}>
                <span className={cn("size-2 shrink-0 rounded-full", CATEGORIAS[f.categoria].color)} />
                <Link href={f.href} className="truncate hover:underline">{global ? <span className="font-medium">{f.empresa}: </span> : null}{f.titulo}</Link>
                {f.estado === "vencido" && <Badge variant="outline" className={ESTADO.vencido.c}>Vencida</Badge>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border bg-background">
        <div className="grid grid-cols-7 border-b bg-muted/40 text-center text-xs font-medium text-muted-foreground">{DIAS.map((d) => <div key={d} className="py-2 capitalize">{d}</div>)}</div>
        <div className="grid grid-cols-7">
          {celdas.map((d, i) => {
            const k = d >= 1 && d <= diasMes ? key(d) : null;
            const xs = k ? delDia(k) : [];
            return (
              <button key={i} type="button" disabled={!k} onClick={() => k && setDiaSel(k === diaSel ? null : k)}
                className={cn("flex min-h-24 flex-col items-stretch justify-start border-b border-r p-1.5 text-left transition-colors [&:nth-child(7n)]:border-r-0 disabled:cursor-default disabled:bg-muted/20", k && "hover:bg-muted/40", k !== null && k === diaSel && "bg-sky-50 ring-2 ring-inset ring-sky-300")}>
                {k && <div className={cn("mb-1 inline-flex size-6 self-start items-center justify-center rounded-full text-xs", k === hoy && "bg-primary font-semibold text-primary-foreground")}>{d}</div>}
                <div className="space-y-0.5">
                  {xs.slice(0, 3).map((f) => (
                    <div key={f.id} className={cn("flex items-center gap-1 truncate rounded px-1 text-[11px]", f.estado === "vencido" && "bg-red-50 text-red-700", f.estado === "hecho" && "line-through opacity-60")}>
                      <span className={cn("size-1.5 shrink-0 rounded-full", CATEGORIAS[f.categoria].color)} /><span className="truncate">{global ? `${f.empresa}: ` : ""}{f.titulo}</span>
                    </div>
                  ))}
                  {xs.length > 3 && <div className="px-1 text-[11px] text-muted-foreground">+{xs.length - 3} más</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {diaSel && (
        <div className="rounded-xl border bg-background">
          <div className="border-b px-4 py-2 text-sm font-medium">{new Date(diaSel + "T12:00:00Z").toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</div>
          {sel.length === 0 ? <p className="px-4 py-3 text-sm text-muted-foreground">Sin fechas este día.</p> : (
            <ul className="divide-y">{sel.map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className={cn("size-2.5 rounded-full", CATEGORIAS[f.categoria].color)} />
                <span className="flex-1">{global && <span className="font-medium">{f.empresa}: </span>}{f.titulo}</span>
                <Badge variant="outline" className={ESTADO[f.estado].c}>{ESTADO[f.estado].t}</Badge>
                <Link href={f.href} className={buttonVariants({ size: "sm", variant: "ghost" })}>Abrir</Link>
              </li>
            ))}</ul>
          )}
        </div>
      )}
    </div>
  );
}
