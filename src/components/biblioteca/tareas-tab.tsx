"use client";
import { Fragment, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Section } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import { Ayuda } from "@/components/app/ayuda";
import { Buscador } from "@/components/app/buscador";
import { CLASIFICACION_ETIQUETA } from "@/lib/gtc45";
import * as A from "@/app/actions/biblioteca";
import { Upload } from "lucide-react";

type T = { id: string; nombre: string; actividad: string; rutinaria: boolean; altoRiesgo: string | null; zonasPreferidas: string[]; validado: boolean; peligroIds: string[]; usos: number; enCargos: number };
type P = { id: string; clasificacion: string; descripcion: string };
type Z = { id: string; nombre: string };
const ALTO = [["", "No"], ["alturas", "Alturas"], ["confinado", "Espacio confinado"], ["electrico", "Eléctrico"], ["izaje", "Izaje de cargas"], ["caliente", "Trabajo en caliente"]];

export function TareasTab({ tareas, peligros, zonas, empresaId }: { tareas: T[]; peligros: (P & { propio?: boolean })[]; zonas: Z[]; empresaId?: string }) {
  const [pend, start] = useTransition();
  const [q, setQ] = useState("");
  const [abierta, setAbierta] = useState<string | null>(null);
  const [nueva, setNueva] = useState({ nombre: "", actividad: "", altoRiesgo: "" });
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { const r = await fn(); if (r && typeof r === "object" && "error" in r) toast.error(String(r.error)); else if (ok) toast.success(ok); });
  const lista = useMemo(() => tareas.filter((t) => !q || (t.nombre + t.actividad).toLowerCase().includes(q.toLowerCase())), [tareas, q]);
  const nombreP = (id: string) => peligros.find((p) => p.id === id);

  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardHeader><CardTitle className="text-sm flex items-center gap-1">{empresaId ? "Nueva tarea propia de esta empresa" : "Nueva tarea tipo"} <Ayuda ayuda={{ titulo: "Tarea tipo", que: "Una actividad concreta que hace un trabajador (por ejemplo, “Recibo y descargue de mercancía”).", para: "Cada tarea trae sus peligros. Al asignarla a un cargo en cualquier empresa, sus peligros entran a la matriz con los valores sugeridos.", ejemplo: "Limpieza de tanques de agua" }} /></CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-[1fr_1fr_200px] gap-2">
          <Input placeholder="Nombre de la tarea" value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} />
          <Input placeholder="Actividad (agrupa tareas en la matriz)" value={nueva.actividad} onChange={(e) => setNueva({ ...nueva, actividad: e.target.value })} />
          <NativeSelect className="w-full" value={nueva.altoRiesgo} onChange={(e) => setNueva({ ...nueva, altoRiesgo: e.target.value })}>{ALTO.map(([v, l]) => <NativeSelectOption key={v} value={v}>{v ? `Alto riesgo: ${l}` : "Sin tarea de alto riesgo"}</NativeSelectOption>)}</NativeSelect>
        </CardContent>
        <CardFooter><Button size="sm" disabled={!nueva.nombre || pend} onClick={() => run(async () => { const r = await A.crearTareaTipo({ ...nueva, altoRiesgo: nueva.altoRiesgo || null, empresaId }); if (!("error" in r)) { setNueva({ nombre: "", actividad: "", altoRiesgo: "" }); setAbierta(r.id); } return r; }, "Tarea creada: agréguele sus peligros")}><Plus /> Crear tarea</Button></CardFooter>
      </Card>

      <Section title={`Tareas tipo (${lista.length})`} actions={<InputGroup className="w-72"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput placeholder="Buscar tarea…" value={q} onChange={(e) => setQ(e.target.value)} /></InputGroup>} contentClassName="px-0">
        <Table className="[&_td]:whitespace-normal [&_td]:align-top">
          <TableHeader><TableRow><TableHead className="pl-6 w-8" /><TableHead>Tarea</TableHead><TableHead>Actividad</TableHead><TableHead>Peligros</TableHead><TableHead>Usos</TableHead><TableHead className="pr-6"><span className="flex items-center gap-1">Validada <Ayuda k="validado" /></span></TableHead></TableRow></TableHeader>
          <TableBody>
            {lista.map((t) => (
              <Fragment key={t.id}>
                <TableRow>
                  <TableCell className="pl-6"><Button variant="ghost" size="icon-xs" aria-label="Detalle" onClick={() => setAbierta(abierta === t.id ? null : t.id)}>{abierta === t.id ? <ChevronDown /> : <ChevronRight />}</Button></TableCell>
                  <TableCell className="font-medium">{t.nombre}{t.altoRiesgo && <Badge variant="destructive" className="ml-2">alto riesgo: {t.altoRiesgo}</Badge>}</TableCell>
                  <TableCell className="text-muted-foreground">{t.actividad}</TableCell>
                  <TableCell>{t.peligroIds.length}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.enCargos} cargos · {t.usos} empresas</TableCell>
                  <TableCell className="pr-6"><Switch checked={t.validado} onCheckedChange={(v) => run(() => A.actualizarTareaTipo(t.id, { validado: v }))} aria-label="Validada" /></TableCell>
                </TableRow>
                {abierta === t.id && (
                  <TableRow className="bg-muted/30">
                    <TableCell />
                    <TableCell colSpan={5} className="pr-6 py-3 space-y-3">
                      <div className="grid md:grid-cols-4 gap-3">
                        <Field><FieldLabel className="text-xs">Nombre</FieldLabel><Input defaultValue={t.nombre} placeholder="Ej.: Cargue y descargue de mercancía" onBlur={(e) => e.target.value !== t.nombre && run(() => A.actualizarTareaTipo(t.id, { nombre: e.target.value }))} /></Field>
                        <Field><FieldLabel className="text-xs">Actividad</FieldLabel><Input defaultValue={t.actividad} placeholder="Ej.: Almacenamiento" onBlur={(e) => e.target.value !== t.actividad && run(() => A.actualizarTareaTipo(t.id, { actividad: e.target.value }))} /></Field>
                        <Field><FieldLabel className="text-xs">Tarea de alto riesgo</FieldLabel><NativeSelect className="w-full" value={t.altoRiesgo ?? ""} onChange={(e) => run(() => A.actualizarTareaTipo(t.id, { altoRiesgo: e.target.value || null }))}>{ALTO.map(([v, l]) => <NativeSelectOption key={v} value={v}>{l}</NativeSelectOption>)}</NativeSelect></Field>
                        <Field orientation="horizontal" className="pt-6"><Switch checked={t.rutinaria} onCheckedChange={(v) => run(() => A.actualizarTareaTipo(t.id, { rutinaria: v }))} /><FieldLabel className="font-normal">Rutinaria</FieldLabel></Field>
                      </div>
                      <Field>
                        <FieldLabel className="text-xs gap-1">Zonas donde se hace (en orden de preferencia) <Ayuda ayuda={{ titulo: "Zonas preferidas", que: "Lugares donde normalmente se hace esta tarea.", para: "Al instanciar la tarea en una empresa se ubica en la primera de estas zonas que exista. Así sus peligros de lugar aplican a las personas correctas." }} /></FieldLabel>
                        <div className="flex flex-wrap gap-1">
                          {t.zonasPreferidas.map((z) => <Badge key={z} variant="secondary" className="gap-1 pr-1">{z}<Button variant="ghost" size="icon-xs" className="size-4" aria-label="Quitar" onClick={() => run(() => A.actualizarTareaTipo(t.id, { zonasPreferidas: t.zonasPreferidas.filter((x) => x !== z) }))}><X /></Button></Badge>)}
                          <Buscador size="xs" placeholder="Buscar zona…" textoBoton="zona" opciones={zonas.filter((z) => !t.zonasPreferidas.includes(z.nombre)).map((z) => ({ valor: z.nombre, etiqueta: z.nombre }))} onSelect={(v) => run(() => A.actualizarTareaTipo(t.id, { zonasPreferidas: [...t.zonasPreferidas, v] }))} />
                        </div>
                      </Field>
                      <Field>
                        <FieldLabel className="text-xs">Peligros de la tarea</FieldLabel>
                        <div className="flex flex-wrap gap-1">
                          {t.peligroIds.map((id) => { const p = nombreP(id); return p && <Badge key={id} variant="outline" className="gap-1 pr-1 font-normal"><span className="text-muted-foreground">{CLASIFICACION_ETIQUETA[p.clasificacion]}:</span> {p.descripcion}<Button variant="ghost" size="icon-xs" className="size-4" aria-label="Quitar" onClick={() => run(() => A.vincularPeligroTarea(t.id, id, true))}><X /></Button></Badge>; })}
                        </div>
                        <Buscador className="w-full max-w-xl" ancho="w-[34rem]" placeholder="Buscar peligro…" textoBoton="Agregar peligro"
                          opciones={peligros.filter((p) => !t.peligroIds.includes(p.id)).map((p) => ({ valor: p.id, etiqueta: p.descripcion, grupo: CLASIFICACION_ETIQUETA[p.clasificacion], relevancia: empresaId ? (p.propio ? "propio" as const : "otro" as const) : undefined }))}
                          onSelect={(v) => run(() => A.vincularPeligroTarea(t.id, v), "Peligro agregado a la tarea")} />
                      </Field>
                      {empresaId && <Button size="xs" variant="secondary" className="mr-2" onClick={() => run(() => A.publicarEnGeneral("tarea", t.id), "Publicada en la biblioteca general")}><Upload /> Publicar en general</Button>}
                      <Confirmar trigger={<Button size="xs" variant="destructive" />} titulo={`Eliminar “${t.nombre}”`} descripcion="Solo se puede si ninguna empresa la usa." destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarTareaTipo(t.id), "Tarea eliminada")}><Trash2 /> Eliminar tarea</Confirmar>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </Section>
    </div>
  );
}
