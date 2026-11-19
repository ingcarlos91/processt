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
    id: "inicio", titulo: "Empresas (inicio)", ruta: /^\/$/,
    resumen: "Lista de las empresas cliente. Desde aquí se crea una empresa nueva y se entra a gestionar su SG-SST.",
    partes: [
      { titulo: "Tabla de empresas", que: "Cada empresa con su clase de riesgo, trabajadores, nivel de estándares (7, 21 o 60), resultado de la evaluación, avance del plan anual, peligros en la matriz y documentos.", botones: [{ nombre: "Nombre de la empresa", hace: "Lleva al Resumen de la empresa, donde está todo su SG-SST por pestañas." }] },
      { titulo: "Nueva empresa", que: "Cuestionario guiado de 7 pasos.", botones: [{ nombre: "Nueva empresa", hace: "Abre el cuestionario. Al terminar, el sistema calcula el nivel de estándares, los comités y las normas aplicables, y precarga la matriz de peligros por cargo." }] },
    ],
    pasos: ["Cree la empresa con “Nueva empresa”.", "Revise el Resumen y la matriz de peligros.", "Haga la evaluación inicial, genere el plan anual y luego los documentos."],
    relacionadas: ["nueva", "resumen"],
  },
  {
    id: "nueva", titulo: "Nueva empresa / Datos de la empresa", ruta: new RegExp(`^(/empresas/nueva|${E}/datos)$`),
    resumen: "Cuestionario con los datos que definen todo el SG-SST: actividad, riesgo, trabajadores, sedes, peligros especiales, estado actual y responsable. En “Datos” se edita lo mismo después de creada.",
    partes: [
      { titulo: "1. Identificación", que: "Razón social, NIT, dirección, representante legal y logo (el logo aparece en todos los Word y Excel)." },
      { titulo: "2. Actividad y riesgo", que: "Código CIIU, clase de riesgo según la ARL, ARL y EPS. Definen el sector de la biblioteca (cargos, tareas y peligros típicos)." },
      { titulo: "3. Personas y cargos", que: "Número de trabajadores, contratistas, aprendices y en misión, horario y turnos, y los cargos con cuántas personas tiene cada uno.", botones: [{ nombre: "Agregar cargo", hace: "Agrega un cargo; si coincide con un cargo tipo de la biblioteca, trae sus tareas y peligros." }] },
      { titulo: "4. Sedes", que: "Centros de trabajo. El Comité de Convivencia se conforma por centro de trabajo.", botones: [{ nombre: "Agregar sede", hace: "Agrega otro centro de trabajo." }] },
      { titulo: "5. Peligros especiales", que: "Alturas, espacios confinados, químicos, trabajo nocturno, vehículos… Cada opción activa normas, programas, documentos y capacitaciones." },
      { titulo: "6. Estado actual", que: "Lo que la empresa ya tiene (responsable designado, COPASST, afiliaciones…). Precarga la evaluación inicial." },
      { titulo: "7. Responsable del SG-SST", que: "Nombre, cédula, licencia y curso de 50 horas. Se precarga con sus datos de “Mi consultora”; cámbielos si es otra persona.", botones: [{ nombre: "Copiar mis datos", hace: "Copia los datos de la profesional registrados en Mi consultora." }] },
      { titulo: "Datos para los documentos (solo en Datos)", que: "Contactos, emergencias, inventarios y presupuesto que el sistema no puede adivinar. Cada campo dice en qué documentos se usa.", botones: [{ nombre: "Guardar datos", hace: "Guarda y actualiza solos los documentos ya generados." }] },
    ],
    pasos: ["Llene los 7 pasos con lo que tenga; todo se puede completar después.", "Al guardar, revise el Resumen: el sistema explica cada decisión en “¿Por qué? Decisiones”.", "Complete “Datos para los documentos” para que los documentos salgan sin espacios en blanco."],
    consejos: ["Los cambios en Datos actualizan solos los documentos ya generados; sus ediciones manuales se conservan.", "Cada campo tiene su ayuda (?) con qué es, de dónde sacarlo y sus opciones."],
    normas: ["Res. 0312/2019 arts. 3, 9 y 16", "Decreto 1072/2015 cap. 6"],
    relacionadas: ["resumen", "documentos"],
  },
  {
    id: "resumen", titulo: "Resumen de la empresa", ruta: new RegExp(`^${E}$`),
    resumen: "Tablero de la empresa: qué le exige la norma, su avance y las alertas.",
    partes: [
      { titulo: "Encabezado", que: "Nombre, NIT, nivel de estándares, clase de riesgo, trabajadores y ciudad. Las pestañas de abajo llevan a cada parte del SG-SST.", botones: [{ nombre: "¿Por qué? Decisiones", hace: "Abre el panel con cada decisión que tomó el sistema (nivel, comités, normas, documentos) y la norma que la define." }] },
      { titulo: "Indicadores", que: "Estándares mínimos, última evaluación, riesgos prioritarios (I y II), documentos y avance del plan anual. Pase el mouse para ver de dónde sale cada dato." },
      { titulo: "Alertas", que: "Plazos de accidentes vencidos o por vencer, y otros pendientes. Cada alerta lleva a donde se resuelve." },
      { titulo: "Qué exige la norma a esta empresa", que: "Comités, programas y normas que aplican, con su razón." },
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
        { nombre: "Evaluación inicial", hace: "Crea la evaluación precargada con el “Estado actual” del cuestionario." },
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
      { titulo: "Barra superior", que: "Acciones del documento.", botones: [
        { nombre: "Estado y Marcar como aprobado", hace: "Muestra el estado del documento. Cuando lo haya revisado, márquelo como aprobado; el estado Firmado se pone solo al subir el firmado." },
        { nombre: "Regenerar", hace: "Vuelve a llenar el documento con los datos actuales; sus ediciones manuales se conservan." },
        { nombre: "Word", hace: "Descarga el documento para imprimir y firmar." },
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
    pasos: ["Registre el evento el mismo día.", "Radique el FURAT dentro de 2 días hábiles y registre la fecha.", "Investigue dentro de 15 días.", "Defina acciones y llévelas al plan.", "Descargue el informe, hágalo firmar y súbalo."],
    normas: ["Decreto Ley 1295/1994 art. 62", "Res. 1401/2007", "Decreto 1072/2015 art. 2.2.4.6.32", "Res. 0312/2019 estándares 3.2.1 a 3.2.3"],
    relacionadas: ["accidente", "indicadores"],
  },
  {
    id: "accidente", titulo: "Detalle del evento", ruta: new RegExp(`^${E}/accidentes/[^/]+$`),
    resumen: "Un evento se trabaja por pasos: registro, reporte, investigación, acciones e informe.",
    partes: [
      { titulo: "1. Registro", que: "Datos del evento, la persona, qué pasó, la lesión y la incapacidad. Las listas vienen de Biblioteca → Accidentes; lo típico de la forma del evento aparece primero.", botones: [{ nombre: "Marcar como grave", hace: "Aparece si la lesión suele hacer grave el accidente." }] },
      { titulo: "2. Reporte", que: "Fecha y número de radicado del FURAT o FUREL; aviso al Ministerio si es grave o mortal.", botones: [{ nombre: "Subir FURAT radicado", hace: "Guarda el soporte en el estándar 3.2.1." }] },
      { titulo: "3. Investigación", que: "Equipo investigador, porqués, causas inmediatas y básicas, peligro relacionado y lecciones.", botones: [
        { nombre: "Proponer equipo", hace: "Arma el equipo con el responsable del SG-SST y el COPASST o Vigía." },
        { nombre: "Sugerir causas y medidas (o con IA)", hace: "Propone causas y medidas; aparecen como botones morados que usted acepta o ignora." },
        { nombre: "Agregar a la matriz", hace: "Si el peligro no estaba en la matriz del cargo, lo agrega como sugerido." },
        { nombre: "Cerrar investigación", hace: "Verifica equipo, causas y al menos una medida, y la cierra." },
      ] },
      { titulo: "4. Acciones", que: "Medidas con jerarquía de controles, responsable y fecha.", botones: [
        { nombre: "Agregar acción / Usar", hace: "Crea una acción (o usa una propuesta)." },
        { nombre: "Llevar al plan anual", hace: "Crea la actividad en el plan en el mes de su fecha límite." },
        { nombre: "Cerrar acción", hace: "Pide la verificación de eficacia y la cierra." },
      ] },
      { titulo: "5. Informe y soportes", que: "Informe FOR-07 en Word y soportes del caso.", botones: [{ nombre: "Descargar FOR-07 / Subir informe firmado", hace: "Descarga el informe para firmar y súbalo firmado al estándar 3.2.2." }] },
    ],
    normas: ["Res. 1401/2007", "Decreto 1072/2015 arts. 2.2.4.6.24 y 2.2.4.6.32"],
    relacionadas: ["accidentes", "matriz"],
  },
  {
    id: "plan", titulo: "Plan anual de trabajo", ruta: new RegExp(`^${E}/plan$`),
    resumen: "Actividades del año con su mes, responsable, norma y evidencias. Se genera desde el nivel de estándares, los comités, la matriz, el plan de mejoramiento y las obligaciones periódicas.",
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
      { titulo: "Indicadores", que: "Vencidos, esta semana, próximos 30 días y cumplidos." },
      { titulo: "Filtros", que: "Estado (pendientes y vencidos, solo vencidos, esta semana, cumplidos), empresa y categorías (pulse una categoría para ocultarla o mostrarla)." },
      { titulo: "Agenda y Calendario", que: "La agenda agrupa por mes; el calendario muestra el mes por días y arriba las actividades del plan sin día exacto. Clic en un día para ver su detalle.", botones: [{ nombre: "Abrir", hace: "Lleva a donde se gestiona esa fecha (plan, comité, accidente, matriz…)." }] },
      { titulo: "Fechas propias", que: "Visitas, entregas, reuniones o vencimientos externos.", botones: [
        { nombre: "Agregar fecha", hace: "Crea un recordatorio de una empresa o de la consultora." },
        { nombre: "✓ / editar / eliminar", hace: "Marca el recordatorio como hecho, lo edita o lo borra." },
      ] },
      { titulo: "Exportar a Google Calendar", que: "Descarga un archivo .ics con las fechas pendientes; impórtelo en Google Calendar, Outlook o el celular." },
    ],
    consejos: ["Las fechas se calculan solas a partir de lo registrado: al cerrar una versión de la matriz o una autoevaluación, la próxima fecha se mueve un año."],
    relacionadas: ["plan", "accidentes", "comites"],
  },
  {
    id: "biblioteca", titulo: "Biblioteca general", ruta: /^\/biblioteca$/,
    resumen: "Todo lo que el sistema precarga en todas las empresas. Se puede crear, editar y validar.",
    partes: [
      { titulo: "Sectores y cargos", que: "Sectores con sus procesos, zonas y cargos tipo.", botones: [{ nombre: "Crear cargo / Ampliar con IA", hace: "Agrega cargos tipo al sector (con IA, propone muchos)." }] },
      { titulo: "Tareas", que: "Tareas tipo con sus peligros.", botones: [{ nombre: "Crear tarea", hace: "Agrega una tarea a la biblioteca." }] },
      { titulo: "Peligros", que: "Peligros GTC 45 con ND, NE y NC sugeridos, efectos, medidas, EPP, exámenes y capacitaciones." },
      { titulo: "Exámenes, EPP y capacitaciones", que: "Alimentan el profesiograma, la matriz de EPP y el programa de capacitación." },
      { titulo: "Accidentes", que: "Formas del evento (con causas, medidas y lección típicas), tipos de lesión (y cuáles sugieren accidente grave), agentes y partes del cuerpo.", botones: [{ nombre: "Nueva forma / Editar", hace: "Ajusta las guías que usa la investigación de accidentes." }] },
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
