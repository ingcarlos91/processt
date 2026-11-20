"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { generarTodo } from "@/app/actions/sgsst";

export function BotonGenerarTodo({ empresaId, label = "Generar / actualizar todos los documentos" }: { empresaId: string; label?: string }) {
  const [pend, start] = useTransition();
  return (
    <Button tooltip="Úselo después de cambiar la matriz de peligros, la evaluación o el plan anual. Los cambios en Datos y Comités se aplican solos. Sus ediciones manuales se conservan." disabled={pend} onClick={() => start(async () => {
      const r = await generarTodo(empresaId);
      toast.success(`${r.total} documentos generados${r.revisar ? `; ${r.revisar} secciones editadas requieren revisión` : ""}.`);
    })}>
      {pend ? <><Spinner /> Generando los documentos…</> : <><Sparkles /> {label}</>}
    </Button>
  );
}
