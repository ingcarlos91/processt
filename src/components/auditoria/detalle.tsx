"use client";
import { sugerirAccionHallazgo } from "@/app/actions/ia";
import { BotonIA } from "@/components/app/boton-ia";
import { CampoHallazgo } from "@/components/app/campo-hallazgo";
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
import { mismaPersona, resumenAuditoria, type ItemAuditoria, type ResultadoAud } from "@/lib/auditoria";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import * as A from "@/app/actions/auditoria";
import { cn, hoyLocal } from "@/lib/utils";
import { AvisoTareas, type TareaAviso } from "@/components/plazos/aviso-tareas";
import { toastTareas } from "@/components/plazos/toast-tareas";
import { avisoPlazo, deInput, fechaLarga, reglaPlazo, textoAccionPropuesta } from "@/lib/plazos";

type Aud = { id: string; anio: number; fechaInicio: string; fechaCierre: string; auditor: string; auditorPerfil: string; independiente: boolean; comunicadoA: string; comunicadoFecha: string; participantes: string; alcance: string; estado: string; conclusiones: string; items: ItemAuditoria[]; acciones: AccionUI[]; archivos: ArchivoUI[] };
const RES: Record<Exclude<ResultadoAud, "">, { t: string; c: string; i: typeof Check }> = {
  conforme: { t: "Conforme", c: "border-emerald-500 bg-emerald-500 text-white", i: Check },
  observacion: { t: "Observación", c: "border-amber-500 bg-amber-500 text-white", i: Eye },
  no_conforme: { t: "No conforme", c: "border-red-500 bg-red-500 text-white", i: X },
  na: { t: "N. A.", c: "border-slate-400 bg-slate-400 text-white", i: Minus },
};
const fecha = (f: string) => (f ? new Date(f + "T12:00:00Z").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "");

export function AuditoriaDetalle({ empresaId, a, sistema, responsables, responsableSst, diasAccionDefecto }: { diasAccionDefecto?: number; empresaId: string; a: Aud; sistema: Record<number, string>; responsables: string[]; responsableSst: string }) {
  // Fecha límite propuesta para las acciones: plazo "accion_limite" de la consultora (src/lib/plazos.ts).
  const diasAccion = diasAccionDefecto || 30;
  const en30 = () => hoyLocal(diasAccion);
  const router = useRouter();
  const [pend, start] = useTransition();
  const [items, setItems] = useState(a.items);
  const [conclusiones, setConclusiones] = useState(a.conclusiones);
  const [independiente, setIndependiente] = useState(a.independiente);
  const [com, setCom] = useState({ comunicadoA: a.comunicadoA, comunicadoFecha: a.comunicadoFecha });
  const cambioCom = com.comunicadoA !== a.comunicadoA || com.comunicadoFecha !== a.comunicadoFecha;
  const cerrada = a.estado === "cerrada";
  const r = resumenAuditoria(items);
  const calificados = items.filter((i) => i.resultado).length;
  const set = (n: number, x: Partial<ItemAuditoria>) => setItems((items) => items.map((i) => (i.n === n ? { ...i, ...x } : i)));
  // Lo que se programa al cerrar: la próxima auditoría anual y las acciones de las no conformidades en FOR-06.
  const tareasCierre = (): TareaAviso[] => [
    avisoPlazo("auditoria_anual", deInput(a.fechaInicio)),
    ...items.filter((i) => i.resultado === "no_conforme" && i.accion?.descripcion?.trim()).map((i) => {
      const fl = deInput(i.accion!.fechaLimite);
      return { tarea: `Acción correctiva (FOR-06): ${i.accion!.descripcion.trim()}`, plazo: "fecha límite de la acción", fecha: fl ? fechaLarga(fl) : undefined, norma: reglaPlazo("accion_limite")?.norma, tipo: "empresa" as const };
    }),
  ];
  const cambio = JSON.stringify(items) !== JSON.stringify(a.items) || conclusiones !== a.conclusiones || independiente !== a.independiente;
  const guardar = (msg = "Auditoría guardada", despues?: () => Promise<void>) => start(async () => {
    const res = await A.guardarAuditoria(empresaId, a.id, { items, conclusiones, independiente });
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
        {!cerrada && <Pedir trigger={<Button variant="outline" disabled={pend} tooltip="Exige todos los aspectos calificados; crea las acciones de las no conformidades en FOR-06" />} titulo="Cerrar auditoría" descripcion="Se verifican los aspectos y se crean las acciones de las no conformidades. Elija la fecha de cierre." label="Fecha de cierre" tipo="date" inicial={hoyLocal()} accion="Cerrar" extra={() => <AvisoTareas titulo="Al cerrar se programa" tareas={tareasCierre()} />}
          onConfirm={(f) => { const tareas = tareasCierre(); guardar("", async () => { const res = await A.cerrarAuditoria(empresaId, a.id, f); if ("error" in res) toast.error(res.error); else toastTareas(`Auditoría cerrada${res.acciones ? ` y ${res.acciones} acción(es) creadas en FOR-06` : ""}. Descargue el informe para firmarlo.`, tareas); }); }}><Lock /> Cerrar auditoría</Pedir>}
        {cerrada && <Button variant="outline" disabled={pend} onClick={() => start(async () => { await A.reabrirAuditoria(empresaId, a.id); toast.success("Auditoría reabierta"); router.refresh(); })}><LockOpen /> Reabrir</Button>}
      </div>

      <div>
        <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold">Auditoría interna {a.anio} <Badge variant={cerrada ? "default" : "outline"}>{cerrada ? `Cerrada el ${fecha(a.fechaCierre)}` : "En curso"}</Badge></h2>
        <p className="text-sm text-muted-foreground">Inicio {fecha(a.fechaInicio)} · Auditor: {a.auditor}{a.auditorPerfil ? ` (${a.auditorPerfil})` : ""}{a.participantes ? ` · Planificada con: ${a.participantes}` : ""}</p>
      </div>

      <Section title="Independencia del auditor" description="El auditor debe ser idóneo e independiente: no audita su propio trabajo. La declaración va al informe." actions={<NormaRef>Decreto 1072/2015 art. 2.2.4.6.29</NormaRef>} contentClassName="space-y-3">
        {mismaPersona(a.auditor, responsableSst) && (
          <Alert variant="destructive"><AlertTitle>El auditor es el responsable del SG-SST</AlertTitle><AlertDescription>Si diseñó o ejecuta el sistema estaría auditando su propio trabajo. Designe a otra persona idónea o deje constancia en el perfil de que no audita lo que él mismo ejecutó.</AlertDescription></Alert>
        )}
        <Field orientation="horizontal"><Checkbox id="a-ind" disabled={cerrada} checked={independiente} onCheckedChange={(v) => setIndependiente(!!v)} /><FieldLabel htmlFor="a-ind" className="font-normal">Declaro que {a.auditor} es independiente de lo auditado: no audita su propio trabajo ni las actividades que diseñó o ejecutó. Requerida para cerrar la auditoría.</FieldLabel></Field>
      </Section>

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
                <CampoHallazgo soloLectura={cerrada} etiqueta="Evidencia revisada" obligatorio={it.resultado !== "na"} placeholder="Ej.: Política POL-01 firmada el 10/02/2026; entrevista con 3 trabajadores; cartelera de la sede" value={it.evidencia} onChange={(v) => set(it.n, { evidencia: v })} />
                {it.resultado !== "conforme" && <CampoHallazgo soloLectura={cerrada} etiqueta={it.resultado === "no_conforme" ? "Hallazgo: qué requisito no se cumple y por qué" : it.resultado === "na" ? "Por qué no aplica" : "Observación u oportunidad de mejora"} obligatorio={it.resultado === "no_conforme" || it.resultado === "na"} placeholder={it.resultado === "no_conforme" ? "Ej.: La política no está firmada ni divulgada (Decreto 1072 art. 2.2.4.6.6)" : it.resultado === "na" ? "Ej.: La empresa no tiene contratistas" : "Ej.: Conviene publicar la política también en el canal digital"} value={it.hallazgo} onChange={(v) => set(it.n, { hallazgo: v })} />}
              </div>
            )}
            {it.resultado === "no_conforme" && it.accion && !cerrada && (
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_12rem_9rem]">
                <label className="space-y-1 sm:col-span-3"><span className="text-xs font-medium">Causa raíz</span><Input className="bg-background" placeholder="Por qué ocurre la no conformidad" value={it.accion.causa ?? ""} onChange={(e) => set(it.n, { accion: { ...it.accion!, causa: e.target.value } })} /></label>
                <label className="space-y-1"><span className="text-xs font-medium">Acción correctiva <span className="font-normal text-muted-foreground">(se crea en FOR-06 al cerrar)</span></span><Input className="bg-background" placeholder="Ej.: Firmar y divulgar la política de SST" value={it.accion.descripcion} onChange={(e) => set(it.n, { accion: { ...it.accion!, descripcion: e.target.value } })} /></label>
                <label className="space-y-1"><span className="text-xs font-medium">Responsable</span><Input className="bg-background" placeholder="Ej.: Gerente" value={it.accion.responsable ?? ""} onChange={(e) => set(it.n, { accion: { ...it.accion!, responsable: e.target.value } })} /></label>
                <label className="space-y-1"><span className="text-xs font-medium">Fecha límite</span><Input className="bg-background" type="date" value={it.accion.fechaLimite ?? ""} onChange={(e) => set(it.n, { accion: { ...it.accion!, fechaLimite: e.target.value } })} /></label>
                <div className="flex flex-wrap items-center justify-between gap-2 sm:col-span-3">
                  <BotonIA disabled={!it.hallazgo.trim()} tooltip={it.hallazgo.trim() ? undefined : "Escriba primero el hallazgo"}
                    accion={() => sugerirAccionHallazgo(empresaId, { origen: "auditoria", contexto: `${it.aspecto}. Criterio: ${it.criterio}`, hallazgo: it.hallazgo, observacion: it.evidencia })}
                    onPropuesta={(r) => set(it.n, { accion: { ...it.accion!, causa: r.causa, descripcion: r.descripcion } })} />
                  <p className="text-xs text-muted-foreground sm:text-right">{textoAccionPropuesta(diasAccion)}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </Section>

      <Section title="Conclusiones">
        <Field><FieldLabel htmlFor="a-con" className="sr-only">Conclusiones</FieldLabel><Textarea id="a-con" rows={4} disabled={cerrada} value={conclusiones} placeholder="Eficacia del SG-SST, fortalezas, principales no conformidades y recomendaciones para la revisión por la alta dirección." onChange={(e) => setConclusiones(e.target.value)} /></Field>
      </Section>

      <Section title="Comunicación de resultados" description="A quién y cuándo se comunicaron los resultados: a los responsables de adoptar las medidas preventivas, correctivas o de mejora (y al COPASST o Vigía). Se puede registrar con la auditoría cerrada." actions={<NormaRef>Decreto 1072/2015 art. 2.2.4.6.29</NormaRef>}>
        <div className="grid gap-2 sm:grid-cols-[1fr_11rem_auto]">
          <Field><FieldLabel htmlFor="a-coma">Comunicado a</FieldLabel><Input id="a-coma" value={com.comunicadoA} placeholder="Ej.: Gerente general, responsable del SG-SST y COPASST" onChange={(e) => setCom({ ...com, comunicadoA: e.target.value })} /></Field>
          <Field><FieldLabel htmlFor="a-comf">Fecha</FieldLabel><Input id="a-comf" type="date" value={com.comunicadoFecha} onChange={(e) => setCom({ ...com, comunicadoFecha: e.target.value })} /></Field>
          <div className="flex items-end"><Button variant="outline" disabled={pend || !cambioCom} tooltip="Guarda a quién y cuándo se comunicaron los resultados; aparece en el informe" onClick={() => start(async () => { const res = await A.registrarComunicacion(empresaId, a.id, com); if ("error" in res) toast.error(res.error); else { toast.success("Comunicación registrada"); router.refresh(); } })}><Save /> Guardar</Button></div>
        </div>
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
