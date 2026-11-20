"use client";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, ChevronRight, FileText, Paperclip, Plus, ListChecks } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Selector } from "@/components/app/selector";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { EventoForm, type CargoOpcion } from "@/components/accidentes/evento-form";
import { TIPOS_EVENTO, GRAVEDAD, COLOR_PLAZO } from "@/lib/eventos";
import type { PlazoUI } from "@/lib/eventos-ui";
import { crearEvento, type DatosEvento } from "@/app/actions/eventos";
import { AvisoTareas } from "@/components/plazos/aviso-tareas";
import { tareasDeEvento } from "@/lib/eventos-ui";
import type { ParametrosPlazos } from "@/lib/plazos";
import type { CatalogoAccidentes } from "@/lib/catalogo-accidentes";
import { cn, hoyLocal } from "@/lib/utils";

type Ev = { id: string; tipo: string; gravedad: string; fecha: string; trabajador: string; cargo: string; descripcion: string; dias: number; invEstado: string; acciones: number; archivos: number; plazos: PlazoUI[] };
const INV: Record<string, { t: string; v: "default" | "secondary" | "outline" | "destructive" }> = { pendiente: { t: "Sin iniciar", v: "outline" }, en_curso: { t: "En curso", v: "secondary" }, cerrada: { t: "Cerrada", v: "default" }, no_aplica: { t: "No aplica", v: "outline" } };
const fechaCorta = (f: string) => new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const nuevo = (): DatosEvento => ({ tipo: "AT", gravedad: "leve", fecha: hoyLocal(), diasIncapacidad: 0, diasCargados: 0 });

export function Semaforo({ p, compacto }: { p: PlazoUI; compacto?: boolean }) {
  const c = COLOR_PLAZO[p.estado];
  return <Badge variant={c.v} className={cn("font-normal", c.c)} title={`${p.t} · vence ${fechaCorta(p.vence)} · ${p.normaRef}`}>{compacto ? p.t.split(" ")[0] : p.t}: {c.t}{!p.hecho && p.estado !== "vencido" ? ` (${fechaCorta(p.vence)})` : ""}</Badge>;
}

export function EventosLista({ empresaId, anio, anios, eventos, cargos, acciones, cat, lugares, sedes, parametros }: { parametros?: ParametrosPlazos; empresaId: string; anio: number; anios: number[]; eventos: Ev[]; cargos: CargoOpcion[]; acciones: { abiertas: number; vencidas: number }; cat: CatalogoAccidentes; lugares: string[]; sedes: string[] }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [d, setD] = useState<DatosEvento>(nuevo);
  const [pend, start] = useTransition();
  const [tipo, setTipo] = useState("todos");
  const delAnio = useMemo(() => eventos.filter((e) => new Date(e.fecha).getUTCFullYear() === anio), [eventos, anio]);
  const lista = delAnio.filter((e) => tipo === "todos" || e.tipo === tipo);
  const vencidos = eventos.flatMap((e) => e.plazos.filter((p) => p.estado === "vencido" || p.estado === "por_vencer").map((p) => ({ e, p })));
  const n = (t: string) => delAnio.filter((e) => e.tipo === t).length;
  const investigables = delAnio.filter((e) => e.invEstado !== "no_aplica");

  const crear = () => start(async () => {
    const r = await crearEvento(empresaId, d);
    if ("error" in r) { toast.error(r.error); return; }
    const tareas = tareasDeEvento(d, parametros);
    toast.success("Evento registrado", { description: tareas.length ? `Se programaron ${tareas.length} plazo(s) en el planeador: ${tareas.map((t) => `${t.tarea} (vence el ${t.fecha})`).join("; ")}.` : "No genera plazos de reporte.", duration: 12000 });
    setAbierto(false); setD(nuevo());
    router.push(`/empresas/${empresaId}/accidentes/${r.id}`);
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="max-w-3xl text-sm text-muted-foreground text-pretty">Registro, reporte e investigación de cada evento con sus acciones. Alimenta los indicadores, el registro estadístico (FOR-08) y las acciones correctivas (FOR-06).</p>
        <div className="flex-1" />
        <Selector className="w-28" value={String(anio)} onChange={(v) => router.push(`?anio=${v}`)} opciones={anios.map((y) => ({ valor: String(y), etiqueta: String(y) }))} />
        <Button onClick={() => setAbierto(true)}><Plus /> Registrar evento</Button>
      </div>

      {vencidos.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>{vencidos.length} plazo(s) vencido(s) o por vencer</AlertTitle>
          <AlertDescription>
            <ul className="space-y-1">
              {vencidos.slice(0, 6).map(({ e, p }) => (
                <li key={e.id + p.clave}><Link className="underline underline-offset-2" href={`/empresas/${empresaId}/accidentes/${e.id}`}>{TIPOS_EVENTO[e.tipo].t} del {fechaCorta(e.fecha)}{e.trabajador ? ` (${e.trabajador})` : ""}</Link>: {p.t.toLowerCase()} — {COLOR_PLAZO[p.estado].t.toLowerCase()}, vence {fechaCorta(p.vence)} <NormaRef>{p.normaRef}</NormaRef></li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <Stat label="Accidentes de trabajo" value={n("AT")} hint={`${delAnio.filter((e) => e.tipo === "AT" && e.gravedad !== "leve").length} grave(s) o mortal(es)`} tone={n("AT") ? "warn" : "ok"} />
        <Stat label="Incidentes" value={n("INCIDENTE")} hint="Sin lesión o solo primeros auxilios" />
        <Stat label="Enfermedades laborales" value={n("EL")} />
        <Stat label="Días perdidos (AT)" value={delAnio.filter((e) => e.tipo === "AT").reduce((s, e) => s + e.dias, 0)} />
        <Stat label="Investigados" value={`${investigables.filter((e) => e.invEstado === "cerrada").length} / ${investigables.length}`} hint="Res. 1401/2007" tone={investigables.every((e) => e.invEstado === "cerrada") ? "ok" : "warn"} />
        <Stat label="Acciones abiertas" value={acciones.abiertas} hint={acciones.vencidas ? `${acciones.vencidas} vencida(s)` : "Al día"} tone={acciones.vencidas ? "bad" : undefined} />
      </div>

      {eventos.length === 0 ? (
        <EstadoVacio ilustracion="sinAccidentes" titulo={<>Sin eventos registrados</>} descripcion={<>Cuando ocurra un accidente, incidente o se califique una enfermedad laboral, regístrelo aquí: el sistema le recuerda los plazos de reporte e investigación y le genera el informe.</>}><Button onClick={() => setAbierto(true)}><Plus /> Registrar evento</Button></EstadoVacio>
      ) : (
        <Section title={`Eventos de ${anio}`} actions={
          <Selector className="w-56" value={tipo} onChange={setTipo} opciones={[{ valor: "todos", etiqueta: "Todos los tipos" }, ...Object.entries(TIPOS_EVENTO).map(([k, t]) => ({ valor: k, etiqueta: t.t }))]} />
        } contentClassName="px-0">
          <Table className="[&_td]:align-top">
            <TableHeader><TableRow><TableHead className="pl-6">Fecha</TableHead><TableHead>Evento</TableHead><TableHead>Persona</TableHead><TableHead>Plazos</TableHead><TableHead>Investigación</TableHead><TableHead className="pr-6 w-10" /></TableRow></TableHeader>
            <TableBody>
              {lista.map((e) => (
                <TableRow key={e.id} className="cursor-pointer" onClick={() => router.push(`/empresas/${empresaId}/accidentes/${e.id}`)}>
                  <TableCell className="pl-6 whitespace-nowrap">{fechaCorta(e.fecha)}</TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="flex flex-wrap items-center gap-1.5"><span className="font-medium">{TIPOS_EVENTO[e.tipo].t}</span>{e.tipo === "AT" && e.gravedad !== "leve" && <Badge variant="destructive">{GRAVEDAD[e.gravedad].t}</Badge>}</div>
                    {e.descripcion && <div className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted-foreground">{e.descripcion}</div>}
                  </TableCell>
                  <TableCell className="whitespace-normal"><div>{e.trabajador || "—"}</div><div className="text-xs text-muted-foreground">{e.cargo}</div></TableCell>
                  <TableCell className="whitespace-normal"><div className="flex max-w-sm flex-wrap gap-1">{e.plazos.length ? e.plazos.map((p) => <Semaforo key={p.clave} p={p} compacto />) : <span className="text-xs text-muted-foreground">Sin plazos</span>}</div></TableCell>
                  <TableCell>
                    <Badge variant={INV[e.invEstado].v}>{INV[e.invEstado].t}</Badge>
                    <div className="mt-1 flex gap-2 text-xs text-muted-foreground"><span className="flex items-center gap-0.5"><ListChecks className="size-3" />{e.acciones}</span><span className="flex items-center gap-0.5"><Paperclip className="size-3" />{e.archivos}</span></div>
                  </TableCell>
                  <TableCell className="pr-6"><Link href={`/empresas/${empresaId}/accidentes/${e.id}`} className={buttonVariants({ size: "icon-sm", variant: "ghost" })} aria-label="Abrir" onClick={(x) => x.stopPropagation()}><ChevronRight /></Link></TableCell>
                </TableRow>
              ))}
              {lista.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No hay eventos de este tipo en {anio}.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </Section>
      )}
      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><FileText className="size-3.5" /> Procedimientos: PRC-08 (reporte) y PRC-09 (investigación). <NormaRef>Decreto Ley 1295/1994 art. 62</NormaRef><NormaRef>Res. 1401/2007</NormaRef><NormaRef>Decreto 1072/2015 art. 2.2.4.6.32</NormaRef><NormaRef>Res. 0312/2019 estándares 3.2.1-3.2.3</NormaRef></p>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Registrar evento</DialogTitle>
            <DialogDescription>Lo que sepa ahora; puede completarlo después. Al guardar, el sistema calcula los plazos de reporte e investigación.</DialogDescription>
          </DialogHeader>
          <EventoForm d={d} set={setD} cargos={cargos} cat={cat} lugares={lugares} sedes={sedes} />
          <AvisoTareas tareas={tareasDeEvento(d, parametros)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbierto(false)}>Cancelar</Button>
            <Button disabled={pend || !d.fecha} onClick={crear}>{pend ? <Spinner /> : <Plus />} Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
