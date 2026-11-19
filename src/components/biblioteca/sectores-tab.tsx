"use client";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ChevronDown, Plus, Search, Sparkles, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Confirmar } from "@/components/app/confirmar";
import { Ayuda } from "@/components/app/ayuda";
import { Buscador } from "@/components/app/buscador";
import * as A from "@/app/actions/biblioteca";

type Cargo = { id: string; nombre: string; descripcion: string; validado: boolean; usos: number; tareaIds: string[] };
type S = { id: string; nombre: string; descripcion: string; ciius: string[]; validado: boolean; empresas: number; procesos: string[]; zonaIds: string[]; cargos: Cargo[] };
type It = { id: string; nombre: string };

export function SectoresTab({ sectores, tareas, zonas, iaActiva }: { sectores: S[]; tareas: It[]; zonas: It[]; iaActiva: boolean }) {
  const [pend, start] = useTransition();
  const [q, setQ] = useState("");
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "", ciius: "" });
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { const r = await fn(); if (r && typeof r === "object" && "error" in r) toast.error(String(r.error)); else if (ok) toast.success(ok); });
  const lista = useMemo(() => sectores.filter((s) => !q || (s.nombre + s.descripcion + s.cargos.map((c) => c.nombre).join(" ")).toLowerCase().includes(q.toLowerCase())), [sectores, q]);

  return (
    <div className="space-y-4">
      {!iaActiva && <Alert><Sparkles /><AlertDescription>“Ampliar con IA” necesita la clave de AI Gateway (AI_GATEWAY_API_KEY en .env). Mientras tanto puede crear cargos, tareas y peligros a mano.</AlertDescription></Alert>}
      <div className="flex flex-wrap gap-2 items-center">
        <InputGroup className="w-80"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput placeholder="Buscar sector o cargo…" value={q} onChange={(e) => setQ(e.target.value)} /></InputGroup>
        <div className="flex-1" />
        <Dialog>
          <DialogTrigger render={<Button />}><Plus /> Nuevo sector</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo sector</DialogTitle><DialogDescription>Un sector agrupa procesos, zonas y cargos típicos. Al elegir el código CIIU de una empresa, el sistema propone el sector que tenga ese código.</DialogDescription></DialogHeader>
            <Field><FieldLabel>Nombre</FieldLabel><Input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Ej: Minería de materiales de construcción" /></Field>
            <Field><FieldLabel>Descripción</FieldLabel><Input value={nuevo.descripcion} placeholder="Ej.: Extracción de arena, gravilla y arcilla" onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} /></Field>
            <Field><FieldLabel>Códigos CIIU</FieldLabel><Input value={nuevo.ciius} onChange={(e) => setNuevo({ ...nuevo, ciius: e.target.value })} placeholder="08, 0811" /><FieldDescription>División de 2 dígitos o clase de 4 dígitos, separados por coma.</FieldDescription></Field>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
              <DialogClose render={<Button disabled={!nuevo.nombre} onClick={() => run(() => A.crearSector({ nombre: nuevo.nombre, descripcion: nuevo.descripcion, ciius: nuevo.ciius.split(",").map((x) => x.trim()).filter(Boolean) }), "Sector creado")} />}>Crear sector</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {lista.map((s) => <SectorCard key={s.id} s={s} tareas={tareas} zonas={zonas} iaActiva={iaActiva} run={run} pend={pend} />)}
    </div>
  );
}

function SectorCard({ s, tareas, zonas, iaActiva, run, pend }: { s: S; tareas: It[]; zonas: It[]; iaActiva: boolean; run: (fn: () => Promise<unknown>, ok?: string) => void; pend: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [proceso, setProceso] = useState("");
  const [cargo, setCargo] = useState({ nombre: "", descripcion: "" });
  const [ia, setIa] = useState({ instrucciones: "", cantidad: 8 });
  const [cargandoIA, startIA] = useTransition();
  const nombreT = (id: string) => tareas.find((t) => t.id === id)?.nombre ?? "";
  return (
    <Collapsible open={abierto} onOpenChange={setAbierto}>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">{s.nombre}{!s.validado && <Badge variant="outline">sin validar</Badge>}</CardTitle>
          <CardDescription>{s.descripcion} · CIIU {s.ciius.join(", ")} · {s.cargos.length} cargos · {s.empresas} empresas</CardDescription>
          <CardAction className="flex gap-2">
            <Dialog>
              <DialogTrigger render={<Button size="sm" variant="secondary" disabled={!iaActiva} />}><Sparkles /> Ampliar con IA</DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Ampliar “{s.nombre}” con IA</DialogTitle><DialogDescription>La IA propone cargos nuevos con sus tareas y peligros (GTC 45), reutilizando lo que ya existe. Todo queda “sin validar” para que usted lo revise.</DialogDescription></DialogHeader>
                <Field><FieldLabel>¿Cuántos cargos nuevos?</FieldLabel><NativeSelect className="w-full" value={ia.cantidad} onChange={(e) => setIa({ ...ia, cantidad: Number(e.target.value) })}>{[4, 8, 12, 16].map((n) => <NativeSelectOption key={n} value={n}>{n}</NativeSelectOption>)}</NativeSelect></Field>
                <Field><FieldLabel>Indicaciones (opcional)</FieldLabel><Textarea value={ia.instrucciones} onChange={(e) => setIa({ ...ia, instrucciones: e.target.value })} placeholder="Ej: incluir cargos de mantenimiento y de bodega de agroquímicos" /></Field>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                  <DialogClose render={<Button onClick={() => startIA(async () => {
                    toast.info("La IA está generando cargos, tareas y peligros. Puede tardar uno o dos minutos.");
                    const r = await A.ampliarSectorConIA(s.id, ia.instrucciones, ia.cantidad);
                    if ("error" in r) toast.error(r.error); else toast.success(`IA: ${r.cargos} cargos, ${r.tareas} tareas y ${r.peligros} peligros nuevos (sin validar).`);
                  })} />}>Generar</DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {cargandoIA && <Spinner />}
            <CollapsibleTrigger render={<Button size="sm" variant="outline" />}>{abierto ? "Cerrar" : "Ver y editar"} <ChevronDown className={abierto ? "rotate-180" : ""} /></CollapsibleTrigger>
          </CardAction>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-5 border-t pt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="gap-1">Procesos <Ayuda ayuda={{ titulo: "Procesos del sector", que: "Grandes bloques de actividad de la empresa (dirección, producción, logística…).", para: "Encabezan la matriz GTC 45 y agrupan las tareas." }} /></FieldLabel>
                <div className="flex flex-wrap gap-1">{s.procesos.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}</div>
                <div className="flex gap-1"><Input placeholder="Nuevo proceso" value={proceso} onChange={(e) => setProceso(e.target.value)} /><Button size="icon" variant="outline" aria-label="Agregar proceso" disabled={!proceso || pend} onClick={() => { run(() => A.agregarProcesoSector(s.id, proceso), "Proceso agregado"); setProceso(""); }}><Plus /></Button></div>
              </Field>
              <Field>
                <FieldLabel className="gap-1">Zonas <Ayuda ayuda={{ titulo: "Zonas del sector", que: "Lugares típicos de trabajo en este sector.", para: "Al crear una empresa del sector se crean estas zonas con sus peligros de lugar." }} /></FieldLabel>
                <div className="flex flex-wrap gap-1">{s.zonaIds.map((id) => <Badge key={id} variant="secondary" className="gap-1 pr-1">{zonas.find((z) => z.id === id)?.nombre}<Button variant="ghost" size="icon-xs" className="size-4" aria-label="Quitar" onClick={() => run(() => A.vincularZonaSector(s.id, id, true))}><X /></Button></Badge>)}</div>
                <Buscador className="w-full" placeholder="Buscar zona…" textoBoton="Agregar zona" opciones={zonas.filter((z) => !s.zonaIds.includes(z.id)).map((z) => ({ valor: z.id, etiqueta: z.nombre }))} onSelect={(v) => run(() => A.vincularZonaSector(s.id, v), "Zona agregada")} />
              </Field>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-1">Cargos tipo <Ayuda k="cargoTipo" /></div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {s.cargos.map((c) => (
                  <Card key={c.id} size="sm" className="gap-2">
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-1">{c.nombre}{!c.validado && <Badge variant="outline" className="text-[10px]">sin validar</Badge>}</CardTitle>
                      <CardDescription className="text-xs">{c.descripcion} · {c.usos} usos</CardDescription>
                      <CardAction><Confirmar trigger={<Button size="icon-xs" variant="ghost" aria-label="Eliminar cargo" />} titulo={`Eliminar ${c.nombre}`} descripcion="Las empresas que lo usan conservan sus tareas; solo pierden el vínculo con la biblioteca." destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarCargoTipo(c.id))}><Trash2 /></Confirmar></CardAction>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex flex-wrap gap-1">{c.tareaIds.map((id) => <Badge key={id} variant="outline" className="gap-1 pr-1 font-normal text-[11px]">{nombreT(id)}<Button variant="ghost" size="icon-xs" className="size-4" aria-label="Quitar" onClick={() => run(() => A.vincularTareaCargo(c.id, id, true))}><X /></Button></Badge>)}</div>
                      <Buscador size="sm" className="w-full" placeholder="Buscar tarea…" textoBoton="Agregar tarea" opciones={tareas.filter((t) => !c.tareaIds.includes(t.id)).map((t) => ({ valor: t.id, etiqueta: t.nombre }))} onSelect={(v) => run(() => A.vincularTareaCargo(c.id, v), "Tarea agregada al cargo")} />
                    </CardContent>
                  </Card>
                ))}
                <Card size="sm" className="border-dashed ring-0 border gap-2">
                  <CardHeader><CardTitle className="text-sm">Nuevo cargo tipo</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <Input placeholder="Nombre del cargo" value={cargo.nombre} onChange={(e) => setCargo({ ...cargo, nombre: e.target.value })} />
                    <Input placeholder="Descripción breve" value={cargo.descripcion} onChange={(e) => setCargo({ ...cargo, descripcion: e.target.value })} />
                  </CardContent>
                  <CardFooter><Button size="sm" disabled={!cargo.nombre || pend} onClick={() => { run(() => A.crearCargoTipo({ ...cargo, sectorTipoId: s.id }), "Cargo creado: agréguele tareas"); setCargo({ nombre: "", descripcion: "" }); }}><Plus /> Crear cargo</Button></CardFooter>
                </Card>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
