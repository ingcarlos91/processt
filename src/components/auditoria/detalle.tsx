"use client";
import { FilaAccion, type AccionUI } from "@/components/acciones/fila-accion";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, CircleAlert, Database, Download, Eye, FileDown, Lock, LockOpen, Minus, Plus, Save, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldLabel } from "@/components/ui/field";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Pedir } from "@/components/app/confirmar";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { SubirArchivo, ListaArchivos, type ArchivoUI } from "@/components/app/adjuntos";
import { resumenAuditoria, type ItemAuditoria, type ResultadoAud } from "@/lib/auditoria";
import * as A from "@/app/actions/auditoria";
import { cn, hoyLocal } from "@/lib/utils";

type Aud = { id: string; anio: number; fechaInicio: string; fechaCierre: string; auditor: string; auditorPerfil: string; participantes: string; alcance: string; estado: string; conclusiones: string; items: ItemAuditoria[]; acciones: AccionUI[]; archivos: ArchivoUI[] };
const RES: Record<Exclude<ResultadoAud, "">, { t: string; c: string; i: typeof Check }> = {
  conforme: { t: "Conforme", c: "border-emerald-500 bg-emerald-500 text-white", i: Check },
  observacion: { t: "Observación", c: "border-amber-500 bg-amber-500 text-white", i: Eye },
  no_conforme: { t: "No conforme", c: "border-red-500 bg-red-500 text-white", i: X },
  na: { t: "N. A.", c: "border-slate-400 bg-slate-400 text-white", i: Minus },
};
const en30 = () => hoyLocal(30);
const fecha = (f: string) => (f ? new Date(f + "T12:00:00Z").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "");

export function AuditoriaDetalle({ empresaId, a, sistema, responsables }: { empresaId: string; a: Aud; sistema: Record<number, string>; responsables: string[] }) {
  const router = useRouter();
  const [pend, start] = useTransition();
  const [items, setItems] = useState(a.items);
  const [conclusiones, setConclusiones] = useState(a.conclusiones);
  const cerrada = a.estado === "cerrada";
  const r = resumenAuditoria(items);
  const calificados = items.filter((i) => i.resultado).length;
  const set = (n: number, x: Partial<ItemAuditoria>) => setItems((items) => items.map((i) => (i.n === n ? { ...i, ...x } : i)));
  const cambio = JSON.stringify(items) !== JSON.stringify(a.items) || conclusiones !== a.conclusiones;
  const guardar = (msg = "Auditoría guardada", despues?: () => Promise<void>) => start(async () => {
    const res = await A.guardarAuditoria(empresaId, a.id, { items, conclusiones });
    if ("error" in res) { toast.error(res.error); return; }
    if (despues) await despues(); else toast.success(msg);
    router.refresh();
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/empresas/${empresaId}/auditoria`} className={buttonVariants({ variant: "ghost", size: "sm" })}><ArrowLeft /> Auditorías</Link>
        <div className="flex-1" />
        <BotonDescarga href={`/api/empresas/${empresaId}/auditorias/${a.id}/informe`} variant="outline" tooltip="Informe de auditoría en Word, para firmar"><Download /> Informe Word</BotonDescarga>
        <BotonDescarga href={`/api/empresas/${empresaId}/auditorias/${a.id}/informe?formato=pdf`} variant="outline" texto="Generando PDF…" tooltip="Informe de auditoría en PDF"><FileDown /> PDF</BotonDescarga>
        {!cerrada && <Button disabled={pend || !cambio} onClick={() => guardar()}>{pend ? <Spinner /> : <Save />} Guardar</Button>}
        {!cerrada && <Pedir trigger={<Button variant="outline" disabled={pend} tooltip="Exige todos los aspectos calificados; crea las acciones de las no conformidades en FOR-06" />} titulo="Cerrar auditoría" descripcion="Se verifican los aspectos y se crean las acciones de las no conformidades. Elija la fecha de cierre." label="Fecha de cierre" tipo="date" inicial={hoyLocal()} accion="Cerrar"
          onConfirm={(f) => guardar("", async () => { const res = await A.cerrarAuditoria(empresaId, a.id, f); if ("error" in res) toast.error(res.error); else toast.success(`Auditoría cerrada${res.acciones ? ` y ${res.acciones} acción(es) creadas en FOR-06` : ""}. Descargue el informe para firmarlo.`); })}><Lock /> Cerrar auditoría</Pedir>}
        {cerrada && <Button variant="outline" disabled={pend} onClick={() => start(async () => { await A.reabrirAuditoria(empresaId, a.id); toast.success("Auditoría reabierta"); router.refresh(); })}><LockOpen /> Reabrir</Button>}
      </div>

      <div>
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">Auditoría interna {a.anio} <Badge variant={cerrada ? "default" : "outline"}>{cerrada ? `Cerrada el ${fecha(a.fechaCierre)}` : "En curso"}</Badge></h2>
        <p className="text-sm text-muted-foreground">Inicio {fecha(a.fechaInicio)} · Auditor: {a.auditor}{a.auditorPerfil ? ` (${a.auditorPerfil})` : ""}{a.participantes ? ` · Planificada con: ${a.participantes}` : ""}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Avance" value={`${calificados} / ${items.length}`} hint={<Progress value={(calificados / items.length) * 100} />} />
        <Stat label="Conformidad" value={r.evaluados ? `${r.pct}%` : "—"} tone={!r.evaluados ? undefined : r.pct >= 90 ? "ok" : r.pct >= 70 ? "warn" : "bad"} />
        <Stat label="No conformidades" value={r.noConformes} tone={r.noConformes ? "bad" : "ok"} />
        <Stat label="Observaciones" value={r.observaciones} />
      </div>

      <Section title="Aspectos auditados" description="Los 13 aspectos que exige la norma. En gris, lo que PROCESST ya tiene registrado como punto de partida; verifíquelo en campo y escriba la evidencia revisada." actions={<NormaRef>Decreto 1072/2015 art. 2.2.4.6.30</NormaRef>} contentClassName="space-y-3">
        {items.map((it) => (
          <div key={it.n} className={cn("rounded-lg border p-4", it.resultado === "no_conforme" && "border-red-200 bg-red-50/40", it.resultado === "observacion" && "border-amber-200 bg-amber-50/40")}>
            <div className="flex flex-wrap items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">{it.n}</span>
              <div className="min-w-0 flex-1">
                <div className="font-medium">{it.aspecto}</div>
                <div className="text-sm text-muted-foreground">{it.criterio}</div>
                <div className="mt-1 flex flex-wrap gap-1">{it.estandares.map((e) => <NormaRef key={e}>{e}</NormaRef>)}</div>
                {sistema[it.n] && <div className="mt-2 flex items-start gap-1.5 rounded-md bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground"><Database className="mt-0.5 size-3.5 shrink-0" /><span><span className="font-medium">En PROCESST:</span> {sistema[it.n]}</span></div>}
              </div>
              <div className="flex flex-wrap gap-1">
                {(Object.keys(RES) as Exclude<ResultadoAud, "">[]).map((k) => { const R = RES[k]; const on = it.resultado === k; return (
                  <button key={k} type="button" disabled={cerrada} onClick={() => set(it.n, { resultado: k, accion: k === "no_conforme" ? it.accion ?? { descripcion: "", responsable: responsables[0] ?? "", fechaLimite: en30() } : null })}
                    className={cn("inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors disabled:cursor-not-allowed", on ? R.c : "bg-background hover:bg-muted")}><R.i className="size-3.5" />{R.t}</button>
                ); })}
              </div>
            </div>
            {it.resultado && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Textarea rows={2} disabled={cerrada} placeholder="Evidencia revisada (documentos, registros, entrevistas, observación)" value={it.evidencia} onChange={(e) => set(it.n, { evidencia: e.target.value })} />
                {it.resultado !== "conforme" && it.resultado !== "na" && <Textarea rows={2} disabled={cerrada} placeholder={it.resultado === "no_conforme" ? "Hallazgo: qué requisito no se cumple y por qué" : "Observación u oportunidad de mejora"} value={it.hallazgo} onChange={(e) => set(it.n, { hallazgo: e.target.value })} />}
              </div>
            )}
            {it.resultado === "no_conforme" && it.accion && !cerrada && (
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_12rem_9rem]">
                <Input className="sm:col-span-3" placeholder="Causa raíz: por qué ocurre la no conformidad" value={it.accion.causa ?? ""} onChange={(e) => set(it.n, { accion: { ...it.accion!, causa: e.target.value } })} />
                <Input placeholder="Acción correctiva (se crea en FOR-06 al cerrar)" value={it.accion.descripcion} onChange={(e) => set(it.n, { accion: { ...it.accion!, descripcion: e.target.value } })} />
                <Input placeholder="Responsable" value={it.accion.responsable ?? ""} onChange={(e) => set(it.n, { accion: { ...it.accion!, responsable: e.target.value } })} />
                <Input type="date" value={it.accion.fechaLimite ?? ""} onChange={(e) => set(it.n, { accion: { ...it.accion!, fechaLimite: e.target.value } })} />
              </div>
            )}
          </div>
        ))}
      </Section>

      <Section title="Conclusiones">
        <Field><FieldLabel htmlFor="a-con" className="sr-only">Conclusiones</FieldLabel><Textarea id="a-con" rows={4} disabled={cerrada} value={conclusiones} placeholder="Eficacia del SG-SST, fortalezas, principales no conformidades y recomendaciones para la revisión por la alta dirección." onChange={(e) => setConclusiones(e.target.value)} /></Field>
      </Section>

      {a.acciones.length > 0 && (
        <Section title="Acciones creadas (FOR-06)" contentClassName="space-y-2">
          {a.acciones.map((x) => <FilaAccion key={x.id} empresaId={empresaId} a={x} conHallazgo />)}
        </Section>
      )}

      <Section title="Soportes" description="Plan de auditoría, listas de verificación diligenciadas, informe firmado. Quedan en Evidencias." actions={<SubirArchivo empresaId={empresaId} ctx={{ tipo: "EVIDENCIA", auditoriaId: a.id }} titulo="Subir soporte" trigger={<Button size="sm"><Plus /> Subir</Button>} descripcionInicial={`Auditoría interna ${a.anio}`} />}>
        <ListaArchivos empresaId={empresaId} archivos={a.archivos} vacio="Sin soportes." />
        {r.noConformes > 0 && !cerrada && <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700"><CircleAlert className="size-3.5" /> Al cerrar se crearán las acciones de las no conformidades que tengan acción escrita.</p>}
      </Section>
    </div>
  );
}
