"use client";
import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Patrón de "formulario largo".
 *
 * - `PanelFormulario`: panel lateral derecho (Sheet) para formularios muy largos (más de ~10 campos,
 *   o con tablas y chips). Encabezado y pie fijos; solo el cuerpo hace scroll.
 * - `SeccionFormulario`: bloque con título, descripción opcional y una rejilla de 1 o 2 columnas.
 *   Para diálogos medianos (6 a 10 campos) se usa dentro de `DialogBody` con `sm:max-w-xl` o `sm:max-w-2xl`.
 *
 * Regla: la ayuda contextual (?) va en el encabezado de la sección o del campo, no en cada opción.
 */
export function PanelFormulario({ open, onOpenChange, titulo, descripcion, pie, children, className }: {
  open: boolean; onOpenChange: (open: boolean) => void; titulo: ReactNode; descripcion?: ReactNode; pie: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className={cn("w-full gap-0 sm:max-w-2xl lg:max-w-3xl data-[side=right]:w-full data-[side=right]:sm:max-w-2xl data-[side=right]:lg:max-w-3xl", className)}>
        <SheetHeader className="shrink-0 gap-1 border-b px-6 py-5 pr-14">
          <SheetTitle>{titulo}</SheetTitle>
          {descripcion && <SheetDescription className="text-pretty">{descripcion}</SheetDescription>}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-8">{children}</div>
        </div>
        <SheetFooter className="mt-0 shrink-0 flex-col-reverse gap-2 border-t bg-muted/50 px-6 py-4 sm:flex-row sm:justify-end">{pie}</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

/** Sección de un formulario largo: título, descripción y rejilla de campos. Entre secciones hay un separador. */
export function SeccionFormulario({ titulo, descripcion, ayuda, acciones, children, columnas = 1, className, contenidoClassName }: {
  titulo: ReactNode; descripcion?: ReactNode; ayuda?: ReactNode; acciones?: ReactNode; children: ReactNode; columnas?: 1 | 2; className?: string; contenidoClassName?: string;
}) {
  return (
    <section className={cn("space-y-4 border-t pt-6 first:border-t-0 first:pt-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold leading-none">{titulo}{ayuda}</h3>
          {descripcion && <p className="text-xs text-muted-foreground text-pretty">{descripcion}</p>}
        </div>
        {acciones && <div className="flex shrink-0 items-center gap-1">{acciones}</div>}
      </div>
      <div className={cn("grid gap-4", columnas === 2 && "sm:grid-cols-2", contenidoClassName)}>{children}</div>
    </section>
  );
}

/** Contenedor de secciones para usar dentro de un `DialogBody` (mismo ritmo vertical que el panel). */
export function SeccionesFormulario({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-8", className)}>{children}</div>;
}
