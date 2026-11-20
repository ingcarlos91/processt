"use client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type OpcionSelector = { valor: string; etiqueta: string; detalle?: string };

/** Select de shadcn (Base UI) con lista de opciones simple. Reemplaza al select nativo. */
export function Selector({ id, value, onChange, opciones, placeholder = "Seleccione…", className, disabled }: {
  id?: string; value?: string; onChange: (v: string) => void; opciones: OpcionSelector[]; placeholder?: string; className?: string; disabled?: boolean;
}) {
  const items = Object.fromEntries(opciones.map((o) => [o.valor, o.etiqueta]));
  return (
    <Select value={value || null} onValueChange={(v) => { const x = (v as string | null) ?? ""; if (x !== (value ?? "")) onChange(x); }} items={items} disabled={disabled}>
      <SelectTrigger id={id} className={cn("w-full", className)}><SelectValue placeholder={placeholder} /></SelectTrigger>
      {/* La lista crece con el texto (al menos el ancho del botón, máximo 32rem) para que se lea completa. */}
      <SelectContent className="w-auto min-w-(--anchor-width) max-w-[min(32rem,calc(100vw-2rem))]">
        {opciones.map((o) => (
          <SelectItem key={o.valor} value={o.valor}>
            {o.detalle ? <div className="min-w-0"><div>{o.etiqueta}</div><div className="text-xs text-muted-foreground">{o.detalle}</div></div> : o.etiqueta}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
