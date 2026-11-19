// Planeador: reúne en un solo calendario todas las fechas que la consultora debe tener en cuenta,
// por empresa. Cada fecha cita la norma que la origina y enlaza a donde se gestiona.
import { db } from "@/lib/db";
import { plazos } from "@/lib/eventos";

export type Categoria = "plan" | "comite" | "accidente" | "accion" | "matriz" | "evaluacion" | "responsable" | "examen" | "epp" | "inspeccion" | "visita" | "recordatorio";
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
  epp: { t: "Reposición de EPP", color: "bg-lime-600" },
  inspeccion: { t: "Inspecciones", color: "bg-indigo-500" },
  visita: { t: "Visitas realizadas", color: "bg-cyan-600" },
  recordatorio: { t: "Mis recordatorios", color: "bg-slate-500" },
};

const DIA = 864e5;
const finDeMes = (anio: number, mes: number) => new Date(Date.UTC(anio, mes, 0, 12));
const masAnios = (d: Date, n: number) => { const r = new Date(d); r.setUTCFullYear(r.getUTCFullYear() + n); return r; };
const iso = (d: Date) => d.toISOString();

function estadoDe(fecha: Date, hecho: boolean, hoy: Date): EstadoFecha {
  if (hecho) return "hecho";
  const d0 = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
  const f0 = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate());
  if (f0 < d0) return "vencido";
  if (f0 === d0) return "hoy";
  return f0 - d0 <= 14 * DIA ? "proximo" : "pendiente";
}

/** Todas las fechas de una empresa (o de todas) entre `desde` y `hasta`. Los vencidos sin cumplir se incluyen siempre. */
export async function fechasPlaneador({ empresaId, desde, hasta, hoy = new Date() }: { empresaId?: string; desde: Date; hasta: Date; hoy?: Date }): Promise<Fecha[]> {
  const where = empresaId ? { id: empresaId } : {};
  const empresas = await db.empresa.findMany({
    where, select: {
      id: true, razonSocial: true, responsableSst: true,
      actividades: { where: { origen: { not: "accion" } }, select: { id: true, anio: true, mes: true, nombre: true, estado: true, normaRef: true } },
      comites: { select: { id: true, tipo: true, periodoFin: true, normaRef: true } },
      eventos: { select: { id: true, tipo: true, fecha: true, gravedad: true, fechaReporte: true, reportadoArl: true, invEstado: true, invCierre: true, invRemitidaArl: true, reporteMinisterio: true, trabajadorNombre: true } },
      acciones: { where: { fechaLimite: { not: null } }, select: { id: true, descripcion: true, fechaLimite: true, estado: true, eventoId: true } },
      matrizVersiones: { orderBy: { numero: "desc" }, take: 1, select: { numero: true, fecha: true } },
      evaluaciones: { orderBy: { fecha: "desc" }, take: 1, select: { fecha: true, anio: true } },
      recordatorios: true,
      inspecciones: { orderBy: { fecha: "desc" }, select: { lista: true, fecha: true } },
      visitas: { where: { fecha: { gte: desde, lte: hasta } }, select: { id: true, fecha: true, horas: true, actividades: true } },
      trabajadores: { where: { activo: true }, select: { id: true, nombres: true, examenes: { orderBy: { fecha: "desc" }, take: 1, select: { id: true, proximo: true, tipo: true } }, entregasEpp: { where: { proximaReposicion: { not: null } }, orderBy: { fecha: "desc" }, select: { id: true, elemento: true, proximaReposicion: true } } } },
    },
  });
  const out: Fecha[] = [];
  const frecuencias = new Map((await db.catalogoItem.findMany({ where: { tipo: "LISTA_INSPECCION" }, select: { nombre: true, detalle: true } })).map((l) => [l.nombre, Number((l.detalle as { frecuenciaDias?: number })?.frecuenciaDias) || 0]));
  const dentro = (f: Date, hecho: boolean) => (f >= desde && f <= hasta) || (!hecho && f < desde && f.getTime() > desde.getTime() - 400 * DIA);
  const NOMBRE_COMITE: Record<string, string> = { COPASST: "COPASST", VIGIA: "Vigía de SST", CCL: "Comité de Convivencia Laboral", BRIGADA: "Brigada" };

  for (const e of empresas) {
    const base = `/empresas/${e.id}`;
    const add = (x: Omit<Fecha, "empresaId" | "empresa">) => out.push({ ...x, empresaId: e.id, empresa: e.razonSocial });

    for (const a of e.actividades) {
      const f = finDeMes(a.anio, a.mes), hecho = a.estado === "EJECUTADA" || a.estado === "CANCELADA";
      if (dentro(f, hecho)) add({ id: `plan-${a.id}`, fecha: iso(f), titulo: a.nombre, categoria: "plan", estado: estadoDe(f, hecho, hoy), normaRef: a.normaRef ?? undefined, href: `${base}/plan`, mesCompleto: true });
    }
    for (const c of e.comites) {
      if (!c.periodoFin || c.tipo === "BRIGADA") continue;
      if (dentro(c.periodoFin, false)) add({ id: `comite-${c.id}`, fecha: iso(c.periodoFin), titulo: `Termina el periodo del ${NOMBRE_COMITE[c.tipo] ?? c.tipo}: conformar el nuevo`, detalle: "El periodo es de dos años. Programe la convocatoria y la elección o designación antes de esta fecha.", categoria: "comite", estado: estadoDe(c.periodoFin, false, hoy), normaRef: c.normaRef ?? undefined, href: `${base}/comites` });
    }
    for (const ev of e.eventos) {
      for (const p of plazos(ev, hoy)) {
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
      const f = masAnios(v.fecha, 1);
      if (dentro(f, false)) add({ id: `matriz-${e.id}`, fecha: iso(f), titulo: `Actualización anual de la matriz de peligros (última: v${v.numero})`, categoria: "matriz", estado: estadoDe(f, false, hoy), normaRef: "Decreto 1072/2015 art. 2.2.4.6.15", href: `${base}/matriz` });
    }
    const ev = e.evaluaciones[0];
    if (ev) {
      const f = masAnios(ev.fecha, 1);
      if (dentro(f, false)) add({ id: `eval-${e.id}`, fecha: iso(f), titulo: "Autoevaluación anual de estándares mínimos", detalle: `La última fue el ${ev.fecha.toISOString().slice(0, 10)}. Después de la autoevaluación se actualiza el plan de mejoramiento.`, categoria: "evaluacion", estado: estadoDe(f, false, hoy), normaRef: "Res. 0312/2019 arts. 27 y 28", href: `${base}/evaluacion` });
    }
    const r = (e.responsableSst ?? {}) as { nombre?: string; curso50h?: boolean; curso50hFecha?: string };
    if (r.curso50h && /^\d{4}-\d{2}-\d{2}$/.test(r.curso50hFecha ?? "")) {
      const f = masAnios(new Date(r.curso50hFecha + "T12:00:00Z"), 3);
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
      const x = t.examenes[0];
      if (x?.proximo && dentro(x.proximo, false)) add({ id: `exa-${x.id}`, fecha: iso(x.proximo), titulo: `Examen médico periódico — ${t.nombres}`, detalle: "Programe la evaluación médica ocupacional según el profesiograma.", categoria: "examen", estado: estadoDe(x.proximo, false, hoy), normaRef: "Res. 1843/2025", href: `${base}/trabajadores` });
      // Solo la última entrega de cada elemento cuenta para la reposición.
      const vistos = new Set<string>();
      for (const ep of t.entregasEpp) {
        if (vistos.has(ep.elemento)) continue; vistos.add(ep.elemento);
        if (ep.proximaReposicion && dentro(ep.proximaReposicion, false)) add({ id: `epp-${ep.id}`, fecha: iso(ep.proximaReposicion), titulo: `Reposición de EPP: ${ep.elemento} — ${t.nombres}`, categoria: "epp", estado: estadoDe(ep.proximaReposicion, false, hoy), normaRef: "Decreto 1072/2015 art. 2.2.4.6.24", href: `${base}/trabajadores` });
      }
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
