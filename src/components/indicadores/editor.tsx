"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { ShieldAlert } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Ayuda } from "@/components/app/ayuda";
import * as A from "@/app/actions/sgsst";
import { MESES } from "@/lib/plan/generar";
import type { Indicador } from "@/lib/indicadores";

type Mensual = { mes: number; trabajadores: number; accidentes: number; frecuencia: number | null; severidad: number | null; ausentismo: number | null };
type Ev = { id: string; tipo: string; fecha: string; descripcion: string; cargo: string; dias: number; mortal: boolean; reportado: boolean };
const f = (n: number | null | undefined, d = 2) => (n == null ? "—" : n.toLocaleString("es-CO", { maximumFractionDigits: d }));
const TIPOS: Record<string, string> = { AT: "Accidente de trabajo", INCIDENTE: "Incidente", EL: "Enfermedad laboral", AUSENTISMO: "Ausentismo por enfermedad común" };

export function IndicadoresEditor({ empresaId, anio, trabajadoresBase, mensuales, anuales, plan, estandares, tm, eventos, fichas }: {
  empresaId: string; anio: number; trabajadoresBase: number; cargos: string[]; mensuales: Mensual[];
  anuales: { mortalidad: number; prevalencia: number | null; incidencia: number | null; promedioTrabajadores: number };
  plan: number | null; estandares: number | null; tm: { mes: number; n: number; dias: number | null }[]; eventos: Ev[]; fichas: Indicador[];
}) {
  const [, start] = useTransition();
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { await fn(); if (ok) toast.success(ok); });
  return (
    <Tabs defaultValue="tablero">
      <div className="flex flex-wrap items-center gap-2">
        <TabsList><TabsTrigger value="tablero">Tablero</TabsTrigger><TabsTrigger value="eventos">Registro de eventos</TabsTrigger><TabsTrigger value="fichas">Fichas técnicas</TabsTrigger></TabsList>
        <NativeSelect value={anio} onChange={(e) => (window.location.href = `?anio=${e.target.value}`)}>{[anio - 1, anio, anio + 1].map((y) => <NativeSelectOption key={y} value={y}>{y}</NativeSelectOption>)}</NativeSelect>
        <NormaRef>Res. 0312/2019 art. 30</NormaRef><NormaRef>Decreto 1072/2015 arts. 2.2.4.6.19-22</NormaRef>
      </div>

      <TabsContent value="tablero" className="space-y-6 mt-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Stat label="Estándares mínimos" value={estandares != null ? `${estandares}%` : "—"} hint="Meta > 85%" tone={estandares == null ? undefined : estandares > 85 ? "ok" : estandares >= 60 ? "warn" : "bad"} />
          <Stat label="Cumplimiento plan anual" value={plan != null ? `${plan}%` : "—"} hint="Meta ≥ 90%" tone={plan == null ? undefined : plan >= 90 ? "ok" : "warn"} />
          <Stat label="Proporción AT mortales" value={`${f(anuales.mortalidad)}%`} hint="Anual" tone={anuales.mortalidad ? "bad" : "ok"} />
          <Stat label="Prevalencia EL" value={f(anuales.prevalencia, 0)} hint="Por 100.000 trabajadores" />
          <Stat label="Incidencia EL" value={f(anuales.incidencia, 0)} hint="Por 100.000 trabajadores" />
        </div>
        <Section title="Indicadores mensuales" description="Registre el número de trabajadores de cada mes (incluye contratistas y en misión, art. 30). Los indicadores se calculan solos." contentClassName="px-0">
          <Table>
            <TableHeader><TableRow><TableHead className="pl-6">Mes</TableHead><TableHead><span className="flex items-center gap-1">Trabajadores <Ayuda k="trabajadoresMes" /></span></TableHead><TableHead><span className="flex items-center gap-1">Días programados <Ayuda k="diasProgramados" /></span></TableHead><TableHead>AT</TableHead><TableHead>Frecuencia (%)</TableHead><TableHead>Severidad (%)</TableHead><TableHead className="pr-6">Ausentismo (%)</TableHead></TableRow></TableHeader>
            <TableBody>
              {mensuales.map((m) => {
                const t = tm.find((x) => x.mes === m.mes);
                return (
                  <TableRow key={m.mes}>
                    <TableCell className="pl-6">{MESES[m.mes - 1]}</TableCell>
                    <TableCell><Input type="number" min={0} className="h-7 w-24" defaultValue={t?.n ?? ""} placeholder={String(trabajadoresBase)} onBlur={(e) => e.target.value && Number(e.target.value) !== t?.n && run(() => A.guardarTrabajadoresMes(empresaId, anio, m.mes, Number(e.target.value), t?.dias ?? undefined))} /></TableCell>
                    <TableCell><Input type="number" min={0} className="h-7 w-24" defaultValue={t?.dias ?? ""} placeholder="trab. × 24" onBlur={(e) => e.target.value && run(() => A.guardarTrabajadoresMes(empresaId, anio, m.mes, t?.n ?? trabajadoresBase, Number(e.target.value)))} /></TableCell>
                    <TableCell className="tabular-nums">{m.accidentes}</TableCell>
                    <TableCell className="tabular-nums">{f(m.frecuencia)}</TableCell>
                    <TableCell className="tabular-nums">{f(m.severidad)}</TableCell>
                    <TableCell className="pr-6 tabular-nums">{f(m.ausentismo)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Section>
      </TabsContent>

      <TabsContent value="eventos" className="space-y-6 mt-4">
        <Alert>
          <ShieldAlert />
          <AlertTitle>Los eventos se registran en la pestaña Accidentes</AlertTitle>
          <AlertDescription>Allí se gestiona cada caso: reporte FURAT, investigación, acciones e informe. Los indicadores se calculan solos a partir de esos registros.</AlertDescription>
          <AlertAction><Link href={`/empresas/${empresaId}/accidentes`} className={buttonVariants({ size: "sm" })}>Ir a Accidentes</Link></AlertAction>
        </Alert>
        <Section title={`Eventos ${anio}`} contentClassName="px-0">
          <Table className="[&_td]:whitespace-normal">
            <TableHeader><TableRow><TableHead className="pl-6">Fecha</TableHead><TableHead>Tipo</TableHead><TableHead>Cargo</TableHead><TableHead>Descripción</TableHead><TableHead>Días</TableHead><TableHead>ARL</TableHead><TableHead className="pr-6" /></TableRow></TableHeader>
            <TableBody>
              {eventos.map((x) => (
                <TableRow key={x.id}>
                  <TableCell className="pl-6">{x.fecha}</TableCell>
                  <TableCell>{TIPOS[x.tipo]}{x.mortal && <Badge variant="destructive" className="ml-1">mortal</Badge>}</TableCell>
                  <TableCell>{x.cargo}</TableCell><TableCell>{x.descripcion}</TableCell><TableCell>{x.dias}</TableCell>
                  <TableCell>{x.reportado ? <Badge variant="secondary">Sí</Badge> : <Badge variant="destructive">No</Badge>}</TableCell>
                  <TableCell className="pr-6"><Link href={`/empresas/${empresaId}/accidentes/${x.id}`} className={buttonVariants({ size: "xs", variant: "ghost" })}>Abrir</Link></TableCell>
                </TableRow>
              ))}
              {!eventos.length && <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Sin eventos registrados en {anio}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Section>
      </TabsContent>

      <TabsContent value="fichas" className="grid md:grid-cols-2 gap-4 mt-4">
        {fichas.map((x) => (
          <Section key={x.nombre} title={x.nombre} description={<Badge variant="outline">{x.tipo}</Badge>}>
            <dl className="grid grid-cols-[140px_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-muted-foreground">Definición</dt><dd>{x.definicion}</dd>
              <dt className="text-muted-foreground">Fórmula</dt><dd>{x.formula}</dd>
              <dt className="text-muted-foreground">Interpretación</dt><dd>{x.interpretacion}</dd>
              <dt className="text-muted-foreground">Meta</dt><dd>{x.meta}</dd>
              <dt className="text-muted-foreground">Periodicidad</dt><dd>{x.periodicidad}</dd>
              <dt className="text-muted-foreground">Fuente</dt><dd>{x.fuente}</dd>
              <dt className="text-muted-foreground">Quién lo conoce</dt><dd>{x.quienConoce}</dd>
            </dl>
          </Section>
        ))}
      </TabsContent>
    </Tabs>
  );
}
