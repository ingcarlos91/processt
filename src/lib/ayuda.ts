// Ayuda contextual de cada campo: qué es, para qué se usa, dónde encontrarlo y opciones.
// Fuente única: si cambia una explicación, se corrige aquí y se refleja en todos los formularios.

export type Opcion = { valor: string; etiqueta: string; explica?: string };
export type Ayuda = { titulo: string; que: string; para?: string; donde?: string; ejemplo?: string; opciones?: Opcion[]; normas?: string[] };

export const TURNOS: Opcion[] = [
  { valor: "un_turno_diurno", etiqueta: "Un turno diurno", explica: "Todos trabajan en el mismo horario de día (por ejemplo, 8:00 a 17:00)." },
  { valor: "dos_turnos", etiqueta: "Dos turnos (mañana y tarde)", explica: "Por ejemplo, 6:00 a 14:00 y 14:00 a 22:00. No incluye noche." },
  { valor: "tres_turnos", etiqueta: "Tres turnos (24 horas)", explica: "La operación no se detiene: mañana, tarde y noche." },
  { valor: "rotativos", etiqueta: "Turnos rotativos", explica: "Las personas cambian de turno cada semana o cada cierto tiempo, incluyendo la noche." },
  { valor: "nocturno_fijo", etiqueta: "Turno nocturno fijo", explica: "Algunas personas trabajan siempre de noche (vigilancia, panadería, producción)." },
  { valor: "fines_semana", etiqueta: "Incluye fines de semana y festivos", explica: "Comercio, restaurantes, salud: se trabaja sábados, domingos o festivos." },
];
export const TURNOS_NOCTURNOS = ["tres_turnos", "rotativos", "nocturno_fijo"];

export const DIAS: Opcion[] = [
  { valor: "Lunes a viernes", etiqueta: "Lunes a viernes" },
  { valor: "Lunes a sábado", etiqueta: "Lunes a sábado" },
  { valor: "Lunes a domingo", etiqueta: "Lunes a domingo" },
  { valor: "Martes a domingo", etiqueta: "Martes a domingo" },
  { valor: "Por turnos (variable)", etiqueta: "Por turnos (variable)" },
];

export const AYUDA: Record<string, Ayuda> = {
  // ── Identificación ──
  razonSocial: { titulo: "Razón social", que: "Nombre legal de la empresa, tal como aparece en el RUT o en el certificado de Cámara de Comercio.", para: "Aparece en todos los documentos, la matriz y los encabezados.", donde: "RUT (casilla 35) o certificado de existencia y representación legal.", ejemplo: "Ferretería El Tornillo S.A.S." },
  nit: { titulo: "NIT", que: "Número de Identificación Tributaria, sin dígito de verificación ni puntos.", para: "Identifica a la empresa en los documentos y en la plataforma del Ministerio del Trabajo.", donde: "RUT (casilla 5).", ejemplo: "901555333" },
  dv: { titulo: "Dígito de verificación", que: "El último número del NIT, que va después del guion.", donde: "RUT (casilla 6).", ejemplo: "7" },
  telefono: { titulo: "Teléfono", que: "Número de contacto de la empresa.", para: "Se usa en el plan de emergencias y en los procedimientos de reporte." },
  direccion: { titulo: "Dirección", que: "Dirección de la sede principal.", para: "Aparece en el Reglamento de Higiene y Seguridad Industrial y en el plan de emergencias.", donde: "RUT o certificado de Cámara de Comercio." },
  correo: { titulo: "Correo", que: "Correo de contacto de la empresa.", para: "Se usa como canal de quejas en la política de convivencia y en las comunicaciones del SG-SST." },
  ciudad: { titulo: "Ciudad", que: "Ciudad de la sede principal.", para: "Aparece en las fechas de firma de los documentos (“Dada en …”)." },
  departamento: { titulo: "Departamento", que: "Departamento de la sede principal." },
  representanteLegal: { titulo: "Representante legal", que: "Persona que firma en nombre de la empresa.", para: "Firma la política, el plan anual, el presupuesto, las designaciones y la revisión por la dirección. Aparece como “Aprobó” en todos los documentos.", donde: "Certificado de existencia y representación legal (Cámara de Comercio).", normas: ["Decreto 1072/2015 art. 2.2.4.6.6"] },
  representanteCedula: { titulo: "Documento del representante legal", que: "Tipo (C.C., C.E., pasaporte, PPT…) y número del documento de quien firma.", para: "Va debajo de la firma del representante en todos los documentos y actas." },
  logo: { titulo: "Logo", que: "Imagen del logo de la empresa (PNG o JPG, máximo 2 MB).", para: "Se pone en el encabezado de todos los documentos Word y en la matriz en Excel.", donde: "Pídalo a la empresa; si no tiene, se usa el nombre." },

  // ── Actividad y riesgo ──
  busquedaCiiu: { titulo: "Actividad económica (CIIU)", que: "Código que clasifica a qué se dedica la empresa (Clasificación Industrial Internacional Uniforme, adaptada por el DANE).", para: "Con este código el sistema sugiere la clase de riesgo y el sector, que a su vez precarga procesos, cargos, tareas y peligros.", donde: "RUT, casilla 46 (actividad principal). También en el certificado de la ARL.", ejemplo: "4752 · Comercio al por menor de artículos de ferretería" },
  ciiu: { titulo: "Código CIIU", que: "Código de 4 dígitos de la actividad principal.", donde: "RUT, casilla 46." },
  claseRiesgo: {
    titulo: "Clase de riesgo", que: "Nivel de riesgo de la actividad para el Sistema de Riesgos Laborales, de I (mínimo) a V (máximo). Define cuánto paga la empresa a la ARL.",
    para: "Junto con el número de trabajadores define cuántos estándares mínimos aplican (7, 21 o 60). Las clases IV y V siempre exigen los 60.",
    donde: "Certificado de afiliación a la ARL o planilla PILA. Si la empresa tiene varias sedes con clases distintas, use la más alta.",
    opciones: [
      { valor: "1", etiqueta: "Clase I · riesgo mínimo", explica: "Oficinas, actividades financieras, educación, comercio sin manipulación pesada." },
      { valor: "2", etiqueta: "Clase II · riesgo bajo", explica: "Comercio con bodegas, restaurantes, algunos procesos de manufactura." },
      { valor: "3", etiqueta: "Clase III · riesgo medio", explica: "Manufactura, talleres, salud, transporte de pasajeros urbano." },
      { valor: "4", etiqueta: "Clase IV · riesgo alto", explica: "Transporte de carga, procesos industriales pesados, vigilancia." },
      { valor: "5", etiqueta: "Clase V · riesgo máximo", explica: "Construcción, minería, trabajos en alturas, energía eléctrica." },
    ],
    normas: ["Decreto 1607/2002", "Decreto 768/2022", "Res. 0312/2019 arts. 3, 9 y 16"],
  },
  descripcionActividad: { titulo: "Descripción de la actividad", que: "A qué se dedica la empresa, en una frase.", para: "Aparece en la política de SST, el reglamento y la evaluación inicial.", ejemplo: "Venta al por menor de herramientas, materiales de construcción y pinturas." },
  sector: { titulo: "Sector", que: "Grupo de actividades parecidas de la biblioteca (comercio, construcción, restaurantes…).", para: "Precarga procesos, zonas, cargos y tareas típicos con sus peligros. Ahorra la mayor parte del trabajo de la matriz.", donde: "Se elige solo al seleccionar el CIIU; cámbielo si no corresponde." },
  arl: { titulo: "ARL", que: "Administradora de Riesgos Laborales a la que están afiliados los trabajadores.", para: "Aparece en los procedimientos de reporte de accidentes y en el plan de emergencias.", donde: "Certificado de afiliación o planilla PILA." },
  eps: { titulo: "EPS principal", que: "EPS a la que está afiliada la mayoría de los trabajadores.", para: "Se usa en el procedimiento de reporte de accidentes y en las rutas de atención en salud mental." },
  justificacion: { titulo: "Justificación del cambio de clase", que: "Si eligió una clase de riesgo distinta a la sugerida por el CIIU, explique por qué.", para: "Queda registrada en el panel de decisiones para que cualquiera entienda el cambio.", ejemplo: "La ARL clasificó la sede de bodega como clase III." },
  esUpa: { titulo: "Unidad de producción agropecuaria", que: "Predio dedicado a actividades agrícolas, pecuarias, forestales, pesqueras o acuícolas.", para: "Si tiene 10 o menos trabajadores permanentes y riesgo I a III, aplican 3 obligaciones especiales en vez de los 7 estándares.", normas: ["Res. 0312/2019 arts. 5 a 8"] },

  // ── Personas ──
  planta: { titulo: "Trabajadores de planta", que: "Personas con contrato laboral directo con la empresa (indefinido, fijo, obra o labor).", para: "Junto con los trabajadores en misión, define cuántos estándares mínimos aplican y el tamaño del COPASST.", donde: "Nómina o planilla PILA del último mes.", normas: ["Res. 0312/2019 arts. 3, 9 y 16", "Res. 2013/1986 art. 2"] },
  enMision: { titulo: "Trabajadores en misión", que: "Personas enviadas por una empresa de servicios temporales que trabajan en esta empresa.", para: "Suman para el número de trabajadores y deben recibir inducción y estar en la matriz.", donde: "Contrato con la empresa temporal." },
  contratistas: { titulo: "Contratistas", que: "Personas o empresas que prestan un servicio por contrato civil o comercial (no laboral).", para: "No suman para el nivel de estándares, pero se les debe verificar afiliación a ARL, darles inducción e incluirlos en los indicadores.", donde: "Contratos de prestación de servicios vigentes.", normas: ["Decreto 1072/2015 art. 2.2.4.6.28", "Res. 0312/2019 art. 30"] },
  aprendices: { titulo: "Aprendices y practicantes", que: "Estudiantes con contrato de aprendizaje (SENA) o en práctica.", para: "Deben estar afiliados a la ARL y recibir inducción y capacitación.", normas: ["Decreto 0223/2026 (verificar)"] },
  vehiculos: { titulo: "Vehículos o conductores", que: "Vehículos propios, contratados o en leasing que usa la empresa, o personas que conducen como parte de su trabajo.", para: "Con 10 o más, la empresa debe adoptar el Plan Estratégico de Seguridad Vial (PESV).", normas: ["Ley 1503/2011 art. 12", "Res. 40595/2022"] },
  horario: { titulo: "Horario", que: "Días y horas en que se trabaja normalmente.", para: "Aparece en el plan de emergencias (quiénes están y cuándo) y ayuda a valorar la exposición a los peligros.", ejemplo: "Lunes a sábado, 8:00 a 18:00" },
  turnos: { titulo: "Turnos", que: "Cómo se organiza la jornada. Puede marcar varias opciones.", para: "El trabajo nocturno o rotativo es un factor de riesgo psicosocial (jornada): si lo marca, se activa ese peligro y la capacitación en manejo de turnos.", opciones: TURNOS, normas: ["Res. 2646/2008", "Res. 2764/2022"] },
  cargos: { titulo: "Cargos", que: "Los puestos de trabajo de la empresa y cuántas personas hay en cada uno.", para: "Cada cargo trae sus tareas y peligros de la biblioteca. La matriz, el profesiograma, la matriz de EPP y las capacitaciones salen de aquí.", donde: "Organigrama o nómina por cargo.", ejemplo: "Vendedor (14), Auxiliar de bodega (8), Cajero (4)" },
  cargoTipo: { titulo: "Tipo de cargo", que: "El cargo de la biblioteca que más se parece a este.", para: "Define qué tareas y peligros se precargan. Si lo deja en automático, el sistema lo busca por el nombre." },

  // ── Sedes ──
  sedes: { titulo: "Sedes o centros de trabajo", que: "Cada lugar físico donde trabaja personal de la empresa.", para: "El plan de emergencias se hace por sede y el Comité de Convivencia se conforma por centro de trabajo.", normas: ["Decreto 1072/2015 art. 2.2.4.6.25", "Res. 3461/2025"] },

  // ── Peligros especiales y estado actual ──
  disparadores: { titulo: "Peligros especiales", que: "Situaciones que la ley regula con normas propias (alturas, químicos, espacios confinados…).", para: "Cada una activa documentos, programas, capacitaciones y normas específicas. Si la matriz detecta alguno que no marcó, el sistema lo activa y le avisa." },
  estadoActual: { titulo: "Estado actual", que: "Lo que la empresa ya tiene funcionando hoy.", para: "Precarga la evaluación inicial: lo marcado queda como “cumple”. Después se verifica ítem por ítem con evidencias.", normas: ["Decreto 1072/2015 art. 2.2.4.6.16"] },

  // ── Responsable / profesional ──
  respNombre: { titulo: "Responsable del SG-SST", que: "Persona que diseña y administra el SG-SST de la empresa. Puede ser usted como asesora externa o alguien de la empresa.", para: "Firma el plan anual y figura en la designación (DOC-03).", normas: ["Decreto 1072/2015 art. 2.2.4.6.8 num. 10"] },
  perfil: {
    titulo: "Perfil", que: "Nivel de formación en Seguridad y Salud en el Trabajo.", para: "La norma exige un perfil mínimo según el nivel de estándares de cada empresa.",
    opciones: [
      { valor: "tecnico", etiqueta: "Técnico en SST", explica: "Puede diseñar el SG-SST de empresas de 7 estándares (con 1 año de experiencia)." },
      { valor: "tecnologo", etiqueta: "Tecnólogo en SST", explica: "Empresas de 7 y 21 estándares (con 2 años de experiencia)." },
      { valor: "profesional", etiqueta: "Profesional en SST", explica: "Empresas de cualquier nivel (7, 21 y 60)." },
      { valor: "especialista", etiqueta: "Profesional con posgrado en SST", explica: "Empresas de cualquier nivel." },
    ],
    normas: ["Res. 0312/2019 arts. 4, 10 y 17"],
  },
  licencia: { titulo: "Licencia en SST", que: "Número de la resolución que otorga la licencia para prestar servicios en SST.", para: "Es obligatoria para diseñar el SG-SST y aparece en la firma “Elaboró”.", donde: "Resolución expedida por la Secretaría de Salud (desde 2025, trámite digital).", normas: ["Res. 908/2025"] },
  licenciaFecha: { titulo: "Fecha de la licencia", que: "Fecha de expedición de la licencia.", para: "Permite verificar vigencia." },
  curso50h: { titulo: "Curso virtual de 50 horas", que: "Curso gratuito del Ministerio del Trabajo sobre el SG-SST (o su actualización de 20 horas).", para: "Es obligatorio para el responsable del SG-SST y es un ítem de la evaluación (1.2.3).", donde: "Certificado del curso (plataforma del SENA o de la ARL).", normas: ["Decreto 1072/2015 art. 2.2.4.6.35", "Res. 4927/2016"] },
  cargoProfesional: { titulo: "Cargo o vínculo", que: "Cómo se relaciona con la empresa.", ejemplo: "Asesora externa en SST" },

  // ── Matriz ──
  nd: { titulo: "Nivel de deficiencia (ND)", que: "Qué tan buenos son los controles que ya existen para este peligro.", opciones: [
    { valor: "10", etiqueta: "10 · Muy alto", explica: "No hay controles o no sirven; es casi seguro que pase algo." },
    { valor: "6", etiqueta: "6 · Alto", explica: "Hay controles pero son poco eficaces." },
    { valor: "2", etiqueta: "2 · Medio", explica: "Los controles funcionan a medias." },
    { valor: "0", etiqueta: "Bajo (sin valor)", explica: "Los controles son eficaces; el riesgo se considera aceptable." },
  ], normas: ["GTC 45 tabla 2"] },
  ne: { titulo: "Nivel de exposición (NE)", que: "Con qué frecuencia y por cuánto tiempo las personas están expuestas.", opciones: [
    { valor: "4", etiqueta: "4 · Continua", explica: "Varias veces al día, por tiempo prolongado." },
    { valor: "3", etiqueta: "3 · Frecuente", explica: "Varias veces al día, por poco tiempo." },
    { valor: "2", etiqueta: "2 · Ocasional", explica: "Alguna vez al día, por poco tiempo." },
    { valor: "1", etiqueta: "1 · Esporádica", explica: "De vez en cuando." },
  ], normas: ["GTC 45 tabla 3"] },
  nc: { titulo: "Nivel de consecuencia (NC)", que: "Qué tan grave sería el daño más probable si el peligro se materializa.", opciones: [
    { valor: "100", etiqueta: "100 · Mortal o catastrófico", explica: "Muerte." },
    { valor: "60", etiqueta: "60 · Muy grave", explica: "Lesión permanente o invalidez." },
    { valor: "25", etiqueta: "25 · Grave", explica: "Incapacidad temporal." },
    { valor: "10", etiqueta: "10 · Leve", explica: "Sin incapacidad." },
  ], normas: ["GTC 45 tabla 6"] },
  clasificacionPeligro: { titulo: "Clasificación del peligro", que: "Familia a la que pertenece el peligro según la GTC 45.", para: "Agrupa los peligros en la matriz y define qué programa de vigilancia o capacitación aplica.", opciones: [
    { valor: "Biologico", etiqueta: "Biológico", explica: "Virus, bacterias, hongos, fluidos corporales, picaduras o mordeduras." },
    { valor: "Fisico", etiqueta: "Físico", explica: "Ruido, iluminación, vibración, temperaturas extremas, radiaciones." },
    { valor: "Quimico", etiqueta: "Químico", explica: "Polvos, gases, vapores, humos, líquidos (aseo, pinturas, solventes)." },
    { valor: "Psicosocial", etiqueta: "Psicosocial", explica: "Carga mental, jornada, atención al público, gestión organizacional." },
    { valor: "Biomecanico", etiqueta: "Biomecánico", explica: "Posturas, movimientos repetitivos, manipulación de cargas, esfuerzo." },
    { valor: "Condiciones de seguridad", etiqueta: "Condiciones de seguridad", explica: "Mecánico, eléctrico, locativo, alturas, tránsito, públicos, incendio." },
    { valor: "Fenomenos naturales", etiqueta: "Fenómenos naturales", explica: "Sismo, inundación, vendaval, tormentas eléctricas." },
  ], normas: ["GTC 45 anexo A"] },
  descripcionPeligro: { titulo: "Peligro", que: "Fuente, situación o acto con potencial de causar daño, descrito de forma concreta.", ejemplo: "Levantamiento y transporte manual de cargas", normas: ["GTC 45 numeral 2"] },
  efectos: { titulo: "Efectos posibles", que: "Daños a la salud que podría causar el peligro.", para: "Ayudan a definir la consecuencia (NC) y los exámenes médicos de vigilancia.", ejemplo: "Lumbalgia, hernia discal, esguinces" },
  nr: { titulo: "Nivel de riesgo (NR)", que: "Resultado de multiplicar ND × NE × NC.", para: "Se ubica en una de cuatro franjas y define qué tan urgente es intervenir.", opciones: [
    { valor: "I", etiqueta: "I · 600 a 4000", explica: "No aceptable. Situación crítica: suspender hasta controlar." },
    { valor: "II", etiqueta: "II · 150 a 500", explica: "No aceptable o aceptable con control específico. Corregir de inmediato." },
    { valor: "III", etiqueta: "III · 40 a 120", explica: "Mejorable. Intervenir si es posible." },
    { valor: "IV", etiqueta: "IV · 20", explica: "Aceptable. Mantener los controles." },
  ], normas: ["GTC 45 tablas 7 y 8"] },
  nivelSugerido: { titulo: "Nivel sugerido", que: "El nivel de riesgo que resulta con los valores por defecto de la biblioteca.", para: "Es solo el punto de partida: en cada empresa la consultora ajusta ND, NE y NC según lo que observa, y el nivel cambia." },
  usos: { titulo: "Usos", que: "En cuántas tareas de la biblioteca está este peligro y en cuántas matrices de empresas se ha usado.", para: "Muestra qué tanto depende el sistema de este peligro antes de modificarlo." },
  validado: { titulo: "Validado", que: "Indica que la consultora revisó y aprobó este peligro y sus valores.", para: "La biblioteca inicial viene sin validar. Lo que se guarda desde una matriz queda validado. Así se sabe qué conocimiento ya pasó por criterio profesional." },
  eppSugerido: { titulo: "EPP sugeridos", que: "Elementos de protección personal que controlan este peligro, uno por línea.", para: "Se suman por cargo para armar la matriz de EPP (MTZ-04). Son el último recurso de la jerarquía de controles.", ejemplo: "Guantes de nitrilo\nGafas de seguridad", normas: ["Res. 2400/1979"] },
  examenesSugeridos: { titulo: "Exámenes médicos", que: "Evaluaciones médicas que vigilan los efectos de este peligro, una por línea.", para: "Se suman por cargo para armar el profesiograma (DOC-07) que valida el médico de la IPS.", ejemplo: "Audiometría tamiz", normas: ["Res. 1843/2025"] },
  capacitacionesSugeridas: { titulo: "Capacitaciones", que: "Temas que deben recibir quienes están expuestos, uno por línea.", para: "Pasan al programa de capacitación (PRG-01) y al plan anual.", normas: ["Decreto 1072/2015 art. 2.2.4.6.11"] },
  normasPeligro: { titulo: "Normas del peligro", que: "Códigos de las normas que regulan este peligro (ver Normas y estándares), uno por línea.", para: "Se agregan a la matriz legal de la empresa. Algunas activan peligros especiales; por ejemplo, RES-4272-2021 activa trabajo en alturas.", ejemplo: "RES-8321-1983" },
  medidaIngenieria: { titulo: "Controles de ingeniería", que: "Cambios físicos que aíslan o reducen el peligro sin depender del trabajador.", ejemplo: "Guardas en máquinas, extracción localizada, ayudas mecánicas", normas: ["GTC 45 tabla 10", "Decreto 1072/2015 art. 2.2.4.6.24"] },
  medidaAdministrativa: { titulo: "Controles administrativos", que: "Procedimientos, señalización, capacitación, pausas, rotación e inspecciones.", ejemplo: "Pausas activas cada 2 horas; procedimiento de trabajo seguro", normas: ["GTC 45 tabla 10"] },
  controlesFuente: { titulo: "Controles existentes en la fuente", que: "Lo que ya se hace sobre el origen del peligro.", ejemplo: "Máquina con guarda; mantenimiento preventivo", normas: ["GTC 45 numeral 3.4"] },
  controlesMedio: { titulo: "Controles existentes en el medio", que: "Lo que ya se hace entre el peligro y la persona.", ejemplo: "Barreras, ventilación, señalización", normas: ["GTC 45 numeral 3.4"] },
  controlesIndividuo: { titulo: "Controles existentes en el individuo", que: "Lo que ya se hace sobre la persona.", ejemplo: "EPP entregados, capacitación recibida, exámenes", normas: ["GTC 45 numeral 3.4"] },
  medidaEliminacion: { titulo: "Eliminación", que: "Quitar el peligro por completo. Es la medida más eficaz de la jerarquía de controles.", ejemplo: "Eliminar la tarea en alturas instalando el equipo a nivel del piso", normas: ["Decreto 1072/2015 art. 2.2.4.6.24"] },
  medidaSustitucion: { titulo: "Sustitución", que: "Reemplazar el peligro por otro menor.", ejemplo: "Cambiar un solvente por un producto base agua", normas: ["Decreto 1072/2015 art. 2.2.4.6.24"] },
  medidaEpp: { titulo: "EPP", que: "Elementos de protección personal. Es la última opción de la jerarquía de controles: protege a la persona, pero no quita el peligro.", normas: ["Decreto 1072/2015 art. 2.2.4.6.24"] },
  origenPeligro: { titulo: "Origen del peligro", que: "De dónde viene el peligro en esta empresa.", opciones: [
    { valor: "tarea", etiqueta: "Tarea", explica: "Lo sufren quienes hacen la tarea." },
    { valor: "zona", etiqueta: "Zona", explica: "Lo sufre todo el que trabaja en ese lugar (sismo, incendio, pisos)." },
    { valor: "cargo", etiqueta: "Cargo", explica: "Viene del cargo en sí (carga mental, jornada)." },
  ] },
  lugarTarea: { titulo: "Proceso, zona y tarea", que: "Dónde y en qué actividad aparece el peligro, en el orden que pide la GTC 45: proceso → zona → actividad → tarea.", normas: ["GTC 45 numeral 3.2"] },
  expuestos: { titulo: "Expuestos", que: "Número de personas que pueden sufrir el peligro.", para: "Es un criterio para priorizar controles: a más expuestos, más urgente.", normas: ["GTC 45 numeral 3.6"] },
  sectoresBiblioteca: { titulo: "Sectores, cargos y tareas", que: "Paquetes típicos por tipo de empresa: procesos, cargos y las tareas de cada cargo.", para: "Al crear una empresa del sector, todo esto se precarga y cada tarea trae sus peligros." },
  funciones: { titulo: "Funciones del cargo", que: "Lo que hace la persona en su día, en palabras sencillas.", para: "Con este texto el sistema sugiere tareas y peligros (con IA o buscando en la biblioteca).", ejemplo: "Recibe mercancía, la sube a estantes con escalera, maneja montacargas, hace inventarios." },
  nPersonas: { titulo: "Personas en el cargo", que: "Cuántas personas ocupan este cargo.", para: "Se suman para calcular las personas expuestas a cada peligro." },

  // ── Indicadores y eventos ──
  trabajadoresMes: { titulo: "Trabajadores del mes", que: "Número de personas que trabajaron en el mes, incluidos contratistas, estudiantes y trabajadores en misión.", para: "Es el denominador de la frecuencia y severidad de accidentalidad.", donde: "Planilla PILA del mes más contratistas vigentes.", normas: ["Res. 0312/2019 art. 30"] },
  diasProgramados: { titulo: "Días de trabajo programados", que: "Suma de los días que debía trabajar cada persona en el mes.", para: "Es el denominador del ausentismo. Si lo deja vacío, se estima como trabajadores × 24 días.", ejemplo: "30 trabajadores × 24 días = 720" },
  tipoEvento: { titulo: "Tipo de evento", que: "Qué ocurrió.", opciones: [
    { valor: "AT", etiqueta: "Accidente de trabajo", explica: "Suceso repentino por causa o con ocasión del trabajo que produce una lesión (Ley 1562/2012 art. 3). Reportar a la ARL en 2 días hábiles." },
    { valor: "INCIDENTE", etiqueta: "Incidente", explica: "Pudo ser un accidente pero no hubo lesión. Se investiga igual." },
    { valor: "EL", etiqueta: "Enfermedad laboral", explica: "Diagnosticada por la EPS o la ARL como de origen laboral." },
    { valor: "AUSENTISMO", etiqueta: "Ausentismo por enfermedad común", explica: "Incapacidad médica de origen común; cuenta para el indicador de ausentismo." },
  ], normas: ["Ley 1562/2012 art. 3", "Res. 1401/2007"] },
  diasIncapacidad: { titulo: "Días de incapacidad", que: "Días que la persona no pudo trabajar según la incapacidad médica.", para: "Suman a la severidad (accidentes) y al ausentismo.", donde: "Certificado de incapacidad de la EPS o la ARL." },

  calificacion: { titulo: "Calificación del estándar", que: "Si la empresa cumple el ítem, con evidencia que lo demuestre.", para: "Suma los puntos del ítem al puntaje de la autoevaluación.", opciones: [
    { valor: "CUMPLE", etiqueta: "Cumple", explica: "Existe la evidencia que pide el modo de verificación. Suma todos los puntos." },
    { valor: "NO_CUMPLE", etiqueta: "No cumple", explica: "No hay evidencia o está incompleta. Suma cero y genera una acción en el plan de mejoramiento." },
    { valor: "NO_APLICA", etiqueta: "No aplica", explica: "El ítem no corresponde a la empresa (por ejemplo, no hay sustancias carcinógenas). Exige justificación escrita y suma todos los puntos." },
  ], normas: ["Res. 0312/2019 art. 27"] },

  // ── Comités ──
  rolComite: { titulo: "Rol en el comité", que: "Función de la persona en el comité.", opciones: [
    { valor: "presidente", etiqueta: "Presidente", explica: "Lo designa el empleador (COPASST) o lo elige el comité (convivencia)." },
    { valor: "secretario", etiqueta: "Secretario", explica: "Lo elige el comité; lleva las actas." },
    { valor: "principal", etiqueta: "Principal", explica: "Miembro con voz y voto." },
    { valor: "suplente", etiqueta: "Suplente", explica: "Reemplaza al principal en sus ausencias." },
    { valor: "vigia", etiqueta: "Vigía", explica: "Para empresas de menos de 10 trabajadores." },
    { valor: "jefe_brigada", etiqueta: "Jefe de brigada", explica: "Coordina la brigada en una emergencia." },
    { valor: "brigadista", etiqueta: "Brigadista", explica: "Voluntario capacitado en primeros auxilios, incendios o evacuación." },
  ], normas: ["Res. 2013/1986", "Res. 3461/2025"] },
  representa: { titulo: "A quién representa", que: "En los comités paritarios hay representantes del empleador (los designa la empresa) y de los trabajadores (elegidos por votación).", normas: ["Res. 2013/1986 art. 2"] },
};

// ───────── Accidentes, incidentes y enfermedades laborales ─────────
Object.assign(AYUDA, {
  evTipo: { titulo: "Tipo de evento", que: "Qué ocurrió.", para: "Define si se reporta a la ARL, si se investiga y qué indicadores alimenta.", opciones: [
    { valor: "AT", etiqueta: "Accidente de trabajo", explica: "Hubo lesión, perturbación funcional o psiquiátrica, invalidez o muerte por causa o con ocasión del trabajo. Se reporta (FURAT) y se investiga." },
    { valor: "INCIDENTE", etiqueta: "Incidente", explica: "No hubo lesionados, o solo primeros auxilios, o hubo daños materiales. No se reporta a la ARL, pero sí se investiga." },
    { valor: "EL", etiqueta: "Enfermedad laboral", explica: "Calificada como laboral por la EPS, ARL o junta. Se reporta (FUREL) y se investiga." },
    { valor: "AUSENTISMO", etiqueta: "Ausentismo por enfermedad común", explica: "Incapacidad de origen común. Solo para el indicador de ausentismo." },
  ], normas: ["Ley 1562/2012 arts. 3 y 4", "Res. 1401/2007 art. 3"] },
  evGravedad: { titulo: "Gravedad del accidente", que: "Clasificación del accidente según la lesión.", para: "Los graves y mortales tienen obligaciones adicionales: aviso al Ministerio del Trabajo, profesional con licencia en el equipo investigador y remisión del informe a la ARL.", opciones: [
    { valor: "leve", etiqueta: "Leve", explica: "No cumple los criterios de grave." },
    { valor: "grave", etiqueta: "Grave", explica: "Amputación; fractura de huesos largos; trauma craneoencefálico; quemaduras de segundo y tercer grado; lesiones severas de mano o de columna con compromiso de médula; lesiones oculares o auditivas que comprometan la función." },
    { valor: "mortal", etiqueta: "Mortal", explica: "Causa la muerte del trabajador." },
  ], normas: ["Res. 1401/2007 art. 3"] },
  evVinculacion: { titulo: "Tipo de vinculación", que: "Relación de la persona con la empresa.", para: "Los contratistas y trabajadores en misión también cuentan en los indicadores y deben investigarse.", normas: ["Res. 0312/2019 art. 30"] },
  evMecanismo: { titulo: "Forma del evento", que: "Cómo ocurrió: el tipo de contacto que produjo la lesión (caída, golpe, atrapamiento…).", para: "Permite analizar tendencias en el registro estadístico (FOR-08) y orienta las causas probables.", donde: "Relato del trabajador y de los testigos; el FURAT pide un dato equivalente." },
  evAgente: { titulo: "Agente", que: "El objeto, equipo, sustancia o condición que causó la lesión.", donde: "Relato del evento y visita al sitio." },
  evLesion: { titulo: "Tipo de lesión", que: "Naturaleza de la lesión (herida, golpe, fractura…).", para: "Estadística de accidentalidad. No escriba diagnósticos médicos: la historia clínica es dato sensible.", normas: ["Ley 1581/2012"] },
  evParte: { titulo: "Parte del cuerpo afectada", que: "Zona del cuerpo lesionada.", para: "Muestra dónde reforzar controles y EPP." },
  evDias: { titulo: "Días de incapacidad", que: "Días de incapacidad médica otorgados por el accidente o la enfermedad.", para: "Alimenta el índice de severidad (Res. 0312/2019 art. 30).", donde: "Certificado de incapacidad." },
  evDiasCargados: { titulo: "Días cargados", que: "Días que se suman por secuelas permanentes (amputación, pérdida de capacidad, muerte) según la tabla de días cargados.", para: "Índice de severidad. Si no hubo secuelas, deje 0.", normas: ["Res. 0312/2019 art. 30"] },
  evFurat: { titulo: "Reporte a la ARL (FURAT / FUREL)", que: "Formulario Único de Reporte de Accidente de Trabajo (FURAT) o de Enfermedad Laboral (FUREL) radicado ante la ARL y la EPS.", para: "Es obligatorio dentro de los dos días hábiles siguientes al accidente o al diagnóstico de la enfermedad laboral.", donde: "Plataforma o línea de atención de la ARL; guarde el número de radicado y suba el soporte.", normas: ["Decreto Ley 1295/1994 art. 62"] },
  evEquipo: { titulo: "Equipo investigador", que: "Personas que investigan el evento.", para: "Mínimo: jefe inmediato o supervisor, un representante del COPASST o Vigía y el responsable del SG-SST. En accidentes graves o mortales participa un profesional con licencia en SST.", normas: ["Res. 1401/2007 art. 7"] },
  evPorques: { titulo: "Análisis de los porqués", que: "Preguntar “¿por qué?” sucesivamente, desde el hecho hasta la causa raíz (normalmente 3 a 5 veces).", ejemplo: "Se cortó la mano → la cuchilla no tenía guarda → la guarda se retiró para limpiar → no hay procedimiento de limpieza segura." },
  evInmediatas: { titulo: "Causas inmediatas", que: "Lo que ocurrió justo antes del evento.", para: "Actos subestándar (lo que hizo o dejó de hacer la persona) y condiciones subestándar (estado del lugar, equipo o ambiente).", normas: ["Res. 1401/2007"] },
  evBasicas: { titulo: "Causas básicas", que: "Por qué existieron los actos y las condiciones subestándar.", para: "Factores personales (capacidad, conocimiento, motivación, fatiga) y factores del trabajo (supervisión, ingeniería, compras, mantenimiento, procedimientos). Las medidas deben atacar estas causas.", normas: ["Res. 1401/2007"] },
  evPeligro: { titulo: "Peligro relacionado", que: "El peligro de la matriz (GTC 45) que se materializó.", para: "Si el peligro no estaba en la matriz del cargo, se agrega para valorarlo; si estaba, se revisan su valoración y sus controles.", normas: ["GTC 45", "Decreto 1072/2015 art. 2.2.4.6.15"] },
  evLecciones: { titulo: "Lecciones aprendidas", que: "Lo que todos deben saber para que no se repita.", para: "Se divulgan a los trabajadores y al COPASST o Vigía.", normas: ["Decreto 1072/2015 art. 2.2.4.6.32"] },
  evJerarquia: { titulo: "Jerarquía de controles", que: "Orden en que se prefieren las medidas: primero eliminar el peligro, luego sustituirlo, después controles de ingeniería, administrativos y, por último, EPP.", normas: ["Decreto 1072/2015 art. 2.2.4.6.24"] },
  evEficacia: { titulo: "Verificación de eficacia", que: "Cómo se comprobó que la acción funcionó (inspección, medición, seguimiento sin repetición del evento).", normas: ["Decreto 1072/2015 art. 2.2.4.6.33"] },
});

Object.assign(AYUDA, {
  documentoIdentidad: { titulo: "Documento de identidad", que: "Tipo y número del documento de la persona.", para: "Aparece debajo de su firma y en las actas, con su abreviatura (C.C., C.E., Pasaporte…).", opciones: [
    { valor: "CC", etiqueta: "C.C. — Cédula de ciudadanía", explica: "Colombianos mayores de edad." },
    { valor: "CE", etiqueta: "C.E. — Cédula de extranjería", explica: "Extranjeros residentes." },
    { valor: "PA", etiqueta: "Pasaporte", explica: "Extranjeros sin cédula de extranjería." },
    { valor: "PPT", etiqueta: "PPT — Permiso por Protección Temporal", explica: "Migrantes venezolanos con el estatuto temporal de protección." },
    { valor: "PEP", etiqueta: "PEP — Permiso Especial de Permanencia", explica: "Permiso anterior al PPT, mientras esté vigente." },
    { valor: "TI", etiqueta: "T.I. — Tarjeta de identidad", explica: "Menores de edad (por ejemplo, aprendices)." },
  ] },
});
