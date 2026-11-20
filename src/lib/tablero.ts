import { parametrosPlazos } from "@/lib/plazos-servidor";
// Tablero de la consultora: indicadores por empresa y de toda la cartera, con una prioridad
// para decidir a qué cliente atender primero.
import { db } from "@/lib/db";
import { plazos } from "@/lib/eventos";
import { anioPlanVigente } from "@/lib/plan/generar";
import { estadoDocumento } from "@/lib/estado-documento";

export type FilaEmpresa = {
  id: string; nombre: string; nit: string; claseRiesgo: number; trabajadores: number; nivel: number;
  puntaje: number | null; valoracion: string | null; evaluacionFecha: string | null;
  planTotal: number; planEjecutadas: number; planVencidas: number;
  docsAplicables: number; docsGenerados: number; docsFirmados: number; docsVolverFirmar: number;
  accidentesAnio: number; plazosVencidos: number; accionesVencidas: number; sugeridosMatriz: number; peligros: number; prioritarios: number;
  matrizSinVersion: boolean; matrizVencida: boolean; horasMes: number; contratoHorasMes: number | null;
  prioridad: number; motivos: string[]; etapa: string;
};

export async function tableroConsultora(hoy = new Date()) {
  const params = await parametrosPlazos();
  const anio = hoy.getUTCFullYear();
  const empresas = await db.empresa.findMany({
    orderBy: { razonSocial: "asc" },
    select: {
      id: true, etapa: true, razonSocial: true, nit: true, claseRiesgo: true, nTrabajadoresPlanta: true, nEnMision: true, nivelEstandares: true, resultadoReglas: true,
      evaluaciones: { orderBy: { fecha: "desc" }, take: 1, select: { fecha: true, nivel: true, puntajeBruto: true, puntajeAjustado: true, valoracion: true } },
      actividades: { select: { anio: true, mes: true, estado: true } },
      documentos: { select: { estado: true, version: true, secciones: { select: { requiereRevision: true } }, archivos: { where: { activo: true, tipo: "DOCUMENTO_FIRMADO" }, orderBy: { subidoEn: "desc" }, take: 1, select: { documentoVersion: true } } } },
      eventos: { select: { tipo: true, fecha: true, gravedad: true, vinculacion: true, fechaReporte: true, reportadoArl: true, invEstado: true, invCierre: true, invRemitidaArl: true, reporteMinisterio: true } },
      acciones: { where: { estado: "abierta", fechaLimite: { lt: hoy } }, select: { id: true } },
      peligros: { select: { estado: true, nd: true, ne: true, nc: true } },
      matrizVersiones: { orderBy: { numero: "desc" }, take: 1, select: { fecha: true } },
      contratoHorasMes: true,
      visitas: { where: { fecha: { gte: new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), 1)) } }, select: { horas: true } },
    },
  });

  const filas: FilaEmpresa[] = empresas.map((e) => {
    const ev = e.evaluaciones[0];
    const puntaje = ev ? (ev.nivel === 60 ? ev.puntajeBruto : ev.puntajeAjustado) : null;
    const anioPlan = anioPlanVigente(e.actividades.filter((a) => a.anio >= anio), hoy);
    const plan = e.actividades.filter((a) => a.anio === anioPlan && a.estado !== "CANCELADA");
    const finMes = (a: { anio: number; mes: number }) => new Date(Date.UTC(a.anio, a.mes, 0, 23, 59));
    const vencidas = e.actividades.filter((a) => a.estado === "PENDIENTE" && finMes(a) < hoy).length;
    const estados = e.documentos.map((d) => estadoDocumento({ estado: d.estado, version: d.version, firmadoVersion: d.archivos[0]?.documentoVersion, revisar: d.secciones.some((s) => s.requiereRevision) }));
    const aplicables = ((e.resultadoReglas as { documentos?: unknown[] } | null)?.documentos ?? []).length || e.documentos.length;
    const plazosVencidos = e.eventos.flatMap((x) => plazos(x, hoy, params)).filter((p) => !p.hecho && (p.estado === "vencido" || p.estado === "por_vencer")).length;
    const aprobados = e.peligros.filter((p) => p.estado === "aprobado");
    const prioritarios = aprobados.filter((p) => p.nd * p.ne * p.nc >= 150).length; // NR ≥ 150: niveles I y II (GTC 45)
    const ultimaV = e.matrizVersiones[0];
    const matrizVencida = !!ultimaV && hoy.getTime() - ultimaV.fecha.getTime() > 365 * 864e5;
    const f: FilaEmpresa = {
      id: e.id, nombre: e.razonSocial, nit: e.nit, claseRiesgo: e.claseRiesgo, trabajadores: e.nTrabajadoresPlanta + e.nEnMision, nivel: e.nivelEstandares ?? 7,
      puntaje: puntaje ?? null, valoracion: ev?.valoracion ?? null, evaluacionFecha: ev?.fecha.toISOString() ?? null,
      planTotal: plan.length, planEjecutadas: plan.filter((a) => a.estado === "EJECUTADA").length, planVencidas: vencidas,
      docsAplicables: aplicables, docsGenerados: e.documentos.length, docsFirmados: estados.filter((x) => x === "firmado").length, docsVolverFirmar: estados.filter((x) => x === "volver_a_firmar").length,
      accidentesAnio: e.eventos.filter((x) => x.tipo === "AT" && x.fecha.getUTCFullYear() === anio).length, plazosVencidos, accionesVencidas: e.acciones.length,
      sugeridosMatriz: e.peligros.filter((p) => p.estado === "sugerido").length, peligros: aprobados.length, prioritarios,
      matrizSinVersion: !ultimaV, matrizVencida, horasMes: e.visitas.reduce((s, v) => s + v.horas, 0), contratoHorasMes: e.contratoHorasMes, prioridad: 0, motivos: [], etapa: e.etapa,
    };
    const m: [boolean, number, string][] = [
      [plazosVencidos > 0, 10, `${plazosVencidos} plazo(s) de accidentes`],
      [f.valoracion === "CRÍTICO", 6, "Estándares en estado crítico"],
      [!ev, 4, "Sin autoevaluación"],
      [f.accionesVencidas > 0, 3, `${f.accionesVencidas} acción(es) vencida(s)`],
      [vencidas > 0, Math.min(8, vencidas), `${vencidas} actividad(es) del plan vencida(s)`],
      [matrizVencida, 4, "Matriz con más de un año"],
      [f.docsVolverFirmar > 0, 2, `${f.docsVolverFirmar} documento(s) por volver a firmar`],
      [f.docsGenerados < aplicables, 2, `${aplicables - f.docsGenerados} documento(s) sin generar`],
      [f.sugeridosMatriz > 0, 1, `${f.sugeridosMatriz} peligro(s) sugerido(s) sin revisar`],
    ];
    if (e.etapa === "diagnostico") { f.prioridad = 3; f.motivos = ["En diagnóstico: falta iniciar el SG-SST"]; return f; }
    for (const [ok, pts, txt] of m) if (ok) { f.prioridad += pts; f.motivos.push(txt); }
    return f;
  });

  const conEval = filas.filter((f) => f.puntaje != null);
  const cartera = {
    empresas: filas.length,
    trabajadores: filas.reduce((s, f) => s + f.trabajadores, 0),
    cumplimientoPromedio: conEval.length ? Math.round(conEval.reduce((s, f) => s + (f.puntaje ?? 0), 0) / conEval.length) : null,
    criticas: filas.filter((f) => f.valoracion === "CRÍTICO").length,
    sinEvaluacion: filas.filter((f) => f.puntaje == null).length,
    planCumplimiento: (() => { const t = filas.reduce((s, f) => s + f.planTotal, 0); return t ? Math.round((filas.reduce((s, f) => s + f.planEjecutadas, 0) / t) * 100) : null; })(),
    docsFirmados: filas.reduce((s, f) => s + f.docsFirmados, 0), docsAplicables: filas.reduce((s, f) => s + f.docsAplicables, 0),
    accidentesAnio: filas.reduce((s, f) => s + f.accidentesAnio, 0),
    porNivel: [7, 21, 60].map((n) => ({ nivel: n, n: filas.filter((f) => f.nivel === n).length })),
    porRiesgo: [1, 2, 3, 4, 5].map((r) => ({ riesgo: r, n: filas.filter((f) => f.claseRiesgo === r).length })),
  };
  return { filas, cartera, prioridad: [...filas].filter((f) => f.prioridad > 0).sort((a, b) => b.prioridad - a.prioridad) };
}
