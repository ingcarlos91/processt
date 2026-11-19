"use client";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { ClipboardCheck, Download, Lock, LockOpen, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import * as A from "@/app/actions/sgsst";
import { cn } from "@/lib/utils";

type It = { id: string; codigo: string; ciclo: string; grupo: string; subgrupo: string; descripcion: string; puntaje: number; modo: string; estado: string; justificacion: string; observacion: string };
type Cal = { puntaje: number; valoracion: string; accion: string; obtenido: number; maximo: number; pendientes: number };
type Plan = { id: string; estandar: string; actividad: string; responsable: string; fecha: string; recursos: string; soporte: string; estado: string };

const TONO: Record<string, "ok" | "warn" | "bad"> = { ACEPTABLE: "ok", "MODERADAMENTE ACEPTABLE": "warn", "CRÍTICO": "bad" };

export function EvaluacionEditor({ empresaId, nivel, evaluaciones, actual }: {
  empresaId: string; nivel: number;
  evaluaciones: { id: string; tipo: string; anio: number; fecha: string; cerrada: boolean; valoracion: string | null; puntaje: number | null }[];
  actual: { id: string; tipo: string; anio: number; nivel: number; cerrada: boolean; cal: Cal; items: It[]; plan: Plan[] } | null;
}) {
  const [pend, start] = useTransition();
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { const r = await fn(); if (r && typeof r === "object" && "error" in r) toast.error(String((r as { error: string }).error)); else if (ok) toast.success(ok); });
  const anio = new Date().getFullYear();

  const nueva = (
    <div className="flex gap-2">
      <Button disabled={pend} onClick={() => run(() => A.crearEvaluacion(empresaId, "inicial", anio), "Evaluación inicial creada")}><Plus /> Evaluación inicial</Button>
      <Button variant="outline" disabled={pend} onClick={() => run(() => A.crearEvaluacion(empresaId, "anual", anio), "Autoevaluación creada")}><Plus /> Autoevaluación {anio}</Button>
    </div>
  );

  if (!actual) return (
    <Empty className="border bg-background">
      <EmptyHeader>
        <EmptyMedia variant="icon"><ClipboardCheck /></EmptyMedia>
        <EmptyTitle>Sin evaluación de estándares mínimos</EmptyTitle>
        <EmptyDescription>Aplican {nivel} estándares. La evaluación inicial se precarga con lo marcado en “Estado actual” del cuestionario (Decreto 1072/2015 art. 2.2.4.6.16; Res. 0312/2019 art. 27).</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{nueva}</EmptyContent>
    </Empty>
  );

  const grupos = [...new Set(actual.items.map((i) => i.grupo))];
  const evaluados = actual.items.filter((i) => i.estado !== "PENDIENTE").length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect value={actual.id} onChange={(e) => (window.location.href = `?ev=${e.target.value}`)}>
          {evaluaciones.map((e) => <NativeSelectOption key={e.id} value={e.id}>{e.tipo === "inicial" ? "Evaluación inicial" : `Autoevaluación ${e.anio}`} — {new Date(e.fecha).toLocaleDateString("es-CO")}{e.valoracion ? ` — ${e.puntaje}%` : ""}</NativeSelectOption>)}
        </NativeSelect>
        <NormaRef>Res. 0312/2019 arts. 27 y 28</NormaRef>
        <div className="flex-1" />
        {nueva}
        <a href={`/api/empresas/${empresaId}/evaluacion.xlsx`} className={buttonVariants({ variant: "outline" })}><Download /> Excel</a>
        {actual.cerrada
          ? <Button variant="outline" disabled={pend} onClick={() => run(() => A.reabrirEvaluacion(empresaId, actual.id))}><LockOpen /> Reabrir</Button>
          : <Button disabled={pend} onClick={() => run(() => A.cerrarEvaluacion(empresaId, actual.id), "Evaluación cerrada: se generó el plan de mejoramiento y se actualizaron DOC-05 y PLN-02")}><Lock /> Cerrar y generar plan de mejoramiento</Button>}
        <Confirmar trigger={<Button variant="ghost" size="icon" aria-label="Eliminar evaluación" />} titulo="Eliminar esta evaluación" descripcion="Se eliminan sus calificaciones y su plan de mejoramiento." destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarEvaluacion(empresaId, actual.id))}><Trash2 /></Confirmar>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Puntaje" value={`${actual.cal.puntaje}%`} hint={actual.nivel === 60 ? "Sobre 100 puntos" : `Ajustado a los ${actual.items.length} ítems aplicables (${actual.cal.obtenido} de ${actual.cal.maximo})`} tone={TONO[actual.cal.valoracion]} />
        <Stat label="Valoración" value={<span className="text-lg">{actual.cal.valoracion}</span>} tone={TONO[actual.cal.valoracion]} />
        <Stat label="Ítems evaluados" value={`${evaluados} / ${actual.items.length}`} hint={<Progress value={(evaluados / actual.items.length) * 100} className="w-full" />} />
        <Stat label="Estado" value={actual.cerrada ? "Cerrada" : "En curso"} hint={actual.tipo === "inicial" ? "Evaluación inicial" : `Autoevaluación ${actual.anio}`} />
      </div>

      <Alert>
        <AlertTitle>Acción exigida por la Res. 0312/2019 art. 28</AlertTitle>
        <AlertDescription>{actual.cal.accion}{actual.cal.pendientes > 0 && ` Hay ${actual.cal.pendientes} ítems sin evaluar: cuentan como no cumplidos.`}</AlertDescription>
      </Alert>

      {grupos.map((g) => {
        const its = actual.items.filter((i) => i.grupo === g);
        const ob = its.reduce((s, i) => s + (i.estado === "CUMPLE" || i.estado === "NO_APLICA" ? i.puntaje : 0), 0);
        const mx = its.reduce((s, i) => s + i.puntaje, 0);
        return (
          <Section key={g} title={g} description={`${its[0].ciclo} · ${ob} de ${mx} puntos`} contentClassName="px-0">
            <Table className="[&_td]:whitespace-normal [&_td]:align-top">
              <TableHeader><TableRow><TableHead className="pl-6 w-16">Ítem</TableHead><TableHead>Estándar y modo de verificación</TableHead><TableHead className="w-14">Valor</TableHead><TableHead className="w-80">Calificación</TableHead><TableHead className="pr-6 w-72">Observación / justificación</TableHead></TableRow></TableHeader>
              <TableBody>
                {its.map((i) => (
                  <TableRow key={i.id} className={cn(i.estado === "NO_CUMPLE" && "bg-red-50/60", i.estado === "PENDIENTE" && "bg-muted/40")}>
                    <TableCell className="pl-6 font-mono text-xs">{i.codigo}</TableCell>
                    <TableCell><div className="font-medium text-sm">{i.descripcion}</div><div className="text-xs text-muted-foreground mt-1">{i.modo}</div></TableCell>
                    <TableCell className="tabular-nums">{i.puntaje}</TableCell>
                    <TableCell>
                      <ToggleGroup variant="outline" size="sm" disabled={actual.cerrada || pend} value={[i.estado]} onValueChange={(v) => v[0] && run(() => A.actualizarItemEvaluacion(empresaId, i.id, { estado: v[0] }))}>
                        <ToggleGroupItem value="CUMPLE" className="data-pressed:bg-emerald-600 data-pressed:text-white">Cumple</ToggleGroupItem>
                        <ToggleGroupItem value="NO_CUMPLE" className="data-pressed:bg-destructive data-pressed:text-white">No cumple</ToggleGroupItem>
                        <ToggleGroupItem value="NO_APLICA" className="data-pressed:bg-secondary">No aplica</ToggleGroupItem>
                      </ToggleGroup>
                    </TableCell>
                    <TableCell className="pr-6">
                      <Textarea className="min-h-9 text-xs" disabled={actual.cerrada} placeholder={i.estado === "NO_APLICA" ? "Justificación obligatoria" : "Observación"} aria-invalid={i.estado === "NO_APLICA" && !i.justificacion}
                        defaultValue={i.estado === "NO_APLICA" ? i.justificacion : i.observacion}
                        onBlur={(e) => run(() => A.actualizarItemEvaluacion(empresaId, i.id, i.estado === "NO_APLICA" ? { justificacion: e.target.value } : { observacion: e.target.value }))} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        );
      })}

      {actual.plan.length > 0 && (
        <Section title="Plan de mejoramiento" description="Actividades, responsables, plazo, recursos y soportes de efectividad (Res. 0312/2019 art. 28). Se incluye en el plan anual de trabajo." contentClassName="px-0">
          <Table className="[&_td]:whitespace-normal [&_td]:align-top">
            <TableHeader><TableRow><TableHead className="pl-6">Ítem</TableHead><TableHead>Actividad</TableHead><TableHead>Responsable</TableHead><TableHead>Fecha límite</TableHead><TableHead className="pr-6">Estado</TableHead></TableRow></TableHeader>
            <TableBody>
              {actual.plan.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-6"><Badge variant="outline">{p.estandar}</Badge></TableCell>
                  <TableCell className="min-w-80"><Textarea className="min-h-9 text-xs" defaultValue={p.actividad} onBlur={(e) => e.target.value !== p.actividad && run(() => A.actualizarPlanMejora(empresaId, p.id, { actividad: e.target.value }))} /></TableCell>
                  <TableCell><Input defaultValue={p.responsable} onBlur={(e) => run(() => A.actualizarPlanMejora(empresaId, p.id, { responsable: e.target.value }))} /></TableCell>
                  <TableCell><Input type="date" defaultValue={p.fecha} onChange={(e) => run(() => A.actualizarPlanMejora(empresaId, p.id, { fechaLimite: e.target.value }))} /></TableCell>
                  <TableCell className="pr-6">
                    <NativeSelect value={p.estado} onChange={(e) => run(() => A.actualizarPlanMejora(empresaId, p.id, { estado: e.target.value }))}>
                      <NativeSelectOption value="PENDIENTE">Pendiente</NativeSelectOption><NativeSelectOption value="EN_CURSO">En curso</NativeSelectOption><NativeSelectOption value="CUMPLIDA">Cumplida</NativeSelectOption>
                    </NativeSelect>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}
      <p className="text-xs text-muted-foreground">El registro anual de la autoevaluación y del plan de mejoramiento se hace en la aplicación del Fondo de Riesgos Laborales (sgrl.mintrabajo.gov.co), con copia a la ARL. <Link className="underline" href={`/empresas/${empresaId}/documentos`}>Ver DOC-05 y PLN-02</Link>.</p>
    </>
  );
}
