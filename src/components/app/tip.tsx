"use client";
import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Explicación de un dato al pasar el mouse sobre él. La ayuda general va en el encabezado de la columna. */
export function Tip({ texto, children }: { texto: ReactNode; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>{children}</TooltipTrigger>
      <TooltipContent className="max-w-sm text-left">{texto}</TooltipContent>
    </Tooltip>
  );
}
