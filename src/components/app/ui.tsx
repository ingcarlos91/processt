import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Porque } from "@/components/app/porque";

/** Encabezado de página (título, descripción y acciones). */
export function PageHeader({ title, description, actions }: { title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm max-w-3xl">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
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
    <Card className="@container/card gap-2">
      <CardHeader>
        <CardDescription className="flex items-center gap-1">{label}{porque && <Porque titulo={label} normas={normas}>{porque}</Porque>}</CardDescription>
        <CardTitle className={cn("text-2xl font-semibold tabular-nums", c)}>{value}</CardTitle>
      </CardHeader>
      {hint && <CardFooter className="text-muted-foreground text-xs">{hint}</CardFooter>}
    </Card>
  );
}

/** Referencia normativa. */
export function NormaRef({ children }: { children: ReactNode }) {
  return <Badge variant="secondary" className="font-normal text-[11px] text-sky-800 bg-sky-50 dark:bg-sky-950 dark:text-sky-200">{children}</Badge>;
}
