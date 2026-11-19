"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { guardarPlantilla } from "@/app/actions/sgsst";

export function PlantillaEditor({ id, contenido, version, contrato }: { id: string; contenido: string; version: number; contrato: string }) {
  const [txt, setTxt] = useState(contenido);
  const [pend, start] = useTransition();
  return (
    <div className="grid xl:grid-cols-[1fr_420px] gap-6 items-start">
      <Card>
        <CardHeader><CardTitle>Texto de la plantilla (v{version})</CardTitle><CardDescription>Markdown con variables {"{{empresa.razonSocial}}"}, condiciones {"{{#if …}}"} y listas {"{{#each …}}"}. Cada “## ” es una sección editable en los documentos.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <Textarea className="font-mono text-xs min-h-[60vh]" value={txt} onChange={(e) => setTxt(e.target.value)} />
          <div className="flex gap-2">
            <Button disabled={pend || txt === contenido} onClick={() => start(async () => { await guardarPlantilla(id, txt); toast.success("Plantilla guardada; regenere los documentos para aplicar el cambio"); })}><Save /> Guardar</Button>
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
