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
  representanteCedula: { titulo: "Cédula del representante legal", que: "Número de cédula de quien firma.", para: "Va debajo de la firma en la política y las designaciones." },
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
