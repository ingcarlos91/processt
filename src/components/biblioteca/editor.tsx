"use client";
import { Fragment, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { Section } from "@/components/app/ui";
import { Ayuda } from "@/components/app/ayuda";
import { Buscador } from "@/components/app/buscador";
import { CLASIFICACIONES, CLASIFICACION_ETIQUETA, ND, NE, NC, calcular, COLOR_NIVEL } from "@/lib/gtc45";
import { actualizarPeligroCatalogo } from "@/app/actions/sgsst";
import { crearPeligro, eliminarPeligroCatalogo, publicarEnGeneral } from "@/app/actions/biblioteca";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Confirmar } from "@/components/app/confirmar";
import { cn } from "@/lib/utils";

type P = { id: string; clasificacion: string; sub: string; descripcion: string; efectos: string; nd: number; ne: number; nc: number; ingenieria: string; administrativa: string; epp: string[]; examenes: string[]; capacitaciones: string[]; normas: string[]; pve: string; validado: boolean; usos: number; enTareas: number };
type S = { id: string; nombre: string; descripcion: string; ciius: string[]; procesos: string[]; cargos: { nombre: string; tareas: string[] }[] };

export function BibliotecaEditor({ peligros, sectores = [], catalogo = [], empresaId }: { peligros: P[]; sectores?: S[]; catalogo?: { tipo: string; nombre: string }[]; empresaId?: string }) {
  const [nuevo, setNuevo] = useState({ clasificacion: "Condiciones de seguridad", descripcion: "", efectosPosibles: "", ndDefault: 2, neDefault: 2, ncDefault: 25 });
  const [pend, start] = useTransition();
  const [q, setQ] = useState("");
  const [clas, setClas] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); toast.success("Biblioteca actualizada"); });
  void sectores;
  const lista = useMemo(() => peligros.filter((p) => (!clas || p.clasificacion === clas) && (!q || (p.descripcion + p.efectos).toLowerCase().includes(q.toLowerCase()))), [peligros, q, clas]);
  const upd = (id: string, d: Record<string, string | number | boolean | string[]>) => run(() => actualizarPeligroCatalogo(id, d));
  const aLista = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <Tabs defaultValue="peligros">
      <TabsContent value="peligros" className="mt-4 space-y-4">
        <Section title={empresaId ? "Nuevo peligro propio de esta empresa" : "Nuevo peligro"} description="Use la clasificación y escalas de la GTC 45. Después de crearlo, ábralo para completar controles, EPP, exámenes y capacitaciones.">
          <div className="grid md:grid-cols-[200px_1fr_1fr_80px_80px_90px_auto] gap-2 items-end">
            <Field><FieldLabel className="text-xs gap-1">Clasificación <Ayuda k="clasificacionPeligro" /></FieldLabel><NativeSelect className="w-full" value={nuevo.clasificacion} onChange={(e) => setNuevo({ ...nuevo, clasificacion: e.target.value })}>{CLASIFICACIONES.map((c) => <NativeSelectOption key={c} value={c}>{CLASIFICACION_ETIQUETA[c]}</NativeSelectOption>)}</NativeSelect></Field>
            <Field><FieldLabel className="text-xs gap-1">Peligro <Ayuda k="descripcionPeligro" /></FieldLabel><Input value={nuevo.descripcion} placeholder="Ej.: Ruido generado por maquinaria" onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} /></Field>
            <Field><FieldLabel className="text-xs gap-1">Efectos posibles <Ayuda k="efectos" /></FieldLabel><Input value={nuevo.efectosPosibles} placeholder="Ej.: Hipoacusia, estrés" onChange={(e) => setNuevo({ ...nuevo, efectosPosibles: e.target.value })} /></Field>
            <Field><FieldLabel className="text-xs gap-1">ND <Ayuda k="nd" /></FieldLabel><NativeSelect className="w-full" value={nuevo.ndDefault} onChange={(e) => setNuevo({ ...nuevo, ndDefault: Number(e.target.value) })}>{ND.map((x) => <NativeSelectOption key={x.valor} value={x.valor}>{x.valor}</NativeSelectOption>)}</NativeSelect></Field>
            <Field><FieldLabel className="text-xs gap-1">NE <Ayuda k="ne" /></FieldLabel><NativeSelect className="w-full" value={nuevo.neDefault} onChange={(e) => setNuevo({ ...nuevo, neDefault: Number(e.target.value) })}>{NE.map((x) => <NativeSelectOption key={x.valor} value={x.valor}>{x.valor}</NativeSelectOption>)}</NativeSelect></Field>
            <Field><FieldLabel className="text-xs gap-1">NC <Ayuda k="nc" /></FieldLabel><NativeSelect className="w-full" value={nuevo.ncDefault} onChange={(e) => setNuevo({ ...nuevo, ncDefault: Number(e.target.value) })}>{NC.map((x) => <NativeSelectOption key={x.valor} value={x.valor}>{x.valor}</NativeSelectOption>)}</NativeSelect></Field>
            <Button disabled={!nuevo.descripcion || pend} onClick={() => start(async () => { const r = await crearPeligro({ ...nuevo, empresaId }); if ("error" in r) toast.error(r.error); else { toast.success("Peligro creado"); setNuevo({ ...nuevo, descripcion: "", efectosPosibles: "" }); setAbierto(r.id); } })}><Plus /> Crear</Button>
          </div>
        </Section>
        <Section
          title="Catálogo de peligros (GTC 45)"
          description={pend ? "Guardando…" : `${lista.length} peligros`}
          actions={<div className="flex gap-2">
            <InputGroup className="w-64"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} /></InputGroup>
            <NativeSelect value={clas} onChange={(e) => setClas(e.target.value)}><NativeSelectOption value="">Todas las clasificaciones</NativeSelectOption>{CLASIFICACIONES.map((c) => <NativeSelectOption key={c} value={c}>{CLASIFICACION_ETIQUETA[c]}</NativeSelectOption>)}</NativeSelect>
          </div>}
          contentClassName="px-0"
        >
          <Table className="[&_td]:whitespace-normal [&_td]:align-top">
            <TableHeader><TableRow><TableHead className="pl-6 w-8" /><TableHead><span className="flex items-center gap-1">Clasificación <Ayuda k="clasificacionPeligro" /></span></TableHead><TableHead><span className="flex items-center gap-1">Peligro <Ayuda k="descripcionPeligro" /></span></TableHead><TableHead><span className="flex items-center gap-1">ND <Ayuda k="nd" /></span></TableHead><TableHead><span className="flex items-center gap-1">NE <Ayuda k="ne" /></span></TableHead><TableHead><span className="flex items-center gap-1">NC <Ayuda k="nc" /></span></TableHead><TableHead><span className="flex items-center gap-1">Nivel sugerido <Ayuda k="nivelSugerido" /></span></TableHead><TableHead><span className="flex items-center gap-1">Usos <Ayuda k="usos" /></span></TableHead><TableHead className="pr-6"><span className="flex items-center gap-1">Validado <Ayuda k="validado" /></span></TableHead></TableRow></TableHeader>
            <TableBody>
              {lista.map((p) => {
                const c = calcular(p.nd, p.ne, p.nc);
                return (
                  <Fragment key={p.id}>
                    <TableRow>
                      <TableCell className="pl-6"><Button variant="ghost" size="icon-xs" aria-label="Detalle" onClick={() => setAbierto(abierto === p.id ? null : p.id)}>{abierto === p.id ? <ChevronDown /> : <ChevronRight />}</Button></TableCell>
                      <TableCell>{CLASIFICACION_ETIQUETA[p.clasificacion]}<div className="text-xs text-muted-foreground">{p.sub}</div></TableCell>
                      <TableCell className="min-w-72">{p.descripcion}</TableCell>
                      <TableCell><NativeSelect size="sm" value={p.nd} onChange={(e) => upd(p.id, { ndDefault: Number(e.target.value) })}>{ND.map((x) => <NativeSelectOption key={x.valor} value={x.valor}>{x.valor}</NativeSelectOption>)}</NativeSelect></TableCell>
                      <TableCell><NativeSelect size="sm" value={p.ne} onChange={(e) => upd(p.id, { neDefault: Number(e.target.value) })}>{NE.map((x) => <NativeSelectOption key={x.valor} value={x.valor}>{x.valor}</NativeSelectOption>)}</NativeSelect></TableCell>
                      <TableCell><NativeSelect size="sm" value={p.nc} onChange={(e) => upd(p.id, { ncDefault: Number(e.target.value) })}>{NC.map((x) => <NativeSelectOption key={x.valor} value={x.valor}>{x.valor}</NativeSelectOption>)}</NativeSelect></TableCell>
                      <TableCell><Badge className={cn(COLOR_NIVEL[c.nivel])}>{c.nivel} · {c.nr}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{p.enTareas} tareas · {p.usos} en matrices</TableCell>
                      <TableCell className="pr-6"><Switch checked={p.validado} onCheckedChange={(v) => upd(p.id, { validado: v })} aria-label="Validado" /></TableCell>
                    </TableRow>
                    {abierto === p.id && (
                      <TableRow className="bg-muted/30">
                        <TableCell />
                        <TableCell colSpan={8} className="pr-6">
                          <div className="grid md:grid-cols-3 gap-3 py-2">
                            {([["descripcion", "Descripción", p.descripcion, "descripcionPeligro"], ["efectosPosibles", "Efectos posibles", p.efectos, "efectos"], ["medidaIngenieria", "Controles de ingeniería", p.ingenieria, "medidaIngenieria"], ["medidaAdministrativa", "Controles administrativos", p.administrativa, "medidaAdministrativa"]] as const).map(([k, l, v, a]) => (
                              <Field key={k}><FieldLabel className="text-xs gap-1">{l} <Ayuda k={a} /></FieldLabel><Textarea className="text-xs min-h-16" placeholder={`Describa: ${l.toLowerCase()}`} defaultValue={v} onBlur={(e) => e.target.value !== v && upd(p.id, { [k]: e.target.value })} /></Field>
                            ))}
                            {([["eppSugerido", "EPP", p.epp, "eppSugerido", "EPP"], ["examenesSugeridos", "Exámenes para el profesiograma", p.examenes, "examenesSugeridos", "EXAMEN"], ["capacitacionesSugeridas", "Capacitaciones", p.capacitaciones, "capacitacionesSugeridas", "CAPACITACION"]] as const).map(([k, l, v, a, tipo]) => (
                              <Field key={k}>
                                <FieldLabel className="text-xs gap-1">{l} <Ayuda k={a} /></FieldLabel>
                                <div className="flex flex-wrap gap-1">{v.map((x) => <Badge key={x} variant="secondary" className="gap-1 pr-1 font-normal">{x}<Button variant="ghost" size="icon-xs" className="size-4" aria-label="Quitar" onClick={() => upd(p.id, { [k]: v.filter((y) => y !== x) })}>×</Button></Badge>)}</div>
                                <Buscador size="sm" className="w-full" placeholder="Buscar en el catálogo…" textoBoton="Agregar del catálogo" opciones={catalogo.filter((c) => c.tipo === tipo && !v.includes(c.nombre)).map((c) => ({ valor: c.nombre, etiqueta: c.nombre }))} onSelect={(x) => upd(p.id, { [k]: [...v, x] })} />
                              </Field>
                            ))}
                            <Field><FieldLabel className="text-xs gap-1">Códigos de normas (uno por línea) <Ayuda k="normasPeligro" /></FieldLabel><Textarea className="text-xs min-h-16" defaultValue={p.normas.join("\n")} placeholder="Copie cada código tal como aparece en el catálogo de normas" onBlur={(e) => e.target.value !== p.normas.join("\n") && upd(p.id, { normas: aLista(e.target.value) })} /></Field>
                            <div className="flex items-end gap-2">{empresaId && <Button size="xs" variant="secondary" onClick={() => start(async () => { const r = await publicarEnGeneral("peligro", p.id); if ("error" in r) toast.error(r.error); else toast.success("Publicado en la biblioteca general"); })}><Upload /> Publicar en general</Button>}<Confirmar trigger={<Button size="xs" variant="destructive" />} titulo="Eliminar peligro" descripcion="Solo es posible si ninguna matriz lo usa." destructivo accion="Eliminar" onConfirm={() => start(async () => { const r = await eliminarPeligroCatalogo(p.id); if ("error" in r) toast.error(r.error); else toast.success("Peligro eliminado"); })}><Trash2 /> Eliminar peligro</Confirmar></div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Section>
      </TabsContent>

    </Tabs>
  );
}
