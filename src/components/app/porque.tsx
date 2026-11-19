"use client";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Ícono gris que explica, en lenguaje sencillo, por qué el sistema tomó una decisión. */
export function Porque({ titulo = "¿Por qué?", children, normas, pasos, className }: { titulo?: string; children?: ReactNode; normas?: (string | null | undefined)[]; pasos?: string[]; className?: string }) {
  const ns = (normas ?? []).filter(Boolean) as string[];
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Ver por qué"
        className={cn("inline-flex align-middle text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <Info className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent className="w-96 text-sm" align="start">
        <PopoverHeader>
          <PopoverTitle>{titulo}</PopoverTitle>
          {children && <PopoverDescription className="text-foreground/80 leading-relaxed">{children}</PopoverDescription>}
        </PopoverHeader>
        {pasos && pasos.length > 0 && (
          <ol className="list-decimal pl-5 space-y-1 text-xs text-muted-foreground">{pasos.map((p, i) => <li key={i}>{p}</li>)}</ol>
        )}
        {ns.length > 0 && <div className="flex flex-wrap gap-1 pt-1"><span className="text-xs text-muted-foreground">Fuente:</span>{ns.map((n) => <Badge key={n} variant="secondary" className="font-normal text-[11px]">{n}</Badge>)}</div>}
      </PopoverContent>
    </Popover>
  );
}
