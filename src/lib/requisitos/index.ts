// Requisitos normativos de cada artefacto: lo que la norma exige que contenga el documento.
// Cada requisito sale del texto oficial (artículo exacto) y apunta a la sección de la plantilla que lo cubre.
// Fuente de la verificación: docs/10-requisitos-por-artefacto.md. Validación: scripts/validar-requisitos.ts.
import { REQUISITOS_DATOS } from "./datos";

export type Requisito = {
  id: string;
  /** Lo que exige la norma, parafraseado. */
  texto: string;
  /** Código del catálogo de normas (prisma/seed/normas.ts). */
  norma: string;
  /** Artículo, numeral o parágrafo exacto. */
  articulo: string;
  /** Título exacto de la sección ("## …") de la plantilla que lo cubre. */
  seccion: string;
  /** Expresión regular que debe aparecer en la sección (escríbala en minúsculas y sin tildes: el texto se normaliza). Sin clave, solo se exige que la sección tenga contenido. */
  clave?: string;
  /** Solo aplica a ciertas empresas: "nivel7" | "nivel21" | "nivel60" | "vigia" | "copasst" | "dis:<disparador>". Varias opciones separadas por "|" (basta una). */
  si?: string;
};

/** Perfil de la empresa para decidir qué requisitos le aplican (sale del resultado de reglas). */
export type PerfilRequisitos = { normas: Set<string>; nivel?: number; comites?: string[]; disparadores?: string[] };

export function perfilDe(rr: { normas?: { codigo: string }[]; nivel?: number; comites?: string[]; disparadores?: string[] } | null | undefined): PerfilRequisitos | undefined {
  if (!rr?.normas) return undefined;
  return { normas: new Set(rr.normas.map((n) => n.codigo)), nivel: rr.nivel, comites: rr.comites, disparadores: rr.disparadores };
}

function aplica(r: Requisito, p?: PerfilRequisitos) {
  if (!p) return true;
  if (!p.normas.has(r.norma)) return false;
  if (!r.si) return true;
  return r.si.split("|").some((c) => {
    if (c.startsWith("nivel")) return p.nivel === undefined || p.nivel === Number(c.slice(5));
    if (c === "vigia") return !p.comites || p.comites.includes("VIGIA");
    if (c === "copasst") return !p.comites || p.comites.includes("COPASST");
    if (c.startsWith("dis:")) return !p.disparadores || p.disparadores.includes(c.slice(4));
    return true;
  });
}

export const REQUISITOS: Record<string, Requisito[]> = REQUISITOS_DATOS;

export type EstadoRequisito = Requisito & { cubierto: boolean; motivo?: string };

const normalizar = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Cobertura de un documento generado (o de una plantilla) frente a sus requisitos. */
/**
 * `perfil`: si se pasa (resultado de reglas de la empresa), se omiten los requisitos que no le aplican: los de normas
 * que el motor no le aplica (p. ej. el capítulo de alturas sin trabajo en alturas) y los condicionados con `si`.
 */
export function coberturaRequisitos(codigo: string, secciones: { titulo: string; contenido: string }[], perfil?: PerfilRequisitos): EstadoRequisito[] {
  return (REQUISITOS[codigo] ?? []).filter((r) => aplica(r, perfil)).map((r) => {
    const s = secciones.find((x) => normalizar(x.titulo) === normalizar(r.seccion));
    if (!s) return { ...r, cubierto: false, motivo: `No existe la sección “${r.seccion}”.` };
    const texto = s.contenido.replace(/<!--[\s\S]*?-->/g, "").trim();
    if (!texto) return { ...r, cubierto: false, motivo: `La sección “${r.seccion}” está vacía.` };
    if (r.clave && !new RegExp(r.clave, "i").test(normalizar(texto))) return { ...r, cubierto: false, motivo: `La sección “${r.seccion}” no trata este punto.` };
    return { ...r, cubierto: true };
  });
}
