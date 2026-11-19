---
codigo: PRG-10
nombre: Programa de auditoría interna del SG-SST
tipo: PRG
nivelMin: 60
carpeta: 6. Verificación del SG-SST
estandares: ["6.1.2","6.1.4"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Verificar anualmente el cumplimiento del SG-SST de **{{empresa.razonSocial}}** (Decreto 1072 de 2015, arts. 2.2.4.6.29 y 2.2.4.6.30).

## Planificación

- Periodicidad: anual.
- Planificación con la participación del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} (estándar 6.1.4).
- Auditor: persona idónea e independiente de la actividad auditada; no puede auditar su propio trabajo.
- Metodología: revisión documental, entrevistas, observación en campo.

## Alcance (art. 2.2.4.6.30)

| N.º | Aspecto | Hallazgos |
|---|---|---|
| 1 | Cumplimiento de la política de SST | |
| 2 | Resultado de los indicadores de estructura, proceso y resultado | |
| 3 | Participación de los trabajadores | |
| 4 | Responsabilidad y rendición de cuentas | |
| 5 | Mecanismo de comunicación del SG-SST | |
| 6 | Planificación, desarrollo y aplicación del SG-SST | |
| 7 | Gestión del cambio | |
| 8 | Consideración de SST en nuevas adquisiciones | |
| 9 | Alcance y aplicación del SG-SST frente a proveedores y contratistas | |
| 10 | Supervisión y medición de los resultados | |
| 11 | Proceso de investigación de incidentes, accidentes y enfermedades | |
| 12 | Desarrollo del proceso de auditoría | |
| 13 | Evaluación por parte de la alta dirección | |

## Auditorías realizadas

{{#if hayAuditorias}}
| Año | Inicio | Cierre | Auditor | Estado | Conformidad | No conformidades | Acciones |
|---|---|---|---|---|---|---|---|
{{#each auditorias}}
| {{anio}} | {{fecha}} | {{cierre}} | {{celda auditor}} | {{estado}} | {{conformidad}} | {{noConformes}} | {{acciones}} |
{{/each}}
{{else}}
Las auditorías se realizan en PROCESST con los aspectos del art. 2.2.4.6.30 y generan su informe; aquí se consolidan.
{{/if}}

## Informe

El informe se comunica a los responsables de adoptar las medidas preventivas, correctivas o de mejora y alimenta la revisión por la alta dirección.
