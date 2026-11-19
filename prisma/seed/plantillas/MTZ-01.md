---
codigo: MTZ-01
nombre: Matriz de requisitos legales en SST
tipo: MTZ
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.7.1"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Identificar la normatividad nacional vigente del Sistema General de Riesgos Laborales aplicable a **{{empresa.razonSocial}}**, y la evidencia con la que se demuestra su cumplimiento (Decreto 1072 de 2015, art. 2.2.4.6.8 parágrafo; Resolución 0312 de 2019, estándar 2.7.1).

## Criterios de aplicabilidad

La aplicabilidad se determinó con base en: actividad económica (CIIU {{empresa.ciiu}}), clase de riesgo {{empresa.claseRiesgoRomano}}, número de trabajadores ({{empresa.trabajadores}}), vehículos ({{empresa.vehiculos}}) y peligros identificados en la matriz de peligros.

## Matriz

| N.º | Tipo | Número | Año | Entidad | Tema | Artículos aplicables | Descripción | Evidencia de cumplimiento | Cumple |
|---|---|---|---|---|---|---|---|---|---|
{{#each normas}}
| {{inc @index}} | {{tipo}} | {{numero}} | {{anio}} | {{celda entidad}} | {{celda nombre}} | {{celda articulosClave}} | {{celda resumen}} | {{celda evidenciaCumplimiento}} | |
{{/each}}

## Actualización

La matriz legal se revisa como mínimo una vez al año y cada vez que se expida una norma aplicable o cambien las condiciones de la empresa. Última actualización: {{fecha}}.

Elaboró: {{responsable.nombre}} — Licencia SST {{default responsable.licencia "______"}}
