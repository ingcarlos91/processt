import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Porque } from "@/components/app/porque";

/** Encabezado de página (título, descripción y acciones). */
export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        {description && <p className="text-muted-foreground text-sm max-w-3xl text-pretty">{description}</p>}
      </div>
      {actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">{actions}</div>}
    </div>
  );
}

/** Contenedor de página con espaciado estándar. */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-1 flex-col gap-6 p-4 md:p-6", className)}>{children}</div>;
}

/** Sección = Card de shadcn con título, descripción y acciones. */
export function Section({ title, description, children, actions, className, contentClassName }: { title?: ReactNode; description?: ReactNode; children: ReactNode; actions?: ReactNode; className?: string; contentClassName?: string }) {
  return (
    <Card className={className}>
      {(title || description || actions) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {actions && <CardAction>{actions}</CardAction>}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

/** Indicador (patrón "section cards" del bloque dashboard-01). */
export function Stat({ label, value, hint, tone, porque, normas }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "ok" | "warn" | "bad"; porque?: ReactNode; normas?: string[] }) {
  const c = tone === "ok" ? "text-emerald-600" : tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-destructive" : "";
  return (
    <Card className="@container/card min-w-0 gap-2">
      <CardHeader className="gap-1.5">
        <CardDescription className="flex items-start gap-1 text-xs leading-snug text-pretty @[12rem]/card:text-sm"><span className="min-w-0">{label}</span>{porque && <Porque titulo={label} normas={normas} className="mt-0.5 shrink-0">{porque}</Porque>}</CardDescription>
        <CardTitle className={cn("text-2xl font-semibold tabular-nums leading-none @[14rem]/card:text-3xl", c)}>{value}</CardTitle>
      </CardHeader>
      {hint && <CardFooter className="min-h-9 py-2 text-muted-foreground text-xs leading-snug [&>*]:min-w-0">{hint}</CardFooter>}
    </Card>
  );
}

/** Referencia normativa. */
export function NormaRef({ children }: { children: ReactNode }) {
  return <Badge variant="secondary" className="font-normal text-[11px] text-sky-800 bg-sky-50 dark:bg-sky-950 dark:text-sky-200">{children}</Badge>;
}
