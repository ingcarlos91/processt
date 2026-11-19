// Evaluación de condiciones de aplicabilidad (reglas, normas, plantillas).
export type Disparador =
  | "alturas" | "confinados" | "quimicos" | "electrico" | "ruido" | "manipulacionAlimentos"
  | "atencionPublico" | "cargas" | "maquinaria" | "trabajoCaliente" | "izaje" | "biologico"
  | "altoRiesgoPension" | "trabajoNocturno" | "teletrabajo" | "conduccion";

export const DISPARADORES: { clave: Disparador; etiqueta: string; norma?: string }[] = [
  { clave: "alturas", etiqueta: "Trabajo en alturas (1,5 m o más)", norma: "Res. 4272/2021" },
  { clave: "confinados", etiqueta: "Espacios confinados (tanques, pozos, silos, cámaras)", norma: "Res. 0491/2020" },
  { clave: "quimicos", etiqueta: "Uso o almacenamiento de sustancias químicas", norma: "Decreto 1496/2018" },
  { clave: "electrico", etiqueta: "Trabajos con energía eléctrica (intervención de redes/tableros)", norma: "Res. 2400/1979; RETIE" },
  { clave: "ruido", etiqueta: "Ruido alto (máquinas, plantas, herramientas)", norma: "Res. 8321/1983" },
  { clave: "maquinaria", etiqueta: "Máquinas y equipos con partes móviles", norma: "Res. 2400/1979" },
  { clave: "cargas", etiqueta: "Manipulación manual de cargas", norma: "Res. 2400/1979 arts. 388-392" },
  { clave: "trabajoCaliente", etiqueta: "Trabajos en caliente (soldadura, corte)", norma: "Res. 2400/1979" },
  { clave: "izaje", etiqueta: "Izaje de cargas (grúas, montacargas)", norma: "Res. 2400/1979" },
  { clave: "biologico", etiqueta: "Riesgo biológico (salud, residuos, aguas, animales)", norma: "Decreto 1072/2015" },
  { clave: "manipulacionAlimentos", etiqueta: "Manipulación de alimentos", norma: "Res. 2674/2013" },
  { clave: "atencionPublico", etiqueta: "Atención al público / manejo de dinero", norma: "Res. 2646/2008" },
  { clave: "conduccion", etiqueta: "Conducción de vehículos en misión", norma: "Ley 1503/2011" },
  { clave: "trabajoNocturno", etiqueta: "Trabajo nocturno o por turnos", norma: "Res. 2646/2008" },
  { clave: "teletrabajo", etiqueta: "Teletrabajo / trabajo en casa", norma: "Ley 1221/2008; Ley 2088/2021" },
  { clave: "altoRiesgoPension", etiqueta: "Actividades de alto riesgo para pensión especial", norma: "Decreto 2090/2003" },
];

export type ContextoReglas = {
  trabajadores: number;
  claseRiesgo: number;
  vehiculos: number;
  aprendices: number;
  esUpa: boolean;
  nivel?: number;
  disparadores: Partial<Record<Disparador, boolean>>;
  /** De dónde salió cada disparador: marcado en el cuestionario o detectado en la matriz (con el peligro que lo activó). */
  origenDisparadores?: Partial<Record<Disparador, string>>;
};

/** Normas de un peligro → disparador que activan. */
export const NORMA_A_DISPARADOR: Record<string, Disparador> = {
  "RES-4272-2021": "alturas", "RES-0491-2020": "confinados", "DEC-1496-2018": "quimicos", "RES-0773-2021": "quimicos",
  "RES-8321-1983": "ruido", "LEY-1503-2011": "conduccion",
};

export type Condicion = {
  siempre?: boolean; nunca?: boolean;
  trabajadoresMin?: number; trabajadoresMax?: number;
  claseRiesgoIn?: number[];
  disparador?: Disparador; disparadorAlguno?: Disparador[];
  vehiculosMin?: number; aprendicesMin?: number;
  esUpa?: boolean; nivelMin?: number;
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
  if (c.aprendicesMin != null && ctx.aprendices < c.aprendicesMin) return false;
  if (c.esUpa != null && ctx.esUpa !== c.esUpa) return false;
  if (c.nivelMin != null && (ctx.nivel ?? 7) < c.nivelMin) return false;
  if (c.todos && !c.todos.every((x) => cumple(x, ctx))) return false;
  if (c.alguno && !c.alguno.some((x) => cumple(x, ctx))) return false;
  return true;
}
