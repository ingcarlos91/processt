"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Check, CircleDot, Lock, Repeat, Route, Circle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { NormaRef } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import type { EstadoPaso, Paso, Ruta } from "@/lib/ruta";

const COLOR: Record<EstadoPaso, string> = {
  hecho: "bg-emerald-500",
  actual: "bg-primary",
  continuo: "bg-sky-500",
  pendiente: "bg-muted-foreground/20",
  bloqueado: "bg-muted-foreground/10",
};
const ETIQUETA: Record<EstadoPaso, string> = { hecho: "Hecho", actual: "Paso actual", continuo: "En operación", pendiente: "Pendiente", bloqueado: "Bloqueado" };

function Icono({ estado, className }: { estado: EstadoPaso; className?: string }) {
  const c = cn("size-4 shrink-0", className);
  if (estado === "hecho") return <Check className={cn(c, "text-emerald-600")} />;
  if (estado === "actual") return <CircleDot className={cn(c, "text-primary")} />;
  if (estado === "continuo") return <Repeat className={cn(c, "text-sky-600")} />;
  if (estado === "bloqueado") return <Lock className={cn(c, "text-muted-foreground/60")} />;
  return <Circle className={cn(c, "text-muted-foreground/50")} />;
}

/** Barra segmentada: un tramo por paso, con su nombre al pasar el cursor. */
export function BarraRuta({ ruta, className }: { ruta: Ruta; className?: string }) {
  return (
    <div className={cn("flex gap-1", className)} aria-label={`Ruta: ${ruta.hechos} de ${ruta.total} pasos hechos`}>
      {ruta.pasos.map((p) => (
        <Tooltip key={p.clave}>
          <TooltipTrigger render={<span className={cn("h-1.5 flex-1 rounded-full", COLOR[p.estado])} />} />
          <TooltipContent>{p.n}. {p.titulo} · {ETIQUETA[p.estado]}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}

/** Lista completa de pasos (dentro del panel lateral). */
function ListaPasos({ ruta }: { ruta: Ruta }) {
  return (
    <ol className="space-y-1">
      {ruta.pasos.map((p) => {
        const abierto = p.estado === "actual" || p.estado === "continuo";
        return (
          <li key={p.clave} className={cn("rounded-lg border px-3 py-2.5", abierto ? "border-primary/30 bg-primary/[0.03]" : "border-transparent")}>
            <div className="flex items-start gap-2.5">
              <Icono estado={p.estado} className="mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className={cn("text-sm font-medium", p.estado === "hecho" && "text-muted-foreground", p.estado === "bloqueado" && "text-muted-foreground/70")}>{p.n}. {p.titulo}</span>
                  {p.avance && p.estado !== "hecho" && <span className="text-xs tabular-nums text-muted-foreground">{p.avance.hechos}/{p.avance.total}</span>}
                </div>
                {p.estado !== "hecho" && <p className="mt-0.5 text-xs text-muted-foreground">{p.que}</p>}
                {p.estado !== "hecho" && p.estado !== "bloqueado" && p.falta.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-xs">{p.falta.map((f) => <li key={f} className="flex gap-1.5"><span className="text-muted-foreground">·</span>{f}</li>)}</ul>
                )}
                {p.estado === "bloqueado" && <p className="mt-0.5 text-xs text-muted-foreground">Se habilita al iniciar el SG-SST.</p>}
              </div>
              {p.estado !== "hecho" && p.estado !== "bloqueado" && <Link href={p.href} className={buttonVariants({ size: "xs", variant: abierto ? "default" : "ghost" })}>Ir</Link>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function BotonRutaCompleta({ ruta, empresa, children }: { ruta: Ruta; empresa: string; children?: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="ghost" size="sm" />}>{children ?? <><Route /> Ver ruta completa</>}</SheetTrigger>
      <SheetContent className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Ruta de implementación — {empresa}</SheetTitle>
          <SheetDescription>El orden recomendado para montar y operar el SG-SST (Decreto 1072/2015 cap. 6; Res. 0312/2019). Cada paso se cumple solo con lo que se registra; puede trabajar en cualquier pestaña.</SheetDescription>
          <div className="pt-2"><BarraRuta ruta={ruta} /><p className="mt-1.5 text-xs text-muted-foreground">{ruta.actual?.estado === "actual" ? `Paso ${ruta.actual.n} de ${ruta.pasos.length}` : "Implementación completa"} · {ruta.pct} % de la implementación</p></div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-12rem)] px-4 pb-6"><ListaPasos ruta={ruta} /></ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

/** Tarjeta del Resumen: avance y solo el siguiente paso, con lo que falta y un botón para ir. */
export function TarjetaRuta({ ruta, empresa }: { ruta: Ruta; empresa: string }) {
  const p = ruta.actual;
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-medium"><Route className="size-4 text-primary" /> Ruta de implementación</div>
        <span className="text-xs tabular-nums text-muted-foreground">{p && p.estado === "actual" ? `Paso ${p.n} de ${ruta.pasos.length}` : "Implementación completa"} · {ruta.pct} % de la implementación</span>
        <BarraRuta ruta={ruta} className="min-w-40 flex-1" />
        <BotonRutaCompleta ruta={ruta} empresa={empresa} />
      </div>
      {p ? (
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{p.estado === "continuo" ? "Ahora" : "Siguiente paso"}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-base font-semibold">{p.titulo}</span>
              {p.avance && <span className="text-xs tabular-nums text-muted-foreground">{p.avance.hechos} de {p.avance.total}</span>}
              <NormaRef>{p.norma}</NormaRef>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{p.que}</p>
            {p.falta.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">{p.falta.slice(0, 3).map((f) => <li key={f} className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-amber-500" />{f}</li>)}</ul>
            )}
          </div>
          <Link href={p.href} className={buttonVariants()}>{p.boton} <ArrowRight /></Link>
        </div>
      ) : (
        <p className="px-5 py-4 text-sm text-muted-foreground">Todos los pasos de implementación están hechos. El sistema queda en operación: siga el planeador.</p>
      )}
    </Card>
  );
}

/** Una línea bajo las pestañas, solo en la pestaña donde se trabaja el paso actual. */
export function AvisoPasoRuta({ ruta, empresaId, empresa }: { ruta: Ruta; empresaId: string; empresa: string }) {
  const ruta_ = usePathname();
  const p = ruta.actual;
  if (!p || p.estado !== "actual") return null;
  const base = `/empresas/${empresaId}`;
  const enPestana = ruta_ === `${base}/${p.pestana}` || ruta_.startsWith(`${base}/${p.pestana}/`);
  if (!enPestana) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-primary/20 bg-primary/[0.04] px-3 py-2 text-sm">
      <CircleDot className="size-4 text-primary" />
      <span><span className="font-medium">Paso {p.n} de la ruta: {p.titulo}.</span>{p.falta.length > 0 && <span className="text-muted-foreground"> Falta: {p.falta.slice(0, 2).join("; ")}{p.falta.length > 2 ? "…" : ""}</span>}</span>
      <span className="flex-1" />
      <BotonRutaCompleta ruta={ruta} empresa={empresa}>Ver ruta</BotonRutaCompleta>
    </div>
  );
}
