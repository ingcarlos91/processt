import Link from "next/link";
import { comparativoDiagnostico } from "@/lib/diagnostico";
import { BotonIniciarSgsst } from "@/components/diagnostico/acciones";
import { BotonInformeGestion } from "@/components/empresa/informe-gestion";
import { estadoDocumento } from "@/lib/estado-documento";
import { AlertTriangle, Check, ClipboardList, FileText, ListChecks, ShieldAlert, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { buttonVariants } from "@/components/ui/button";
import { MESES } from "@/lib/plan/generar";
import { calcular } from "@/lib/gtc45";
import { BotonGenerarTodo } from "@/components/empresa/acciones";
import { Porque } from "@/components/app/porque";
import { explicarNivel, explicarConteo } from "@/lib/reglas/explicar";
import { plazos, TIPOS_EVENTO } from "@/lib/eventos";

export const dynamic = "force-dynamic";

export default async function Resumen({ params }: PageProps<"/empresas/[id]">) {
  const { id } = await params;
  const rr = await recalcularEmpresa(id);
  const e = await db.empresa.findUniqueOrThrow({
    where: { id },
    include: {
      evaluaciones: { orderBy: { fecha: "desc" }, take: 1 }, documentos: { select: { estado: true, version: true, secciones: { select: { requiereRevision: true } }, archivos: { where: { activo: true, tipo: "DOCUMENTO_FIRMADO" }, orderBy: { subidoEn: "desc" }, take: 1, select: { documentoVersion: true } } } },
      actividades: { where: { anio: { in: [new Date().getFullYear(), new Date().getFullYear() + 1] } } }, peligros: { select: { nd: true, ne: true, nc: true, estado: true } }, comites: true, cargos: true,
    },
  });
  const ev = e.evaluaciones[0];
  const anioAct = e.actividades.some((a) => a.anio === new Date().getFullYear()) ? new Date().getFullYear() : new Date().getFullYear() + 1;
  e.actividades = e.actividades.filter((a) => a.anio === anioAct);
  const puntaje = ev ? (ev.nivel === 60 ? ev.puntajeBruto : ev.puntajeAjustado) : null;
  const ej = e.actividades.filter((a) => a.estado === "EJECUTADA").length;
  const mes = anioAct > new Date().getFullYear() ? 1 : new Date().getMonth() + 1;
  const proximas = e.actividades.filter((a) => a.estado === "PENDIENTE" && a.mes >= mes).sort((a, b) => a.mes - b.mes).slice(0, 8);
  const vencidas = e.actividades.filter((a) => a.estado === "PENDIENTE" && a.mes < mes).length;
  const niveles = e.peligros.filter((p) => p.estado === "aprobado").map((p) => calcular(p.nd, p.ne, p.nc).nivel);
  const sugeridos = e.peligros.filter((p) => p.estado === "sugerido").length;
  const revisar = e.documentos.reduce((s, d) => s + d.secciones.filter((x) => x.requiereRevision).length, 0);

  const alertas: string[] = [...rr.advertencias];
  if (!e.cargos.length) alertas.push("No hay cargos registrados: la matriz de peligros no se puede construir.");
  if (sugeridos) alertas.push(`Hay ${sugeridos} peligros sugeridos pendientes de aprobar en la matriz.`);
  if (revisar) alertas.push(`Hay ${revisar} secciones de documentos editadas manualmente cuyo texto generado cambió: revíselas.`);
  const en60 = new Date(); en60.setDate(en60.getDate() + 60);
  for (const c of e.comites) if (c.periodoFin && c.periodoFin < en60) alertas.push(`El periodo del ${c.tipo} vence el ${c.periodoFin.toLocaleDateString("es-CO")}: convoque elecciones.`);
  if (vencidas) alertas.push(`${vencidas} actividades del plan anual están vencidas.`);

  // Plazos de reporte e investigación vencidos o por vencer (Decreto Ley 1295/1994; Res. 1401/2007).
  const eventosAbiertos = await db.evento.findMany({ where: { empresaId: id, OR: [{ invEstado: { in: ["pendiente", "en_curso"] } }, { reportadoArl: false, tipo: { in: ["AT", "EL"] } }] } });
  const [etapa, comparativo] = await Promise.all([db.empresa.findUniqueOrThrow({ where: { id }, select: { etapa: true } }).then((x) => x.etapa), comparativoDiagnostico(id)]);
  const alertasEventos = eventosAbiertos.flatMap((ev) => plazos(ev).filter((p) => p.estado === "vencido" || p.estado === "por_vencer").map((p) => ({ ev, p })));
  return (
    <>
      {alertasEventos.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>Accidentes e incidentes: {alertasEventos.length} plazo(s) vencido(s) o por vencer</AlertTitle>
          <AlertDescription>
            <ul className="space-y-0.5">
              {alertasEventos.slice(0, 5).map(({ ev, p }) => <li key={ev.id + p.clave}><Link className="underline underline-offset-2" href={`/empresas/${id}/accidentes/${ev.id}`}>{TIPOS_EVENTO[ev.tipo].t} del {ev.fecha.toISOString().slice(0, 10).split("-").reverse().join("/")}</Link>: {p.t.toLowerCase()} ({p.estado === "vencido" ? "vencido" : "vence pronto"}) <NormaRef>{p.normaRef}</NormaRef></li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      {etapa === "diagnostico" && (
        <Alert>
          <ClipboardList />
          <AlertTitle>Empresa en etapa de diagnóstico</AlertTitle>
          <AlertDescription>Aún no se ha montado el SG-SST. Haga o termine el diagnóstico, entregue el informe y luego inicie el sistema; también puede iniciarlo sin diagnóstico.</AlertDescription>
          <AlertAction className="flex flex-wrap gap-2"><Link href={`/empresas/${id}/diagnostico`} className={buttonVariants({ size: "sm" })}>Ir al diagnóstico</Link><BotonIniciarSgsst empresaId={id} variant="outline" label="Iniciar sin diagnóstico" /></AlertAction>
        </Alert>
      )}
      {comparativo?.actual && (
        <Section title="Avance desde el diagnóstico" description={`Línea base del ${comparativo.fecha} frente a la autoevaluación del ${comparativo.actual.fecha}.`}>
          <div className="grid gap-3 sm:grid-cols-5">
            {[["Global", comparativo.base.puntaje, comparativo.actual.puntaje] as const, ...(["PLANEAR", "HACER", "VERIFICAR", "ACTUAR"] as const).map((k) => [k.charAt(0) + k.slice(1).toLowerCase(), comparativo.base.porCiclo[k]?.pct ?? null, comparativo.actual!.porCiclo[k]?.pct ?? null] as const)].map(([t, a, b]) => (
              <div key={t} className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">{t}</div>
                <div className="mt-1 flex items-baseline gap-2"><span className="text-sm text-muted-foreground">{a ?? "—"}%</span><span className="text-xs">→</span><span className="text-xl font-semibold">{b ?? "—"}%</span></div>
                {a != null && b != null && <div className={b - a >= 0 ? "text-xs text-emerald-700" : "text-xs text-red-600"}>{b - a >= 0 ? "+" : ""}{Math.round(b - a)} puntos</div>}
              </div>
            ))}
          </div>
        </Section>
      )}
      {comparativo && !comparativo.actual && <p className="text-sm text-muted-foreground">Línea base del diagnóstico ({comparativo.fecha}): {comparativo.base.puntaje}% · {comparativo.base.valoracion}. El avance se mostrará al cerrar la próxima autoevaluación.</p>}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Estándares mínimos" value={rr.nivel} hint={<NormaRef>{rr.nivelNormaRef}</NormaRef>} porque={<>{explicarNivel(rr.nivel, rr.trabajadores, e.claseRiesgo)} {explicarConteo(e)}</>} normas={[rr.nivelNormaRef]} />
        <Stat label="Última evaluación" value={puntaje != null && ev?.valoracion ? `${puntaje}%` : "—"} hint={ev?.valoracion ?? "Sin evaluación cerrada"} tone={ev?.valoracion === "ACEPTABLE" ? "ok" : ev?.valoracion === "CRÍTICO" ? "bad" : ev?.valoracion ? "warn" : undefined} />
        <Stat label="Plan anual" value={e.actividades.length ? `${Math.round((ej / e.actividades.length) * 100)}%` : "—"} hint={`${ej} de ${e.actividades.length} actividades`} />
        <Stat porque="Son los riesgos de nivel I y II según la GTC 45: “no aceptables”. Deben intervenirse primero y pasan al plan anual." normas={["GTC 45", "Decreto 1072/2015 art. 2.2.4.6.24"]} label="Riesgos prioritarios (I y II)" value={niveles.filter((n) => n === "I" || n === "II").length} hint={`${niveles.length} peligros en la matriz`} tone={niveles.includes("I") ? "bad" : undefined} />
        <Stat label="Documentos" value={`${e.documentos.length} / ${rr.documentos.length}`} hint={(() => {
          const est = e.documentos.map((d) => estadoDocumento({ estado: d.estado, version: d.version, firmadoVersion: d.archivos[0]?.documentoVersion, revisar: d.secciones.some((x) => x.requiereRevision) }));
          const n = (k: string) => est.filter((x) => x === k).length;
          return `${n("firmado")} firmados · ${n("aprobado")} aprobados · ${n("borrador") + n("por_revisar")} en borrador${n("volver_a_firmar") ? ` · ${n("volver_a_firmar")} por volver a firmar` : ""}`;
        })()} />
      </div>

      {alertas.length > 0 && (
        <Alert>
          <AlertTriangle />
          <AlertTitle>Alertas</AlertTitle>
          <AlertDescription><ul className="list-disc pl-4 space-y-0.5">{alertas.map((a, i) => <li key={i}>{a}</li>)}</ul></AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <BotonGenerarTodo empresaId={id} />
        <Link href={`/empresas/${id}/matriz`} className={buttonVariants({ variant: "outline" })}><ShieldAlert /> Matriz de peligros</Link>
        <Link href={`/empresas/${id}/evaluacion`} className={buttonVariants({ variant: "outline" })}><ListChecks /> Evaluación</Link>
        <Link href={`/empresas/${id}/documentos`} className={buttonVariants({ variant: "outline" })}><FileText /> Documentos</Link>
        <Link href={`/empresas/${id}/plan`} className={buttonVariants({ variant: "outline" })}><CalendarDays /> Plan anual</Link>
        <div className="flex-1" />
        <BotonInformeGestion empresaId={id} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Qué exige la norma a esta empresa" description="Conclusiones del motor de reglas con su fundamento.">
          <ul className="space-y-2 text-sm">
            {rr.conclusiones.map((c, i) => (
              <li key={i} className="flex gap-2 items-start"><Check className="size-4 mt-0.5 text-emerald-600 shrink-0" /><span className="flex-1">{c.tipo === "comite" ? `Comité requerido: ${c.valor}` : c.valor} <NormaRef>{c.normaRef}</NormaRef> <Porque normas={[c.normaRef]}>{c.porque}</Porque></span></li>
            ))}
          </ul>
        </Section>
        <Section title="Próximas actividades del plan anual" actions={<Link href={`/empresas/${id}/plan`} className="text-sm underline">Ver plan</Link>}>
          {proximas.length ? (
            <div className="flex flex-col gap-1">{proximas.map((a) => <Item key={a.id}><Badge variant="outline" className="w-20 justify-center">{MESES[a.mes - 1]}</Badge><ItemContent><ItemTitle>{a.nombre}</ItemTitle></ItemContent>{a.estandarCodigo && <NormaRef>{a.estandarCodigo}</NormaRef>}</Item>)}</div>
          ) : <p className="text-sm text-muted-foreground">Genere el plan anual desde la pestaña Plan anual.</p>}
        </Section>
        <Section title={`Documentos aplicables (${rr.documentos.length})`} className="lg:col-span-2">
          <div className="grid md:grid-cols-2 gap-x-6 gap-y-1">
            {rr.documentos.map((d) => <Item key={d.codigo}><Badge variant="outline" className="font-mono">{d.codigo}</Badge><ItemContent><ItemTitle>{d.nombre} <Porque titulo={`¿Por qué ${d.codigo}?`} normas={d.normas}>{d.porque}</Porque></ItemTitle></ItemContent></Item>)}
          </div>
        </Section>
      </div>
    </>
  );
}
