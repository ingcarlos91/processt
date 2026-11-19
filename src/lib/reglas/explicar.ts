// Explicaciones en lenguaje sencillo de por qué una regla, norma o documento aplica a una empresa.
import { DISPARADORES, type Condicion, type ContextoReglas } from "./condicion";

const R = ["", "I", "II", "III", "IV", "V"];
const etiquetaDisparador = (d: string) => DISPARADORES.find((x) => x.clave === d)?.etiqueta.toLowerCase() ?? d;

/** Describe qué hechos de la empresa hacen que la condición se cumpla. */
export function explicarCondicion(c: Condicion | null | undefined, ctx: ContextoReglas): string {
  if (!c || Object.keys(c).length === 0 || c.siempre) return "Aplica a todas las empresas, sin importar su tamaño o actividad.";
  if (c.nunca) return "No aplica: la norma fue derogada.";
  const partes: string[] = [];
  const t = ctx.trabajadores;
  if (c.trabajadoresMin != null && c.trabajadoresMax != null) partes.push(`la empresa tiene ${t} trabajadores (la regla aplica entre ${c.trabajadoresMin} y ${c.trabajadoresMax})`);
  else if (c.trabajadoresMin != null) partes.push(`la empresa tiene ${t} trabajadores (la regla aplica desde ${c.trabajadoresMin})`);
  else if (c.trabajadoresMax != null) partes.push(`la empresa tiene ${t} trabajadores (la regla aplica hasta ${c.trabajadoresMax})`);
  if (c.claseRiesgoIn) partes.push(`su clase de riesgo es ${R[ctx.claseRiesgo]} (la regla aplica a clase ${c.claseRiesgoIn.map((x) => R[x]).join(", ")})`);
  if (c.disparador) partes.push(ctx.origenDisparadores?.[c.disparador] ?? `en el cuestionario se marcó “${etiquetaDisparador(c.disparador)}”`);
  if (c.disparadorAlguno) partes.push(`se marcó alguno de: ${c.disparadorAlguno.map(etiquetaDisparador).join(", ")}`);
  if (c.vehiculosMin != null) partes.push(`tiene ${ctx.vehiculos} vehículos o conductores (la regla aplica desde ${c.vehiculosMin})`);
  if (c.aprendicesMin != null) partes.push(`tiene ${ctx.aprendices} aprendices o practicantes`);
  if (c.esUpa != null) partes.push(c.esUpa ? "es una unidad de producción agropecuaria" : "no es una unidad de producción agropecuaria");
  if (c.nivelMin != null) partes.push(`le aplican ${ctx.nivel} estándares (la regla exige nivel ${c.nivelMin} o más)`);
  if (c.todos) partes.push(c.todos.map((x) => explicarCondicion(x, ctx)).join(" y "));
  if (c.alguno) partes.push(c.alguno.map((x) => explicarCondicion(x, ctx)).join(" o "));
  if (!partes.length) return "Aplica según las condiciones de la empresa.";
  const s = partes.join("; ");
  return "Porque " + s + ".";
}

/** Explica cómo se contó el número de trabajadores para el nivel de estándares. */
export function explicarConteo(e: { nTrabajadoresPlanta: number; nEnMision: number; nContratistas: number; nAprendices: number }) {
  const total = e.nTrabajadoresPlanta + e.nEnMision;
  return `Se cuentan ${total} trabajadores: ${e.nTrabajadoresPlanta} de planta + ${e.nEnMision} en misión. Los ${e.nContratistas} contratistas y ${e.nAprendices} aprendices no suman para definir el nivel, pero sí se incluyen en la matriz, la inducción y los indicadores (Res. 0312/2019 art. 30; Decreto 1072/2015 art. 2.2.4.6.28). Este es un criterio adoptado: si la ARL o el Ministerio cuentan distinto, ajuste el número de planta.`;
}

export function explicarNivel(nivel: number, t: number, clase: number) {
  if (nivel === 60 && t > 50) return `Tiene más de 50 trabajadores (${t}). La Res. 0312/2019 art. 16 exige los 60 estándares completos a toda empresa de ese tamaño, sin importar su riesgo.`;
  if (nivel === 60) return `Aunque tiene ${t} trabajadores, su clase de riesgo es ${R[clase]}. Las clases IV y V son de alto riesgo, y la Res. 0312/2019 (arts. 8 y 15) obliga a cumplir los 60 estándares.`;
  if (nivel === 21) return `Tiene entre 11 y 50 trabajadores (${t}) y riesgo ${R[clase]} (I, II o III). Para ese caso la Res. 0312/2019 art. 9 exige 21 estándares.`;
  return `Tiene 10 o menos trabajadores (${t}) y riesgo ${R[clase]} (I, II o III). Para ese caso la Res. 0312/2019 art. 3 exige solo 7 estándares.`;
}

export function explicarClaseRiesgo(e: { ciiu: string | null; descripcionActividad: string | null; claseRiesgo: number; claseRiesgoJustificacion: string | null }, sugerida?: number | null) {
  const base = `La clase de riesgo (I a V) la asigna la ARL según la actividad económica, con la tabla del Decreto 1607/2002 (actualizada por el Decreto 768/2022).`;
  const act = e.ciiu ? ` La actividad registrada es CIIU ${e.ciiu} (${e.descripcionActividad ?? ""}).` : "";
  const sug = sugerida ? ` Para ese código el sistema sugiere clase ${R[sugerida]}.` : "";
  const dif = sugerida && sugerida !== e.claseRiesgo ? ` Se registró clase ${R[e.claseRiesgo]} en vez de la sugerida${e.claseRiesgoJustificacion ? `: “${e.claseRiesgoJustificacion}”` : " (sin justificación)"}.` : "";
  return base + act + sug + dif + " Verifíquela con el certificado de afiliación de la ARL.";
}
