import { cumple, type Condicion, type ContextoReglas, type Disparador } from "./condicion";
import { explicarCondicion } from "./explicar";

export type Conclusion = { tipo: "nivel" | "comite" | "documento" | "capacitacion" | "mensaje"; valor: string; normaRef: string; regla: string; porque: string };

export type ResultadoReglas = {
  trabajadores: number;
  nivel: 7 | 21 | 60;
  nivelNormaRef: string;
  estandares: string[]; // códigos aplicables
  comites: string[];
  documentos: { codigo: string; nombre: string; normas: string[]; razon: string; porque: string }[];
  normas: { codigo: string; nombre: string; razon: string; porque: string }[];
  capacitaciones: string[];
  conclusiones: Conclusion[];
  advertencias: string[];
};

type ReglaIn = { codigo: string; nombre: string; condicion: unknown; efecto: unknown; normaRef: string; prioridad: number; activa: boolean };
type PlantillaIn = { codigo: string; nombre: string; nivelMin: number; condicion: unknown; normas: string[] };
type NormaIn = { codigo: string; nombre: string; condicionAplicabilidad: unknown; vigente: boolean };
type EstandarIn = { codigo: string; aplica7: boolean; aplica21: boolean };

export type EmpresaReglas = {
  nTrabajadoresPlanta: number; nEnMision: number; nAprendices: number; nContratistas: number;
  claseRiesgo: number; nVehiculos: number; esUpa: boolean; disparadores: unknown; responsableSst?: unknown;
  /** Disparadores detectados en la matriz aprobada: clave → descripción del peligro que lo activó. */
  disparadoresMatriz?: Partial<Record<Disparador, string>>;
};

/** Trabajadores para clasificar el nivel: dependientes + en misión (Res. 0312). Contratistas se reportan aparte. */
export function contarTrabajadores(e: EmpresaReglas) {
  return (e.nTrabajadoresPlanta ?? 0) + (e.nEnMision ?? 0);
}

export function contexto(e: EmpresaReglas, nivel?: number): ContextoReglas {
  const marcados = (e.disparadores ?? {}) as Partial<Record<Disparador, boolean>>;
  const disparadores: Partial<Record<Disparador, boolean>> = { ...marcados };
  const origenDisparadores: Partial<Record<Disparador, string>> = {};
  for (const [k, peligro] of Object.entries(e.disparadoresMatriz ?? {}) as [Disparador, string][]) {
    if (!marcados[k]) { disparadores[k] = true; origenDisparadores[k] = `la matriz de peligros tiene “${peligro}”, aunque en el cuestionario no se marcó`; }
  }
  return {
    trabajadores: contarTrabajadores(e),
    claseRiesgo: e.claseRiesgo,
    vehiculos: e.nVehiculos ?? 0,
    aprendices: e.nAprendices ?? 0,
    esUpa: !!e.esUpa,
    nivel,
    disparadores,
    origenDisparadores,
  };
}

export function evaluarEmpresa(
  e: EmpresaReglas,
  data: { reglas: ReglaIn[]; plantillas: PlantillaIn[]; normas: NormaIn[]; estandares: EstandarIn[] },
): ResultadoReglas {
  const conclusiones: Conclusion[] = [];
  const advertencias: string[] = [];
  let ctx = contexto(e);

  const activas = data.reglas.filter((r) => r.activa).sort((a, b) => b.prioridad - a.prioridad);
  let nivel: 7 | 21 | 60 = 7;
  let nivelNormaRef = "Res. 0312/2019 art. 3";
  let nivelDefinido = false;

  const comites = new Set<string>();
  const docsRegla = new Map<string, string>();
  const capacitaciones = new Set<string>();

  for (const r of activas) {
    if (!cumple(r.condicion as Condicion, ctx)) continue;
    const porque = explicarCondicion(r.condicion as Condicion, ctx);
    const ef = (r.efecto ?? {}) as { nivel?: 7 | 21 | 60; comites?: string[]; documentos?: string[]; capacitaciones?: string[]; mensaje?: string };
    if (ef.nivel && (!nivelDefinido || ef.nivel > nivel)) {
      nivel = ef.nivel; nivelNormaRef = r.normaRef; nivelDefinido = true;
      conclusiones.push({ tipo: "nivel", valor: `Nivel ${ef.nivel} estándares`, normaRef: r.normaRef, regla: r.codigo, porque });
    }
    ef.comites?.forEach((c) => { comites.add(c); conclusiones.push({ tipo: "comite", valor: c, normaRef: r.normaRef, regla: r.codigo, porque }); });
    ef.documentos?.forEach((d) => docsRegla.set(d, `${porque} Lo exige: ${r.normaRef}.`));
    ef.capacitaciones?.forEach((c) => capacitaciones.add(c));
    if (ef.mensaje) conclusiones.push({ tipo: "mensaje", valor: ef.mensaje, normaRef: r.normaRef, regla: r.codigo, porque });
  }

  ctx = contexto(e, nivel);

  const estandares = data.estandares
    .filter((s) => (nivel === 60 ? true : nivel === 21 ? s.aplica21 : s.aplica7))
    .map((s) => s.codigo);

  const documentos: ResultadoReglas["documentos"] = [];
  for (const p of data.plantillas) {
    const porNivel = nivel >= p.nivelMin;
    const porRegla = docsRegla.has(p.codigo);
    const cond = p.condicion as Condicion | null;
    // Si la plantilla tiene condición propia (disparador, tamaño) debe cumplirse siempre.
    const condOk = cumple(cond, ctx);
    if ((porNivel || porRegla) && condOk) {
      const porque = porRegla
        ? docsRegla.get(p.codigo)!
        : `${p.nivelMin === 7 ? "Es obligatorio para todas las empresas" : `Se exige a empresas de nivel ${p.nivelMin} o superior y esta empresa es nivel ${nivel}`}${cond && Object.keys(cond).length ? `; además, ${explicarCondicion(cond, ctx).replace(/^Porque /, "").replace(/\.$/, "")}` : ""}. Soporta ${p.normas.length ? `lo que piden ${p.normas.join(", ")}` : "los estándares mínimos"}.`;
      documentos.push({ codigo: p.codigo, nombre: p.nombre, normas: p.normas, razon: porRegla ? "regla" : "nivel", porque });
    }
  }

  const normas = data.normas
    .filter((n) => n.vigente && cumple(n.condicionAplicabilidad as Condicion, ctx))
    .map((n) => ({ codigo: n.codigo, nombre: n.nombre, razon: "condicion", porque: explicarCondicion(n.condicionAplicabilidad as Condicion, ctx) }));

  // Validación del perfil del responsable (Res. 0312 arts. 4, 10, 17)
  const resp = (e.responsableSst ?? {}) as { perfil?: string; licencia?: string; curso50h?: boolean };
  const perfiles: Record<number, string[]> = {
    7: ["tecnico", "tecnologo", "profesional", "especialista"],
    21: ["tecnologo", "profesional", "especialista"],
    60: ["profesional", "especialista"],
  };
  if (!resp.perfil) advertencias.push("No se ha registrado el responsable del SG-SST (Res. 0312 ítem 1.1.1).");
  else if (!perfiles[nivel].includes(resp.perfil))
    advertencias.push(`El perfil "${resp.perfil}" no es suficiente para diseñar el SG-SST de nivel ${nivel} (Res. 0312 arts. 4, 10, 17).`);
  if (resp.perfil && !resp.licencia) advertencias.push("El responsable del SG-SST no tiene licencia en SST registrada.");
  if (resp.perfil && !resp.curso50h) advertencias.push("El responsable del SG-SST no tiene registrado el curso virtual de 50 horas (Decreto 1072 art. 2.2.4.6.35).");
  for (const [k, v] of Object.entries(ctx.origenDisparadores ?? {})) advertencias.push(`Se activó “${k}” porque ${v}. Confírmelo en el cuestionario (Datos → Peligros especiales) o ajuste la matriz.`);
  if (e.nContratistas > 0) advertencias.push(`Hay ${e.nContratistas} contratistas: deben incluirse en inducción, capacitación, matriz de peligros e indicadores (Decreto 1072 art. 2.2.4.6.28; Res. 0312 art. 30).`);

  return {
    trabajadores: ctx.trabajadores, nivel, nivelNormaRef, estandares,
    comites: [...comites], documentos, normas, capacitaciones: [...capacitaciones], conclusiones, advertencias,
  };
}

/** Composición paritaria del COPASST según Res. 2013/1986 art. 2 */
export function composicionCopasst(trabajadores: number) {
  if (trabajadores < 10) return { tipo: "VIGIA", porParte: 1, texto: "Vigía de SST (1 principal y su suplente)" };
  if (trabajadores <= 49) return { tipo: "COPASST", porParte: 1, texto: "1 representante del empleador y 1 de los trabajadores, con sus suplentes" };
  if (trabajadores <= 499) return { tipo: "COPASST", porParte: 2, texto: "2 representantes del empleador y 2 de los trabajadores, con sus suplentes" };
  if (trabajadores <= 999) return { tipo: "COPASST", porParte: 3, texto: "3 representantes del empleador y 3 de los trabajadores, con sus suplentes" };
  return { tipo: "COPASST", porParte: 4, texto: "4 representantes del empleador y 4 de los trabajadores, con sus suplentes" };
}
