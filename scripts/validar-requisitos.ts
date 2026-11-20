// Valida que cada requisito normativo esté bien anclado:
// - la norma existe en el catálogo y la plantilla la cita en su frontmatter `normas`;
// - la sección existe en la plantilla y, si tiene `clave`, la trata;
// - los ids son únicos;
// - todas las plantillas tienen requisitos.
// Uso: npx tsx scripts/validar-requisitos.ts  (sale con código 1 si hay errores)
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parsePlantilla, dividirSecciones } from "../src/lib/generador/plantilla";
import { REQUISITOS, coberturaRequisitos } from "../src/lib/requisitos";
import { normas } from "../prisma/seed/normas";

const dir = join(__dirname, "..", "prisma", "seed", "plantillas");
const catalogo = new Set(normas.map((n) => n.codigo));
const errores: string[] = [], avisos: string[] = [];
const ids = new Set<string>();
let total = 0;

const plantillas = readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_")).map((f) => parsePlantilla(readFileSync(join(dir, f), "utf8")));
const codigos = new Set(plantillas.map((p) => p.meta.codigo));

for (const { meta, cuerpo } of plantillas) {
  const reqs = REQUISITOS[meta.codigo] ?? [];
  if (!reqs.length) { avisos.push(`${meta.codigo}: sin requisitos registrados`); continue; }
  // Las secciones con Handlebars se evalúan sobre el texto de la plantilla (sin datos de empresa).
  const secciones = dividirSecciones(cuerpo);
  for (const r of reqs) {
    total++;
    if (ids.has(r.id)) errores.push(`${r.id}: id repetido`);
    ids.add(r.id);
    if (!catalogo.has(r.norma)) errores.push(`${r.id}: la norma ${r.norma} no está en el catálogo`);
    else if (!(meta.normas ?? []).includes(r.norma)) errores.push(`${r.id}: ${meta.codigo} no cita ${r.norma} en su frontmatter`);
  }
  for (const c of coberturaRequisitos(meta.codigo, secciones)) if (!c.cubierto) errores.push(`${c.id} (${meta.codigo}): ${c.motivo}`);
}
for (const k of Object.keys(REQUISITOS)) if (!codigos.has(k) && !k.startsWith("GEN-")) errores.push(`${k}: hay requisitos para un código sin plantilla`);

console.log(`Requisitos: ${total} en ${Object.keys(REQUISITOS).length} artefactos.`);
for (const a of avisos) console.log(`  aviso  ${a}`);
for (const e of errores) console.log(`  ERROR  ${e}`);
if (errores.length) { console.log(`${errores.length} error(es).`); process.exit(1); }
console.log("Todo en orden.");
