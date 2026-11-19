"use client";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { CalendarDays, Check, Plus, Sparkles, Trash2, Download } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import * as A from "@/app/actions/sgsst";
import { MESES } from "@/lib/plan/generar";
import { cn } from "@/lib/utils";

type Act = { id: string; mes: number; nombre: string; estandar: string; normaRef: string; responsable: string; estado: string; origen: string };

export function PlanEditor({ empresaId, anio, actividades }: { empresaId: string; anio: number; actividades: Act[] }) {
  const [pend, start] = useTransition();
  const [vista, setVista] = useState("mes");
  const [ocultarComites, setOcultarComites] = useState(true);
  const [nueva, setNueva] = useState({ mes: new Date().getMonth() + 1, nombre: "", responsable: "" });
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { await fn(); if (ok) toast.success(ok); });
  const mesActual = new Date().getFullYear() === anio ? new Date().getMonth() + 1 : anio < new Date().getFullYear() ? 13 : 0;
  const lista = useMemo(() => actividades.filter((a) => !ocultarComites || a.origen !== "comite"), [actividades, ocultarComites]);
  const ej = actividades.filter((a) => a.estado === "EJECUTADA").length;
  const venc = actividades.filter((a) => a.estado === "PENDIENTE" && a.mes < mesActual).length;

  const generar = <Button disabled={pend} onClick={() => run(async () => { const n = await A.generarPlanAnual(empresaId, anio); toast.success(`${n} actividades generadas; PLN-01 actualizado`); })}><Sparkles /> {actividades.length ? "Regenerar pendientes" : `Generar plan anual ${anio}`}</Button>;

  if (!actividades.length) return (
    <Empty className="border bg-background">
      <EmptyHeader>
        <EmptyMedia variant="icon"><CalendarDays /></EmptyMedia>
        <EmptyTitle>Sin plan anual {anio}</EmptyTitle>
        <EmptyDescription>Se genera desde el nivel de estándares, los comités, la matriz de peligros, el plan de mejoramiento y las obligaciones periódicas. Cada actividad cita su norma (Decreto 1072/2015 art. 2.2.4.6.17; Res. 0312/2019 art. 26).</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{generar}</EmptyContent>
    </Empty>
  );

  const fila = (a: Act) => (
    <TableRow key={a.id} className={cn(a.estado === "PENDIENTE" && a.mes < mesActual && "bg-red-50/60")}>
      <TableCell className="pl-6 w-10"><Checkbox checked={a.estado === "EJECUTADA"} onCheckedChange={(v) => run(() => A.actualizarActividad(empresaId, a.id, { estado: v ? "EJECUTADA" : "PENDIENTE" }))} aria-label="Ejecutada" /></TableCell>
      {vista === "tabla" && <TableCell className="w-28">{MESES[a.mes - 1]}</TableCell>}
      <TableCell><span className={cn(a.estado === "EJECUTADA" && "line-through text-muted-foreground")}>{a.nombre}</span></TableCell>
      <TableCell className="w-20">{a.estandar && <Badge variant="outline">{a.estandar}</Badge>}</TableCell>
      <TableCell className="w-56"><NormaRef>{a.normaRef}</NormaRef></TableCell>
      <TableCell className="w-48"><Input className="h-7" defaultValue={a.responsable} onBlur={(e) => e.target.value !== a.responsable && run(() => A.actualizarActividad(empresaId, a.id, { responsable: e.target.value }))} /></TableCell>
      <TableCell className="pr-6 w-10"><Confirmar trigger={<Button variant="ghost" size="icon-xs" aria-label="Eliminar actividad" />} titulo="Eliminar actividad" descripcion={a.nombre} destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarActividad(empresaId, a.id))}><Trash2 /></Confirmar></TableCell>
    </TableRow>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect value={anio} onChange={(e) => (window.location.href = `?anio=${e.target.value}`)}>
          {[anio - 1, anio, anio + 1].map((y) => <NativeSelectOption key={y} value={y}>{y}</NativeSelectOption>)}
        </NativeSelect>
        <ToggleGroup variant="outline" value={[vista]} onValueChange={(v) => v[0] && setVista(v[0])}>
          <ToggleGroupItem value="mes">Por mes</ToggleGroupItem><ToggleGroupItem value="tabla">Tabla</ToggleGroupItem>
        </ToggleGroup>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={ocultarComites} onCheckedChange={(v) => setOcultarComites(!!v)} /> Ocultar reuniones mensuales de comités</label>
        <div className="flex-1" />
        {generar}
        <a href={`/api/empresas/${empresaId}/documentos/PLN-01`} className={buttonVariants({ variant: "outline" })}><Download /> PLN-01 Word</a>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Cumplimiento del plan" value={`${Math.round((ej / actividades.length) * 100)}%`} hint={<Progress value={(ej / actividades.length) * 100} className="w-full" />} tone={ej / actividades.length >= 0.9 ? "ok" : undefined} />
        <Stat label="Actividades" value={actividades.length} hint={`${ej} ejecutadas`} />
        <Stat label="Vencidas" value={venc} tone={venc ? "bad" : "ok"} />
        <Stat label="Meta" value="≥ 90%" hint="Indicador de proceso (Decreto 1072 art. 2.2.4.6.21)" />
      </div>
      {vista === "tabla" ? (
        <Section contentClassName="px-0"><Table className="[&_td]:whitespace-normal"><TableHeader><TableRow><TableHead className="pl-6" /><TableHead>Mes</TableHead><TableHead>Actividad</TableHead><TableHead>Ítem</TableHead><TableHead>Fundamento</TableHead><TableHead>Responsable</TableHead><TableHead /></TableRow></TableHeader><TableBody>{lista.map(fila)}</TableBody></Table></Section>
      ) : MESES.map((m, i) => {
        const delMes = lista.filter((a) => a.mes === i + 1);
        if (!delMes.length) return null;
        const hechas = actividades.filter((a) => a.mes === i + 1 && a.estado === "EJECUTADA").length;
        const total = actividades.filter((a) => a.mes === i + 1).length;
        return (
          <Section key={m} title={<span className="flex items-center gap-2">{m} {i + 1 === mesActual && <Badge>Mes actual</Badge>}</span>} description={`${hechas} de ${total} ejecutadas`} contentClassName="px-0">
            <Table className="[&_td]:whitespace-normal"><TableBody>{delMes.map(fila)}</TableBody></Table>
          </Section>
        );
      })}
      <Card size="sm" className="border-dashed ring-0 border">
        <CardHeader><CardTitle className="text-sm">Agregar actividad</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <NativeSelect value={nueva.mes} onChange={(e) => setNueva({ ...nueva, mes: Number(e.target.value) })}>{MESES.map((m, i) => <NativeSelectOption key={m} value={i + 1}>{m}</NativeSelectOption>)}</NativeSelect>
          <Input className="flex-1 min-w-72" placeholder="Actividad" value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} />
          <Input className="w-56" placeholder="Responsable" value={nueva.responsable} onChange={(e) => setNueva({ ...nueva, responsable: e.target.value })} />
        </CardContent>
        <CardFooter><Button size="sm" disabled={!nueva.nombre || pend} onClick={() => { run(() => A.agregarActividad(empresaId, { anio, ...nueva }), "Actividad agregada"); setNueva({ ...nueva, nombre: "" }); }}><Plus /> Agregar</Button></CardFooter>
      </Card>
      <p className="text-xs text-muted-foreground flex items-center gap-1"><Check className="size-3" /> Al regenerar se conservan las actividades ejecutadas y las agregadas manualmente.</p>
    </>
  );
}
