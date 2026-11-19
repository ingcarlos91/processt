import Link from "next/link";
import { AlertTriangle, Check, FileText, ListChecks, ShieldAlert, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";
import { buttonVariants } from "@/components/ui/button";
import { MESES } from "@/lib/plan/generar";
import { calcular } from "@/lib/gtc45";
import { BotonGenerarTodo } from "@/components/empresa/acciones";

export const dynamic = "force-dynamic";

export default async function Resumen({ params }: PageProps<"/empresas/[id]">) {
  const { id } = await params;
  const rr = await recalcularEmpresa(id);
  const e = await db.empresa.findUniqueOrThrow({
    where: { id },
    include: {
      evaluaciones: { orderBy: { fecha: "desc" }, take: 1 }, documentos: { select: { estado: true, secciones: { select: { requiereRevision: true } } } },
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

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="Estándares mínimos" value={rr.nivel} hint={<NormaRef>{rr.nivelNormaRef}</NormaRef>} />
        <Stat label="Última evaluación" value={puntaje != null && ev?.valoracion ? `${puntaje}%` : "—"} hint={ev?.valoracion ?? "Sin evaluación cerrada"} tone={ev?.valoracion === "ACEPTABLE" ? "ok" : ev?.valoracion === "CRÍTICO" ? "bad" : ev?.valoracion ? "warn" : undefined} />
        <Stat label="Plan anual" value={e.actividades.length ? `${Math.round((ej / e.actividades.length) * 100)}%` : "—"} hint={`${ej} de ${e.actividades.length} actividades`} />
        <Stat label="Riesgos prioritarios (I y II)" value={niveles.filter((n) => n === "I" || n === "II").length} hint={`${niveles.length} peligros en la matriz`} tone={niveles.includes("I") ? "bad" : undefined} />
        <Stat label="Documentos" value={e.documentos.length} hint={`${e.documentos.filter((d) => d.estado !== "BORRADOR").length} aprobados o firmados de ${rr.documentos.length} aplicables`} />
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
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Qué exige la norma a esta empresa" description="Conclusiones del motor de reglas con su fundamento.">
          <ul className="space-y-2 text-sm">
            {rr.conclusiones.map((c, i) => (
              <li key={i} className="flex gap-2 items-start"><Check className="size-4 mt-0.5 text-emerald-600 shrink-0" /><span className="flex-1">{c.tipo === "comite" ? `Comité requerido: ${c.valor}` : c.valor} <NormaRef>{c.normaRef}</NormaRef></span></li>
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
            {rr.documentos.map((d) => <Item key={d.codigo}><Badge variant="outline" className="font-mono">{d.codigo}</Badge><ItemContent><ItemTitle>{d.nombre}</ItemTitle></ItemContent></Item>)}
          </div>
        </Section>
      </div>
    </>
  );
}
