---
codigo: DOC-07
nombre: Perfil de cargo (profesiograma) para las evaluaciones médicas ocupacionales
tipo: DOC
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.1.3","3.1.4"]
normas: ["RES-1843-2025","DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Documentar el **perfil de cargo** (conocido en la práctica como profesiograma) de cada cargo de **{{empresa.razonSocial}}**. El empleador lo elabora y lo entrega al prestador de las evaluaciones médicas ocupacionales para orientar los énfasis de cada evaluación (Resolución 1843 de 2025, arts. 3 literal m, 5 literal d y 16; Resolución 0312 de 2019, estándares 3.1.3 y 3.1.4). El empleador garantiza que la información sea precisa y que quien la recoge sea idóneo (art. 16 literal a).

Junto con este documento se entregan al prestador (art. 16 literales b a e):
- la matriz de identificación de peligros, evaluación y valoración de riesgos (MTZ-01);
- los indicadores epidemiológicos de exposición y condiciones de salud por cargo;
- los estudios técnicos disponibles (higiene industrial, evaluación psicosocial, evaluación biomecánica, cancerígenos);
- los indicadores biológicos, cuando existan.

> El médico especialista en SST o medicina del trabajo de la IPS revisa este perfil y recomienda los énfasis y exámenes complementarios definitivos; si la información es insuficiente puede pedir más (art. 16 parágrafo 2).

## Perfiles por cargo

{{#each cargos}}
### {{inc @index}}. {{nombre}} ({{nPersonas}} persona{{#if (gt nPersonas 1)}}s{{/if}})

| Elemento del perfil (Res. 1843/2025, art. 16 lit. a) | Descripción |
|---|---|
| i) Funciones | {{celda (default funciones "Ver descripción del cargo.")}} |
| Tareas | {{celda (join tareas "; ")}} |
| ii) Responsabilidades | |
| iii) Habilidades | |
| iv) Competencias | |
| v) Requisitos físicos | |
| v) Requisitos mentales | |
| v) Requisitos técnicos | |

**vi) Riesgos laborales asociados a las tareas:**

| Clasificación | Peligro | Nivel de riesgo |
|---|---|---|
{{#each peligros}}
| {{clasificacion}} | {{celda descripcion}} | {{nivelRiesgo}} |
{{/each}}

**vii) Medidas preventivas:** las de la matriz de peligros para este cargo (controles en la fuente, el medio y el individuo){{#if epp.length}}; elementos de protección personal: {{join epp ", "}}{{/if}}.

**Evaluaciones médicas y exámenes complementarios propuestos** (los confirma el médico; la periodicidad la define la empresa con justificación técnica, art. 15):

| Examen | Pre-ingreso | Periódica | Periodicidad y justificación | Egreso |
|---|---|---|---|---|
{{#each examenes}}
| {{this}} | ☐ | ☐ | | ☐ |
{{/each}}

{{#if altoRiesgo.length}}**Tareas de alto riesgo:** {{join altoRiesgo ", "}}. Requieren el certificado de aptitud específico de su régimen, con la vigencia de su propia norma (Resolución 1843 de 2025, art. 15 parágrafo 1).{{/if}}

{{/each}}

## Constancia sobre pruebas prohibidas

Las evaluaciones de pre-ingreso enlistadas en este documento **no incluyen prueba de embarazo** (Resolución 1843 de 2025, art. 22). Tampoco se exige VIH ni VDRL como requisito de ingreso o permanencia (art. 21). Si las evaluaciones de pre-ingreso incluyen exámenes de sangre, la candidata puede elegir el centro médico o laboratorio, siempre que esté reconocido por el Ministerio de Salud (art. 22).

## Tipos de evaluación, periodicidad y criterios (Resolución 1843 de 2025)

- **Pre-ingreso** (art. 9): antes del inicio de labores, según el perfil del cargo.
- **Periódicas programadas y por cambio de ocupación** (art. 10): con la periodicidad que la empresa define en el SG-SST, justificada técnicamente según el tipo, la magnitud y la frecuencia de la exposición del cargo y los criterios de los PVE (arts. 10 literal A y 15). El máximo de tres (3) años solo se admite en caso excepcional. Por cambio de ocupación, antes de asumir las nuevas funciones cuando cambien o aumenten los peligros.
- **Egreso** (art. 11): dentro de los cinco (5) días hábiles siguientes a la terminación del vínculo; se conserva la constancia de notificación al trabajador.
- **Retorno laboral** (art. 12): antes del reintegro, tras una ausencia por causa no médica de noventa (90) días calendario o más.
- **Post-incapacidad** (art. 13): tras una incapacidad de treinta (30) días calendario o más.
- **Seguimiento** (art. 14): cuando se necesite verificar una condición de salud, la efectividad de las medidas o revisar restricciones temporales.
- **Quién evalúa:** un médico especialista en SST con licencia vigente (arts. 17 y 26).
- **Concepto:** la empresa recibe solo el concepto con las recomendaciones o restricciones, su temporalidad y si se requiere seguimiento. No se usa "no apto", salvo en los regímenes especiales de aptitud (art. 19 parágrafo). En la práctica se registra como apto, apto con recomendaciones o apto con restricciones. Se comunica por escrito a cada trabajador, con evidencia (art. 5 literal i), y la empresa adapta el puesto en máximo veinte (20) días hábiles (art. 5 literal f).
- **Costo:** lo asume en su totalidad el empleador; la ARL no puede pagarlas (arts. 5 literal a, 6 y 26 parágrafo 2).
- **Historia clínica:** la custodia el prestador durante mínimo veinte (20) años; la empresa no conserva copia (art. 30).

## Entrega al prestador

Constancia de entrega y recibido del perfil de cargo, la matriz de peligros y los demás documentos (Resolución 1843 de 2025, art. 5 literal d y art. 16 parágrafo 1; Resolución 0312 de 2019, estándar 3.1.3).

| Documento | Fecha de entrega | Medio | Recibido por (IPS) |
|---|---|---|---|
| Perfil de cargo (este documento) | | | |
| Matriz de peligros | | | |
| Indicadores epidemiológicos / estudios técnicos | | | |

Elaboró: {{responsable.nombre}} — Licencia SST {{default responsable.licencia "______"}}  |  Fecha: {{fecha}}

IPS: {{op.ips}}

Revisó (médico de la IPS): {{op.medicoIps.nombre}}  Documento: {{default op.medicoIps.cedula "__________"}}  Licencia SST: __________  Firma: __________
