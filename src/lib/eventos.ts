// Reglas de accidentes, incidentes y enfermedades laborales. Cada plazo cita su norma.

export const TIPOS_EVENTO: Record<string, { t: string; d: string; investiga: boolean; reporta: boolean }> = {
  AT: { t: "Accidente de trabajo", d: "Suceso repentino por causa o con ocasión del trabajo que produce lesión, perturbación funcional o psiquiátrica, invalidez o muerte (Ley 1562/2012 art. 3).", investiga: true, reporta: true },
  INCIDENTE: { t: "Incidente", d: "Suceso ocurrido en el trabajo en el que no hubo lesionados, o las lesiones solo requirieron primeros auxilios, o hubo daños a la propiedad (Res. 1401/2007 art. 3).", investiga: true, reporta: false },
  EL: { t: "Enfermedad laboral", d: "Enfermedad contraída como resultado de la exposición a factores de riesgo de la actividad o del medio de trabajo, calificada por la EPS, ARL o junta (Ley 1562/2012 art. 4).", investiga: true, reporta: true },
  AUSENTISMO: { t: "Ausentismo por enfermedad común", d: "Incapacidad de origen común. Solo se registra para el indicador de ausentismo (Res. 0312/2019 art. 30); no se investiga.", investiga: false, reporta: false },
};

export const GRAVEDAD: Record<string, { t: string; d: string }> = {
  leve: { t: "Leve", d: "No cumple los criterios de grave ni mortal." },
  grave: { t: "Grave", d: "Amputación de cualquier segmento corporal; fractura de huesos largos; trauma craneoencefálico; quemaduras de segundo y tercer grado; lesiones severas de mano, columna vertebral con compromiso de médula espinal; lesiones oculares que comprometan la agudeza o el campo visual, o lesiones que comprometan la capacidad auditiva (Res. 1401/2007 art. 3)." },
  mortal: { t: "Mortal", d: "El accidente causa la muerte del trabajador." },
};

export const VINCULACION: Record<string, string> = { planta: "Trabajador de planta", contratista: "Contratista", aprendiz: "Aprendiz o practicante", mision: "Trabajador en misión", visitante: "Visitante" };

export const JERARQUIA: Record<string, string> = { eliminacion: "Eliminación", sustitucion: "Sustitución", ingenieria: "Control de ingeniería", administrativo: "Control administrativo", epp: "Elemento de protección personal" };
export const ORIGEN_ACCION: Record<string, string> = { investigacion: "Investigación de evento", inspeccion: "Inspección", auditoria: "Auditoría", revision: "Revisión por la dirección", arl: "Recomendación de la ARL", autoridad: "Requerimiento de autoridad", trabajador: "Reporte de trabajador" };

/** Suma días hábiles (lunes a viernes; no descuenta festivos). */
export function sumarHabiles(d: Date, n: number) {
  const r = new Date(d);
  let k = 0;
  while (k < n) { r.setUTCDate(r.getUTCDate() + 1); const w = r.getUTCDay(); if (w !== 0 && w !== 6) k++; }
  return r;
}
const sumarDias = (d: Date, n: number) => { const r = new Date(d); r.setUTCDate(r.getUTCDate() + n); return r; };

export type Plazo = { clave: string; t: string; vence: Date; hecho: Date | null; estado: "cumplido" | "tarde" | "vencido" | "por_vencer" | "pendiente"; normaRef: string; porque: string };

type EvPlazos = { tipo: string; fecha: Date; gravedad: string; fechaReporte: Date | null; reportadoArl: boolean; invEstado: string; invCierre: Date | null; invRemitidaArl: Date | null; reporteMinisterio: Date | null };

function estado(vence: Date, hecho: Date | null, hoy: Date): Plazo["estado"] {
  if (hecho) return hecho.getTime() <= vence.getTime() + 864e5 - 1 ? "cumplido" : "tarde";
  const dias = (vence.getTime() - hoy.getTime()) / 864e5;
  return dias < 0 ? "vencido" : dias <= 2 ? "por_vencer" : "pendiente";
}

/** Plazos legales de un evento. */
export function plazos(e: EvPlazos, hoy = new Date()): Plazo[] {
  const t = TIPOS_EVENTO[e.tipo];
  const out: Plazo[] = [];
  if (t?.reporta) {
    const vence = sumarHabiles(e.fecha, 2);
    out.push({ clave: "furat", t: e.tipo === "EL" ? "Reporte FUREL a la ARL y la EPS" : "Reporte FURAT a la ARL y la EPS", vence, hecho: e.fechaReporte ?? (e.reportadoArl ? e.fecha : null), estado: estado(vence, e.fechaReporte ?? (e.reportadoArl ? e.fecha : null), hoy), normaRef: "Decreto Ley 1295/1994 art. 62; Res. 156/2005 art. 3 (mod. Res. 2851/2015)", porque: "El empleador reporta el accidente de trabajo o la enfermedad laboral dentro de los dos días hábiles siguientes. Para enfermedad laboral el plazo cuenta desde el diagnóstico." });
  }
  if ((e.tipo === "AT" && (e.gravedad === "grave" || e.gravedad === "mortal")) || e.tipo === "EL") {
    const vence = sumarHabiles(e.fecha, 2);
    out.push({ clave: "ministerio", t: "Reporte a la Dirección Territorial del Ministerio del Trabajo", vence, hecho: e.reporteMinisterio, estado: estado(vence, e.reporteMinisterio, hoy), normaRef: "Decreto 1072/2015 art. 2.2.4.1.7 (Decreto 472/2015 art. 14); Res. 156/2005 art. 3 (mod. Res. 2851/2015)", porque: "Los accidentes graves y mortales y las enfermedades laborales diagnosticadas se reportan también a la Dirección Territorial del Ministerio del Trabajo dentro de los 2 días hábiles (Decreto 1072/2015 art. 2.2.4.1.7), como lo establece el procedimiento PRC-08." });
  }
  if (t?.investiga && e.invEstado !== "no_aplica") {
    const vence = sumarDias(e.fecha, 15);
    out.push({ clave: "investigacion", t: "Investigación del evento", vence, hecho: e.invEstado === "cerrada" ? e.invCierre : null, estado: estado(vence, e.invEstado === "cerrada" ? e.invCierre : null, hoy), normaRef: "Res. 1401/2007 art. 4 num. 2; Decreto 1072/2015 art. 2.2.4.6.32", porque: "Todo incidente y accidente de trabajo se investiga dentro de los quince días siguientes a su ocurrencia, con el equipo investigador definido." });
  }
  if (e.tipo === "AT" && (e.gravedad === "grave" || e.gravedad === "mortal")) {
    const vence = sumarDias(e.fecha, 15);
    out.push({ clave: "remision", t: "Remisión del informe de investigación a la ARL", vence, hecho: e.invRemitidaArl, estado: estado(vence, e.invRemitidaArl, hoy), normaRef: "Res. 1401/2007 art. 14", porque: "La investigación de un accidente grave o mortal se remite a la ARL dentro de los quince días siguientes al evento." });
  }
  return out;
}

export const COLOR_PLAZO: Record<Plazo["estado"], { t: string; v: "default" | "secondary" | "destructive" | "outline"; c: string }> = {
  cumplido: { t: "Cumplido", v: "secondary", c: "text-emerald-700" },
  tarde: { t: "Cumplido tarde", v: "outline", c: "text-amber-700" },
  vencido: { t: "Vencido", v: "destructive", c: "" },
  por_vencer: { t: "Por vencer", v: "outline", c: "text-amber-700 border-amber-300" },
  pendiente: { t: "Pendiente", v: "outline", c: "" },
};

export type Analisis = { porques?: string[]; actos?: string[]; condiciones?: string[]; personales?: string[]; trabajo?: string[]; conclusion?: string };
/** Integrante del equipo investigador: nombre, cargo e identificación (Res. 1401/2007 arts. 7 y 13). */
export type Integrante = { nombre: string; cargo?: string; documento?: string; rol: string };
export const ROLES_EQUIPO: Record<string, string> = {
  jefe: "Jefe inmediato o supervisor",
  copasst: "Representante del COPASST o Vigía",
  responsable: "Responsable del SG-SST",
  profesional: "Profesional con licencia en SST",
  diseno: "Personal de diseño de normas, procesos o mantenimiento",
  experto: "Experto interno o externo de apoyo",
  otro: "Otro",
};
/** Etiqueta de rol en minúscula inicial, conservando siglas (SST, COPASST). */
export const rolMin = (r: string) => { const t = ROLES_EQUIPO[r] ?? r; return t.charAt(0).toLowerCase() + t.slice(1); };
/** Roles mínimos del equipo según la gravedad (Res. 1401/2007 art. 7). */
export function rolesExigidos(tipo: string, gravedad: string): string[] {
  const base = ["jefe", "copasst", "responsable"];
  return tipo === "AT" && (gravedad === "grave" || gravedad === "mortal") ? [...base, "profesional", "diseno"] : base;
}

// Variables del FURAT (Res. 156/2005, anexo técnico) que el informe de investigación retoma (Res. 1401/2007 art. 9).
export const TIPO_ACCIDENTE: Record<string, string> = { propio_trabajo: "Propio del trabajo", transito: "De tránsito", violencia: "Violencia", deportivo_recreativo: "Deportivo, recreativo o cultural" };
export const TURNOS = ["Diurno", "Nocturno", "Mixto", "Rotativo", "Horas extra"];

type EvCierre = {
  tipo: string; gravedad: string; descripcion: string | null; equipo: unknown; analisis: unknown;
  acciones: { responsable: string | null; fechaLimite: Date | null }[];
};
/**
 * Qué le falta a la investigación para poder cerrarse, con el artículo de la Res. 1401/2007 que lo exige.
 * Se usa en el servidor (cerrarInvestigacion) y como lista de chequeo en la interfaz.
 */
export function faltasParaCerrar(ev: EvCierre): string[] {
  const eq = (Array.isArray(ev.equipo) ? ev.equipo : []) as Integrante[];
  const a = (ev.analisis ?? {}) as Analisis;
  const f: string[] = [];
  if (!ev.descripcion?.trim()) f.push("la descripción del evento: relato completo de qué, cuándo, dónde, cómo y por qué (art. 10)");
  const roles = new Set(eq.filter((x) => x.nombre?.trim()).map((x) => x.rol));
  const sinRol = rolesExigidos(ev.tipo, ev.gravedad).filter((r) => !roles.has(r)).map(rolMin);
  if (sinRol.length) f.push(`en el equipo investigador: ${sinRol.join(", ")} (art. 7${ev.tipo === "AT" && ev.gravedad !== "leve" ? ", accidente " + ev.gravedad : ""})`);
  const sinDoc = eq.filter((x) => x.nombre?.trim() && !x.documento?.trim());
  if (sinDoc.length) f.push(`el documento de identidad de ${sinDoc.map((x) => x.nombre.trim()).join(", ")} (art. 13: identificación de los investigadores)`);
  if (!(a.actos?.length || a.condiciones?.length)) f.push("las causas inmediatas: actos o condiciones subestándar (art. 11)");
  if (!(a.personales?.length || a.trabajo?.length)) f.push("las causas básicas: factores personales o del trabajo (art. 11)");
  if (!ev.acciones.length) f.push("al menos una medida de intervención (art. 12)");
  else if (ev.acciones.some((x) => !x.responsable?.trim() || !x.fechaLimite)) f.push("responsable y fecha de ejecución en todas las medidas (art. 12)");
  return f;
}
