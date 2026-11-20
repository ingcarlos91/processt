// Indicadores mínimos — Resolución 0312 de 2019, art. 30; Decreto 1072 arts. 2.2.4.6.19-22.
export type Indicador = { nombre: string; tipo: string; definicion: string; formula: string; meta: string; periodicidad: string; fuente: string; responsable: string; interpretacion: string; quienConoce: string };

const R = "Responsable del SG-SST";
const Q = "Alta dirección, COPASST/Vigía, trabajadores";

export const INDICADORES: Indicador[] = [
  { nombre: "Política de SST comunicada", tipo: "Estructura", definicion: "Existencia de la política firmada, fechada y divulgada", formula: "Política firmada y divulgada (Sí = 100 %, No = 0 %)", meta: "100 %", periodicidad: "Anual", fuente: "Política de SST y registros de divulgación", responsable: R, interpretacion: "Indica si la política existe y fue comunicada", quienConoce: Q },
  { nombre: "Recursos asignados al SG-SST", tipo: "Estructura", definicion: "Presupuesto aprobado para el SG-SST", formula: "Presupuesto ejecutado / presupuesto asignado × 100", meta: "≥ 90 %", periodicidad: "Anual", fuente: "Presupuesto SST", responsable: R, interpretacion: "Grado de ejecución de los recursos asignados", quienConoce: "Alta dirección" },
  { nombre: "Cumplimiento del plan anual de trabajo", tipo: "Proceso", definicion: "Porcentaje de actividades ejecutadas del plan anual", formula: "Actividades ejecutadas / actividades programadas × 100", meta: "≥ 90 %", periodicidad: "Trimestral", fuente: "Plan anual de trabajo", responsable: R, interpretacion: "Por cada 100 actividades programadas se ejecutaron X", quienConoce: Q },
  { nombre: "Cobertura de capacitación", tipo: "Proceso", definicion: "Trabajadores capacitados frente a los programados", formula: "Trabajadores capacitados / trabajadores programados × 100", meta: "≥ 90 %", periodicidad: "Trimestral", fuente: "Registros de asistencia", responsable: R, interpretacion: "Porcentaje de trabajadores que recibieron la capacitación programada", quienConoce: Q },
  { nombre: "Intervención de riesgos prioritarios", tipo: "Proceso", definicion: "Riesgos de nivel I y II con medidas implementadas", formula: "Riesgos prioritarios intervenidos / riesgos prioritarios identificados × 100", meta: "100 %", periodicidad: "Semestral", fuente: "Matriz de peligros", responsable: R, interpretacion: "Grado de control de los riesgos prioritarios", quienConoce: Q },
  { nombre: "Cumplimiento de estándares mínimos", tipo: "Resultado", definicion: "Puntaje de la autoevaluación de estándares mínimos", formula: "Suma de puntajes obtenidos (Res. 0312 art. 27)", meta: "> 85 %", periodicidad: "Anual", fuente: "Autoevaluación de estándares mínimos", responsable: R, interpretacion: "< 60 % crítico; 60-85 % moderadamente aceptable; > 85 % aceptable", quienConoce: Q },
  { nombre: "Frecuencia de accidentalidad", tipo: "Resultado", definicion: "Número de veces que ocurre un accidente de trabajo en el mes", formula: "(N.º de accidentes de trabajo en el mes / N.º de trabajadores en el mes) × 100", meta: "Disminuir frente al periodo anterior", periodicidad: "Mensual", fuente: "Registro de accidentes y nómina", responsable: R, interpretacion: "Por cada 100 trabajadores que laboraron en el mes, se presentaron X accidentes de trabajo", quienConoce: Q },
  { nombre: "Severidad de accidentalidad", tipo: "Resultado", definicion: "Días perdidos por accidentes de trabajo en el mes", formula: "(N.º de días de incapacidad por AT en el mes + N.º de días cargados en el mes / N.º de trabajadores en el mes) × 100", meta: "Disminuir frente al periodo anterior", periodicidad: "Mensual", fuente: "Registro de accidentes e incapacidades", responsable: R, interpretacion: "Por cada 100 trabajadores que laboraron en el mes, se perdieron X días por accidente de trabajo", quienConoce: Q },
  { nombre: "Proporción de accidentes de trabajo mortales", tipo: "Resultado", definicion: "Accidentes mortales frente al total de accidentes del año", formula: "(N.º de accidentes de trabajo mortales en el año / total de accidentes de trabajo en el año) × 100", meta: "0 %", periodicidad: "Anual", fuente: "Registro de accidentes", responsable: R, interpretacion: "En el año, el X % del total de accidentes de trabajo fueron mortales", quienConoce: Q },
  { nombre: "Prevalencia de la enfermedad laboral", tipo: "Resultado", definicion: "Casos nuevos y antiguos de enfermedad laboral en el periodo", formula: "(N.º de casos nuevos y antiguos de enfermedad laboral en el periodo / promedio de trabajadores en el periodo) × 100.000", meta: "Disminuir o mantener", periodicidad: "Anual", fuente: "Registro de enfermedades laborales", responsable: R, interpretacion: "Por cada 100.000 trabajadores existen X casos de enfermedad laboral", quienConoce: Q },
  { nombre: "Incidencia de la enfermedad laboral", tipo: "Resultado", definicion: "Casos nuevos de enfermedad laboral en el periodo", formula: "(N.º de casos nuevos de enfermedad laboral en el periodo / promedio de trabajadores en el periodo) × 100.000", meta: "0", periodicidad: "Anual", fuente: "Registro de enfermedades laborales", responsable: R, interpretacion: "Por cada 100.000 trabajadores existen X casos nuevos de enfermedad laboral", quienConoce: Q },
  { nombre: "Ausentismo por causa médica", tipo: "Resultado", definicion: "Días de ausencia por incapacidad laboral o común", formula: "(N.º de días de ausencia por incapacidad laboral o común en el mes / N.º de días de trabajo programados en el mes) × 100", meta: "Disminuir frente al periodo anterior", periodicidad: "Mensual", fuente: "Registro de incapacidades", responsable: R, interpretacion: "En el mes se perdió X % de días programados por incapacidad médica", quienConoce: Q },
];

type Ev = { tipo: string; fecha: Date; diasIncapacidad: number; diasCargados: number; mortal: boolean; casoNuevo: boolean };
type TM = { anio: number; mes: number; nTrabajadores: number; diasProgramados: number | null };

/** Mes ya transcurrido (o en curso): solo esos usan el número de trabajadores de la empresa cuando el mes no se registró. */
const transcurrido = (anio: number, mes: number, hoy = new Date()) => anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes <= hoy.getMonth() + 1);

/** `base`: trabajadores de la empresa; se usa en los meses transcurridos sin registro (estimado, editable en Indicadores). */
export function calcularMensuales(eventos: Ev[], tm: TM[], anio: number, base = 0) {
  return Array.from({ length: 12 }, (_, i) => {
    const mes = i + 1;
    const t = tm.find((x) => x.anio === anio && x.mes === mes);
    const evMes = eventos.filter((e) => e.fecha.getFullYear() === anio && e.fecha.getMonth() + 1 === mes);
    const at = evMes.filter((e) => e.tipo === "AT");
    const n = t?.nTrabajadores ?? (transcurrido(anio, mes) ? base : 0);
    const diasAus = evMes.filter((e) => e.tipo === "AT" || e.tipo === "AUSENTISMO" || e.tipo === "EL").reduce((s, e) => s + e.diasIncapacidad, 0);
    const diasProg = t?.diasProgramados ?? n * 24;
    return {
      mes, trabajadores: n, estimado: !t && n > 0, accidentes: at.length,
      frecuencia: n ? (at.length / n) * 100 : null,
      severidad: n ? (at.reduce((s, e) => s + e.diasIncapacidad + e.diasCargados, 0) / n) * 100 : null,
      ausentismo: diasProg ? (diasAus / diasProg) * 100 : null,
    };
  });
}

export function calcularAnuales(eventos: Ev[], tm: TM[], anio: number, base = 0) {
  const evA = eventos.filter((e) => e.fecha.getFullYear() === anio);
  const at = evA.filter((e) => e.tipo === "AT");
  const el = evA.filter((e) => e.tipo === "EL");
  const meses = calcularMensuales(eventos, tm, anio, base).filter((m) => m.trabajadores > 0);
  const prom = meses.length ? meses.reduce((s, x) => s + x.trabajadores, 0) / meses.length : 0;
  return {
    mortalidad: at.length ? (at.filter((e) => e.mortal).length / at.length) * 100 : 0,
    prevalencia: prom ? (el.length / prom) * 100000 : null,
    incidencia: prom ? (el.filter((e) => e.casoNuevo).length / prom) * 100000 : null,
    promedioTrabajadores: prom,
  };
}
