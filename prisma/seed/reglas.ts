// Reglas de aplicabilidad. Cada conclusión cita su norma (normaRef) verificada contra el texto oficial
// (docs/09-analisis-normativo.md). Las condiciones usan los campos de src/lib/reglas/condicion.ts.
import type { Condicion } from "../../src/lib/reglas/condicion";

export type Efecto = {
  nivel?: 7 | 21 | 60;
  comites?: ("VIGIA" | "COPASST" | "CCL" | "BRIGADA")[];
  documentos?: string[];
  capacitaciones?: string[];
  mensaje?: string;
};
export type ReglaSeed = { codigo: string; nombre: string; condicion: Condicion; efecto: Efecto; normaRef: string; prioridad: number };

const PESV: Condicion = { alguno: [{ vehiculosMin: 11 }, { conductoresMin: 2 }] };

export const reglas: ReglaSeed[] = [
  // ── Nivel de estándares (Res. 0312/2019) ──
  { codigo: "NIVEL-7", nombre: "Empresa de 10 o menos trabajadores, riesgo I, II o III", prioridad: 100,
    condicion: { trabajadoresMax: 10, claseRiesgoIn: [1, 2, 3] }, efecto: { nivel: 7, mensaje: "Aplican 7 estándares mínimos." }, normaRef: "Res. 0312/2019 art. 3" },
  { codigo: "NIVEL-21", nombre: "Empresa de 11 a 50 trabajadores, riesgo I, II o III", prioridad: 100,
    condicion: { trabajadoresMin: 11, trabajadoresMax: 50, claseRiesgoIn: [1, 2, 3] }, efecto: { nivel: 21, mensaje: "Aplican 21 estándares mínimos." }, normaRef: "Res. 0312/2019 art. 9" },
  { codigo: "NIVEL-60-TAMANO", nombre: "Empresa de más de 50 trabajadores", prioridad: 100,
    condicion: { trabajadoresMin: 51 }, efecto: { nivel: 60, mensaje: "Aplican los 60 estándares mínimos." }, normaRef: "Res. 0312/2019 art. 16" },
  { codigo: "NIVEL-60-RIESGO", nombre: "Empresa de 50 o menos trabajadores con riesgo IV o V", prioridad: 100,
    condicion: { trabajadoresMax: 50, claseRiesgoIn: [4, 5] }, efecto: { nivel: 60, mensaje: "Por clase de riesgo IV o V aplican los 60 estándares (arts. 8 y 15)." }, normaRef: "Res. 0312/2019 arts. 8, 15, 16" },
  { codigo: "UPA-7", nombre: "Unidad de producción agropecuaria de 10 o menos trabajadores permanentes, riesgo I-III", prioridad: 90,
    condicion: { esUpa: true, trabajadoresMax: 10, claseRiesgoIn: [1, 2, 3] }, efecto: { mensaje: "UPA: aplican las 3 obligaciones del art. 7 (identificar peligros, prevenir AT/EL, proteger a quienes trabajan). Se gestiona como nivel 7." }, normaRef: "Res. 0312/2019 art. 7" },

  // ── Comités ──
  { codigo: "VIGIA", nombre: "Vigía de SST (menos de 10 trabajadores)", prioridad: 50,
    condicion: { trabajadoresMax: 9 }, efecto: { comites: ["VIGIA"], mensaje: "Designar Vigía de SST con las funciones del COPASST (periodo de 2 años por analogía con el Decreto Ley 1295/1994 art. 63)." }, normaRef: "Decreto Ley 1295/1994 art. 35 par.; Res. 2013/1986 arts. 1 y 3; Decreto 1072/2015 arts. 2.2.4.6.8 num. 9 y 2.2.4.6.12 num. 10" },
  { codigo: "COPASST", nombre: "COPASST (10 o más trabajadores)", prioridad: 50,
    condicion: { trabajadoresMin: 10 }, efecto: { comites: ["COPASST"], mensaje: "Conformar COPASST paritario (1 por parte hasta 49 trabajadores, 2 hasta 499), periodo de 2 años, reunión mensual y 4 horas semanales." }, normaRef: "Res. 2013/1986 arts. 1, 2, 7; Decreto Ley 1295/1994 art. 63" },
  { codigo: "CCL", nombre: "Comité de Convivencia Laboral", prioridad: 50,
    condicion: { siempre: true }, efecto: { comites: ["CCL"], mensaje: "Conformar el Comité de Convivencia Laboral (menos de 5 trabajadores: 1 y 1 sin suplentes; 5 a 20: 1 y 1 con suplentes; más de 20: 2 y 2 con suplentes), uno por cada centro de trabajo; reunión mensual; procedimiento de quejas de máximo 65 días." }, normaRef: "Res. 3461/2025 arts. 2, 3, 5, 6, 9; Ley 1010/2006 art. 9; Res. 2646/2008 art. 14" },
  { codigo: "BRIGADA", nombre: "Brigada de emergencias", prioridad: 50,
    condicion: { siempre: true }, efecto: { comites: ["BRIGADA"], mensaje: "Conformar, capacitar, entrenar y dotar la brigada de emergencias; simulacro al menos una vez al año." }, normaRef: "Decreto 1072/2015 art. 2.2.4.6.25 nums. 10 y 11; Res. 0312/2019 est. 5.1.2" },

  // ── Documentos y programas por disparador / tamaño ──
  { codigo: "REGLAMENTO-HSI", nombre: "Reglamento de Higiene y Seguridad Industrial", prioridad: 40,
    condicion: { trabajadoresMin: 10 }, efecto: { documentos: ["DOC-06"], mensaje: "Elaborar el Reglamento de Higiene y Seguridad Industrial (dentro de los 3 meses de iniciar labores) y fijarlo en dos lugares visibles; ya no requiere aprobación del Ministerio." }, normaRef: "CST arts. 349 (mod. Ley 962/2005 art. 55), 350 y 351" },
  { codigo: "ALTURAS", nombre: "Trabajo en alturas", prioridad: 40,
    condicion: { disparador: "alturas" }, efecto: { documentos: ["PRG-08"], capacitaciones: ["Trabajo seguro en alturas (trabajador autorizado, 32 horas)", "Coordinador de trabajo en alturas (80 horas)", "Jefe de área con trabajo en alturas (8 horas)"], mensaje: "Programa de prevención y protección contra caídas (riesgo de caída mayor a 2,0 m), coordinador, permisos de trabajo, hojas de vida de equipos, plan de rescate e inspección anual de EPP." }, normaRef: "Res. 4272/2021 arts. 3, 4-5, 15, 16, 26, 27, 61" },
  { codigo: "CONFINADOS", nombre: "Espacios confinados", prioridad: 40,
    condicion: { disparador: "confinados" }, efecto: { documentos: ["PRG-11"], capacitaciones: ["Trabajo seguro en espacios confinados (trabajador entrante, 16 horas)", "Supervisor de espacios confinados (20 horas)", "Vigía de espacios confinados (8 horas)"], mensaje: "Programa de gestión para trabajo en espacios confinados, inventario, roles, permisos, mediciones atmosféricas y rescate; actualización de la formación cada 3 años." }, normaRef: "Res. 0491/2020 arts. 7, 10, 14, 17, 21, 27, 29-30; Res. 2605/2020" },
  { codigo: "QUIMICOS", nombre: "Riesgo químico (SGA)", prioridad: 40,
    condicion: { disparador: "quimicos" }, efecto: { documentos: ["MTZ-03"], capacitaciones: ["Manejo seguro de sustancias químicas y SGA (anual)"], mensaje: "Inventario de productos químicos con clasificación de peligro, FDS en español accesibles, etiquetado SGA, matriz de compatibilidad y capacitación al menos una vez al año." }, normaRef: "Decreto 1496/2018 art. 2; Res. 0773/2021 arts. 16, 18, 21" },
  { codigo: "ACCIDENTES-MAYORES", nombre: "Instalación clasificada (accidentes mayores)", prioridad: 40,
    condicion: { disparador: "instalacionClasificada" }, efecto: { mensaje: "Implementar el sistema de gestión para la prevención de accidentes mayores articulado al SG-SST, el informe de seguridad y el registro de incidentes con reporte de accidentes mayores en 24 horas." }, normaRef: "Decreto 1347/2021 (Decreto 1072 cap. 12); Res. 5492/2024; Res. 1890/2025; Res. 3687/2025" },
  { codigo: "ELECTRICO", nombre: "Riesgo eléctrico", prioridad: 40,
    condicion: { disparador: "electrico" }, efecto: { capacitaciones: ["Riesgo eléctrico: cinco reglas de oro y permisos de trabajo"], mensaje: "Procedimientos y permisos para trabajos eléctricos, cinco reglas de oro, EPP dieléctricos, personal competente con matrícula, instalaciones con dictamen RETIE y mantenimiento." }, normaRef: "Res. 5018/2019 art. 2 y anexo; Res. 40117/2024 (RETIE); Res. 2400/1979 arts. 121-152" },
  { codigo: "PESV", nombre: "Plan Estratégico de Seguridad Vial", prioridad: 40,
    condicion: PESV, efecto: { documentos: ["PRG-09"], capacitaciones: ["Seguridad vial y manejo defensivo"], mensaje: "Adoptar el PESV (flota de más de 10 vehículos o 2 o más conductores) en el nivel básico, estándar o avanzado que corresponda, articulado al SG-SST, con auditoría anual y reporte anual de autogestión al Ministerio del Trabajo antes del 31 de enero." }, normaRef: "Ley 1503/2011 art. 12 (mod. Decreto Ley 2106/2019 art. 110); Decreto 1079/2015 art. 2.3.2.3.2; Res. 40595/2022 Tabla 1; Res. 0312/2019 art. 32; Circular 034/2026" },
  { codigo: "RUIDO", nombre: "Ruido", prioridad: 40,
    condicion: { disparador: "ruido" }, efecto: { capacitaciones: ["Conservación auditiva y uso de protectores"], mensaje: "Mediciones de ruido (sonometría o dosimetría), controles en la fuente y el medio, y programa de conservación auditiva con audiometrías de ingreso, control a los 90 días, periódicas (máximo cada 2 años) y de retiro; límite 85 dB(A) para 8 horas." }, normaRef: "Res. 8321/1983 arts. 41-55; Res. 2844/2007 (GATI-HNIR); Res. 2400/1979 arts. 88-96" },
  { codigo: "ALIMENTOS", nombre: "Manipulación de alimentos", prioridad: 40,
    condicion: { disparador: "manipulacionAlimentos" }, efecto: { capacitaciones: ["Buenas prácticas de manufactura y manipulación higiénica de alimentos (mínimo 10 horas al año)"], mensaje: "Certificado médico anual de aptitud para manipular alimentos (exámenes de laboratorio a criterio del médico), capacitación continua de mínimo 10 horas anuales y dotación." }, normaRef: "Res. 2674/2013 arts. 11, 12, 13, 14" },
  { codigo: "RESIDUOS-SALUD", nombre: "Residuos de atención en salud y actividades afines", prioridad: 40,
    condicion: { disparador: "residuosSalud" }, efecto: { capacitaciones: ["Bioseguridad y gestión integral de residuos de atención en salud"], mensaje: "Plan de gestión integral de residuos (PGIRASA) según el manual de 2024, segregación, bioseguridad, EPP y capacitación del personal." }, normaRef: "Decreto 780/2016 arts. 2.8.10.2 y 2.8.10.6; Res. 591/2024" },
  { codigo: "SERVICIOS-SALUD", nombre: "Personal de servicios de salud y asistencia social (salud mental)", prioridad: 40,
    condicion: { disparador: "serviciosSalud" }, efecto: { mensaje: "El talento humano que atiende salud mental (urgencias, consulta, hospitalización, atención de violencias o atención psicosocial en emergencias) requiere acciones de protección especial con asesoría de la ARL dentro del programa de salud mental (PRG-03)." }, normaRef: "Decreto 1072/2015 art. 2.2.4.13.5 (Decreto 728/2025)" },
  { codigo: "PGRDEPP", nombre: "Plan de Gestión del Riesgo de Desastres (entidades obligadas)", prioridad: 40,
    condicion: { disparadorAlguno: ["actividadIndustrial", "almacenamientoCarga", "aglomeracionesPublico", "serviciosPublicos", "obraCivilMayor"] }, efecto: { mensaje: "Además del plan de emergencias del SG-SST, formular el Plan de Gestión del Riesgo de Desastres (conocimiento y reducción del riesgo, plan de emergencia y contingencia, plan de inversiones), revisarlo cada año y entregarlo al consejo territorial de gestión del riesgo." }, normaRef: "Decreto 2157/2017 (Decreto 1081/2015 art. 2.3.1.5.1.2.2); Ley 1523/2012 art. 42" },
  { codigo: "PSICOSOCIAL-BATERIA", nombre: "Evaluación de riesgo psicosocial con batería", prioridad: 40,
    condicion: { siempre: true }, efecto: { documentos: ["PRG-04"], mensaje: "Aplicar la batería de riesgo psicosocial a todos los trabajadores (todo empleador, sin importar el tamaño): cada año si el riesgo es alto o muy alto, cada 2 años si es medio o bajo; por psicólogo con posgrado en salud ocupacional y licencia; custodia en la IPS o el psicólogo; intervención con los protocolos adoptados." }, normaRef: "Res. 2646/2008 arts. 2, 3 lit. p, 12, 16; Res. 2764/2022 arts. 2, 3, 5, 7; Res. 0312/2019 art. 23" },
  { codigo: "SALUD-MENTAL", nombre: "Programa de salud mental y prevención de SPA", prioridad: 40,
    condicion: { siempre: true }, efecto: { documentos: ["PRG-03", "POL-02"], capacitaciones: ["Promoción de la salud mental y prevención del consumo de SPA"], mensaje: "Programa de prevención del consumo de SPA en siete pasos con apoyo de la ARL, plan de intervención en salud mental basado en la batería, monitoreo permanente e información anual desagregada; campañas de prevención de farmacodependencia, alcoholismo y tabaquismo; espacios libres de humo." }, normaRef: "Decreto 728/2025 (Decreto 1072 arts. 2.2.4.13.3, .4, .6, .10); Ley 1616/2013 art. 9 (Ley 2460/2025 art. 9); Res. 1843/2025 art. 25; Ley 1335/2009 arts. 19-20" },
  { codigo: "ACOSO-VIOLENCIA", nombre: "Política y protocolo frente al acoso, la violencia y la discriminación", prioridad: 40,
    condicion: { siempre: true }, efecto: { documentos: ["PRC-06", "POL-03"], capacitaciones: ["Prevención del acoso laboral, el acoso sexual y la violencia en el trabajo (anual)"], mensaje: "Política participativa y protocolo de prevención, atención y sanción del acoso laboral, el acoso sexual, la violencia basada en género y la discriminación, con ruta, canales confidenciales, medidas de protección en máximo 5 días hábiles, registro estadístico, publicación semestral anonimizada y formación anual." }, normaRef: "Decreto 1040/2026 (Decreto 1072 arts. 2.2.1.8.1.1 ss.); Ley 2365/2024 arts. 11, 13, 14; Ley 2466/2025 art. 18; Ley 1010/2006 art. 9" },
  { codigo: "DESCONEXION", nombre: "Política de desconexión laboral", prioridad: 40,
    condicion: { siempre: true }, efecto: { documentos: ["POL-04"], mensaje: "Adoptar la política de desconexión laboral (cómo se garantiza, lineamientos de uso de tecnologías y procedimiento de quejas) e incorporarla al reglamento interno y a la intervención psicosocial." }, normaRef: "Ley 2191/2022 art. 5" },
  { codigo: "TRABAJO-NOCTURNO", nombre: "Trabajo nocturno o por turnos", prioridad: 40,
    condicion: { disparador: "trabajoNocturno" }, efecto: { capacitaciones: ["Higiene del sueño y manejo de turnos"], mensaje: "Incluir la jornada nocturna (7:00 p. m. a 6:00 a. m.) o por turnos como factor de riesgo psicosocial en la matriz y en la evaluación con la batería; ajustar turnos a la jornada de 42 horas." }, normaRef: "CST art. 160 (Ley 2466/2025 art. 10); Ley 2101/2021 art. 3; Res. 2646/2008 art. 6; Res. 2764/2022" },
  { codigo: "TELETRABAJO", nombre: "Teletrabajo o trabajo remoto", prioridad: 40,
    condicion: { disparador: "teletrabajo" }, efecto: { capacitaciones: ["Prevención de riesgos en teletrabajo: ergonomía, salud mental y seguridad digital"], mensaje: "Política de teletrabajo, formulario de la ARL por cada teletrabajador, inclusión del puesto remoto en la matriz de peligros, capacitación previa, entrega de equipos, desconexión y registro de teletrabajadores ante el Ministerio del Trabajo." }, normaRef: "Ley 1221/2008 art. 6 (Ley 2466/2025 arts. 52-54); Decreto 1072/2015 arts. 2.2.1.5.8, 2.2.1.5.18, 2.2.1.5.23 (Decreto 1227/2022); Ley 2121/2021 arts. 4, 8, 20" },
  { codigo: "TRABAJO-EN-CASA", nombre: "Trabajo en casa (temporal)", prioridad: 40,
    condicion: { disparador: "trabajoEnCasa" }, efecto: { mensaje: "Comunicar la habilitación temporal del trabajo en casa (hasta 3 meses prorrogables), informar a la ARL la dirección donde se labora y mantener la cobertura de riesgos laborales y el derecho a la desconexión." }, normaRef: "Ley 2088/2021 arts. 6, 7, 9, 11" },
  { codigo: "CONTRATISTAS", nombre: "Contratistas por prestación de servicios", prioridad: 30,
    condicion: { contratistasMin: 1 }, efecto: { mensaje: "Afiliar a la ARL a los contratistas con contrato de más de un mes (el contratante paga la cotización en clases IV y V), verificar afiliación y pagos, darles inducción, incluirlos en el SG-SST y suministrar EPP cuando aplique." }, normaRef: "Decreto 1072/2015 arts. 2.2.4.2.2.5, 2.2.4.2.2.13, 2.2.4.6.28; Ley 1562/2012 art. 2" },
  { codigo: "ALTO-RIESGO-PENSION", nombre: "Actividades de alto riesgo para pensión especial", prioridad: 30,
    condicion: { disparador: "altoRiesgoPension" }, efecto: { mensaje: "Definir por escrito los cargos de alto riesgo (funciones, tareas, jornada y lugar), identificar a los trabajadores expuestos y verificar la cotización especial de pensión (+10 puntos a cargo del empleador)." }, normaRef: "Decreto 2090/2003 arts. 2 y 5; Res. 0312/2019 art. 31" },
  { codigo: "APRENDICES", nombre: "Aprendices y practicantes", prioridad: 30,
    condicion: { aprendicesMin: 1 }, efecto: { mensaje: "Afiliar a la ARL a los aprendices desde la fase lectiva (cotización al 100 % por la empresa según su clase de riesgo) y a los practicantes; darles inducción y EPP e incluirlos en capacitación; pueden integrar el COPASST y el Comité de Convivencia." }, normaRef: "Ley 2466/2025 art. 21; Decreto 223/2026 (Decreto 1072 arts. 2.2.6.3.3.6-7, 2.2.6.3.1.10, 2.2.6.3.3.24); Decreto 1072/2015 art. 2.2.4.6.11" },
  { codigo: "CUOTA-APRENDICES", nombre: "Cuota de aprendices SENA", prioridad: 20,
    condicion: { trabajadoresMin: 15 }, efecto: { mensaje: "Verificar la cuota de aprendices o su monetización ante el SENA (empleadores privados con 15 o más trabajadores)." }, normaRef: "Decreto 223/2026 (Decreto 1072 arts. 2.2.6.3.3.37 y 2.2.6.3.3.47)" },
  { codigo: "SALA-LACTANCIA", nombre: "Sala amiga de la familia lactante", prioridad: 20,
    condicion: { mujeresMin: 51 }, efecto: { mensaje: "Adecuar una sala de lactancia en la sede principal (y en las sedes con más de 50 trabajadoras) con las especificaciones de la Res. 610/2026 e inscribirla ante la secretaría de salud." }, normaRef: "Ley 1823/2017 arts. 2-3; Res. 610/2026 arts. 6-7" },
];
