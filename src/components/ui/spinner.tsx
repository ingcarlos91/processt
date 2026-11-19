import { cn } from "cn"

/** Indicador de carga con el isotipo de PROCESST. */
function Spinner({ className, ...props }: React.ComponentProps<"img">) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/icono.png" alt="" data-slot="spinner" role="status" aria-label="Cargando" className={cn("size-4 isotipo-girando object-contain", className)} {...props} />
  )
}

export { Spinner }
