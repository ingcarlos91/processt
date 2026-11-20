"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/**
 * Botón «Proponer con IA»: llama a una acción que devuelve una propuesta y la entrega al formulario para que la
 * consultora la revise y ajuste (nunca se guarda sola).
 */
export function BotonIA<T extends object>({ accion, onPropuesta, children = "Proponer con IA", tooltip, size = "xs", disabled }: {
  accion: () => Promise<T | { error: string }>; onPropuesta: (r: T) => void; children?: React.ReactNode; tooltip?: string; size?: "xs" | "sm"; disabled?: boolean;
}) {
  const [pend, start] = useTransition();
  return (
    <Button type="button" variant="outline" size={size} disabled={pend || disabled} tooltip={tooltip ?? "La IA propone un texto; revíselo y ajústelo antes de guardar"}
      onClick={() => start(async () => {
        const r = await accion();
        if ("error" in r) { toast.error(r.error); return; }
        onPropuesta(r as T);
        toast.success("Propuesta lista: revísela y ajústela antes de guardar");
      })}>
      {pend ? <Spinner /> : <Sparkles />} {pend ? "Pensando…" : children}
    </Button>
  );
}
