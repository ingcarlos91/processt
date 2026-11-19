// Evaluación de condiciones de aplicabilidad (reglas, normas, plantillas).
export type Disparador =
  | "alturas" | "confinados" | "quimicos" | "electrico" | "ruido" | "manipulacionAlimentos"
  | "atencionPublico" | "cargas" | "maquinaria" | "trabajoCaliente" | "izaje" | "biologico" | "residuosSalud"
  | "altoRiesgoPension" | "trabajoNocturno" | "teletrabajo" | "trabajoEnCasa" | "conduccion"
  | "actividadIndustrial" | "almacenamientoCarga" | "aglomeracionesPublico" | "serviciosPublicos" | "obraCivilMayor" | "instalacionClasificada";

export const DISPARADORES: { clave: Disparador; etiqueta: string; norma?: string; grupo?: string }[] = [
  { clave: "alturas", etiqueta: "Trabajo en alturas (riesgo de caída mayor a 2,0 m)", norma: "Res. 4272/2021 art. 3" },
  { clave: "confinados", etiqueta: "Espacios confinados (tanques, pozos, silos, cámaras)", norma: "Res. 0491/2020" },
  { clave: "quimicos", etiqueta: "Uso o almacenamiento de productos químicos con pictograma de peligro (incluidos los de aseo)", norma: "Decreto 1496/2018; Res. 0773/2021" },
  { clave: "instalacionClasificada", etiqueta: "Sustancias peligrosas en cantidades iguales o superiores a los umbrales de accidentes mayores", norma: "Decreto 1347/2021", grupo: "especial" },
  { clave: "electrico", etiqueta: "Trabajos con energía eléctrica (intervención de redes, tableros, subestaciones)", norma: "Res. 5018/2019; RETIE (Res. 40117/2024)" },
  { clave: "ruido", etiqueta: "Ruido alto (85 dB(A) o más en 8 horas: máquinas, plantas, herramientas)", norma: "Res. 8321/1983; Res. 2844/2007" },
  { clave: "maquinaria", etiqueta: "Máquinas y equipos con partes móviles", norma: "Res. 2400/1979 arts. 266-295" },
  { clave: "cargas", etiqueta: "Manipulación manual de cargas", norma: "Res. 2400/1979 arts. 388-397" },
  { clave: "trabajoCaliente", etiqueta: "Trabajos en caliente (soldadura, corte)", norma: "Res. 2400/1979 arts. 548-561" },
  { clave: "izaje", etiqueta: "Izaje de cargas (grúas, montacargas, polipastos)", norma: "Res. 2400/1979 arts. 398-447" },
  { clave: "biologico", etiqueta: "Riesgo biológico (fluidos, residuos, aguas, animales, público)", norma: "Decreto 1072/2015 art. 2.2.4.6.24; Decreto 1477/2014" },
  { clave: "residuosSalud", etiqueta: "Genera residuos de atención en salud o afines (salud, veterinaria, estética, tatuajes, funerarias, laboratorios)", norma: "Decreto 780/2016 art. 2.8.10.2; Res. 591/2024", grupo: "especial" },
  { clave: "manipulacionAlimentos", etiqueta: "Manipulación de alimentos", norma: "Res. 2674/2013 arts. 11-14" },
  { clave: "atencionPublico", etiqueta: "Atención al público / manejo de dinero", norma: "Res. 2646/2008 art. 6" },
  { clave: "aglomeracionesPublico", etiqueta: "Administra espacios con aglomeraciones de público (eventos, centros comerciales, estadios, templos)", norma: "Decreto 2157/2017", grupo: "especial" },
  { clave: "conduccion", etiqueta: "Conducción de vehículos en misión (carro, moto, bicicleta)", norma: "Ley 1503/2011 art. 12; Decreto 1079/2015 art. 2.3.2.3.2" },
  { clave: "almacenamientoCarga", etiqueta: "Transporte o almacenamiento de carga como actividad principal", norma: "Decreto 2157/2017", grupo: "especial" },
  { clave: "trabajoNocturno", etiqueta: "Trabajo nocturno (7:00 p. m. a 6:00 a. m.) o por turnos", norma: "CST art. 160 (Ley 2466/2025 art. 10); Res. 2646/2008" },
  { clave: "teletrabajo", etiqueta: "Teletrabajo o trabajo remoto (permanente)", norma: "Ley 1221/2008; Decreto 1227/2022; Ley 2121/2021" },
  { clave: "trabajoEnCasa", etiqueta: "Trabajo en casa (habilitación temporal, hasta 3 meses prorrogables)", norma: "Ley 2088/2021" },
  { clave: "actividadIndustrial", etiqueta: "Actividad industrial (transformación mecánica o química de materiales)", norma: "Decreto 2157/2017", grupo: "especial" },
  { clave: "serviciosPublicos", etiqueta: "Presta servicios públicos (acueducto, energía, gas, aseo, telecomunicaciones)", norma: "Decreto 2157/2017", grupo: "especial" },
  { clave: "obraCivilMayor", etiqueta: "Ejecuta obras civiles mayores o edificaciones de categoría IV", norma: "Decreto 2157/2017", grupo: "especial" },
  { clave: "altoRiesgoPension", etiqueta: "Actividades de alto riesgo para pensión especial (minería subterránea, altas temperaturas, radiaciones ionizantes, cancerígenos, bomberos, custodia penitenciaria, control aéreo)", norma: "Decreto 2090/2003 art. 2" },
];

export type ContextoReglas = {
  trabajadores: number;
  claseRiesgo: number;
  vehiculos: number;
  /** Personas que conducen vehículos al servicio de la empresa (propios o no, incluidas motos), sin importar el tipo de contrato. */
  conductores: number;
  /** Contratistas por prestación de servicios con contrato de más de un mes. */
  contratistas: number;
  aprendices: number;
  /** Trabajadoras (mujeres) registradas; alimenta la regla de salas de lactancia. */
  mujeres: number;
  /** Centros de trabajo o sedes (para comités por centro de trabajo). */
  sedes: number;
  /** Empresa de transporte terrestre automotor (misionalidad 1 del PESV). */
  esTransporte: boolean;
  esUpa: boolean;
  nivel?: number;
  disparadores: Partial<Record<Disparador, boolean>>;
  /** De dónde salió cada disparador: marcado en el cuestionario o detectado en la matriz (con el peligro que lo activó). */
  origenDisparadores?: Partial<Record<Disparador, string>>;
};

/** Normas de un peligro → disparador que activan. */
export const NORMA_A_DISPARADOR: Record<string, Disparador> = {
  "RES-4272-2021": "alturas", "RES-0491-2020": "confinados", "RES-2605-2020": "confinados", "DEC-1496-2018": "quimicos", "RES-0773-2021": "quimicos",
  "RES-8321-1983": "ruido", "LEY-1503-2011": "conduccion", "RES-5018-2019": "electrico", "RES-40117-2024": "electrico",
  "RES-2674-2013": "manipulacionAlimentos", "DEC-0780-2016": "residuosSalud", "RES-0591-2024": "residuosSalud",
  "LEY-1221-2008": "teletrabajo", "DEC-1227-2022": "teletrabajo", "LEY-2121-2021": "teletrabajo", "LEY-2088-2021": "trabajoEnCasa",
};

export type Condicion = {
  siempre?: boolean; nunca?: boolean;
  trabajadoresMin?: number; trabajadoresMax?: number;
  claseRiesgoIn?: number[];
  disparador?: Disparador; disparadorAlguno?: Disparador[];
  vehiculosMin?: number; conductoresMin?: number; contratistasMin?: number; aprendicesMin?: number; mujeresMin?: number; sedesMin?: number;
  esUpa?: boolean; esTransporte?: boolean; nivelMin?: number;
  todos?: Condicion[]; alguno?: Condicion[];
};

export function cumple(c: Condicion | null | undefined, ctx: ContextoReglas): boolean {
  if (!c || Object.keys(c).length === 0) return true;
  if (c.nunca) return false;
  if (c.trabajadoresMin != null && ctx.trabajadores < c.trabajadoresMin) return false;
  if (c.trabajadoresMax != null && ctx.trabajadores > c.trabajadoresMax) return false;
  if (c.claseRiesgoIn && !c.claseRiesgoIn.includes(ctx.claseRiesgo)) return false;
  if (c.disparador && !ctx.disparadores[c.disparador]) return false;
  if (c.disparadorAlguno && !c.disparadorAlguno.some((d) => ctx.disparadores[d])) return false;
  if (c.vehiculosMin != null && ctx.vehiculos < c.vehiculosMin) return false;
  if (c.conductoresMin != null && (ctx.conductores ?? 0) < c.conductoresMin) return false;
  if (c.contratistasMin != null && (ctx.contratistas ?? 0) < c.contratistasMin) return false;
  if (c.aprendicesMin != null && ctx.aprendices < c.aprendicesMin) return false;
  if (c.mujeresMin != null && (ctx.mujeres ?? 0) < c.mujeresMin) return false;
  if (c.sedesMin != null && (ctx.sedes ?? 1) < c.sedesMin) return false;
  if (c.esUpa != null && ctx.esUpa !== c.esUpa) return false;
  if (c.esTransporte != null && !!ctx.esTransporte !== c.esTransporte) return false;
  if (c.nivelMin != null && (ctx.nivel ?? 7) < c.nivelMin) return false;
  if (c.todos && !c.todos.every((x) => cumple(x, ctx))) return false;
  if (c.alguno && !c.alguno.some((x) => cumple(x, ctx))) return false;
  return true;
}

/**
 * Nivel del Plan Estratégico de Seguridad Vial (Res. 40595/2022, Tabla 1 del anexo).
 * Misionalidad 1: empresas de transporte terrestre automotor; misionalidad 2: las demás. Si cae en dos niveles aplica el más alto.
 */
export function nivelPesv(ctx: { vehiculos: number; conductores: number; esTransporte: boolean }): "basico" | "estandar" | "avanzado" | null {
  const { vehiculos: v, conductores: c } = ctx;
  if (v < 11 && c < 2) return null;
  const [est, av] = ctx.esTransporte ? [20, 51] : [50, 101];
  if (v >= av || c >= av) return "avanzado";
  if (v >= est || c >= est) return "estandar";
  return "basico";
}

/** Composición del Comité de Convivencia Laboral (Res. 3461/2025 art. 3). */
export function composicionCcl(trabajadores: number) {
  if (trabajadores < 5) return { porParte: 1, suplentes: false, texto: "1 representante de los trabajadores y 1 del empleador, sin suplentes" };
  if (trabajadores <= 20) return { porParte: 1, suplentes: true, texto: "1 representante de los trabajadores y 1 del empleador, con sus suplentes" };
  return { porParte: 2, suplentes: true, texto: "2 representantes de los trabajadores y 2 del empleador, con sus suplentes" };
}
