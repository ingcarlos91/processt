"use client";
import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type Relevancia = "propio" | "sector" | "otro";
export type OpcionBuscador = { valor: string; etiqueta: string; detalle?: string; grupo?: string; relevancia?: Relevancia; deshabilitada?: boolean };

const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
/** Coincide si cada palabra buscada aparece en el texto (sin importar tildes ni orden). */
const filtro = (valor: string, busqueda: string) => {
  const v = norm(valor);
  return norm(busqueda).split(/\s+/).filter(Boolean).every((w) => v.includes(w)) ? 1 : 0;
};

const TITULO: Record<Relevancia, string> = { propio: "Propias de esta empresa", sector: "De su sector", otro: "Otras de la biblioteca" };

/**
 * Selector con búsqueda (Popover + Command de shadcn).
 * Agrupa por relevancia (propio → sector → otro) y, dentro de cada una, por `grupo`.
 * Si hay opciones de “otro”, ofrece el interruptor “Solo mi sector”.
 */
export function Buscador({
  opciones, onSelect, value, placeholder = "Buscar…", textoBoton, icono, className, size = "default", variant = "outline", align = "start", ancho = "w-[28rem]", cerrarAlElegir = true, vacio = "Sin resultados.",
}: {
  opciones: OpcionBuscador[]; onSelect: (valor: string) => void; value?: string; placeholder?: string; textoBoton?: ReactNode; icono?: ReactNode; className?: string;
  size?: "default" | "sm" | "xs"; variant?: "outline" | "ghost" | "secondary" | "default"; align?: "start" | "end" | "center"; ancho?: string; cerrarAlElegir?: boolean; vacio?: string;
}) {
  const [open, setOpen] = useState(false);
  const hayOtros = opciones.some((o) => o.relevancia === "otro") && opciones.some((o) => o.relevancia && o.relevancia !== "otro");
  const [soloSector, setSoloSector] = useState(false);
  const seleccionada = opciones.find((o) => o.valor === value);

  const bloques = useMemo(() => {
    const visibles = opciones.filter((o) => !(soloSector && o.relevancia === "otro"));
    const orden: (Relevancia | undefined)[] = ["propio", "sector", "otro", undefined];
    return orden
      .map((r) => {
        const xs = visibles.filter((o) => o.relevancia === r);
        const grupos = [...new Set(xs.map((o) => o.grupo ?? ""))];
        return { r, grupos: grupos.map((g) => ({ g, items: xs.filter((o) => (o.grupo ?? "") === g) })) };
      })
      .filter((b) => b.grupos.some((g) => g.items.length));
  }, [opciones, soloSector]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant={variant} size={size} className={cn("justify-between font-normal", className)} />}>
        <span className="flex items-center gap-1.5 truncate">{icono ?? (value === undefined && <Plus />)}{seleccionada ? seleccionada.etiqueta : textoBoton ?? placeholder}</span>
        <ChevronsUpDown className="opacity-50" />
      </PopoverTrigger>
      <PopoverContent className={cn("p-0 gap-0", ancho)} align={align}>
        <Command filter={filtro}>
          <CommandInput placeholder={placeholder} />
          {hayOtros && (
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Switch id="solo-sector" size="sm" checked={soloSector} onCheckedChange={setSoloSector} />
              <Label htmlFor="solo-sector" className="text-xs font-normal">Solo lo de esta empresa y su sector</Label>
            </div>
          )}
          <CommandList className="max-h-80">
            <CommandEmpty>{vacio}</CommandEmpty>
            {bloques.map((b, bi) => (
              <div key={b.r ?? "x"}>
                {bi > 0 && <CommandSeparator />}
                {b.grupos.map(({ g, items }) => (
                  <CommandGroup key={g} heading={[b.r ? TITULO[b.r] : "", g].filter(Boolean).join(" · ") || undefined}>
                    {items.map((o) => (
                      <CommandItem
                        key={o.valor}
                        value={`${o.etiqueta} ${o.detalle ?? ""} ${o.valor}`}
                        disabled={o.deshabilitada}
                        onSelect={() => { onSelect(o.valor); if (cerrarAlElegir) setOpen(false); }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{o.etiqueta}</div>
                          {o.detalle && <div className="text-xs text-muted-foreground truncate">{o.detalle}</div>}
                        </div>
                        {o.relevancia === "propio" && <Badge variant="secondary" className="text-[10px]">propia</Badge>}
                        {value === o.valor && <Check className="size-4" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </div>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
