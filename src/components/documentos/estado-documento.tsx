"use client";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ESTADOS_DOC, type EstadoDoc } from "@/lib/estado-documento";
import { cn } from "@/lib/utils";

/** Insignia de estado del documento con su explicación y el siguiente paso al pasar el mouse. */
export function EstadoDocumento({ estado, version, firmadoVersion, className }: { estado: EstadoDoc; version?: number; firmadoVersion?: number | null; className?: string }) {
  const e = ESTADOS_DOC[estado];
  const extra = estado === "firmado" && firmadoVersion ? ` v${firmadoVersion}` : estado === "volver_a_firmar" && firmadoVersion && version ? ` (firmado v${firmadoVersion}, vigente v${version})` : "";
  return (
    <Tooltip>
      <TooltipTrigger render={<span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium", e.clase, className)} />}>
        <span className={cn("size-1.5 rounded-full", e.punto)} />{e.t}{extra}
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left">
        <div className="font-medium">{e.t}</div>
        <div className="mt-0.5 opacity-90">{e.que}</div>
        <div className="mt-1.5 opacity-90"><span className="font-medium">Siguiente paso:</span> {e.siguiente}</div>
      </TooltipContent>
    </Tooltip>
  );
}
