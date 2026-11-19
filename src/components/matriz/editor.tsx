"use client";
import { Fragment, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Check, Download, BookmarkPlus, ChevronDown, ChevronRight, X, Lock } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section, NormaRef } from "@/components/app/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Item as UiItem, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Confirmar, Pedir } from "@/components/app/confirmar";
import { ND, NE, NC, CLASIFICACIONES, CLASIFICACION_ETIQUETA, calcular, COLOR_NIVEL, explicarRiesgo } from "@/lib/gtc45";
import { Porque } from "@/components/app/porque";
import * as A from "@/app/actions/matriz";
import type { Sugerencia } from "@/lib/ia";
import { cn } from "@/lib/utils";

type Cargo = { id: string; nombre: string; nPersonas: number; funciones: string; tipo: string | null; zonaId: string | null; tareaIds: string[] };
type Tarea = { id: string; nombre: string; procesoId: string | null; zonaId: string | null; rutinaria: boolean; altoRiesgo: string | null; estado: string; fuente: string; tareaTipoId: string | null; cargoIds: string[] };
type Peligro = {
  id: string; origen: "tarea" | "zona" | "cargo"; tareaId: string | null; zonaId: string | null; cargoId: string | null; peligroId: string | null;
  clasificacion: string; descripcion: string; efectosPosibles: string; controlesFuente: string; controlesMedio: string; controlesIndividuo: string;
  nd: number; ne: number; nc: number; medidaEliminacion: string; medidaSustitucion: string; medidaIngenieria: string; medidaAdministrativa: string; medidaEpp: string;
  requisitoLegal: boolean; estado: string; fuente: string;
};
type Item = { id: string; nombre: string };

export function MatrizEditor(props: {
  empresaId: string; sectorTipoId: string | null; version: { numero: number; fecha: string; motivo: string } | null;
  procesos: Item[]; zonas: Item[]; cargos: Cargo[]; tareas: Tarea[]; peligros: Peligro[];
  cargosTipo: { id: string; nombre: string; sectorTipoId: string | null }[]; tareasTipo: { id: string; nombre: string; actividad: string | null }[];
  catalogo: { id: string; clasificacion: string; descripcion: string }[]; zonasTipo: Item[];
}) {
  const { empresaId, cargos, tareas, peligros, procesos, zonas } = props;
  const [pend, start] = useTransition();
  const [filtroCargo, setFiltroCargo] = useState<string>("");
  const [filtroNivel, setFiltroNivel] = useState<string>("");
  const [abierto, setAbierto] = useState<string | null>(null);
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { try { await fn(); if (ok) toast.success(ok); } catch (e) { toast.error(String(e)); } });

  const nombreProceso = (id: string | null) => procesos.find((p) => p.id === id)?.nombre ?? "—";
  const nombreZona = (id: string | null) => zonas.find((z) => z.id === id)?.nombre ?? "—";
  const tareaDe = (id: string | null) => tareas.find((t) => t.id === id);
  const cargosDePeligro = (p: Peligro) => {
    if (p.origen === "tarea") return tareaDe(p.tareaId)?.cargoIds ?? [];
    if (p.origen === "cargo") return p.cargoId ? [p.cargoId] : [];
    const cs = cargos.filter((c) => c.zonaId === p.zonaId || c.tareaIds.some((t) => tareaDe(t)?.zonaId === p.zonaId)).map((c) => c.id);
    return cs.length ? cs : zonas.length === 1 ? cargos.map((c) => c.id) : [];
  };

  const filas = useMemo(() => peligros
    .map((p) => ({ p, c: calcular(p.nd, p.ne, p.nc), cargoIds: cargosDePeligro(p) }))
    .filter((f) => !filtroCargo || f.cargoIds.includes(filtroCargo))
    .filter((f) => !filtroNivel || f.c.nivel === filtroNivel)
    .sort((a, b) => (a.p.estado === "sugerido" ? -1 : 0) - (b.p.estado === "sugerido" ? -1 : 0) || b.c.nr - a.c.nr),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [peligros, filtroCargo, filtroNivel, tareas, cargos]);

  const conteo = { I: 0, II: 0, III: 0, IV: 0 } as Record<string, number>;
  peligros.filter((p) => p.estado === "aprobado").forEach((p) => conteo[calcular(p.nd, p.ne, p.nc).nivel]++);
  const sugeridos = peligros.filter((p) => p.estado === "sugerido").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground mr-2">Metodología GTC 45 <NormaRef>Decreto 1072/2015 art. 2.2.4.6.15</NormaRef> <NormaRef>Res. 0312 est. 4.1.1 y 4.1.2</NormaRef></span>
        <div className="flex-1" />
        {sugeridos > 0 && <Button disabled={pend} onClick={() => run(() => A.aprobarTodos(empresaId), "Sugerencias aprobadas")}><Check /> Aprobar {sugeridos} sugeridos</Button>}
        {props.sectorTipoId && <Button variant="outline" disabled={pend} onClick={() => run(() => A.completarDesdeSector(empresaId), "Procesos y zonas del sector agregados")}>Completar procesos y zonas del sector</Button>}
        <a href={`/api/empresas/${empresaId}/matriz.xlsx`} className={buttonVariants({ variant: "outline" })}><Download /> Excel GTC 45</a>
        <Pedir trigger={<Button variant="outline" disabled={pend} />} titulo="Cerrar versión de la matriz" descripcion="Se guarda una copia de la matriz actual. Debe actualizarse mínimo una vez al año y ante cambios o accidentes graves (Decreto 1072/2015 art. 2.2.4.6.15)." label="Motivo (inicial, anual, gestión del cambio, accidente)" inicial={props.version ? "anual" : "inicial"} accion="Cerrar versión" onConfirm={(m) => run(() => A.cerrarVersionMatriz(empresaId, m), "Versión de la matriz guardada")}><Lock /> Cerrar versión</Pedir>
      </div>
      {props.version && <p className="text-xs text-muted-foreground -mt-4">Última versión cerrada: v{props.version.numero} ({props.version.motivo}) el {new Date(props.version.fecha).toLocaleDateString("es-CO")}. La matriz se actualiza mínimo una vez al año y ante cambios o accidentes graves.</p>}

      <div className="grid xl:grid-cols-[380px_1fr] gap-6 items-start">
        <div className="space-y-4">
          <Estructura {...props} run={run} pend={pend} />
          <Section title={`Cargos (${cargos.length})`} description="Cada cargo tiene tareas; cada tarea tiene sus peligros.">
            <div className="space-y-3">
              {cargos.map((c) => <CargoCard key={c.id} c={c} {...props} run={run} pend={pend} activo={filtroCargo === c.id} onFiltrar={() => setFiltroCargo(filtroCargo === c.id ? "" : c.id)} />)}
              <NuevoCargo {...props} run={run} pend={pend} />
            </div>
          </Section>
        </div>

        <Section
          title="Matriz de identificación de peligros y valoración de riesgos"
          description={<>Nivel de riesgo: <span className="inline-flex gap-1">{(["I", "II", "III", "IV"] as const).map((n) => <span key={n} className={cn("px-1.5 rounded text-[11px]", COLOR_NIVEL[n])}>{n}: {conteo[n]}</span>)}</span></>}
          actions={
            <div className="flex gap-2">
              <NativeSelect className="w-48" value={filtroCargo} onChange={(e) => setFiltroCargo(e.target.value)}>
                <NativeSelectOption value="">Todos los cargos</NativeSelectOption>{cargos.map((c) => <NativeSelectOption key={c.id} value={c.id}>{c.nombre}</NativeSelectOption>)}
              </NativeSelect>
              <NativeSelect className="w-32" value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}>
                <NativeSelectOption value="">Todo nivel</NativeSelectOption>{["I", "II", "III", "IV"].map((n) => <NativeSelectOption key={n} value={n}>Nivel {n}</NativeSelectOption>)}
              </NativeSelect>
            </div>
          }
        >
          <div>
            <Table className="text-xs [&_td]:whitespace-normal [&_td]:align-top">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6" /><TableHead>Origen</TableHead><TableHead>Proceso / zona / tarea</TableHead><TableHead>Clasificación</TableHead><TableHead className="min-w-56">Peligro</TableHead>
                  <TableHead>ND</TableHead><TableHead>NE</TableHead><TableHead>NC</TableHead><TableHead>NR</TableHead><TableHead>Nivel</TableHead><TableHead>Expuestos</TableHead><TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filas.map(({ p, c, cargoIds }) => {
                  const t = tareaDe(p.tareaId);
                  const exp = cargos.filter((x) => cargoIds.includes(x.id)).reduce((s, x) => s + x.nPersonas, 0);
                  const lugar = p.origen === "tarea" ? `${nombreProceso(t?.procesoId ?? null)} · ${nombreZona(t?.zonaId ?? null)} · ${t?.nombre ?? ""}` : p.origen === "zona" ? `Zona: ${nombreZona(p.zonaId)}` : `Cargo: ${cargos.find((x) => x.id === p.cargoId)?.nombre ?? ""}`;
                  return (
                    <Fragment key={p.id}>
                      <TableRow className={cn("border-t align-top", p.estado === "sugerido" && "bg-amber-50")}>
                        <TableCell><button onClick={() => setAbierto(abierto === p.id ? null : p.id)}>{abierto === p.id ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</button></TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{p.origen}</Badge><Porque titulo={`Peligro por ${p.origen}`} normas={["GTC 45", "Decreto 1072/2015 art. 2.2.4.6.15"]}>{p.origen === "tarea" ? "Viene de la tarea: lo sufren las personas de los cargos que hacen esa tarea." : p.origen === "zona" ? "Viene del lugar de trabajo (zona): lo sufre todo el que trabaja allí, haga lo que haga (por ejemplo, sismo, incendio, pisos)." : "Viene del cargo en sí, no de una tarea (por ejemplo, carga mental o jornada)."} {p.fuente === "biblioteca" ? "Se tomó de la biblioteca de peligros." : p.fuente === "ia" ? "Lo sugirió la IA a partir de las funciones del cargo." : "Lo agregó la consultora."}</Porque>{p.estado === "sugerido" && <Badge className="ml-1 text-[10px] bg-amber-500">{p.fuente === "ia" ? "IA" : "sugerido"}</Badge>}</TableCell>
                        <TableCell className="max-w-64">{lugar}{t?.altoRiesgo && <Badge variant="destructive" className="ml-1 text-[10px]">alto riesgo: {t.altoRiesgo}</Badge>}</TableCell>
                        <TableCell>{CLASIFICACION_ETIQUETA[p.clasificacion] ?? p.clasificacion}</TableCell>
                        <TableCell>{p.descripcion}</TableCell>
                        <TableCell><NativeSelect size="sm" className="w-16" value={p.nd} onChange={(e) => run(() => A.actualizarPeligro(empresaId, p.id, { nd: Number(e.target.value) }))}>{ND.map((x) => <NativeSelectOption key={x.valor} value={x.valor} title={x.etiqueta}>{x.valor}</NativeSelectOption>)}</NativeSelect></TableCell>
                        <TableCell><NativeSelect size="sm" className="w-14" value={p.ne} onChange={(e) => run(() => A.actualizarPeligro(empresaId, p.id, { ne: Number(e.target.value) }))}>{NE.map((x) => <NativeSelectOption key={x.valor} value={x.valor} title={x.etiqueta}>{x.valor}</NativeSelectOption>)}</NativeSelect></TableCell>
                        <TableCell><NativeSelect size="sm" className="w-18" value={p.nc} onChange={(e) => run(() => A.actualizarPeligro(empresaId, p.id, { nc: Number(e.target.value) }))}>{NC.map((x) => <NativeSelectOption key={x.valor} value={x.valor} title={x.etiqueta}>{x.valor}</NativeSelectOption>)}</NativeSelect></TableCell>
                        <TableCell className="tabular-nums">{c.nr}</TableCell>
                        <TableCell className="whitespace-nowrap"><span className={cn("px-2 py-0.5 rounded font-semibold", COLOR_NIVEL[c.nivel])}>{c.nivel}</span> <Porque titulo={`Nivel de riesgo ${c.nivel}`} normas={["GTC 45 numeral 3"]} pasos={explicarRiesgo(p.nd, p.ne, p.nc).pasos}>Así se calculó con la metodología GTC 45. Cambie ND, NE o NC según lo que observe en la empresa y el nivel se recalcula.</Porque></TableCell>
                        <TableCell className="tabular-nums whitespace-nowrap">{exp} <Porque titulo="Personas expuestas">{`Suma de las personas de: ${cargos.filter((x) => cargoIds.includes(x.id)).map((x) => `${x.nombre} (${x.nPersonas})`).join(", ") || "ningún cargo asociado"}.`} {p.origen === "zona" ? "Son los cargos con alguna tarea en esta zona." : p.origen === "tarea" ? "Son los cargos que hacen esta tarea." : "Es el cargo dueño del peligro."}</Porque></TableCell>
                        <TableCell className="whitespace-nowrap">
                          {p.estado === "sugerido" && <Button size="icon-xs" variant="outline" title="Aprobar" onClick={() => run(() => A.actualizarPeligro(empresaId, p.id, { estado: "aprobado" }))}><Check /></Button>}
                          <Button size="icon-xs" variant="ghost" title="Eliminar" onClick={() => run(() => A.eliminarPeligro(empresaId, p.id))}><Trash2 /></Button>
                        </TableCell>
                      </TableRow>
                      {abierto === p.id && <DetallePeligro p={p} empresaId={empresaId} run={run} />}
                    </Fragment>
                  );
                })}
                {!filas.length && <TableRow><TableCell colSpan={12} className="p-8 text-center text-muted-foreground">Sin peligros. Agregue cargos con su tipo o use “Sugerir con IA”.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
          <AgregarPeligro {...props} run={run} pend={pend} />
        </Section>
      </div>
    </div>
  );
}

type Run = (fn: () => Promise<unknown>, ok?: string) => void;

function DetallePeligro({ p, empresaId, run }: { p: Peligro; empresaId: string; run: Run }) {
  const campo = (k: keyof Peligro, label: string) => (
    <Field>
      <FieldLabel htmlFor={`${String(k)}-${p.id}`} className="text-xs">{label}</FieldLabel>
      <Textarea id={`${String(k)}-${p.id}`} className="text-xs min-h-14" defaultValue={String(p[k] ?? "")} onBlur={(e) => e.target.value !== String(p[k] ?? "") && run(() => A.actualizarPeligro(empresaId, p.id, { [k]: e.target.value }))} />
    </Field>
  );
  return (
    <TableRow className="bg-muted/30">
      <TableCell />
      <TableCell colSpan={11} className="p-3">
        <div className="grid md:grid-cols-3 gap-3">
          <Field><FieldLabel className="text-xs">Clasificación</FieldLabel>
            <NativeSelect className="w-full" defaultValue={p.clasificacion} onChange={(e) => run(() => A.actualizarPeligro(empresaId, p.id, { clasificacion: e.target.value }))}>{CLASIFICACIONES.map((c) => <NativeSelectOption key={c} value={c}>{CLASIFICACION_ETIQUETA[c]}</NativeSelectOption>)}</NativeSelect>
          </Field>
          {campo("descripcion", "Descripción del peligro")}
          {campo("efectosPosibles", "Efectos posibles")}
          {campo("controlesFuente", "Controles existentes — fuente")}
          {campo("controlesMedio", "Controles existentes — medio")}
          {campo("controlesIndividuo", "Controles existentes — individuo")}
          {campo("medidaEliminacion", "Medida: eliminación")}
          {campo("medidaSustitucion", "Medida: sustitución")}
          {campo("medidaIngenieria", "Medida: controles de ingeniería")}
          {campo("medidaAdministrativa", "Medida: controles administrativos / señalización")}
          {campo("medidaEpp", "Medida: EPP")}
          <div className="space-y-2">
            <Field orientation="horizontal"><Checkbox id={`rl-${p.id}`} defaultChecked={p.requisitoLegal} onCheckedChange={(v) => run(() => A.actualizarPeligro(empresaId, p.id, { requisitoLegal: !!v }))} /><FieldLabel htmlFor={`rl-${p.id}`} className="font-normal">Existe requisito legal específico</FieldLabel></Field>
            {!p.peligroId && <Button size="sm" variant="outline" onClick={() => run(() => A.guardarPeligroEnBiblioteca(empresaId, p.id), "Peligro guardado en la biblioteca")}><BookmarkPlus /> Guardar en biblioteca</Button>}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

function Estructura({ empresaId, procesos, zonas, zonasTipo, run, pend }: { empresaId: string; procesos: Item[]; zonas: Item[]; zonasTipo: Item[]; run: Run; pend: boolean }) {
  const [np, setNp] = useState("");
  const [zt, setZt] = useState("");
  const Chip = ({ nombre, onQuitar }: { nombre: string; onQuitar: () => void }) => (
    <Badge variant="outline" className="gap-1 pr-1">{nombre}<Button variant="ghost" size="icon-xs" className="size-4" aria-label={`Quitar ${nombre}`} onClick={onQuitar}><X /></Button></Badge>
  );
  return (
    <Section title="Procesos y zonas" description="Los peligros de una zona aplican a quien trabaja allí.">
      <div className="space-y-4">
        <Field>
          <FieldLabel>Procesos</FieldLabel>
          <div className="flex flex-wrap gap-1">{procesos.map((p) => <Chip key={p.id} nombre={p.nombre} onQuitar={() => run(() => A.eliminarProceso(empresaId, p.id))} />)}</div>
          <div className="flex gap-1"><Input placeholder="Nuevo proceso" value={np} onChange={(e) => setNp(e.target.value)} /><Button size="icon" variant="outline" aria-label="Agregar proceso" disabled={!np || pend} onClick={() => { run(() => A.agregarProceso(empresaId, np)); setNp(""); }}><Plus /></Button></div>
        </Field>
        <Field>
          <FieldLabel>Zonas o lugares</FieldLabel>
          <div className="flex flex-wrap gap-1">{zonas.map((z) => <Chip key={z.id} nombre={z.nombre} onQuitar={() => run(() => A.eliminarZona(empresaId, z.id))} />)}</div>
          <div className="flex gap-1">
            <NativeSelect className="w-full" value={zt} onChange={(e) => setZt(e.target.value)}><NativeSelectOption value="">Agregar zona de la biblioteca…</NativeSelectOption>{zonasTipo.map((z) => <NativeSelectOption key={z.id} value={z.id}>{z.nombre}</NativeSelectOption>)}</NativeSelect>
            <Button size="icon" variant="outline" aria-label="Agregar zona" disabled={!zt || pend} onClick={() => { run(() => A.agregarZona(empresaId, zonasTipo.find((x) => x.id === zt)!.nombre, zt), "Zona agregada con sus peligros"); setZt(""); }}><Plus /></Button>
          </div>
        </Field>
      </div>
    </Section>
  );
}

function CargoCard({ c, empresaId, tareas, tareasTipo, cargosTipo, procesos, zonas, sectorTipoId, run, pend, activo, onFiltrar }: {
  c: Cargo; empresaId: string; tareas: Tarea[]; tareasTipo: { id: string; nombre: string }[]; cargosTipo: { id: string; nombre: string; sectorTipoId: string | null }[];
  procesos: Item[]; zonas: Item[]; sectorTipoId: string | null; run: Run; pend: boolean; activo: boolean; onFiltrar: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [funciones, setFunciones] = useState(c.funciones);
  const [tt, setTt] = useState("");
  const [manual, setManual] = useState("");
  const [sug, setSug] = useState<{ fuente: "ia" | "biblioteca"; sugerencia: Sugerencia } | null>(null);
  const [cargandoIA, startIA] = useTransition();
  const propias = tareas.filter((t) => t.cargoIds.includes(c.id));
  const otras = tareas.filter((t) => !t.cargoIds.includes(c.id));

  return (
    <Collapsible open={abierto} onOpenChange={setAbierto}>
      <Card size="sm" className={cn("gap-0 py-0", activo && "ring-2 ring-primary")}>
        <div className="flex items-center gap-2 p-3">
          <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Ver detalle del cargo" />}>{abierto ? <ChevronDown /> : <ChevronRight />}</CollapsibleTrigger>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{c.nombre}</div>
            <div className="text-xs text-muted-foreground">{c.nPersonas} persona(s) · {propias.length} tareas{c.tipo ? ` · ${c.tipo}` : ""}</div>
          </div>
          <Button size="xs" variant={activo ? "default" : "outline"} onClick={onFiltrar}>{activo ? "Viendo" : "Ver en matriz"}</Button>
        </div>
        <CollapsibleContent>
          <CardContent className="border-t py-3 space-y-4">
            <div className="grid grid-cols-[1fr_72px] gap-2">
              <Field><FieldLabel htmlFor={`cn-${c.id}`} className="text-xs">Nombre</FieldLabel><Input id={`cn-${c.id}`} defaultValue={c.nombre} onBlur={(e) => e.target.value !== c.nombre && run(() => A.actualizarCargo(empresaId, c.id, { nombre: e.target.value }))} /></Field>
              <Field><FieldLabel htmlFor={`cp-${c.id}`} className="text-xs">Personas</FieldLabel><Input id={`cp-${c.id}`} type="number" min={1} defaultValue={c.nPersonas} onBlur={(e) => Number(e.target.value) !== c.nPersonas && run(() => A.actualizarCargo(empresaId, c.id, { nPersonas: Number(e.target.value) }))} /></Field>
            </div>
            <NativeSelect className="w-full" defaultValue="" onChange={(e) => e.target.value && run(() => A.aplicarTipo(empresaId, c.id, e.target.value), "Tareas y peligros del cargo tipo agregados")}>
              <NativeSelectOption value="">Aplicar tareas de un cargo tipo…</NativeSelectOption>
              {cargosTipo.filter((t) => !sectorTipoId || t.sectorTipoId === sectorTipoId).map((t) => <NativeSelectOption key={t.id} value={t.id}>{t.nombre}</NativeSelectOption>)}
              <NativeSelectOptGroup label="Otros sectores">{cargosTipo.filter((t) => sectorTipoId && t.sectorTipoId !== sectorTipoId).map((t) => <NativeSelectOption key={t.id} value={t.id}>{t.nombre}</NativeSelectOption>)}</NativeSelectOptGroup>
            </NativeSelect>

            <Field>
              <FieldLabel className="text-xs">Tareas</FieldLabel>
              <ItemGroup className="gap-1">
                {propias.map((t) => (
                  <UiItem key={t.id} size="sm" variant={t.estado === "sugerido" ? "outline" : "muted"} className={cn("py-1.5", t.estado === "sugerido" && "border-amber-300 bg-amber-50")}>
                    <ItemContent>
                      <ItemTitle className="text-xs">{t.nombre}</ItemTitle>
                      <ItemDescription className="text-[11px]">{procesos.find((p) => p.id === t.procesoId)?.nombre ?? "Sin proceso"} · {zonas.find((z) => z.id === t.zonaId)?.nombre ?? "Sin zona"}{t.altoRiesgo ? ` · alto riesgo: ${t.altoRiesgo}` : ""}</ItemDescription>
                    </ItemContent>
                    <ItemActions className="gap-0">
                      {!t.tareaTipoId && <Button variant="ghost" size="icon-xs" aria-label="Guardar en biblioteca" onClick={() => run(() => A.guardarTareaEnBiblioteca(empresaId, t.id), "Tarea guardada en la biblioteca")}><BookmarkPlus /></Button>}
                      <Button variant="ghost" size="icon-xs" aria-label="Quitar del cargo" onClick={() => run(() => A.quitarTarea(empresaId, c.id, t.id))}><X /></Button>
                    </ItemActions>
                  </UiItem>
                ))}
              </ItemGroup>
              <div className="flex gap-1">
                <NativeSelect className="w-full" value={tt} onChange={(e) => setTt(e.target.value)}>
                  <NativeSelectOption value="">Agregar tarea…</NativeSelectOption>
                  {otras.length > 0 && <NativeSelectOptGroup label="Tareas de otros cargos">{otras.map((t) => <NativeSelectOption key={t.id} value={`e:${t.id}`}>{t.nombre}</NativeSelectOption>)}</NativeSelectOptGroup>}
                  <NativeSelectOptGroup label="Biblioteca">{tareasTipo.map((t) => <NativeSelectOption key={t.id} value={`b:${t.id}`}>{t.nombre}</NativeSelectOption>)}</NativeSelectOptGroup>
                </NativeSelect>
                <Button size="icon" variant="outline" aria-label="Agregar tarea" disabled={!tt || pend} onClick={() => { const [k, id] = tt.split(":"); run(() => (k === "e" ? A.vincularTarea(empresaId, c.id, id) : A.agregarTareaDeBiblioteca(empresaId, c.id, id))); setTt(""); }}><Plus /></Button>
              </div>
              <div className="flex gap-1">
                <Input placeholder="Tarea nueva (fuera de la biblioteca)" value={manual} onChange={(e) => setManual(e.target.value)} />
                <Button size="icon" variant="outline" aria-label="Agregar tarea nueva" disabled={!manual || pend} onClick={() => { run(() => A.agregarTareaManual(empresaId, c.id, { nombre: manual, procesoId: procesos[0]?.id, zonaId: zonas[0]?.id })); setManual(""); }}><Plus /></Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor={`fn-${c.id}`} className="text-xs">Funciones del cargo</FieldLabel>
              <Textarea id={`fn-${c.id}`} className="text-xs min-h-20" value={funciones} onChange={(e) => setFunciones(e.target.value)} placeholder="Ej: recibe mercancía, la sube a estantes con escalera, maneja montacargas, hace inventarios…" />
              <Button size="sm" variant="secondary" className="w-fit" disabled={!funciones || cargandoIA} onClick={() => startIA(async () => {
                const r = await A.sugerirConIA(empresaId, c.id, funciones);
                if ("error" in r) toast.error(r.error); else { setSug(r); if (!r.sugerencia.tareas.length) toast.info("No se encontraron coincidencias en la biblioteca."); }
              })}>{cargandoIA ? <Spinner /> : <Sparkles />} {cargandoIA ? "Analizando…" : "Sugerir tareas y peligros"}</Button>
            </Field>
            {sug && (
              <Card size="sm" className="bg-amber-50/60 ring-amber-200">
                <CardHeader><CardDescription>{sug.fuente === "ia" ? "Sugerencia de IA (GTC 45, priorizando la biblioteca)" : "Coincidencias en la biblioteca (IA no configurada)"}</CardDescription></CardHeader>
                <CardContent className="space-y-2">
                  {sug.sugerencia.tareas.map((t, i) => (
                    <div key={i} className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1 font-medium">{t.nombre}<Badge variant={t.tareaTipoId ? "outline" : "default"}>{t.tareaTipoId ? "biblioteca" : "nueva"}</Badge></div>
                      <ul className="pl-3 text-muted-foreground">{t.peligros.map((p, j) => <li key={j}>{CLASIFICACION_ETIQUETA[p.clasificacion]}: {p.descripcion} (NR {calcular(p.nd, p.ne, p.nc).nr})</li>)}</ul>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="gap-1">
                  <Button size="xs" disabled={pend} onClick={() => { run(() => A.aplicarSugerencia(empresaId, c.id, sug.sugerencia, sug.fuente), "Agregado como sugerido: revíselo en la matriz"); setSug(null); }}>Agregar a la matriz</Button>
                  <Button size="xs" variant="ghost" onClick={() => setSug(null)}>Descartar</Button>
                </CardFooter>
              </Card>
            )}
            <Confirmar trigger={<Button size="xs" variant="destructive" />} titulo={`Eliminar el cargo ${c.nombre}`} descripcion="Se eliminan sus tareas exclusivas y los peligros asociados." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarCargo(empresaId, c.id))}><Trash2 /> Eliminar cargo</Confirmar>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function NuevoCargo({ empresaId, cargosTipo, sectorTipoId, run, pend }: { empresaId: string; cargosTipo: { id: string; nombre: string; sectorTipoId: string | null }[]; sectorTipoId: string | null; run: Run; pend: boolean }) {
  const [nombre, setNombre] = useState("");
  const [n, setN] = useState(1);
  const [tipo, setTipo] = useState("");
  return (
    <Card size="sm" className="border-dashed ring-0 border">
      <CardHeader><CardTitle className="text-sm">Nuevo cargo</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <Input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Input type="number" min={1} aria-label="Personas" value={n} onChange={(e) => setN(Number(e.target.value))} />
        </div>
        <NativeSelect className="w-full" value={tipo} onChange={(e) => { setTipo(e.target.value); if (!nombre) setNombre(cargosTipo.find((t) => t.id === e.target.value)?.nombre.split(" / ")[0] ?? ""); }}>
          <NativeSelectOption value="">Tipo de cargo (opcional)…</NativeSelectOption>
          {cargosTipo.filter((t) => !sectorTipoId || t.sectorTipoId === sectorTipoId).map((t) => <NativeSelectOption key={t.id} value={t.id}>{t.nombre}</NativeSelectOption>)}
          <NativeSelectOptGroup label="Otros sectores">{cargosTipo.filter((t) => sectorTipoId && t.sectorTipoId !== sectorTipoId).map((t) => <NativeSelectOption key={t.id} value={t.id}>{t.nombre}</NativeSelectOption>)}</NativeSelectOptGroup>
        </NativeSelect>
      </CardContent>
      <CardFooter>
        <Button size="sm" disabled={!nombre || pend} onClick={() => { run(() => A.agregarCargo(empresaId, { nombre, nPersonas: n, cargoTipoId: tipo || undefined }), "Cargo agregado"); setNombre(""); setN(1); setTipo(""); }}><Plus /> Agregar cargo</Button>
      </CardFooter>
    </Card>
  );
}

function AgregarPeligro({ empresaId, catalogo, tareas, zonas, cargos, run, pend }: { empresaId: string; catalogo: { id: string; clasificacion: string; descripcion: string }[]; tareas: Tarea[]; zonas: Item[]; cargos: Cargo[]; run: Run; pend: boolean }) {
  const [origen, setOrigen] = useState<"tarea" | "zona" | "cargo">("tarea");
  const [ref, setRef] = useState("");
  const [pid, setPid] = useState("");
  const opciones = origen === "tarea" ? tareas : origen === "zona" ? zonas : cargos;
  return (
    <Card size="sm" className="mt-4 border-dashed ring-0 border">
      <CardHeader><CardTitle className="text-sm">Agregar peligro del catálogo</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <NativeSelect className="w-32" value={origen} onChange={(e) => { setOrigen(e.target.value as "tarea"); setRef(""); }}><NativeSelectOption value="tarea">A tarea</NativeSelectOption><NativeSelectOption value="zona">A zona</NativeSelectOption><NativeSelectOption value="cargo">A cargo</NativeSelectOption></NativeSelect>
        <NativeSelect className="w-64" value={ref} onChange={(e) => setRef(e.target.value)}><NativeSelectOption value="">Seleccione…</NativeSelectOption>{opciones.map((o) => <NativeSelectOption key={o.id} value={o.id}>{o.nombre}</NativeSelectOption>)}</NativeSelect>
        <NativeSelect className="flex-1 min-w-72" value={pid} onChange={(e) => setPid(e.target.value)}>
          <NativeSelectOption value="">Peligro…</NativeSelectOption>
          {CLASIFICACIONES.map((c) => <NativeSelectOptGroup key={c} label={CLASIFICACION_ETIQUETA[c]}>{catalogo.filter((p) => p.clasificacion === c).map((p) => <NativeSelectOption key={p.id} value={p.id}>{p.descripcion}</NativeSelectOption>)}</NativeSelectOptGroup>)}
        </NativeSelect>
        <Button disabled={!ref || !pid || pend} onClick={() => { run(() => A.agregarPeligro(empresaId, origen, ref, pid), "Peligro agregado"); setPid(""); }}><Plus /> Agregar</Button>
      </CardContent>
    </Card>
  );
}
