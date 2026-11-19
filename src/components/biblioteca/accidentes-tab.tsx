"use client";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Section, NormaRef } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import { Selector } from "@/components/app/selector";
import { PanelFormulario, SeccionFormulario } from "@/components/app/formulario-largo";
import { JERARQUIA } from "@/lib/eventos";
import type { CatalogoAccidentes, FormaEvento, ItemSimple, Medida } from "@/lib/catalogo-accidentes";
import * as A from "@/app/actions/biblioteca";

const CLASIF = ["Biologico", "Fisico", "Quimico", "Psicosocial", "Biomecanico", "Condiciones de seguridad", "Fenomenos naturales"];
const ETQ: Record<string, string> = { Biologico: "Biológico", Fisico: "Físico", Quimico: "Químico", Biomecanico: "Biomecánico", "Fenomenos naturales": "Fenómenos naturales" };
const lineas = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);
type Res = { error?: string } | { ok: boolean } | void;

/** Biblioteca global de accidentes: alimenta el formulario de eventos y las sugerencias de la investigación. */
export function AccidentesTab({ cat }: { cat: CatalogoAccidentes }) {
  return (
    <div className="space-y-4">
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">Listas y guías que usa la pestaña Accidentes de todas las empresas. Lo que cambie aquí aplica de inmediato a los nuevos registros. <NormaRef>Res. 1401/2007</NormaRef></p>
      <Tabs defaultValue="formas">
        <TabsList variant="line">
          <TabsTrigger value="formas">Formas del evento ({cat.formas.length})</TabsTrigger>
          <TabsTrigger value="lesiones">Tipos de lesión ({cat.lesiones.length})</TabsTrigger>
          <TabsTrigger value="agentes">Agentes ({cat.agentes.length})</TabsTrigger>
          <TabsTrigger value="partes">Partes del cuerpo ({cat.partes.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="formas" className="mt-4"><Formas cat={cat} /></TabsContent>
        <TabsContent value="lesiones" className="mt-4"><Simple tipo="LESION" titulo="Tipos de lesión" items={cat.lesiones} conGrave descripcion="Sin diagnósticos médicos. Marque las que suelen clasificar el accidente como grave: el formulario lo advierte." /></TabsContent>
        <TabsContent value="agentes" className="mt-4"><Simple tipo="AGENTE_EVENTO" titulo="Agentes" items={cat.agentes} descripcion="Objeto, equipo, sustancia o condición que causó la lesión." /></TabsContent>
        <TabsContent value="partes" className="mt-4"><Simple tipo="PARTE_CUERPO" titulo="Partes del cuerpo" items={cat.partes} descripcion="Para el análisis estadístico (FOR-08) y la selección de EPP." /></TabsContent>
      </Tabs>
    </div>
  );
}

function useRun() {
  const [pend, start] = useTransition();
  const run = (fn: () => Promise<Res>, ok: string, despues?: () => void) => start(async () => {
    const r = await fn();
    if (r && "error" in r && r.error) toast.error(r.error); else { toast.success(ok); despues?.(); }
  });
  return { pend, run };
}

export function Simple({ tipo, titulo, items, descripcion, conGrave }: { tipo: string; titulo: string; items: ItemSimple[]; descripcion: string; conGrave?: boolean }) {
  const { pend, run } = useRun();
  const [q, setQ] = useState("");
  const [n, setN] = useState({ nombre: "", descripcion: "" });
  const [edit, setEdit] = useState<{ id: string; nombre: string; descripcion: string } | null>(null);
  const lista = useMemo(() => items.filter((i) => !q || (i.nombre + i.descripcion).toLowerCase().includes(q.toLowerCase())), [items, q]);
  const guardar = (it: ItemSimple, cambios: Partial<ItemSimple>) => A.guardarCatalogoItem({ id: it.id, tipo, nombre: cambios.nombre ?? it.nombre, descripcion: cambios.descripcion ?? it.descripcion, detalle: { orden: items.indexOf(it), sugiereGrave: cambios.sugiereGrave ?? it.sugiereGrave }, normas: (cambios.sugiereGrave ?? it.sugiereGrave) ? ["RES-1401-2007"] : [] });
  return (
    <Section title={titulo} description={descripcion} contentClassName="px-0" actions={
      <InputGroup className="w-64"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} /></InputGroup>
    }>
      <Table>
        <TableHeader><TableRow><TableHead className="pl-6">Nombre</TableHead><TableHead>Descripción</TableHead>{conGrave && <TableHead>Sugiere accidente grave</TableHead>}<TableHead className="pr-6 w-24" /></TableRow></TableHeader>
        <TableBody>
          {lista.map((it) => (
            <TableRow key={it.id}>
              {edit?.id === it.id ? (
                <>
                  <TableCell className="pl-6"><Input value={edit.nombre} placeholder="Nombre" onChange={(e) => setEdit({ ...edit, nombre: e.target.value })} /></TableCell>
                  <TableCell><Input value={edit.descripcion} placeholder="Descripción (opcional)" onChange={(e) => setEdit({ ...edit, descripcion: e.target.value })} /></TableCell>
                  {conGrave && <TableCell />}
                  <TableCell className="pr-6"><div className="flex gap-1"><Button size="sm" disabled={pend} onClick={() => run(() => guardar(it, edit), "Guardado", () => setEdit(null))}>Guardar</Button><Button size="icon-sm" variant="ghost" aria-label="Cancelar" onClick={() => setEdit(null)}><X /></Button></div></TableCell>
                </>
              ) : (
                <>
                  <TableCell className="pl-6 font-medium">{it.nombre}</TableCell>
                  <TableCell className="whitespace-normal text-muted-foreground">{it.descripcion}</TableCell>
                  {conGrave && <TableCell><Switch checked={!!it.sugiereGrave} onCheckedChange={(v) => run(() => guardar(it, { sugiereGrave: v }), v ? "Marcada: sugiere accidente grave" : "Desmarcada")} /></TableCell>}
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-0.5">
                      <Button size="icon-sm" variant="ghost" aria-label="Editar" onClick={() => setEdit({ id: it.id, nombre: it.nombre, descripcion: it.descripcion })}><Pencil /></Button>
                      <Confirmar trigger={<Button size="icon-sm" variant="ghost" aria-label="Eliminar" />} titulo={`Eliminar «${it.nombre}»`} descripcion="Deja de aparecer en el formulario. Los eventos ya registrados conservan el texto." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarCatalogoItem(it.id), "Eliminado")}><Trash2 /></Confirmar>
                    </div>
                  </TableCell>
                </>
              )}
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="pl-6"><Input placeholder="Nuevo…" value={n.nombre} onChange={(e) => setN({ ...n, nombre: e.target.value })} /></TableCell>
            <TableCell><Input placeholder="Descripción (opcional)" value={n.descripcion} onChange={(e) => setN({ ...n, descripcion: e.target.value })} /></TableCell>
            {conGrave && <TableCell />}
            <TableCell className="pr-6"><Button size="sm" disabled={pend || !n.nombre.trim()} onClick={() => run(() => A.guardarCatalogoItem({ tipo, nombre: n.nombre, descripcion: n.descripcion, detalle: { orden: items.length } }), "Agregado", () => setN({ nombre: "", descripcion: "" }))}><Plus /> Agregar</Button></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Section>
  );
}

type Borrador = Omit<FormaEvento, "id" | "claves" | "actos" | "condiciones" | "personales" | "trabajo"> & { id?: string; claves: string; actos: string; condiciones: string; personales: string; trabajo: string };
const aBorrador = (f?: FormaEvento): Borrador => ({
  id: f?.id, nombre: f?.nombre ?? "", descripcion: f?.descripcion ?? "", clasificaciones: f?.clasificaciones ?? [], claves: (f?.claves ?? []).join(", "),
  actos: (f?.actos ?? []).join("\n"), condiciones: (f?.condiciones ?? []).join("\n"), personales: (f?.personales ?? []).join("\n"), trabajo: (f?.trabajo ?? []).join("\n"),
  medidas: f?.medidas ?? [], lesiones: f?.lesiones ?? [], agentes: f?.agentes ?? [], partes: f?.partes ?? [], leccion: f?.leccion ?? "",
});

/** Chips seleccionables de un catálogo (varias opciones a la vez). */
function Chips({ etiqueta, opciones, valor, onChange }: { etiqueta: string; opciones: string[]; valor: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline gap-2 text-sm"><span className="font-medium">{etiqueta}</span><span className="text-xs text-muted-foreground">{valor.length ? `${valor.length} seleccionadas` : "Ninguna"}</span></div>
      <ToggleGroup multiple variant="outline" size="sm" value={valor} onValueChange={(v) => onChange(v as string[])} className="w-full flex-wrap gap-2">
        {opciones.map((o) => <ToggleGroupItem key={o} value={o} className="h-7 cursor-pointer rounded-full px-3 text-xs font-normal aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground">{o}</ToggleGroupItem>)}
      </ToggleGroup>
    </div>
  );
}

function Formas({ cat }: { cat: CatalogoAccidentes }) {
  const { pend, run } = useRun();
  const [b, setB] = useState<Borrador | null>(null);
  const guardar = () => b && run(() => A.guardarCatalogoItem({
    id: b.id, tipo: "FORMA_EVENTO", nombre: b.nombre, descripcion: b.descripcion, normas: ["RES-1401-2007"],
    detalle: {
      orden: b.id ? cat.formas.findIndex((f) => f.id === b.id) : cat.formas.length, clasificaciones: b.clasificaciones, claves: b.claves.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean),
      actos: lineas(b.actos), condiciones: lineas(b.condiciones), personales: lineas(b.personales), trabajo: lineas(b.trabajo),
      medidas: b.medidas.filter((m) => m.descripcion.trim()), lesiones: b.lesiones, agentes: b.agentes, partes: b.partes, leccion: b.leccion,
    },
  }), "Forma del evento guardada", () => setB(null));
  return (
    <Section title="Formas del evento" description="Cómo ocurrió el evento. Cada forma trae las causas, medidas y lección aprendida que se proponen al investigar." contentClassName="px-0"
      actions={<Button size="sm" onClick={() => setB(aBorrador())}><Plus /> Nueva forma</Button>}>
      <Table className="[&_td]:align-top [&_td]:whitespace-normal">
        <TableHeader><TableRow><TableHead className="pl-6">Forma</TableHead><TableHead>Clasificación GTC 45</TableHead><TableHead>Causas típicas</TableHead><TableHead>Medidas típicas</TableHead><TableHead className="pr-6 w-24" /></TableRow></TableHeader>
        <TableBody>
          {cat.formas.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="pl-6"><div className="font-medium">{f.nombre}</div><div className="text-xs text-muted-foreground">{f.descripcion}</div></TableCell>
              <TableCell><div className="flex flex-wrap gap-1">{f.clasificaciones.map((c) => <Badge key={c} variant="outline">{ETQ[c] ?? c}</Badge>)}</div></TableCell>
              <TableCell className="text-xs text-muted-foreground">{f.actos.length + f.condiciones.length + f.personales.length + f.trabajo.length} causas</TableCell>
              <TableCell className="text-xs text-muted-foreground">{f.medidas.length ? f.medidas.map((m) => m.descripcion).slice(0, 2).join(" · ") : "—"}{f.medidas.length > 2 ? ` · +${f.medidas.length - 2}` : ""}</TableCell>
              <TableCell className="pr-6">
                <div className="flex justify-end gap-0.5">
                  <Button size="icon-sm" variant="ghost" aria-label="Editar" onClick={() => setB(aBorrador(f))}><Pencil /></Button>
                  <Confirmar trigger={<Button size="icon-sm" variant="ghost" aria-label="Eliminar" />} titulo={`Eliminar «${f.nombre}»`} descripcion="Deja de aparecer en el formulario. Los eventos ya registrados conservan el texto." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarCatalogoItem(f.id), "Eliminada")}><Trash2 /></Confirmar>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PanelFormulario open={!!b} onOpenChange={(o) => !o && setB(null)}
        titulo={b?.id ? `Editar «${b.nombre}»` : "Nueva forma del evento"}
        descripcion="Todo es una guía: en la investigación aparece como sugerencia y la consultora decide qué usar."
        pie={<>
          <Button variant="outline" onClick={() => setB(null)}>Cancelar</Button>
          <Button disabled={pend || !b?.nombre.trim()} onClick={guardar} tooltip={!b?.nombre.trim() ? "Escriba el nombre de la forma del evento" : undefined}>{pend && <Spinner />} Guardar</Button>
        </>}>
        {b && (
          <>
            <SeccionFormulario titulo="Identificación" descripcion="Cómo se nombra la forma del evento en el formulario y en el informe FOR-07." columnas={2}>
              <Field><FieldLabel htmlFor="f-n">Nombre</FieldLabel><Input id="f-n" placeholder="Ej.: Corte con herramienta manual" value={b.nombre} onChange={(e) => setB({ ...b, nombre: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="f-d">Descripción</FieldLabel><Input id="f-d" placeholder="Ej.: Contacto con el filo de cuchillos o bisturís" value={b.descripcion} onChange={(e) => setB({ ...b, descripcion: e.target.value })} /></Field>
            </SeccionFormulario>

            <SeccionFormulario titulo="Clasificación y palabras clave" descripcion="Sin IA, el sistema busca el peligro relacionado en la matriz solo dentro de estas clasificaciones y con estas palabras.">
              <Field>
                <FieldLabel>Clasificaciones de peligro (GTC 45) relacionadas</FieldLabel>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-4">
                  {CLASIF.map((c) => <label key={c} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={b.clasificaciones.includes(c)} onCheckedChange={(v) => setB({ ...b, clasificaciones: v ? [...b.clasificaciones, c] : b.clasificaciones.filter((x) => x !== c) })} />{ETQ[c] ?? c}</label>)}
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="f-k">Palabras clave del peligro</FieldLabel>
                <Input id="f-k" value={b.claves} placeholder="cort, cuchill, herramient" onChange={(e) => setB({ ...b, claves: e.target.value })} />
                <FieldDescription>Separadas por comas. Basta el comienzo de la palabra: “cort” encuentra corte, cortante, cortopunzante.</FieldDescription>
              </Field>
            </SeccionFormulario>

            <SeccionFormulario titulo="Causas" descripcion="Se proponen al investigar (metodología de causas inmediatas y básicas). Una causa por línea." columnas={2}>
              <Field><FieldLabel htmlFor="f-a">Causas inmediatas: actos subestándar</FieldLabel><Textarea id="f-a" rows={4} placeholder="Ej.: No usar guantes anticorte" value={b.actos} onChange={(e) => setB({ ...b, actos: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="f-c">Causas inmediatas: condiciones subestándar</FieldLabel><Textarea id="f-c" rows={4} placeholder="Ej.: Herramienta con el mango en mal estado" value={b.condiciones} onChange={(e) => setB({ ...b, condiciones: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="f-p">Causas básicas: factores personales</FieldLabel><Textarea id="f-p" rows={4} placeholder="Ej.: Falta de entrenamiento en la tarea" value={b.personales} onChange={(e) => setB({ ...b, personales: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="f-t">Causas básicas: factores del trabajo</FieldLabel><Textarea id="f-t" rows={4} placeholder="Ej.: No existe procedimiento de trabajo seguro" value={b.trabajo} onChange={(e) => setB({ ...b, trabajo: e.target.value })} /></Field>
            </SeccionFormulario>

            <SeccionFormulario titulo="Medidas típicas" descripcion="Según la jerarquía de controles. Se ofrecen como plan de acción al cerrar la investigación."
              acciones={<Button size="sm" variant="outline" onClick={() => setB({ ...b, medidas: [...b.medidas, { descripcion: "", jerarquia: "ingenieria", tipo: "correctiva" }] })}><Plus /> Agregar medida</Button>}>
              {b.medidas.length === 0 ? <p className="text-sm text-muted-foreground">Sin medidas. Agregue al menos una para que la investigación las proponga.</p> : (
                <div className="space-y-2">
                  <div className="hidden gap-2 px-0.5 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_11rem_9rem_2rem]"><span>Medida</span><span>Jerarquía</span><span>Tipo</span><span /></div>
                  {b.medidas.map((m, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_2rem] items-center gap-2 sm:grid-cols-[1fr_11rem_9rem_2rem]">
                      <Input className="col-span-2 sm:col-span-1" value={m.descripcion} placeholder="Ej.: Suministrar guantes anticorte" onChange={(e) => setB({ ...b, medidas: b.medidas.map((x, j) => (j === i ? { ...x, descripcion: e.target.value } : x)) })} />
                      <Button className="sm:order-last" size="icon-sm" variant="ghost" aria-label="Quitar medida" onClick={() => setB({ ...b, medidas: b.medidas.filter((_, j) => j !== i) })}><X /></Button>
                      <Selector value={m.jerarquia} onChange={(v) => setB({ ...b, medidas: b.medidas.map((x, j) => (j === i ? { ...x, jerarquia: v as Medida["jerarquia"] } : x)) })} opciones={Object.entries(JERARQUIA).map(([k, v]) => ({ valor: k, etiqueta: v }))} />
                      <Selector value={m.tipo} onChange={(v) => setB({ ...b, medidas: b.medidas.map((x, j) => (j === i ? { ...x, tipo: v as Medida["tipo"] } : x)) })} opciones={[{ valor: "correctiva", etiqueta: "Correctiva" }, { valor: "preventiva", etiqueta: "Preventiva" }, { valor: "mejora", etiqueta: "Mejora" }]} />
                    </div>
                  ))}
                </div>
              )}
            </SeccionFormulario>

            <SeccionFormulario titulo="Lesiones, agentes y partes del cuerpo típicas" descripcion="Se muestran primero en el formulario de eventos. Los catálogos se editan en las otras pestañas." contenidoClassName="gap-5">
              <Chips etiqueta="Lesiones" opciones={cat.lesiones.map((l) => l.nombre)} valor={b.lesiones} onChange={(v) => setB({ ...b, lesiones: v })} />
              <Chips etiqueta="Agentes" opciones={cat.agentes.map((l) => l.nombre)} valor={b.agentes} onChange={(v) => setB({ ...b, agentes: v })} />
              <Chips etiqueta="Partes del cuerpo" opciones={cat.partes.map((l) => l.nombre)} valor={b.partes} onChange={(v) => setB({ ...b, partes: v })} />
            </SeccionFormulario>

            <SeccionFormulario titulo="Lección aprendida" descripcion="Texto que se propone en el informe para divulgar a los trabajadores.">
              <Field><FieldLabel htmlFor="f-l">Lección aprendida sugerida</FieldLabel><Textarea id="f-l" rows={3} placeholder="Describa la lección que se propondrá al investigar eventos de este tipo" value={b.leccion} onChange={(e) => setB({ ...b, leccion: e.target.value })} /></Field>
            </SeccionFormulario>
          </>
        )}
      </PanelFormulario>
    </Section>
  );
}
