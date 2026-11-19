// Exportación a PDF: el mismo documento del Word (encabezado con logo, firmas, pie con páginas),
// armado en HTML e impreso con Chromium (Playwright). Tamaño carta.
import type { Browser } from "playwright";
import { mdAHtml } from "./exportar";

type Meta = {
  codigo: string; nombre: string; version: number; fecha: string; empresa: string; nit: string; elaboro: string; aprobo: string;
  horizontal?: boolean; logo?: { buf: Buffer; tipo: "png" | "jpg"; ancho: number; alto: number } | null;
  /** HTML a insertar en lugar de párrafos con el marcador [[CLAVE]] (por ejemplo, gráficas SVG). */
  insertar?: Record<string, string>;
  /** Texto de la franja superior del encabezado (por defecto, el nombre del sistema de gestión). */
  sistema?: string;
};

let navegador: Promise<Browser> | null = null;
async function chromium() {
  if (!navegador) navegador = import("playwright").then((p) => p.chromium.launch());
  const b = await navegador;
  if (!b.isConnected()) { navegador = null; return chromium(); }
  return b;
}

const esc = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Convierte las firmas (línea + **Nombre** — cargo — documento) en bloques de firma, dos por fila. */
function firmas(html: string) {
  const re = /<hr>\s*<p><strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/p>/g;
  return html.replace(/(?:<hr>\s*<p><strong>[\s\S]*?<\/strong>[\s\S]*?<\/p>\s*)+/g, (grupo) => {
    const bloques = [...grupo.matchAll(re)].map((m) => {
      const partes = m[2].replace(/<br>/g, " — ").split(/\s+—\s+/).map((x) => x.replace(/<[^>]+>/g, "").trim()).filter(Boolean);
      const doc = partes.find((x) => /^(C\.?\s?C\.?|C\.?\s?E\.?|Pasaporte|PPT|PEP|T\.?\s?I\.?)(\s|$)/i.test(x));
      const cargo = partes.filter((x) => x !== doc).join(" — ");
      return `<div class="firma"><div class="linea"></div><div class="nombre">${m[1]}</div>${cargo ? `<div class="cargo">${cargo}</div>` : ""}<div class="doc">${doc ?? "Documento: ____________________"}</div></div>`;
    });
    return `<div class="firmas">${bloques.join("")}</div>`;
  });
}

const CSS = `
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; color: #111; line-height: 1.4; margin: 0; }
  h1.titulo { text-align: center; font-size: 18pt; margin: 0 0 14pt; }
  h2 { font-size: 12.5pt; color: #1f4e79; margin: 16pt 0 6pt; border-bottom: 1px solid #d9e2f3; padding-bottom: 2pt; page-break-after: avoid; }
  h3 { font-size: 11pt; margin: 12pt 0 4pt; page-break-after: avoid; }
  p { margin: 0 0 6pt; text-align: justify; }
  ul, ol { margin: 0 0 6pt; padding-left: 18pt; }
  li { margin-bottom: 2pt; }
  table { width: 100%; border-collapse: collapse; margin: 6pt 0 10pt; font-size: 8.8pt; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #9aa7b5; padding: 3pt 4pt; vertical-align: top; text-align: left; }
  th { background: #d9e2f3; font-weight: bold; }
  thead { display: table-header-group; }
  blockquote { margin: 6pt 0; padding: 4pt 10pt; border-left: 3px solid #9aa7b5; color: #333; background: #f5f7fa; }
  hr { border: 0; border-bottom: 1px solid #999; margin: 14pt 0 8pt; }
  .firmas { display: grid; grid-template-columns: 1fr 1fr; gap: 24pt 36pt; margin-top: 30pt; page-break-inside: avoid; }
  .firma .linea { border-top: 1px solid #000; margin-top: 42pt; margin-bottom: 3pt; }
  .firma .nombre { font-weight: bold; }
  .firma .cargo { font-size: 9pt; }
  .firma .doc { font-size: 9pt; color: #555; }
  body.horizontal table { font-size: 7.2pt; }
  body.horizontal th, body.horizontal td { padding: 2pt 3pt; }
`;

export async function mdAPdf(md: string, meta: Meta) {
  let cuerpo = firmas(await mdAHtml(md));
  for (const [k, html] of Object.entries(meta.insertar ?? {})) cuerpo = cuerpo.replace(`<p>[[${k}]]</p>`, html);
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${CSS}</style></head><body class="${meta.horizontal ? "horizontal" : ""}"><h1 class="titulo">${esc(meta.nombre)}</h1>${cuerpo}</body></html>`;
  const logo = meta.logo ? `<img src="data:image/${meta.logo.tipo === "jpg" ? "jpeg" : "png"};base64,${meta.logo.buf.toString("base64")}" style="max-height:34px;max-width:100px">` : `<b>${esc(meta.empresa)}</b>`;
  const header = `<div style="width:100%;padding:0 12mm;font-family:Arial;font-size:7.5pt;">
    <table style="width:100%;border-collapse:collapse;"><tr>
      <td rowspan="2" style="width:20%;border:1px solid #555;text-align:center;padding:2px;">${logo}</td>
      <td style="width:55%;border:1px solid #555;text-align:center;font-weight:bold;padding:2px;">${esc(meta.sistema ?? "SISTEMA DE GESTIÓN DE LA SEGURIDAD Y SALUD EN EL TRABAJO")}</td>
      <td style="width:25%;border:1px solid #555;text-align:center;padding:2px;">Código: ${esc(meta.codigo)}</td></tr>
      <tr><td style="border:1px solid #555;text-align:center;font-weight:bold;padding:2px;">${esc(meta.nombre.toUpperCase())}</td>
      <td style="border:1px solid #555;text-align:center;padding:2px;">Versión: ${meta.version} · ${esc(meta.fecha)}</td></tr></table></div>`;
  const footer = `<div style="width:100%;padding:0 12mm;font-family:Arial;font-size:7pt;color:#444;text-align:center;">
    ${esc(meta.empresa)} — NIT ${esc(meta.nit)} &nbsp;|&nbsp; Elaboró: ${esc(meta.elaboro)} &nbsp;|&nbsp; Aprobó: ${esc(meta.aprobo)} &nbsp;|&nbsp; Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>`;
  const b = await chromium();
  const ctx = await b.newContext();
  try {
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: "load" });
    return await page.pdf({
      format: "Letter", landscape: !!meta.horizontal, printBackground: true, displayHeaderFooter: true, headerTemplate: header, footerTemplate: footer,
      margin: meta.horizontal ? { top: "32mm", bottom: "16mm", left: "10mm", right: "10mm" } : { top: "34mm", bottom: "18mm", left: "16mm", right: "16mm" },
    });
  } finally {
    await ctx.close();
  }
}
