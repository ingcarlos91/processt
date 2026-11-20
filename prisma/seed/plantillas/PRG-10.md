---
codigo: PRG-10
nombre: Programa de auditoría interna del SG-SST
tipo: PRG
nivelMin: 7
carpeta: 6. Verificación del SG-SST
estandares: ["6.1.2","6.1.4"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Verificar anualmente el cumplimiento del SG-SST de **{{empresa.razonSocial}}** (Decreto 1072 de 2015, arts. 2.2.4.6.29 y 2.2.4.6.30).

{{#if (eq empresa.nivel 60)}}La auditoría corresponde a los estándares 6.1.2 y 6.1.4 de la Resolución 0312 de 2019.{{else}}La Resolución 0312 de 2019 no califica la auditoría entre los {{empresa.nivel}} estándares de la empresa, pero el Decreto 1072 de 2015 (art. 2.2.4.6.29) la exige a todo empleador, sin distinguir su tamaño. Por eso se hace una auditoría anual en versión simplificada, proporcional al tamaño de la empresa.{{/if}}

## Planificación

El programa de auditoría define la competencia del auditor, el alcance, la periodicidad, la metodología y la presentación de informes (Decreto 1072 de 2015, art. 2.2.4.6.29, parágrafo).

- **Periodicidad:** al menos una vez al año (art. 2.2.4.6.29).
- **Participación:** la auditoría se planifica con el {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} (art. 2.2.4.6.29{{#if (eq empresa.nivel 60)}}; estándar 6.1.4{{/if}}).
- **Competencia del auditor (la define la empresa):** persona con formación en SST (licencia en SST o curso de 50 horas) y conocimiento del Decreto 1072 de 2015 y de la Resolución 0312 de 2019. Si es interna, debe ser independiente de la actividad, área o proceso auditado y no puede auditar su propio trabajo; por eso no audita su gestión el responsable del SG-SST (art. 2.2.4.6.29 y parágrafo). La contratación del auditor no implica aumentar la planta de personal.
- **Metodología:** revisión documental, entrevistas y observación en campo, con los 13 aspectos de la tabla de alcance.
- **Auditorías previas:** se revisan los hallazgos de la auditoría anterior y el cierre de sus acciones antes de iniciar (art. 2.2.4.6.29, parágrafo).
- **Informe:** se emite al cierre y se comunica según la sección Informe.

## Alcance (art. 2.2.4.6.30)

| N.º | Aspecto | Hallazgos |
|---|---|---|
| 1 | Cumplimiento de la política de SST | |
| 2 | Resultado de los indicadores de estructura, proceso y resultado | |
| 3 | Participación de los trabajadores | |
| 4 | Responsabilidad y obligación de rendir cuentas | |
| 5 | Comunicación de los contenidos del SG-SST a los trabajadores | |
| 6 | Planificación, desarrollo y aplicación del SG-SST | |
| 7 | Gestión del cambio | |
| 8 | Consideración de la SST en las nuevas adquisiciones | |
| 9 | Alcance y aplicación del SG-SST frente a proveedores y contratistas | |
| 10 | Supervisión y medición de los resultados | |
| 11 | Proceso de investigación de incidentes, accidentes y enfermedades laborales y su efecto en el mejoramiento | |
| 12 | Desarrollo del proceso de auditoría | |
| 13 | Evaluación por parte de la alta dirección | |

## Auditorías realizadas

{{#if hayAuditorias}}
| Año | Inicio | Cierre | Auditor | Estado | Conformidad | No conformidades | Acciones |
|---|---|---|---|---|---|---|---|
{{#each auditorias}}
| {{anio}} | {{fecha}} | {{cierre}} | {{celda auditor}} | {{estado}} | {{conformidad}} | {{noConformes}} | {{acciones}} |
{{/each}}

Los resultados de estas auditorías se tienen en cuenta al planear la siguiente (art. 2.2.4.6.29, parágrafo).
{{else}}
Las auditorías se realizan en PROCESST con los aspectos del art. 2.2.4.6.30 y generan su informe; aquí se consolidan.
{{/if}}

## Informe

Los resultados de la auditoría se comunican a los responsables de adoptar las medidas preventivas, correctivas o de mejora (Decreto 1072 de 2015, art. 2.2.4.6.29). Las acciones se registran en el formato de acciones correctivas, preventivas y de mejora (FOR-06) y los resultados alimentan la revisión por la alta dirección (art. 2.2.4.6.31).

| Comunicado a | Cargo | Fecha |
|---|---|---|
| | | |
