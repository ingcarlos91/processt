"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Section, NormaRef } from "@/components/app/ui";
import { Combo } from "@/components/app/combo";
import { Confirmar } from "@/components/app/confirmar";
import { EstadoVacio } from "@/components/app/ilustraciones";
import * as A from "@/app/actions/auditoria";

type Aud = { id: string; anio: number; fechaInicio: string; fechaCierre: string; auditor: string; estado: string; calificados: number; total: number; conformidad: number | null; noConformes: number; acciones: number };
const fecha = (f: string) => (f ? new Date(f + "T12:00:00Z").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");

export function AuditoriasLista({ empresaId, auditorias, personasCopasst, sugerenciaAuditor, responsable, nivel }: { empresaId: string; auditorias: Aud[]; personasCopasst: string[]; sugerenciaAuditor: string; responsable: string; nivel: number }) {
  const router = useRouter();
  const [pend, start] = useTransition();
  const anio = new Date().getFullYear();
  const [plan, setPlan] = useState<A.PlanAuditoria | null>(null);
  const nueva = () => setPlan({ anio, fechaInicio: new Date().toISOString().slice(0, 10), auditor: "", auditorPerfil: "", participantes: personasCopasst.join(", "), alcance: `Todos los procesos, sedes y trabajadores (incluidos contratistas) de la empresa, periodo ${anio}.`, metodologia: "Revisión documental, entrevistas con trabajadores y responsables, y observación en campo." });
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="max-w-3xl text-sm text-muted-foreground">Auditoría interna anual del SG-SST, planificada con el COPASST o Vigía y realizada por una persona idónea e independiente. Evalúa los 13 aspectos de la norma, genera acciones y su informe. <NormaRef>Decreto 1072/2015 arts. 2.2.4.6.29-30</NormaRef><NormaRef>Res. 0312/2019 estándares 6.1.2 y 6.1.4</NormaRef></p>
        <div className="flex-1" />
        <Button onClick={nueva}><Plus /> Planificar auditoría {anio}</Button>
      </div>
      {nivel < 60 && <p className="rounded-lg border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground">Esta empresa es de {nivel} estándares: la auditoría no es uno de los ítems que se califican en su autoevaluación (Res. 0312/2019), pero el Decreto 1072/2015 (art. 2.2.4.6.29) exige a todo empleador una auditoría anual del SG-SST.</p>}
      {auditorias.length === 0 ? (
        <EstadoVacio ilustracion="evaluacion" titulo="Aún no hay auditorías" descripcion="Planifique la auditoría del año con el COPASST o Vigía. El sistema le presenta los 13 aspectos que exige la norma con la evidencia que ya tiene registrada.">
          <Button onClick={nueva}><Plus /> Planificar auditoría {anio}</Button>
        </EstadoVacio>
      ) : (
        <Section contentClassName="px-0">
          <Table>
            <TableHeader><TableRow><TableHead className="pl-6">Año</TableHead><TableHead>Inicio</TableHead><TableHead>Auditor</TableHead><TableHead>Avance</TableHead><TableHead>Conformidad</TableHead><TableHead>No conformidades</TableHead><TableHead>Estado</TableHead><TableHead className="pr-6 w-20" /></TableRow></TableHeader>
            <TableBody>
              {auditorias.map((a) => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => router.push(`/empresas/${empresaId}/auditoria/${a.id}`)}>
                  <TableCell className="pl-6 font-medium">{a.anio}</TableCell>
                  <TableCell className="text-xs">{fecha(a.fechaInicio)}</TableCell>
                  <TableCell>{a.auditor}</TableCell>
                  <TableCell><div className="w-28"><div className="text-xs">{a.calificados} de {a.total}</div><Progress value={(a.calificados / Math.max(1, a.total)) * 100} /></div></TableCell>
                  <TableCell>{a.conformidad != null ? `${a.conformidad}%` : "—"}</TableCell>
                  <TableCell>{a.noConformes}{a.acciones ? <span className="text-xs text-muted-foreground"> · {a.acciones} acciones</span> : null}</TableCell>
                  <TableCell><Badge variant={a.estado === "cerrada" ? "default" : "outline"}>{a.estado === "cerrada" ? `Cerrada ${fecha(a.fechaCierre)}` : "En curso"}</Badge></TableCell>
                  <TableCell className="pr-6" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-0.5">
                      <Confirmar trigger={<Button size="icon-sm" variant="ghost" aria-label="Eliminar auditoría" />} titulo="Eliminar auditoría" descripcion="Se elimina la auditoría; las acciones creadas se conservan en FOR-06." accion="Eliminar" destructivo onConfirm={() => start(async () => { await A.eliminarAuditoria(empresaId, a.id); toast.success("Auditoría eliminada"); })}><Trash2 /></Confirmar>
                      <Link href={`/empresas/${empresaId}/auditoria/${a.id}`} className={buttonVariants({ size: "icon-sm", variant: "ghost" })} aria-label="Abrir"><ChevronRight /></Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}

      <Dialog open={!!plan} onOpenChange={(o) => !o && setPlan(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Planificar auditoría interna</DialogTitle><DialogDescription>El auditor debe ser idóneo e independiente: no puede auditar su propio trabajo. Si el responsable del SG-SST ({responsable || "sin registrar"}) diseñó el sistema, conviene que audite otra persona.</DialogDescription></DialogHeader>
          {plan && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field><FieldLabel htmlFor="a-a">Año auditado</FieldLabel><Input id="a-a" placeholder="Ej.: 2026" type="number" value={plan.anio} onChange={(e) => setPlan({ ...plan, anio: Number(e.target.value) })} /></Field>
              <Field><FieldLabel htmlFor="a-f">Fecha de inicio</FieldLabel><Input id="a-f" type="date" value={plan.fechaInicio} onChange={(e) => setPlan({ ...plan, fechaInicio: e.target.value })} /></Field>
              <Field><FieldLabel>Auditor</FieldLabel><Combo value={plan.auditor} onChange={(v) => setPlan({ ...plan, auditor: v })} grupos={[{ titulo: "Sugerido", opciones: sugerenciaAuditor ? [{ valor: sugerenciaAuditor, detalle: "Profesional de la consultora" }] : [] }]} placeholder="Nombre del auditor" /></Field>
              <Field className="sm:col-span-3"><FieldLabel htmlFor="a-p">Perfil e independencia del auditor</FieldLabel><Input id="a-p" value={plan.auditorPerfil} placeholder="Ej: Especialista en SST con curso de auditor interno; no participó en la ejecución auditada" onChange={(e) => setPlan({ ...plan, auditorPerfil: e.target.value })} /></Field>
              <Field className="sm:col-span-3"><FieldLabel htmlFor="a-c">Planificada con (COPASST o Vigía)</FieldLabel><Input id="a-c" placeholder="Ej.: COPASST, en reunión ordinaria" value={plan.participantes} onChange={(e) => setPlan({ ...plan, participantes: e.target.value })} /><FieldDescription>Estándar 6.1.4: la auditoría se planifica con el COPASST o Vigía.</FieldDescription></Field>
              <Field className="sm:col-span-3"><FieldLabel htmlFor="a-al">Alcance</FieldLabel><Textarea id="a-al" rows={2} placeholder="Describa qué procesos, sedes y periodo cubre la auditoría" value={plan.alcance} onChange={(e) => setPlan({ ...plan, alcance: e.target.value })} /></Field>
              <Field className="sm:col-span-3"><FieldLabel htmlFor="a-m">Metodología</FieldLabel><Input id="a-m" placeholder="Ej.: Entrevistas, revisión documental e inspección en sitio" value={plan.metodologia} onChange={(e) => setPlan({ ...plan, metodologia: e.target.value })} /></Field>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setPlan(null)}>Cancelar</Button>
            <Button disabled={pend || !plan?.auditor.trim()} onClick={() => plan && start(async () => { const r = await A.crearAuditoria(empresaId, plan); if ("error" in r) { toast.error(r.error); return; } toast.success("Auditoría creada con los 13 aspectos de la norma"); setPlan(null); router.push(`/empresas/${empresaId}/auditoria/${r.id}`); })}>{pend && <Spinner />} Crear auditoría</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
