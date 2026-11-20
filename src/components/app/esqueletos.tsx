// Esqueletos de carga: muestran la forma de la pantalla mientras llegan los datos de la base de datos.
// Regla del proyecto: esqueleto para cargar datos (pantallas y secciones); spinner solo para acciones que la persona dispara
// (dentro del botón: "Guardando…", "Generando PDF…").
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Anuncio para lectores de pantalla; el esqueleto en sí es decorativo. */
function Cargando({ texto }: { texto: string }) {
  return <span className="sr-only" role="status">{texto}</span>;
}

/** Título, descripción y botón de una página (Page + PageHeader). */
export function EsqueletoEncabezado({ acciones = 1 }: { acciones?: number }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-[70vw]" />
      </div>
      <div className="flex gap-2">{Array.from({ length: acciones }, (_, i) => <Skeleton key={i} className="h-8 w-32" />)}</div>
    </div>
  );
}

/** Fila de tarjetas de indicadores (Stat). */
export function EsqueletoIndicadores({ n = 4 }: { n?: number }) {
  return (
    <div className={cn("grid grid-cols-2 gap-4", n >= 4 ? "lg:grid-cols-4" : n === 3 ? "lg:grid-cols-3" : "")}>
      {Array.from({ length: n }, (_, i) => (
        <Card key={i} className="gap-2">
          <CardHeader className="gap-2.5"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-7 w-16" /></CardHeader>
          <CardContent><Skeleton className="h-3 w-24" /></CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Tabla dentro de una tarjeta, con barra de filtros opcional. */
export function EsqueletoTabla({ filas = 8, columnas = 5, filtros = true, titulo = true }: { filas?: number; columnas?: number; filtros?: boolean; titulo?: boolean }) {
  const anchos = ["w-40", "w-28", "w-24", "w-20", "w-32", "w-16", "w-24"];
  return (
    <Card className="gap-0 py-0">
      {(titulo || filtros) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
          {titulo && <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-3.5 w-64" /></div>}
          {filtros && <div className="flex gap-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-8 w-28" /></div>}
        </div>
      )}
      <div className="flex gap-6 border-b bg-muted/30 px-6 py-3">{Array.from({ length: columnas }, (_, c) => <Skeleton key={c} className={cn("h-3.5", anchos[c % anchos.length])} />)}</div>
      {Array.from({ length: filas }, (_, f) => (
        <div key={f} className="flex items-center gap-6 border-b px-6 py-3.5 last:border-b-0">
          {Array.from({ length: columnas }, (_, c) => <Skeleton key={c} className={cn(c === 0 ? "h-4" : "h-3.5", anchos[(c + f) % anchos.length])} />)}
        </div>
      ))}
    </Card>
  );
}

/** Tarjeta con título y unas líneas de texto. */
export function EsqueletoSeccion({ lineas = 4, className }: { lineas?: number; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="gap-2"><Skeleton className="h-5 w-48" /><Skeleton className="h-3.5 w-72 max-w-full" /></CardHeader>
      <CardContent className="space-y-2.5">{Array.from({ length: lineas }, (_, i) => <Skeleton key={i} className={cn("h-3.5", i === lineas - 1 ? "w-2/3" : "w-full")} />)}</CardContent>
    </Card>
  );
}

/** Formulario: grupos de etiqueta + campo en dos columnas. */
export function EsqueletoFormulario({ campos = 8, secciones = 2 }: { campos?: number; secciones?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: secciones }, (_, s) => (
        <Card key={s}>
          <CardHeader className="gap-2"><Skeleton className="h-5 w-44" /><Skeleton className="h-3.5 w-80 max-w-full" /></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: campos }, (_, i) => <div key={i} className="space-y-2"><Skeleton className="h-3.5 w-28" /><Skeleton className="h-9 w-full" /></div>)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Documento: encabezado, avisos y bloques de texto por sección. */
export function EsqueletoDocumento() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-14 w-full rounded-lg" />
      <Card>
        <CardHeader className="gap-2.5"><Skeleton className="h-3.5 w-40" /><Skeleton className="h-6 w-96 max-w-full" /><div className="flex gap-1.5"><Skeleton className="h-5 w-24" /><Skeleton className="h-5 w-28" /><Skeleton className="h-5 w-20" /></div></CardHeader>
      </Card>
      {[5, 3, 6, 4].map((n, i) => <EsqueletoSeccion key={i} lineas={n} />)}
    </div>
  );
}

/** Lista agrupada (agenda del planeador, plan anual por mes). */
export function EsqueletoAgenda({ grupos = 3, porGrupo = 3 }: { grupos?: number; porGrupo?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: grupos }, (_, g) => (
        <div key={g} className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Card className="gap-0 py-0">
            {Array.from({ length: porGrupo }, (_, i) => (
              <div key={i} className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0">
                <Skeleton className="h-9 w-9 rounded-md" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/5" /><Skeleton className="h-3 w-2/5" /></div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

// ───────── Composiciones por tipo de pantalla ─────────

/** Página con encabezado propio (fuera de una empresa). */
export function EsqueletoPagina({ children, acciones }: { children: React.ReactNode; acciones?: number }) {
  return <div className="flex flex-1 flex-col gap-6 p-4 md:p-6"><Cargando texto="Cargando…" /><EsqueletoEncabezado acciones={acciones} />{children}</div>;
}

/** Contenido de una pestaña de empresa (el encabezado y las pestañas ya están en el layout). */
export function EsqueletoContenido({ children, texto = "Cargando…" }: { children: React.ReactNode; texto?: string }) {
  return <div className="flex flex-col gap-6"><Cargando texto={texto} />{children}</div>;
}

/** Tablero: indicadores + dos columnas de listas. */
export function EsqueletoTablero() {
  return (
    <>
      <EsqueletoIndicadores n={4} />
      <div className="grid gap-4 lg:grid-cols-5">
        <EsqueletoSeccion className="lg:col-span-3" lineas={6} />
        <EsqueletoSeccion className="lg:col-span-2" lineas={6} />
      </div>
      <EsqueletoTabla filas={4} columnas={6} filtros={false} />
    </>
  );
}
