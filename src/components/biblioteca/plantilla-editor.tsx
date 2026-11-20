"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Confirmar } from "@/components/app/confirmar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { guardarPlantilla, restaurarPlantillaBase } from "@/app/actions/sgsst";

/**
 * Editor de la plantilla de la consultora. Al guardar se crea su versión propia (la base de PROCESST no cambia y las
 * demás consultoras no ven el ajuste); «Volver a la base» la descarta.
 */
export function PlantillaEditor({ id, contenido, version, contrato, propia, baseCambio, base }: { id: string; contenido: string; version: number; contrato: string; propia: boolean; baseCambio: boolean; base?: string }) {
  const [txt, setTxt] = useState(contenido);
  const [pend, start] = useTransition();
  return (
    <div className="grid xl:grid-cols-[1fr_420px] gap-6 items-start">
      {baseCambio && (
        <Alert className="xl:col-span-2 border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <AlertTitle>PROCESST actualizó la base de esta plantilla después de su ajuste</AlertTitle>
          <AlertDescription>Su consultora sigue usando su versión propia. Revise la base (por ejemplo, por un cambio normativo) y, si le sirve, vuelva a la base y haga de nuevo sus ajustes.</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader><CardTitle className="flex flex-wrap items-center gap-2">Texto de la plantilla (v{version}) {propia ? <Badge>Versión propia de su consultora</Badge> : <Badge variant="outline">Base PROCESST</Badge>}</CardTitle><CardDescription>Markdown con variables {"{{empresa.razonSocial}}"}, condiciones {"{{#if …}}"} y listas {"{{#each …}}"}. Cada “## ” es una sección editable en los documentos.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <Textarea className="font-mono text-xs min-h-[60vh]" placeholder="Escriba la plantilla en Markdown; use “## ” para iniciar cada sección" value={txt} onChange={(e) => setTxt(e.target.value)} />
          <div className="flex gap-2">
            <Button disabled={pend || txt === contenido} onClick={() => start(async () => { await guardarPlantilla(id, txt); toast.success(propia ? "Plantilla guardada; regenere los documentos para aplicar el cambio" : "Se creó la versión propia de su consultora; regenere los documentos para aplicar el cambio"); })}><Save /> Guardar</Button>
            {propia && (
              <Confirmar trigger={<Button variant="outline" disabled={pend} />} titulo="Volver a la base de PROCESST" descripcion="Se descarta la versión propia de su consultora y se usa de nuevo la base (con sus actualizaciones normativas). Regenere los documentos para aplicarlo." accion="Volver a la base" onConfirm={() => start(async () => { await restaurarPlantillaBase(id); setTxt(base ?? contenido); toast.success("Su consultora usa de nuevo la base de PROCESST"); })}>
                <RotateCcw /> Volver a la base
              </Confirmar>
            )}
            <Link href="/plantillas" className={buttonVariants({ variant: "outline" })}><ArrowLeft /> Volver</Link>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Variables disponibles</CardTitle></CardHeader>
        <CardContent><ScrollArea className="h-[60vh]"><pre className="text-[11px] whitespace-pre-wrap">{contrato}</pre></ScrollArea></CardContent>
      </Card>
    </div>
  );
}
