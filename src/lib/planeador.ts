import { valorPlazo } from "@/lib/plazos";
import { parametrosPlazos } from "@/lib/plazos-servidor";
// Planeador: reúne en un solo calendario todas las fechas que la consultora debe tener en cuenta,
// por empresa. Cada fecha cita la norma que la origina y enlaza a donde se gestiona.
import { db } from "@/lib/db";
import { plazos, sumarHabiles } from "@/lib/eventos";

export type Categoria = "plan" | "comite" | "accidente" | "accion" | "matriz" | "evaluacion" | "responsable" | "examen" | "epp" | "inspeccion" | "auditoria" | "visita" | "recordatorio" | "legal";
export type EstadoFecha = "vencido" | "hoy" | "proximo" | "pendiente" | "hecho";

export type Fecha = {
  id: string; empresaId: string | null; empresa: string; fecha: string; titulo: string; detalle?: string;
  categoria: Categoria; estado: EstadoFecha; normaRef?: string; href: string; mesCompleto?: boolean; recordatorioId?: string;
};

export const CATEGORIAS: Record<Categoria, { t: string; color: string }> = {
  plan: { t: "Plan anual", color: "bg-sky-500" },
  comite: { t: "Comités", color: "bg-violet-500" },
  accidente: { t: "Accidentes", color: "bg-red-500" },
  accion: { t: "Acciones", color: "bg-orange-500" },
  matriz: { t: "Matriz de peligros", color: "bg-amber-500" },
  evaluacion: { t: "Autoevaluación", color: "bg-emerald-500" },
  responsable: { t: "Responsable SG-SST", color: "bg-teal-500" },
  examen: { t: "Exámenes médicos", color: "bg-pink-500" },
  legal: { t: "Obligaciones legales periódicas", color: "bg-indigo-500" },
  epp: { t: "Reposición de EPP", color: "bg-lime-600" },
  inspeccion: { t: "Inspecciones", color: "bg-indigo-500" },
  auditoria: { t: "Auditoría interna", color: "bg-fuchsia-600" },
  visita: { t: "Visitas realizadas", color: "bg-cyan-600" },
  recordatorio: { t: "Mis recordatorios", color: "bg-slate-500" },
};

const DIA = 864e5;
const finDeMes = (anio: number, mes: number) => new Date(Date.UTC(anio, mes, 0, 12));
const masAnios = (d: Date, n: number) => { const r = new Date(d); r.setUTCFullYear(r.getUTCFullYear() + n); return r; };
const iso = (d: Date) => d.toISOString();

let ventanaProximo = 14; // días de anticipación para "próximo" (plazo aviso_proximo de src/lib/plazos.ts)
function estadoDe(fecha: Date, hecho: boolean, hoy: Date): EstadoFecha {
  if (hecho) return "hecho";
  const d0 = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
  const f0 = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
  if (f0 < d0) return "vencido";
  if (f0 === d0) return "hoy";
  return f0 - d0 <= ventanaProximo * DIA ? "proximo" : "pendiente";
}

/** Todas las fechas de una empresa (o de todas) entre `desde` y `hasta`. Los vencidos sin cumplir se incluyen siempre. */
export async function fechasPlaneador({ empresaId, desde, hasta, hoy = new Date() }: { empresaId?: string; desde: Date; hasta: Date; hoy?: Date }): Promise<Fecha[]> {
  const params = await parametrosPlazos();
  ventanaProximo = valorPlazo("aviso_proximo", params);
  const where = empresaId ? { id: empresaId } : {};
  const empresas = await db.empresa.findMany({
    where, select: {
      id: true, razonSocial: true, responsableSst: true, resultadoReglas: true, creadoEn: true,
      actividades: { where: { origen: { not: "accion" } }, select: { id: true, anio: true, mes: true, nombre: true, estado: true, normaRef: true } },
      comites: { select: { id: true, tipo: true, periodoFin: true, normaRef: true } },
      eventos: { select: { id: true, tipo: true, fecha: true, gravedad: true, vinculacion: true, fechaReporte: true, reportadoArl: true, invEstado: true, invCierre: true, invRemitidaArl: true, reporteMinisterio: true, trabajadorNombre: true } },
      acciones: { where: { fechaLimite: { not: null } }, select: { id: true, descripcion: true, fechaLimite: true, estado: true, eventoId: true } },
      matrizVersiones: { orderBy: { numero: "desc" }, take: 1, select: { numero: true, fecha: true } },
      evaluaciones: { orderBy: { fecha: "desc" }, select: { fecha: true, anio: true, tipo: true, cerrada: true, valoracion: true } },
      capacitaciones: { where: { OR: [{ tema: { contains: "altura", mode: "insensitive" } }, { tema: { contains: "confinad", mode: "insensitive" } }] }, orderBy: { fecha: "desc" }, select: { id: true, fecha: true, tema: true, asistentes: { where: { aprobo: { not: false } }, select: { trabajadorId: true, trabajador: { select: { nombres: true, activo: true } } } } } },
      recordatorios: true,
      inspecciones: { orderBy: { fecha: "desc" }, select: { lista: true, fecha: true } },
      auditorias: { orderBy: { fechaInicio: "desc" }, take: 1, select: { id: true, anio: true, fechaInicio: true, estado: true } },
      visitas: { where: { fecha: { gte: desde, lte: hasta } }, select: { id: true, fecha: true, horas: true, actividades: true } },
      trabajadores: { where: { OR: [{ activo: true }, { fechaRetiro: { gte: new Date(Date.now() - 90 * 864e5) } }] }, select: { id: true, nombres: true, activo: true, fechaRetiro: true, examenes: { orderBy: { fecha: "desc" }, take: 3, select: { adaptacionFecha: true, id: true, proximo: true, tipo: true, fecha: true, concepto: true } }, entregasEpp: { where: { proximaReposicion: { not: null } }, orderBy: { fecha: "desc" }, select: { id: true, elemento: true, proximaReposicion: true } } } },
    },
  });
  const out: Fecha[] = [];
  const frecuencias = new Map((await db.catalogoItem.findMany({ where: { tipo: "LISTA_INSPECCION" }, select: { nombre: true, detalle: true } })).map((l) => [l.nombre, Number((l.detalle as { frecuenciaDias?: number })?.frecuenciaDias) || 0]));
  const dentro = (f: Date, hecho: boolean) => (f >= desde && f <= hasta) || (!hecho && f < desde && f.getTime() > desde.getTime() - 400 * DIA);
  const NOMBRE_COMITE: Record<string, string> = { COPASST: "COPASST", VIGIA: "Vigía de SST", CCL: "Comité de Convivencia Laboral", BRIGADA: "Brigada" };

  for (const e of empresas) {
    const base = `/empresas/${e.id}`;
    const add = (x: Omit<Fecha, "empresaId" | "empresa">) => out.push({ ...x, empresaId: e.id, empresa: e.razonSocial });
    const addBase = add;

    for (const a of e.actividades) {
      const f = finDeMes(a.anio, a.mes), hecho = a.estado === "EJECUTADA" || a.estado === "CANCELADA";
      if (dentro(f, hecho)) add({ id: `plan-${a.id}`, fecha: iso(f), titulo: a.nombre, categoria: "plan", estado: estadoDe(f, hecho, hoy), normaRef: a.normaRef ?? undefined, href: `${base}/plan`, mesCompleto: true });
    }
    for (const c of e.comites) {
      if (!c.periodoFin || c.tipo === "BRIGADA") continue;
      if (dentro(c.periodoFin, false)) add({ id: `comite-${c.id}`, fecha: iso(c.periodoFin), titulo: `Termina el periodo del ${NOMBRE_COMITE[c.tipo] ?? c.tipo}: conformar el nuevo`, detalle: "El periodo es de dos años. Programe la convocatoria y la elección o designación antes de esta fecha.", categoria: "comite", estado: estadoDe(c.periodoFin, false, hoy), normaRef: c.normaRef ?? undefined, href: `${base}/comites` });
    }
    for (const ev of e.eventos) {
      for (const p of plazos(ev, hoy, params)) {
        if (p.hecho) continue;
        if (dentro(p.vence, false)) add({ id: `ev-${ev.id}-${p.clave}`, fecha: iso(p.vence), titulo: `${p.t}${ev.trabajadorNombre ? ` — ${ev.trabajadorNombre}` : ""}`, detalle: p.porque, categoria: "accidente", estado: estadoDe(p.vence, false, hoy), normaRef: p.normaRef, href: `${base}/accidentes/${ev.id}` });
      }
    }
    for (const a of e.acciones) {
      const hecho = a.estado === "cerrada";
      if (a.fechaLimite && dentro(a.fechaLimite, hecho)) add({ id: `accion-${a.id}`, fecha: iso(a.fechaLimite), titulo: `Acción: ${a.descripcion}`, categoria: "accion", estado: estadoDe(a.fechaLimite, hecho, hoy), normaRef: "Decreto 1072/2015 art. 2.2.4.6.33", href: a.eventoId ? `${base}/accidentes/${a.eventoId}` : `${base}/documentos/FOR-06` });
    }
    const v = e.matrizVersiones[0];
    if (v) {
      const f = masAnios(v.fecha, valorPlazo("matriz_anual"));
      if (dentro(f, false)) add({ id: `matriz-${e.id}`, fecha: iso(f), titulo: `Actualización anual de la matriz de peligros (última: v${v.numero})`, categoria: "matriz", estado: estadoDe(f, false, hoy), normaRef: "Decreto 1072/2015 art. 2.2.4.6.15", href: `${base}/matriz` });
    }
    // Reporte de avance del plan de mejoramiento a la ARL según la valoración de la última evaluación cerrada (Res. 0312/2019 art. 28).
    const evCerrada = e.evaluaciones.find((x) => x.cerrada);
    const mesesArl = evCerrada?.valoracion === "CRÍTICO" ? valorPlazo("arl_critico") : evCerrada?.valoracion === "MODERADAMENTE ACEPTABLE" ? valorPlazo("arl_moderado") : 0;
    if (evCerrada && mesesArl) {
      const f = new Date(evCerrada.fecha); f.setUTCMonth(f.getUTCMonth() + mesesArl);
      const hecho = e.evaluaciones.some((x) => x.cerrada && x.fecha > evCerrada.fecha);
      if (dentro(f, hecho)) add({ id: `arl-avance-${e.id}-${evCerrada.fecha.toISOString().slice(0, 10)}`, fecha: iso(f), titulo: `Enviar a la ARL el reporte de avances del plan de mejoramiento (valoración ${evCerrada.valoracion!.toLowerCase()})`, detalle: `La ${evCerrada.tipo === "inicial" ? "evaluación inicial" : `autoevaluación ${evCerrada.anio}`} del ${evCerrada.fecha.toISOString().slice(0, 10)} quedó ${evCerrada.valoracion!.toLowerCase()}: el reporte de avances va a la ARL en máximo ${mesesArl === 3 ? "tres (3)" : "seis (6)"} meses.`, categoria: "evaluacion", estado: estadoDe(f, hecho, hoy), normaRef: "Res. 0312/2019 art. 28", href: `${base}/evaluacion` });
    }
    // Reentrenamiento y actualización de la formación en tareas de alto riesgo.
    {
      const rrN = new Set(((e.resultadoReglas ?? {}) as { normas?: { codigo: string }[] }).normas?.map((n) => n.codigo) ?? []);
      const tareaFormacion = (clave: string, re: RegExp, meses: number, titulo: string, detalle: string, normaRef: string) => {
        const caps = e.capacitaciones.filter((c) => re.test(c.tema));
        if (!caps.length) return;
        // Por trabajador activo: su última formación registrada con asistencia.
        const ultima = new Map<string, { fecha: Date; nombre: string }>();
        for (const c of caps) for (const a of c.asistentes) if (a.trabajador.activo && !ultima.has(a.trabajadorId)) ultima.set(a.trabajadorId, { fecha: c.fecha, nombre: a.trabajador.nombres });
        const vence = (d: Date) => { const f = new Date(d); f.setUTCMonth(f.getUTCMonth() + meses); return f; };
        if (ultima.size) {
          for (const [tid, u] of ultima) { const f = vence(u.fecha); if (dentro(f, false)) add({ id: `${clave}-${tid}`, fecha: iso(f), titulo: `${titulo} — ${u.nombre}`, detalle: `${detalle} Última formación registrada: ${u.fecha.toISOString().slice(0, 10)}.`, categoria: "legal", estado: estadoDe(f, false, hoy), normaRef, href: `${base}/trabajadores` }); }
        } else {
          // Sin asistentes registrados no se sabe quién está autorizado: una tarea para la empresa desde la última formación.
          const f = vence(caps[0].fecha);
          if (dentro(f, false)) add({ id: `${clave}-${e.id}`, fecha: iso(f), titulo, detalle: `${detalle} Última formación registrada: ${caps[0].fecha.toISOString().slice(0, 10)} (${caps[0].tema}); registre los asistentes para programarlo por trabajador.`, categoria: "legal", estado: estadoDe(f, false, hoy), normaRef, href: `${base}/trabajadores` });
        }
      };
      if (rrN.has("RES-4272-2021")) tareaFormacion("alturas-reent", /altura/i, valorPlazo("alturas_reentrenamiento"), "Reentrenamiento de actualización en trabajo en alturas", "El trabajador autorizado que lleva 18 meses en la empresa sin cambiar de actividad hace un reentrenamiento de mínimo 8 horas (20 % teoría, 80 % práctica), presencial y a cargo del empleador; se reporta a la ARL.", "Res. 4272/2021 art. 27 num. 4 lit. b");
      if (rrN.has("RES-0491-2020")) tareaFormacion("confinado-act", /confinad/i, valorPlazo("confinados_actualizacion") * 12, "Actualización de la formación en espacios confinados", "La formación para trabajo en espacios confinados se actualiza cada tres (3) años, a cargo del empleador.", "Res. 0491/2020 art. 30 par. (adicionado por la Res. 2605/2020 art. 3)");
    }
    const r = (e.responsableSst ?? {}) as { nombre?: string; curso50h?: boolean; curso50hFecha?: string; curso20hFecha?: string };
    // Desde el último certificado: el de 50 horas o la última actualización de 20 horas (Res. 4927/2016 art. 16).
    const ultimoCurso = [r.curso50hFecha, r.curso20hFecha].filter((x): x is string => /^\d{4}-\d{2}-\d{2}$/.test(x ?? "")).sort().pop();
    if (r.curso50h && ultimoCurso) {
      const f = masAnios(new Date(ultimoCurso + "T12:00:00Z"), valorPlazo("curso_20h"));
      if (dentro(f, false)) add({ id: `curso-${e.id}`, fecha: iso(f), titulo: `Actualización del curso virtual de 20 horas${r.nombre ? ` — ${r.nombre}` : ""}`, detalle: "El responsable del SG-SST actualiza el curso de 50 horas con un curso de 20 horas cada tres años.", categoria: "responsable", estado: estadoDe(f, false, hoy), normaRef: "Res. 4927/2016", href: `${base}/datos` });
    }
    // Próxima inspección de cada lista usada, según su frecuencia en la biblioteca.
    const vistasInsp = new Set<string>();
    for (const ins of e.inspecciones) {
      if (vistasInsp.has(ins.lista)) continue; vistasInsp.add(ins.lista);
      const dias = frecuencias.get(ins.lista);
      if (!dias) continue;
      const f = new Date(ins.fecha.getTime() + dias * DIA);
      if (dentro(f, false)) add({ id: `insp-${e.id}-${ins.lista}`, fecha: iso(f), titulo: `Próxima ${ins.lista.toLowerCase()}`, detalle: `Frecuencia sugerida: cada ${dias} días. Última: ${ins.fecha.toISOString().slice(0, 10)}.`, categoria: "inspeccion", estado: estadoDe(f, false, hoy), normaRef: "Res. 0312/2019 estándar 4.2.4", href: `${base}/inspecciones` });
    }
    for (const t of e.trabajadores) {
      // Res. 1843/2025 art. 11: evaluación de egreso dentro de los 5 días hábiles siguientes al retiro.
      if (!t.activo && t.fechaRetiro) {
        const hecho = t.examenes.find((x) => /retiro|egreso/i.test(x.tipo) && x.fecha >= t.fechaRetiro!);
        const f = sumarHabiles(t.fechaRetiro, valorPlazo("egreso"));
        if (dentro(f, !!hecho)) add({ id: `egr-${t.id}`, fecha: iso(f), titulo: `Evaluación médica de egreso — ${t.nombres}`, detalle: "Al terminar el contrato, la empresa ordena la evaluación de egreso dentro de los 5 días hábiles siguientes y conserva la constancia de haberla notificado al trabajador.", categoria: "examen", estado: estadoDe(f, !!hecho, hoy), normaRef: "Res. 1843/2025 art. 11", href: `${base}/trabajadores` });
      }
      // Res. 1843/2025 art. 5 lit. f: adaptar las condiciones de trabajo a las restricciones en máximo 20 días hábiles.
      const conRestr = t.activo ? t.examenes.find((x) => x.concepto === "apto_restricciones") : undefined;
      if (conRestr) {
        const f = sumarHabiles(conRestr.fecha, valorPlazo("adaptacion"));
        const hecho = conRestr.adaptacionFecha ?? null;
        if (dentro(f, !!hecho) && f.getTime() > hoy.getTime() - 60 * DIA) add({ id: `adapt-${conRestr.id}`, fecha: iso(f), titulo: `Adaptar el puesto a las restricciones médicas — ${t.nombres}`, detalle: "Implementar las restricciones o recomendaciones del concepto médico y dejar constancia (reubicación, ajuste de tareas o de jornada).", categoria: "examen", estado: estadoDe(f, !!hecho, hoy), normaRef: "Res. 1843/2025 art. 5 lit. f; Ley 776/2002 arts. 4 y 8", href: `${base}/trabajadores` });
      }
      if (!t.activo) continue;
      const x = t.examenes[0];
      if (x?.proximo && dentro(x.proximo, false)) add({ id: `exa-${x.id}`, fecha: iso(x.proximo), titulo: `Examen médico periódico — ${t.nombres}`, detalle: "Programe la evaluación médica ocupacional según el profesiograma.", categoria: "examen", estado: estadoDe(x.proximo, false, hoy), normaRef: "Res. 1843/2025", href: `${base}/trabajadores` });
      // Solo la última entrega de cada elemento cuenta para la reposición.
      const vistos = new Set<string>();
      for (const ep of t.entregasEpp) {
        if (vistos.has(ep.elemento)) continue; vistos.add(ep.elemento);
        if (ep.proximaReposicion && dentro(ep.proximaReposicion, false)) add({ id: `epp-${ep.id}`, fecha: iso(ep.proximaReposicion), titulo: `Reposición de EPP: ${ep.elemento} — ${t.nombres}`, categoria: "epp", estado: estadoDe(ep.proximaReposicion, false, hoy), normaRef: "Decreto 1072/2015 art. 2.2.4.6.24", href: `${base}/trabajadores` });
      }
    }
    // Obligaciones legales periódicas que no dependen de un registro previo.
    {
      const rr = (e.resultadoReglas ?? {}) as { documentos?: { codigo: string }[]; comites?: string[] };
      const docs = new Set((rr.documentos ?? []).map((d) => d.codigo));
      // Solo desde que la empresa entró a PROCESST: lo anterior no se muestra como vencido el primer día.
      const inicio = new Date(e.creadoEn); inicio.setUTCHours(0, 0, 0, 0);
      const add = (x: Parameters<typeof addBase>[0]) => { if (new Date(x.fecha) >= inicio) addBase(x); };
      const anios = new Set<number>(); for (let y = desde.getUTCFullYear(); y <= hasta.getUTCFullYear(); y++) anios.add(y);
      for (const y of anios) {
        const fecha = (m: number, d: number) => new Date(Date.UTC(y, m - 1, d, 12));
        // Autoevaluación de estándares mínimos cada diciembre, con el plan de mejoramiento y el plan anual del año siguiente (Res. 0312/2019 art. 26).
        { const f = fecha(12, 31); const hecho = e.evaluaciones.some((x) => x.cerrada && (x.anio === y && x.tipo === "anual" || x.fecha.getUTCFullYear() === y && x.fecha.getUTCMonth() === 11)); if (dentro(f, hecho)) add({ id: `eval-${e.id}-${y}`, fecha: iso(f), titulo: `Autoevaluación anual de estándares mínimos ${y}`, detalle: "Se hace en diciembre de cada año; con su resultado se actualizan el plan de mejoramiento y el plan anual de trabajo que arranca el 1 de enero.", categoria: "evaluacion", estado: estadoDe(f, hecho, hoy), normaRef: "Res. 0312/2019 art. 26", href: `${base}/evaluacion`, mesCompleto: true }); }
        // Julio: informe de avance del plan de mejoramiento (art. 28) y registro de la autoevaluación y el plan en el Fondo de Riesgos Laborales.
        { const f = fecha(7, 31); if (dentro(f, false)) add({ id: `avance-jul-${e.id}-${y}`, fecha: iso(f), titulo: "Informe de avance del plan de mejoramiento (julio)", detalle: "Informe de avance de las acciones del plan de mejoramiento, teniendo en cuenta las recomendaciones de la ARL.", categoria: "evaluacion", estado: estadoDe(f, false, hoy), normaRef: "Res. 0312/2019 art. 28", href: `${base}/evaluacion`, mesCompleto: true }); }
        { const f = fecha(7, 31); if (dentro(f, false)) add({ id: `registro-sgrl-${e.id}-${y}`, fecha: iso(f), titulo: `Registrar la autoevaluación ${y - 1} y el plan de mejoramiento en sgrl.mintrabajo.gov.co (copia a la ARL)`, detalle: y === 2026 ? "Plazo de la vigencia 2025: hasta el 31 de julio de 2026." : "Fecha de referencia: el plazo de cada vigencia lo fija la circular anual del Ministerio del Trabajo (para la vigencia 2025 fue el 31 de julio de 2026, Circular 027/2026). Confírmelo.", categoria: "evaluacion", estado: estadoDe(f, false, hoy), normaRef: y === 2026 ? "Circular 027/2026 nums. 1 y 2; Res. 0312/2019 art. 28" : "Res. 0312/2019 arts. 26 y 28; Circular 027/2026 (vigencia 2025)", href: `${base}/evaluacion` }); }
        if (docs.has("PRG-09")) { const f = fecha(1, 31); if (dentro(f, false)) add({ id: `pesv-${e.id}-${y}`, fecha: iso(f), titulo: "Reporte anual de autogestión del PESV al Ministerio del Trabajo", detalle: "Indicadores del PESV con corte al 31 de diciembre; plazo general 31 de enero, escalonado por el último dígito del NIT.", categoria: "legal", estado: estadoDe(f, false, hoy), normaRef: "Circular 034/2026; Res. 40595/2022", href: `${base}/documentos/PRG-09` }); }
        for (const [m, d] of [[6, 30], [12, 31]] as const) { const f = fecha(m, d); if (dentro(f, false)) add({ id: `acoso-${e.id}-${y}-${m}`, fecha: iso(f), titulo: "Publicación semestral anonimizada de quejas por acoso sexual y remisión al SIVIGE", detalle: "Número de quejas tramitadas y sanciones, sin datos personales.", categoria: "legal", estado: estadoDe(f, false, hoy), normaRef: "Ley 2365/2024 art. 11 num. 7", href: `${base}/documentos/PRC-06` }); }
        { const f = fecha(12, 15); if (dentro(f, false)) add({ id: `spa-${e.id}-${y}`, fecha: iso(f), titulo: "Información anual del programa de salud mental y prevención de SPA", detalle: "Planeación, implementación, seguimiento y ajustes, desagregados por actividad económica, número de trabajadores, ocupación, sexo y edad, a disposición de los inspectores.", categoria: "legal", estado: estadoDe(f, false, hoy), normaRef: "Decreto 728/2025 (Decreto 1072 art. 2.2.4.13.10)", href: `${base}/documentos/PRG-03` }); }
        if (docs.has("MTZ-03")) { const f = fecha(3, 31); if (dentro(f, false)) add({ id: `sga-${e.id}-${y}`, fecha: iso(f), titulo: "Capacitación anual en SGA (etiquetas, pictogramas, FDS y emergencias)", categoria: "legal", estado: estadoDe(f, false, hoy), normaRef: "Res. 0773/2021 art. 21 num. 7", href: `${base}/documentos/MTZ-03` }); }
        if ((rr.comites ?? []).includes("CCL")) for (const m of [3, 6, 9, 12]) { const f = fecha(m, 30 - (m === 3 || m === 12 ? -1 : 0)); if (dentro(f, false)) add({ id: `ccl-inf-${e.id}-${y}-${m}`, fecha: iso(f), titulo: m === 12 ? "Informe anual del Comité de Convivencia Laboral a la alta dirección" : "Informe trimestral del Comité de Convivencia Laboral", categoria: "legal", estado: estadoDe(f, false, hoy), normaRef: "Res. 3461/2025 art. 6", href: `${base}/comites` }); }
      }
    }
    const au = e.auditorias[0];
    if (au) {
      const f = au.estado === "cerrada" ? masAnios(au.fechaInicio, valorPlazo("auditoria_anual")) : au.fechaInicio;
      if (dentro(f, false)) add({ id: `aud-${au.id}`, fecha: iso(f), titulo: au.estado === "cerrada" ? `Auditoría interna anual ${au.anio + 1}` : `Cerrar la auditoría interna ${au.anio}`, detalle: "Planifíquela con el COPASST o Vigía y con un auditor idóneo e independiente.", categoria: "auditoria", estado: estadoDe(f, false, hoy), normaRef: "Decreto 1072/2015 art. 2.2.4.6.29", href: au.estado === "cerrada" ? `${base}/auditoria` : `${base}/auditoria/${au.id}` });
    }
    for (const v of e.visitas) add({ id: `vis-${v.id}`, fecha: iso(v.fecha), titulo: `Visita (${v.horas} h): ${v.actividades.split("\n")[0]}`, detalle: v.actividades, categoria: "visita", estado: "hecho", href: `${base}/planeador` });
    for (const rc of e.recordatorios) {
      if (dentro(rc.fecha, rc.hecho)) add({ id: `rec-${rc.id}`, recordatorioId: rc.id, fecha: iso(rc.fecha), titulo: rc.titulo, detalle: rc.notas ?? undefined, categoria: "recordatorio", estado: estadoDe(rc.fecha, rc.hecho, hoy), href: base });
    }
  }
  // Recordatorios de la consultora (sin empresa), solo en la vista general.
  if (!empresaId) {
    for (const rc of await db.recordatorio.findMany({ where: { empresaId: null } })) {
      if (dentro(rc.fecha, rc.hecho)) out.push({ id: `rec-${rc.id}`, recordatorioId: rc.id, empresaId: null, empresa: "Consultora", fecha: iso(rc.fecha), titulo: rc.titulo, detalle: rc.notas ?? undefined, categoria: "recordatorio", estado: estadoDe(rc.fecha, rc.hecho, hoy), href: "/planeador" });
    }
  }
  return out.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

/** Calendario .ics para importar en Google Calendar, Outlook o el celular. */
export function aIcs(fechas: Fecha[], nombre: string) {
  const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const d = (s: string) => s.slice(0, 10).replace(/-/g, "");
  const sig = (s: string) => { const x = new Date(s); x.setUTCDate(x.getUTCDate() + 1); return d(x.toISOString()); };
  const ahora = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ev = fechas.filter((f) => f.estado !== "hecho").map((f) => [
    "BEGIN:VEVENT", `UID:${f.id}@processt`, `DTSTAMP:${ahora}`, `DTSTART;VALUE=DATE:${d(f.fecha)}`, `DTEND;VALUE=DATE:${sig(f.fecha)}`,
    `SUMMARY:${esc(`[${f.empresa}] ${f.titulo}`)}`, `DESCRIPTION:${esc([f.detalle, f.normaRef && `Norma: ${f.normaRef}`].filter(Boolean).join("\n"))}`, "END:VEVENT",
  ].join("\r\n"));
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PROCESST//Planeador SG-SST//ES", `X-WR-CALNAME:${esc(nombre)}`, ...ev, "END:VCALENDAR"].join("\r\n");
}
