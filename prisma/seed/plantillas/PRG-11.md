---
codigo: PRG-11
nombre: Programa de gestión para trabajo en espacios confinados
tipo: PRG
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.3"]
normas: ["RES-0491-2020","RES-2605-2020","RES-0312-2019","RES-1843-2025","DEC-1072-2015","GTC-45-2012"]
condicion: {"disparador":"confinados"}
---
## Objetivo

Prevenir accidentes de trabajo y enfermedades laborales en el trabajo en espacios confinados de **{{empresa.razonSocial}}**, mediante un programa de gestión documentado, articulado al SG-SST e incluido en él (Resolución 0491 de 2020, art. 7 y numeral 26, y art. 12 numeral 1, vigente desde el 1 de agosto de 2021 según la Resolución 2605 de 2020; Resolución 0312 de 2019, estándar 4.2.3).

## Alcance

Todas las actividades en espacios confinados de la empresa (tanques, pozos, cámaras, silos, zanjas profundas y similares), en todas sus sedes, realizadas por trabajadores propios, en misión o contratistas (art. 12 numeral 2).

## Marco conceptual y legal

- **Espacio confinado:** lugar no diseñado para la ocupación continua, con medios de entrada y salida restringidos o limitados, y con tamaño suficiente para que entre un trabajador (Resolución 0491 de 2020, art. 3).
- **Clasificación (art. 4):** tipo 1, abierto por la parte superior y con profundidad que dificulta la ventilación natural (zanjas de más de 1,2 m, pozos); tipo 2, cerrado con una pequeña abertura (tanques, túneles, alcantarillas, silos). Por grado de peligro: A (peligro inminente para la vida o la salud), B (peligros potenciales controlables) y C (no exige modificar procedimientos ni EPP).
- **Normas:** Resolución 0491 de 2020 (modificada por la Resolución 2605 de 2020); Decreto 1072 de 2015, capítulo 6 y art. 2.2.4.6.24 (jerarquía de controles); Resolución 1843 de 2025 (evaluaciones médicas); Resolución 0312 de 2019 (art. 12 numeral 3).

## Roles y responsabilidades

Roles que exige la Resolución 0491 de 2020 (art. 10; art. 7 numeral 25); no implican crear cargos nuevos. El supervisor y el vigía pueden ser la misma persona si tiene la formación de ambos roles.

| Rol | Responsabilidad | Designado |
|---|---|---|
| Responsable del diseño y la administración del programa | Diseñar, administrar y asegurar el programa | |
| Supervisor de espacios confinados | Coordinar el ingreso; autorizar, rotar, negar, suspender, cancelar y cerrar el permiso; fácil de identificar | {{op.supervisorConfinados.nombre}} |
| Vigía | Permanecer en la entrada, verificar las condiciones seguras, monitorear y activar el plan de emergencias | {{op.vigiaConfinados.nombre}} |
| Trabajador entrante | Realizar las tareas dentro del espacio cumpliendo las medidas del programa | |
| Personal de rescate | Ejecutar los procedimientos de rescate | |

## Formación por rol

Formación certificada para cada rol (arts. 29 y 30):

| Rol | Intensidad mínima |
|---|---|
| Administrador del programa | 8 horas |
| Trabajador entrante | 16 horas (40 % teoría, 60 % práctica presencial) |
| Supervisor | 20 horas (40 % teoría, 60 % práctica presencial) |
| Vigía | 8 horas (40 % teoría, 60 % práctica presencial) |

**Actualización cada tres (3) años**, o antes si cambian la actividad o el cargo de la persona o la tecnología (Resolución 0491 de 2020, art. 30 parágrafo, adicionado por la Resolución 2605 de 2020, art. 3). La formación es a cargo exclusivo del empleador o contratante, no la paga el trabajador y no puede exigirse como requisito previo para contratar.

## Inventario de espacios confinados

Inventario de todos los escenarios con su clasificación, ubicación, peligros y señalización (art. 12 numeral 6; arts. 6 y 14). Para clasificarlos por la atmósfera se hace el muestreo respectivo.

| N.º | Espacio | Ubicación | Tipo (1/2) y grado (A/B/C) | Peligros | Muestreo atmosférico | Acceso | Señalizado |
|---|---|---|---|---|---|---|---|
{{#if op.espaciosConfinados.length}}
{{#each op.espaciosConfinados}}
| {{inc @index}} | {{celda espacio}} | {{celda ubicacion}} | | {{celda peligros}} | | {{celda acceso}} | {{senalizado}} |
{{/each}}
{{else}}
| 1 | | | | | | | |
{{/if}}

## Análisis de peligros y controles

Los peligros de cada espacio y actividad se identifican, evalúan y valoran en la matriz de peligros (GTC 45), tanto en operación normal como durante una emergencia, y antes de cada ingreso con el Análisis de Peligros por Actividad (APA) (art. 12 numeral 5; arts. 6, 16 numeral 7 y 20). Es un proceso continuo.

Jerarquía de controles (Decreto 1072 de 2015, art. 2.2.4.6.24; Resolución 0491 de 2020, art. 15):

1. **Eliminación:** el trabajo se hace desde el exterior del espacio siempre que los medios técnicos lo permitan (art. 7 numeral 7), y se eliminan las condiciones que hacen del sitio un espacio confinado cuando es posible (art. 6).
2. **Controles de ingeniería:** ventilación natural o forzada (art. 22), iluminación adecuada (art. 23), aislamiento de sistemas adyacentes cerrando válvulas, parando equipos y cortando energía (art. 28 numeral 5).
3. **Controles administrativos (art. 16):** rotación, señalización permanente o temporal, delimitación (amarillo y negro permanente, naranja y blanco temporal), control de acceso, bloqueo y etiquetado, y permiso de trabajo.
4. **Elementos de protección personal y respiratoria** (art. 26).

## Procedimientos de trabajo

La empresa documenta un procedimiento para cada actividad en espacios confinados, fácil de entender y divulgado desde la inducción, la capacitación y el reentrenamiento (art. 12 numeral 7; art. 13). Como mínimo: detección de gases, gestión de los detectores de gases y procedimiento de la actividad a realizar (art. 16 numeral 4). Los procedimientos se revisan cuando cambian las condiciones de trabajo, ocurre un incidente o accidente, o los indicadores lo indican. Se incluye el procedimiento de evacuación (art. 25).

## Medidas de prevención

1. **Permiso de entrada** escrito y previo, con APA (art. 7 numeral 12; art. 17), según el formato de este programa.
2. **Mediciones atmosféricas** de oxígeno, inflamables y tóxicos antes del ingreso y durante el trabajo, hechas por una persona capacitada en el equipo y registradas (art. 7 numeral 21; art. 21).
3. **Detectores de gases:** operación y verificación según el fabricante; **prueba funcional antes de cada uso** con gas patrón de certificado vigente, con procedimiento escrito y registros trazables; capacitación en uso, prueba funcional y ajuste de sensores por personal calificado (art. 7 numerales 14 a 17).
4. Ventilación, aislamiento de energías y bloqueo y etiquetado antes del ingreso.
5. **Aptitud médica:** evaluaciones médicas ocupacionales del personal asignado; el concepto de aptitud para espacios confinados se rige por la Resolución 0491 de 2020 (art. 7 numeral 2; art. 18 numeral 1; Resolución 1843 de 2025, art. 2 literal e). Solo se registra el concepto de aptitud, nunca diagnósticos.
6. **Contratistas:** antes de que un contratista ingrese, la empresa le entrega información sobre el espacio (condiciones, peligros, operación y controles), las fichas de datos de seguridad de los productos que contiene y una inducción en sus normas de seguridad; verifica su formación y supervisa la aplicación de las medidas (art. 7 numerales 9 a 11).
7. Se detiene el trabajo ante un peligro no identificado o no controlado, y se registra en el permiso (art. 7 numeral 13).

## Medidas de protección

- Equipos y elementos de protección personal y respiratoria disponibles y en buen estado, con un programa de selección, entrenamiento, inspección y mantenimiento (art. 26; art. 19).
- Aire suministrado o autocontenido que sea respirable (art. 7 numeral 20).
- **Equipo de apoyo en el exterior**, permanente mientras haya personas dentro; verificación de la ventilación; instrucción previa a los entrantes sobre riesgos, controles y responsabilidades (art. 28).
- **Comunicación efectiva** en todo momento entre el vigía y cada entrante (art. 24).

## Plan de emergencias y rescate

El plan de emergencias (PLN-04) define cómo se atienden las emergencias de esta actividad (art. 27; art. 7 numeral 8):

1. Procedimientos de rescate por escenario, con el sistema o dispositivo de rescate, los elementos necesarios y el paso a paso.
2. El plan se **practica y verifica formalmente al menos una vez antes** de realizar la actividad (numeral 2), con el personal asignado a la emergencia (numeral 4); se registra en el FOR-05.
3. Sistemas de rescate operativos y comprobados antes de la intervención; elementos certificados; personal formado para el rescate (numerales 5 a 7).
4. **Vigía permanente** capaz de activar el plan y apoyar el rescate, con un sistema de comunicación efectivo con cada entrante (numerales 8 a 10).
5. Se implementa con el apoyo de la ARL (art. 7 numeral 8).

## Indicadores de gestión

Indicadores específicos alineados con el Decreto 1072 de 2015 y la Resolución 0312 de 2019 (art. 12 numeral 11):

- Personal con formación vigente por rol / personal que interviene en espacios confinados × 100.
- Permisos con mediciones atmosféricas registradas / ingresos realizados × 100.
- Pruebas funcionales de detectores registradas / usos del detector × 100.
- Simulacros de rescate realizados antes de la actividad / actividades programadas × 100.
- Incidentes y accidentes en espacios confinados en el periodo.

## Permiso de trabajo en espacios confinados

Se diligencia y firma en común acuerdo entre los trabajadores y el supervisor en el sitio, permanece allí durante la labor y se conserva (art. 17). Contenido mínimo (numeral 1):

| Campo | Información |
|---|---|
| a) Nombres, firmas y documentos de los trabajadores autorizados y de quienes avalan el permiso | |
| b) Fecha y hora de inicio y de terminación | |
| c) Descripción de la tarea | |
| d) Autorreporte de condiciones de trabajo y salud (solo declaración de aptitud: ☐ Me siento apto ☐ No me siento apto) | |
| e) Verificación de que existe el procedimiento de la tarea | ☐ Sí |
| f) APA con las medidas preventivas y de protección | ☐ Anexo |
| g) EPP disponibles y verificados | |
| h) Mediciones atmosféricas previas al ingreso (O₂, inflamables, tóxicos) | |
| i) Herramientas y equipos | |
| j) Formación certificada según el rol (entrante, vigía, supervisor) | |
| k) Vigencia del permiso | |
| l) Verificación de la respuesta a emergencias | |
| m) Observaciones | |
| Fichas de datos de seguridad anexas (si hay sustancias químicas) | |
| Otros permisos de alto riesgo asociados (alturas, energías peligrosas, caliente) | |
| Cancelación o cierre por el supervisor y condiciones nuevas encontradas | |
