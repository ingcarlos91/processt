import Link from "next/link";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Faltante } from "@/lib/completitud";

/** Lista de datos faltantes agrupados, con dónde se llenan y los documentos que afectan. */
export function ListaFaltantes({ faltantes, mostrarDocs = true }: { faltantes: Faltante[]; mostrarDocs?: boolean }) {
  const grupos = [...new Set(faltantes.map((f) => f.grupo))];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {grupos.map((g) => {
        const xs = faltantes.filter((f) => f.grupo === g);
        return (
          <div key={g} className="rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{g}</span>
              <Link href={xs[0].href} className={buttonVariants({ size: "xs", variant: "outline" })}>{xs[0].boton}</Link>
            </div>
            <ul className="space-y-1.5 text-sm">
              {xs.map((f) => (
                <li key={f.id}>
                  <Link href={f.href} className="hover:underline">{f.dato}</Link>
                  {f.detalle && <span className="text-muted-foreground"> — {f.detalle}</span>}
                  {mostrarDocs && <div className="mt-0.5 flex flex-wrap gap-1">{f.docs.map((d) => <Badge key={d} variant="outline" className="font-mono text-[10px]">{d}</Badge>)}</div>}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** Aviso en un documento: qué datos le faltan y dónde se llenan. */
export function AvisoFaltantesDocumento({ faltantes }: { faltantes: Faltante[] }) {
  if (!faltantes.length) return (
    <Alert className="border-emerald-200 bg-emerald-50/50"><CheckCircle2 className="text-emerald-600" /><AlertTitle>Datos completos</AlertTitle><AlertDescription>Todos los datos que usa este documento están registrados en PROCESST.</AlertDescription></Alert>
  );
  return (
    <Alert className="border-amber-200 bg-amber-50/50">
      <ClipboardList className="text-amber-600" />
      <AlertTitle>A este documento le faltan {faltantes.length} dato(s); por eso aparecen espacios en blanco o «Por definir»</AlertTitle>
      <AlertDescription>
        <ul className="mt-1 space-y-0.5">
          {faltantes.map((f) => <li key={f.id}><Link href={f.href} className="font-medium underline underline-offset-2">{f.dato}</Link>{f.detalle ? ` — ${f.detalle}` : ""} <span className="text-muted-foreground">({f.grupo})</span></li>)}
        </ul>
        <p className="mt-1">Al guardarlos, el documento se actualiza solo; sus ediciones manuales se conservan.</p>
      </AlertDescription>
    </Alert>
  );
}
