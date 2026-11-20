"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, FileDown, Lock, LockOpen, Minus, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { SubirArchivo, ListaArchivos, type ArchivoUI } from "@/components/app/adjuntos";
import { BotonIniciarSgsst } from "@/components/diagnostico/acciones";
import { CICLOS, calcularDiagnostico, type EstadoDiag, type ItemDiag } from "@/lib/diagnostico";
import { permiteNoAplica } from "@/lib/evaluacion";
import * as A from "@/app/actions/diagnostico";
import { cn } from "@/lib/utils";

type D = { id: string; fecha: string; nivel: number; estado: string; conclusiones: string; items: ItemDiag[]; iniciado: boolean; archivos: ArchivoUI[] };
const EST: Record<Exclude<EstadoDiag, "">, { t: string; c: string; i: typeof Check }> = {
  cumple: { t: "Cumple", c: "border-emerald-500 bg-emerald-500 text-white", i: Check },
  no_cumple: { t: "No cumple", c: "border-red-500 bg-red-500 text-white", i: X },
  no_aplica: { t: "No aplica", c: "border-slate-400 bg-slate-400 text-white", i: Minus },
};
const tono = (p: number | null) => (p == null ? undefined : p < 60 ? ("bad" as const) : p <= 85 ? ("warn" as const) : ("ok" as const));

export function DiagnosticoEditor({ empresaId, d, etapa, profesional, licencia = "" }: { empresaId: string; d: D; etapa: string; profesional: string; licencia?: string }) {
  const router = useRouter();
  const [pend, start] = useTransition();
  const [items, setItems] = useState(d.items);
  const [conclusiones, setConclusiones] = useState(d.conclusiones);
  const [fecha, setFecha] = useState(d.fecha);
  const [filtro, setFiltro] = useState<"todos" | "pendientes" | "no_cumple">("todos");
  const cerrado = d.estado === "cerrado";
  const cal = useMemo(() => calcularDiagnostico(items, d.nivel), [items, d.nivel]);
  const cambio = JSON.stringify(items) !== JSON.stringify(d.items) || conclusiones !== d.conclusiones || fecha !== d.fecha;
  const set = (codigo: string, x: Partial<ItemDiag>) => setItems(items.map((i) => (i.codigo === codigo ? { ...i, ...x } : i)));
  const guardar = (despues?: () => Promise<void>) => start(async () => {
    const r = await A.guardarDiagnostico(empresaId, d.id, { items, conclusiones, fecha });
    if ("error" in r) { toast.error(r.error); return; }
    if (despues) await despues(); else toast.success("Diagnóstico guardado");
    router.refresh();
  });
  const visibles = items.filter((i) => filtro === "todos" || (filtro === "pendientes" ? !i.estado : i.estado === "no_cumple"));

  return (
    <div className="space-y-5">
      {etapa === "diagnostico" && (
        <Alert>
          <AlertTitle>Empresa en etapa de diagnóstico</AlertTitle>
          <AlertDescription>Evalúe cada estándar, cierre el diagnóstico y descargue el informe en PDF con el membrete de la consultora. Cuando el cliente continúe, inicie el SG-SST desde aquí: las respuestas pasan a la evaluación inicial. También puede iniciarlo sin diagnóstico.</AlertDescription>
        </Alert>
      )}

      {!licencia && (
        <Alert variant="destructive">
          <AlertTitle>Falta la licencia en SST de quien firma el informe</AlertTitle>
          <AlertDescription>La evaluación de los estándares la hace personal idóneo con licencia en SST (Res. 0312/2019 art. 16, estándar 2.3.1). Regístrela en Mi consultora; mientras tanto el informe sale con la advertencia.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">Diagnóstico inicial</h2>
        <Badge variant={cerrado ? "default" : "outline"}>{cerrado ? "Cerrado" : "En curso"}</Badge>
        {d.iniciado && <Badge variant="secondary">SG-SST iniciado desde este diagnóstico</Badge>}
        <div className="flex-1" />
        <BotonDescarga href={`/api/empresas/${empresaId}/diagnosticos/${d.id}/informe`} variant="outline" texto="Generando informe…" tooltip={`Informe en PDF con el membrete de la consultora y la firma de ${profesional || "la profesional"} (configúrela en Mi consultora)`}><FileDown /> Informe PDF</BotonDescarga>
        {!cerrado && <Button disabled={pend || !cambio} onClick={() => guardar()}>{pend ? <Spinner /> : <Save />} Guardar</Button>}
        {!cerrado && <Button variant="outline" disabled={pend} onClick={() => guardar(async () => { const r = await A.cerrarDiagnostico(empresaId, d.id); if ("error" in r) toast.error(r.error); else toast.success("Diagnóstico cerrado. Descargue el informe e inicie el SG-SST cuando el cliente continúe."); })}><Lock /> Cerrar diagnóstico</Button>}
        {cerrado && !d.iniciado && <Button variant="outline" disabled={pend} onClick={() => start(async () => { const r = await A.reabrirDiagnostico(empresaId, d.id); if ("error" in r) toast.error(r.error); else router.refresh(); })}><LockOpen /> Reabrir</Button>}
        {cerrado && !d.iniciado && <BotonIniciarSgsst empresaId={empresaId} diagnosticoId={d.id} label="Iniciar el SG-SST con este diagnóstico" />}
        {!cerrado && etapa === "diagnostico" && <BotonIniciarSgsst empresaId={empresaId} variant="outline" label="Iniciar sin diagnóstico" />}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Stat label="Puntaje" value={`${cal.puntaje}%`} hint={cal.valoracion} tone={tono(cal.puntaje)} />
        <Stat label="Evaluados" value={`${cal.evaluados} / ${cal.total}`} hint={<Progress value={(cal.evaluados / Math.max(1, cal.total)) * 100} />} />
        {CICLOS.map((x) => <Stat key={x.k} label={x.t} value={cal.porCiclo[x.k]?.pct == null ? "—" : `${cal.porCiclo[x.k].pct}%`} hint={`${cal.porCiclo[x.k]?.noCumple ?? 0} brecha(s)`} tone={tono(cal.porCiclo[x.k]?.pct ?? null)} />)}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Fecha del diagnóstico</span>
        <Input type="date" className="w-44" disabled={cerrado} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        <div className="flex-1" />
        {(["todos", "pendientes", "no_cumple"] as const).map((f) => <Button key={f} size="sm" variant={filtro === f ? "secondary" : "ghost"} onClick={() => setFiltro(f)}>{f === "todos" ? `Todos (${items.length})` : f === "pendientes" ? `Sin evaluar (${items.filter((i) => !i.estado).length})` : `No cumple (${items.filter((i) => i.estado === "no_cumple").length})`}</Button>)}
        {!cerrado && <Button size="sm" variant="ghost" onClick={() => setItems(items.map((i) => (i.estado ? i : { ...i, estado: "no_cumple" })))} tooltip="Marca como “no cumple” los estándares que falten por evaluar">Pendientes → no cumple</Button>}
      </div>

      {CICLOS.map((ciclo) => {
        const xs = visibles.filter((i) => i.ciclo === ciclo.k);
        if (!xs.length) return null;
        return (
          <Section key={ciclo.k} title={`${ciclo.t}`} description={ciclo.d} actions={<NormaRef>Res. 0312/2019</NormaRef>} contentClassName="space-y-2">
            {xs.map((it) => (
              <div key={it.codigo} className={cn("rounded-lg border p-3", it.estado === "no_cumple" && "border-red-200 bg-red-50/40", it.estado === "cumple" && "border-emerald-200 bg-emerald-50/30")}>
                <div className="flex flex-wrap items-start gap-3">
                  <span className="w-12 shrink-0 font-mono text-xs text-muted-foreground">{it.codigo}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{it.descripcion}</div>
                    {it.modo && <div className="mt-0.5 text-xs text-muted-foreground">Qué verificar: {it.modo}</div>}
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Peso: {it.puntaje}</div>
                  </div>
                  <div className="flex gap-1">
                    {(Object.keys(EST) as Exclude<EstadoDiag, "">[]).filter((k) => k !== "no_aplica" || permiteNoAplica(d.nivel) || it.estado === "no_aplica").map((k) => { const E = EST[k]; const on = it.estado === k; return (
                      <button key={k} type="button" disabled={cerrado} onClick={() => set(it.codigo, { estado: on ? "" : k })} className={cn("inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed", on ? E.c : "bg-background hover:bg-muted")}><E.i className="size-3.5" />{E.t}</button>
                    ); })}
                  </div>
                </div>
                {!permiteNoAplica(d.nivel) && it.estado === "no_aplica" && <p className="mt-2 text-xs text-destructive">En 60 estándares no existe «no aplica» (Res. 0312/2019 arts. 16 y 27): cuenta como no cumplido. Márquelo «cumple» o «no cumple».</p>}
                {(it.estado && it.estado !== "cumple" || it.observacion) && (
                  <Input className="mt-2" disabled={cerrado} value={it.observacion} placeholder={it.estado === "no_aplica" ? "Justificación (obligatoria para “no aplica”)" : "Qué se encontró (aparece en el informe)"} onChange={(e) => set(it.codigo, { observacion: e.target.value })} />
                )}
              </div>
            ))}
          </Section>
        );
      })}

      <Section title="Conclusiones de la consultora" description="Aparecen en el informe, antes de la firma.">
        <Textarea rows={4} disabled={cerrado} value={conclusiones} placeholder="Situación general, riesgos legales y operativos, prioridades y recomendación de trabajo." onChange={(e) => setConclusiones(e.target.value)} />
      </Section>

      <Section title="Fotos y soportes de la visita" actions={<SubirArchivo empresaId={empresaId} ctx={{ tipo: "EVIDENCIA", diagnosticoId: d.id }} titulo="Subir foto o soporte" trigger={<Button size="sm"><Plus /> Subir</Button>} descripcionInicial="Diagnóstico inicial" />}>
        <ListaArchivos empresaId={empresaId} archivos={d.archivos} vacio="Sin soportes." />
      </Section>
    </div>
  );
}
