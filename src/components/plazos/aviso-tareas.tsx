import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { NormaRef } from "@/components/app/ui";
import { cn } from "@/lib/utils";

export type TareaAviso = {
  /** Tarea que se crea. */
  tarea: string;
  /** "2 días hábiles desde la fecha del accidente". */
  plazo: string;
  /** Fecha concreta, si ya se puede calcular. */
  fecha?: string;
  norma?: string;
  tipo?: "legal" | "empresa";
};

/**
 * Aviso en los formularios: qué tareas o fechas crea el sistema al guardar, a cuánto tiempo y con qué norma.
 * Las cantidades salen del catálogo de plazos (Normas y estándares → Plazos y tareas automáticas).
 */
export function AvisoTareas({ tareas, titulo = "Al guardar se programa en el planeador", className }: { tareas: TareaAviso[]; titulo?: string; className?: string }) {
  if (!tareas.length) return null;
  return (
    <div className={cn("rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-2.5 text-sm dark:border-sky-900 dark:bg-sky-950/40", className)}>
      <div className="mb-1.5 flex items-center gap-2 font-medium text-sky-900 dark:text-sky-100"><CalendarClock className="size-4" /> {titulo}</div>
      <ul className="space-y-1.5">
        {tareas.map((t) => (
          <li key={t.tarea} className="leading-snug">
            <span className="font-medium">{t.tarea}</span>
            {t.fecha ? <> — vence el <span className="font-medium">{t.fecha}</span></> : null}
            <span className="text-muted-foreground"> ({t.plazo}{t.tipo === "empresa" ? ", criterio de la empresa" : ""})</span>
            {t.norma && <> <NormaRef>{t.norma}</NormaRef></>}
          </li>
        ))}
      </ul>
      <div className="mt-1.5 text-xs text-muted-foreground">Plazos completos en <Link className="underline underline-offset-2" href="/normas?tab=plazos">Normas y estándares → Plazos y tareas automáticas</Link>.</div>
    </div>
  );
}
