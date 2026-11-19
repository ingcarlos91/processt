"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Section } from "@/components/app/ui";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { guardarCumplimientoLegal } from "@/app/actions/sgsst";
import { cn } from "@/lib/utils";

type Norma = { codigo: string; titulo: string; evidenciaSugerida: string };
type Eval = Record<string, { cumple?: string; evidencia?: string }>;
const OPC = [{ v: "Sí", c: "border-emerald-500 bg-emerald-500 text-white" }, { v: "Parcial", c: "border-amber-500 bg-amber-500 text-white" }, { v: "No", c: "border-red-500 bg-red-500 text-white" }];

/** Evaluación de cumplimiento de cada requisito legal (Decreto 1072/2015 art. 2.2.4.6.8 num. 2 y par.). Alimenta la columna «Cumple» de MTZ-01. */
export function CumplimientoLegal({ empresaId, normas, inicial }: { empresaId: string; normas: Norma[]; inicial: Eval }) {
  const router = useRouter();
  const [pend, start] = useTransition();
  const [ev, setEv] = useState<Eval>(inicial);
  const set = (c: string, x: { cumple?: string; evidencia?: string }) => setEv({ ...ev, [c]: { ...ev[c], ...x } });
  const evaluadas = useMemo(() => normas.filter((n) => ev[n.codigo]?.cumple).length, [ev, normas]);
  const cambio = JSON.stringify(ev) !== JSON.stringify(inicial);
  return (
    <Section title={`Evaluación de cumplimiento legal (${evaluadas} de ${normas.length})`} description="Marque si la empresa cumple cada requisito y con qué evidencia. Llena la columna «Cumple» de la matriz legal; sin evaluar aparece «Por evaluar»."
      actions={<Button size="sm" disabled={pend || !cambio} onClick={() => start(async () => { await guardarCumplimientoLegal(empresaId, ev); toast.success("Evaluación guardada; MTZ-01 actualizada."); router.refresh(); })}>{pend ? <Spinner /> : <Save />} Guardar</Button>}>
      <Table>
        <TableHeader><TableRow><TableHead>Norma</TableHead><TableHead className="w-56">Cumple</TableHead><TableHead>Evidencia</TableHead></TableRow></TableHeader>
        <TableBody>
          {normas.map((n) => (
            <TableRow key={n.codigo}>
              <TableCell className="max-w-80 whitespace-normal text-sm">{n.titulo}</TableCell>
              <TableCell>
                <div className="flex gap-1">{OPC.map((o) => { const on = ev[n.codigo]?.cumple === o.v; return <button key={o.v} type="button" onClick={() => set(n.codigo, { cumple: on ? "" : o.v })} className={cn("h-7 rounded-md border px-2.5 text-xs font-medium", on ? o.c : "bg-background hover:bg-muted")}>{o.v}</button>; })}</div>
              </TableCell>
              <TableCell><Input className="h-8" value={ev[n.codigo]?.evidencia ?? ""} placeholder={n.evidenciaSugerida || "Evidencia revisada"} onChange={(e) => set(n.codigo, { evidencia: e.target.value })} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Section>
  );
}
