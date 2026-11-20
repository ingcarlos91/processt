"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Scale, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Section, NormaRef } from "@/components/app/ui";
import { MODULOS_PLAZO, PLAZOS, textoPlazo, type ModuloPlazo, type ParametrosPlazos } from "@/lib/plazos";
import { guardarParametrosPlazos } from "@/app/actions/empresas";

/** Todas las tareas y fechas que el sistema programa solo: qué las genera, a cuánto tiempo y con qué norma. */
export function TablaPlazos({ parametros }: { parametros: ParametrosPlazos }) {
  const [valores, setValores] = useState<Record<string, number>>(() => Object.fromEntries(PLAZOS.filter((p) => p.editable).map((p) => [p.clave, parametros[p.clave] ?? p.cantidad])));
  const [pend, start] = useTransition();
  const cambiados = PLAZOS.filter((p) => p.editable && valores[p.clave] !== (parametros[p.clave] ?? p.cantidad));
  const guardar = () => start(async () => {
    const r = await guardarParametrosPlazos(Object.fromEntries(cambiados.map((p) => [p.clave, valores[p.clave]])));
    if ("error" in r) toast.error(r.error); else toast.success("Plazos guardados. Se aplican en el planeador, los semáforos y las fechas propuestas.");
  });
  const modulos = Object.keys(MODULOS_PLAZO) as ModuloPlazo[];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
        <p className="max-w-3xl text-muted-foreground">
          Estas son todas las tareas y fechas que PROCESST crea solo. <Badge variant="secondary" className="mx-1"><Scale /> Legal</Badge> lo fija la norma y no se cambia.
          <Badge variant="outline" className="mx-1"><Building2 /> Empresa</Badge> es criterio de la consultora: ajústelo aquí. Cada formulario que crea una de estas tareas lo avisa antes de guardar.
        </p>
        <Button size="sm" disabled={pend || !cambiados.length} onClick={guardar} tooltip="Guarda los plazos de criterio de la empresa"><Save /> Guardar cambios{cambiados.length ? ` (${cambiados.length})` : ""}</Button>
      </div>
      {modulos.map((m) => {
        const xs = PLAZOS.filter((p) => p.modulo === m);
        if (!xs.length) return null;
        return (
          <Section key={m} title={MODULOS_PLAZO[m].t} contentClassName="px-0">
            <Table className="[&_td]:whitespace-normal [&_td]:align-top">
              <TableHeader><TableRow><TableHead className="pl-6 w-[26%]">Tarea que se crea</TableHead><TableHead className="w-[26%]">La genera</TableHead><TableHead className="w-[22%]">Plazo</TableHead><TableHead className="pr-6">Sustento</TableHead></TableRow></TableHeader>
              <TableBody>
                {xs.map((p) => (
                  <TableRow key={p.clave}>
                    <TableCell className="pl-6 font-medium">{p.tarea}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.cuando}</TableCell>
                    <TableCell className="text-sm">
                      {p.editable ? (
                        <div className="flex items-center gap-2">
                          <Input type="number" className="h-8 w-20" min={p.editable.min} max={p.editable.max} placeholder={String(p.cantidad)} value={valores[p.clave] ?? ""} onChange={(e) => setValores({ ...valores, [p.clave]: Number(e.target.value) })} aria-label={`Plazo: ${p.tarea}`} />
                          <span className="text-muted-foreground">{p.unidad === "dias_habiles" ? "días hábiles" : p.unidad === "dias" ? "días" : p.unidad === "meses" ? "meses" : "años"}</span>
                        </div>
                      ) : <span className="font-medium">{textoPlazo(p, parametros)}</span>}
                      <div className="mt-1 text-xs text-muted-foreground">{p.unidad === "fecha" ? p.desde : `desde ${p.desde}`}{p.nota ? `. ${p.nota}` : ""}</div>
                    </TableCell>
                    <TableCell className="pr-6">
                      <Badge variant={p.tipo === "legal" ? "secondary" : "outline"} className="mb-1">{p.tipo === "legal" ? <><Scale /> Legal</> : <><Building2 /> Empresa</>}</Badge>
                      {p.norma && <div><NormaRef>{p.norma}</NormaRef></div>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        );
      })}
    </div>
  );
}
