import { db } from "@/lib/db";
import { calcularMensuales, calcularAnuales, INDICADORES } from "@/lib/indicadores";
import { IndicadoresEditor } from "@/components/indicadores/editor";

export const dynamic = "force-dynamic";

export default async function Indicadores({ params, searchParams }: PageProps<"/empresas/[id]/indicadores">) {
  const { id } = await params;
  const anio = Number((await searchParams).anio) || new Date().getFullYear();
  const [e, eventos, tm, acts, ev] = await Promise.all([
    db.empresa.findUniqueOrThrow({ where: { id }, select: { nTrabajadoresPlanta: true, nEnMision: true, nContratistas: true, nAprendices: true, cargos: { select: { nombre: true } } } }),
    db.evento.findMany({ where: { empresaId: id }, orderBy: { fecha: "desc" } }),
    db.trabajadoresMes.findMany({ where: { empresaId: id } }),
    db.actividadPlan.findMany({ where: { empresaId: id, anio }, select: { estado: true } }),
    db.evaluacion.findFirst({ where: { empresaId: id, cerrada: true }, orderBy: { fecha: "desc" } }),
  ]);
  return (
    <IndicadoresEditor
      empresaId={id} anio={anio} trabajadoresBase={e.nTrabajadoresPlanta + e.nEnMision + e.nContratistas + e.nAprendices} cargos={e.cargos.map((c) => c.nombre)}
      mensuales={calcularMensuales(eventos, tm, anio, e.nTrabajadoresPlanta + e.nEnMision + e.nContratistas + e.nAprendices)} anuales={calcularAnuales(eventos, tm, anio, e.nTrabajadoresPlanta + e.nEnMision + e.nContratistas + e.nAprendices)}
      plan={acts.length ? Math.round((acts.filter((a) => a.estado === "EJECUTADA").length / acts.length) * 100) : null}
      estandares={ev ? (ev.nivel === 60 ? ev.puntajeBruto : ev.puntajeAjustado) : null}
      tm={tm.filter((t) => t.anio === anio).map((t) => ({ mes: t.mes, n: t.nTrabajadores, dias: t.diasProgramados }))}
      eventos={eventos.filter((x) => x.fecha.getFullYear() === anio).map((x) => ({ id: x.id, tipo: x.tipo, fecha: x.fecha.toISOString().slice(0, 10), descripcion: x.descripcion ?? "", cargo: x.cargo ?? "", dias: x.diasIncapacidad, mortal: x.mortal, reportado: x.reportadoArl }))}
      fichas={INDICADORES}
    />
  );
}
