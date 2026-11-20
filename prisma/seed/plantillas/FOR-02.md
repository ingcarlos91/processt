---
codigo: FOR-02
nombre: Registro y seguimiento de conceptos de aptitud, restricciones y recomendaciones médicas
tipo: FOR
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.1.4","3.1.6"]
normas: ["RES-1843-2025","RES-0312-2019","DEC-1072-2015","LEY-1581-2012"]
---
## Registro

| N.º | Trabajador | Documento | Cargo | Tipo de evaluación | Fecha | Concepto de aptitud | Restricciones / recomendaciones | Vigencia (temporal hasta / permanente) | Comunicado al trabajador (fecha) | Fecha límite de adaptación (20 días hábiles) | Acciones implementadas (fecha) | Próximo control |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
{{#if nomina.hayExamenes}}
{{#each nomina.examenes}}
| {{n}} | {{celda trabajador}} | {{doc}} | {{celda cargo}} | {{tipo}} | {{fecha}} | {{concepto}} | {{celda restricciones}} | | {{comunicado}} | {{#if (eq concepto "Apto")}}No aplica{{/if}} | {{#if (eq concepto "Apto")}}No requiere{{else}}Ver seguimiento{{/if}} | {{default proximo "Por programar"}} |
{{/each}}
{{else}}
| 1 | | | | | | | | | | | | |
| 2 | | | | | | | | | | | | |
| 3 | | | | | | | | | | | | |
{{/if}}

## Recomendaciones de médicos tratantes (EPS / ARL) y calificación

Registro de las recomendaciones y restricciones emitidas por los médicos tratantes de la EPS o la ARL, y de los documentos entregados para la calificación de origen y de pérdida de capacidad laboral (Resolución 0312 de 2019, estándar 3.1.6).

| Trabajador | Fecha | Emitida por (EPS / ARL) | Recomendación o restricción (sin diagnóstico) | Acción (adecuación, reubicación, readaptación) y fecha | Documentos entregados para calificación (a quién, fecha, constancia de recibido) |
|---|---|---|---|---|---|
| | | | | | |
| | | | | | |

## Instrucciones

- **Qué se registra:** únicamente el concepto médico ocupacional y las recomendaciones o restricciones que emite el prestador; **nunca diagnósticos**, ni en las columnas de texto libre (Resolución 1843 de 2025, art. 4 literal i y art. 19; Ley 1581 de 2012, art. 5).
- **Concepto:** se registra como apto, apto con recomendaciones o apto con restricciones. No se usa "no apto", salvo en los regímenes especiales de aptitud (art. 19 parágrafo).
- **Tipos de evaluación:** pre-ingreso, periódica (programada o por cambio de ocupación), egreso, post-incapacidad, retorno laboral y seguimiento o control (art. 8).
- **Vigencia:** anote si cada recomendación o restricción es temporal (hasta qué fecha) o permanente, y si se requiere seguimiento, según el concepto (art. 19 parágrafo).
- **Comunicación:** el concepto se comunica por escrito a cada trabajador y se conserva la evidencia de la entrega. Anote la fecha en "Comunicado al trabajador" (art. 5 literal i). Al jefe inmediato se le informa solo lo necesario para aplicar las recomendaciones; la historia clínica es reservada (art. 31).
- **Adaptación:** si el concepto trae recomendaciones o restricciones, calcule la fecha límite (20 días hábiles después de la evaluación). La empresa adapta las condiciones de trabajo o reubica al trabajador antes de esa fecha y anota la acción y su fecha (art. 5 literal f).
- **Seguimiento:** verifique cada mes el cumplimiento de las recomendaciones (Resolución 0312 de 2019, estándar 3.1.6).
- **Conservación:** este registro se conserva mínimo veinte (20) años contados desde el retiro de cada trabajador (Decreto 1072 de 2015, art. 2.2.4.6.13 numeral 1).
