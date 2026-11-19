"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Confirmar } from "@/components/app/confirmar";
import * as A from "@/app/actions/biblioteca";
import { Buscador } from "@/components/app/buscador";

type C = { id: string; nombre: string; descripcion: string; tareaIds: string[] };
type T = { id: string; nombre: string; propia: boolean };

export function CargosPropios({ empresaId, sectorTipoId, cargos, tareas }: { empresaId: string; sectorTipoId: string | null; cargos: C[]; tareas: T[] }) {
  const [pend, start] = useTransition();
  const [nuevo, setNuevo] = useState({ nombre: "", descripcion: "" });
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { const r = await fn(); if (r && typeof r === "object" && "error" in r) toast.error(String(r.error)); else if (ok) toast.success(ok); });
  const nombreT = (id: string) => tareas.find((t) => t.id === id);
  const selector = (c: C) => (
    <Buscador size="sm" className="w-full" placeholder="Buscar tarea…" textoBoton="Agregar tarea"
      opciones={tareas.filter((t) => !c.tareaIds.includes(t.id)).map((t) => ({ valor: t.id, etiqueta: t.nombre, relevancia: t.propia ? "propio" as const : "otro" as const }))}
      onSelect={(v) => run(() => A.vincularTareaCargo(c.id, v), "Tarea agregada")} />
  );
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
      {cargos.length === 0 && (
        <Empty className="border md:col-span-2 xl:col-span-2">
          <EmptyHeader><EmptyTitle>Sin cargos tipo propios</EmptyTitle><EmptyDescription>Cree aquí un cargo que solo existe en esta empresa, o use “Guardar en biblioteca” en un cargo de la matriz.</EmptyDescription></EmptyHeader>
        </Empty>
      )}
      {cargos.map((c) => (
        <Card key={c.id} size="sm" className="gap-2">
          <CardHeader>
            <CardTitle className="text-sm">{c.nombre}</CardTitle>
            <CardDescription className="text-xs">{c.descripcion}</CardDescription>
            <CardAction className="flex gap-1">
              <Button size="icon-xs" variant="ghost" aria-label="Publicar en general" title="Publicar en general" onClick={() => run(() => A.publicarEnGeneral("cargo", c.id), "Cargo publicado en la biblioteca general")}><Upload /></Button>
              <Confirmar trigger={<Button size="icon-xs" variant="ghost" aria-label="Eliminar" />} titulo={`Eliminar ${c.nombre}`} destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarCargoTipo(c.id))}><Trash2 /></Confirmar>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap gap-1">{c.tareaIds.map((id) => { const t = nombreT(id); return t && <Badge key={id} variant={t.propia ? "secondary" : "outline"} className="gap-1 pr-1 font-normal text-[11px]">{t.nombre}<Button variant="ghost" size="icon-xs" className="size-4" aria-label="Quitar" onClick={() => run(() => A.vincularTareaCargo(c.id, id, true))}><X /></Button></Badge>; })}</div>
            {selector(c)}
          </CardContent>
        </Card>
      ))}
      <Card size="sm" className="border-dashed ring-0 border gap-2">
        <CardHeader><CardTitle className="text-sm">Nuevo cargo tipo propio</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Nombre del cargo" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
          <Input placeholder="Descripción breve" value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} />
        </CardContent>
        <CardFooter><Button size="sm" disabled={!nuevo.nombre || pend} onClick={() => { run(() => A.crearCargoTipo({ ...nuevo, sectorTipoId, empresaId }), "Cargo propio creado"); setNuevo({ nombre: "", descripcion: "" }); }}><Plus /> Crear</Button></CardFooter>
      </Card>
    </div>
  );
}
