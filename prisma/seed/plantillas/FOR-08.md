---
codigo: FOR-08
nombre: Registro y análisis estadístico de accidentes, incidentes y enfermedades laborales
tipo: FOR
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.2.1","3.2.2","3.2.3","3.3.1","3.3.2","3.3.3","3.3.4","3.3.5","3.3.6"]
normas: ["RES-0312-2019","RES-1401-2007","DEC-1072-2015","DL-1295-1994"]
---
## Objetivo

Registrar los accidentes de trabajo, incidentes y enfermedades laborales de **{{empresa.razonSocial}}**, su reporte, su investigación y las acciones derivadas, y analizarlos estadísticamente para identificar tendencias y tomar medidas. La empresa lleva estadísticas de los accidentes de trabajo y las enfermedades laborales que miden su frecuencia y su gravedad (Decreto Ley 1295 de 1994, art. 61; Resolución 0312 de 2019, estándares 3.2.1, 3.2.2, 3.2.3 y 3.3.1 a 3.3.6; Decreto 1072 de 2015, art. 2.2.4.6.32).

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
| Días de ausencia por enfermedad común | {{accidentalidad.resumen.diasAusentismo}} |

Los eventos investigados, los reportados y las acciones cerradas son la base de los indicadores de cumplimiento del reporte y la investigación y de ejecución de las acciones derivadas (Decreto 1072 de 2015, arts. 2.2.4.6.21 nums. 6 y 9, y 2.2.4.6.22 num. 5).

## Indicadores mínimos de accidentalidad y enfermedad laboral (Res. 0312/2019 art. 30)

| Indicador | Fórmula | Periodicidad | Datos de {{accidentalidad.resumen.anio}} | Resultado {{accidentalidad.resumen.anio}} | Resultado del año anterior |
|---|---|---|---|---|---|
| Frecuencia de accidentalidad (est. 3.3.2) | (N.º de accidentes de trabajo en el mes / N.º de trabajadores en el mes) × 100 | Mensual | {{accidentalidad.resumen.at}} accidentes en el año | ______ | ______ |
| Severidad de accidentalidad (est. 3.3.1) | (N.º de días de incapacidad por accidente de trabajo en el mes + N.º de días cargados en el mes / N.º de trabajadores en el mes) × 100 | Mensual | {{accidentalidad.resumen.diasAt}} días de incapacidad y cargados en el año | ______ | ______ |
| Proporción de accidentes de trabajo mortales (est. 3.3.3) | (N.º de accidentes de trabajo mortales en el año / N.º total de accidentes de trabajo en el año) × 100 | Anual | {{accidentalidad.resumen.mortales}} mortales de {{accidentalidad.resumen.at}} accidentes | ______ | ______ |
| Prevalencia de la enfermedad laboral (est. 3.3.4) | (N.º de casos nuevos y antiguos de enfermedad laboral en el periodo / Promedio de trabajadores en el periodo) × 100.000 | Anual | Casos nuevos y antiguos: ______ | ______ | ______ |
| Incidencia de la enfermedad laboral (est. 3.3.5) | (N.º de casos nuevos de enfermedad laboral en el periodo / Promedio de trabajadores en el periodo) × 100.000 | Anual | {{accidentalidad.resumen.el}} enfermedades laborales registradas en el año (separar nuevas y antiguas) | ______ | ______ |
| Ausentismo por causa médica (est. 3.3.6) | (N.º de días de ausencia por incapacidad laboral o común en el mes / N.º de días de trabajo programados en el mes) × 100 | Mensual | {{accidentalidad.resumen.diasAusentismo}} días por enfermedad común y {{accidentalidad.resumen.diasAt}} por accidentes en el año | ______ | ______ |

Los días cargados se suman solo en la severidad, cuando el accidente o la enfermedad causa muerte, invalidez o incapacidad permanente parcial (art. 30). Los indicadores mensuales se calculan con el número de trabajadores del mes, incluidos contratistas, aprendices y trabajadores en misión; el detalle mes a mes está en el informe de gestión. El resultado del año anterior permite comparar la tendencia; se toma del FOR-08 cerrado de ese año.

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

Comparación con el año anterior (aumentó, disminuyó o se mantuvo cada indicador y por qué): ______

Conclusiones del análisis (cargos, formas del evento, partes del cuerpo y lugares más afectados, y peligros relacionados): ______

Medidas que se adoptan a partir de estas conclusiones, con responsable y fecha: ______

El registro del año en curso y el del año anterior, junto con este análisis y sus conclusiones, son la evidencia del estándar 3.2.3 (Resolución 0312 de 2019).

## Uso de los resultados

Los resultados alimentan la actualización de la matriz de peligros, el plan anual de trabajo, las acciones correctivas y preventivas (FOR-06) y la revisión por la alta dirección (ACT-06). A la alta dirección se le informa el ausentismo causado por incidentes, accidentes de trabajo y enfermedades laborales (Decreto 1072 de 2015, art. 2.2.4.6.32 num. 3).
