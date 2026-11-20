---
codigo: DOC-05
nombre: Evaluación inicial del SG-SST
tipo: DOC
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.3.1"]
normas: ["DEC-1072-2015","RES-0312-2019","LEY-1581-2012"]
---
## Objetivo

Identificar el estado del SG-SST de **{{empresa.razonSocial}}** frente a la normatividad vigente y los estándares mínimos, y establecer las prioridades para el plan anual de trabajo (Decreto 1072 de 2015, art. 2.2.4.6.16; Resolución 0312 de 2019, arts. 27 y 28).

La evaluación la realiza el responsable del SG-SST o una persona externa con licencia en SST (Resolución 0312 de 2019, art. 16, estándar 2.3.1) y se documenta como base para la planificación (Decreto 1072 de 2015, art. 2.2.4.6.16, parágrafo 2).

## Datos de la empresa

| Campo | Información |
|---|---|
| Razón social | {{empresa.razonSocial}} |
| NIT | {{empresa.nit}} |
| Actividad económica (CIIU) | {{empresa.ciiu}} — {{empresa.actividad}} |
| Clase de riesgo | {{empresa.claseRiesgoRomano}} |
| ARL | {{empresa.arl}} |
| Número de trabajadores | {{empresa.trabajadores}} (contratistas: {{empresa.contratistas}}) |
| Estándares mínimos aplicables | {{empresa.nivel}} |
| Evaluación que se toma | {{#if evaluacionInicial.existe}}{{evaluacionInicial.tipo}}{{else}}Sin evaluación inicial registrada{{/if}} |
| Fecha de evaluación | {{#if evaluacionInicial.existe}}{{evaluacionInicial.fecha}}{{else}}{{fecha}}{{/if}} |
| Evaluador | {{responsable.nombre}} — Licencia SST {{default responsable.licencia "______"}} |

## Aspectos evaluados (art. 2.2.4.6.16)

1. **Normatividad vigente en riesgos laborales, incluidos los estándares mínimos** (num. 1): se identificaron {{len normas}} normas aplicables (ver matriz legal).
2. **Identificación de peligros y valoración de riesgos, actualizada cada año** (num. 2): {{#if matriz.filas.length}}{{len matriz.filas}} peligros identificados, {{len matriz.prioritarios}} prioritarios (nivel I y II).{{else}}pendiente de elaborar la matriz de peligros.{{/if}}
3. **Amenazas y evaluación de la vulnerabilidad, cada año** (num. 3): {{#if amenazas.length}}se identificaron {{len amenazas}} amenazas ({{#each amenazas}}{{amenaza}}{{#unless @last}}, {{/unless}}{{/each}}); el análisis de vulnerabilidad está en el plan de prevención, preparación y respuesta ante emergencias.{{else}}pendiente del análisis de amenazas y vulnerabilidad.{{/if}} Resultado de la vulnerabilidad: ______________________.
4. **Efectividad de las medidas de control, incluidos los reportes de los trabajadores** (num. 4): se revisan los controles existentes de la matriz de peligros, las inspecciones y los reportes de condiciones y actos inseguros de los trabajadores. Resultado: ______________________.
5. **Cumplimiento del programa de capacitación anual, con inducción y reinducción para todos los trabajadores, cualquiera que sea su vinculación** (num. 5): {{#if nomina.hayCapacitaciones}}{{nomina.horasCapacitacion}} horas de capacitación registradas; cobertura {{nomina.cobertura}} de los trabajadores activos.{{else}}no hay capacitaciones registradas en el sistema.{{/if}}
6. **Evaluación de los puestos de trabajo en el marco de los programas de vigilancia epidemiológica** (num. 6): {{#if pve.length}}{{#each pve}}{{nombre}} ({{cargos}}){{#unless @last}}; {{/unless}}{{/each}}.{{else}}no se identificaron peligros que requieran programa de vigilancia epidemiológica.{{/if}}
7. **Descripción sociodemográfica y diagnóstico de condiciones de salud** (num. 7): {{#if nomina.perfil.hay}}{{nomina.total}} trabajadores activos. Sexo: {{#each nomina.perfil.sexo}}{{nombre}} {{pct}}{{#unless @last}}; {{/unless}}{{/each}}. Edad: {{#each nomina.perfil.edad}}{{nombre}} {{pct}}{{#unless @last}}; {{/unless}}{{/each}}. Vinculación: {{#each nomina.perfil.vinculacion}}{{nombre}} {{pct}}{{#unless @last}}; {{/unless}}{{/each}}.{{else}}pendiente de registrar la nómina con sus datos sociodemográficos.{{/if}} El diagnóstico de condiciones de salud se toma del informe del médico ocupacional, solo con datos agregados y sin diagnósticos individuales (Ley 1581 de 2012).
8. **Registro y seguimiento de los indicadores del año inmediatamente anterior** (num. 8): ver la sección de estadísticas y el registro anual de indicadores mínimos (Resolución 0312 de 2019, art. 30).

## Estadísticas de accidentalidad y enfermedad laboral

Se analizan las estadísticas de enfermedad y accidentalidad de los dos últimos años para fijar la línea base (Decreto 1072 de 2015, art. 2.2.4.6.16, parágrafo 1).

| Dato | {{#each accidentalidad.ultimosDosAnios}}{{anio}} | {{/each}}
|---|---|---|
| Accidentes de trabajo | {{#each accidentalidad.ultimosDosAnios}}{{at}} | {{/each}}
| Accidentes graves o mortales | {{#each accidentalidad.ultimosDosAnios}}{{gravesMortales}} | {{/each}}
| Días de incapacidad por accidente de trabajo | {{#each accidentalidad.ultimosDosAnios}}{{diasAt}} | {{/each}}
| Enfermedades laborales calificadas | {{#each accidentalidad.ultimosDosAnios}}{{el}} | {{/each}}
| Días de ausencia por incapacidad médica | {{#each accidentalidad.ultimosDosAnios}}{{diasAusencia}} | {{/each}}
| Frecuencia de accidentalidad (promedio mensual por 100 trabajadores) | {{#each accidentalidad.ultimosDosAnios}}{{frecuencia}} | {{/each}}
| Severidad de accidentalidad (promedio mensual por 100 trabajadores) | {{#each accidentalidad.ultimosDosAnios}}{{severidad}} | {{/each}}

Los datos salen de los eventos registrados en PROCESST y del número de trabajadores de cada mes (Resolución 0312 de 2019, art. 30); "Sin registros" indica que ese año no se cargó en PROCESST: se completa con los registros de la empresa y el reporte de la ARL.

Año en curso: {{accidentalidad.resumen.texto}}

## Autorreporte de condiciones de trabajo y salud

Los trabajadores y contratistas cuentan con mecanismos para reportar sus condiciones de trabajo y de salud (formato de reporte, buzón o correo del responsable del SG-SST). Esos reportes son un insumo de esta evaluación (Decreto 1072 de 2015, art. 2.2.4.6.16, parágrafo 3).

Reportes recibidos en el periodo evaluado: ______. Principales temas: ______________________.

## Resultado de la tabla de valores

La calificación usa la tabla de valores de la Resolución 0312 de 2019 (art. 27). Cada ítem que se cumple suma su valor. En las empresas de menos de 50 trabajadores con riesgo I, II o III, los ítems que no les corresponden se califican con el valor máximo en la columna "No aplica", así que el puntaje es 100 menos lo que se deja de cumplir.

{{#if evaluacionInicial.existe}}
| Ítem | Estándar | Valor | Estado | Puntaje obtenido | Observación o justificación |
|---|---|---|---|---|---|
{{#each evaluacionInicial.items}}
| {{codigo}} | {{celda descripcion}} | {{puntaje}} | {{estado}} | {{obtenido}} | {{#if justificacion}}{{celda justificacion}}{{else}}{{celda observacion}}{{/if}} |
{{/each}}
{{#if evaluacionInicial.noCorresponden.length}}| Demás ítems | {{len evaluacionInicial.noCorresponden}} ítems que no le corresponden a la empresa por su tamaño y riesgo | {{evaluacionInicial.puntajeNoCorresponden}} | No aplica (art. 27) | {{evaluacionInicial.puntajeNoCorresponden}} | Reciben el porcentaje máximo |
{{/if}}

**Puntaje total: {{evaluacionInicial.puntaje}} %** — Valoración: **{{evaluacionInicial.valoracion}}**

Acción requerida (Res. 0312 art. 28): {{evaluacionInicial.accion}}
{{else}}
La evaluación de estándares mínimos aún no se ha diligenciado en el sistema.
{{/if}}

## Prioridades identificadas

{{#if planMejoraInicial.length}}
{{#each planMejoraInicial}}
{{inc @index}}. **{{estandar}}** — {{actividad}}
{{/each}}
{{else}}
Las prioridades se definen al completar la tabla de valores.
{{/if}}

## Conclusión

Los resultados de esta evaluación son la línea base para la planificación del SG-SST y para el plan anual de trabajo {{anio}} (Decreto 1072 de 2015, art. 2.2.4.6.16, parágrafo 2).

______________________________________
**{{responsable.nombre}}** — Evaluador(a), Licencia SST {{default responsable.licencia "______"}} — {{responsable.doc}}

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
