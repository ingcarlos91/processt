"use client";
import { useState } from "react";
import { Check, ChevronsUpDown, PenLine } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const filtro = (valor: string, busqueda: string) => (norm(busqueda).split(/\s+/).filter(Boolean).every((w) => norm(valor).includes(w)) ? 1 : 0);

export type GrupoCombo = { titulo?: string; opciones: { valor: string; detalle?: string }[] };

/**
 * Selector con búsqueda que también acepta texto libre (shadcn Popover + Command).
 * Se ve como un campo de texto; las opciones vienen de la biblioteca y se pueden agrupar
 * (por ejemplo, "Típicas para esta forma de evento" primero).
 */
export function Combo({ id, value, onChange, grupos, placeholder = "Seleccione o escriba…", className, disabled }: {
  id?: string; value?: string; onChange: (v: string) => void; grupos: GrupoCombo[]; placeholder?: string; className?: string; disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const todas = grupos.flatMap((g) => g.opciones.map((o) => o.valor));
  const libre = q.trim() && !todas.some((v) => norm(v) === norm(q.trim()));
  const elegir = (v: string) => { onChange(v); setOpen(false); setQ(""); };
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQ(""); }}>
      <PopoverTrigger id={id} disabled={disabled} className={cn(
        "flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm shadow-xs outline-none transition-colors",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30",
        className)}>
        <span className={cn("truncate", !value && "text-muted-foreground")}>{value || placeholder}</span>
        <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-(--anchor-width) min-w-72 gap-0 p-0" align="start">
        <Command filter={filtro}>
          <CommandInput placeholder="Buscar o escribir…" value={q} onValueChange={setQ} />
          <CommandList className="max-h-72">
            <CommandEmpty>{q.trim() ? "Sin coincidencias en la biblioteca." : "Sin opciones."}</CommandEmpty>
            {grupos.filter((g) => g.opciones.length).map((g, i) => (
              <CommandGroup key={g.titulo ?? i} heading={g.titulo}>
                {g.opciones.map((o) => (
                  <CommandItem key={o.valor} value={`${o.valor} ${o.detalle ?? ""}`} onSelect={() => elegir(o.valor)}>
                    <Check className={cn("size-4", value === o.valor ? "opacity-100" : "opacity-0")} />
                    <div className="min-w-0"><div className="truncate">{o.valor}</div>{o.detalle && <div className="truncate text-xs text-muted-foreground">{o.detalle}</div>}</div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            {libre && (
              <>
                <CommandSeparator />
                <CommandGroup forceMount>
                  <CommandItem value={`__libre__ ${q}`} forceMount onSelect={() => elegir(q.trim())}><PenLine /> Usar «{q.trim()}» (texto propio)</CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
