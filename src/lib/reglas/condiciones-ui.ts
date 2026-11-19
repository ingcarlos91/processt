// Explica, para la consultora, qué dato de la empresa dispara cada condición (regla o norma):
// cómo se lee la condición, qué valor tiene hoy la empresa, qué la activaría y dónde se registra ese dato.
import { DISPARADORES, cumple, type Condicion, type ContextoReglas, type Disparador } from "./condicion";

const R = ["", "I", "II", "III", "IV", "V"];
const etiqueta = (d: Disparador) => DISPARADORES.find((x) => x.clave === d)?.etiqueta ?? d;

/** Texto genérico de la condición, sin datos de la empresa. */
export function describirCondicion(c: Condicion | null | undefined): string {
  if (!c || Object.keys(c).length === 0 || c.siempre) return "todas las empresas";
  if (c.nunca) return "ninguna empresa (norma derogada)";
  const p: string[] = [];
  if (c.trabajadoresMin != null && c.trabajadoresMax != null) p.push(`entre ${c.trabajadoresMin} y ${c.trabajadoresMax} trabajadores`);
  else if (c.trabajadoresMin != null) p.push(`${c.trabajadoresMin} o más trabajadores`);
  else if (c.trabajadoresMax != null) p.push(`hasta ${c.trabajadoresMax} trabajadores`);
  if (c.claseRiesgoIn) p.push(`clase de riesgo ${c.claseRiesgoIn.map((x) => R[x]).join(", ")}`);
  if (c.disparador) p.push(`marcar “${etiqueta(c.disparador)}”`);
  if (c.disparadorAlguno) p.push(`marcar alguno de: ${c.disparadorAlguno.map((d) => `“${etiqueta(d)}”`).join(", ")}`);
  if (c.vehiculosMin != null) p.push(`más de ${c.vehiculosMin - 1} vehículos`);
  if (c.conductoresMin != null) p.push(`${c.conductoresMin} o más conductores`);
  if (c.contratistasMin != null) p.push(`${c.contratistasMin} o más contratistas por prestación de servicios`);
  if (c.aprendicesMin != null) p.push(`${c.aprendicesMin} o más aprendices o practicantes`);
  if (c.mujeresMin != null) p.push(`más de ${c.mujeresMin - 1} trabajadoras`);
  if (c.sedesMin != null) p.push(`${c.sedesMin} o más sedes`);
  if (c.esUpa != null) p.push(c.esUpa ? "ser unidad de producción agropecuaria" : "no ser UPA");
  if (c.esTransporte != null) p.push(c.esTransporte ? "ser empresa de transporte" : "no ser empresa de transporte");
  if (c.nivelMin != null) p.push(`nivel de ${c.nivelMin} estándares o más`);
  if (c.todos) p.push(c.todos.map(describirCondicion).join(" y "));
  if (c.alguno) p.push(c.alguno.map(describirCondicion).join(", o "));
  return p.join(" y ");
}

export type CampoCondicion = { campo: string; valor: string; donde: string; href: string };

/** Datos de la empresa que intervienen en la condición, con su valor actual y dónde se editan. */
export function camposCondicion(c: Condicion | null | undefined, ctx: ContextoReglas, base: string): CampoCondicion[] {
  const out: CampoCondicion[] = [];
  const datos = `${base}/datos`;
  const add = (x: CampoCondicion) => { if (!out.some((y) => y.campo === x.campo)) out.push(x); };
  const rec = (k: Condicion | null | undefined) => {
    if (!k) return;
    if (k.trabajadoresMin != null || k.trabajadoresMax != null || k.nivelMin != null) add({ campo: "Trabajadores (planta + en misión)", valor: String(ctx.trabajadores), donde: "Datos → Personas", href: datos });
    if (k.claseRiesgoIn || k.nivelMin != null) add({ campo: "Clase de riesgo", valor: R[ctx.claseRiesgo] ?? String(ctx.claseRiesgo), donde: "Datos → Actividad económica", href: datos });
    for (const d of [k.disparador, ...(k.disparadorAlguno ?? [])].filter(Boolean) as Disparador[]) {
      const origen = ctx.origenDisparadores?.[d];
      add({ campo: `Peligro especial: ${etiqueta(d)}`, valor: ctx.disparadores[d] ? (origen ? "activado por la matriz de peligros" : "marcado") : "no marcado", donde: origen ? "Cargos y matriz" : "Datos → Peligros especiales", href: origen ? `${base}/matriz` : datos });
    }
    if (k.vehiculosMin != null) add({ campo: "Vehículos", valor: String(ctx.vehiculos), donde: "Datos → Personas y vehículos", href: datos });
    if (k.conductoresMin != null) add({ campo: "Conductores", valor: String(ctx.conductores ?? 0), donde: "Datos → Personas y vehículos", href: datos });
    if (k.contratistasMin != null) add({ campo: "Contratistas", valor: String(ctx.contratistas ?? 0), donde: "Datos → Personas", href: datos });
    if (k.aprendicesMin != null) add({ campo: "Aprendices", valor: String(ctx.aprendices), donde: "Datos → Personas", href: datos });
    if (k.mujeresMin != null) add({ campo: "Trabajadoras (sexo F) activas", valor: String(ctx.mujeres ?? 0), donde: "Trabajadores (campo sexo de cada persona)", href: `${base}/trabajadores` });
    if (k.sedesMin != null) add({ campo: "Sedes", valor: String(ctx.sedes ?? 1), donde: "Datos → Sedes", href: datos });
    if (k.esUpa != null) add({ campo: "Unidad de producción agropecuaria", valor: ctx.esUpa ? "sí" : "no", donde: "Datos", href: datos });
    if (k.esTransporte != null) add({ campo: "Empresa de transporte (CIIU 49)", valor: ctx.esTransporte ? "sí" : "no", donde: "Datos → Actividad económica", href: datos });
    k.todos?.forEach(rec); k.alguno?.forEach(rec);
  };
  rec(c);
  return out;
}

/** Para una condición que hoy no se cumple: qué tendría que pasar para que aplique. */
export function queActivaria(c: Condicion | null | undefined, ctx: ContextoReglas): string {
  if (!c || c.siempre) return "";
  if (c.nunca) return "Nada: la norma está derogada.";
  const f: string[] = [];
  if (c.trabajadoresMin != null && ctx.trabajadores < c.trabajadoresMin) f.push(`llegar a ${c.trabajadoresMin} trabajadores (hoy ${ctx.trabajadores})`);
  if (c.trabajadoresMax != null && ctx.trabajadores > c.trabajadoresMax) f.push(`tener como máximo ${c.trabajadoresMax} trabajadores (hoy ${ctx.trabajadores})`);
  if (c.claseRiesgoIn && !c.claseRiesgoIn.includes(ctx.claseRiesgo)) f.push(`tener clase de riesgo ${c.claseRiesgoIn.map((x) => R[x]).join(", ")} (hoy ${R[ctx.claseRiesgo]})`);
  if (c.disparador && !ctx.disparadores[c.disparador]) f.push(`marcar “${etiqueta(c.disparador)}” en Datos (o que la matriz traiga ese peligro)`);
  if (c.disparadorAlguno && !c.disparadorAlguno.some((d) => ctx.disparadores[d])) f.push(`marcar alguno de: ${c.disparadorAlguno.map((d) => `“${etiqueta(d)}”`).join(", ")}`);
  if (c.vehiculosMin != null && ctx.vehiculos < c.vehiculosMin) f.push(`tener más de ${c.vehiculosMin - 1} vehículos (hoy ${ctx.vehiculos})`);
  if (c.conductoresMin != null && (ctx.conductores ?? 0) < c.conductoresMin) f.push(`registrar ${c.conductoresMin} o más conductores (hoy ${ctx.conductores ?? 0})`);
  if (c.contratistasMin != null && (ctx.contratistas ?? 0) < c.contratistasMin) f.push(`registrar ${c.contratistasMin} o más contratistas (hoy ${ctx.contratistas ?? 0})`);
  if (c.aprendicesMin != null && ctx.aprendices < c.aprendicesMin) f.push(`registrar ${c.aprendicesMin} o más aprendices (hoy ${ctx.aprendices})`);
  if (c.mujeresMin != null && (ctx.mujeres ?? 0) < c.mujeresMin) f.push(`tener más de ${c.mujeresMin - 1} trabajadoras registradas con sexo F (hoy ${ctx.mujeres ?? 0})`);
  if (c.sedesMin != null && (ctx.sedes ?? 1) < c.sedesMin) f.push(`registrar ${c.sedesMin} o más sedes (hoy ${ctx.sedes ?? 1})`);
  if (c.esUpa != null && ctx.esUpa !== c.esUpa) f.push(c.esUpa ? "marcarse como UPA" : "no ser UPA");
  if (c.esTransporte != null && !!ctx.esTransporte !== c.esTransporte) f.push(c.esTransporte ? "tener actividad de transporte (CIIU 49)" : "no ser empresa de transporte");
  if (c.nivelMin != null && (ctx.nivel ?? 7) < c.nivelMin) f.push(`pasar a nivel ${c.nivelMin} de estándares (hoy ${ctx.nivel ?? 7})`);
  if (c.todos) for (const k of c.todos) if (!cumple(k, ctx)) f.push(queActivaria(k, ctx));
  if (c.alguno) f.push(c.alguno.map((k) => queActivaria(k, ctx) || describirCondicion(k)).join(", o bien "));
  return f.filter(Boolean).join("; ");
}

export type CondicionExplicada = {
  codigo: string; nombre: string; tipo: "regla" | "norma"; aplica: boolean;
  condicion: string; valores: string; activaria: string; campos: CampoCondicion[]; normaRef: string;
};

export function explicarCondiciones(
  items: { codigo: string; nombre: string; tipo: "regla" | "norma"; condicion: Condicion | null | undefined; normaRef: string }[],
  ctx: ContextoReglas, base: string,
): CondicionExplicada[] {
  return items.map((it) => {
    const aplica = cumple(it.condicion, ctx);
    const campos = camposCondicion(it.condicion, ctx, base);
    return {
      codigo: it.codigo, nombre: it.nombre, tipo: it.tipo, aplica, condicion: describirCondicion(it.condicion),
      valores: campos.map((x) => `${x.campo}: ${x.valor}`).join(" · "), activaria: aplica ? "" : queActivaria(it.condicion, ctx), campos, normaRef: it.normaRef,
    };
  }).sort((a, b) => Number(b.aplica) - Number(a.aplica) || a.nombre.localeCompare(b.nombre));
}
