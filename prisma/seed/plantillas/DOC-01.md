---
codigo: DOC-01
nombre: Objetivos e indicadores del SG-SST
tipo: DOC
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.2.1","6.1.1"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo del documento

Definir los objetivos del SG-SST de **{{empresa.razonSocial}}** para el año {{anio}}, sus metas y los indicadores con los que se medirán, en coherencia con la política de SST y el plan anual de trabajo (Decreto 1072 de 2015, arts. 2.2.4.6.18 y 2.2.4.6.19 a 2.2.4.6.22).

## Objetivos y metas

| N.º | Objetivo | Meta | Indicador |
|---|---|---|---|
| 1 | Identificar los peligros, evaluar y valorar los riesgos y establecer controles | 100 % de los riesgos prioritarios (nivel I y II) con medidas de intervención implementadas | Intervención de riesgos prioritarios |
| 2 | Proteger la seguridad y salud de los trabajadores mediante la prevención de accidentes y enfermedades | Reducir la frecuencia de accidentalidad frente al año anterior y mantener 0 accidentes mortales | Frecuencia, severidad y mortalidad |
| 3 | Cumplir la normatividad vigente y los estándares mínimos | Autoevaluación de estándares mínimos superior al 85 % | Cumplimiento de estándares mínimos |
| 4 | Ejecutar el plan anual de trabajo | Cumplimiento igual o superior al 90 % | Cumplimiento del plan anual |
| 5 | Desarrollar las competencias en SST de los trabajadores | Cobertura del programa de capacitación igual o superior al 90 % | Cobertura de capacitación |
| 6 | Promover la salud física y mental de los trabajadores | Ausentismo por causa médica inferior al año anterior | Ausentismo por causa médica |

Los objetivos son claros, medibles y cuantificables, adecuados al tamaño y actividad de la empresa, coherentes con el plan anual, documentados y comunicados a los trabajadores, y se revisarán al menos una vez al año.

## Fichas técnicas de los indicadores

{{#each indicadores}}
### {{inc @index}}. {{nombre}} ({{tipo}})

| Campo | Contenido |
|---|---|
| Definición | {{definicion}} |
| Interpretación | {{interpretacion}} |
| Límite / meta | {{meta}} |
| Método de cálculo | {{formula}} |
| Fuente de información | {{fuente}} |
| Periodicidad | {{periodicidad}} |
| Responsable | {{responsable}} |
| Personas que deben conocer el resultado | {{quienConoce}} |

{{/each}}

## Aprobación

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST
