// Base de conocimiento del asistente (docs/11-asistente-ia.md, fase 1).
// Arma fichas citables desde las fuentes verificadas de PROCESST y las guarda en la tabla `conocimiento` (upsert por
// clave; borra las que ya no existen). Idempotente: corre en cada despliegue (scripts/sembrar-produccion.ts) y en la
// semilla local. Lo propio de cada consultora (plantillas ajustadas, biblioteca propia) no se indexa: el asistente lo
// consulta en vivo con su alcance.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { db } from "../src/lib/db";
import { normas } from "../prisma/seed/normas";
import { estandares } from "../prisma/seed/estandares";
import { REQUISITOS } from "../src/lib/requisitos";
import { MANUAL, hrefSeccion } from "../src/lib/manual";
import { AYUDA } from "../src/lib/ayuda";
import { PLAZOS, MODULOS_PLAZO, textoPlazo } from "../src/lib/plazos";

type Ficha = {
  clave: string; fuente: string; titulo: string; texto: string;
  normaCodigo?: string | null; articulo?: string | null; href?: string | null; urlOficial?: string | null; literal?: boolean;
};

const RAIZ = join(__dirname, "..");
const E = "/empresas/{empresa}";

/** «Decreto 1072/2015», «Res. 0312/2019»… para que el título de cada ficha se entienda solo. */
const NOMBRE_NORMA = new Map(normas.map((n) => [n.codigo, `${n.tipo === "Resolucion" ? "Resolución" : n.tipo} ${n.numero}/${n.anio}`]));
const URL_NORMA = new Map(normas.map((n) => [n.codigo, n.urlOficial ?? null]));
const nombreNorma = (c?: string | null) => (c ? NOMBRE_NORMA.get(c) ?? c : "");

export async function indexarConocimiento() {
  const fichas: Ficha[] = [];
  const add = (f: Ficha) => fichas.push(f);

  // ── Normas del catálogo ──
  for (const n of normas) {
    const estado = n.vigente === false ? `DEROGADA${n.derogadaPor ? `: la reemplaza ${nombreNorma(n.derogadaPor)} (${n.derogadaPor})` : ""}. No citarla como vigente.` : "Vigente.";
    add({
      clave: `norma:${n.codigo}`, fuente: "norma", normaCodigo: n.codigo, urlOficial: n.urlOficial ?? null, href: "/normas",
      titulo: `${nombreNorma(n.codigo)} — ${n.nombre} (${n.tema})`,
      texto: [estado, n.resumen, n.articulosClave ? `Artículos clave: ${n.articulosClave}.` : "", n.evidenciaCumplimiento ? `Evidencia de cumplimiento: ${n.evidenciaCumplimiento}` : "", `Expedida por: ${n.entidad}. Código en PROCESST: ${n.codigo}.`].filter(Boolean).join(" "),
    });
  }

  // ── Estándares mínimos (Res. 0312/2019) ──
  for (const e of estandares) {
    const niveles = ["60", e.aplica21 ? "21" : "", e.aplica7 ? "7" : ""].filter(Boolean).join(", ");
    add({
      clave: `estandar:${e.codigo}`, fuente: "estandar", normaCodigo: "RES-0312-2019", articulo: `estándar ${e.codigo}`, href: `${E}/evaluacion`,
      titulo: `Estándar mínimo ${e.codigo} — ${e.descripcion.slice(0, 120)}`,
      texto: `${e.descripcion} Ciclo ${e.ciclo}; ${e.grupo}; ${e.subgrupo}. Puntaje ${e.puntaje}. Aplica a empresas de ${niveles} estándares. Modo de verificación (Res. 0312/2019 art. 16): ${e.modoVerificacion} Actividad sugerida: ${e.actividadSugerida}`,
    });
  }

  // ── Requisitos por artefacto ──
  const plantillas = await db.plantilla.findMany({ select: { codigo: true, nombre: true, descripcion: true, normas: true, estandares: true, nivelMin: true, contenidoMd: true } });
  const nombrePlantilla = new Map(plantillas.map((p) => [p.codigo, p.nombre]));
  for (const [codigo, reqs] of Object.entries(REQUISITOS)) {
    for (const r of reqs) {
      add({
        clave: `req:${r.id}`, fuente: "requisito", normaCodigo: r.norma, articulo: r.articulo, urlOficial: URL_NORMA.get(r.norma) ?? null, href: `${E}/documentos`,
        titulo: `Requisito de ${codigo} (${nombrePlantilla.get(codigo) ?? codigo}) — ${nombreNorma(r.norma)} ${r.articulo}`,
        texto: `${r.texto} Lo cubre la sección «${r.seccion}» del documento ${codigo}.${r.si ? ` Solo aplica a: ${r.si.replace(/\|/g, " o ").replace(/dis:/g, "empresas con ")}.` : ""}`,
      });
    }
  }

  // ── Plantillas (documentos del SG-SST) ──
  for (const p of plantillas) {
    const secciones = [...p.contenidoMd.matchAll(/^## (.+)$/gm)].map((m) => m[1].trim());
    add({
      clave: `plantilla:${p.codigo}`, fuente: "plantilla", normaCodigo: p.normas[0] ?? null, href: `${E}/documentos`,
      titulo: `Documento ${p.codigo} — ${p.nombre}`,
      texto: [p.descripcion ?? "", `Desde ${p.nivelMin} estándares.`, p.estandares.length ? `Soporta los estándares ${p.estandares.join(", ")}.` : "", p.normas.length ? `Normas: ${p.normas.map(nombreNorma).join("; ")}.` : "", secciones.length ? `Secciones: ${secciones.join("; ")}.` : ""].filter(Boolean).join(" "),
    });
  }

  // ── Manual por pantalla (una ficha por parte) ──
  for (const s of MANUAL) {
    const href = hrefSeccion(s.id);
    add({
      clave: `manual:${s.id}`, fuente: "manual", href,
      titulo: `Pantalla «${s.titulo}» — para qué sirve y paso a paso`,
      texto: [s.resumen, s.pasos?.length ? `Paso a paso: ${s.pasos.map((p, i) => `${i + 1}. ${p}`).join(" ")}` : "", s.consejos?.length ? `Consejos: ${s.consejos.join(" ")}` : "", s.normas?.length ? `Normas: ${s.normas.join("; ")}.` : ""].filter(Boolean).join(" "),
    });
    s.partes.forEach((p, i) => add({
      clave: `manual:${s.id}:${i}`, fuente: "manual", href,
      titulo: `Pantalla «${s.titulo}» › ${p.titulo}`,
      texto: [p.que, ...(p.botones ?? []).map((b) => `Botón «${b.nombre}»: ${b.hace}`)].join(" "),
    }));
  }

  // ── Ayuda de campos de los formularios ──
  for (const [k, a] of Object.entries(AYUDA)) {
    add({
      clave: `campo:${k}`, fuente: "campo",
      titulo: `Campo «${a.titulo}»`,
      texto: [a.que, a.para ? `Para qué: ${a.para}` : "", a.donde ? `Dónde se encuentra: ${a.donde}` : "", a.ejemplo ? `Ejemplo: ${a.ejemplo}` : "", a.opciones?.length ? `Opciones: ${a.opciones.map((o) => `${o.etiqueta}${o.explica ? ` (${o.explica})` : ""}`).join("; ")}.` : "", a.normas?.length ? `Normas: ${a.normas.join("; ")}.` : ""].filter(Boolean).join(" "),
    });
  }

  // ── Plazos automáticos ──
  for (const p of PLAZOS) {
    const m = MODULOS_PLAZO[p.modulo];
    add({
      clave: `plazo:${p.clave}`, fuente: "plazo", articulo: p.norma ?? null, href: m.href ? `${E}/${m.href}` : "/normas",
      titulo: `Plazo: ${p.tarea} (${m.t})`,
      texto: `${p.tarea}: ${textoPlazo(p)}. Se programa: ${p.cuando}. Cuenta desde ${p.desde}. ${p.tipo === "legal" ? `Plazo legal: ${p.norma ?? ""}.` : "Criterio de la empresa (no lo fija la norma; se ajusta en Normas y estándares → Plazos y tareas automáticas)."}${p.nota ? ` ${p.nota}` : ""}`,
    });
  }

  // ── Decisiones normativas de la consultora ──
  const decisiones = readFileSync(join(RAIZ, "docs/requisitos/DECISIONES.md"), "utf8");
  const criterio = decisiones.match(/^Criterio general[^\n]+/m)?.[0];
  if (criterio) add({ clave: "decision:criterio", fuente: "decision", titulo: "Decisión de la consultora — criterio general donde la norma deja margen", texto: criterio });
  for (const fila of decisiones.matchAll(/^\| ([A-Z]\d+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/gm)) {
    const [, id, duda, decision, sustento] = fila.map((x) => x.trim());
    add({ clave: `decision:${id}`, fuente: "decision", articulo: sustento === "—" ? null : sustento, titulo: `Decisión de la consultora ${id} — ${duda}`, texto: `${decision} Sustento: ${sustento}.` });
  }

  // ── Texto oficial de normas (fase 4): conocimiento/normas/<CODIGO>.md, un "## Artículo …" por artículo ──
  const dir = join(RAIZ, "conocimiento/normas");
  if (existsSync(dir)) {
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".md"))) {
      const md = readFileSync(join(dir, f), "utf8");
      const fm = md.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
      const codigo = fm.match(/^codigo:\s*(.+)$/m)?.[1].trim();
      const url = fm.match(/^url:\s*(.+)$/m)?.[1].trim() ?? (codigo ? URL_NORMA.get(codigo) : null) ?? null;
      // Normas partidas en dos páginas en la fuente: url_parte2 vale desde el artículo parte2_desde.
      const url2 = fm.match(/^url_parte2:\s*(.+)$/m)?.[1].trim(), desde2 = fm.match(/^parte2_desde:\s*(.+)$/m)?.[1].trim();
      let enParte2 = false;
      if (!codigo || !NOMBRE_NORMA.has(codigo)) throw new Error(`[conocimiento] ${f}: código de norma ausente o fuera del catálogo (${codigo}).`);
      for (const b of md.replace(/^---[\s\S]*?---/, "").split(/^## /m).slice(1)) {
        const [enc, ...cuerpo] = b.split("\n");
        const texto = cuerpo.join("\n").trim();
        if (!texto) continue;
        const articulo = enc.trim();
        if (url2 && desde2 && articulo.includes(` ${desde2}.`)) enParte2 = true;
        add({ clave: `art:${codigo}:${articulo.toLowerCase().replace(/\s+/g, "-")}`, fuente: "articulo", normaCodigo: codigo, articulo, urlOficial: enParte2 ? url2! : url, literal: true, titulo: `${nombreNorma(codigo)} — ${articulo}`, texto });
      }
    }
  }

  // ── Guardar ──
  const claves = new Set<string>();
  for (const f of fichas) {
    if (claves.has(f.clave)) throw new Error(`[conocimiento] clave repetida: ${f.clave}`);
    claves.add(f.clave);
  }
  const actuales = new Map((await db.conocimiento.findMany({ select: { clave: true, titulo: true, texto: true, href: true, articulo: true, normaCodigo: true, urlOficial: true, literal: true, fuente: true } })).map((c) => [c.clave, c]));
  let nuevas = 0, cambiadas = 0;
  for (const f of fichas) {
    const data = { fuente: f.fuente, titulo: f.titulo, texto: f.texto, normaCodigo: f.normaCodigo ?? null, articulo: f.articulo ?? null, href: f.href ?? null, urlOficial: f.urlOficial ?? null, literal: f.literal ?? false };
    const a = actuales.get(f.clave);
    if (!a) { await db.conocimiento.create({ data: { clave: f.clave, ...data } }); nuevas++; continue; }
    const prev = { fuente: a.fuente, titulo: a.titulo, texto: a.texto, normaCodigo: a.normaCodigo, articulo: a.articulo, href: a.href, urlOficial: a.urlOficial, literal: a.literal };
    if (JSON.stringify(prev) !== JSON.stringify(data)) { await db.conocimiento.update({ where: { clave: f.clave }, data }); cambiadas++; }
  }
  const sobran = [...actuales.keys()].filter((k) => !claves.has(k));
  if (sobran.length) await db.conocimiento.deleteMany({ where: { clave: { in: sobran } } });
  const porFuente = fichas.reduce<Record<string, number>>((m, f) => ({ ...m, [f.fuente]: (m[f.fuente] ?? 0) + 1 }), {});
  console.log(`[conocimiento] ${fichas.length} fichas (nuevas ${nuevas}, cambiadas ${cambiadas}, borradas ${sobran.length}):`, porFuente);
}

if (process.argv[1]?.includes("indexar-conocimiento")) {
  indexarConocimiento().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
}
