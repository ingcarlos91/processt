import Handlebars from "handlebars";

export type FrontMatter = {
  codigo: string; nombre: string; tipo: string; nivelMin: number; carpeta?: string;
  estandares: string[]; normas: string[]; condicion?: Record<string, unknown> | null; descripcion?: string;
};

/** Separa front matter (--- ... ---) del cuerpo Markdown. */
export function parsePlantilla(texto: string): { meta: FrontMatter; cuerpo: string } {
  const m = texto.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error("Plantilla sin front matter");
  const meta: Record<string, unknown> = {};
  for (const linea of m[1].split("\n")) {
    const i = linea.indexOf(":");
    if (i < 0) continue;
    const k = linea.slice(0, i).trim();
    const v = linea.slice(i + 1).trim();
    if (v.startsWith("[") || v.startsWith("{")) meta[k] = JSON.parse(v);
    else if (/^\d+$/.test(v)) meta[k] = Number(v);
    else meta[k] = v;
  }
  return { meta: meta as FrontMatter, cuerpo: m[2] };
}

/** Divide el Markdown en secciones por encabezado "## ". Lo previo al primer "## " es la sección 0 (introducción). */
export function dividirSecciones(md: string): { titulo: string; contenido: string }[] {
  const lineas = md.split("\n");
  const secciones: { titulo: string; contenido: string[] }[] = [];
  let actual: { titulo: string; contenido: string[] } = { titulo: "", contenido: [] };
  for (const l of lineas) {
    if (l.startsWith("## ")) {
      if (actual.titulo || actual.contenido.join("").trim()) secciones.push(actual);
      actual = { titulo: l.slice(3).trim(), contenido: [] };
    } else actual.contenido.push(l);
  }
  if (actual.titulo || actual.contenido.join("").trim()) secciones.push(actual);
  return secciones.map((s) => ({ titulo: s.titulo, contenido: s.contenido.join("\n").trim() }));
}

const hb = Handlebars.create();
hb.registerHelper("inc", (n: number) => Number(n) + 1);
hb.registerHelper("eq", (a: unknown, b: unknown) => a === b);
hb.registerHelper("ne", (a: unknown, b: unknown) => a !== b);
hb.registerHelper("gte", (a: number, b: number) => Number(a) >= Number(b));
hb.registerHelper("lte", (a: number, b: number) => Number(a) <= Number(b));
hb.registerHelper("gt", (a: number, b: number) => Number(a) > Number(b));
hb.registerHelper("or", (...args: unknown[]) => args.slice(0, -1).some(Boolean));
hb.registerHelper("and", (...args: unknown[]) => args.slice(0, -1).every(Boolean));
hb.registerHelper("not", (a: unknown) => !a);
hb.registerHelper("upper", (s: string) => (s ?? "").toString().toUpperCase());
hb.registerHelper("join", (arr: unknown[], sep: string) => (Array.isArray(arr) ? arr.join(typeof sep === "string" ? sep : ", ") : ""));
hb.registerHelper("default", (v: unknown, d: string) => (v === undefined || v === null || v === "" ? d : v));
hb.registerHelper("len", (arr: unknown[]) => (Array.isArray(arr) ? arr.length : 0));
hb.registerHelper("celda", (s: unknown) => (s ?? "").toString().replace(/\|/g, "/").replace(/\n/g, " "));

export function render(cuerpo: string, contexto: unknown): string {
  const tpl = hb.compile(cuerpo, { noEscape: true, strict: false });
  return tpl(contexto).replace(/\n{3,}/g, "\n\n").trim();
}
