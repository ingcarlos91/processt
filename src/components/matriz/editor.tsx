"use client";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { Fragment, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Check, Download, ChevronDown, ChevronRight, X, Lock, History, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section, NormaRef } from "@/components/app/ui";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Item as UiItem, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Confirmar, Pedir } from "@/components/app/confirmar";
import { AvisoTareas } from "@/components/plazos/aviso-tareas";
import { toastTareas } from "@/components/plazos/toast-tareas";
import { avisoPlazo, deInput } from "@/lib/plazos";
import { GuardarEnBiblioteca } from "@/components/app/guardar-biblioteca";
import { Buscador, type OpcionBuscador, type Relevancia } from "@/components/app/buscador";
import { ND, NE, NC, CLASIFICACIONES, CLASIFICACION_ETIQUETA, calcular, COLOR_NIVEL, explicarRiesgo } from "@/lib/gtc45";
import { Tip } from "@/components/app/tip";
import { Ayuda } from "@/components/app/ayuda";
import * as A from "@/app/actions/matriz";
import type { Sugerencia } from "@/lib/ia";
import { cn, hoyLocal } from "@/lib/utils";
import { avisoPeriodicidad } from "@/lib/examenes";
import { ESTADOS_MEDIDA, EFICAZ, type Seguimiento } from "@/lib/matriz/seguimiento";

type Cargo = { id: string; nombre: string; nPersonas: number; funciones: string; periodicidadMeses: number | null; periodicidadMotivo: string; tipo: string | null; zonaId: string | null; tareaIds: string[] };
type Tarea = { id: string; nombre: string; procesoId: string | null; zonaId: string | null; rutinaria: boolean; altoRiesgo: string | null; estado: string; fuente: string; tareaTipoId: string | null; cargoIds: string[] };
type Peligro = {
  id: string; origen: "tarea" | "zona" | "cargo"; tareaId: string | null; zonaId: string | null; cargoId: string | null; peligroId: string | null;
  clasificacion: string; descripcion: string; efectosPosibles: string; controlesFuente: string; controlesMedio: string; controlesIndividuo: string;
  nd: number; ne: number; nc: number; medidaEliminacion: string; medidaSustitucion: string; medidaIngenieria: string; medidaAdministrativa: string; medidaEpp: string;
  requisitoLegal: boolean; estado: string; fuente: string; seguimiento: Seguimiento;
};
type Item = { id: string; nombre: string };
type CT = { id: string; nombre: string; sectorTipoId: string | null; empresaId: string | null; relevancia: Relevancia };
type TT = { id: string; nombre: string; actividad?: string | null; empresaId: string | null; relevancia: Relevancia };
type PC = { id: string; clasificacion: string; descripcion: string; empresaId: string | null; relevancia: Relevancia };
const opcCargos = (xs: CT[]): OpcionBuscador[] => xs.map((t) => ({ valor: t.id, etiqueta: t.nombre, relevancia: t.relevancia }));

export function MatrizEditor(props: {
  empresaId: string; sectorTipoId: string | null; version: { numero: number; fecha: string; motivo: string } | null; avisos: { nivel: "obligatorio" | "recomendado"; texto: string; normaRef: string }[]; nVersiones: number;
  procesos: Item[]; zonas: Item[]; cargos: Cargo[]; tareas: Tarea[]; peligros: Peligro[];
  cargosTipo: CT[]; tareasTipo: TT[]; catalogo: PC[]; zonasTipo: (Item & { relevancia: Relevancia })[];
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
        {props.sectorTipoId && <Button variant="outline" disabled={pend} tooltip="Agrega las zonas (con sus peligros como sugeridos) y los procesos típicos del sector que le falten a la empresa. No duplica ni modifica lo existente." onClick={() => start(async () => { const r = await A.completarDesdeSector(empresaId); if (!r.zonas && !r.procesos) toast.info("La empresa ya tiene todas las zonas y procesos del sector."); else toast.success(`Agregados: ${r.zonas} zona(s), ${r.procesos} proceso(s) y ${r.peligros} peligro(s) sugerido(s) para revisar.`); })}>{pend ? <><Spinner /> Completando…</> : "Completar procesos y zonas del sector"}</Button>}
        <BotonDescarga href={`/api/empresas/${empresaId}/matriz.xlsx`} variant="outline" tooltip="Descargar la matriz de peligros en Excel con el formato de la GTC 45"><Download /> Excel GTC 45</BotonDescarga>
        <Link href={`/empresas/${empresaId}/matriz/versiones`} className={buttonVariants({ variant: "outline" })}><History /> Versiones{props.nVersiones ? ` (${props.nVersiones})` : ""}</Link>
        <Pedir trigger={<Button disabled={pend} tooltip="Congela la matriz actual como una versión consultable y descargable" />} titulo="Cerrar versión de la matriz" descripcion="Se guarda una copia de la matriz como está hoy, con fecha, motivo y quién la cerró. Queda en Versiones y el MTZ-02 se actualiza. Se actualiza al menos cada año, cuando cambian procesos o instalaciones y tras un accidente mortal o catastrófico (Decreto 1072/2015 art. 2.2.4.6.15)." label="Motivo" placeholder="Ej.: Versión inicial, actualización anual 2026, cambio de proceso, accidente" inicial={props.version ? `Actualización anual ${new Date().getFullYear()}` : "Versión inicial"} accion="Cerrar versión"
          extra={() => <AvisoTareas titulo="Al cerrar se programa en el planeador" tareas={[avisoPlazo("matriz_anual", deInput(hoyLocal()))]} />}
          onConfirm={(m) => start(async () => { const r = await A.cerrarVersionMatriz(empresaId, m); if ("error" in r) toast.error(r.error); else toastTareas(`Versión v${r.numero} cerrada${r.pendientes ? `. Atención: ${r.pendientes} peligro(s) sugerido(s) sin aprobar no quedaron en la versión` : ""}.`, [avisoPlazo("matriz_anual", deInput(hoyLocal()))]); })}><Lock /> Cerrar versión</Pedir>
      </div>
      {props.version && <p className="text-xs text-muted-foreground -mt-4">Última versión cerrada: v{props.version.numero} ({props.version.motivo}) el {new Date(props.version.fecha).toLocaleDateString("es-CO")}. <Link className="underline underline-offset-2" href={`/empresas/${empresaId}/matriz/versiones`}>Ver historial</Link></p>}
      {props.avisos.map((a, i) => (
        <Alert key={i} variant={a.nivel === "obligatorio" ? "destructive" : "default"}>
          <AlertTriangle />
          <AlertTitle>{a.nivel === "obligatorio" ? "Actualice la matriz" : "Revisión recomendada de la matriz"}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">{a.texto} <NormaRef>{a.normaRef}</NormaRef></AlertDescription>
        </Alert>
      ))}

      {/* Estructura y cargos arriba (dos columnas); la matriz debajo, a todo el ancho, para que se vean todas sus columnas. */}
      <div className="grid gap-6">
        <div className="grid items-start gap-4 lg:grid-cols-2">
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
                  <TableHead className="w-6" /><TableHead><span className="flex items-center gap-1">Origen <Ayuda k="origenPeligro" /></span></TableHead><TableHead><span className="flex items-center gap-1">Proceso / zona / tarea <Ayuda k="lugarTarea" /></span></TableHead><TableHead><span className="flex items-center gap-1">Clasificación <Ayuda k="clasificacionPeligro" /></span></TableHead><TableHead className="min-w-56"><span className="flex items-center gap-1">Peligro <Ayuda k="descripcionPeligro" /></span></TableHead>
                  <TableHead><span className="flex items-center gap-1">ND <Ayuda k="nd" /></span></TableHead><TableHead><span className="flex items-center gap-1">NE <Ayuda k="ne" /></span></TableHead><TableHead><span className="flex items-center gap-1">NC <Ayuda k="nc" /></span></TableHead><TableHead><span className="flex items-center gap-1">NR <Ayuda k="nr" /></span></TableHead><TableHead><span className="flex items-center gap-1">Nivel <Ayuda k="nr" /></span></TableHead><TableHead><span className="flex items-center gap-1">Expuestos <Ayuda k="expuestos" /></span></TableHead><TableHead />
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
                        <TableCell><Tip texto={<>{p.origen === "tarea" ? "Viene de la tarea: lo sufren las personas de los cargos que hacen esa tarea." : p.origen === "zona" ? "Viene del lugar de trabajo (zona): lo sufre todo el que trabaja allí, haga lo que haga (por ejemplo, sismo, incendio, pisos)." : "Viene del cargo en sí, no de una tarea (por ejemplo, carga mental o jornada)."} {p.fuente === "biblioteca" ? "Se tomó de la biblioteca." : p.fuente === "ia" ? "Lo sugirió la IA a partir de las funciones del cargo." : p.fuente === "investigacion" ? "Se agregó desde la investigación de un accidente." : "Lo agregó la consultora."}</>}><Badge variant="outline" className="text-[10px]">{p.origen}</Badge></Tip>{p.estado === "sugerido" && <Badge className="ml-1 text-[10px] bg-amber-500">{p.fuente === "ia" ? "IA" : "sugerido"}</Badge>}</TableCell>
                        <TableCell className="max-w-64">{lugar}{t?.altoRiesgo && <Badge variant="destructive" className="ml-1 text-[10px]">alto riesgo: {t.altoRiesgo}</Badge>}</TableCell>
                        <TableCell>{CLASIFICACION_ETIQUETA[p.clasificacion] ?? p.clasificacion}</TableCell>
                        <TableCell>{p.descripcion}</TableCell>
                        <TableCell><NativeSelect size="sm" className="w-16" value={p.nd} onChange={(e) => run(() => A.actualizarPeligro(empresaId, p.id, { nd: Number(e.target.value) }))}>{ND.map((x) => <NativeSelectOption key={x.valor} value={x.valor} title={x.etiqueta}>{x.valor}</NativeSelectOption>)}</NativeSelect></TableCell>
                        <TableCell><NativeSelect size="sm" className="w-14" value={p.ne} onChange={(e) => run(() => A.actualizarPeligro(empresaId, p.id, { ne: Number(e.target.value) }))}>{NE.map((x) => <NativeSelectOption key={x.valor} value={x.valor} title={x.etiqueta}>{x.valor}</NativeSelectOption>)}</NativeSelect></TableCell>
                        <TableCell><NativeSelect size="sm" className="w-18" value={p.nc} onChange={(e) => run(() => A.actualizarPeligro(empresaId, p.id, { nc: Number(e.target.value) }))}>{NC.map((x) => <NativeSelectOption key={x.valor} value={x.valor} title={x.etiqueta}>{x.valor}</NativeSelectOption>)}</NativeSelect></TableCell>
                        <TableCell className="tabular-nums">{c.nr}</TableCell>
                        <TableCell className="whitespace-nowrap"><Tip texto={<ul className="space-y-0.5">{explicarRiesgo(p.nd, p.ne, p.nc).pasos.map((x) => <li key={x}>{x}</li>)}</ul>}><span className={cn("px-2 py-0.5 rounded font-semibold", COLOR_NIVEL[c.nivel])}>{c.nivel}</span></Tip>{(c.nivel === "I" || c.nivel === "II") && p.seguimiento.estado !== "implementada" && <Tip texto="Falta registrar la implementación o la verificación de las medidas de este riesgo prioritario. Ábralo para completarlas (Res. 0312/2019 est. 4.2.1 y 4.2.2)."><AlertTriangle className="ml-1 inline size-3.5 text-amber-600" aria-label="Medidas sin implementar" /></Tip>}</TableCell>
                        <TableCell className="tabular-nums whitespace-nowrap"><Tip texto={<>{`Suma de las personas de: ${cargos.filter((x) => cargoIds.includes(x.id)).map((x) => `${x.nombre} (${x.nPersonas})`).join(", ") || "ningún cargo asociado"}.`} {p.origen === "zona" ? "Son los cargos con alguna tarea en esta zona." : p.origen === "tarea" ? "Son los cargos que hacen esta tarea." : "Es el cargo dueño del peligro."}</>}><span className="underline decoration-dotted decoration-muted-foreground/50 underline-offset-4">{exp}</span></Tip></TableCell>
                        <TableCell className="whitespace-nowrap">
                          {p.estado === "sugerido" && <Button size="icon-xs" variant="outline" aria-label="Aprobar peligro sugerido" onClick={() => run(() => A.actualizarPeligro(empresaId, p.id, { estado: "aprobado" }))}><Check /></Button>}
                          <Button size="icon-xs" variant="ghost" aria-label="Quitar peligro de la matriz" onClick={() => run(() => A.eliminarPeligro(empresaId, p.id))}><Trash2 /></Button>
                        </TableCell>
                      </TableRow>
                      {abierto === p.id && <DetallePeligro p={p} nivel={c.nivel} empresaId={empresaId} run={run} />}
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

const EJ_PELIGRO: Record<string, string> = {
  descripcion: "Ej.: Ruido generado por la sierra circular", efectosPosibles: "Ej.: Hipoacusia, cefalea, estrés",
  controlesFuente: "Ej.: Mantenimiento preventivo de la máquina", controlesMedio: "Ej.: Cabina de aislamiento", controlesIndividuo: "Ej.: Protector auditivo de inserción",
  medidaEliminacion: "Ej.: Eliminar la tarea manual", medidaSustitucion: "Ej.: Cambiar por un equipo de menor ruido", medidaIngenieria: "Ej.: Encerramiento acústico",
  medidaAdministrativa: "Ej.: Rotación de turnos y señalización de uso obligatorio", medidaEpp: "Ej.: Protector auditivo tipo copa",
};

type Run = (fn: () => Promise<unknown>, ok?: string) => void;

function DetallePeligro({ p, nivel, empresaId, run }: { p: Peligro; nivel: string; empresaId: string; run: Run }) {
  const campo = (k: keyof Peligro, label: string) => (
    <Field>
      <FieldLabel htmlFor={`${String(k)}-${p.id}`} className="text-xs gap-1">{label} <Ayuda k={({ descripcion: "descripcionPeligro", efectosPosibles: "efectos" } as Record<string, string>)[String(k)] ?? String(k)} /></FieldLabel>
      <Textarea id={`${String(k)}-${p.id}`} className="text-xs min-h-14" placeholder={EJ_PELIGRO[String(k)]} defaultValue={String(p[k] ?? "")} onBlur={(e) => e.target.value !== String(p[k] ?? "") && run(() => A.actualizarPeligro(empresaId, p.id, { [k]: e.target.value }))} />
    </Field>
  );
  return (
    <TableRow className="bg-muted/30">
      <TableCell />
      <TableCell colSpan={11} className="p-3">
        <div className="grid md:grid-cols-3 gap-3">
          <Field><FieldLabel className="text-xs gap-1">Clasificación <Ayuda k="clasificacionPeligro" /></FieldLabel>
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
            {!p.peligroId && <GuardarEnBiblioteca que="este peligro" trigger={<Button size="sm" variant="outline" />} onGuardar={(a) => run(() => A.guardarPeligroEnBiblioteca(empresaId, p.id, a), a === "empresa" ? "Guardado en la biblioteca de esta empresa" : "Guardado en la biblioteca general")} />}
          </div>
        </div>
        <SeguimientoMedidas p={p} nivel={nivel} empresaId={empresaId} run={run} />
      </TableCell>
    </TableRow>
  );
}

/** Implementación y verificación de las medidas (Res. 0312/2019 est. 4.2.1 y 4.2.2); alimenta la tabla del MTZ-02. */
function SeguimientoMedidas({ p, nivel, empresaId, run }: { p: Peligro; nivel: string; empresaId: string; run: Run }) {
  const s = p.seguimiento;
  const guardar = (k: keyof Seguimiento, v: string) => v !== (s[k] ?? "") && run(() => A.actualizarSeguimiento(empresaId, p.id, { [k]: v }));
  const prioritario = nivel === "I" || nivel === "II";
  const id = (k: string) => `seg-${k}-${p.id}`;
  return (
    <div className="mt-4 rounded-md border bg-background p-3 space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium">Implementación y verificación de las medidas</span>
        <NormaRef>Res. 0312/2019 est. 4.2.1 y 4.2.2</NormaRef>
        <span className="text-muted-foreground">{prioritario ? "Riesgo prioritario: registre responsable, fecha, estado y la verificación en sitio de que los trabajadores aplican los controles." : "Opcional para riesgos de nivel III y IV."}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <Field><FieldLabel htmlFor={id("resp")} className="text-xs">Responsable</FieldLabel>
          <Input id={id("resp")} className="text-xs" placeholder="Ej.: Jefe de mantenimiento" defaultValue={s.responsable ?? ""} onBlur={(e) => guardar("responsable", e.target.value)} /></Field>
        <Field><FieldLabel htmlFor={id("fecha")} className="text-xs">Fecha de implementación</FieldLabel>
          <Input id={id("fecha")} type="date" className="text-xs" placeholder="AAAA-MM-DD" defaultValue={s.fecha ?? ""} onBlur={(e) => guardar("fecha", e.target.value)} /></Field>
        <Field><FieldLabel htmlFor={id("estado")} className="text-xs">Estado</FieldLabel>
          <NativeSelect id={id("estado")} className="w-full" defaultValue={s.estado ?? ""} onChange={(e) => guardar("estado", e.target.value)}>
            <NativeSelectOption value="">Sin registrar</NativeSelectOption>{ESTADOS_MEDIDA.map((x) => <NativeSelectOption key={x.valor} value={x.valor}>{x.etiqueta}</NativeSelectOption>)}
          </NativeSelect></Field>
        <Field><FieldLabel htmlFor={id("verif")} className="text-xs">Fecha de verificación</FieldLabel>
          <Input id={id("verif")} type="date" className="text-xs" placeholder="AAAA-MM-DD" defaultValue={s.verificadoFecha ?? ""} onBlur={(e) => guardar("verificadoFecha", e.target.value)} /></Field>
        <Field><FieldLabel htmlFor={id("metodo")} className="text-xs">Método de verificación</FieldLabel>
          <Input id={id("metodo")} className="text-xs" placeholder="Ej.: Observación directa en la inspección" defaultValue={s.metodo ?? ""} onBlur={(e) => guardar("metodo", e.target.value)} /></Field>
        <Field className="md:col-span-2"><FieldLabel htmlFor={id("res")} className="text-xs">Resultado</FieldLabel>
          <Input id={id("res")} className="text-xs" placeholder="Ej.: 5 de 5 trabajadores usan el protector auditivo" defaultValue={s.resultado ?? ""} onBlur={(e) => guardar("resultado", e.target.value)} /></Field>
        <Field><FieldLabel htmlFor={id("eficaz")} className="text-xs">¿Eficaz?</FieldLabel>
          <NativeSelect id={id("eficaz")} className="w-full" defaultValue={s.eficaz ?? ""} onChange={(e) => guardar("eficaz", e.target.value)}>
            <NativeSelectOption value="">Sin evaluar</NativeSelectOption>{EFICAZ.map((x) => <NativeSelectOption key={x.valor} value={x.valor}>{x.etiqueta}</NativeSelectOption>)}
          </NativeSelect></Field>
      </div>
      {s.eficaz === "no" || s.eficaz === "parcial" ? <p className="text-xs text-amber-700">La medida no fue eficaz: registre una acción correctiva en el FOR-06 (Decreto 1072/2015 art. 2.2.4.6.33).</p> : null}
    </div>
  );
}

function Estructura({ empresaId, procesos, zonas, zonasTipo, run, pend }: { empresaId: string; procesos: Item[]; zonas: Item[]; zonasTipo: (Item & { relevancia: Relevancia })[]; run: Run; pend: boolean }) {
  const [np, setNp] = useState("");
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
            <Buscador className="w-full" placeholder="Buscar zona…" textoBoton="Agregar zona de la biblioteca" opciones={zonasTipo.map((z) => ({ valor: z.id, etiqueta: z.nombre, relevancia: z.relevancia }))} onSelect={(v) => run(() => A.agregarZona(empresaId, zonasTipo.find((x) => x.id === v)!.nombre, v), "Zona agregada con sus peligros")} />
          </div>
        </Field>
      </div>
    </Section>
  );
}

/** Periodicidad de las evaluaciones médicas periódicas del cargo: la define la empresa con justificación técnica (Res. 1843/2025 art. 15). */
function PeriodicidadCargo({ c, empresaId, run }: { c: Cargo; empresaId: string; run: Run }) {
  const [meses, setMeses] = useState(c.periodicidadMeses ? String(c.periodicidadMeses) : "");
  const [motivo, setMotivo] = useState(c.periodicidadMotivo);
  const aviso = avisoPeriodicidad(Number(meses) || null, motivo);
  const guardar = (m: string, mo: string) => { if ((Number(m) || null) !== c.periodicidadMeses || mo.trim() !== c.periodicidadMotivo) run(() => A.actualizarCargo(empresaId, c.id, { periodicidadMeses: Number(m) || null, periodicidadMotivo: mo }), "Periodicidad guardada"); };
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2">
      <Field><FieldLabel htmlFor={`pm-${c.id}`} className="text-xs">Examen periódico cada (meses)</FieldLabel><Input id={`pm-${c.id}`} type="number" min={1} max={36} placeholder="Ej.: 12" value={meses} onChange={(e) => setMeses(e.target.value)} onBlur={() => guardar(meses, motivo)} /></Field>
      <Field><FieldLabel htmlFor={`pj-${c.id}`} className="text-xs">Justificación técnica <NormaRef>Res. 1843/2025 art. 15</NormaRef></FieldLabel><Textarea id={`pj-${c.id}`} className="text-xs min-h-9" placeholder="Ej.: ruido 85 dB(A) nivel de riesgo II; PVE auditivo pide audiometría anual" value={motivo} onChange={(e) => setMotivo(e.target.value)} onBlur={() => guardar(meses, motivo)} /></Field>
      <p className={cn("col-span-2 text-[11px]", aviso || !meses ? "text-amber-700" : "text-muted-foreground")}>{aviso ?? (!meses ? "Sin periodicidad: el próximo examen de los trabajadores de este cargo queda sin fecha. La define la empresa según el tipo, la magnitud y la frecuencia de la exposición; tres (3) años solo en caso excepcional." : "Con esta periodicidad se calcula el próximo examen de los trabajadores del cargo.")}</p>
    </div>
  );
}

function CargoCard({ c, empresaId, tareas, tareasTipo, cargosTipo, procesos, zonas, run, pend, activo, onFiltrar }: {
  c: Cargo; empresaId: string; tareas: Tarea[]; tareasTipo: TT[]; cargosTipo: CT[];
  procesos: Item[]; zonas: Item[]; sectorTipoId: string | null; run: Run; pend: boolean; activo: boolean; onFiltrar: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [funciones, setFunciones] = useState(c.funciones);
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
              <Field><FieldLabel htmlFor={`cn-${c.id}`} className="text-xs">Nombre</FieldLabel><Input id={`cn-${c.id}`} placeholder="Ej.: Auxiliar de bodega" defaultValue={c.nombre} onBlur={(e) => e.target.value !== c.nombre && run(() => A.actualizarCargo(empresaId, c.id, { nombre: e.target.value }))} /></Field>
              <Field><FieldLabel htmlFor={`cp-${c.id}`} className="text-xs gap-1">Personas <Ayuda k="nPersonas" /></FieldLabel><Input id={`cp-${c.id}`} placeholder="Ej.: 4" type="number" min={1} defaultValue={c.nPersonas} onBlur={(e) => Number(e.target.value) !== c.nPersonas && run(() => A.actualizarCargo(empresaId, c.id, { nPersonas: Number(e.target.value) }))} /></Field>
            </div>
            <PeriodicidadCargo c={c} empresaId={empresaId} run={run} />
            <Buscador className="w-full" placeholder="Buscar cargo tipo…" textoBoton="Aplicar tareas de un cargo tipo" opciones={opcCargos(cargosTipo)} onSelect={(v) => run(() => A.aplicarTipo(empresaId, c.id, v), "Tareas y peligros del cargo tipo agregados")} />

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
                      {!t.tareaTipoId && <GuardarEnBiblioteca que="esta tarea" trigger={<Button variant="ghost" size="icon-xs" aria-label="Guardar en biblioteca" />} onGuardar={(a) => run(() => A.guardarTareaEnBiblioteca(empresaId, t.id, a), a === "empresa" ? "Tarea guardada en la biblioteca de esta empresa" : "Tarea guardada en la biblioteca general")} />}
                      <Button variant="ghost" size="icon-xs" aria-label="Quitar del cargo" onClick={() => run(() => A.quitarTarea(empresaId, c.id, t.id))}><X /></Button>
                    </ItemActions>
                  </UiItem>
                ))}
              </ItemGroup>
              <div className="flex gap-1">
                <Buscador className="w-full" placeholder="Buscar tarea…" textoBoton="Agregar tarea"
                  opciones={[
                    ...otras.map((t) => ({ valor: `e:${t.id}`, etiqueta: t.nombre, detalle: "Ya está en la matriz de esta empresa", relevancia: "propio" as const, grupo: "En la matriz" })),
                    ...tareasTipo.map((t) => ({ valor: `b:${t.id}`, etiqueta: t.nombre, detalle: t.actividad ?? undefined, relevancia: t.relevancia, grupo: t.empresaId ? "Biblioteca propia" : undefined })),
                  ]}
                  onSelect={(v) => { const [k, id] = v.split(":"); run(() => (k === "e" ? A.vincularTarea(empresaId, c.id, id) : A.agregarTareaDeBiblioteca(empresaId, c.id, id)), "Tarea agregada con sus peligros"); }} />
              </div>
              <div className="flex gap-1">
                <Input placeholder="Tarea nueva (fuera de la biblioteca)" value={manual} onChange={(e) => setManual(e.target.value)} />
                <Button size="icon" variant="outline" aria-label="Agregar tarea nueva" disabled={!manual || pend} onClick={() => { run(() => A.agregarTareaManual(empresaId, c.id, { nombre: manual, procesoId: undefined, zonaId: zonas[0]?.id })); setManual(""); }}><Plus /></Button>
              </div>
            </Field>

            <Field>
              <FieldLabel htmlFor={`fn-${c.id}`} className="text-xs gap-1">Funciones del cargo <Ayuda k="funciones" /></FieldLabel>
              <Textarea id={`fn-${c.id}`} className="text-xs min-h-20" value={funciones} onChange={(e) => setFunciones(e.target.value)} placeholder="Ej: recibe mercancía, la sube a estantes con escalera, maneja montacargas, hace inventarios…" />
              <Button size="sm" variant="secondary" className="w-fit" disabled={!funciones || cargandoIA} onClick={() => startIA(async () => {
                const r = await A.sugerirConIA(empresaId, c.id, funciones);
                if ("error" in r) toast.error(r.error); else { setSug(r); if (r.aviso) toast.info(r.aviso); else if (!r.sugerencia.tareas.length) toast.info("No se encontraron coincidencias en la biblioteca."); }
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
            <div className="flex gap-2">
              <GuardarEnBiblioteca que="este cargo con sus tareas" trigger={<Button size="xs" variant="outline" />} onGuardar={(a) => run(() => A.guardarCargoEnBiblioteca(empresaId, c.id, a), a === "empresa" ? "Cargo guardado en la biblioteca de esta empresa" : "Cargo guardado en la biblioteca general")} />
            <Confirmar trigger={<Button size="xs" variant="destructive" />} titulo={`Eliminar el cargo ${c.nombre}`} descripcion="Se eliminan sus tareas exclusivas y los peligros asociados." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarCargo(empresaId, c.id))}><Trash2 /> Eliminar cargo</Confirmar>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function NuevoCargo({ empresaId, cargosTipo, run, pend }: { empresaId: string; cargosTipo: CT[]; sectorTipoId: string | null; run: Run; pend: boolean }) {
  const [nombre, setNombre] = useState("");
  const [n, setN] = useState(1);
  const [tipo, setTipo] = useState("");
  return (
    <div className="mb-1 rounded-lg border border-dashed bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-1 text-sm font-medium">Nuevo cargo <Ayuda k="cargos" /></div>
      <div className="grid gap-3 sm:grid-cols-[1fr_6rem]">
        <label className="space-y-1"><span className="text-xs text-muted-foreground">Nombre del cargo</span><Input className="bg-background" placeholder="Ej.: Auxiliar de bodega" value={nombre} onChange={(e) => setNombre(e.target.value)} /></label>
        <label className="space-y-1"><span className="text-xs text-muted-foreground">Personas</span><Input className="bg-background" type="number" min={1} placeholder="Ej.: 4" value={n} onChange={(e) => setN(Number(e.target.value))} /></label>
        <div className="space-y-1 sm:col-span-2"><span className="text-xs text-muted-foreground">Tipo de cargo de la biblioteca (opcional: trae sus tareas y peligros)</span><Buscador className="w-full" value={tipo || undefined} placeholder="Buscar cargo tipo…" textoBoton="Tipo de cargo (opcional)" opciones={opcCargos(cargosTipo)} onSelect={(v) => { setTipo(v); if (!nombre) setNombre(cargosTipo.find((t) => t.id === v)?.nombre.split(" / ")[0] ?? ""); }} /></div>
      </div>
      <div className="mt-3 flex justify-end"><Button size="sm" disabled={!nombre || pend} onClick={() => { run(() => A.agregarCargo(empresaId, { nombre, nPersonas: n, cargoTipoId: tipo || undefined }), "Cargo agregado"); setNombre(""); setN(1); setTipo(""); }}><Plus /> Agregar cargo</Button></div>
    </div>
  );
}

function AgregarPeligro({ empresaId, catalogo, tareas, zonas, cargos, run, pend }: { empresaId: string; catalogo: PC[]; tareas: Tarea[]; zonas: Item[]; cargos: Cargo[]; run: Run; pend: boolean }) {
  const [origen, setOrigen] = useState<"tarea" | "zona" | "cargo">("tarea");
  const [ref, setRef] = useState("");
  const [pid, setPid] = useState("");
  const opciones = origen === "tarea" ? tareas : origen === "zona" ? zonas : cargos;
  return (
    <Card size="sm" className="mt-4 border-dashed ring-0 border">
      <CardHeader><CardTitle className="text-sm">Agregar peligro del catálogo</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <NativeSelect className="w-32" value={origen} onChange={(e) => { setOrigen(e.target.value as "tarea"); setRef(""); }}><NativeSelectOption value="tarea">A tarea</NativeSelectOption><NativeSelectOption value="zona">A zona</NativeSelectOption><NativeSelectOption value="cargo">A cargo</NativeSelectOption></NativeSelect>
        <Buscador className="w-72" value={ref || undefined} placeholder={`Buscar ${origen}…`} textoBoton={`Elegir ${origen}`} opciones={opciones.map((o) => ({ valor: o.id, etiqueta: o.nombre }))} onSelect={setRef} />
        <Buscador className="flex-1 min-w-72" ancho="w-[34rem]" value={pid || undefined} placeholder="Buscar peligro…" textoBoton="Elegir peligro"
          opciones={catalogo.map((p) => ({ valor: p.id, etiqueta: p.descripcion, relevancia: p.relevancia, grupo: CLASIFICACION_ETIQUETA[p.clasificacion] }))} onSelect={setPid} />
        <Button disabled={!ref || !pid || pend} onClick={() => { run(() => A.agregarPeligro(empresaId, origen, ref, pid), "Peligro agregado"); setPid(""); }}><Plus /> Agregar</Button>
      </CardContent>
    </Card>
  );
}
