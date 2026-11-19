// Versiones de la matriz de peligros: consulta, resumen, comparación y cuándo hay que actualizarla.
// Decreto 1072/2015 art. 2.2.4.6.15 y Res. 0312/2019 estándar 4.1.2: actualizar mínimo una vez al año
// y siempre que ocurra un accidente mortal o un evento catastrófico, o cambien procesos o instalaciones.
import { db } from "@/lib/db";
import { cargarEmpresa, filasMatriz } from "@/lib/generador/contexto";

export type FilaMatriz = ReturnType<typeof filasMatriz>[number];
type Peligro = Awaited<ReturnType<typeof cargarEmpresa>>["peligros"][number];

/** Filas de una versión cerrada. Las versiones antiguas solo guardaban los peligros: se les ponen los nombres actuales. */
export async function filasDeVersion(empresaId: string, snapshot: unknown): Promise<FilaMatriz[]> {
  if (snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) && Array.isArray((snapshot as { filas?: unknown }).filas)) {
    return (snapshot as { filas: FilaMatriz[] }).filas;
  }
  const crudos = (Array.isArray(snapshot) ? snapshot : []) as Peligro[];
  const e = await cargarEmpresa(empresaId);
  const peligros = crudos.map((p) => ({
    ...p,
    tarea: p.tareaId ? e.tareas.find((t) => t.id === p.tareaId) ?? null : null,
    zona: p.zonaId ? e.zonas.find((z) => z.id === p.zonaId) ?? null : null,
    cargo: p.cargoId ? e.cargos.find((c) => c.id === p.cargoId) ?? null : null,
    peligro: null,
  })) as unknown as Peligro[];
  return filasMatriz({ ...e, peligros });
}

export function resumenFilas(filas: FilaMatriz[]) {
  const porNivel: Record<string, number> = { I: 0, II: 0, III: 0, IV: 0 };
  for (const f of filas) porNivel[f.nivelRiesgo] = (porNivel[f.nivelRiesgo] ?? 0) + 1;
  return { total: filas.length, prioritarios: porNivel.I + porNivel.II, porNivel };
}

const CAMPOS: [keyof FilaMatriz, string][] = [
  ["descripcion", "Descripción del peligro"], ["nivelRiesgo", "Nivel de riesgo"], ["nr", "NR"], ["aceptabilidad", "Aceptabilidad"],
  ["controlesFuente", "Control en la fuente"], ["controlesMedio", "Control en el medio"], ["controlesIndividuo", "Control en el individuo"],
  ["eliminacion", "Eliminación"], ["sustitucion", "Sustitución"], ["ingenieria", "Ingeniería"], ["administrativa", "Administrativas"], ["epp", "EPP"],
];

/** Diferencias entre dos estados de la matriz, por peligro. */
export function compararFilas(antes: FilaMatriz[], despues: FilaMatriz[]) {
  const a = new Map(antes.map((f) => [f.id, f])), d = new Map(despues.map((f) => [f.id, f]));
  const agregados = despues.filter((f) => !a.has(f.id));
  const quitados = antes.filter((f) => !d.has(f.id));
  const cambiados = despues.filter((f) => a.has(f.id)).map((f) => {
    const prev = a.get(f.id)!;
    const cambios = CAMPOS.filter(([k]) => String(prev[k] ?? "") !== String(f[k] ?? "")).map(([k, t]) => ({ campo: t, antes: String(prev[k] ?? ""), despues: String(f[k] ?? "") }));
    return { fila: f, cambios };
  }).filter((x) => x.cambios.length);
  return { agregados, quitados, cambiados };
}

export type AvisoMatriz = { nivel: "obligatorio" | "recomendado"; texto: string; normaRef: string };

/** Motivos por los que la matriz debe (o conviene) actualizarse y cerrar una nueva versión. */
export async function avisosActualizacion(empresaId: string, hoy = new Date()): Promise<AvisoMatriz[]> {
  const [ultima, eventos] = await Promise.all([
    db.matrizVersion.findFirst({ where: { empresaId }, orderBy: { numero: "desc" } }),
    db.evento.findMany({ where: { empresaId, tipo: "AT", gravedad: { in: ["grave", "mortal"] } }, orderBy: { fecha: "desc" } }),
  ]);
  const out: AvisoMatriz[] = [];
  const ref = "Decreto 1072/2015 art. 2.2.4.6.15; Res. 0312/2019 estándar 4.1.2";
  if (!ultima) out.push({ nivel: "recomendado", texto: "Aún no se ha cerrado ninguna versión de la matriz. Cierre la versión inicial cuando la consultora la apruebe: es el soporte de que la matriz existe y se actualiza.", normaRef: ref });
  else if (hoy.getTime() - ultima.fecha.getTime() > 365 * 864e5) out.push({ nivel: "obligatorio", texto: `La última versión (v${ultima.numero}) tiene más de un año. La matriz se actualiza como mínimo una vez al año.`, normaRef: ref });
  const desde = ultima?.fecha ?? new Date(0);
  const fmt = (d: Date) => d.toISOString().slice(0, 10).split("-").reverse().join("/");
  for (const ev of eventos.filter((x) => x.fecha > desde)) {
    if (ev.gravedad === "mortal") out.push({ nivel: "obligatorio", texto: `Accidente mortal del ${fmt(ev.fecha)}${ev.cargo ? ` (${ev.cargo})` : ""}: la matriz debe actualizarse y cerrarse una nueva versión.`, normaRef: ref });
    else out.push({ nivel: "recomendado", texto: `Accidente grave del ${fmt(ev.fecha)}${ev.cargo ? ` (${ev.cargo})` : ""}: revise la valoración y los controles del peligro relacionado y cierre una nueva versión.`, normaRef: "Res. 1401/2007; GTC 45" });
  }
  return out;
}
