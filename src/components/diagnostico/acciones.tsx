"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClipboardList, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { crearDiagnostico, iniciarSgsst } from "@/app/actions/diagnostico";

export function BotonNuevoDiagnostico({ empresaId, label = "Hacer diagnóstico inicial" }: { empresaId: string; label?: string }) {
  const router = useRouter();
  const [pend, start] = useTransition();
  return <Button disabled={pend} onClick={() => start(async () => { const r = await crearDiagnostico(empresaId); router.push(`/empresas/${empresaId}/diagnostico/${r.id}`); })}>{pend ? <Spinner /> : <ClipboardList />} {label}</Button>;
}

/** Inicia el SG-SST (con o sin diagnóstico): matriz, evaluación inicial, plan anual y documentos. */
export function BotonIniciarSgsst({ empresaId, diagnosticoId, label = "Iniciar el SG-SST", variant = "default" }: { empresaId: string; diagnosticoId?: string; label?: string; variant?: "default" | "outline" }) {
  const router = useRouter();
  const [pend, start] = useTransition();
  return (
    <Button variant={variant} disabled={pend} tooltip={diagnosticoId ? "Arma la matriz por cargos, crea la evaluación inicial con las respuestas del diagnóstico y su plan de mejoramiento, genera el plan anual y todos los documentos" : "Arma la matriz por cargos, genera el plan anual y todos los documentos"}
      onClick={() => start(async () => {
        const r = await iniciarSgsst(empresaId, diagnosticoId);
        if ("error" in r) { toast.error(r.error); return; }
        toast.success(`SG-SST iniciado: ${r.documentos} documentos generados${r.evaluacionId ? ", evaluación inicial y plan de mejoramiento desde el diagnóstico" : ""}.`);
        router.push(`/empresas/${empresaId}`);
      })}>{pend ? <><Spinner /> Montando el sistema…</> : <><Rocket /> {label}</>}</Button>
  );
}
