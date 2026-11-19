---
codigo: FOR-02
nombre: Registro y seguimiento de conceptos de aptitud, restricciones y recomendaciones médicas
tipo: FOR
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.1.4","3.1.6"]
normas: ["RES-1843-2025","RES-0312-2019"]
---
## Registro

| N.º | Trabajador | Documento | Cargo | Tipo de evaluación | Fecha | Concepto de aptitud | Restricciones / recomendaciones | Comunicado al trabajador (fecha) | Comunicado al jefe (fecha) | Acciones implementadas | Próximo control |
|---|---|---|---|---|---|---|---|---|---|---|---|
{{#if nomina.hayExamenes}}
{{#each nomina.examenes}}
| {{n}} | {{celda trabajador}} | {{doc}} | {{celda cargo}} | {{tipo}} | {{fecha}} | {{concepto}} | {{celda restricciones}} | {{comunicado}} | Sin registrar | {{#if (eq concepto "Apto")}}No requiere{{else}}Ver seguimiento{{/if}} | {{default proximo "Por programar"}} |
{{/each}}
{{else}}
| 1 | | | | | | | | | | | |
| 2 | | | | | | | | | | | |
| 3 | | | | | | | | | | | |
{{/if}}

## Instrucciones

Registrar únicamente el concepto de aptitud (apto, apto con recomendaciones, apto con restricciones o aplazado) y las recomendaciones emitidas por el prestador; nunca diagnósticos. El concepto se comunica por escrito a cada trabajador y se conserva la evidencia de la entrega (Resolución 1843 de 2025, art. 5 literal i): anotar la fecha en la columna "Comunicado al trabajador". La columna "Comunicado al jefe" se diligencia a mano cuando se informe al jefe inmediato lo necesario para aplicar las recomendaciones. Cuando el concepto incluya restricciones, la empresa adapta las condiciones del puesto o reubica al trabajador en máximo veinte (20) días hábiles (art. 5 literal f) y anota la acción en "Acciones implementadas". Verificar mensualmente el cumplimiento de las recomendaciones (Resolución 0312 de 2019, estándar 3.1.6).
