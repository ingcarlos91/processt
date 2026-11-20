// Reglas de accidentes, incidentes y enfermedades laborales. Cada plazo cita su norma.

export const TIPOS_EVENTO: Record<string, { t: string; d: string; investiga: boolean; reporta: boolean }> = {
  AT: { t: "Accidente de trabajo", d: "Suceso repentino por causa o con ocasión del trabajo que produce lesión, perturbación funcional o psiquiátrica, invalidez o muerte (Ley 1562/2012 art. 3).", investiga: true, reporta: true },
  INCIDENTE: { t: "Incidente", d: "Suceso ocurrido en el curso del trabajo o en relación con este, que pudo ser un accidente, en el que hubo personas involucradas sin que sufrieran lesiones ni se presentaran daños a la propiedad o pérdidas en los procesos (Res. 1401/2007 art. 3). Si hubo cualquier lesión, aunque solo requiriera primeros auxilios, es accidente de trabajo y se reporta.", investiga: true, reporta: false },
  EL: { t: "Enfermedad laboral", d: "Enfermedad contraída como resultado de la exposición a factores de riesgo de la actividad o del medio de trabajo, (Ley 1562/2012 art. 4). Su origen lo califican en primera instancia la EPS, la ARL o Colpensiones, con apelación ante las juntas (Ley 100/1993 art. 41, mod. Decreto Ley 019/2012 art. 142).", investiga: true, reporta: true },
  AUSENTISMO: { t: "Ausentismo por enfermedad común", d: "Incapacidad de origen común. Solo se registra para el indicador de ausentismo (Res. 0312/2019 art. 30); no se investiga.", investiga: false, reporta: false },
};

export const GRAVEDAD: Record<string, { t: string; d: string }> = {
  leve: { t: "Leve", d: "No cumple los criterios de grave ni mortal." },
  grave: { t: "Grave", d: "Amputación de cualquier segmento corporal; fractura de huesos largos; trauma craneoencefálico; quemaduras de segundo y tercer grado; lesiones severas de mano, columna vertebral con compromiso de médula espinal; lesiones oculares que comprometan la agudeza o el campo visual, o lesiones que comprometan la capacidad auditiva (Res. 1401/2007 art. 3)." },
  mortal: { t: "Mortal", d: "El accidente causa la muerte del trabajador." },
};

export const VINCULACION: Record<string, string> = { planta: "Trabajador de planta", contratista: "Contratista", aprendiz: "Aprendiz o practicante", mision: "Trabajador en misión", visitante: "Visitante" };
export const esVisitante = (v?: string | null) => v === "visitante";
/** Por qué el evento de un visitante no genera FURAT ni avisos: el reporte es del empleador sobre sus trabajadores afiliados. */
export const NOTA_VISITANTE = "Un visitante no es trabajador afiliado por la empresa al Sistema General de Riesgos Laborales: no se diligencia FURAT ni FUREL, no se avisa a la Dirección Territorial ni se remite la investigación a la ARL, porque esos reportes son del empleador sobre sus trabajadores afiliados (Decreto Ley 1295/1994 art. 62; Res. 156/2005 art. 3). El evento se registra para la estadística interna, se investiga para prevenir que se repita y no cuenta en los indicadores mínimos (Res. 0312/2019 art. 30).";
/** Datos FURAT de la persona afectada (Res. 156/2005 anexo; Res. 1401/2007 art. 9). */
export const SEXO: Record<string, string> = { F: "Femenino", M: "Masculino", otro: "Otro" };
/** Hacia dónde apunta la medida de intervención (Res. 1401/2007 art. 12). */
export const DIRIGIDA_A: Record<string, string> = { fuente: "La fuente", medio: "El medio", trabajador: "El trabajador" };

export const JERARQUIA: Record<string, string> = { eliminacion: "Eliminación", sustitucion: "Sustitución", ingenieria: "Control de ingeniería", administrativo: "Control administrativo", epp: "Elemento de protección personal" };
export const ORIGEN_ACCION: Record<string, string> = { investigacion: "Investigación de evento", inspeccion: "Inspección", auditoria: "Auditoría", revision: "Revisión por la dirección", arl: "Recomendación de la ARL", autoridad: "Requerimiento de autoridad", trabajador: "Reporte de trabajador" };

const claveDia = (d: Date) => d.toISOString().slice(0, 10);
const festivosCache = new Map<number, Set<string>>();
/** Festivos de Colombia del año: fijos, trasladables al lunes siguiente y los que dependen de la Pascua. */
export function festivosColombia(anio: number): Set<string> {
  const ya = festivosCache.get(anio);
  if (ya) return ya;
  const f = (m: number, d: number) => new Date(Date.UTC(anio, m - 1, d));
  const lunes = (x: Date) => { const r = new Date(x); while (r.getUTCDay() !== 1) r.setUTCDate(r.getUTCDate() + 1); return r; };
  const mas = (x: Date, n: number) => { const r = new Date(x); r.setUTCDate(r.getUTCDate() + n); return r; };
  // Domingo de Pascua (algoritmo anónimo gregoriano).
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100, d = Math.floor(b / 4), e = b % 4, g = Math.floor((8 * b + 13) / 25);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 19 * l) / 433);
  const mes = Math.floor((h + l - 7 * m + 90) / 25), dia = (h + l - 7 * m + 33 * mes + 19) % 32;
  const pascua = f(mes, dia);
  const fechas = [
    f(1, 1), f(5, 1), f(7, 20), f(8, 7), f(12, 8), f(12, 25),
    ...[f(1, 6), f(3, 19), f(6, 29), f(8, 15), f(10, 12), f(11, 1), f(11, 11)].map(lunes),
    mas(pascua, -3), mas(pascua, -2), lunes(mas(pascua, 39)), lunes(mas(pascua, 60)), lunes(mas(pascua, 68)),
  ];
  const s = new Set(fechas.map(claveDia));
  festivosCache.set(anio, s);
  return s;
}

/** Suma días hábiles: de lunes a viernes, sin contar los festivos de Colombia. */
export function sumarHabiles(d: Date, n: number) {
  const r = new Date(d);
  let k = 0;
  while (k < n) {
    r.setUTCDate(r.getUTCDate() + 1);
    const w = r.getUTCDay();
    if (w !== 0 && w !== 6 && !festivosColombia(r.getUTCFullYear()).has(claveDia(r))) k++;
  }
  return r;
}
const sumarDias = (d: Date, n: number) => { const r = new Date(d); r.setUTCDate(r.getUTCDate() + n); return r; };

export type Plazo = { clave: string; t: string; vence: Date; hecho: Date | null; estado: "cumplido" | "tarde" | "vencido" | "por_vencer" | "pendiente"; normaRef: string; porque: string };

type EvPlazos = { tipo: string; fecha: Date; gravedad: string; vinculacion?: string | null; fechaReporte: Date | null; reportadoArl: boolean; invEstado: string; invCierre: Date | null; invRemitidaArl: Date | null; reporteMinisterio: Date | null };

function estado(vence: Date, hecho: Date | null, hoy: Date): Plazo["estado"] {
  if (hecho) return hecho.getTime() <= vence.getTime() + 864e5 - 1 ? "cumplido" : "tarde";
  const dias = (vence.getTime() - hoy.getTime()) / 864e5;
  return dias < 0 ? "vencido" : dias <= 2 ? "por_vencer" : "pendiente";
}

/** Plazos legales de un evento. */
export function plazos(e: EvPlazos, hoy = new Date()): Plazo[] {
  const t = TIPOS_EVENTO[e.tipo];
  const out: Plazo[] = [];
  // El visitante no es trabajador afiliado por la empresa: no hay FURAT ni aviso a la Dirección Territorial ni remisión a la ARL;
  // el evento se registra para la estadística interna y se investiga para prevenir que se repita (ver NOTA_VISITANTE).
  const afiliado = !esVisitante(e.vinculacion);
  if (t?.reporta && afiliado) {
    const vence = sumarHabiles(e.fecha, 2);
    out.push({ clave: "furat", t: e.tipo === "EL" ? "Reporte FUREL a la ARL y la EPS" : "Reporte FURAT a la ARL y la EPS", vence, hecho: e.fechaReporte, estado: e.fechaReporte ? estado(vence, e.fechaReporte, hoy) : e.reportadoArl ? "cumplido" : estado(vence, null, hoy), normaRef: "Decreto Ley 1295/1994 art. 62; Res. 156/2005 art. 3 (mod. Res. 2851/2015)", porque: "El empleador reporta el accidente de trabajo o la enfermedad laboral dentro de los dos días hábiles siguientes. Para enfermedad laboral el plazo cuenta desde el diagnóstico." + (e.tipo === "AT" && e.gravedad === "leve" ? " La Res. 156/2005 (modificada por la Res. 2851/2015) pide además informar a la Dirección Territorial todo accidente; el Decreto 1072/2015 art. 2.2.4.1.7 lo exige para graves y mortales. Infórmelo también si quiere ser prudente." : "") });
  }
  if (afiliado && ((e.tipo === "AT" && (e.gravedad === "grave" || e.gravedad === "mortal")) || e.tipo === "EL")) {
    const vence = sumarHabiles(e.fecha, 2);
    out.push({ clave: "ministerio", t: "Reporte a la Dirección Territorial del Ministerio del Trabajo", vence, hecho: e.reporteMinisterio, estado: estado(vence, e.reporteMinisterio, hoy), normaRef: "Decreto 1072/2015 art. 2.2.4.1.7 (Decreto 472/2015 art. 14); Res. 156/2005 art. 3 (mod. Res. 2851/2015)", porque: "Los accidentes graves y mortales y las enfermedades laborales diagnosticadas se reportan también a la Dirección Territorial del Ministerio del Trabajo dentro de los 2 días hábiles (Decreto 1072/2015 art. 2.2.4.1.7), como lo establece el procedimiento PRC-08." });
  }
  if (t?.investiga && e.invEstado !== "no_aplica") {
    const vence = sumarDias(e.fecha, 15);
    out.push({ clave: "investigacion", t: "Investigación del evento", vence, hecho: e.invEstado === "cerrada" ? e.invCierre : null, estado: estado(vence, e.invEstado === "cerrada" ? e.invCierre : null, hoy), normaRef: e.tipo === "EL" ? (e.gravedad === "mortal" ? "Decreto 1072/2015 art. 2.2.4.1.6; Res. 0312/2019 estándar 3.2.2" : "Res. 0312/2019 estándar 3.2.2; Decreto 1072/2015 art. 2.2.4.6.32") : "Res. 1401/2007 art. 4 num. 2; Decreto 1072/2015 art. 2.2.4.6.32" + (e.gravedad === "mortal" ? "; art. 2.2.4.1.6" : ""), porque: e.tipo === "EL" ? (e.gravedad === "mortal" ? "La muerte por enfermedad laboral se investiga dentro de los quince días calendario siguientes, con el COPASST o Vigía (Decreto 1072/2015 art. 2.2.4.1.6)." : "Toda enfermedad laboral diagnosticada se investiga para encontrar sus causas y ajustar los controles (Res. 0312/2019 estándar 3.2.2).") : "Todo incidente y accidente de trabajo se investiga dentro de los quince días siguientes a su ocurrencia, con el equipo investigador definido." + (e.gravedad === "mortal" ? " La muerte se investiga con el COPASST o Vigía (Decreto 1072/2015 art. 2.2.4.1.6)." : "") });
  }
  if (afiliado && ((e.tipo === "AT" && (e.gravedad === "grave" || e.gravedad === "mortal")) || (e.tipo === "EL" && e.gravedad === "mortal"))) {
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
  invLugar?: string | null; invFechas?: string | null;
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
  const sinCargo = eq.filter((x) => x.nombre?.trim() && !x.cargo?.trim());
  if (sinCargo.length) f.push(`el cargo de ${sinCargo.map((x) => x.nombre.trim()).join(", ")} (art. 13)`);
  if (!ev.invLugar?.trim()) f.push("el lugar y la dirección donde se hizo la investigación (art. 13)");
  if (!ev.invFechas?.trim()) f.push("las fechas y horas de las sesiones de investigación (art. 13)");
  if (!(a.actos?.length || a.condiciones?.length)) f.push("las causas inmediatas: actos o condiciones subestándar (art. 11)");
  if (!(a.personales?.length || a.trabajo?.length)) f.push("las causas básicas: factores personales o del trabajo (art. 11)");
  if (!ev.acciones.length) f.push("al menos una medida de intervención (art. 12)");
  else if (ev.acciones.some((x) => !x.responsable?.trim() || !x.fechaLimite)) f.push("responsable y fecha de ejecución en todas las medidas (art. 12)");
  return f;
}
