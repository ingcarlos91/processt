"use client";
import { useState } from "react";
import { ChevronDown, CircleCheck, CircleAlert, Scale } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NormaRef } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export type RequisitoUI = { id: string; texto: string; cita: string; seccion: string; cubierto: boolean; motivo?: string };

/** Qué exige la norma para este documento y qué sección lo cubre. Si una edición borra o vacía una sección exigida, lo avisa. */
export function SustentoNormativo({ requisitos }: { requisitos: RequisitoUI[] }) {
  const faltan = requisitos.filter((r) => !r.cubierto);
  const [abierto, setAbierto] = useState(faltan.length > 0);
  if (!requisitos.length) return null;
  const ok = !faltan.length;
  return (
    <Collapsible open={abierto} onOpenChange={setAbierto}>
      <Alert className={cn(ok ? "border-emerald-200 bg-emerald-50/50" : "border-amber-200 bg-amber-50/60")}>
        {ok ? <Scale className="text-emerald-600" /> : <CircleAlert className="text-amber-600" />}
        <AlertTitle className="flex items-center justify-between gap-2">
          <span>Sustento normativo: {requisitos.length - faltan.length} de {requisitos.length} requisitos cubiertos</span>
          <CollapsibleTrigger className="inline-flex cursor-pointer items-center gap-1 text-xs font-normal text-muted-foreground hover:text-foreground">
            {abierto ? "Ocultar" : "Ver requisitos"} <ChevronDown className={cn("size-3.5 transition-transform", abierto && "rotate-180")} />
          </CollapsibleTrigger>
        </AlertTitle>
        <AlertDescription>
          {ok ? "El documento contiene todo lo que exige la norma, sección por sección." : "Una o más secciones exigidas por la norma faltan o quedaron vacías. Restáurelas antes de aprobar."}
          <CollapsibleContent>
            <ul className="mt-3 space-y-2">
              {requisitos.map((r) => (
                <li key={r.id} className="flex items-start gap-2 text-sm text-foreground">
                  {r.cubierto ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />}
                  <div className="min-w-0 space-y-0.5">
                    <p>{r.texto} <NormaRef>{r.cita}</NormaRef></p>
                    <p className="text-xs text-muted-foreground">{r.cubierto ? `Sección: ${r.seccion}` : r.motivo}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </AlertDescription>
      </Alert>
    </Collapsible>
  );
}
