"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generarTodo } from "@/app/actions/sgsst";

export function BotonGenerarTodo({ empresaId, label = "Generar / actualizar todos los documentos" }: { empresaId: string; label?: string }) {
  const [pend, start] = useTransition();
  return (
    <Button disabled={pend} onClick={() => start(async () => {
      const r = await generarTodo(empresaId);
      toast.success(`${r.total} documentos generados${r.revisar ? `; ${r.revisar} secciones editadas requieren revisión` : ""}.`);
    })}>
      <Sparkles /> {pend ? "Generando…" : label}
    </Button>
  );
}
