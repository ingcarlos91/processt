---
codigo: MTZ-01
nombre: Matriz de requisitos legales en SST
tipo: MTZ
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.7.1"]
normas: ["DEC-1072-2015","RES-0312-2019","GTC-45-2012"]
---
## Objetivo

Identificar la normatividad nacional vigente del Sistema General de Riesgos Laborales aplicable a **{{empresa.razonSocial}}**, y la evidencia con la que se demuestra su cumplimiento (Decreto 1072 de 2015, art. 2.2.4.6.8 parágrafo; Resolución 0312 de 2019, estándar 2.7.1).

## Criterios de aplicabilidad

La aplicabilidad se determinó con base en: actividad económica (CIIU {{empresa.ciiu}}), clase de riesgo {{empresa.claseRiesgoRomano}}, número de trabajadores ({{empresa.trabajadores}}), vehículos ({{empresa.vehiculos}}) y peligros identificados en la matriz de peligros.

## Matriz

| N.º | Tipo | Número | Año | Entidad | Tema | Artículos aplicables | Descripción | Evidencia de cumplimiento | Cumple |
|---|---|---|---|---|---|---|---|---|---|
{{#each normas}}
| {{inc @index}} | {{tipo}} | {{numero}} | {{anio}} | {{celda entidad}} | {{celda nombre}} | {{#if articulosClave}}{{celda articulosClave}}{{else}}Por precisar: la consultora indica los artículos aplicables{{/if}} | {{celda resumen}} | {{celda evidenciaCumplimiento}} | {{cumple}} |
{{/each}}

## Normas técnicas aplicables según los peligros

La matriz incluye también las normas técnicas que la empresa debe cumplir según los peligros identificados (Resolución 0312 de 2019, estándar 2.7.1). La metodología de identificación de peligros sigue la Guía Técnica Colombiana GTC 45. La consultora registra aquí las normas técnicas de producto o de servicio exigidas para los controles de la matriz de peligros (elementos de protección personal, equipos contra incendio, señalización, equipos de protección contra caídas, etc.), con la referencia exacta de la norma técnica que exija el fabricante, el proveedor o la norma legal que la invoque.

| Peligro o control | Norma técnica | Requisito aplicable | Evidencia de cumplimiento | Cumple |
|---|---|---|---|---|
| Identificación de peligros y valoración de riesgos | GTC 45 de 2012 | Metodología de la matriz de peligros | Matriz de peligros vigente | |
| | | | | |
| | | | | |

## Actualización

La matriz legal se actualiza en la medida en que se expidan nuevas disposiciones aplicables a la empresa (Decreto 1072 de 2015, art. 2.2.4.6.8 parágrafo), cuando cambien las condiciones de la empresa (gestión del cambio, art. 2.2.4.6.26) y, como mínimo, en la evaluación anual del SG-SST (art. 2.2.4.6.16 numeral 1). Última actualización: {{fecha}}.

Elaboró: {{responsable.nombre}} — Licencia SST {{default responsable.licencia "______"}}
