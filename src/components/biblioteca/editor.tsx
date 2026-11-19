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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Section } from "@/components/app/ui";
import { CLASIFICACIONES, CLASIFICACION_ETIQUETA, ND, NE, NC, calcular, COLOR_NIVEL } from "@/lib/gtc45";
import { actualizarPeligroCatalogo } from "@/app/actions/sgsst";
import { cn } from "@/lib/utils";

type P = { id: string; clasificacion: string; sub: string; descripcion: string; efectos: string; nd: number; ne: number; nc: number; ingenieria: string; administrativa: string; epp: string[]; examenes: string[]; capacitaciones: string[]; normas: string[]; pve: string; validado: boolean; usos: number; enTareas: number };
type S = { id: string; nombre: string; descripcion: string; ciius: string[]; procesos: string[]; cargos: { nombre: string; tareas: string[] }[] };

export function BibliotecaEditor({ peligros, sectores }: { peligros: P[]; sectores: S[] }) {
  const [pend, start] = useTransition();
  const [q, setQ] = useState("");
  const [clas, setClas] = useState("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const run = (fn: () => Promise<unknown>) => start(async () => { await fn(); toast.success("Biblioteca actualizada"); });
  const lista = useMemo(() => peligros.filter((p) => (!clas || p.clasificacion === clas) && (!q || (p.descripcion + p.efectos).toLowerCase().includes(q.toLowerCase()))), [peligros, q, clas]);
  const upd = (id: string, d: Record<string, string | number | boolean | string[]>) => run(() => actualizarPeligroCatalogo(id, d));
  const aLista = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

  return (
    <Tabs defaultValue="peligros">
      <TabsList><TabsTrigger value="peligros">Peligros</TabsTrigger><TabsTrigger value="sectores">Sectores, cargos y tareas</TabsTrigger></TabsList>
      <TabsContent value="peligros" className="mt-4">
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
            <TableHeader><TableRow><TableHead className="pl-6 w-8" /><TableHead>Clasificación</TableHead><TableHead>Peligro</TableHead><TableHead>ND</TableHead><TableHead>NE</TableHead><TableHead>NC</TableHead><TableHead>Nivel sugerido</TableHead><TableHead>Usos</TableHead><TableHead className="pr-6">Validado</TableHead></TableRow></TableHeader>
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
                            {([["descripcion", "Descripción", p.descripcion], ["efectosPosibles", "Efectos posibles", p.efectos], ["medidaIngenieria", "Controles de ingeniería", p.ingenieria], ["medidaAdministrativa", "Controles administrativos", p.administrativa]] as const).map(([k, l, v]) => (
                              <Field key={k}><FieldLabel className="text-xs">{l}</FieldLabel><Textarea className="text-xs min-h-16" defaultValue={v} onBlur={(e) => e.target.value !== v && upd(p.id, { [k]: e.target.value })} /></Field>
                            ))}
                            {([["eppSugerido", "EPP (uno por línea)", p.epp], ["examenesSugeridos", "Exámenes para el profesiograma (uno por línea)", p.examenes], ["capacitacionesSugeridas", "Capacitaciones (una por línea)", p.capacitaciones], ["normas", "Códigos de normas (uno por línea)", p.normas]] as const).map(([k, l, v]) => (
                              <Field key={k}><FieldLabel className="text-xs">{l}</FieldLabel><Textarea className="text-xs min-h-16" defaultValue={v.join("\n")} onBlur={(e) => e.target.value !== v.join("\n") && upd(p.id, { [k]: aLista(e.target.value) })} /></Field>
                            ))}
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
      <TabsContent value="sectores" className="mt-4 grid lg:grid-cols-2 gap-4">
        {sectores.map((s) => (
          <Card key={s.id}>
            <CardHeader><CardTitle>{s.nombre}</CardTitle><CardDescription>{s.descripcion} CIIU: {s.ciius.join(", ")}</CardDescription></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-1">{s.procesos.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}</div>
              <ul className="space-y-2">{s.cargos.map((c) => <li key={c.nombre}><div className="font-medium">{c.nombre}</div><div className="text-xs text-muted-foreground">{c.tareas.join(" · ")}</div></li>)}</ul>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
    </Tabs>
  );
}
