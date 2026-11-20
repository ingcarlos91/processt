---
codigo: DOC-12
nombre: Registro anual de indicadores mínimos de SST
tipo: DOC
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.3.1","3.3.2","3.3.3","3.3.4","3.3.5","3.3.6"]
normas: ["RES-0312-2019","DEC-1072-2015"]
---
## Objetivo

Llevar el registro anual de los indicadores mínimos de SST de **{{empresa.razonSocial}}** para {{anio}}: frecuencia y severidad de la accidentalidad, proporción de accidentes de trabajo mortales, prevalencia e incidencia de la enfermedad laboral y ausentismo por causa médica (Resolución 0312 de 2019, art. 30).{{#if (eq empresa.nivel 60)}} Soporta los estándares 3.3.1 a 3.3.6.{{/if}}

## Población que se cuenta

Los indicadores cuentan a todos los que trabajan para la empresa: trabajadores dependientes e independientes, trabajadores en misión, cooperados, estudiantes y cualquier persona que labore en sus instalaciones, sea cual sea su forma de contratación (Resolución 0312 de 2019, art. 30, num. 1).

Todo accidente o enfermedad que genere una incapacidad temporal de un día o más se reporta y se cuenta en los indicadores. La empresa no usa mecanismos ni incentivos que desestimulen el reporte (art. 30, nums. 2, 3 y 5).

## Fórmulas (art. 30)

| Indicador | Fórmula | Periodicidad |
|---|---|---|
| Frecuencia de accidentalidad | (N.º de accidentes de trabajo en el mes / N.º de trabajadores en el mes) × 100 | Mensual |
| Severidad de accidentalidad | ((N.º de días de incapacidad por accidente de trabajo en el mes + N.º de días cargados en el mes) / N.º de trabajadores en el mes) × 100 | Mensual |
| Proporción de accidentes de trabajo mortales | (N.º de accidentes de trabajo mortales en el año / N.º total de accidentes de trabajo en el año) × 100 | Anual |
| Prevalencia de la enfermedad laboral | (N.º de casos nuevos y antiguos de enfermedad laboral en el periodo / promedio de trabajadores en el periodo) × 100.000 | Anual |
| Incidencia de la enfermedad laboral | (N.º de casos nuevos de enfermedad laboral en el periodo / promedio de trabajadores en el periodo) × 100.000 | Anual |
| Ausentismo por causa médica | (N.º de días de ausencia por incapacidad laboral o común en el mes / N.º de días de trabajo programados en el mes) × 100 | Mensual |

Definiciones del art. 30:
- **Casos de enfermedad laboral:** enfermedades calificadas como laborales, no número de personas.
- **Días cargados:** días que se asignan a una lesión que causa muerte, invalidez o incapacidad permanente parcial; solo se usan en la severidad.
- **Días de trabajo programados en el mes:** días de trabajo programados por la empresa multiplicados por el número de trabajadores.
- La constante 100.000 sigue la recomendación de la Organización Mundial de la Salud.

## Registro mensual

Datos de {{accidentalidad.indicadores.anio}} calculados con los eventos registrados y el número de trabajadores de cada mes (planta, misión, contratistas y aprendices; sin visitantes). Los meses aún no transcurridos quedan en blanco.{{#if accidentalidad.indicadores.estimado}} Donde dice "estimado", el mes no se registró y se usó el número de trabajadores de la empresa y 24 días programados por trabajador; se corrige en Indicadores.{{/if}}

| Mes | Trabajadores | Accidentes de trabajo | Días de incapacidad por AT | Días cargados | Días de ausencia por incapacidad | Días programados | Frecuencia | Severidad | Ausentismo (%) |
|---|---|---|---|---|---|---|---|---|---|
{{#each accidentalidad.indicadores.meses}}
| {{mes}} | {{trabajadores}} | {{accidentes}} | {{diasIncapacidad}} | {{diasCargados}} | {{diasAusencia}} | {{diasProgramados}} | {{frecuencia}} | {{severidad}} | {{ausentismo}} |
{{/each}}
| **Año (promedio mensual)** | {{accidentalidad.indicadores.promedioTrabajadores}} | {{accidentalidad.resumen.at}} | | | | | {{accidentalidad.indicadores.frecuencia}} | {{accidentalidad.indicadores.severidad}} | {{accidentalidad.indicadores.ausentismo}} |

## Resultado anual

| Indicador | Resultado {{accidentalidad.indicadores.anio}} | Año anterior ({{accidentalidad.anterior.indicadores.anio}}) | Interpretación |
|---|---|---|---|
| Frecuencia de accidentalidad (promedio mensual) | {{accidentalidad.indicadores.frecuencia}} | {{accidentalidad.anterior.indicadores.frecuencia}} | Por cada 100 trabajadores que laboraron en el mes se presentaron {{accidentalidad.indicadores.frecuencia}} accidentes de trabajo |
| Severidad de accidentalidad (promedio mensual) | {{accidentalidad.indicadores.severidad}} | {{accidentalidad.anterior.indicadores.severidad}} | Por cada 100 trabajadores que laboraron en el mes se perdieron {{accidentalidad.indicadores.severidad}} días por accidente de trabajo |
| Proporción de accidentes de trabajo mortales | {{accidentalidad.indicadores.mortalidad}} | {{accidentalidad.anterior.indicadores.mortalidad}} | En el año, el {{accidentalidad.indicadores.mortalidad}} de los accidentes de trabajo fueron mortales |
| Prevalencia de la enfermedad laboral | {{accidentalidad.indicadores.prevalencia}} | {{accidentalidad.anterior.indicadores.prevalencia}} | Por cada 100.000 trabajadores existen {{accidentalidad.indicadores.prevalencia}} casos de enfermedad laboral ({{accidentalidad.resumen.elPrevalentes}} caso(s) nuevos y antiguos) |
| Incidencia de la enfermedad laboral | {{accidentalidad.indicadores.incidencia}} | {{accidentalidad.anterior.indicadores.incidencia}} | Por cada 100.000 trabajadores existen {{accidentalidad.indicadores.incidencia}} casos nuevos de enfermedad laboral |
| Ausentismo por causa médica | {{accidentalidad.indicadores.ausentismo}} | {{accidentalidad.anterior.indicadores.ausentismo}} | Porcentaje de los días programados que se perdió por incapacidad laboral o común |
| Promedio de trabajadores del año | {{accidentalidad.indicadores.promedioTrabajadores}} | {{accidentalidad.anterior.indicadores.promedioTrabajadores}} | |

Resumen de eventos registrados: {{accidentalidad.resumen.texto}}

## Análisis y acciones

La frecuencia y la severidad se interpretan por cada 100 trabajadores que laboraron en el mes; no son porcentajes. Los resultados se analizan, se comparan con el periodo anterior y alimentan la revisión por la alta dirección y las acciones preventivas y correctivas (Decreto 1072 de 2015, arts. 2.2.4.6.31 y 2.2.4.6.33). Cada indicador tiene su ficha técnica en el documento de objetivos e indicadores (art. 2.2.4.6.19).

Análisis: ______________________.

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST — {{responsable.doc}}
