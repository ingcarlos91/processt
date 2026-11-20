import { parametrosPlazos } from "@/lib/plazos-servidor";
import { valorPlazo } from "@/lib/plazos";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, Plus } from "lucide-react";
import { Page, PageHeader, Section, Stat } from "@/components/app/ui";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { Tip } from "@/components/app/tip";
import { tableroConsultora } from "@/lib/tablero";
import { fechasPlaneador, CATEGORIAS } from "@/lib/planeador";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const VARIANTE: Record<string, "destructive" | "secondary" | "default"> = { "CRÍTICO": "destructive", "MODERADAMENTE ACEPTABLE": "secondary", ACEPTABLE: "default" };
const ROMANO = ["", "I", "II", "III", "IV", "V"];
const corta = (s: string) => new Date(s).toLocaleDateString("es-CO", { day: "numeric", month: "short", timeZone: "UTC" });

export default async function Home() {
  const hoy = new Date();
  const diasAtencion = valorPlazo("aviso_tablero", await parametrosPlazos());
  const [{ filas, cartera, prioridad }, fechas] = await Promise.all([
    tableroConsultora(hoy),
    fechasPlaneador({ desde: hoy, hasta: new Date(hoy.getTime() + diasAtencion * 864e5), hoy }),
  ]);
  const atencion = fechas.filter((f) => f.estado !== "hecho" && !f.mesCompleto).slice(0, 10);
  const vencidosPlaneador = fechas.filter((f) => f.estado === "vencido").length;
  const nueva = <Link href="/empresas/nueva" className={buttonVariants()}><Plus /> Nueva empresa</Link>;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

  return (
    <Page>
      <PageHeader title="Tablero de la consultora" description="Su cartera de clientes de un vistazo: cumplimiento, pendientes y a quién atender primero." actions={nueva} />
      {filas.length === 0 ? (
        <EstadoVacio ilustracion="empresas" titulo="Aún no hay empresas" descripcion="Cree la primera empresa y el sistema generará su SG-SST completo según la norma.">{nueva}</EstadoVacio>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            <Stat label="Empresas" value={cartera.empresas} hint={`${cartera.trabajadores} trabajadores cubiertos`} />
            <Stat label="Cumplimiento promedio" value={cartera.cumplimientoPromedio != null ? `${cartera.cumplimientoPromedio}%` : "—"} hint={cartera.sinEvaluacion ? `${cartera.sinEvaluacion} sin autoevaluación` : "Estándares mínimos"} tone={cartera.cumplimientoPromedio == null ? undefined : cartera.cumplimientoPromedio > 85 ? "ok" : cartera.cumplimientoPromedio >= 60 ? "warn" : "bad"} />
            <Stat label="En estado crítico" value={cartera.criticas} hint="Menos de 60 % en estándares" tone={cartera.criticas ? "bad" : "ok"} />
            <Stat label="Plan anual" value={cartera.planCumplimiento != null ? `${cartera.planCumplimiento}%` : "—"} hint="Ejecutado en el año, toda la cartera" />
            <Stat label="Documentos firmados" value={`${cartera.docsFirmados} / ${cartera.docsAplicables}`} hint={<span className="flex w-full items-center gap-2"><Progress className="flex-1" value={pct(cartera.docsFirmados, cartera.docsAplicables)} /><span className="tabular-nums">{pct(cartera.docsFirmados, cartera.docsAplicables)} %</span></span>} />
            <Stat label="Fechas vencidas" value={vencidosPlaneador} hint={<Link href="/planeador" className="underline underline-offset-2">Ver planeador</Link>} tone={vencidosPlaneador ? "bad" : "ok"} />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <Section className="lg:col-span-3" title={<span className="flex items-center gap-2"><CalendarClock className="size-4" /> Atención: vencidos y próximos {diasAtencion} días</span>} actions={<Link href="/planeador" className={buttonVariants({ size: "sm", variant: "ghost" })}>Planeador <ArrowRight /></Link>} contentClassName="px-0">
              {atencion.length === 0 ? <p className="px-6 py-4 text-sm text-muted-foreground">Nada vencido ni con fecha en los próximos {diasAtencion} días.</p> : (
                <ul className="divide-y">
                  {atencion.map((f) => (
                    <li key={f.id}>
                      <Link href={f.href} className="flex items-center gap-3 px-6 py-2.5 hover:bg-muted/40">
                        <span className={cn("w-14 shrink-0 text-xs", f.estado === "vencido" ? "font-medium text-red-600" : "text-muted-foreground")}>{f.estado === "vencido" ? "Vencido" : corta(f.fecha)}</span>
                        <span className={cn("size-2 shrink-0 rounded-full", CATEGORIAS[f.categoria].color)} />
                        <span className="min-w-0 flex-1 truncate text-sm"><span className="font-medium">{f.empresa}:</span> {f.titulo}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
            <Section className="lg:col-span-2" title={<span className="flex items-center gap-2"><AlertTriangle className="size-4" /> Prioridad por empresa</span>} description="Ordenadas por lo más urgente." contentClassName="px-0">
              {prioridad.length === 0 ? <p className="px-6 py-4 text-sm text-muted-foreground">Ninguna empresa con pendientes urgentes.</p> : (
                <ul className="divide-y">
                  {prioridad.slice(0, 6).map((f, i) => (
                    <li key={f.id} className="px-6 py-3">
                      <Link href={`/empresas/${f.id}`} className="flex items-center gap-2 font-medium hover:underline"><span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px]">{i + 1}</span>{f.nombre}</Link>
                      <div className="mt-1.5 flex flex-wrap gap-1">{f.motivos.slice(0, 4).map((m) => <Badge key={m} variant="outline" className="font-normal">{m}</Badge>)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>

          <Section title="Empresas" description="Pase el mouse sobre los datos para ver el detalle." contentClassName="px-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead className="pl-6">Empresa</TableHead><TableHead>Estándares</TableHead><TableHead>Plan anual</TableHead><TableHead>Matriz</TableHead><TableHead>Firmados</TableHead><TableHead>Horas</TableHead><TableHead className="pr-6 text-right">Pendientes</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filas.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="pl-6"><Link href={`/empresas/${e.id}`} className="font-medium hover:underline">{e.nombre}</Link>{e.etapa === "diagnostico" && <Badge variant="outline" className="ml-2 border-violet-300 text-violet-700">En diagnóstico</Badge>}<div className="text-xs text-muted-foreground">NIT {e.nit} · Riesgo {ROMANO[e.claseRiesgo]} · {e.trabajadores} trab. · {e.nivel} estándares</div></TableCell>
                    <TableCell>{e.valoracion ? <Tip texto={`Autoevaluación del ${e.evaluacionFecha?.slice(0, 10)}`}><Badge variant={VARIANTE[e.valoracion]}>{e.puntaje}% · {e.valoracion.toLowerCase()}</Badge></Tip> : <span className="text-xs text-muted-foreground">Sin evaluar</span>}</TableCell>
                    <TableCell>{e.planTotal ? <Tip texto={`${e.planEjecutadas} de ${e.planTotal} actividades del año ejecutadas; ${e.planVencidas} vencidas`}><div className="w-20"><div className="text-xs">{pct(e.planEjecutadas, e.planTotal)}%</div><Progress value={pct(e.planEjecutadas, e.planTotal)} /></div></Tip> : <span className="text-xs text-muted-foreground">Sin plan este año</span>}</TableCell>
                    <TableCell className="text-xs"><Tip texto={`${e.peligros} peligros aprobados; ${e.prioritarios} en nivel I o II; ${e.sugeridosMatriz} sugeridos sin revisar`}><span>{e.peligros} · <span className={e.prioritarios ? "font-medium text-orange-700" : ""}>{e.prioritarios} prioritarios</span></span></Tip></TableCell>
                    <TableCell><Tip texto={`${e.docsGenerados} generados de ${e.docsAplicables} aplicables; ${e.docsVolverFirmar} por volver a firmar`}><div className="w-20"><div className="text-xs">{e.docsFirmados} / {e.docsAplicables}</div><Progress value={pct(e.docsFirmados, e.docsAplicables)} /></div></Tip></TableCell>
                    <TableCell className="text-xs">{e.contratoHorasMes ? <Tip texto={`${e.horasMes} de ${e.contratoHorasMes} horas pactadas este mes`}><div className="w-16"><div>{e.horasMes} / {e.contratoHorasMes} h</div><Progress value={Math.min(100, (e.horasMes / e.contratoHorasMes) * 100)} /></div></Tip> : e.horasMes ? `${e.horasMes} h` : "—"}</TableCell>
                    <TableCell className="pr-6 text-right">{e.motivos.length ? <Tip texto={<ul>{e.motivos.map((m) => <li key={m}>• {m}</li>)}</ul>}><Badge variant={e.prioridad >= 8 ? "destructive" : "outline"}>{e.motivos.length}</Badge></Tip> : <Badge variant="secondary">Al día</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>

          <div className="grid gap-6 md:grid-cols-2">
            <Section title="Cartera por nivel de estándares" description="Res. 0312/2019 arts. 3, 9 y 16.">
              <div className="space-y-2">{cartera.porNivel.map((x) => <div key={x.nivel} className="flex items-center gap-3 text-sm"><span className="w-28 shrink-0">{x.nivel} estándares</span><Progress className="flex-1" value={pct(x.n, cartera.empresas)} /><span className="w-6 text-right tabular-nums">{x.n}</span></div>)}</div>
            </Section>
            <Section title="Cartera por clase de riesgo" description="Clase de riesgo de la ARL (Decreto 768/2022).">
              <div className="space-y-2">{cartera.porRiesgo.map((x) => <div key={x.riesgo} className="flex items-center gap-3 text-sm"><span className="w-28 shrink-0">Riesgo {ROMANO[x.riesgo]}</span><Progress className="flex-1" value={pct(x.n, cartera.empresas)} /><span className="w-6 text-right tabular-nums">{x.n}</span></div>)}</div>
            </Section>
          </div>
        </>
      )}
    </Page>
  );
}
