---
codigo: DOC-05
nombre: Evaluación inicial del SG-SST
tipo: DOC
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.3.1"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Identificar el estado del SG-SST de **{{empresa.razonSocial}}** frente a la normatividad vigente y los estándares mínimos, y establecer las prioridades para el plan anual de trabajo (Decreto 1072 de 2015, art. 2.2.4.6.16; Resolución 0312 de 2019, arts. 27 y 28).

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
| Fecha de evaluación | {{#if evaluacion.existe}}{{evaluacion.fecha}}{{else}}{{fecha}}{{/if}} |
| Evaluador | {{responsable.nombre}} — Licencia SST {{default responsable.licencia "______"}} |

## Aspectos evaluados (art. 2.2.4.6.16)

1. Identificación de la normatividad vigente en riesgos laborales, incluidos los estándares mínimos: se identificaron {{len normas}} normas aplicables (ver matriz legal).
2. Verificación de la identificación de peligros y valoración de riesgos: {{#if matriz.filas.length}}{{len matriz.filas}} peligros identificados, {{len matriz.prioritarios}} prioritarios (nivel I y II).{{else}}pendiente de elaborar la matriz de peligros.{{/if}}
3. Identificación de amenazas y evaluación de vulnerabilidad: ver plan de prevención, preparación y respuesta ante emergencias.
4. Evaluación de la efectividad de las medidas de control: se verifica en la matriz de peligros (controles existentes).
5. Cumplimiento del programa de capacitación anual: ver ítems 1.2.1 y 1.2.2.
6. Evaluación de los puestos de trabajo en el marco de los programas de vigilancia epidemiológica.
7. Descripción sociodemográfica y condiciones de salud; estadísticas de enfermedad y accidentalidad de los dos últimos años.
8. Registro y seguimiento de los indicadores del año inmediatamente anterior.

## Resultado de la tabla de valores

{{#if evaluacion.existe}}
| Ítem | Estándar | Valor | Estado | Puntaje obtenido |
|---|---|---|---|---|
{{#each evaluacion.items}}
| {{codigo}} | {{celda descripcion}} | {{puntaje}} | {{estado}} | {{obtenido}} |
{{/each}}

**Puntaje total: {{evaluacion.puntaje}} %** — Valoración: **{{evaluacion.valoracion}}**

Acción requerida (Res. 0312 art. 28): {{evaluacion.accion}}
{{else}}
La evaluación de estándares mínimos aún no se ha diligenciado en el sistema.
{{/if}}

## Prioridades identificadas

{{#if planMejora.length}}
{{#each planMejora}}
{{inc @index}}. **{{estandar}}** — {{actividad}}
{{/each}}
{{else}}
Las prioridades se definen al completar la tabla de valores.
{{/if}}

## Conclusión

Los resultados de esta evaluación son la línea base para la planificación del SG-SST y para el plan anual de trabajo {{anio}}.

______________________________________
**{{responsable.nombre}}** — Evaluador(a), Licencia SST {{default responsable.licencia "______"}} — {{responsable.doc}}

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
