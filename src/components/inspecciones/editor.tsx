"use client";
import { FilaAccion, type AccionUI } from "@/components/acciones/fila-accion";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, ClipboardCheck, Minus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Selector } from "@/components/app/selector";
import { Combo } from "@/components/app/combo";
import { Confirmar } from "@/components/app/confirmar";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { SubirArchivo, ListaArchivos, type ArchivoUI } from "@/components/app/adjuntos";
import * as A from "@/app/actions/inspecciones";
import type { ItemInspeccion } from "@/app/actions/inspecciones";
import { cn } from "@/lib/utils";

type Lista = { nombre: string; descripcion: string; items: string[]; frecuenciaDias: number };
type Item = { pregunta: string; resultado: "cumple" | "no_cumple" | "na"; observacion: string };
type Ins = { id: string; lista: string; fecha: string; lugar: string; responsable: string; participantes: string; observaciones: string; items: Item[]; acciones: AccionUI[]; archivos: ArchivoUI[] };

const hoy = () => new Date().toISOString().slice(0, 10);
const en30 = () => new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
const fecha = (f: string) => (f ? new Date(f + "T12:00:00Z").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");
const cumplimiento = (items: { resultado: string }[]) => { const ap = items.filter((i) => i.resultado !== "na"); return ap.length ? Math.round((ap.filter((i) => i.resultado === "cumple").length / ap.length) * 100) : 100; };
const RES = { cumple: { t: "Cumple", c: "border-emerald-500 bg-emerald-500 text-white", i: Check }, no_cumple: { t: "No cumple", c: "border-red-500 bg-red-500 text-white", i: X }, na: { t: "N. A.", c: "border-slate-400 bg-slate-400 text-white", i: Minus } } as const;

export function InspeccionesEditor({ empresaId, inspecciones, listas, lugares, personas, responsable }: { empresaId: string; inspecciones: Ins[]; listas: Lista[]; lugares: string[]; personas: string[]; responsable: string }) {
  const [pend, start] = useTransition();
  const [nueva, setNueva] = useState<{ lista: string; fecha: string; lugar: string; responsable: string; participantes: string; observaciones: string; items: ItemInspeccion[] } | null>(null);
  const [ver, setVer] = useState<string | null>(null);
  const insVer = inspecciones.find((i) => i.id === ver);
  const lista = listas.find((l) => l.nombre === nueva?.lista);
  const abrir = (nombre: string) => { const l = listas.find((x) => x.nombre === nombre); setNueva({ lista: nombre, fecha: hoy(), lugar: "", responsable, participantes: "", observaciones: "", items: (l?.items ?? []).map((pregunta) => ({ pregunta, resultado: "", observacion: "", accion: null })) }); };
  const setItem = (i: number, x: Partial<ItemInspeccion>) => nueva && setNueva({ ...nueva, items: nueva.items.map((it, j) => (j === i ? { ...it, ...x } : it)) });
  const calificados = nueva?.items.filter((i) => i.resultado).length ?? 0;
  const anio = new Date().getFullYear();
  const delAnio = inspecciones.filter((i) => i.fecha.startsWith(String(anio)));
  const abiertas = inspecciones.flatMap((i) => i.acciones).filter((a) => a.estado === "abierta").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="max-w-3xl text-sm text-muted-foreground">Inspecciones sistemáticas a instalaciones, equipos y EPP, con participación del COPASST o Vigía. Cada hallazgo puede convertirse en una acción correctiva (FOR-06) y el planeador avisa la próxima inspección. <NormaRef>Res. 0312/2019 estándar 4.2.4</NormaRef></p>
        <div className="flex-1" />
        <Selector className="w-72" value="" placeholder="Nueva inspección: elija la lista…" onChange={(v) => v && abrir(v)} opciones={listas.map((l) => ({ valor: l.nombre, etiqueta: l.nombre }))} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={`Inspecciones ${anio}`} value={delAnio.length} />
        <Stat label="Cumplimiento promedio" value={delAnio.length ? `${Math.round(delAnio.reduce((s, i) => s + cumplimiento(i.items), 0) / delAnio.length)}%` : "—"} />
        <Stat label="Hallazgos (no cumple)" value={delAnio.reduce((s, i) => s + i.items.filter((x) => x.resultado === "no_cumple").length, 0)} />
        <Stat label="Acciones abiertas" value={abiertas} tone={abiertas ? "warn" : "ok"} />
      </div>

      {inspecciones.length === 0 ? (
        <EstadoVacio ilustracion="matriz" titulo="Aún no hay inspecciones" descripcion="Elija una lista de chequeo (locativa, extintores, botiquín, EPP, herramientas, vehículos, eléctrica, orden y aseo) y califique cada ítem. Las listas se editan en Biblioteca → Inspecciones.">
          <Selector className="w-72" value="" placeholder="Elija la lista de chequeo…" onChange={(v) => v && abrir(v)} opciones={listas.map((l) => ({ valor: l.nombre, etiqueta: l.nombre }))} />
        </EstadoVacio>
      ) : (
        <Section contentClassName="px-0">
          <Table>
            <TableHeader><TableRow><TableHead className="pl-6">Fecha</TableHead><TableHead>Inspección</TableHead><TableHead>Lugar</TableHead><TableHead>Cumplimiento</TableHead><TableHead>Hallazgos</TableHead><TableHead>Acciones</TableHead><TableHead className="pr-6 w-12" /></TableRow></TableHeader>
            <TableBody>
              {inspecciones.map((i) => { const c = cumplimiento(i.items); return (
                <TableRow key={i.id} className="cursor-pointer" onClick={() => setVer(i.id)}>
                  <TableCell className="pl-6 text-xs">{fecha(i.fecha)}</TableCell>
                  <TableCell><div className="font-medium">{i.lista}</div><div className="text-xs text-muted-foreground">{i.responsable}</div></TableCell>
                  <TableCell>{i.lugar || "—"}</TableCell>
                  <TableCell><div className="w-28"><div className={cn("text-xs", c < 70 ? "text-red-600" : c < 90 ? "text-amber-700" : "text-emerald-700")}>{c}%</div><Progress value={c} /></div></TableCell>
                  <TableCell>{i.items.filter((x) => x.resultado === "no_cumple").length}</TableCell>
                  <TableCell className="text-xs">{i.acciones.length ? `${i.acciones.filter((a) => a.estado === "abierta").length} abiertas de ${i.acciones.length}` : "—"}</TableCell>
                  <TableCell className="pr-6" onClick={(e) => e.stopPropagation()}><Confirmar trigger={<Button size="icon-sm" variant="ghost" aria-label="Eliminar inspección" />} titulo="Eliminar inspección" descripcion="Se elimina el registro; las acciones creadas se conservan en FOR-06." accion="Eliminar" destructivo onConfirm={() => start(async () => { await A.eliminarInspeccion(empresaId, i.id); toast.success("Inspección eliminada"); })}><Trash2 /></Confirmar></TableCell>
                </TableRow>
              ); })}
            </TableBody>
          </Table>
        </Section>
      )}

      {/* ───── Nueva inspección ───── */}
      <Dialog open={!!nueva} onOpenChange={(o) => !o && setNueva(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader><DialogTitle>{nueva?.lista}</DialogTitle><DialogDescription>{lista?.descripcion} Califique cada ítem; en los que no cumplen puede crear la acción de una vez.</DialogDescription></DialogHeader>
          {nueva && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-4">
                <Field><FieldLabel htmlFor="i-f">Fecha</FieldLabel><Input id="i-f" type="date" value={nueva.fecha} onChange={(e) => setNueva({ ...nueva, fecha: e.target.value })} /></Field>
                <Field><FieldLabel>Lugar</FieldLabel><Combo value={nueva.lugar} placeholder="Seleccione o escriba el lugar" onChange={(v) => setNueva({ ...nueva, lugar: v })} grupos={[{ titulo: "Sedes y zonas", opciones: lugares.map((x) => ({ valor: x })) }]} /></Field>
                <Field><FieldLabel>Responsable</FieldLabel><Combo value={nueva.responsable} placeholder="Seleccione o escriba el responsable" onChange={(v) => setNueva({ ...nueva, responsable: v })} grupos={[{ titulo: "Personas", opciones: personas.map((x) => ({ valor: x })) }]} /></Field>
                <Field><FieldLabel>Acompañó (COPASST / Vigía)</FieldLabel><Combo value={nueva.participantes} placeholder="Seleccione o escriba quién acompañó" onChange={(v) => setNueva({ ...nueva, participantes: v })} grupos={[{ titulo: "Personas", opciones: personas.map((x) => ({ valor: x })) }]} /></Field>
              </div>
              <div className="flex items-center gap-3 text-sm"><span className="text-muted-foreground">{calificados} de {nueva.items.length} calificados</span><Progress className="flex-1" value={(calificados / Math.max(1, nueva.items.length)) * 100} />
                <Button size="xs" variant="ghost" onClick={() => setNueva({ ...nueva, items: nueva.items.map((i) => (i.resultado ? i : { ...i, resultado: "cumple" })) })}>Marcar pendientes como “cumple”</Button></div>
              <ol className="space-y-2.5">
                {nueva.items.map((it, i) => (
                  <li key={i} className={cn("rounded-lg border p-3", it.resultado === "no_cumple" && "border-red-200 bg-red-50/40")}>
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="mt-0.5 text-xs text-muted-foreground">{i + 1}.</span>
                      <span className="min-w-0 flex-1 text-sm">{it.pregunta}</span>
                      <div className="flex gap-1">
                        {(Object.keys(RES) as (keyof typeof RES)[]).map((k) => { const R = RES[k]; const on = it.resultado === k; return (
                          <button key={k} type="button" onClick={() => setItem(i, { resultado: k, accion: k === "no_cumple" ? it.accion ?? { descripcion: "", responsable: nueva.responsable, fechaLimite: en30() } : null })}
                            className={cn("inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors", on ? R.c : "bg-background hover:bg-muted")}><R.i className="size-3.5" />{R.t}</button>
                        ); })}
                      </div>
                    </div>
                    {it.resultado && it.resultado !== "cumple" && <Input className="mt-2" placeholder="Observación (qué se encontró)" value={it.observacion ?? ""} onChange={(e) => setItem(i, { observacion: e.target.value })} />}
                    {it.resultado === "no_cumple" && it.accion && (
                      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_12rem_9rem]">
                        <Input className="sm:col-span-3" placeholder="Causa raíz: por qué ocurre (opcional; también se puede agregar después)" value={it.accion.causa ?? ""} onChange={(e) => setItem(i, { accion: { ...it.accion!, causa: e.target.value } })} />
                        <Input placeholder="Acción correctiva (deje vacío para no crearla)" value={it.accion.descripcion} onChange={(e) => setItem(i, { accion: { ...it.accion!, descripcion: e.target.value } })} />
                        <Input placeholder="Responsable" value={it.accion.responsable ?? ""} onChange={(e) => setItem(i, { accion: { ...it.accion!, responsable: e.target.value } })} />
                        <Input type="date" value={it.accion.fechaLimite ?? ""} onChange={(e) => setItem(i, { accion: { ...it.accion!, fechaLimite: e.target.value } })} />
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              <Field><FieldLabel htmlFor="i-o">Observaciones generales</FieldLabel><Textarea id="i-o" rows={2} placeholder="Describa lo más relevante que se encontró" value={nueva.observaciones} onChange={(e) => setNueva({ ...nueva, observaciones: e.target.value })} /></Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setNueva(null)}>Cancelar</Button>
            <Button disabled={pend || calificados < (nueva?.items.length ?? 0)} onClick={() => nueva && start(async () => {
              const r = await A.guardarInspeccion(empresaId, nueva);
              if ("error" in r) { toast.error(r.error); return; }
              toast.success(`Inspección guardada${r.acciones ? ` y ${r.acciones} acción(es) creadas en FOR-06` : ""}. Agregue fotos desde el detalle.`);
              setNueva(null); setVer(r.id);
            })}>{pend ? <Spinner /> : <ClipboardCheck />} Guardar inspección</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Detalle ───── */}
      <Sheet open={!!insVer} onOpenChange={(o) => !o && setVer(null)}>
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-xl">
          {insVer && (
            <>
              <SheetHeader className="border-b">
                <SheetTitle>{insVer.lista}</SheetTitle>
                <SheetDescription>{fecha(insVer.fecha)}{insVer.lugar ? ` · ${insVer.lugar}` : ""}{insVer.responsable ? ` · ${insVer.responsable}` : ""}{insVer.participantes ? ` · acompañó ${insVer.participantes}` : ""} · cumplimiento {cumplimiento(insVer.items)} %</SheetDescription>
              </SheetHeader>
              <div className="space-y-6 p-5">
                <section className="space-y-1.5">
                  {insVer.items.map((it, i) => { const R = RES[it.resultado]; return (
                    <div key={i} className="flex items-start gap-2 text-sm"><Badge variant="outline" className={cn("shrink-0", it.resultado === "cumple" ? "text-emerald-700" : it.resultado === "no_cumple" ? "border-red-300 text-red-700" : "text-muted-foreground")}>{R.t}</Badge><span className="flex-1">{it.pregunta}{it.observacion && <span className="block text-xs text-muted-foreground">{it.observacion}</span>}</span></div>
                  ); })}
                  {insVer.observaciones && <p className="pt-2 text-sm text-muted-foreground">{insVer.observaciones}</p>}
                </section>
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Acciones creadas</h3>
                  {insVer.acciones.length === 0 ? <p className="text-sm text-muted-foreground">Ninguna.</p> : insVer.acciones.map((a) => <FilaAccion key={a.id} empresaId={empresaId} a={a} />)}
                </section>
                <section className="space-y-2">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Fotos y registro firmado</h3><SubirArchivo empresaId={empresaId} ctx={{ tipo: "EVIDENCIA", inspeccionId: insVer.id }} titulo="Subir foto o registro" trigger={<Button size="xs"><Plus /> Subir</Button>} descripcionInicial={`${insVer.lista} ${insVer.lugar}`.trim()} ayuda="Fotos de los hallazgos o el formato firmado. Quedan como soporte del estándar 4.2.4." /></div>
                  <ListaArchivos empresaId={empresaId} archivos={insVer.archivos} vacio="Sin fotos." />
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
