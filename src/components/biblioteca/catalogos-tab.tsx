"use client";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Section } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import * as A from "@/app/actions/biblioteca";
import { Upload } from "lucide-react";

type It = { id: string; tipo: string; nombre: string; descripcion: string; detalle: Record<string, unknown>; normas: string[]; validado: boolean };

const COLS: Record<string, { titulo: string; desc: string; campos: [string, string][] }> = {
  EXAMEN: { titulo: "Exámenes médicos", desc: "Alimentan el profesiograma de cada cargo según sus peligros (Res. 1843/2025).", campos: [["enfasis", "Énfasis"], ["periodicidad", "Periodicidad sugerida"]] },
  EPP: { titulo: "Elementos de protección personal", desc: "Alimentan la matriz de EPP por cargo (Res. 2400/1979).", campos: [["parteCuerpo", "Parte del cuerpo"], ["normaTecnica", "Norma técnica"], ["reposicion", "Reposición"]] },
  CAPACITACION: { titulo: "Capacitaciones", desc: "Alimentan el programa de capacitación y el plan anual (Decreto 1072/2015 art. 2.2.4.6.11).", campos: [["dirigidoA", "Dirigido a"], ["intensidadHoras", "Horas"], ["periodicidad", "Periodicidad"]] },
};

export function CatalogosTab({ items, empresaId }: { items: It[]; empresaId?: string }) {
  return (
    <Tabs defaultValue="EXAMEN">
      <TabsList variant="line">{Object.entries(COLS).map(([k, v]) => <TabsTrigger key={k} value={k}>{v.titulo} ({items.filter((i) => i.tipo === k).length})</TabsTrigger>)}</TabsList>
      {Object.keys(COLS).map((k) => <TabsContent key={k} value={k} className="mt-4"><Lista tipo={k} items={items.filter((i) => i.tipo === k)} empresaId={empresaId} /></TabsContent>)}
    </Tabs>
  );
}

function Lista({ tipo, items, empresaId }: { tipo: string; items: It[]; empresaId?: string }) {
  const cfg = COLS[tipo];
  const [pend, start] = useTransition();
  const [q, setQ] = useState("");
  const [nuevo, setNuevo] = useState<Record<string, string>>({ nombre: "", descripcion: "" });
  const lista = useMemo(() => items.filter((i) => !q || (i.nombre + i.descripcion).toLowerCase().includes(q.toLowerCase())), [items, q]);
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { const r = await fn(); if (r && typeof r === "object" && "error" in r) toast.error(String(r.error)); else if (ok) toast.success(ok); });
  const guardar = (i: It, cambio: Partial<It> & { detalle?: Record<string, unknown> }) => run(() => A.guardarCatalogoItem({ id: i.id, empresaId, tipo, nombre: cambio.nombre ?? i.nombre, descripcion: cambio.descripcion ?? i.descripcion, detalle: { ...i.detalle, ...(cambio.detalle ?? {}) }, normas: i.normas, validado: cambio.validado ?? i.validado }));
  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardHeader><CardTitle className="text-sm">Agregar a {cfg.titulo.toLowerCase()}</CardTitle><CardDescription>{cfg.desc}</CardDescription></CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-2">
          <Input placeholder="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
          <Input placeholder="Descripción" value={nuevo.descripcion} onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })} />
          {cfg.campos.map(([c, l]) => <Input key={c} placeholder={l} value={nuevo[c] ?? ""} onChange={(e) => setNuevo({ ...nuevo, [c]: e.target.value })} />)}
        </CardContent>
        <CardFooter><Button size="sm" disabled={!nuevo.nombre || pend} onClick={() => { const { nombre, descripcion, ...detalle } = nuevo; run(() => A.guardarCatalogoItem({ tipo, nombre, descripcion, detalle, empresaId }), "Agregado al catálogo"); setNuevo({ nombre: "", descripcion: "" }); }}><Plus /> Agregar</Button></CardFooter>
      </Card>
      <Section title={cfg.titulo} actions={<InputGroup className="w-72"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput placeholder="Buscar…" value={q} onChange={(e) => setQ(e.target.value)} /></InputGroup>} contentClassName="px-0">
        <Table className="[&_td]:whitespace-normal [&_td]:align-top">
          <TableHeader><TableRow><TableHead className="pl-6">Nombre</TableHead><TableHead>Descripción</TableHead>{cfg.campos.map(([, l]) => <TableHead key={l}>{l}</TableHead>)}<TableHead>Validado</TableHead><TableHead className="pr-6" /></TableRow></TableHeader>
          <TableBody>
            {lista.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="pl-6 min-w-56"><Input className="h-7" defaultValue={i.nombre} placeholder="Nombre" onBlur={(e) => e.target.value !== i.nombre && guardar(i, { nombre: e.target.value })} /></TableCell>
                <TableCell className="min-w-64"><Input className="h-7" defaultValue={i.descripcion} placeholder="Descripción breve" onBlur={(e) => e.target.value !== i.descripcion && guardar(i, { descripcion: e.target.value })} /></TableCell>
                {cfg.campos.map(([c, l]) => <TableCell key={c}><Input className="h-7" placeholder={l} defaultValue={String(i.detalle[c] ?? "")} onBlur={(e) => e.target.value !== String(i.detalle[c] ?? "") && guardar(i, { detalle: { [c]: e.target.value } })} /></TableCell>)}
                <TableCell><Switch checked={i.validado} onCheckedChange={(v) => guardar(i, { validado: v })} aria-label="Validado" /></TableCell>
                <TableCell className="pr-6 whitespace-nowrap">{empresaId && <Button size="icon-xs" variant="ghost" aria-label="Publicar en general" title="Publicar en general" onClick={() => run(() => A.publicarEnGeneral("catalogo", i.id), "Publicado en el catálogo general")}><Upload /></Button>}<Confirmar trigger={<Button size="icon-xs" variant="ghost" aria-label="Eliminar" />} titulo={`Eliminar “${i.nombre}”`} descripcion="Los peligros que lo mencionan conservan el texto." destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarCatalogoItem(i.id))}><Trash2 /></Confirmar></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </div>
  );
}
