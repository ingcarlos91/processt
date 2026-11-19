// Valida la biblioteca de la semilla sin tocar la base de datos: claves duplicadas, referencias colgadas,
// códigos de norma inexistentes, valores GTC 45 fuera de escala y textos vacíos.
// Uso: npx tsx scripts/validar-biblioteca.ts   (sale con código 1 si hay errores)
import { peligros } from "../prisma/seed/biblioteca/peligros";
import { peligrosAmpliacion } from "../prisma/seed/biblioteca/peligros-ampliacion";
import { zonas, tareas, cargos, sectores, zonasTarea } from "../prisma/seed/biblioteca/estructura";
import { zonasAmp, tareasAmp, cargosAmp, sectoresAmp } from "../prisma/seed/biblioteca/estructura-ampliacion";
import { modulosBiblioteca } from "../prisma/seed/biblioteca/modulos";
import { normas } from "../prisma/seed/normas";

type Dic<T> = Record<string, T>;
const errores: string[] = [];
const avisos: string[] = [];
const err = (m: string) => errores.push(m);

function fusionar<T>(nombre: string, partes: { origen: string; datos: Dic<T> }[]) {
  const out: Dic<T> = {}; const origen: Dic<string> = {};
  for (const { origen: o, datos } of partes) for (const [k, v] of Object.entries(datos)) {
    if (out[k]) err(`${nombre}: clave duplicada "${k}" en ${origen[k]} y ${o}`);
    out[k] = v; origen[k] = o;
  }
  return out;
}

const P = fusionar("peligros", [
  { origen: "peligros.ts", datos: peligros }, { origen: "peligros-ampliacion.ts", datos: peligrosAmpliacion },
  ...modulosBiblioteca.map((m) => ({ origen: m.nombre, datos: (m.peligros ?? {}) as Dic<unknown> })),
]) as Dic<{ clasificacion: string; sub: string; descripcion: string; efectos: string; nd: number; ne: number; nc: number; normas?: string[]; eppLista?: string[]; examenes?: string[]; capacitaciones?: string[] }>;
const Z = fusionar("zonas", [
  { origen: "estructura.ts", datos: zonas }, { origen: "estructura-ampliacion.ts", datos: zonasAmp },
  ...modulosBiblioteca.map((m) => ({ origen: m.nombre, datos: (m.zonas ?? {}) as Dic<unknown> })),
]) as Dic<{ nombre: string; peligros: string[] }>;
const T = fusionar("tareas", [
  { origen: "estructura.ts", datos: tareas }, { origen: "estructura-ampliacion.ts", datos: tareasAmp },
  ...modulosBiblioteca.map((m) => ({ origen: m.nombre, datos: (m.tareas ?? {}) as Dic<unknown> })),
]) as Dic<{ nombre: string; actividad: string; peligros: (string | { p: string; nd?: number; ne?: number; nc?: number })[]; zonas?: string[] }>;
const C = fusionar("cargos", [
  { origen: "estructura.ts", datos: cargos }, { origen: "estructura-ampliacion.ts", datos: cargosAmp },
  ...modulosBiblioteca.map((m) => ({ origen: m.nombre, datos: (m.cargos ?? {}) as Dic<unknown> })),
]) as Dic<{ nombre: string; descripcion: string; tareas: string[]; peligros?: string[] }>;
const S = [...sectores, ...sectoresAmp, ...modulosBiblioteca.flatMap((m) => m.sectores ?? [])];

const enModulo = new Set(modulosBiblioteca.flatMap((m) => Object.keys(m.peligros ?? {})));
const enModuloT = new Set(modulosBiblioteca.flatMap((m) => Object.keys(m.tareas ?? {})));
const enModuloC = new Set(modulosBiblioteca.flatMap((m) => Object.keys(m.cargos ?? {})));
const CLASES = new Set(["Biologico", "Fisico", "Quimico", "Psicosocial", "Biomecanico", "Condiciones de seguridad", "Fenomenos naturales"]);
const ND = new Set([0, 2, 6, 10]), NE = new Set([1, 2, 3, 4]), NC = new Set([10, 25, 60, 100]);
const codigosNorma = new Set(normas.map((n) => n.codigo));
const vigentes = new Set(normas.filter((n) => n.vigente !== false).map((n) => n.codigo));

// Peligros
const descripciones = new Map<string, string>();
for (const [k, p] of Object.entries(P)) {
  if (!CLASES.has(p.clasificacion)) err(`peligro ${k}: clasificacion inválida "${p.clasificacion}"`);
  if (!ND.has(p.nd)) err(`peligro ${k}: nd=${p.nd} (válidos 0, 2, 6, 10)`);
  if (!NE.has(p.ne)) err(`peligro ${k}: ne=${p.ne} (válidos 1-4)`);
  if (!NC.has(p.nc)) err(`peligro ${k}: nc=${p.nc} (válidos 10, 25, 60, 100)`);
  for (const c of ["sub", "descripcion", "efectos"] as const) if (!p[c]?.trim()) err(`peligro ${k}: falta ${c}`);
  const d = p.descripcion.trim().toLowerCase();
  if (descripciones.has(d)) err(`peligro ${k}: descripción repetida con ${descripciones.get(d)} (la semilla enlaza por descripción)`);
  descripciones.set(d, k);
  for (const n of p.normas ?? []) {
    if (!codigosNorma.has(n)) err(`peligro ${k}: norma "${n}" no existe en normas.ts`);
    else if (!vigentes.has(n)) err(`peligro ${k}: norma "${n}" está derogada`);
  }
  // Completitud: en los módulos nuevos nada puede quedar vacío (requisito del usuario); en la semilla original se avisa.
  const q = p as unknown as Record<string, unknown>;
  const faltan = ["fuente", "medio", "individuo", "eliminacion", "sustitucion", "ingenieria", "administrativa", "epp", "pve"].filter((c) => !String(q[c] ?? "").trim());
  for (const c of ["eppLista", "examenes", "capacitaciones", "normas"]) if (!(q[c] as unknown[] | undefined)?.length) faltan.push(c);
  if (q.requisitoLegal == null) faltan.push("requisitoLegal");
  if (faltan.length) (enModulo.has(k) ? err : (m: string) => avisos.push(m))(`peligro ${k}: campos vacíos: ${faltan.join(", ")}`);
}
// Zonas
const nombresZona = new Map<string, string>();
for (const [k, z] of Object.entries(Z)) {
  if (nombresZona.has(z.nombre)) err(`zona ${k}: nombre repetido con ${nombresZona.get(z.nombre)}`); nombresZona.set(z.nombre, k);
  for (const p of z.peligros) if (!P[p]) err(`zona ${k}: peligro "${p}" no existe`);
}
// Tareas
const nombresTarea = new Map<string, string>();
for (const [k, t] of Object.entries(T)) {
  if (nombresTarea.has(t.nombre)) err(`tarea ${k}: nombre repetido con ${nombresTarea.get(t.nombre)}`); nombresTarea.set(t.nombre, k);
  if (!t.peligros?.length) err(`tarea ${k}: sin peligros`);
  for (const x of t.peligros ?? []) { const p = typeof x === "string" ? x : x.p; if (!P[p]) err(`tarea ${k}: peligro "${p}" no existe`); }
  const zs = t.zonas ?? zonasTarea[k];
  if (!zs?.length) (enModuloT.has(k) ? err : (m: string) => avisos.push(m))(`tarea ${k}: sin zonas preferidas`);
  if (enModuloT.has(k) && (t.peligros?.length ?? 0) < 2) err(`tarea ${k}: debe tener al menos 2 peligros`);
  if (enModuloT.has(k) && !t.actividad?.trim()) err(`tarea ${k}: sin actividad`);
  for (const z of zs ?? []) if (!Z[z]) err(`tarea ${k}: zona "${z}" no existe`);
}
// Cargos
for (const [k, c] of Object.entries(C)) {
  if (!c.tareas?.length) err(`cargo ${k}: sin tareas`);
  if (enModuloC.has(k) && !c.descripcion?.trim()) err(`cargo ${k}: sin descripción`);
  if (enModuloC.has(k) && (c.tareas?.length ?? 0) < 2) err(`cargo ${k}: debe tener al menos 2 tareas`);
  for (const t of c.tareas ?? []) if (!T[t]) err(`cargo ${k}: tarea "${t}" no existe`);
  for (const p of c.peligros ?? []) if (!P[p]) err(`cargo ${k}: peligro "${p}" no existe`);
}
// Sectores
const nombresSector = new Set<string>(); const ciiuVisto = new Map<string, string>();
for (const s of S) {
  if (nombresSector.has(s.nombre)) err(`sector "${s.nombre}" repetido`); nombresSector.add(s.nombre);
  for (const ci of s.ciius) { if (ciiuVisto.has(ci) && ciiuVisto.get(ci) !== s.nombre) avisos.push(`CIIU ${ci} en "${s.nombre}" y en "${ciiuVisto.get(ci)}"`); ciiuVisto.set(ci, s.nombre); }
  for (const z of s.zonas) if (!Z[z]) err(`sector "${s.nombre}": zona "${z}" no existe`);
  if (!s.procesos?.length) err(`sector "${s.nombre}": sin procesos`);
  for (const p of s.procesos) for (const t of p.tareas) if (!T[t]) err(`sector "${s.nombre}" proceso "${p.nombre}": tarea "${t}" no existe`);
  if (!s.cargos?.length) err(`sector "${s.nombre}": sin cargos`);
  for (const c of s.cargos) if (!C[c]) err(`sector "${s.nombre}": cargo "${c}" no existe`);
}
// Huérfanos
const usadasT = new Set([...Object.values(C).flatMap((c) => c.tareas), ...S.flatMap((s) => s.procesos.flatMap((p) => p.tareas))]);
for (const k of Object.keys(T)) if (!usadasT.has(k)) avisos.push(`tarea ${k}: ningún cargo ni proceso la usa`);
const usadosC = new Set(S.flatMap((s) => s.cargos));
for (const k of Object.keys(C)) if (!usadosC.has(k)) avisos.push(`cargo ${k}: ningún sector lo incluye`);

console.log(`Biblioteca: ${Object.keys(P).length} peligros · ${Object.keys(Z).length} zonas · ${Object.keys(T).length} tareas · ${Object.keys(C).length} cargos · ${S.length} sectores · ${S.reduce((n, s) => n + s.procesos.length, 0)} procesos`);
if (avisos.length) { console.log(`\nAvisos (${avisos.length}):`); avisos.slice(0, 60).forEach((a) => console.log("  - " + a)); if (avisos.length > 60) console.log(`  … ${avisos.length - 60} más`); }
if (errores.length) { console.log(`\nERRORES (${errores.length}):`); errores.forEach((e) => console.log("  ✗ " + e)); process.exit(1); }
console.log("\nSin errores.");
