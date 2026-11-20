// Generación del plan anual de trabajo a partir del nivel, comités, disparadores, matriz y plan de mejoramiento.
// Cada actividad cita su estándar (Res. 0312) y su fundamento normativo.
export type ActividadGen = { mes: number; nombre: string; estandarCodigo?: string; normaRef: string; responsable: string; recursos?: string; origen: string };

export const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

type Entrada = {
  nivel: number;
  comites: string[];
  disparadores: Record<string, boolean>;
  capacitaciones: { tema: string; mes: number; norma: string }[];
  prioritarios: { descripcion: string; medida: string }[];
  mejoras: { estandar: string; actividad: string; mes: number }[];
};

const RSST = "Responsable del SG-SST";
const RL = "Representante legal";

export function generarPlan(e: Entrada): ActividadGen[] {
  const a: ActividadGen[] = [];
  const add = (mes: number, nombre: string, estandarCodigo: string | undefined, normaRef: string, responsable = RSST, origen = "nivel", recursos = "Humanos") =>
    a.push({ mes, nombre, estandarCodigo, normaRef, responsable, origen, recursos });
  const n21 = e.nivel >= 21, n60 = e.nivel >= 60;

  // Planear
  add(1, "Revisar, firmar y divulgar la política de SST", "2.1.1", "Decreto 1072/2015 art. 2.2.4.6.6", RL);
  add(1, "Aprobar el presupuesto y la asignación de recursos del SG-SST", "1.1.3", "Decreto 1072/2015 art. 2.2.4.6.8 num. 4", RL, "nivel", "Financieros");
  add(1, "Verificar la afiliación y pago de seguridad social de todos los trabajadores", "1.1.4", "Res. 0312/2019 est. 1.1.4");
  add(1, "Socializar objetivos, metas y plan anual de trabajo", "2.2.1", "Decreto 1072/2015 art. 2.2.4.6.18");
  add(2, "Actualizar la matriz legal", "2.7.1", "Decreto 1072/2015 art. 2.2.4.6.8 par.");
  for (let m = 2; m <= 12; m += 3) add(m, "Verificar afiliación a seguridad social de trabajadores y contratistas", "1.1.4", "Decreto 1072/2015 art. 2.2.4.6.28");
  // Rendición de cuentas, revisión por la dirección y auditoría: obligaciones de todo empleador (decisiones de la consultora 1 y 4).
  add(3, "Rendición de cuentas de responsables del SG-SST", "2.6.1", "Decreto 1072/2015 art. 2.2.4.6.8 num. 3", RL);

  // Comités
  const comite = e.comites.includes("COPASST") ? "COPASST" : e.comites.includes("VIGIA") ? "Vigía de SST" : null;
  if (comite) for (let m = 1; m <= 12; m++) add(m, `Reunión mensual del ${comite}`, "1.1.6", "Res. 2013/1986 art. 7", comite, "comite");
  if (e.comites.includes("CCL")) for (let m = 1; m <= 12; m++) add(m, "Reunión mensual del Comité de Convivencia Laboral", "1.1.8", "Res. 3461/2025 art. 9", "Comité de Convivencia", "comite");
  if (comite) add(2, `Capacitación del ${comite} en sus funciones`, n60 ? "1.1.7" : "1.1.6", "Decreto Ley 1295/1994 art. 35 lit. c; Res. 0312/2019 arts. 9 y 16");

  // Capacitación
  add(1, "Inducción y reinducción en SST", "1.2.2", "Decreto 1072/2015 art. 2.2.4.6.11 par. 2");
  add(7, "Reinducción en SST a todo el personal", "1.2.2", "Decreto 1072/2015 art. 2.2.4.6.11");
  for (const c of e.capacitaciones) add(c.mes, `Capacitación: ${c.tema}`, "1.2.1", c.norma, RSST, "matriz", "Humanos, ARL");
  add(12, "Revisar el programa de capacitación con el COPASST/Vigía y la alta dirección", "1.2.1", "Decreto 1072/2015 art. 2.2.4.6.11 par. 1");

  // Salud
  add(2, "Programar evaluaciones médicas ocupacionales periódicas según el perfil de cargo y la periodicidad definida", "3.1.4", "Res. 1843/2025 arts. 15 y 16", RSST, "nivel", "Financieros (IPS)");
  if (n21) add(3, "Aplicar encuesta de perfil sociodemográfico y elaborar diagnóstico de condiciones de salud", "3.1.1", "Decreto 1072/2015 art. 2.2.4.6.16 num. 7");
  if (n21) add(4, "Recibir informe de condiciones de salud de la IPS y definir actividades de PyP", "3.1.2", "Res. 0312/2019 est. 3.1.2");
  if (n21) for (let m = 3; m <= 12; m += 3) add(m, "Seguimiento a restricciones y recomendaciones médico-laborales", "3.1.6", "Res. 0312/2019 est. 3.1.6");
  add(3, "Programa de pausas activas", "3.1.2", "Res. 1843/2025 art. 5 lit. h");
  add(5, "Campaña de promoción de la salud mental y prevención del consumo de SPA", "3.1.7", "Decreto 728/2025; Ley 2460/2025");
  add(10, "Semana de la salud y estilos de vida saludable (mes de la salud mental)", "3.1.7", "Decreto 728/2025; Res. 1843/2025 art. 25");
  add(6, "Aplicación o seguimiento de la batería de riesgo psicosocial (todo empleador)", "4.1.2", "Res. 2764/2022 arts. 2-3; Res. 2646/2008", "Psicólogo con licencia en SST", "nivel", "Financieros");
  if (n60) for (let m = 1; m <= 12; m++) add(m, "Registro y cálculo de indicadores de accidentalidad y ausentismo", "3.3.1", "Res. 0312/2019 art. 30");
  else for (let m = 3; m <= 12; m += 3) add(m, "Registro estadístico de accidentes, incidentes y ausentismo", "3.2.3", "Res. 0312/2019 art. 30");
  if (n60) add(12, "Cálculo de mortalidad, prevalencia e incidencia de enfermedad laboral", "3.3.3", "Res. 0312/2019 art. 30");

  // Peligros
  add(2, "Actualizar la matriz de identificación de peligros con participación de los trabajadores", "4.1.2", "Decreto 1072/2015 art. 2.2.4.6.15");
  for (const p of e.prioritarios.slice(0, 10)) add(3, `Intervenir riesgo prioritario: ${p.descripcion} — ${p.medida}`, "4.2.1", "Decreto 1072/2015 art. 2.2.4.6.24", RSST, "matriz", "Según medida");
  // Inspecciones, mantenimiento y EPP: para todo empleador; en las pequeñas con menor frecuencia (decisión 1).
  for (let m = n21 ? 3 : 6; m <= 12; m += n21 ? 3 : 6) add(m, "Inspección planeada de instalaciones, equipos y EPP con el COPASST/Vigía", "4.2.4", "Decreto 1072/2015 art. 2.2.4.6.12 num. 10; Res. 0312/2019 est. 4.2.4", RSST);
  add(4, "Ejecutar mantenimiento preventivo de instalaciones y equipos", "4.2.5", "Decreto 1072/2015 art. 2.2.4.6.24 par. 2; Res. 0312/2019 est. 4.2.5", RSST, "nivel", "Financieros");
  add(1, "Entrega y reposición de EPP según matriz", "4.2.6", "Decreto 1072/2015 art. 2.2.4.6.24 par. 1; Res. 2400/1979", RSST, "nivel", "Financieros");
  if (n60) add(4, "Mediciones ambientales de riesgos prioritarios", "4.1.4", "Res. 0312/2019 est. 4.1.4", RSST, "nivel", "Financieros");
  if (e.disparadores.alturas) add(3, "Revisión del programa de protección contra caídas, certificación y equipos", "4.2.1", "Res. 4272/2021");
  if (e.disparadores.quimicos) add(3, "Actualizar inventario de sustancias químicas, FDS y etiquetado SGA", "4.1.3", "Decreto 1496/2018");
  if (e.disparadores.confinados) add(3, "Revisión del programa de espacios confinados", "4.2.1", "Res. 0491/2020");

  // Amenazas
  add(4, "Revisar y actualizar el plan de prevención, preparación y respuesta ante emergencias", "5.1.1", "Decreto 1072/2015 art. 2.2.4.6.25");
  add(5, "Capacitación de la brigada de emergencias", "5.1.2", "Decreto 1072/2015 art. 2.2.4.6.25 num. 11", RSST, "nivel", "Humanos, ARL");
  for (let m = n21 ? 3 : 6; m <= 12; m += n21 ? 3 : 6) add(m, "Inspección de extintores y botiquín", "5.1.1", "Decreto 1072/2015 art. 2.2.4.6.25 num. 12", "Brigada");
  add(10, "Simulacro de evacuación (participación en Simulacro Nacional)", "5.1.1", "Decreto 1072/2015 art. 2.2.4.6.25 num. 10");

  // Verificar
  add(10, `Auditoría interna del SG-SST planificada con el ${comite ?? "COPASST o Vigía"}`, "6.1.2", "Decreto 1072/2015 art. 2.2.4.6.29");
  add(11, "Revisión del SG-SST por la alta dirección", "6.1.3", "Decreto 1072/2015 art. 2.2.4.6.31", RL);
  add(6, "Seguimiento semestral de indicadores del SG-SST", "6.1.1", "Decreto 1072/2015 art. 2.2.4.6.19");

  // Actuar y obligaciones con el Ministerio
  add(7, "Informe de avance del plan de mejoramiento y registro en la aplicación del Fondo de Riesgos Laborales (copia a la ARL)", "7.1.4", "Res. 0312/2019 art. 28; Circular 027/2026");
  add(12, "Autoevaluación de estándares mínimos y plan de mejoramiento", "7.1.4", "Res. 0312/2019 arts. 26-28");
  add(12, "Formulación del plan anual de trabajo del año siguiente", "2.4.1", "Res. 0312/2019 art. 26");
  for (const m of e.mejoras) add(m.mes, `Plan de mejoramiento: ${m.actividad}`, m.estandar, "Res. 0312/2019 art. 28", RSST, "mejoramiento");

  return a.sort((x, y) => x.mes - y.mes);
}

/** Año de planeación por defecto: en noviembre y diciembre se formula el plan del año siguiente (Res. 0312/2019 art. 26). */
export function anioPlanDefecto(hoy = new Date()) {
  return hoy.getMonth() >= 10 ? hoy.getFullYear() + 1 : hoy.getFullYear();
}

/**
 * Año del plan que se muestra en Resumen y tablero: entre el año actual y el siguiente, el que tiene
 * el plan (más actividades). Así una acción suelta llevada al año actual no esconde el plan generado.
 */
export function anioPlanVigente(actividades: { anio: number }[], hoy = new Date()) {
  const a = hoy.getFullYear();
  const n = (y: number) => actividades.filter((x) => x.anio === y).length;
  return n(a + 1) > n(a) ? a + 1 : a;
}
