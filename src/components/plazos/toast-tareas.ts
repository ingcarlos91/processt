"use client";
import { toast } from "sonner";
import type { TareaAviso } from "@/components/plazos/aviso-tareas";

/** Toast de confirmación al guardar: qué se programó y para cuándo. */
export function toastTareas(titulo: string, tareas: TareaAviso[], sinTareas?: string) {
  const desc = tareas.length
    ? `Se programó en el planeador: ${tareas.map((t) => (t.fecha ? `${t.tarea} (${t.fecha})` : `${t.tarea} (${t.plazo})`)).join("; ")}.`
    : sinTareas;
  toast.success(titulo, { description: desc, duration: 10000 });
}
