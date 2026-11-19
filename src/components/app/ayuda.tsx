"use client";
import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { AYUDA, type Ayuda as A } from "@/lib/ayuda";
import { cn } from "@/lib/utils";

/** Botón de ayuda (?) de un campo: qué es, para qué se usa, dónde encontrarlo y opciones posibles. */
export function Ayuda({ k, ayuda, className }: { k?: string; ayuda?: A; className?: string }) {
  const a = ayuda ?? (k ? AYUDA[k] : undefined);
  if (!a) return null;
  return (
    <Popover>
      <PopoverTrigger aria-label={`Ayuda: ${a.titulo}`} className={cn("inline-flex align-middle text-muted-foreground/60 hover:text-foreground transition-colors cursor-help", className)} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
        <HelpCircle className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-[26rem] text-sm max-h-[70vh] overflow-y-auto" align="start">
        <PopoverHeader>
          <PopoverTitle>{a.titulo}</PopoverTitle>
          <PopoverDescription className="text-foreground/80 leading-relaxed">{a.que}</PopoverDescription>
        </PopoverHeader>
        <dl className="space-y-2 text-xs">
          {a.para && <div><dt className="font-medium">Para qué lo usamos</dt><dd className="text-muted-foreground">{a.para}</dd></div>}
          {a.donde && <div><dt className="font-medium">Dónde encontrarlo</dt><dd className="text-muted-foreground">{a.donde}</dd></div>}
          {a.ejemplo && <div><dt className="font-medium">Ejemplo</dt><dd className="text-muted-foreground">{a.ejemplo}</dd></div>}
          {a.opciones && (
            <div>
              <dt className="font-medium mb-1">Opciones</dt>
              <dd><ul className="space-y-1">{a.opciones.map((o) => <li key={o.valor} className="text-muted-foreground"><span className="font-medium text-foreground">{o.etiqueta}</span>{o.explica && <> · {o.explica}</>}</li>)}</ul></dd>
            </div>
          )}
        </dl>
        {a.normas && a.normas.length > 0 && <div className="flex flex-wrap gap-1 pt-1"><span className="text-xs text-muted-foreground">Fuente:</span>{a.normas.map((n) => <Badge key={n} variant="secondary" className="font-normal text-[11px]">{n}</Badge>)}</div>}
      </PopoverContent>
    </Popover>
  );
}
