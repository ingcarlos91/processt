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
};

export const REQUISITOS: Record<string, Requisito[]> = REQUISITOS_DATOS;

export type EstadoRequisito = Requisito & { cubierto: boolean; motivo?: string };

const normalizar = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Cobertura de un documento generado (o de una plantilla) frente a sus requisitos. */
/**
 * `normasAplicables`: si se pasa (normas que el motor de reglas aplica a la empresa), se omiten los requisitos
 * de normas que no le aplican (p. ej. el capítulo de alturas en una empresa sin trabajo en alturas).
 */
export function coberturaRequisitos(codigo: string, secciones: { titulo: string; contenido: string }[], normasAplicables?: Set<string>): EstadoRequisito[] {
  return (REQUISITOS[codigo] ?? []).filter((r) => !normasAplicables || normasAplicables.has(r.norma)).map((r) => {
    const s = secciones.find((x) => normalizar(x.titulo) === normalizar(r.seccion));
    if (!s) return { ...r, cubierto: false, motivo: `No existe la sección “${r.seccion}”.` };
    const texto = s.contenido.replace(/<!--[\s\S]*?-->/g, "").trim();
    if (!texto) return { ...r, cubierto: false, motivo: `La sección “${r.seccion}” está vacía.` };
    if (r.clave && !new RegExp(r.clave, "i").test(normalizar(texto))) return { ...r, cubierto: false, motivo: `La sección “${r.seccion}” no trata este punto.` };
    return { ...r, cubierto: true };
  });
}
