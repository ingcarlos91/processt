---
codigo: PRG-02
nombre: Programa de medicina preventiva y del trabajo
tipo: PRG
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.1.1","3.1.2","3.1.3","3.1.4","3.1.5","3.1.6","3.1.7","3.1.8","3.1.9"]
normas: ["DEC-1072-2015","RES-0312-2019","RES-1843-2025","DEC-1477-2014","DEC-1072-2015-CAP13","DEC-1072-2015-CONTRATISTAS","DL-019-2012"]
---
## Objetivo

Promover, prevenir y vigilar las condiciones de salud de los trabajadores de **{{empresa.razonSocial}}** frente a los peligros identificados, mediante evaluaciones médicas ocupacionales, vigilancia epidemiológica y actividades de promoción y prevención (Decreto 1072 de 2015, art. 2.2.4.6.8 numeral 8; Resolución 1843 de 2025, art. 5; Resolución 0312 de 2019, estándares 3.1.1 a 3.1.9).

## Diagnóstico de condiciones de salud

El diagnóstico se construye con tres fuentes:

1. La encuesta anónima de perfil sociodemográfico y condiciones de salud percibidas (FOR-01).
2. El **diagnóstico general de salud** que el prestador de las evaluaciones médicas entrega sin costo en **diciembre de cada año** (Resolución 1843 de 2025, art. 4 literal g). Debe contener como mínimo: información sociodemográfica; antecedentes de exposición; exposición actual por área u oficio; síntomas reportados; resultados generales de pruebas complementarias; diagnósticos agregados de la población evaluada; análisis e interpretación, y recomendaciones. Es general y **no puede incluir datos individualizados** (art. 20).
3. El análisis de las estadísticas de ausentismo, accidentalidad y enfermedad (laboral y común) de los **dos últimos años**, que sirve de línea base (Decreto 1072 de 2015, art. 2.2.4.6.16 numeral 7 y parágrafo 1).

Con estas fuentes se priorizan las actividades de este programa y los programas de vigilancia epidemiológica.

## Evaluaciones médicas ocupacionales

Se realizan conforme a la Resolución 1843 de 2025 y al perfil de cargo de la empresa (documento DOC-07), que el empleador elabora y entrega al prestador junto con la matriz de peligros, conservando evidencia de entrega y recibido (arts. 5 literal d y 16). Las realiza un médico especialista en SST con licencia vigente (arts. 17 y 26).

Son, como mínimo, seis tipos (art. 8):

- **Pre-ingreso** (art. 9). Al enlistarlas, la empresa deja constancia de que no incluyen prueba de embarazo (art. 22).
- **Periódicas**, programadas o por cambio de ocupación (art. 10).
- **Egreso**: la empresa informa al trabajador el proceso y deja constancia de la notificación; se realiza dentro de los cinco (5) días hábiles siguientes a la terminación (art. 11).
- **Post-incapacidad**: al terminar una incapacidad de treinta (30) días calendario o más (art. 13).
- **Retorno laboral**: tras una ausencia por causa no médica de noventa (90) días calendario o más, antes del reintegro (art. 12).
- **Seguimiento o control** (art. 14).

**Costo:** lo asume en su totalidad el empleador, incluidas las pruebas complementarias. Si un examen periódico exige traslado a otro municipio, el empleador también paga transporte, alojamiento y alimentación. Las evaluaciones se programan dentro de la jornada (art. 5 literales a, b y c; art. 26 parágrafo 2). La ARL no puede pagarlas (art. 6). Para contratistas independientes rige el Decreto 1072 de 2015, art. 2.2.4.2.2.18.

**Qué recibe la empresa:** únicamente el concepto médico ocupacional, nunca diagnósticos (arts. 4 literal i y 19). El concepto trae las recomendaciones o restricciones, su temporalidad (temporales o permanentes, y hasta cuándo) y si se requiere seguimiento. No debe usar la expresión "no apto", salvo en los regímenes especiales de aptitud (art. 19 parágrafo). En la práctica se registra como apto, apto con recomendaciones o apto con restricciones. El concepto forma parte del expediente laboral del trabajador (art. 8 parágrafo 1).

**Historia clínica:** la custodia el prestador; la empresa no puede tener copia salvo autorización expresa del trabajador y médico especialista en SST vinculado. Los registros se conservan mínimo veinte (20) años (art. 30).

**Pruebas prohibidas:** no se exige prueba de embarazo, VIH ni VDRL para ingresar o permanecer (art. 21). Solo hay excepciones con consentimiento previo cuando el trabajo implique riesgos reales para el embarazo (art. 22) o para la salud del trabajador o de terceros (VIH, art. 23).

**Remisión:** si en una evaluación se sospecha una enfermedad, el médico remite al trabajador a su EPS para la atención y la determinación del origen (art. 27; Decreto Ley 019 de 2012, art. 142). La calificación tiene en cuenta la Tabla de Enfermedades Laborales y la relación de causalidad (Decreto 1477 de 2014, arts. 1 a 3).

## Periodicidad de las evaluaciones periódicas

La empresa define la periodicidad de las evaluaciones periódicas dentro del SG-SST. Debe justificarla técnicamente según el tipo, la magnitud y la frecuencia de la exposición de cada cargo, la matriz de peligros, la edad y el estado de salud, y los criterios de los programas de vigilancia epidemiológica. Puede pedir asistencia técnica a la ARL (Resolución 1843 de 2025, arts. 10 literal A y 15). **El plazo de tres (3) años es un máximo que la norma admite solo en caso excepcional; no es la periodicidad ordinaria.** Los certificados de aptitud de regímenes especiales (alturas, trabajo eléctrico, alimentos, espacios confinados, conducción, armas) siguen la vigencia de su propia norma (art. 15 parágrafo 1).

| Cargo | Exámenes (ver DOC-07) | Periodicidad definida | Justificación técnica (peligro, nivel de riesgo, PVE) |
|---|---|---|---|
{{#each cargos}}
| {{celda nombre}} | {{celda (join examenes "; ")}} | {{default periodicidad "Por definir"}} | {{celda (default periodicidadMotivo "Por registrar")}} |
{{/each}}

Mientras el médico no recomiende otra cosa, la consultora propone revisar la periodicidad cada año, al actualizar la matriz de peligros.{{#if (gte empresa.nivel 60)}} Para esta empresa (más de 50 trabajadores o riesgo IV-V), el documento que define la frecuencia es evidencia del estándar 3.1.4 (Resolución 0312 de 2019).{{/if}}

## Programas de vigilancia epidemiológica (PVE)

El empleador implementa los sistemas de vigilancia epidemiológica según los riesgos de la empresa y el diagnóstico de condiciones de salud (Resolución 1843 de 2025, art. 5 literal e). Las evaluaciones específicas siguen los índices biológicos de exposición (BEI) de la ACGIH, los criterios IARC para cancerígenos, OIT para neumoconiosis y CDC para agentes biológicos. Si no existen, el PVE fija su propio protocolo (art. 28). El desarrollo de cada PVE está en el documento PRG-05.

| PVE | Peligro asociado | Cargos expuestos | Exámenes de seguimiento |
|---|---|---|---|
{{#each pve}}
| {{nombre}} | {{celda peligro}} | {{celda cargos}} | {{celda examenes}} |
{{/each}}
{{#unless pve.length}}
| Se definirán al completar la matriz de peligros | | | |
{{/unless}}

## Actividades de promoción y prevención

| Actividad | Periodicidad | Responsable |
|---|---|---|
| Programa de pausas activas durante la jornada (ver sección siguiente; Resolución 1843 de 2025, art. 5 literal h) | Diaria | Responsable del SG-SST / líderes |
| Campañas de estilos de vida y entornos de trabajo saludables (alimentación, actividad física, sueño) (Resolución 0312 de 2019, estándar 3.1.7) | Trimestral (propuesta) | Responsable del SG-SST |
| Campañas de prevención de la farmacodependencia, el alcoholismo y el tabaquismo, con la política POL-02 y el programa PRG-03 (Resolución 1843 de 2025, arts. 5 literal g y 25; Decreto 1072 de 2015, art. 2.2.4.13.3) | Semestral (propuesta) | Responsable del SG-SST / ARL |
| Plan de intervención en salud mental basado en la evaluación psicosocial (Decreto 1072 de 2015, art. 2.2.4.13.4) | Según PRG-03 | Responsable del SG-SST / ARL |
| Seguimiento a restricciones y recomendaciones médicas (FOR-02) | Mensual | Responsable del SG-SST |
| Semana de la salud con tamizajes de la EPS o la ARL (buena práctica) | Anual (propuesta) | Responsable del SG-SST |
| Vacunación, solo cuando la matriz de peligros la define como control para un riesgo biológico del cargo (Decreto 1072 de 2015, art. 2.2.4.6.24) | Según el esquema indicado por el médico | Responsable del SG-SST / EPS |

Las periodicidades marcadas como "propuesta" las define la empresa; no las fija una norma.

## Programa de pausas activas

La empresa implementa y ejecuta un programa de pausas activas durante la jornada, para todos los trabajadores dependientes e independientes (Resolución 1843 de 2025, art. 5 literal h).

- **Qué:** ejercicios de movilidad, estiramiento, respiración y relajación visual y mental, orientados a los peligros biomecánicos y psicosociales de la matriz.
- **Cuándo:** al menos una pausa en cada media jornada, de 5 a 10 minutos.
- **Quién:** las dirigen líderes capacitados, con asesoría de la ARL (art. 6 literal d).
- **Respeto:** se respetan la libertad de conciencia, los credos, el estado de salud, las posturas culturales y políticas y las formas de vida, sin discriminación. El trabajador puede informar sus objeciones o limitaciones de salud y se le ofrece una alternativa (art. 5 literal h; art. 7 literal f).
- **Registro:** asistencia mensual por área.

## Restricciones y recomendaciones médico-laborales

- **Comunicación:** el concepto y las recomendaciones se comunican por escrito a cada trabajador y se conserva la evidencia (Resolución 1843 de 2025, art. 5 literal i). Se registran en el formato FOR-02.
- **Adaptación:** cuando hay recomendaciones o restricciones, la empresa adapta las condiciones de trabajo en máximo veinte (20) días hábiles después de la evaluación (art. 5 literal f).
- **Recomendaciones de médicos tratantes:** también se cumplen las que emiten la EPS o la ARL. Según el caso, la empresa adecúa el puesto, reubica al trabajador o hace la readaptación (Resolución 0312 de 2019, estándar 3.1.6).
- **Calificación de origen:** cuando se requiera, la empresa entrega a quienes califican en primera oportunidad o a las Juntas de Calificación de Invalidez los documentos que le corresponden, y conserva la constancia de recibido (estándar 3.1.6).
- **Seguimiento:** el cumplimiento se verifica cada mes.

## Servicios de higiene

La empresa garantiza agua potable, servicios sanitarios suficientes y en buen estado, y mecanismos de disposición de excretas, basuras y residuos. Esto se verifica mediante inspecciones (Resolución 0312 de 2019, estándares 3.1.8 y 3.1.9).

## Indicadores

- Cumplimiento de evaluaciones médicas: (evaluaciones realizadas / programadas) × 100.
- Cumplimiento de recomendaciones: (recomendaciones implementadas dentro de los 20 días hábiles / emitidas) × 100.
- Ausentismo por causa médica (mensual), prevalencia e incidencia de enfermedad laboral (anual) (Resolución 0312 de 2019, art. 30).
