// Manual de ayuda por sección. Se muestra en el panel "Ayuda" del encabezado según la pantalla.
// Fuente única: si cambia una pantalla, se actualiza aquí su explicación.

export type Boton = { nombre: string; hace: string };
export type Parte = { titulo: string; que: string; botones?: Boton[] };
export type SeccionManual = {
  id: string; titulo: string; ruta: RegExp; resumen: string;
  partes: Parte[]; pasos?: string[]; consejos?: string[]; normas?: string[]; relacionadas?: string[];
};

const E = "/empresas/[^/]+";

export const MANUAL: SeccionManual[] = [
  {
    id: "inicio", titulo: "Tablero de la consultora (inicio)", ruta: /^\/$/,
    resumen: "Su cartera de clientes de un vistazo: indicadores, lo vencido y lo próximo de todas las empresas, y a quién atender primero.",
    partes: [
      { titulo: "Indicadores de la cartera", que: "Empresas y trabajadores cubiertos, cumplimiento promedio de estándares, empresas en estado crítico, avance del plan anual de toda la cartera, documentos firmados y fechas vencidas." },
      { titulo: "Atención: vencidos y próximos 14 días", que: "Las fechas del planeador que requieren acción pronto, de todas las empresas. Clic para ir a resolverla.", botones: [{ nombre: "Planeador", hace: "Abre el planeador completo." }] },
      { titulo: "Prioridad por empresa", que: "Empresas ordenadas por urgencia: plazos de accidentes, estado crítico, sin autoevaluación, acciones y actividades vencidas, matriz desactualizada, documentos por firmar o sin generar." },
      { titulo: "Tabla de empresas", que: "Riesgo, trabajadores, nivel, resultado de estándares, avance del plan, peligros prioritarios, documentos firmados y número de pendientes (pase el mouse para ver cuáles).", botones: [{ nombre: "Nombre de la empresa", hace: "Abre el Resumen de la empresa." }, { nombre: "Nueva empresa", hace: "Abre el cuestionario para crear una empresa." }] },
      { titulo: "Cartera por nivel y riesgo", que: "Cuántas empresas tiene en cada nivel de estándares (7, 21, 60) y clase de riesgo." },
    ],
    relacionadas: ["planeador", "nueva", "resumen"],
  },
  {
    id: "nueva", titulo: "Nueva empresa / Datos de la empresa", ruta: new RegExp(`^(/empresas/nueva|${E}/datos)$`),
    resumen: "Cuestionario con los datos que definen todo el SG-SST: actividad, riesgo, trabajadores, sedes, peligros especiales y responsable. En “Datos” se edita lo mismo después de creada.",
    partes: [
      { titulo: "Responsable del SG-SST", que: "Nombre, documento, perfil, licencia, curso de 50 horas y su fecha, fecha del último curso de 20 horas, rol (diseña y firma, o solo administra y ejecuta) y años de experiencia certificada. El sistema avisa si el perfil no alcanza para el nivel (técnico: 1 año de experiencia para 7 estándares; tecnólogo: 2 años para 21), si falta licencia a quien diseña y si el curso de 50 horas tiene más de 3 años sin actualización de 20 horas." },
      { titulo: "Personas y vehículos", que: "Planta, en misión, contratistas, aprendices, vehículos y conductores. Cada campo indica el umbral que dispara una obligación (10 o más: COPASST y reglamento; 11 a 50: 21 estándares; más de 10 vehículos o 2 o más conductores: PESV; contratistas: afiliación a ARL por el contratante; aprendices: ARL desde la fase lectiva). Las marcas por persona en Trabajadores complementan estos números." },
      { titulo: "1. Identificación", que: "Razón social, NIT, dirección, representante legal y logo (el logo aparece en todos los Word y Excel)." },
      { titulo: "2. Actividad y riesgo", que: "Código CIIU, clase de riesgo según la ARL, ARL y EPS. Definen el sector de la biblioteca (cargos, tareas y peligros típicos)." },
      { titulo: "3. Personas y cargos", que: "Número de trabajadores, contratistas, aprendices y en misión, horario y turnos, y los cargos con cuántas personas tiene cada uno.", botones: [{ nombre: "Agregar cargo", hace: "Agrega un cargo; si coincide con un cargo tipo de la biblioteca, trae sus tareas y peligros." }] },
      { titulo: "4. Sedes", que: "Centros de trabajo. El Comité de Convivencia se conforma por centro de trabajo.", botones: [{ nombre: "Agregar sede", hace: "Agrega otro centro de trabajo." }] },
      { titulo: "5. Peligros especiales", que: "Alturas, espacios confinados, químicos, trabajo nocturno, vehículos… Cada opción activa normas, programas, documentos y capacitaciones." },
      { titulo: "6. Responsable del SG-SST", que: "Nombre, cédula, licencia y curso de 50 horas. Se precarga con sus datos de “Mi consultora”; cámbielos si es otra persona.", botones: [{ nombre: "Copiar mis datos", hace: "Copia los datos de la profesional registrados en Mi consultora." }] },
      { titulo: "Datos para los documentos (solo en Datos)", que: "Contactos, emergencias, inventarios y presupuesto que el sistema no puede adivinar. Cada campo dice en qué documentos se usa.", botones: [{ nombre: "Guardar datos", hace: "Guarda y actualiza solos los documentos ya generados." }] },
    ],
    pasos: ["Llene los 6 pasos con lo que tenga; todo se puede completar después.", "Termine con «Crear y empezar el diagnóstico»: lo que la empresa ya tiene se califica ahí, estándar por estándar y con su evidencia. «Crear sin diagnóstico» es solo para empresas que ya traen su evaluación inicial.", "Al guardar, revise el Resumen: el sistema explica cada decisión en “¿Por qué? Decisiones”.", "Complete “Datos para los documentos” para que los documentos salgan sin espacios en blanco."],
    consejos: ["Los cambios en Datos actualizan solos los documentos ya generados; sus ediciones manuales se conservan.", "Cada campo tiene su ayuda (?) con qué es, de dónde sacarlo y sus opciones."],
    normas: ["Res. 0312/2019 arts. 3, 9 y 16", "Decreto 1072/2015 cap. 6"],
    relacionadas: ["resumen", "documentos"],
  },
  {
    id: "resumen", titulo: "Resumen de la empresa", ruta: new RegExp(`^${E}$`),
    resumen: "Tablero de la empresa: la ruta de implementación con el siguiente paso, qué le exige la norma, su avance y las alertas.",
    partes: [
      { titulo: "Ruta de implementación", que: "Los 10 pasos para montar y operar el SG-SST en orden (diagnóstico, datos, matriz, trabajadores, comités, documentos, plan anual, inducción y exámenes, operación y cierre del año). Cada paso se cumple solo con lo que se registra; la tarjeta muestra el siguiente paso, lo que falta y un botón para ir. Es orientativa: se puede trabajar en cualquier pestaña. En la pestaña del paso actual aparece una línea con lo que falta.", botones: [{ nombre: "Ver ruta completa", hace: "Abre el panel con los 10 pasos, su estado y lo que falta en cada uno." }, { nombre: "Ir a …", hace: "Lleva a la pantalla donde se trabaja el siguiente paso." }] },
      { titulo: "¿Por qué? Decisiones → 9. Qué dato dispara cada condición", que: "Lista todas las reglas y normas condicionadas: si aplican o no, cómo se lee la condición, qué valor tiene hoy la empresa (vehículos, conductores, contratistas, aprendices, trabajadoras, sedes, peligros especiales), qué la activaría y en qué pantalla se registra ese dato. Úselo para explicar al cliente por qué le exigen algo o por qué todavía no." },
      { titulo: "Encabezado", que: "Nombre, NIT, nivel de estándares, clase de riesgo, trabajadores y ciudad. Las pestañas de abajo llevan a cada parte del SG-SST.", botones: [{ nombre: "¿Por qué? Decisiones", hace: "Abre el panel con cada decisión que tomó el sistema (nivel, comités, normas, documentos) y la norma que la define." }] },
      { titulo: "Indicadores", que: "Estándares mínimos, última evaluación, riesgos prioritarios (I y II), documentos y avance del plan anual. Pase el mouse para ver de dónde sale cada dato." },
      { titulo: "Alertas", que: "Plazos de accidentes vencidos o por vencer, y otros pendientes. Cada alerta lleva a donde se resuelve." },
      { titulo: "Qué exige la norma a esta empresa", que: "Comités, programas y normas que aplican, con su razón." },
      { titulo: "Accesos y informe de gestión", que: "Botones a matriz, evaluación, documentos y plan.", botones: [{ nombre: "Informe de gestión", hace: "Informe para la gerencia del cliente (PDF con membrete de la consultora, o Word editable) del periodo elegido: mensual, trimestral, semestral, anual o acumulado desde el inicio. Trae resumen ejecutivo, en qué punto va la implementación, logros del periodo con fechas (documentos firmados, capacitaciones, inspecciones, comités, investigaciones y acciones cerradas), visitas y horas de la consultora, plan, accidentalidad, qué sigue en los próximos 60 días y los compromisos de la empresa."}] },
      { titulo: "Próximas actividades del plan anual", que: "Lo que viene en el plan.", botones: [{ nombre: "Ver plan", hace: "Abre el plan anual." }] },
    ],
    relacionadas: ["matriz", "evaluacion", "plan", "documentos"],
  },
  {
    id: "matriz", titulo: "Cargos y matriz de peligros", ruta: new RegExp(`^${E}/matriz$`),
    resumen: "Se construye la matriz de peligros (GTC 45) a partir de los cargos: cada cargo tiene tareas y cada tarea tiene sus peligros. También hay peligros por zona (lugar) y por cargo.",
    partes: [
      { titulo: "Barra de acciones", que: "Acciones sobre toda la matriz.", botones: [
        { nombre: "Aprobar N sugeridos", hace: "Aprueba de una vez los peligros sugeridos por la biblioteca o la IA. Solo los aprobados cuentan en la matriz y en los documentos." },
        { nombre: "Completar procesos y zonas del sector", hace: "Agrega las zonas y procesos típicos del sector que le falten a la empresa; los peligros de las zonas nuevas llegan como sugeridos. No duplica ni borra nada." },
        { nombre: "Excel GTC 45", hace: "Descarga la matriz vigente en Excel con todas las columnas de la GTC 45." },
        { nombre: "Versiones", hace: "Abre el historial de versiones cerradas: verlas, descargarlas y compararlas con la vigente." },
        { nombre: "Cerrar versión", hace: "Congela la matriz como está hoy (versión numerada con fecha, motivo y quién la cerró) y actualiza el MTZ-02. Hágalo al aprobarla, cada año y después de cambios o de un accidente mortal." },
      ] },
      { titulo: "Avisos de actualización", que: "Indican si la matriz debe actualizarse: más de un año sin cerrar versión, accidente mortal (obligatorio) o grave (recomendado)." },
      { titulo: "Cargos", que: "Cada cargo con sus personas, funciones y tareas.", botones: [
        { nombre: "Agregar cargo", hace: "Crea un cargo; puede partir de un cargo tipo de la biblioteca." },
        { nombre: "Aplicar tareas de un cargo tipo", hace: "Trae las tareas y peligros de un cargo de la biblioteca." },
        { nombre: "Agregar tarea", hace: "Busca una tarea en la biblioteca (con sus peligros) o crea una nueva." },
        { nombre: "Sugerir tareas y peligros", hace: "A partir de las funciones del cargo, la IA (o la biblioteca si no hay IA) propone tareas y peligros como sugeridos." },
        { nombre: "Guardar en biblioteca", hace: "Guarda el cargo, la tarea o el peligro en la biblioteca de esta empresa o en la general, para reutilizarlo." },
      ] },
      { titulo: "Procesos y zonas", que: "Organizan dónde y en qué proceso se hace cada tarea. Los peligros de una zona aplican a todos los que trabajan allí.", botones: [{ nombre: "Agregar proceso / zona", hace: "Crea un proceso o trae una zona de la biblioteca con sus peligros." }] },
      { titulo: "Tabla de la matriz", que: "Cada peligro con su valoración. ND (deficiencia) × NE (exposición) = NP; NP × NC (consecuencia) = NR, que da el nivel I a IV. Pase el mouse sobre el nivel para ver el cálculo y sobre los expuestos para ver de qué cargos salen.", botones: [
        { nombre: "Selectores ND, NE, NC", hace: "Ajuste según lo que observe en la empresa; el nivel se recalcula." },
        { nombre: "Fila (clic)", hace: "Despliega el detalle: efectos, controles existentes y medidas de intervención por jerarquía." },
        { nombre: "Aprobar / quitar", hace: "Aprueba un peligro sugerido o lo quita de la matriz." },
      ] },
    ],
    pasos: ["Revise que estén todos los cargos con su número de personas.", "Complete las tareas de cada cargo (biblioteca, cargo tipo o sugerencia).", "Revise los peligros sugeridos y ajuste ND, NE y NC.", "Apruebe los sugeridos.", "Cierre la versión inicial.", "Descargue el Excel o genere los documentos."],
    consejos: ["Los riesgos I y II (rojo y naranja) alimentan el plan anual, los programas y las capacitaciones.", "Si un accidente revela un peligro que no estaba, desde la investigación se puede agregar a la matriz del cargo."],
    normas: ["GTC 45", "Decreto 1072/2015 art. 2.2.4.6.15", "Res. 0312/2019 estándares 4.1.1 y 4.1.2"],
    relacionadas: ["versiones", "biblioteca-propia", "accidentes"],
  },
  {
    id: "trabajadores", titulo: "Trabajadores", ruta: new RegExp(`^${E}/trabajadores$`),
    resumen: "Listado de trabajadores de la empresa con sus exámenes médicos (solo conceptos de aptitud), entregas de EPP y capacitaciones. Alimenta FOR-01 (perfil sociodemográfico), FOR-02 (conceptos de aptitud), MTZ-04 (entrega de EPP), PRG-01 (capacitaciones) y el planeador.",
    partes: [
      { titulo: "Condiciones que activan normas (por persona)", que: "En cada trabajador se marca si conduce para la empresa, su modalidad (presencial, teletrabajo, remoto o trabajo en casa), si trabaja de noche o por turnos, si manipula alimentos y si está en actividad de alto riesgo pensional; además el sexo. Con esas marcas el sistema deriva las condiciones: 2 o más conductores exigen el PESV; teletrabajo o trabajo en casa activan sus normas; el turno nocturno entra a la matriz y a la batería; manipular alimentos exige certificado médico anual; el alto riesgo exige cotización especial; más de 50 trabajadoras exigen sala de lactancia. Si el número registrado aquí supera el del cuestionario de Datos, manda el de aquí." },
      { titulo: "Indicadores", que: "Trabajadores activos (y si coinciden con las personas de los cargos), exámenes vencidos o faltantes, cobertura de capacitación y entregas de EPP." },
      { titulo: "Pestaña Trabajadores", que: "Lista con cargo, vinculación, ingreso, último examen, EPP y capacitaciones. Clic en un trabajador para ver su ficha.", botones: [
        { nombre: "Importar desde Excel", hace: "Pegue filas copiadas de Excel: nombre, documento, cargo, fecha de ingreso y vinculación. Si el documento ya existe, se actualiza." },
        { nombre: "Agregar trabajador", hace: "Registra uno a uno, con sexo, nacimiento y escolaridad para el perfil sociodemográfico." },
        { nombre: "Estetoscopio / casco / lápiz", hace: "Registrar examen médico, registrar entrega de EPP (precarga los EPP del cargo según la matriz) o editar datos." },
        { nombre: "Retirar (en la ficha)", hace: "Lo deja como retirado conservando su historial; recuerde el examen de retiro." },
      ] },
      { titulo: "Exámenes médicos", que: "Último examen de cada trabajador con su concepto, restricciones y próximo examen. Solo conceptos, nunca diagnósticos (Ley 1581/2012). El próximo examen aparece en el planeador." },
      { titulo: "Entrega de EPP", que: "Registro de entregas a uno o varios trabajadores; si indica la próxima reposición, el planeador la avisa." },
      { titulo: "Capacitaciones", que: "Cada sesión con tema, horas, facilitador y asistentes. Si la liga a una actividad del plan anual, la actividad queda ejecutada." },
    ],
    normas: ["Ley 1581/2012", "Res. 1843/2025", "Decreto 1072/2015 arts. 2.2.4.6.11 y 2.2.4.6.13", "Res. 0312/2019 estándar 3.1.1"],
    relacionadas: ["planeador", "plan", "documentos"],
  },
  {
    id: "inspecciones", titulo: "Inspecciones", ruta: new RegExp(`^${E}/inspecciones$`),
    resumen: "Inspecciones de seguridad con listas de chequeo (locativa, extintores, botiquín, EPP, herramientas, vehículos, eléctrica, orden y aseo). Los hallazgos generan acciones (FOR-06), se consolidan en el PRG-06 y el planeador avisa la próxima según la frecuencia de cada lista.",
    partes: [
      { titulo: "Nueva inspección", que: "Elija la lista de chequeo; registre fecha, lugar, responsable y quién acompañó (COPASST o Vigía).", botones: [
        { nombre: "Cumple / No cumple / N. A.", hace: "Califica cada ítem. En los que no cumplen escriba la observación y, si quiere, la acción correctiva con responsable y fecha." },
        { nombre: "Marcar pendientes como “cumple”", hace: "Califica de una vez los ítems que faltan como cumplidos." },
        { nombre: "Guardar inspección", hace: "Guarda, crea las acciones en FOR-06 y abre el detalle para subir fotos." },
      ] },
      { titulo: "Lista de inspecciones", que: "Fecha, lista, lugar, cumplimiento, hallazgos y acciones. Clic para ver el detalle, las acciones y subir fotos o el registro firmado (estándar 4.2.4)." },
    ],
    consejos: ["Las listas y su frecuencia se editan en Biblioteca → Inspecciones."],
    normas: ["Res. 0312/2019 estándar 4.2.4", "Decreto 1072/2015 art. 2.2.4.6.33"],
    relacionadas: ["planeador", "documentos"],
  },
  {
    id: "diagnostico", titulo: "Diagnóstico inicial", ruta: new RegExp(`^${E}/diagnostico(/[^/]+)?$`),
    resumen: "Primer paso antes de montar el SG-SST: evalúa el estado actual de la empresa frente a los estándares mínimos que le aplican, entrega un informe en PDF con el membrete de la consultora y su firma, y queda como línea base para medir el avance. Se abre al crear la empresa con «Crear y empezar el diagnóstico».",
    partes: [
      { titulo: "Indicadores", que: "Puntaje con la tabla de valores de la Res. 0312/2019 y su valoración (crítico, moderadamente aceptable, aceptable), estándares evaluados y cumplimiento por ciclo Planear, Hacer, Verificar y Actuar." },
      { titulo: "Lista de chequeo", que: "Los estándares agrupados por ciclo, con qué verificar y su peso.", botones: [
        { nombre: "Cumple / No cumple / No aplica", hace: "Califica el estándar. «No aplica» exige justificación; la observación de cada brecha aparece en el informe." },
        { nombre: "Pendientes → no cumple", hace: "Marca como «no cumple» lo que falte por evaluar." },
        { nombre: "Filtros", hace: "Muestra todos, los sin evaluar o solo las brechas." },
      ] },
      { titulo: "Conclusiones y soportes", que: "Conclusiones de la consultora (van antes de la firma) y fotos o soportes de la visita (quedan en Evidencias)." },
      { titulo: "Botones", que: "Acciones del diagnóstico.", botones: [
        { nombre: "Guardar / Cerrar diagnóstico", hace: "Cerrar exige todos los estándares calificados y los «no aplica» justificados." },
        { nombre: "Informe PDF", hace: "Informe membreteado por la consultora: datos, metodología, resultado con gráficas, cumplimiento por ciclo, brechas por peso, fortalezas, ruta de implementación en tres fases, conclusiones y firma de la profesional con su licencia." },
        { nombre: "Iniciar el SG-SST con este diagnóstico", hace: "Arma la matriz por cargos, crea la evaluación inicial con estas respuestas (cerrada, con su plan de mejoramiento), genera el plan anual y todos los documentos. La empresa pasa a etapa activa." },
        { nombre: "Iniciar sin diagnóstico", hace: "Monta el SG-SST sin usar el diagnóstico." },
        { nombre: "Reabrir", hace: "Permite corregir un diagnóstico cerrado mientras no haya iniciado el SG-SST." },
      ] },
      { titulo: "Seguimiento", que: "En el Resumen y en el informe mensual se compara la línea base con la última autoevaluación, global y por ciclo." },
    ],
    normas: ["Res. 0312/2019 arts. 27 y 28", "Decreto 1072/2015 art. 2.2.4.6.16"],
    relacionadas: ["evaluacion", "resumen"],
  },
  {
    id: "auditoria", titulo: "Auditoría interna", ruta: new RegExp(`^${E}/auditoria(/[^/]+)?$`),
    resumen: "Auditoría anual del SG-SST con los 13 aspectos del Decreto 1072/2015 art. 2.2.4.6.30, planificada con el COPASST o Vigía. Genera acciones (FOR-06), su informe en Word y PDF, alimenta la revisión por la dirección (ACT-06) y el planeador programa la siguiente.",
    partes: [
      { titulo: "Planificar auditoría", que: "Año, fecha, auditor (idóneo e independiente: no audita su propio trabajo), su perfil, con quién se planificó, alcance y metodología." },
      { titulo: "Aspectos auditados", que: "Cada aspecto con su criterio, sus estándares y, en gris, lo que PROCESST ya tiene registrado (documentos firmados, plan, investigaciones, inspecciones, acciones…) como punto de partida.", botones: [
        { nombre: "Conforme / Observación / No conforme / N. A.", hace: "Califica el aspecto; escriba la evidencia revisada y, si aplica, el hallazgo y la acción correctiva." },
        { nombre: "Guardar", hace: "Guarda el avance." },
        { nombre: "Cerrar auditoría", hace: "Exige todos los aspectos calificados y el hallazgo de cada no conformidad; crea las acciones en FOR-06." },
        { nombre: "Informe Word / PDF", hace: "Descarga el informe de auditoría para firmar." },
      ] },
      { titulo: "Soportes", que: "Plan de auditoría, listas diligenciadas e informe firmado; quedan en Evidencias, estándar 6.1.2." },
    ],
    normas: ["Decreto 1072/2015 arts. 2.2.4.6.29 y 2.2.4.6.30", "Res. 0312/2019 estándares 6.1.2 y 6.1.4"],
    relacionadas: ["planeador", "documentos"],
  },
  {
    id: "versiones", titulo: "Versiones de la matriz", ruta: new RegExp(`^${E}/matriz/versiones$`),
    resumen: "Historial de las versiones cerradas de la matriz. Es el soporte de que la matriz se revisa y actualiza.",
    partes: [
      { titulo: "Avisos", que: "Si la matriz debe actualizarse (más de un año, accidente mortal) o se recomienda (accidente grave)." },
      { titulo: "Lista de versiones", que: "Número, fecha, motivo, quién la cerró, total de peligros y prioritarios. Arriba aparece la vigente.", botones: [
        { nombre: "Ver", hace: "Muestra la matriz tal como quedó al cerrar esa versión (solo lectura)." },
        { nombre: "Comparar con vigente", hace: "Muestra los peligros agregados, quitados y los que cambiaron de nivel o de controles desde esa versión." },
        { nombre: "Descargar (Excel)", hace: "Descarga esa versión en Excel GTC 45, con su número y fecha en el encabezado." },
      ] },
    ],
    normas: ["Decreto 1072/2015 art. 2.2.4.6.15", "Res. 0312/2019 estándar 4.1.2"],
    relacionadas: ["matriz"],
  },
  {
    id: "biblioteca-propia", titulo: "Biblioteca propia de la empresa", ruta: new RegExp(`^${E}/biblioteca$`),
    resumen: "Cargos, tareas, peligros y catálogos que solo aplican a esta empresa. No se mezclan con la biblioteca general.",
    partes: [
      { titulo: "Pestañas", que: "Cargos tipo, tareas, peligros y exámenes, EPP y capacitaciones propios.", botones: [
        { nombre: "Crear", hace: "Agrega un elemento propio de la empresa." },
        { nombre: "Publicar en general", hace: "Copia el elemento a la biblioteca general para usarlo con otras empresas." },
      ] },
    ],
    consejos: ["Use la biblioteca propia para lo específico del cliente (por ejemplo, una máquina particular) y la general para lo que sirve a todos."],
    relacionadas: ["biblioteca", "matriz"],
  },
  {
    id: "evaluacion", titulo: "Evaluación de estándares mínimos", ruta: new RegExp(`^${E}/evaluacion$`),
    resumen: "Autoevaluación de los estándares mínimos que aplican (7, 21 o 60), con el puntaje oficial y el plan de mejoramiento.",
    partes: [
      { titulo: "Indicadores", que: "Puntaje, valoración (crítico, moderadamente aceptable, aceptable), ítems evaluados y estado." },
      { titulo: "Tabla de ítems", que: "Cada estándar con lo que revisa el inspector (pase el mouse sobre el código para ver su puntaje).", botones: [
        { nombre: "Cumple / No cumple / No aplica", hace: "Califica el ítem; el puntaje se calcula solo según la tabla de valores de la norma." },
        { nombre: "Soportes", hace: "Muestra los documentos firmados, evidencias y actas que respaldan el ítem, y permite subir más." },
      ] },
      { titulo: "Acciones", que: "Sobre toda la evaluación.", botones: [
        { nombre: "Evaluación inicial", hace: "Crea la evaluación inicial; si la empresa tiene diagnóstico, se precarga con sus calificaciones." },
        { nombre: "Cerrar y generar plan de mejoramiento", hace: "Cierra la evaluación y crea el plan de mejoramiento con lo que no cumple (DOC-05 y PLN-02)." },
        { nombre: "Reabrir", hace: "Permite volver a editar una evaluación cerrada." },
        { nombre: "Excel", hace: "Descarga la autoevaluación en el formato de la norma." },
      ] },
    ],
    pasos: ["Cree la evaluación inicial.", "Revise cada ítem con su soporte.", "Cierre y genere el plan de mejoramiento.", "Repita la autoevaluación cada año."],
    normas: ["Res. 0312/2019 arts. 16, 27 y 28", "Decreto 1072/2015 art. 2.2.4.6.16"],
    relacionadas: ["evidencias", "plan"],
  },
  {
    id: "documentos", titulo: "Documentos del SG-SST", ruta: new RegExp(`^${E}/documentos$`),
    resumen: "Todos los documentos que la norma exige a esta empresa, redactados por el sistema con sus datos y organizados por carpetas.",
    partes: [
      { titulo: "Datos que faltan (trazabilidad)", que: "Cada dato que falta para que los documentos salgan completos: dónde se llena (enlace) y qué documentos lo usan (calculado leyendo las plantillas). Incluye datos de la empresa, responsable, Mi consultora, datos complementarios, comités, evaluación de la matriz legal y registros (exámenes, capacitaciones, inspecciones, acciones). Cada fila de documento muestra «Faltan N dato(s)» y al abrir el documento aparece el aviso con los enlaces. Lo que no se ha registrado sale como espacio en blanco, «Por definir», «Por evaluar» o «Pendiente», nunca vacío sin explicación." },
      { titulo: "Acciones", que: "Sobre todos los documentos.", botones: [
        { nombre: "Generar / actualizar todos los documentos", hace: "Redacta o actualiza todos. Úselo después de cambiar la matriz, la evaluación o el plan. Las ediciones manuales se conservan." },
        { nombre: "Descargar todo (ZIP)", hace: "Todos los documentos en Word por carpetas, con la matriz y la evaluación en Excel." },
      ] },
      { titulo: "Faltan datos", que: "Tarjetas por tema con lo que falta para que los documentos salgan completos y en qué documento se usa. Al guardar esos datos, los documentos se actualizan solos." },
      { titulo: "Filtrar por estado", que: "Resumen de cuántos documentos hay en cada estado; pulse uno para ver solo esos. Estados: Sin generar, Por revisar (cambiaron los datos después de editarlo), Borrador (sin revisar), Aprobado (listo para firmar), Firmado (firmado de la versión vigente) y Volver a firmar (cambió después de firmarse). Pase el mouse sobre el estado para ver el siguiente paso." },
      { titulo: "Tabla por carpeta", que: "Cada documento con su versión, su estado y por qué aplica (pase el mouse sobre el nombre).", botones: [
        { nombre: "Ver y editar", hace: "Abre el documento por secciones para revisarlo, editarlo y subir el firmado." },
        { nombre: "Descargar en Word", hace: "Descarga ese documento con logo, encabezado y pie." },
      ] },
    ],
    consejos: ["Los cambios en Datos y Comités se aplican solos; los de matriz, evaluación y plan requieren “Generar / actualizar”.", "Si un documento cambió después de firmarse, aparece la marca “cambió después de firmar”."],
    normas: ["Decreto 1072/2015 arts. 2.2.4.6.12 y 2.2.4.6.13"],
    relacionadas: ["documento", "evidencias"],
  },
  {
    id: "documento", titulo: "Documento (ver y editar)", ruta: new RegExp(`^${E}/documentos/[^/]+$`),
    resumen: "Un documento dividido en secciones. El sistema redacta cada sección; usted puede editarla y su edición se conserva al regenerar.",
    partes: [
      { titulo: "Aviso de datos", que: "Arriba: los datos que le faltan a este documento, con enlace a dónde se llenan; en verde si está completo. En la matriz legal (MTZ-01) aparece además la evaluación de cumplimiento por norma (Sí / Parcial / No y evidencia), que llena la columna «Cumple»." },
      { titulo: "Barra superior", que: "Acciones del documento.", botones: [
        { nombre: "Estado y Marcar como aprobado", hace: "Muestra el estado del documento. Cuando lo haya revisado, márquelo como aprobado; el estado Firmado se pone solo al subir el firmado." },
        { nombre: "Regenerar", hace: "Vuelve a llenar el documento con los datos actuales; sus ediciones manuales se conservan." },
        { nombre: "Word / PDF", hace: "Descarga el documento en Word (editable) o en PDF, con encabezado, firmas y numeración." },
        { nombre: "Subir firmado", hace: "Sube el PDF o la foto del documento firmado: queda en estado Firmado y en el expediente." },
      ] },
      { titulo: "Versiones firmadas", que: "Historial de los firmados subidos; el más reciente es el vigente." },
      { titulo: "Secciones", que: "Cada sección del documento.", botones: [
        { nombre: "Editar (o doble clic)", hace: "Abre el editor visual tipo Word: negrita, listas, tablas editables. Hay un modo avanzado en Markdown." },
        { nombre: "Restaurar generado", hace: "Descarta su edición y vuelve al texto del sistema." },
        { nombre: "Conservar mi versión", hace: "Cuando los datos cambiaron después de su edición, confirma que se mantiene su texto." },
      ] },
    ],
    relacionadas: ["documentos"],
  },
  {
    id: "evidencias", titulo: "Evidencias", ruta: new RegExp(`^${E}/evidencias$`),
    resumen: "Todo lo que demuestra el cumplimiento, organizado por estándar como lo revisa el inspector.",
    partes: [
      { titulo: "Indicadores", que: "Estándares con soporte, documentos firmados y evidencias de ejecución." },
      { titulo: "Tabla por estándar", que: "Para cada estándar: lo que pide el inspector, sus documentos (firmados o no) y sus evidencias.", botones: [
        { nombre: "Subir evidencia", hace: "Sube un soporte para ese estándar (lista de asistencia, fotos, planillas…)." },
        { nombre: "Ver / Descargar / Retirar", hace: "Consulta el archivo. Retirar no borra: queda en el historial, porque la norma exige conservar los registros." },
      ] },
      { titulo: "Descargar expediente (ZIP)", que: "Una carpeta por estándar con documentos firmados (o el Word sin firmar), evidencias y un índice. Listo para una visita del Ministerio o de la ARL." },
    ],
    normas: ["Res. 0312/2019 art. 16", "Decreto 1072/2015 art. 2.2.4.6.13"],
    relacionadas: ["documentos", "evaluacion"],
  },
  {
    id: "accidentes", titulo: "Accidentes e incidentes", ruta: new RegExp(`^${E}/accidentes$`),
    resumen: "Registro de accidentes de trabajo, incidentes, enfermedades laborales y ausentismo, con sus plazos legales.",
    partes: [
      { titulo: "Alerta de plazos", que: "Eventos con el reporte FURAT, la investigación o la remisión a la ARL vencidos o por vencer." },
      { titulo: "Indicadores del año", que: "Accidentes, incidentes, enfermedades laborales, días perdidos, investigados y acciones abiertas." },
      { titulo: "Tabla de eventos", que: "Cada evento con su semáforo de plazos y el estado de la investigación. Clic en la fila para abrirlo.", botones: [{ nombre: "Registrar evento", hace: "Abre el formulario del evento; al guardar calcula los plazos y abre el detalle." }] },
    ],
    pasos: ["Registre el evento el mismo día (también los incidentes: Res. 1401/2007 art. 4 num. 2).", "Radique el FURAT o FUREL dentro de 2 días hábiles y registre la fecha; en graves, mortales y enfermedades laborales avise también al Ministerio.", "Investigue dentro de 15 días con el equipo del art. 7.", "Defina medidas con responsable y fecha y llévelas al plan.", "Descargue el informe FOR-07, hágalo firmar por el equipo y el representante legal y súbalo; si es grave o mortal remítalo a la ARL en 15 días."],
    normas: ["Decreto Ley 1295/1994 art. 62", "Res. 156/2005", "Res. 1401/2007", "Decreto 1072/2015 arts. 2.2.4.1.7 y 2.2.4.6.32", "Res. 0312/2019 estándares 3.2.1 a 3.2.3"],
    relacionadas: ["accidente", "indicadores"],
  },
  {
    id: "accidente", titulo: "Detalle del evento", ruta: new RegExp(`^${E}/accidentes/[^/]+$`),
    resumen: "Un evento se trabaja por pasos: registro, reporte, investigación, medidas e informe. El informe FOR-07 sigue el contenido que exige la Res. 1401/2007 (arts. 9 a 13).",
    partes: [
      { titulo: "1. Registro", que: "Las variables del FURAT que el informe de investigación debe retomar (Res. 1401/2007 art. 9): información del evento (fecha, hora, lugar, sitio exacto, tipo de accidente, jornada habitual, turno, tiempo laborado), identificación del trabajador (nombre, documento, vinculación, cargo, antigüedad en el cargo y en la empresa), descripción con la versión del trabajador y de los testigos (art. 10), forma, agente, lesión y parte del cuerpo. Solo el tipo de lesión, nunca diagnósticos (Ley 1581/2012). Las listas vienen de Biblioteca → Accidentes.", botones: [{ nombre: "Marcar como grave", hace: "Aparece si la lesión suele hacer grave el accidente (art. 3)." }] },
      { titulo: "2. Reporte", que: "Fecha y número de radicado del FURAT o FUREL (2 días hábiles, Decreto Ley 1295/1994 art. 62; Res. 156/2005); aviso al Ministerio si es grave, mortal o enfermedad laboral (Decreto 1072/2015 art. 2.2.4.1.7).", botones: [{ nombre: "Subir FURAT radicado", hace: "Guarda el soporte en el estándar 3.2.1." }] },
      { titulo: "3. Investigación", que: "Equipo investigador con nombre, cargo, documento y rol (arts. 7 y 13): jefe inmediato, COPASST o Vigía y responsable del SG-SST; en graves y mortales, además profesional con licencia en SST y personal de diseño de normas, procesos o mantenimiento. Datos de la investigación: fecha de inicio, lugar y dirección, fechas y horas de las sesiones (art. 13). Porqués, causas inmediatas y básicas (art. 11), peligro relacionado y lecciones. En accidentes mortales se usa el formato de la ARL (art. 4 num. 3) y se sube como soporte.", botones: [
        { nombre: "Proponer equipo", hace: "Arma el equipo con el responsable del SG-SST y el COPASST o Vigía; en graves agrega al profesional con licencia." },
        { nombre: "Sugerir causas y medidas (o con IA)", hace: "Propone causas y medidas; aparecen como botones morados que usted acepta o ignora." },
        { nombre: "Agregar a la matriz", hace: "Si el peligro no estaba en la matriz del cargo, lo agrega como sugerido." },
        { nombre: "Cerrar investigación", hace: "Verifica descripción, equipo completo e identificado según la gravedad, causas inmediatas y básicas y medidas con responsable y fecha; cada falta cita su artículo." },
      ] },
      { titulo: "4. Medidas de intervención", que: "Cada medida con tipo, jerarquía de controles, responsable y fecha de ejecución, ligada a una causa (art. 12). Se registran en FOR-06.", botones: [
        { nombre: "Agregar acción / Usar", hace: "Crea una acción (o usa una propuesta)." },
        { nombre: "Llevar al plan anual", hace: "Crea la actividad en el plan en el mes de su fecha límite (art. 4 num. 6)." },
        { nombre: "Cerrar acción", hace: "Pide la verificación de eficacia y la cierra (art. 12; Decreto 1072/2015 art. 2.2.4.6.33)." },
      ] },
      { titulo: "5. Informe y soportes", que: "Informe FOR-07 en Word o PDF con las secciones de la resolución: identificación del aportante y del trabajador, información del evento, descripción, causas, medidas, lecciones, equipo con firmas y firma del representante legal, datos de la investigación y remisión a la ARL. En graves y mortales registre la fecha de remisión a la ARL (15 días, art. 14).", botones: [{ nombre: "Descargar FOR-07 / Subir informe firmado", hace: "Descarga el informe para firmar y súbalo firmado al estándar 3.2.2. Los archivos de la investigación se conservan como soporte (art. 4 num. 10)." }] },
    ],
    normas: ["Res. 1401/2007 arts. 4, 7, 9 a 14", "Res. 156/2005", "Decreto 1072/2015 arts. 2.2.4.6.24 y 2.2.4.6.32"],
    relacionadas: ["accidentes", "matriz"],
  },
  {
    id: "plan", titulo: "Plan anual de trabajo", ruta: new RegExp(`^${E}/plan$`),
    resumen: "Actividades del año con su mes, responsable, norma y evidencias. Se genera desde el nivel de estándares, los comités, la matriz, el plan de mejoramiento y las obligaciones periódicas. Va de enero a diciembre; el año en que se inicia el SG-SST va desde el mes de inicio hasta diciembre (Res. 0312/2019 art. 26): lo periódico arranca ese mes, lo anual que caía antes se reparte en los meses que quedan y el plan de mejoramiento va primero. Si se inicia en noviembre se generan el plan corto y el del año siguiente; en diciembre, solo el del año siguiente.",
    partes: [
      { titulo: "Indicadores", que: "Actividades, cumplimiento del plan, vencidas y meta (90 %)." },
      { titulo: "Vistas", que: "Por mes o tabla.", botones: [
        { nombre: "Generar plan anual / Regenerar pendientes", hace: "Crea las actividades del año o actualiza las pendientes; no borra las que usted agregó." },
        { nombre: "Ejecutada", hace: "Marca la actividad como cumplida." },
        { nombre: "Evidencias (clip)", hace: "Sube la lista de asistencia, fotos o informe; la actividad queda ejecutada." },
        { nombre: "PLN-01 Word", hace: "Descarga el plan para firmar." },
      ] },
      { titulo: "Agregar actividad", que: "Actividades propias con su mes, estándar y responsable." },
    ],
    normas: ["Decreto 1072/2015 art. 2.2.4.6.17", "Res. 0312/2019 art. 26"],
    relacionadas: ["evaluacion", "indicadores"],
  },
  {
    id: "comites", titulo: "Comités", ruta: new RegExp(`^${E}/comites$`),
    resumen: "COPASST o Vigía, Comité de Convivencia Laboral y brigada de emergencias: conformación, integrantes, elección y actas.",
    partes: [
      { titulo: "Cada comité", que: "Periodo, integrantes y actas.", botones: [
        { nombre: "Registrar", hace: "Registra la fecha de conformación; el sistema calcula el periodo de 2 años." },
        { nombre: "Agregar integrante", hace: "Nombre, cargo, rol y a quién representa. Llena solos las actas de conformación." },
        { nombre: "Datos de la elección", hace: "Fechas de inscripción y votación, candidatos con votos y jurados (COPASST)." },
        { nombre: "Subir acta firmada", hace: "Guarda el acta de conformación, elección o de cada reunión." },
      ] },
    ],
    consejos: ["Al cambiar integrantes, los documentos se actualizan solos (ACT-01, ACT-04, ACT-05, PLN-04)."],
    normas: ["Res. 2013/1986", "Res. 3461/2025", "Decreto 1072/2015 art. 2.2.4.6.25"],
    relacionadas: ["documentos"],
  },
  {
    id: "indicadores", titulo: "Indicadores", ruta: new RegExp(`^${E}/indicadores$`),
    resumen: "Indicadores mínimos de la norma, calculados mes a mes con los eventos y el número de trabajadores.",
    partes: [
      { titulo: "Tablero", que: "Estándares, plan anual, mortalidad, prevalencia e incidencia de enfermedad laboral; tabla mensual de frecuencia, severidad y ausentismo.", botones: [{ nombre: "Trabajadores y días programados", hace: "Escriba los de cada mes; los indicadores se recalculan." }] },
      { titulo: "Registro de eventos", que: "Consulta de los eventos del año; se registran en Accidentes.", botones: [{ nombre: "Ir a Accidentes", hace: "Abre la pestaña de accidentes e incidentes." }] },
      { titulo: "Fichas técnicas", que: "Definición, fórmula, interpretación, meta y fuente de cada indicador." },
    ],
    normas: ["Res. 0312/2019 art. 30", "Decreto 1072/2015 arts. 2.2.4.6.19 a 2.2.4.6.22"],
    relacionadas: ["accidentes"],
  },
  {
    id: "planeador", titulo: "Planeador", ruta: new RegExp(`^(/planeador|${E}/planeador)$`),
    resumen: "Todas las fechas a tener en cuenta, de todas las empresas (o de una): plan anual, fin de periodo de comités, plazos de accidentes, acciones, actualización anual de la matriz, autoevaluación anual, curso del responsable y recordatorios propios. Cada fecha cita su norma.",
    partes: [
      { titulo: "Obligaciones legales periódicas", que: "Fechas que no dependen de un registro previo: reporte anual de autogestión del PESV (31 de enero, Circular 034/2026), publicación semestral de quejas por acoso sexual (Ley 2365/2024), información anual del programa de salud mental y SPA (Decreto 728/2025), capacitación anual en SGA (Res. 0773/2021), informes trimestrales y anual del Comité de Convivencia (Res. 3461/2025). También la evaluación de egreso a los 5 días hábiles del retiro y la adaptación del puesto a los 20 días hábiles de un concepto con restricciones (Res. 1843/2025)." },
      { titulo: "Indicadores", que: "Vencidos, esta semana, próximos 30 días y cumplidos." },
      { titulo: "Filtros", que: "Estado (pendientes y vencidos, solo vencidos, esta semana, cumplidos), empresa y categorías (pulse una categoría para ocultarla o mostrarla)." },
      { titulo: "Agenda y Calendario", que: "La agenda agrupa por mes; el calendario muestra el mes por días y arriba las actividades del plan sin día exacto. Clic en un día para ver su detalle.", botones: [{ nombre: "Abrir", hace: "Lleva a donde se gestiona esa fecha (plan, comité, accidente, matriz…)." }] },
      { titulo: "Fechas propias", que: "Visitas, entregas, reuniones o vencimientos externos.", botones: [
        { nombre: "Agregar fecha", hace: "Crea un recordatorio de una empresa o de la consultora." },
        { nombre: "✓ / editar / eliminar", hace: "Marca el recordatorio como hecho, lo edita o lo borra." },
      ] },
      { titulo: "Exportar a Google Calendar", que: "Descarga un archivo .ics con las fechas pendientes; impórtelo en Google Calendar, Outlook o el celular." },
      { titulo: "Bitácora de visitas (en el planeador de cada empresa)", que: "Horas pactadas y valor mensual del contrato; cada visita o reunión con fecha, horas, quién atendió, actividades y compromisos. Muestra el avance de horas del mes y el valor por hora real; las visitas salen en el informe mensual y en el tablero.", botones: [{ nombre: "Registrar visita", hace: "Agrega una visita a la bitácora." }, { nombre: "Guardar (contrato)", hace: "Guarda las horas pactadas y el valor mensual." }] },
    ],
    consejos: ["Las fechas se calculan solas a partir de lo registrado: al cerrar una versión de la matriz o una autoevaluación, la próxima fecha se mueve un año."],
    relacionadas: ["plan", "accidentes", "comites"],
  },
  {
    id: "biblioteca", titulo: "Biblioteca general", ruta: /^\/biblioteca$/,
    resumen: "Todo lo parametrizable que sirve a todas las empresas: sectores y cargos, tareas, peligros, exámenes, EPP y capacitaciones, guías de accidentes, listas de inspección y entidades (EPS, fondos, ARL). Se puede crear, editar y validar.",
    partes: [
      { titulo: "Sectores y cargos", que: "Sectores con sus procesos, zonas y cargos tipo.", botones: [{ nombre: "Crear cargo / Ampliar con IA", hace: "Agrega cargos tipo al sector (con IA, propone muchos)." }] },
      { titulo: "Tareas", que: "Tareas tipo con sus peligros.", botones: [{ nombre: "Crear tarea", hace: "Agrega una tarea a la biblioteca." }] },
      { titulo: "Peligros", que: "Peligros GTC 45 con ND, NE y NC sugeridos, efectos, medidas, EPP, exámenes y capacitaciones." },
      { titulo: "Exámenes, EPP y capacitaciones", que: "Alimentan el profesiograma, la matriz de EPP y el programa de capacitación." },
      { titulo: "Accidentes", que: "Formas del evento (con causas, medidas y lección típicas), tipos de lesión (y cuáles sugieren accidente grave), agentes y partes del cuerpo.", botones: [{ nombre: "Nueva forma / Editar", hace: "Ajusta las guías que usa la investigación de accidentes." }] },
      { titulo: "Inspecciones", que: "Listas de chequeo con sus ítems y frecuencia; se usan en la pestaña Inspecciones de cada empresa.", botones: [{ nombre: "Nueva lista / Editar", hace: "Un ítem por línea; la frecuencia en días define cuándo el planeador avisa la próxima inspección." }] },
      { titulo: "Entidades", que: "EPS, fondos de pensiones, ARL y niveles de escolaridad que se ofrecen al registrar empresas y trabajadores." },
    ],
    consejos: ["Lo marcado “sin validar” viene de la semilla o de la IA: revíselo.", "Los cambios aplican a lo que se cree desde ahora; no modifican lo ya cargado en las empresas."],
    relacionadas: ["biblioteca-propia", "plantillas"],
  },
  {
    id: "plantillas", titulo: "Plantillas", ruta: /^\/plantillas(\/[^/]+)?$/,
    resumen: "Las plantillas con las que el sistema redacta los documentos. Cada una cita sus normas.",
    partes: [
      { titulo: "Lista", que: "Código, nombre, desde qué nivel aplica, estándares que soporta, versión y cuántas empresas la usan.", botones: [{ nombre: "Editar", hace: "Abre la plantilla para ajustar su texto." }] },
      { titulo: "Editor", que: "Texto con variables entre {{ }} que se llenan con los datos de cada empresa.", botones: [{ nombre: "Guardar", hace: "Guarda; los documentos se actualizan al regenerarlos." }, { nombre: "Variables disponibles", hace: "Muestra los datos que puede usar en el texto." }] },
    ],
    relacionadas: ["documentos", "normas"],
  },
  {
    id: "normas", titulo: "Normas y estándares", ruta: /^\/normas$/,
    resumen: "Catálogo de normas vigentes, los 60 estándares mínimos y las reglas que usa el sistema para decidir qué aplica a cada empresa.",
    partes: [
      { titulo: "Normas", que: "Cada norma con su tema, artículos clave y evidencia de cumplimiento." },
      { titulo: "Estándares mínimos (60)", que: "Con su puntaje y lo que revisa el inspector." },
      { titulo: "Reglas", que: "Condición, efecto y norma de cada regla de aplicabilidad." },
    ],
  },
  {
    id: "consultora", titulo: "Mi consultora", ruta: /^\/configuracion$/,
    resumen: "Datos de la consultora y de la profesional que firma. Se precargan como responsable del SG-SST en cada empresa nueva.",
    partes: [
      { titulo: "Consultora y profesional", que: "Nombre, NIT, profesional, cédula, perfil, licencia y curso de 50 horas.", botones: [{ nombre: "Guardar", hace: "Guarda; las empresas nuevas los toman y las existentes pueden copiarlos en Datos." }] },
      { titulo: "Asistente de IA", que: "Estado de la IA. Sin IA, las sugerencias usan la biblioteca." },
    ],
  },
  {
    id: "usuarios", titulo: "Usuarios", ruta: /^\/usuarios$/,
    resumen: "Personas que pueden entrar a PROCESST.",
    partes: [
      { titulo: "Lista", que: "Buscar y filtrar por estado o rol.", botones: [
        { nombre: "Nuevo usuario", hace: "Crea un usuario con contraseña inicial (botón Generar para una segura)." },
        { nombre: "⋯ Editar / Restablecer / Desactivar / Eliminar", hace: "Gestiona cada usuario. Restablecer y desactivar cierran sus sesiones." },
      ] },
    ],
    consejos: ["Siempre debe quedar al menos un administrador activo.", "Desactivar es mejor que eliminar si es temporal."],
  },
  {
    id: "cuenta", titulo: "Mi cuenta", ruta: /^\/cuenta$/,
    resumen: "Su usuario: nombre, correo y contraseña.",
    partes: [{ titulo: "Datos y contraseña", que: "Cambie su nombre, correo o contraseña. Al cambiar la contraseña se cierran sus sesiones en otros equipos." }],
  },
];

export function seccionDeRuta(pathname: string) {
  return MANUAL.find((s) => s.ruta.test(pathname)) ?? MANUAL[0];
}

const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Busca en todo el manual (secciones, partes y botones). */
export function buscarManual(q: string) {
  const ws = norm(q).split(/\s+/).filter(Boolean);
  if (!ws.length) return [];
  const ok = (t: string) => ws.every((w) => norm(t).includes(w));
  const out: { seccion: SeccionManual; titulo: string; texto: string }[] = [];
  for (const s of MANUAL) {
    if (ok(`${s.titulo} ${s.resumen}`)) out.push({ seccion: s, titulo: s.titulo, texto: s.resumen });
    for (const p of s.partes) {
      if (ok(`${p.titulo} ${p.que}`)) out.push({ seccion: s, titulo: `${s.titulo} › ${p.titulo}`, texto: p.que });
      for (const b of p.botones ?? []) if (ok(`${b.nombre} ${b.hace}`)) out.push({ seccion: s, titulo: `${s.titulo} › ${b.nombre}`, texto: b.hace });
    }
  }
  return out.slice(0, 30);
}
