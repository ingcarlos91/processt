---
codigo: FOR-08
nombre: Registro y análisis estadístico de accidentes, incidentes y enfermedades laborales
tipo: FOR
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.2.1","3.2.2","3.2.3"]
normas: ["RES-0312-2019","RES-1401-2007","DEC-1072-2015","DL-1295-1994"]
---
## Objetivo

Registrar los accidentes de trabajo, incidentes y enfermedades laborales de **{{empresa.razonSocial}}**, su reporte, su investigación y las acciones derivadas, y analizarlos estadísticamente para identificar tendencias y tomar medidas (Resolución 0312 de 2019, estándares 3.2.1, 3.2.2 y 3.2.3; Decreto 1072 de 2015, art. 2.2.4.6.32).

## Resumen del año {{accidentalidad.resumen.anio}}

{{accidentalidad.resumen.texto}}

| Indicador | Valor |
|---|---|
| Accidentes de trabajo | {{accidentalidad.resumen.at}} |
| Accidentes graves | {{accidentalidad.resumen.graves}} |
| Accidentes mortales | {{accidentalidad.resumen.mortales}} |
| Incidentes | {{accidentalidad.resumen.incidentes}} |
| Enfermedades laborales | {{accidentalidad.resumen.el}} |
| Días perdidos por accidentes | {{accidentalidad.resumen.diasAt}} |
| Eventos investigados / por investigar | {{accidentalidad.resumen.investigados}} / {{accidentalidad.resumen.investigables}} |
| Reportados a la ARL / reportables | {{accidentalidad.resumen.reportados}} / {{accidentalidad.resumen.reportables}} |
| Acciones cerradas / abiertas | {{accidentalidad.resumen.accionesCerradas}} / {{accidentalidad.resumen.accionesAbiertas}} |

Los indicadores de frecuencia, severidad, mortalidad, prevalencia, incidencia y ausentismo se calculan mes a mes según el artículo 30 de la Resolución 0312 de 2019.

## Registro de eventos

| Fecha | Tipo | Gravedad | Trabajador | Cargo | Forma del evento | Lesión / parte del cuerpo | Días | Reporte ARL | Investigación | Acciones |
|---|---|---|---|---|---|---|---|---|---|---|
{{#if accidentalidad.eventos.length}}
{{#each accidentalidad.eventos}}
| {{fecha}} | {{tipo}} | {{gravedad}} | {{celda trabajador}} | {{celda cargo}} | {{celda mecanismo}} | {{celda lesion}}{{#if parteCuerpo}} / {{parteCuerpo}}{{/if}} | {{dias}} | {{reporte}} | {{investigacion}} | {{acciones}} |
{{/each}}
{{else}}
| | | | | | | | | | | |
| | | | | | | | | | | |
{{/if}}

## Análisis estadístico del año {{accidentalidad.resumen.anio}}

{{#if accidentalidad.hayAnio}}
**Por cargo (accidentes e incidentes)**

| Cargo | Eventos |
|---|---|
{{#each accidentalidad.porCargo}}
| {{celda nombre}} | {{n}} |
{{/each}}

**Por forma del evento**

| Forma | Eventos |
|---|---|
{{#each accidentalidad.porMecanismo}}
| {{celda nombre}} | {{n}} |
{{/each}}

**Por parte del cuerpo afectada (accidentes)**

| Parte del cuerpo | Accidentes |
|---|---|
{{#each accidentalidad.porParte}}
| {{celda nombre}} | {{n}} |
{{/each}}

**Por lugar**

| Lugar | Eventos |
|---|---|
{{#each accidentalidad.porLugar}}
| {{celda nombre}} | {{n}} |
{{/each}}
{{else}}
No se registran eventos en el año. El análisis se actualiza al registrar eventos en PROCESST.
{{/if}}

## Conclusiones y tendencias

______

## Uso de los resultados

Los resultados alimentan la actualización de la matriz de peligros, el plan anual de trabajo, las acciones correctivas y preventivas (FOR-06) y la revisión por la alta dirección (ACT-06).
