"use client";
import { hoyLocal } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SeccionFormulario, SeccionesFormulario } from "@/components/app/formulario-largo";
import { Section, Stat } from "@/components/app/ui";
import { Selector } from "@/components/app/selector";
import { Combo } from "@/components/app/combo";
import { Confirmar } from "@/components/app/confirmar";
import { EstadoVacio } from "@/components/app/ilustraciones";
import * as A from "@/app/actions/visitas";

type V = { id: string; fecha: string; horas: number; modalidad: string; atendio: string; actividades: string; compromisos: string };
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const hoy = () => hoyLocal();
const pesos = (n: number) => n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const fecha = (f: string) => new Date(f + "T12:00:00Z").toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

/** Bitácora de visitas a la empresa y su comparación con las horas pactadas en el contrato. */
export function Bitacora({ empresaId, visitas, horasMes, valorMes, personas }: { empresaId: string; visitas: V[]; horasMes: number | null; valorMes: number | null; personas: string[] }) {
  const [pend, start] = useTransition();
  const [v, setV] = useState<(Omit<V, "id"> & { id?: string }) | null>(null);
  const [contrato, setContrato] = useState({ horas: horasMes ?? 0, valor: valorMes ?? 0 });
  const mesActual = hoy().slice(0, 7);
  const delMes = visitas.filter((x) => x.fecha.startsWith(mesActual));
  const horas = delMes.reduce((s, x) => s + x.horas, 0);
  const porMes = [...new Set(visitas.map((x) => x.fecha.slice(0, 7)))].sort().reverse();
  const run = (fn: () => Promise<{ error?: string } | { ok: true }>, ok: string, despues?: () => void) => start(async () => { const r = await fn(); if ("error" in r && r.error) toast.error(r.error); else { toast.success(ok); despues?.(); } });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Horas este mes" value={`${horas.toLocaleString("es-CO")} h`} hint={horasMes ? <div className="space-y-1"><Progress value={Math.min(100, (horas / horasMes) * 100)} /><span>{Math.round((horas / horasMes) * 100)} % de {horasMes} h pactadas</span></div> : "Sin horas pactadas"} tone={horasMes ? (horas >= horasMes ? "ok" : "warn") : undefined} />
        <Stat label="Visitas este mes" value={delMes.length} hint={`${delMes.filter((x) => x.modalidad === "presencial").length} presenciales`} />
        <Stat label="Valor por hora real" value={valorMes && horas ? pesos(valorMes / horas) : "—"} hint={valorMes ? `Contrato: ${pesos(valorMes)} al mes` : "Registre el valor del contrato"} />
        <Stat label="Horas en el año" value={`${visitas.filter((x) => x.fecha.startsWith(mesActual.slice(0, 4))).reduce((s, x) => s + x.horas, 0).toLocaleString("es-CO")} h`} />
      </div>

      <Section title="Contrato con la empresa" description="Horas de asesoría pactadas al mes y valor mensual. Sirven para ver si se cumple lo contratado y la rentabilidad por cliente.">
        <div className="flex flex-wrap items-end gap-3">
          <Field className="w-44"><FieldLabel htmlFor="c-h">Horas pactadas al mes</FieldLabel><Input id="c-h" placeholder="Ej.: 8" type="number" min={0} step={0.5} value={contrato.horas || ""} onChange={(e) => setContrato({ ...contrato, horas: Number(e.target.value) })} /></Field>
          <Field className="w-56"><FieldLabel htmlFor="c-v">Valor mensual (pesos)</FieldLabel><Input id="c-v" placeholder="Ej.: 800000" type="number" min={0} step={10000} value={contrato.valor || ""} onChange={(e) => setContrato({ ...contrato, valor: Number(e.target.value) })} /></Field>
          <Button variant="outline" disabled={pend} onClick={() => run(() => A.guardarContrato(empresaId, { horasMes: contrato.horas, valorMes: contrato.valor }), "Contrato guardado")}><Save /> Guardar</Button>
        </div>
      </Section>

      <div className="flex items-center justify-between">
        <h3 className="font-medium">Visitas y reuniones</h3>
        <Button onClick={() => setV({ fecha: hoy(), horas: 2, modalidad: "presencial", atendio: "", actividades: "", compromisos: "" })}><Plus /> Registrar visita</Button>
      </div>
      {visitas.length === 0 ? (
        <EstadoVacio ilustracion="comites" titulo="Aún no hay visitas registradas" descripcion="Registre cada visita o reunión con el cliente: fecha, horas, quién atendió, qué se hizo y los compromisos. Aparecen en el informe mensual de gestión." />
      ) : porMes.map((m) => {
        const xs = visitas.filter((x) => x.fecha.startsWith(m));
        return (
          <section key={m}>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">{MESES[Number(m.slice(5)) - 1].replace(/^./, (x) => x.toUpperCase())} {m.slice(0, 4)} · {xs.reduce((s, x) => s + x.horas, 0).toLocaleString("es-CO")} h</h4>
            <ul className="divide-y rounded-xl border bg-background">
              {xs.map((x) => (
                <li key={x.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="w-24 shrink-0 text-xs text-muted-foreground"><div>{fecha(x.fecha).replace(/^./, (c) => c.toUpperCase())}</div><div>{x.horas} h · {x.modalidad === "virtual" ? "virtual" : "presencial"}</div></div>
                  <div className="min-w-0 flex-1 text-sm"><div className="whitespace-pre-line">{x.actividades}</div>{x.compromisos && <div className="mt-1 text-xs text-muted-foreground"><span className="font-medium">Compromisos:</span> {x.compromisos}</div>}{x.atendio && <Badge variant="outline" className="mt-1.5 font-normal">Atendió: {x.atendio}</Badge>}</div>
                  <div className="flex items-center gap-0.5">
                    <Button size="icon-sm" variant="ghost" aria-label="Editar visita" onClick={() => setV({ ...x })}><Pencil /></Button>
                    <Confirmar trigger={<Button size="icon-sm" variant="ghost" aria-label="Eliminar visita" />} titulo="Eliminar visita" accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarVisita(empresaId, x.id), "Visita eliminada")}><Trash2 /></Confirmar>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Dialog open={!!v} onOpenChange={(o) => !o && setV(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{v?.id ? "Editar visita" : "Registrar visita"}</DialogTitle><DialogDescription>Queda en la bitácora y en el informe mensual de gestión.</DialogDescription></DialogHeader>
          {v && (
            <DialogBody>
              <SeccionesFormulario>
                <SeccionFormulario titulo="Visita" descripcion="Fecha, duración y quién atendió por la empresa." contenidoClassName="sm:grid-cols-3">
                  <Field><FieldLabel htmlFor="v-f">Fecha</FieldLabel><Input id="v-f" type="date" value={v.fecha} onChange={(e) => setV({ ...v, fecha: e.target.value })} /></Field>
                  <Field><FieldLabel htmlFor="v-h">Horas</FieldLabel><Input id="v-h" placeholder="Ej.: 2" type="number" min={0.25} step={0.25} value={v.horas} onChange={(e) => setV({ ...v, horas: Number(e.target.value) })} /></Field>
                  <Field><FieldLabel>Modalidad</FieldLabel><Selector value={v.modalidad} onChange={(m) => setV({ ...v, modalidad: m })} opciones={[{ valor: "presencial", etiqueta: "Presencial" }, { valor: "virtual", etiqueta: "Virtual" }]} /></Field>
                  <Field className="sm:col-span-3"><FieldLabel>Atendió (por el cliente)</FieldLabel><Combo value={v.atendio} placeholder="Seleccione o escriba quién atendió" onChange={(a) => setV({ ...v, atendio: a })} grupos={[{ titulo: "Personas de la empresa", opciones: personas.map((p) => ({ valor: p })) }]} /></Field>
                </SeccionFormulario>
                <SeccionFormulario titulo="Qué se hizo y compromisos" descripcion="Aparece tal cual en el informe mensual de gestión.">
                  <Field><FieldLabel htmlFor="v-a">Actividades</FieldLabel><Textarea id="v-a" rows={4} value={v.actividades} placeholder={"Ej: Inspección locativa con el Vigía\nCapacitación en manejo de extintores\nRevisión del plan anual"} onChange={(e) => setV({ ...v, actividades: e.target.value })} /><FieldDescription>Una actividad por línea.</FieldDescription></Field>
                  <Field><FieldLabel htmlFor="v-c">Compromisos</FieldLabel><Textarea id="v-c" rows={2} placeholder="Ej.: La empresa enviará el listado de trabajadores antes del viernes" value={v.compromisos} onChange={(e) => setV({ ...v, compromisos: e.target.value })} /></Field>
                </SeccionFormulario>
              </SeccionesFormulario>
            </DialogBody>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setV(null)}>Cancelar</Button><Button disabled={pend || !v?.actividades.trim()} tooltip={!v?.actividades.trim() ? "Describa qué se hizo" : undefined} onClick={() => v && run(() => A.guardarVisita(empresaId, v), "Visita guardada", () => setV(null))}>{pend && <Spinner />} Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
