import { sumarHabiles } from "@/lib/fechas";
// Catálogo único de plazos y tareas automáticas. Todo lo que el sistema programa solo (en el planeador, en los
// semáforos de accidentes o como fecha por defecto) sale de aquí, con lo que lo genera, desde cuándo cuenta y su norma.
// Los plazos legales no se editan; los de criterio de la empresa se ajustan en Normas y estándares → Plazos (Consultora.parametros).

export type Unidad = "dias_habiles" | "dias" | "meses" | "anios" | "fecha";
export type ModuloPlazo = "accidentes" | "acciones" | "salud" | "capacitacion" | "comites" | "inspecciones" | "matriz" | "evaluacion" | "auditoria" | "obligaciones" | "avisos";

export type ReglaPlazo = {
  clave: string;
  modulo: ModuloPlazo;
  /** Tarea o fecha que se crea. */
  tarea: string;
  /** Qué la genera. */
  cuando: string;
  cantidad: number;
  unidad: Unidad;
  /** Desde cuándo se cuenta (o la fecha fija). */
  desde: string;
  tipo: "legal" | "empresa";
  norma?: string;
  /** Solo los de criterio de la empresa. */
  editable?: { min: number; max: number };
  nota?: string;
};

export const MODULOS_PLAZO: Record<ModuloPlazo, { t: string; href?: string }> = {
  accidentes: { t: "Accidentes e incidentes", href: "accidentes" },
  acciones: { t: "Acciones correctivas y preventivas (FOR-06)" },
  salud: { t: "Trabajadores: exámenes y EPP", href: "trabajadores" },
  capacitacion: { t: "Capacitación y responsable del SG-SST", href: "trabajadores" },
  comites: { t: "Comités", href: "comites" },
  inspecciones: { t: "Inspecciones", href: "inspecciones" },
  matriz: { t: "Matriz de peligros", href: "matriz" },
  evaluacion: { t: "Autoevaluación de estándares mínimos", href: "evaluacion" },
  auditoria: { t: "Auditoría interna", href: "auditoria" },
  obligaciones: { t: "Obligaciones legales de fecha fija" },
  avisos: { t: "Avisos y anticipación" },
};

export const PLAZOS: ReglaPlazo[] = [
  // Accidentes
  { clave: "furat", modulo: "accidentes", tarea: "Reporte FURAT o FUREL a la ARL y la EPS", cuando: "Al registrar un accidente de trabajo o una enfermedad laboral (no para visitantes)", cantidad: 2, unidad: "dias_habiles", desde: "la fecha del accidente o del diagnóstico de la enfermedad", tipo: "legal", norma: "Decreto Ley 1295/1994 art. 62; Res. 156/2005 art. 3 (mod. Res. 2851/2015)" },
  { clave: "ministerio", modulo: "accidentes", tarea: "Aviso a la Dirección Territorial del Ministerio del Trabajo", cuando: "Al registrar un accidente grave o mortal, o una enfermedad laboral", cantidad: 2, unidad: "dias_habiles", desde: "la fecha del evento o del diagnóstico", tipo: "legal", norma: "Decreto 1072/2015 art. 2.2.4.1.7" },
  { clave: "investigacion", modulo: "accidentes", tarea: "Investigación del incidente, accidente o enfermedad laboral", cuando: "Al registrar un incidente, accidente o enfermedad laboral", cantidad: 15, unidad: "dias", desde: "la fecha del evento (en enfermedad laboral, desde el diagnóstico)", tipo: "legal", norma: "Res. 1401/2007 art. 4 num. 2; Res. 0312/2019 est. 3.2.2; Decreto 1072/2015 art. 2.2.4.1.6 si hubo muerte" },
  { clave: "remision", modulo: "accidentes", tarea: "Remisión del informe de investigación a la ARL", cuando: "Al registrar un accidente grave o mortal, o una muerte por enfermedad laboral", cantidad: 15, unidad: "dias", desde: "la fecha del evento", tipo: "legal", norma: "Res. 1401/2007 art. 14" },
  // Acciones
  { clave: "accion_limite", modulo: "acciones", tarea: "Fecha límite propuesta para cada acción correctiva o preventiva", cuando: "Al crear una acción desde una investigación, inspección o auditoría (se puede cambiar en la acción)", cantidad: 30, unidad: "dias", desde: "el día en que se crea la acción", tipo: "empresa", norma: "Decreto 1072/2015 art. 2.2.4.6.33 (no fija plazo)", editable: { min: 1, max: 365 } },
  // Salud
  { clave: "adaptacion", modulo: "salud", tarea: "Adaptar el puesto a las restricciones o recomendaciones médicas", cuando: "Al registrar un examen con concepto apto con restricciones", cantidad: 20, unidad: "dias_habiles", desde: "la fecha del examen", tipo: "legal", norma: "Res. 1843/2025 art. 5 lit. f" },
  { clave: "egreso", modulo: "salud", tarea: "Evaluación médica de egreso", cuando: "Al retirar a un trabajador", cantidad: 5, unidad: "dias_habiles", desde: "la fecha de retiro", tipo: "legal", norma: "Res. 1843/2025 art. 11" },
  { clave: "examen_periodico", modulo: "salud", tarea: "Próximo examen médico periódico", cuando: "Al registrar un examen", cantidad: 0, unidad: "meses", desde: "la fecha del examen, según la periodicidad definida en el cargo (Cargos y matriz)", tipo: "empresa", norma: "Res. 1843/2025 art. 15 (la define la empresa con justificación técnica; máximo 3 años en caso excepcional)", nota: "Se define por cargo, no aquí." },
  { clave: "epp_reposicion", modulo: "salud", tarea: "Reposición de EPP", cuando: "Al registrar una entrega de EPP con fecha de reposición", cantidad: 0, unidad: "meses", desde: "la fecha de entrega, según la vida útil del elemento", tipo: "empresa", norma: "Decreto 1072/2015 art. 2.2.4.6.24 par. 1", nota: "Se define en cada entrega según la vida útil del fabricante." },
  // Capacitación y responsable
  { clave: "alturas_reentrenamiento", modulo: "capacitacion", tarea: "Reentrenamiento de actualización en trabajo en alturas", cuando: "Al registrar una capacitación de alturas con asistentes (empresas con trabajo en alturas)", cantidad: 18, unidad: "meses", desde: "la última formación del trabajador", tipo: "legal", norma: "Res. 4272/2021 art. 27 num. 4 lit. b" },
  { clave: "confinados_actualizacion", modulo: "capacitacion", tarea: "Actualización de la formación en espacios confinados", cuando: "Al registrar una capacitación de espacios confinados (empresas con espacios confinados)", cantidad: 3, unidad: "anios", desde: "la última formación", tipo: "legal", norma: "Res. 0491/2020 art. 30 par. (adicionado por la Res. 2605/2020 art. 3)" },
  { clave: "curso_20h", modulo: "capacitacion", tarea: "Actualización del curso virtual de 20 horas del responsable del SG-SST", cuando: "Al registrar la fecha del curso de 50 horas o de la última actualización", cantidad: 3, unidad: "anios", desde: "el último certificado", tipo: "legal", norma: "Res. 4927/2016 art. 16" },
  // Comités
  { clave: "comite_periodo", modulo: "comites", tarea: "Fin del periodo del COPASST, Vigía o Comité de Convivencia: conformar el nuevo", cuando: "Al crear el comité", cantidad: 2, unidad: "anios", desde: "la fecha de conformación", tipo: "legal", norma: "Res. 2013/1986 art. 3; Res. 3461/2025 art. 5; Vigía por analogía" },
  { clave: "comite_reunion", modulo: "comites", tarea: "Reunión mensual del COPASST o del Comité de Convivencia", cuando: "Al generar el plan anual", cantidad: 1, unidad: "meses", desde: "cada mes del plan", tipo: "legal", norma: "Res. 2013/1986 art. 7; Res. 3461/2025 art. 9" },
  // Inspecciones
  { clave: "inspeccion_frecuencia", modulo: "inspecciones", tarea: "Próxima inspección de la misma lista", cuando: "Al guardar una inspección", cantidad: 0, unidad: "dias", desde: "la fecha de la inspección, según la frecuencia de la lista", tipo: "empresa", norma: "Res. 0312/2019 est. 4.2.4 (no fija frecuencia)", nota: "Se ajusta en cada lista: Biblioteca → Inspecciones." },
  // Matriz
  { clave: "matriz_anual", modulo: "matriz", tarea: "Actualización anual de la matriz de peligros", cuando: "Al cerrar una versión de la matriz", cantidad: 1, unidad: "anios", desde: "la fecha de la última versión (antes si hay accidente mortal o catastrófico, o cambios)", tipo: "legal", norma: "Decreto 1072/2015 art. 2.2.4.6.15 par. 1" },
  // Evaluación
  { clave: "autoevaluacion", modulo: "evaluacion", tarea: "Autoevaluación anual de estándares mínimos", cuando: "Cada año", cantidad: 12, unidad: "fecha", desde: "el mes de diciembre de cada año", tipo: "legal", norma: "Res. 0312/2019 art. 26" },
  { clave: "arl_critico", modulo: "evaluacion", tarea: "Reporte de avances del plan de mejoramiento a la ARL (valoración crítica)", cuando: "Al cerrar una autoevaluación con menos de 60 %", cantidad: 3, unidad: "meses", desde: "la fecha de la autoevaluación", tipo: "legal", norma: "Res. 0312/2019 art. 28" },
  { clave: "arl_moderado", modulo: "evaluacion", tarea: "Reporte de avances del plan de mejoramiento a la ARL (moderadamente aceptable)", cuando: "Al cerrar una autoevaluación entre 60 % y 85 %", cantidad: 6, unidad: "meses", desde: "la fecha de la autoevaluación", tipo: "legal", norma: "Res. 0312/2019 art. 28" },
  { clave: "avance_julio", modulo: "evaluacion", tarea: "Informe de avance del plan de mejoramiento y registro en la plataforma del Ministerio", cuando: "Cada año", cantidad: 7, unidad: "fecha", desde: "julio de cada año (registro hasta el 31 de julio)", tipo: "legal", norma: "Res. 0312/2019 art. 28; Circular 027/2026" },
  // Auditoría
  { clave: "auditoria_anual", modulo: "auditoria", tarea: "Auditoría interna anual del SG-SST", cuando: "Al cerrar una auditoría", cantidad: 1, unidad: "anios", desde: "el inicio de la auditoría anterior", tipo: "legal", norma: "Decreto 1072/2015 art. 2.2.4.6.29" },
  // Fechas fijas
  { clave: "pesv_reporte", modulo: "obligaciones", tarea: "Reporte anual de autogestión del PESV", cuando: "Empresas obligadas al PESV", cantidad: 1, unidad: "fecha", desde: "31 de enero de cada año", tipo: "legal", norma: "Circular 034/2026; Res. 40595/2022" },
  { clave: "sga_capacitacion", modulo: "obligaciones", tarea: "Capacitación anual en SGA", cuando: "Empresas con sustancias químicas", cantidad: 3, unidad: "fecha", desde: "31 de marzo de cada año", tipo: "legal", norma: "Res. 0773/2021 art. 21 num. 7" },
  { clave: "acoso_semestral", modulo: "obligaciones", tarea: "Publicación semestral de quejas de acoso sexual y remisión al SIVIGE", cuando: "Todas las empresas", cantidad: 6, unidad: "fecha", desde: "30 de junio y 31 de diciembre (últimos 10 días del semestre)", tipo: "legal", norma: "Ley 2365/2024 art. 11 num. 7" },
  { clave: "ccl_informes", modulo: "obligaciones", tarea: "Informes trimestrales y anual del Comité de Convivencia", cuando: "Empresas con Comité de Convivencia", cantidad: 3, unidad: "fecha", desde: "fin de cada trimestre", tipo: "legal", norma: "Res. 3461/2025 art. 6" },
  { clave: "spa_informe", modulo: "obligaciones", tarea: "Información anual del programa de salud mental y prevención de SPA", cuando: "Todas las empresas", cantidad: 12, unidad: "fecha", desde: "15 de diciembre de cada año", tipo: "legal", norma: "Decreto 728/2025 (Decreto 1072 art. 2.2.4.13.10)" },
  // Avisos (criterio de la empresa)
  { clave: "aviso_por_vencer", modulo: "avisos", tarea: "Marcar un plazo de accidentes como \"por vencer\"", cuando: "Siempre", cantidad: 2, unidad: "dias", desde: "antes del vencimiento", tipo: "empresa", editable: { min: 1, max: 15 } },
  { clave: "aviso_proximo", modulo: "avisos", tarea: "Marcar una tarea del planeador como \"próxima\"", cuando: "Siempre", cantidad: 14, unidad: "dias", desde: "antes de la fecha de la tarea", tipo: "empresa", editable: { min: 1, max: 60 } },
  { clave: "aviso_tablero", modulo: "avisos", tarea: "Tareas que muestra el tablero de inicio en \"Atención\"", cuando: "Siempre", cantidad: 14, unidad: "dias", desde: "desde hoy hacia adelante", tipo: "empresa", editable: { min: 1, max: 60 } },
];

export type ParametrosPlazos = Partial<Record<string, number>>;

export const reglaPlazo = (clave: string) => PLAZOS.find((p) => p.clave === clave);

/** Valor vigente: el de la consultora si el plazo es editable y está dentro de los límites; si no, el del catálogo. */
export function valorPlazo(clave: string, params?: ParametrosPlazos | null): number {
  const r = reglaPlazo(clave);
  if (!r) throw new Error(`Plazo desconocido: ${clave}`);
  const v = params?.[clave];
  return r.editable && typeof v === "number" && v >= r.editable.min && v <= r.editable.max ? v : r.cantidad;
}

const UNIDAD: Record<Unidad, [string, string]> = { dias_habiles: ["día hábil", "días hábiles"], dias: ["día calendario", "días calendario"], meses: ["mes", "meses"], anios: ["año", "años"], fecha: ["", ""] };

/** "2 días hábiles", "18 meses", "Fecha fija". */
export function textoPlazo(r: ReglaPlazo, params?: ParametrosPlazos | null) {
  if (r.unidad === "fecha") return "Fecha fija";
  const n = valorPlazo(r.clave, params);
  if (!n) return r.nota ? "Según configuración" : "—";
  return `${n} ${UNIDAD[r.unidad][n === 1 ? 0 : 1]}`;
}

/** Resumen de una línea para avisos en los formularios. */
export function resumenPlazo(clave: string, params?: ParametrosPlazos | null) {
  const r = reglaPlazo(clave)!;
  return { tarea: r.tarea, plazo: r.unidad === "fecha" ? r.desde : `${textoPlazo(r, params)} desde ${r.desde}`, norma: r.norma, tipo: r.tipo, nota: r.nota };
}

/** Fecha de vencimiento de un plazo contado desde `desde` (días hábiles sin festivos, días calendario, meses o años). */
export function fechaPlazo(clave: string, desde: Date, params?: ParametrosPlazos | null): Date | null {
  const r = reglaPlazo(clave);
  if (!r || r.unidad === "fecha") return null;
  const n = valorPlazo(clave, params);
  if (!n) return null;
  if (r.unidad === "dias_habiles") return sumarHabiles(desde, n);
  const f = new Date(desde);
  if (r.unidad === "dias") f.setUTCDate(f.getUTCDate() + n);
  if (r.unidad === "meses") f.setUTCMonth(f.getUTCMonth() + n);
  if (r.unidad === "anios") f.setUTCFullYear(f.getUTCFullYear() + n);
  return f;
}

/** "23 de noviembre de 2026". */
export const fechaLarga = (d: Date) => d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Línea de aviso para un plazo, con la fecha si se conoce el punto de partida. */
export function avisoPlazo(clave: string, desde?: Date | null, params?: ParametrosPlazos | null) {
  const r = reglaPlazo(clave)!;
  const f = desde ? fechaPlazo(clave, desde, params) : null;
  return { tarea: r.tarea, plazo: r.unidad === "fecha" ? r.desde : `${textoPlazo(r, params)} desde ${r.desde}`, fecha: f ? fechaLarga(f) : undefined, norma: r.norma, tipo: r.tipo };
}

/** Fecha de un input "AAAA-MM-DD" a mediodía UTC (null si está vacía). */
export const deInput = (f?: string | null) => (f ? new Date(f.slice(0, 10) + "T12:00:00Z") : null);

/** Aviso para una fecha que la persona ya fijó en el formulario (próximo examen, reposición de EPP, próxima inspección). */
export function avisoFecha(clave: string, tarea: string, fechaISO: string | null | undefined, plazo: string) {
  const r = reglaPlazo(clave)!;
  const d = deInput(fechaISO);
  return { tarea, plazo, fecha: d ? fechaLarga(d) : undefined, norma: r.norma, tipo: r.tipo };
}

/** Descripción del campo "Fecha límite" de una acción correctiva o preventiva. */
export const textoAccionPropuesta = (dias?: number | null) => `Fecha propuesta: ${dias || valorPlazo("accion_limite")} días (criterio de la empresa, ajustable en Normas y estándares → Plazos).`;
