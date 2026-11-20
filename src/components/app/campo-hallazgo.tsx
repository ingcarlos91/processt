"use client";
import { useId } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

/**
 * Campo de texto de un ítem calificado (diagnóstico, autoevaluación, auditoría): etiqueta visible que cambia según la
 * calificación, fondo blanco con borde, marca de obligatorio y, si está cerrado, el texto como lectura (no un campo gris).
 */
export function CampoHallazgo({
  etiqueta, ayuda, value, defaultValue, onChange, onBlur, placeholder, obligatorio, soloLectura, className, rows = 2,
}: {
  etiqueta: string;
  ayuda?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  onBlur?: (v: string) => void;
  placeholder?: string;
  obligatorio?: boolean;
  soloLectura?: boolean;
  className?: string;
  rows?: number;
}) {
  const id = useId();
  const texto = (value ?? defaultValue ?? "").trim();
  const falta = !!obligatorio && !texto;
  if (soloLectura) {
    return (
      <div className={cn("rounded-md border bg-background px-3 py-2", className)}>
        <div className="text-xs font-medium text-muted-foreground">{etiqueta}</div>
        <p className={cn("mt-0.5 whitespace-pre-wrap text-sm", !texto && "italic text-muted-foreground")}>{texto || "Sin registrar"}</p>
      </div>
    );
  }
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-foreground">
        {etiqueta}
        {obligatorio && <span className={cn("rounded px-1.5 py-px text-[10px] font-medium", falta ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-muted text-muted-foreground")}>Obligatorio</span>}
        {ayuda && <span className="font-normal text-muted-foreground">{ayuda}</span>}
      </label>
      <Textarea
        id={id}
        rows={rows}
        className={cn("min-h-14 bg-background text-sm", falta && "border-red-300 focus-visible:ring-red-200")}
        aria-invalid={falta || undefined}
        placeholder={placeholder}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
      />
    </div>
  );
}
