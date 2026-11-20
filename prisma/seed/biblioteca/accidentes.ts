// Biblioteca global de accidentes e incidentes (parametrizable en Biblioteca → Accidentes).
// FORMA_EVENTO: causas y medidas típicas por forma del accidente (guía; la consultora decide).
// LESION: `sugiereGrave` según los criterios de accidente grave de la Res. 1401/2007 art. 3.

type Medida = { descripcion: string; jerarquia: "eliminacion" | "sustitucion" | "ingenieria" | "administrativo" | "epp"; tipo: "correctiva" | "preventiva" | "mejora" };
type Forma = {
  nombre: string; descripcion: string; clasificaciones: string[]; claves: string[];
  actos?: string[]; condiciones?: string[]; personales?: string[]; trabajo?: string[];
  medidas?: Medida[]; lesiones?: string[]; agentes?: string[]; partes?: string[]; leccion?: string;
};

const CS = "Condiciones de seguridad";
export const formas: Forma[] = [
  { nombre: "Caída de personas a nivel", descripcion: "Resbalón o tropiezo en la misma superficie.", clasificaciones: [CS], claves: ["piso", "superfic", "locativ", "obstacul", "humed", "desniv"],
    actos: ["Caminar con prisa o sin mirar el piso", "Usar calzado inadecuado"], condiciones: ["Piso húmedo, irregular o con obstáculos", "Orden y aseo deficientes", "Iluminación insuficiente"], personales: ["Fatiga o distracción"], trabajo: ["Programa de orden y aseo e inspecciones locativas insuficientes"],
    medidas: [{ descripcion: "Corregir superficies irregulares o resbalosas y demarcar áreas de tránsito", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Reforzar el programa de orden y aseo e inspecciones locativas", jerarquia: "administrativo", tipo: "preventiva" }, { descripcion: "Suministrar calzado antideslizante", jerarquia: "epp", tipo: "preventiva" }],
    lesiones: ["Golpe o contusión", "Torcedura o esguince", "Fractura"], agentes: ["Pisos y superficies"], partes: ["Miembros inferiores", "Pies", "Miembros superiores"], leccion: "Mantenga las áreas de tránsito libres, secas y bien iluminadas; reporte de inmediato cualquier piso en mal estado." },
  { nombre: "Caída de personas a distinto nivel", descripcion: "Caída desde escaleras, andamios, techos, vehículos o desniveles.", clasificaciones: [CS], claves: ["altur", "escaler", "andami", "techo", "desniv"],
    actos: ["Trabajo en altura sin sistema de protección contra caídas", "Usar escalera en mal estado o mal ubicada"], condiciones: ["Escalera o superficie sin barandas", "Bordes sin protección"], personales: ["Falta de entrenamiento en trabajo en alturas"], trabajo: ["Permiso de trabajo o procedimiento de alturas no aplicado", "Inspección de equipos de alturas insuficiente"],
    medidas: [{ descripcion: "Instalar barandas o sistemas de protección contra caídas", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Aplicar permiso de trabajo y procedimiento de trabajo en alturas", jerarquia: "administrativo", tipo: "correctiva" }, { descripcion: "Verificar certificación vigente en alturas del personal", jerarquia: "administrativo", tipo: "preventiva" }],
    lesiones: ["Fractura", "Golpe o contusión", "Lesiones múltiples"], agentes: ["Escaleras o andamios"], partes: ["Ubicaciones múltiples", "Cabeza", "Espalda"], leccion: "Todo trabajo a más de 2 metros requiere permiso, equipo certificado y persona entrenada." },
  { nombre: "Caída de objetos", descripcion: "Objetos que caen sobre la persona desde estanterías, alturas o cargas.", clasificaciones: [CS], claves: ["almacen", "estant", "objet", "carg", "apil"],
    actos: ["Apilar por encima de la altura permitida"], condiciones: ["Almacenamiento inseguro o estanterías sin anclaje"], trabajo: ["Falta de estándar de almacenamiento"],
    medidas: [{ descripcion: "Anclar estanterías y definir alturas máximas de apilamiento", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Uso de casco en zonas de almacenamiento en altura", jerarquia: "epp", tipo: "preventiva" }],
    lesiones: ["Golpe o contusión", "Fractura"], agentes: ["Materiales u objetos"], partes: ["Cabeza", "Pies", "Miembros superiores"] },
  { nombre: "Golpe contra objetos", descripcion: "La persona se golpea contra un objeto fijo o en movimiento.", clasificaciones: [CS], claves: ["espaci", "locativ", "objet", "mobili"],
    condiciones: ["Espacios reducidos u objetos que sobresalen"], trabajo: ["Distribución del área de trabajo deficiente"],
    medidas: [{ descripcion: "Redistribuir el área y señalizar objetos que sobresalen", jerarquia: "ingenieria", tipo: "correctiva" }],
    lesiones: ["Golpe o contusión", "Herida"], agentes: ["Materiales u objetos"], partes: ["Cabeza", "Miembros superiores", "Miembros inferiores"] },
  { nombre: "Golpe por objetos", descripcion: "Un objeto en movimiento golpea a la persona.", clasificaciones: [CS], claves: ["objet", "carg", "herramient", "material"],
    actos: ["Posicionarse en la línea de fuego"], condiciones: ["Materiales sin asegurar"],
    medidas: [{ descripcion: "Asegurar materiales y demarcar zonas de exclusión", jerarquia: "administrativo", tipo: "correctiva" }],
    lesiones: ["Golpe o contusión", "Fractura"], agentes: ["Materiales u objetos", "Herramientas manuales"] },
  { nombre: "Atrapamiento", descripcion: "Parte del cuerpo atrapada entre partes móviles de máquinas u objetos.", clasificaciones: [CS], claves: ["maquin", "movil", "atrapam", "rodill", "banda", "engran"],
    actos: ["Intervenir la máquina en movimiento", "Retirar o anular guardas"], condiciones: ["Máquina sin guardas o sin paro de emergencia"], personales: ["Falta de entrenamiento en el equipo"], trabajo: ["Falta de procedimiento de bloqueo y etiquetado"],
    medidas: [{ descripcion: "Instalar guardas fijas e interbloqueos en partes móviles", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Implementar procedimiento de bloqueo y etiquetado para limpieza y mantenimiento", jerarquia: "administrativo", tipo: "correctiva" }],
    lesiones: ["Amputación", "Fractura", "Trauma superficial"], agentes: ["Máquinas o equipos"], partes: ["Manos", "Dedos de la mano", "Miembros superiores"], leccion: "Nunca intervenga una máquina en movimiento: apáguela, bloquéela y etiquétela antes de limpiarla o repararla." },
  { nombre: "Corte o pinchazo", descripcion: "Herida por herramienta, objeto cortante o punzante.", clasificaciones: [CS, "Biologico"], claves: ["cort", "cuchill", "herramient", "tijer", "filo", "cortopunz", "sierr", "pinch", "punz", "aguj", "bistur", "jering", "instrumental"],
    actos: ["Usar herramienta inadecuada o en mal estado", "No usar guantes de protección", "Reencapsular agujas o manipular cortopunzantes con la mano"], condiciones: ["Herramientas cortantes sin protección", "Sin contenedor para cortopunzantes (guardián) cerca del punto de uso"], personales: ["Falta de entrenamiento en uso de herramientas", "Desconocimiento del protocolo de bioseguridad"], trabajo: ["No existe procedimiento de uso seguro de herramientas de corte", "Sin protocolo de bioseguridad ni de atención de la exposición a riesgo biológico"],
    medidas: [{ descripcion: "Instalar o reponer guardas y protecciones en las herramientas y equipos de corte", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Elaborar y socializar el procedimiento seguro de uso de herramientas de corte", jerarquia: "administrativo", tipo: "correctiva" }, { descripcion: "Suministrar y exigir guantes resistentes al corte", jerarquia: "epp", tipo: "preventiva" }, { descripcion: "Ubicar guardianes para cortopunzantes en cada punto de uso y prohibir reencapsular", jerarquia: "administrativo", tipo: "correctiva" }],
    lesiones: ["Herida", "Amputación"], agentes: ["Herramientas manuales", "Herramientas eléctricas", "Materiales u objetos"], partes: ["Manos", "Dedos de la mano"], leccion: "Use la herramienta adecuada, en buen estado y con los guantes que exige la tarea; deseche los cortopunzantes en el guardián sin reencapsular y reporte de inmediato cualquier pinchazo." },
  { nombre: "Pisada sobre objetos", descripcion: "La persona pisa objetos punzantes o cortantes.", clasificaciones: [CS], claves: ["piso", "objet", "clavo", "residu"],
    condiciones: ["Residuos o materiales en el piso"], trabajo: ["Orden y aseo deficientes"], lesiones: ["Herida"], agentes: ["Materiales u objetos"], partes: ["Pies"] },
  { nombre: "Sobreesfuerzo", descripcion: "Lesión por levantar, empujar o halar cargas o por posturas forzadas.", clasificaciones: ["Biomecanico"], claves: ["carg", "levant", "manipul", "esfuerz", "postur"],
    actos: ["Levantar cargas con técnica inadecuada o por encima de la capacidad"], condiciones: ["Ausencia de ayudas mecánicas para manipular cargas"], personales: ["Fatiga o desconocimiento de higiene postural"], trabajo: ["Sin evaluación de manipulación de cargas"],
    medidas: [{ descripcion: "Proveer ayudas mecánicas para la manipulación de cargas", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Capacitar en manipulación segura de cargas y pausas activas", jerarquia: "administrativo", tipo: "preventiva" }],
    lesiones: ["Torcedura o esguince", "Luxación"], agentes: ["Materiales u objetos"], partes: ["Espalda", "Miembros superiores"], leccion: "Use ayudas mecánicas y pida apoyo para cargas pesadas; levante doblando las rodillas, con la espalda recta." },
  { nombre: "Exposición a temperaturas extremas", descripcion: "Contacto con superficies, líquidos o ambientes muy calientes o fríos.", clasificaciones: ["Fisico", CS], claves: ["temperat", "calor", "frio", "quemad", "caliente", "horno", "vapor"],
    condiciones: ["Superficies calientes sin aislamiento o señalización"], medidas: [{ descripcion: "Aislar o señalizar superficies calientes", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Suministrar guantes térmicos", jerarquia: "epp", tipo: "preventiva" }],
    lesiones: ["Quemadura"], agentes: ["Ambiente de trabajo", "Máquinas o equipos"], partes: ["Manos", "Miembros superiores"] },
  { nombre: "Contacto con electricidad", descripcion: "Descarga eléctrica por contacto directo o indirecto.", clasificaciones: [CS], claves: ["electr", "energ", "cable", "tension"],
    actos: ["Intervenir equipos energizados"], condiciones: ["Cables o tomas en mal estado"], personales: ["Personal no calificado para trabajos eléctricos"], trabajo: ["Mantenimiento eléctrico insuficiente; sin reglas de oro"],
    medidas: [{ descripcion: "Reparar instalaciones eléctricas y aplicar las reglas de oro antes de intervenir", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Restringir los trabajos eléctricos a personal calificado", jerarquia: "administrativo", tipo: "correctiva" }],
    lesiones: ["Quemadura", "Lesiones generales"], agentes: ["Energía eléctrica"], partes: ["Manos", "Lesiones generales"], leccion: "Solo personal calificado interviene instalaciones eléctricas, siempre desenergizadas y bloqueadas." },
  { nombre: "Contacto con sustancias químicas", descripcion: "Contacto, inhalación o salpicadura de sustancias químicas.", clasificaciones: ["Quimico"], claves: ["quimic", "sustanc", "liquid", "vapor", "polv", "solvent"],
    actos: ["No usar EPP para químicos", "Trasvasar sin etiquetar"], condiciones: ["Recipientes sin etiquetar o sin ficha de datos de seguridad"], trabajo: ["Comunicación de peligros (SGA) incompleta"],
    medidas: [{ descripcion: "Etiquetar recipientes y disponer de fichas de datos de seguridad (SGA)", jerarquia: "administrativo", tipo: "correctiva" }, { descripcion: "Suministrar EPP para químicos según la ficha de seguridad", jerarquia: "epp", tipo: "preventiva" }],
    lesiones: ["Quemadura", "Cuerpo extraño"], agentes: ["Sustancias químicas"], partes: ["Ojos", "Manos"] },
  { nombre: "Proyección de partículas", descripcion: "Partículas, fragmentos o líquidos proyectados hacia la persona.", clasificaciones: [CS], claves: ["particul", "proyecc", "esmeril", "puli"],
    actos: ["No usar protección visual"], condiciones: ["Equipo sin pantalla o guarda"],
    medidas: [{ descripcion: "Instalar pantallas o guardas y exigir protección visual", jerarquia: "ingenieria", tipo: "correctiva" }],
    lesiones: ["Cuerpo extraño", "Herida"], agentes: ["Herramientas eléctricas", "Máquinas o equipos"], partes: ["Ojos", "Cabeza"] },
  { nombre: "Mordedura o picadura", descripcion: "Lesión causada por animales o insectos.", clasificaciones: ["Biologico"], claves: ["animal", "insect", "mordedur", "picadur"], lesiones: ["Herida", "Trauma superficial"], agentes: ["Animales"] },
  { nombre: "Accidente de tránsito", descripcion: "Evento vial durante la jornada o en misión de trabajo.", clasificaciones: [CS], claves: ["transit", "vehicul", "conduc", "vial", "moto"],
    actos: ["Exceso de velocidad o distracción al conducir"], condiciones: ["Vehículo sin mantenimiento"], trabajo: ["Plan de seguridad vial no implementado"],
    medidas: [{ descripcion: "Revisar el cumplimiento del plan de seguridad vial para el cargo", jerarquia: "administrativo", tipo: "correctiva" }],
    lesiones: ["Lesiones múltiples", "Fractura", "Golpe o contusión"], agentes: ["Vehículos"], partes: ["Ubicaciones múltiples"] },
  { nombre: "Agresión o violencia", descripcion: "Agresión física por terceros o compañeros.", clasificaciones: ["Psicosocial", CS], claves: ["public", "atraco", "agresi", "violen", "client"],
    trabajo: ["Protocolo de atención a público o de seguridad insuficiente"], lesiones: ["Golpe o contusión", "Herida"], agentes: ["Personas"] },
  { nombre: "Otro", descripcion: "Forma no contemplada en la lista.", clasificaciones: [], claves: [] },
];

export const agentes: [string, string][] = [
  ["Máquinas o equipos", "Equipos fijos o móviles con partes en movimiento"], ["Herramientas manuales", "Cuchillos, martillos, destornilladores, tijeras"], ["Herramientas eléctricas", "Pulidoras, taladros, sierras"],
  ["Vehículos", "Automóviles, motocicletas, montacargas"], ["Escaleras o andamios", ""], ["Pisos y superficies", ""], ["Materiales u objetos", "Cargas, cajas, productos"],
  ["Sustancias químicas", ""], ["Energía eléctrica", ""], ["Ambiente de trabajo", "Calor, frío, iluminación, ruido"], ["Animales", ""], ["Personas", "Clientes, terceros o compañeros"], ["Otro", ""],
];

// [nombre, descripción, sugiere grave]
export const lesiones: [string, string, boolean][] = [
  ["Golpe o contusión", "", false], ["Herida", "", false], ["Torcedura o esguince", "", false], ["Fractura", "Si es de huesos largos (brazo, antebrazo, muslo, pierna), el accidente es grave.", true],
  ["Quemadura", "Si es de segundo o tercer grado, el accidente es grave.", true], ["Cuerpo extraño", "Si compromete la agudeza o el campo visual, el accidente es grave.", false], ["Luxación", "", false],
  ["Amputación", "Amputación de cualquier segmento corporal: accidente grave.", true], ["Trauma craneoencefálico", "Accidente grave.", true], ["Trauma superficial", "", false],
  ["Lesiones múltiples", "", false], ["Otra", "", false],
];

export const partes: string[] = ["Cabeza", "Ojos", "Oídos", "Cuello", "Tronco", "Espalda", "Tórax", "Abdomen", "Miembros superiores", "Manos", "Dedos de la mano", "Miembros inferiores", "Pies", "Dedos del pie", "Ubicaciones múltiples", "Lesiones generales"];

export function itemsAccidentes() {
  return [
    ...formas.map((f, i) => { const { nombre, descripcion, ...detalle } = f; return { tipo: "FORMA_EVENTO", nombre, descripcion, detalle: { ...detalle, orden: i }, normas: ["RES-1401-2007"] }; }),
    ...agentes.map(([nombre, descripcion], i) => ({ tipo: "AGENTE_EVENTO", nombre, descripcion, detalle: { orden: i }, normas: [] as string[] })),
    ...lesiones.map(([nombre, descripcion, sugiereGrave], i) => ({ tipo: "LESION", nombre, descripcion, detalle: { orden: i, sugiereGrave }, normas: sugiereGrave ? ["RES-1401-2007"] : [] })),
    ...partes.map((nombre, i) => ({ tipo: "PARTE_CUERPO", nombre, descripcion: "", detalle: { orden: i }, normas: [] as string[] })),
  ];
}
