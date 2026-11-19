import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { Root, RootContent, PhrasingContent, Table } from "mdast";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table as DTable, TableRow, TableCell, WidthType, AlignmentType,
  Header, Footer, PageNumber, BorderStyle, ShadingType, PageOrientation, ImageRun,
} from "docx";

export async function mdAHtml(md: string) {
  const f = await unified().use(remarkParse).use(remarkGfm).use(remarkBreaks).use(remarkRehype).use(rehypeStringify).process(md.replace(/&nbsp;/g, " "));
  return String(f);
}

type Meta = { codigo: string; nombre: string; version: number; fecha: string; empresa: string; nit: string; elaboro: string; aprobo: string; horizontal?: boolean; logo?: Buffer | null };

function runs(nodes: PhrasingContent[], estilo: { bold?: boolean; italics?: boolean } = {}): TextRun[] {
  const out: TextRun[] = [];
  for (const n of nodes) {
    if (n.type === "text") out.push(new TextRun({ text: n.value.replace(/&nbsp;/g, " "), ...estilo }));
    else if (n.type === "strong") out.push(...runs(n.children, { ...estilo, bold: true }));
    else if (n.type === "emphasis") out.push(...runs(n.children, { ...estilo, italics: true }));
    else if (n.type === "inlineCode") out.push(new TextRun({ text: n.value, font: "Consolas", ...estilo }));
    else if (n.type === "break") out.push(new TextRun({ text: "", break: 1 }));
    else if (n.type === "link") out.push(...runs(n.children, estilo));
    else if ("children" in n) out.push(...runs((n as { children: PhrasingContent[] }).children, estilo));
    else if ("value" in n) out.push(new TextRun({ text: String((n as { value: string }).value), ...estilo }));
  }
  return out;
}

function tabla(t: Table) {
  const ncols = Math.max(...t.children.map((r) => r.children.length));
  return new DTable({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: t.children.map((r, ri) => new TableRow({
      tableHeader: ri === 0,
      children: Array.from({ length: ncols }, (_, ci) => {
        const c = r.children[ci];
        return new TableCell({
          shading: ri === 0 ? { type: ShadingType.CLEAR, color: "auto", fill: "D9E2F3" } : undefined,
          children: [new Paragraph({ children: c ? runs(c.children, ri === 0 ? { bold: true } : {}) : [], spacing: { before: 20, after: 20 } })],
        });
      }),
    })),
  });
}

function bloques(nodes: RootContent[], nivelLista = 0, ordenada = false): (Paragraph | DTable)[] {
  const out: (Paragraph | DTable)[] = [];
  for (const n of nodes) {
    switch (n.type) {
      case "heading": {
        const lv = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4][n.depth] ?? HeadingLevel.HEADING_4;
        out.push(new Paragraph({ heading: lv, children: runs(n.children), spacing: { before: 200, after: 100 } }));
        break;
      }
      case "paragraph": out.push(new Paragraph({ children: runs(n.children), spacing: { after: 120 }, alignment: AlignmentType.JUSTIFIED })); break;
      case "list": {
        n.children.forEach((li, i) => {
          li.children.forEach((c, j) => {
            if (c.type === "paragraph") {
              const pref = j === 0 ? (n.ordered ? `${(n.start ?? 1) + i}. ` : "• ") : "   ";
              out.push(new Paragraph({ children: [new TextRun(pref), ...runs(c.children)], indent: { left: 360 * (nivelLista + 1), hanging: 260 }, spacing: { after: 60 } }));
            } else out.push(...bloques([c], nivelLista + 1, ordenada));
          });
        });
        break;
      }
      case "table": out.push(tabla(n)); out.push(new Paragraph({ children: [] })); break;
      case "blockquote": for (const c of bloques(n.children)) out.push(c instanceof Paragraph ? c : c); break;
      case "thematicBreak": out.push(new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "999999", space: 1 } }, children: [] })); break;
      case "code": out.push(new Paragraph({ children: [new TextRun({ text: n.value, font: "Consolas" })] })); break;
      case "html": out.push(new Paragraph({ children: [new TextRun(n.value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " "))] })); break;
      default: break;
    }
  }
  return out;
}

export async function mdADocx(md: string, meta: Meta) {
  const proc = unified().use(remarkParse).use(remarkGfm).use(remarkBreaks);
  const tree = (await proc.run(proc.parse(md.replace(/&nbsp;/g, "\u00a0")))) as Root;
  const celda = (t: string, bold = false, w?: number) => new TableCell({
    width: w ? { size: w, type: WidthType.PERCENTAGE } : undefined,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold, size: 18 })] })],
  });
  const logoCelda = meta.logo
    ? new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, rowSpan: 2, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: meta.logo, transformation: { width: 90, height: 45 }, type: "png" })] })] })
    : new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, rowSpan: 2, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: meta.empresa, bold: true, size: 16 })] })] });
  const header = new Header({
    children: [new DTable({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({ children: [logoCelda, celda("SISTEMA DE GESTIÓN DE LA SEGURIDAD Y SALUD EN EL TRABAJO", true, 55), celda(`Código: ${meta.codigo}`, false, 25)] }),
        new TableRow({ children: [celda(meta.nombre.toUpperCase(), true), celda(`Versión: ${meta.version}  ·  ${meta.fecha}`)] }),
      ],
    }), new Paragraph({ children: [] })],
  });
  const footer = new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: `${meta.empresa} — NIT ${meta.nit}   |   Elaboró: ${meta.elaboro}   |   Aprobó: ${meta.aprobo}   |   Página `, size: 16 }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16 }), new TextRun({ text: " de ", size: 16 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16 }),
      ],
    })],
  });
  const doc = new Document({
    styles: { default: { document: { run: { font: "Arial", size: 20 } } } },
    sections: [{
      properties: { page: { margin: { top: 1000, bottom: 900, left: 1000, right: 1000 }, size: meta.horizontal ? { orientation: PageOrientation.LANDSCAPE } : undefined } },
      headers: { default: header }, footers: { default: footer },
      children: [new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, children: [new TextRun({ text: meta.nombre, bold: true })] }), ...bloques(tree.children)],
    }],
  });
  return Packer.toBuffer(doc);
}
