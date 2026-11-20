"use client";
import { BotonDescarga } from "@/components/app/boton-descarga";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Download, Lock, LockOpen, Plus, Trash2, Paperclip, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import { Tip } from "@/components/app/tip";
import { Ayuda } from "@/components/app/ayuda";
import { SubirArchivo, ListaArchivos, type ArchivoUI } from "@/components/app/adjuntos";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import * as A from "@/app/actions/sgsst";
import { cn } from "@/lib/utils";

type It = { id: string; codigo: string; ciclo: string; grupo: string; subgrupo: string; descripcion: string; puntaje: number; modo: string; soportes: ArchivoUI[]; estado: string; justificacion: string; observacion: string };
type Cal = { puntaje: number; valoracion: string; accion: string; obtenido: number; maximo: number; noAplicanPorNivel: number; pendientes: number };
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

  // Al crear una evaluación se abre de inmediato (la acción devuelve su id).
  const crear = (tipo: "inicial" | "anual", ok: string) => start(async () => {
    const r = await A.crearEvaluacion(empresaId, tipo, anio);
    if (r && typeof r === "object" && "error" in r) return void toast.error(String((r as { error: string }).error));
    toast.success(ok);
    if (typeof r === "string") window.location.href = `?ev=${r}`;
  });
  const hayInicial = evaluaciones.some((e) => e.tipo === "inicial");
  const hayAnual = evaluaciones.some((e) => e.tipo === "anual" && e.anio === anio);
  const nueva = (
    <div className="flex gap-2">
      {!hayInicial && <Button disabled={pend} onClick={() => crear("inicial", "Evaluación inicial creada")}><Plus /> Evaluación inicial</Button>}
      {!hayAnual && <Button variant={hayInicial ? "default" : "outline"} disabled={pend} onClick={() => crear("anual", "Autoevaluación creada")}><Plus /> Autoevaluación {anio}</Button>}
    </div>
  );

  if (!actual) return (
    <EstadoVacio ilustracion="evaluacion" titulo={<>Sin evaluación de estándares mínimos</>} descripcion={<>Aplican {nivel} estándares. La evaluación inicial se precarga con lo marcado en “Estado actual” del cuestionario (Decreto 1072/2015 art. 2.2.4.6.16; Res. 0312/2019 art. 27).</>}>{nueva}</EstadoVacio>
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
        <BotonDescarga href={`/api/empresas/${empresaId}/evaluacion.xlsx`} variant="outline" tooltip="Descargar la autoevaluación de estándares mínimos en Excel (Res. 0312/2019)"><Download /> Excel</BotonDescarga>
        {actual.cerrada
          ? <Button variant="outline" disabled={pend} onClick={() => run(() => A.reabrirEvaluacion(empresaId, actual.id))}><LockOpen /> Reabrir</Button>
          : actual.cal.pendientes > 0
            ? <Confirmar trigger={<Button disabled={pend}><Lock /> Cerrar y generar plan de mejoramiento</Button>} titulo="Cerrar con ítems sin evaluar" descripcion={`Hay ${actual.cal.pendientes} ítem(s) sin calificar: al cerrar cuentan como «no cumple» y entran al plan de mejoramiento. Puede reabrir la evaluación después.`} accion="Cerrar de todas formas" onConfirm={() => run(() => A.cerrarEvaluacion(empresaId, actual.id), "Evaluación cerrada: se generó el plan de mejoramiento y se actualizaron DOC-05 y PLN-02")} />
            : <Button disabled={pend} onClick={() => run(() => A.cerrarEvaluacion(empresaId, actual.id), "Evaluación cerrada: se generó el plan de mejoramiento y se actualizaron DOC-05 y PLN-02")}><Lock /> Cerrar y generar plan de mejoramiento</Button>}
        <Confirmar trigger={<Button variant="ghost" size="icon" aria-label="Eliminar evaluación" />} titulo="Eliminar esta evaluación" descripcion="Se eliminan sus calificaciones y su plan de mejoramiento." destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarEvaluacion(empresaId, actual.id))}><Trash2 /></Confirmar>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Puntaje" porque={actual.nivel === 60 ? "Suma de los puntos de los ítems que cumplen o no aplican (con justificación). El total posible es 100." : `Los ${actual.items.length} ítems de este nivel suman ${actual.cal.maximo} puntos; los demás ítems no le corresponden a la empresa y reciben su porcentaje máximo (Res. 0312/2019 art. 27). Puntaje = 100 menos los puntos de los ítems que no cumple. Los ítems sin evaluar cuentan como no cumplidos.`} normas={["Res. 0312/2019 art. 27"]} value={`${actual.cal.puntaje}%`} hint={actual.nivel === 60 ? "Sobre 100 puntos" : `Sobre 100: ${actual.cal.obtenido} de ${actual.cal.maximo} puntos de los ${actual.items.length} ítems del nivel, más ${actual.cal.noAplicanPorNivel} de los que no le corresponden (art. 27)`} tone={TONO[actual.cal.valoracion]} />
        <Stat label="Valoración" porque="Menos de 60 %: crítico. Entre 60 % y 85 %: moderadamente aceptable. Más de 85 %: aceptable. Cada valoración trae acciones obligatorias distintas." normas={["Res. 0312/2019 art. 28"]} value={<span className="text-lg">{actual.cal.valoracion}</span>} tone={TONO[actual.cal.valoracion]} />
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
              <TableHeader><TableRow><TableHead className="pl-6 w-16">Ítem</TableHead><TableHead>Estándar y modo de verificación</TableHead><TableHead className="w-14">Valor</TableHead><TableHead className="w-80"><span className="flex items-center gap-1">Calificación <Ayuda k="calificacion" /></span></TableHead><TableHead className="pr-6 w-72">Observación / justificación</TableHead></TableRow></TableHeader>
              <TableBody>
                {its.map((i) => (
                  <TableRow key={i.id} className={cn(i.estado === "NO_CUMPLE" && "bg-red-50/60", i.estado === "PENDIENTE" && "bg-muted/40")}>
                    <TableCell className="pl-6 font-mono text-xs whitespace-nowrap"><Tip texto={`Vale ${i.puntaje} puntos (Res. 0312/2019 arts. 16 y 27). Qué revisa el inspector: ${i.modo}`}><span className="underline decoration-dotted decoration-muted-foreground/50 underline-offset-4">{i.codigo}</span></Tip></TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{i.descripcion}</div>
                      <div className="text-xs text-muted-foreground mt-1">{i.modo}</div>
                      <Popover>
                        <PopoverTrigger render={<Button size="xs" variant={i.soportes.some((x) => x.activo) ? "secondary" : "outline"} className="mt-2" />}><Paperclip /> {i.soportes.filter((x) => x.activo).length ? `${i.soportes.filter((x) => x.activo).length} soporte(s)` : "Sin soportes"}</PopoverTrigger>
                        <PopoverContent className="w-[28rem]" align="start">
                          <PopoverHeader><PopoverTitle>Soportes del ítem {i.codigo}</PopoverTitle><PopoverDescription>Documentos firmados que lo respaldan, evidencias del plan anual y actas ligadas a este estándar.</PopoverDescription></PopoverHeader>
                          <ListaArchivos empresaId={empresaId} archivos={i.soportes} compacta vacio="Aún no hay soportes. Lo que pide el inspector está arriba en gris." />
                          <SubirArchivo empresaId={empresaId} ctx={{ tipo: "EVIDENCIA", estandarCodigo: i.codigo }} titulo={`Subir soporte del ítem ${i.codigo}`} trigger={<Button size="sm" className="w-full"><Upload /> Subir soporte</Button>} ayuda={i.modo} />
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell className="tabular-nums">{i.puntaje}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {([["CUMPLE", "Cumple", "bg-emerald-600 text-white hover:bg-emerald-600/90"], ["NO_CUMPLE", "No cumple", "bg-destructive text-white hover:bg-destructive/90"], ["NO_APLICA", "No aplica", ""]] as const).map(([v, l, on]) => (
                          <Button key={v} size="xs" variant={i.estado === v ? (v === "NO_APLICA" ? "secondary" : "default") : "outline"} className={cn(i.estado === v && on)} disabled={actual.cerrada || pend}
                            onClick={() => run(() => A.actualizarItemEvaluacion(empresaId, i.id, { estado: i.estado === v ? "PENDIENTE" : v }))}>{l}</Button>
                        ))}
                      </div>
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
                  <TableCell className="min-w-80"><Textarea className="min-h-9 text-xs" defaultValue={p.actividad} placeholder="Describa la actividad para cumplir el estándar" onBlur={(e) => e.target.value !== p.actividad && run(() => A.actualizarPlanMejora(empresaId, p.id, { actividad: e.target.value }))} /></TableCell>
                  <TableCell><Input defaultValue={p.responsable} placeholder="Ej.: Responsable del SG-SST" onBlur={(e) => run(() => A.actualizarPlanMejora(empresaId, p.id, { responsable: e.target.value }))} /></TableCell>
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
