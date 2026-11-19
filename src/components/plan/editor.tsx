"use client";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Check, Plus, Sparkles, Trash2, Download, Paperclip, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import { Tip } from "@/components/app/tip";
import { SubirArchivo, ListaArchivos, type ArchivoUI } from "@/components/app/adjuntos";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import * as A from "@/app/actions/sgsst";
import { MESES } from "@/lib/plan/generar";
import { cn } from "@/lib/utils";

const ORIGEN: Record<string, string> = {
  nivel: "Es una actividad mínima que exige el nivel de estándares de la empresa.",
  comite: "La norma exige que el comité se reúna al menos una vez al mes.",
  matriz: "Sale de la matriz de peligros: un riesgo prioritario que hay que intervenir o un tema de capacitación de los peligros de los cargos.",
  mejoramiento: "Sale del plan de mejoramiento: corrige un estándar que la evaluación encontró sin cumplir.",
  manual: "La agregó la consultora a mano.",
  periodica: "Es una obligación periódica fijada por la norma.",
};

type Act = { id: string; mes: number; nombre: string; estandar: string; normaRef: string; responsable: string; estado: string; origen: string; evidencias: ArchivoUI[] };

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

  const generar = <Button tooltip="Crea las actividades del año a partir de los estándares, la matriz de peligros y los comités; no borra las que usted agregó" disabled={pend} onClick={() => run(async () => { const n = await A.generarPlanAnual(empresaId, anio); toast.success(`${n} actividades generadas; PLN-01 actualizado`); })}><Sparkles /> {actividades.length ? "Regenerar pendientes" : `Generar plan anual ${anio}`}</Button>;

  if (!actividades.length) return (
    <EstadoVacio ilustracion="plan" titulo={<>Sin plan anual {anio}</>} descripcion={<>Se genera desde el nivel de estándares, los comités, la matriz de peligros, el plan de mejoramiento y las obligaciones periódicas. Cada actividad cita su norma (Decreto 1072/2015 art. 2.2.4.6.17; Res. 0312/2019 art. 26).</>}>{generar}</EstadoVacio>
  );

  const fila = (a: Act) => (
    <TableRow key={a.id} className={cn(a.estado === "PENDIENTE" && a.mes < mesActual && "bg-red-50/60")}>
      <TableCell className="pl-6 w-10"><Checkbox checked={a.estado === "EJECUTADA"} onCheckedChange={(v) => run(() => A.actualizarActividad(empresaId, a.id, { estado: v ? "EJECUTADA" : "PENDIENTE" }))} aria-label="Ejecutada" /></TableCell>
      {vista === "tabla" && <TableCell className="w-28">{MESES[a.mes - 1]}</TableCell>}
      <TableCell><Tip texto={<>{ORIGEN[a.origen] ?? "Actividad del plan."}{a.normaRef ? ` (${a.normaRef})` : ""}</>}><span className={cn(a.estado === "EJECUTADA" && "line-through text-muted-foreground")}>{a.nombre}</span></Tip></TableCell>
      <TableCell className="w-20">{a.estandar && <Badge variant="outline">{a.estandar}</Badge>}</TableCell>
      <TableCell className="w-56"><NormaRef>{a.normaRef}</NormaRef></TableCell>
      <TableCell className="w-20">
        <Popover>
          <PopoverTrigger render={<Button size="xs" variant={a.evidencias.some((x) => x.activo) ? "secondary" : "ghost"} aria-label="Evidencias" />}><Paperclip /> {a.evidencias.filter((x) => x.activo).length || ""}</PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <PopoverHeader><PopoverTitle>Evidencias</PopoverTitle><PopoverDescription>{a.nombre}</PopoverDescription></PopoverHeader>
            <ListaArchivos empresaId={empresaId} archivos={a.evidencias} compacta vacio="Sin evidencias. Suba la lista de asistencia, fotos o el informe." />
            <SubirArchivo empresaId={empresaId} ctx={{ tipo: "EVIDENCIA", actividadId: a.id }} titulo="Subir evidencia" trigger={<Button size="sm" className="w-full"><Upload /> Subir evidencia</Button>} ayuda="Al subirla, la actividad queda marcada como ejecutada en la fecha que indique." descripcionInicial={a.nombre} />
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell className="w-48"><Input className="h-7" defaultValue={a.responsable} onBlur={(e) => e.target.value !== a.responsable && run(() => A.actualizarActividad(empresaId, a.id, { responsable: e.target.value }))} /></TableCell>
      <TableCell className="pr-6 w-10"><Confirmar trigger={<Button variant="ghost" size="icon-xs" aria-label="Eliminar actividad" />} titulo="Eliminar actividad" descripcion={a.nombre} destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarActividad(empresaId, a.id))}><Trash2 /></Confirmar></TableCell>
    </TableRow>
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect value={anio} onChange={(e) => { if (String(e.target.value) !== String(anio)) window.location.href = `?anio=${e.target.value}`; }}>
          {[anio - 1, anio, anio + 1].map((y) => <NativeSelectOption key={y} value={y}>{y}</NativeSelectOption>)}
        </NativeSelect>
        <div className="flex">
          <Button variant={vista === "mes" ? "secondary" : "outline"} className="rounded-r-none" onClick={() => setVista("mes")}>Por mes</Button>
          <Button variant={vista === "tabla" ? "secondary" : "outline"} className="rounded-l-none -ml-px" onClick={() => setVista("tabla")}>Tabla</Button>
        </div>
        <label className="flex items-center gap-2 text-sm"><Checkbox checked={ocultarComites} onCheckedChange={(v) => setOcultarComites(!!v)} /> Ocultar reuniones mensuales de comités</label>
        <div className="flex-1" />
        {generar}
        <BotonDescarga href={`/api/empresas/${empresaId}/documentos/PLN-01`} variant="outline" tooltip="Descargar el plan anual de trabajo (PLN-01) en Word, listo para firmar"><Download /> PLN-01 Word</BotonDescarga>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Cumplimiento del plan" value={`${Math.round((ej / actividades.length) * 100)}%`} hint={<Progress value={(ej / actividades.length) * 100} className="w-full" />} tone={ej / actividades.length >= 0.9 ? "ok" : undefined} />
        <Stat label="Actividades" value={actividades.length} hint={`${ej} ejecutadas`} />
        <Stat label="Vencidas" value={venc} tone={venc ? "bad" : "ok"} />
        <Stat label="Meta" value="≥ 90%" hint="Indicador de proceso (Decreto 1072 art. 2.2.4.6.21)" />
      </div>
      {vista === "tabla" ? (
        <Section contentClassName="px-0"><Table className="[&_td]:whitespace-normal"><TableHeader><TableRow><TableHead className="pl-6" /><TableHead>Mes</TableHead><TableHead>Actividad</TableHead><TableHead>Ítem</TableHead><TableHead>Fundamento</TableHead><TableHead>Evidencias</TableHead><TableHead>Responsable</TableHead><TableHead /></TableRow></TableHeader><TableBody>{lista.map(fila)}</TableBody></Table></Section>
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
