// Diagnóstico inicial del SG-SST: estado actual frente a los estándares mínimos que aplican a la empresa.
// Puntaje con la tabla de valores de la Res. 0312/2019 (arts. 27 y 28), cumplimiento por ciclo PHVA y ruta de implementación.
import { calificar } from "@/lib/evaluacion";

/** Lo marcado en “Estado actual” del cuestionario precarga como “cumple” estos estándares. */
export const MAPA_ESTADO_ACTUAL: Record<string, string[]> = {
  responsable: ["1.1.1"], afiliacion: ["1.1.4"], copasst: ["1.1.6"], convivencia: ["1.1.8"], capacitacion: ["1.2.1"], induccion: ["1.2.2"],
  curso50h: ["1.2.3"], politica: ["2.1.1"], planAnual: ["2.4.1"], examenes: ["3.1.4"], reporteAT: ["3.2.1"], investigacion: ["3.2.2"],
  matriz: ["4.1.2"], epp: ["4.2.6"], mantenimiento: ["4.2.5"], emergencias: ["5.1.1"], brigada: ["5.1.2"], revision: ["6.1.3"],
};

/**
 * Estándares que no pueden marcarse «no aplica» porque el motor de reglas exige el requisito a la empresa:
 * COPASST/Vigía (1.1.6, Res. 2013/1986) siempre, y Comité de Convivencia (1.1.8, Res. 3461/2025) cuando aplica.
 */
export function noAplicaInvalidos(items: { codigo: string; estado: string }[], comites: string[]) {
  const exigidos = new Set(["1.1.6", ...(comites.includes("CCL") ? ["1.1.8"] : [])]);
  return items.filter((i) => (i.estado === "no_aplica" || i.estado === "NO_APLICA") && exigidos.has(i.codigo)).map((i) => i.codigo);
}

export type EstadoDiag = "cumple" | "no_cumple" | "no_aplica" | "";
export type ItemDiag = { codigo: string; ciclo: string; grupo: string; descripcion: string; puntaje: number; modo: string; actividad: string; estado: EstadoDiag; observacion: string };

export const CICLOS = [
  { k: "PLANEAR", t: "Planear", d: "Recursos, política, objetivos, evaluación inicial, plan anual, documentación." },
  { k: "HACER", t: "Hacer", d: "Gestión de la salud, de peligros y riesgos, y de amenazas (emergencias)." },
  { k: "VERIFICAR", t: "Verificar", d: "Indicadores, auditoría y revisión por la dirección." },
  { k: "ACTUAR", t: "Actuar", d: "Acciones preventivas, correctivas y de mejora." },
] as const;

const ESTADO_EVAL: Record<string, string> = { cumple: "CUMPLE", no_cumple: "NO_CUMPLE", no_aplica: "NO_APLICA", "": "PENDIENTE" };
export const aEstadoEvaluacion = (e: EstadoDiag) => ESTADO_EVAL[e];

/** Puntaje global (igual que la autoevaluación) y cumplimiento por ciclo. */
export function calcularDiagnostico(items: ItemDiag[], nivel: number) {
  const cal = calificar(items.map((i) => ({ codigo: i.codigo, puntaje: i.puntaje, estado: ESTADO_EVAL[i.estado] })), nivel);
  const porCiclo = Object.fromEntries(CICLOS.map(({ k }) => {
    const xs = items.filter((i) => i.ciclo === k);
    const maximo = xs.reduce((s, i) => s + i.puntaje, 0);
    const obtenido = xs.reduce((s, i) => s + (i.estado === "cumple" || i.estado === "no_aplica" ? i.puntaje : 0), 0);
    return [k, { obtenido: Math.round(obtenido * 100) / 100, maximo: Math.round(maximo * 100) / 100, pct: maximo ? Math.round((obtenido / maximo) * 100) : null, items: xs.length, noCumple: xs.filter((i) => i.estado === "no_cumple").length }];
  })) as Record<string, { obtenido: number; maximo: number; pct: number | null; items: number; noCumple: number }>;
  return { ...cal, porCiclo, evaluados: items.filter((i) => i.estado).length, total: items.length };
}

/** Ruta de implementación: brechas ordenadas por ciclo y peso, en fases. */
export function rutaImplementacion(items: ItemDiag[], valoracion: string) {
  const brechas = items.filter((i) => i.estado === "no_cumple" || i.estado === "").sort((a, b) => b.puntaje - a.puntaje);
  const fase = (ciclos: string[]) => brechas.filter((b) => ciclos.includes(b.ciclo));
  const critico = valoracion === "CRÍTICO";
  return [
    { fase: 1, nombre: "Bases del sistema", plazo: critico ? "Mes 1" : "Meses 1 y 2", que: "Responsable, recursos, política, objetivos, matriz de peligros y requisitos legales, plan anual.", brechas: fase(["PLANEAR"]) },
    { fase: 2, nombre: "Implementación", plazo: critico ? "Meses 2 y 3" : "Meses 2 a 4", que: "Condiciones de salud, controles de peligros, emergencias, capacitación y comités.", brechas: fase(["HACER"]) },
    { fase: 3, nombre: "Verificación y mejora", plazo: critico ? "Meses 3 y 4" : "Meses 4 a 6", que: "Indicadores, auditoría, revisión por la dirección y acciones de mejora.", brechas: fase(["VERIFICAR", "ACTUAR"]) },
  ];
}

/** Línea base (diagnóstico cerrado) frente a la última autoevaluación cerrada, global y por ciclo. */
export async function comparativoDiagnostico(empresaId: string) {
  const { db } = await import("@/lib/db");
  const dg = await db.diagnostico.findFirst({ where: { empresaId, estado: "cerrado" }, orderBy: { fecha: "asc" } });
  if (!dg) return null;
  const base = calcularDiagnostico((dg.items ?? []) as ItemDiag[], dg.nivel);
  const ev = await db.evaluacion.findFirst({ where: { empresaId, cerrada: true, NOT: dg.evaluacionId ? { id: dg.evaluacionId } : undefined }, orderBy: { fecha: "desc" }, include: { items: { include: { estandar: true } } } });
  let actual: { fecha: string; puntaje: number; valoracion: string; porCiclo: Record<string, { pct: number | null }> } | null = null;
  if (ev) {
    const its: ItemDiag[] = ev.items.map((i) => ({ codigo: i.estandar.codigo, ciclo: i.estandar.ciclo, grupo: i.estandar.grupo, descripcion: i.estandar.descripcion, puntaje: i.estandar.puntaje, modo: "", actividad: "", estado: i.estado === "CUMPLE" ? "cumple" : i.estado === "NO_APLICA" ? "no_aplica" : i.estado === "NO_CUMPLE" ? "no_cumple" : "", observacion: "" }));
    const c = calcularDiagnostico(its, ev.nivel);
    actual = { fecha: ev.fecha.toISOString().slice(0, 10), puntaje: c.puntaje, valoracion: c.valoracion, porCiclo: c.porCiclo };
  }
  return { diagnosticoId: dg.id, fecha: dg.fecha.toISOString().slice(0, 10), base: { puntaje: base.puntaje, valoracion: base.valoracion, porCiclo: base.porCiclo }, actual };
}
