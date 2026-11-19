---
codigo: PLN-01
nombre: Plan anual de trabajo del SG-SST
tipo: PLN
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.4.1"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Establecer las actividades, responsables, recursos y cronograma para alcanzar los objetivos del SG-SST de **{{empresa.razonSocial}}** durante el periodo enero a diciembre de {{anio}} (Decreto 1072 de 2015, art. 2.2.4.6.17 parágrafo 2; Resolución 0312 de 2019, estándar 2.4.1 y art. 26).

## Objetivos y metas

| Objetivo | Meta |
|---|---|
| Ejecutar el plan anual de trabajo | ≥ 90 % de actividades ejecutadas |
| Intervenir los riesgos prioritarios | 100 % de riesgos nivel I y II con medidas |
| Cumplir los estándares mínimos | Autoevaluación > 85 % |
| Ejecutar el programa de capacitación | ≥ 90 % de cobertura |

## Cronograma de actividades

| Mes | Actividad | Estándar | Responsable | Recursos | Fundamento |
|---|---|---|---|---|---|
{{#each plan}}
| {{mesNombre}} | {{celda actividad}} | {{estandar}} | {{responsable}} | {{recursos}} | {{celda normaRef}} |
{{/each}}

## Seguimiento

El responsable del SG-SST hará seguimiento mensual a la ejecución del plan y calculará el indicador de cumplimiento (actividades ejecutadas / actividades programadas × 100). El resultado se informa a la alta dirección y al {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}}.

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal (empleador)

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST
