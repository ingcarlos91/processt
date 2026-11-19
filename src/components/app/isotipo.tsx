import { cn } from "@/lib/utils";

/** Isotipo de PROCESST (las cinco personas en círculo). */
export function Isotipo({ className, girando, ...props }: React.ComponentProps<"img"> & { girando?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/icono.png" alt="" aria-hidden draggable={false} className={cn("object-contain select-none", girando && "isotipo-girando", className)} {...props} />;
}

/** Pantalla de carga: el isotipo gira y respira, con un texto opcional. */
export function Cargando({ texto = "Cargando…", className }: { texto?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex min-h-[50vh] flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping [animation-duration:1.6s]" />
        <Isotipo girando className="relative size-14" />
      </div>
      <p className="text-sm text-muted-foreground">{texto}</p>
    </div>
  );
}
