import { cumple, nivelPesv, type Condicion, type ContextoReglas, type Disparador } from "./condicion";
export { composicionCcl, nivelPesv } from "./condicion";
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
  /** Disparadores activos (cuestionario, trabajadores o matriz). */
  disparadores?: string[];
};

type ReglaIn = { codigo: string; nombre: string; condicion: unknown; efecto: unknown; normaRef: string; prioridad: number; activa: boolean };
type PlantillaIn = { codigo: string; nombre: string; nivelMin: number; condicion: unknown; normas: string[] };
type NormaIn = { codigo: string; nombre: string; condicionAplicabilidad: unknown; vigente: boolean };
type EstandarIn = { codigo: string; aplica7: boolean; aplica21: boolean };

export type EmpresaReglas = {
  nTrabajadoresPlanta: number; nEnMision: number; nAprendices: number; nContratistas: number;
  claseRiesgo: number; nVehiculos: number; nConductores?: number; ciiu?: string | null; esUpa: boolean; disparadores: unknown; responsableSst?: unknown;
  /** Número de sedes o centros de trabajo y de trabajadoras registradas (se calculan aparte; si faltan se asume 1 sede y 0 mujeres). */
  nSedes?: number; nMujeres?: number;
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
    if (!marcados[k]) { disparadores[k] = true; origenDisparadores[k] = /trabajador/i.test(peligro) ? `${peligro}, aunque en el cuestionario no se marcó` : `la matriz de peligros tiene “${peligro}”, aunque en el cuestionario no se marcó`; }
  }
  // Servicios de salud humana (CIIU división 86) y asistencia social con alojamiento (87): talento humano que puede atender
  // salud mental, con acciones de protección especial (Decreto 1072/2015 art. 2.2.4.13.5, Decreto 728/2025). Decisión C1.
  const ciiu = String(e.ciiu ?? "").replace(/\D/g, "");
  if (!marcados.serviciosSalud && /^8[67]/.test(ciiu)) {
    disparadores.serviciosSalud = true;
    origenDisparadores.serviciosSalud = `la actividad económica registrada (CIIU ${ciiu}) es de atención de la salud humana o de asistencia social (divisiones 86 y 87 del CIIU)`;
  }
  return {
    trabajadores: contarTrabajadores(e),
    claseRiesgo: e.claseRiesgo,
    vehiculos: e.nVehiculos ?? 0,
    conductores: e.nConductores ?? 0,
    contratistas: e.nContratistas ?? 0,
    aprendices: e.nAprendices ?? 0,
    mujeres: e.nMujeres ?? 0,
    sedes: e.nSedes ?? 1,
    // Misionalidad 1 del PESV: transporte terrestre automotor (CIIU división 49).
    esTransporte: /^49/.test(String(e.ciiu ?? "")),
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

  // Validación del perfil del responsable (Res. 0312 arts. 3-4, 9-10, 16-17; Res. 4927/2016 arts. 14 y 16)
  const resp = (e.responsableSst ?? {}) as { perfil?: string; licencia?: string; curso50h?: boolean; curso50hFecha?: string; curso20hFecha?: string; experienciaAnios?: number | string; rol?: string };
  const perfiles: Record<number, string[]> = {
    7: ["tecnico", "tecnologo", "profesional", "especialista"],
    21: ["tecnologo", "profesional", "especialista"],
    60: ["profesional", "especialista"],
  };
  const exp = Number(resp.experienciaAnios ?? 0) || 0;
  const disena = (resp.rol ?? "disenador") !== "ejecutor"; // quien diseña el sistema vs. quien solo lo administra y ejecuta (Res. 0312 art. 4)
  if (!resp.perfil) advertencias.push("No se ha registrado el responsable del SG-SST (Res. 0312 ítem 1.1.1).");
  else if (disena && !perfiles[nivel].includes(resp.perfil))
    advertencias.push(`El perfil "${resp.perfil}" no es suficiente para diseñar el SG-SST de nivel ${nivel} (Res. 0312 arts. 4, 10, 17).`);
  if (disena && resp.perfil === "tecnico" && nivel === 7 && exp < 1) advertencias.push("Un técnico en SST diseña el SG-SST de 7 estándares solo con mínimo 1 año de experiencia certificada (Res. 0312 art. 3).");
  if (disena && resp.perfil === "tecnologo" && nivel === 21 && exp < 2) advertencias.push("Un tecnólogo en SST diseña el SG-SST de 21 estándares solo con mínimo 2 años de experiencia certificada (Res. 0312 art. 9).");
  const microSinLicencia = !disena && nivel === 7; // Res. 4927/2016 art. 14: en ≤10 trabajadores riesgo I-III el ejecutor interno no requiere licencia
  if (resp.perfil && !resp.licencia && !microSinLicencia) advertencias.push(disena ? "Quien diseña el SG-SST debe tener licencia en SST vigente (Res. 0312 arts. 4, 10, 17; Res. 908/2025)." : "El responsable del SG-SST no tiene licencia en SST registrada (exigible desde 21 estándares, Res. 0312 art. 10).");
  if (resp.perfil && !resp.curso50h) advertencias.push("El responsable del SG-SST no tiene registrado el curso virtual de 50 horas (Decreto 1072 art. 2.2.4.6.35; Res. 4927/2016).");
  if (resp.curso50h && resp.curso50hFecha && /^\d{4}-\d{2}-\d{2}/.test(resp.curso50hFecha)) {
    const ultima = [resp.curso50hFecha, resp.curso20hFecha].filter((f) => f && /^\d{4}-\d{2}-\d{2}/.test(f)).sort().pop()!;
    if (Date.now() - new Date(ultima).getTime() > 3 * 365.25 * 864e5) advertencias.push(`El certificado de 50 horas (o su última actualización, ${ultima.slice(0, 10)}) tiene más de 3 años: debe tomar el curso de actualización de 20 horas (Res. 4927/2016 art. 16; Circular 047/2025).`);
  }
  if (ctx.conductores >= 2 || ctx.vehiculos >= 11) {
    const nv = nivelPesv(ctx);
    advertencias.push(`Aplica el Plan Estratégico de Seguridad Vial en nivel ${({ basico: "básico", estandar: "estándar", avanzado: "avanzado" } as Record<string, string>)[nv ?? ""] ?? nv} (${ctx.vehiculos} vehículos, ${ctx.conductores} conductores; Res. 40595/2022 Tabla 1). Reporte anual de autogestión al Ministerio del Trabajo antes del 31 de enero (Circular 034/2026).`);
  } else if (ctx.disparadores.conduccion) advertencias.push("Hay conducción en misión sin PESV obligatorio (menos de 11 vehículos y menos de 2 conductores): el peligro vial se gestiona en la matriz (Res. 0312 est. 4.1.2). Si contrata o administra 2 o más conductores, márquelos en Trabajadores (casilla “Conduce”) o registre el número en Datos.");
  for (const [k, v] of Object.entries(ctx.origenDisparadores ?? {})) advertencias.push(k === "serviciosSalud"
    ? `Se activó “${k}” porque ${v}: el personal que atiende salud mental requiere acciones de protección especial (Decreto 1072/2015 art. 2.2.4.13.5). Puede marcarlo en Datos → Peligros especiales para confirmarlo.`
    : `Se activó “${k}” porque ${v}. Confírmelo en el cuestionario (Datos → Peligros especiales) o ajuste la matriz.`);
  if (e.nContratistas > 0) advertencias.push(`Hay ${e.nContratistas} contratistas: deben incluirse en inducción, capacitación, matriz de peligros e indicadores (Decreto 1072 art. 2.2.4.6.28; Res. 0312 art. 30).`);

  return {
    trabajadores: ctx.trabajadores, nivel, nivelNormaRef, estandares,
    comites: [...comites], documentos, normas, capacitaciones: [...capacitaciones], conclusiones, advertencias,
    disparadores: Object.entries(ctx.disparadores).filter(([, v]) => v).map(([k]) => k),
  };
}

/** Composición paritaria del COPASST según Res. 2013/1986 art. 2 (Vigía: Decreto Ley 1295/1994 art. 35 par.) */
export function composicionCopasst(trabajadores: number) {
  if (trabajadores < 10) return { tipo: "VIGIA", porParte: 1, texto: "Vigía de SST (1 persona, elegida por los trabajadores o designada con su participación; el suplente es buena práctica, no exigencia legal)" };
  if (trabajadores <= 49) return { tipo: "COPASST", porParte: 1, texto: "1 representante del empleador y 1 de los trabajadores, con sus suplentes" };
  if (trabajadores <= 499) return { tipo: "COPASST", porParte: 2, texto: "2 representantes del empleador y 2 de los trabajadores, con sus suplentes" };
  if (trabajadores <= 999) return { tipo: "COPASST", porParte: 3, texto: "3 representantes del empleador y 3 de los trabajadores, con sus suplentes" };
  return { tipo: "COPASST", porParte: 4, texto: "4 representantes del empleador y 4 de los trabajadores, con sus suplentes" };
}
