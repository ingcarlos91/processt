---
codigo: FOR-06
nombre: Registro de acciones correctivas, preventivas y de mejora
tipo: FOR
nivelMin: 7
carpeta: 7. Mejoramiento
estandares: ["7.1.1","7.1.2","7.1.3","7.1.4"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Registrar y hacer seguimiento a las acciones preventivas, correctivas y de mejora que resultan de la supervisión, las inspecciones, la medición de indicadores, las investigaciones, las auditorías, la revisión por la dirección y los requerimientos de autoridades y de la ARL (Decreto 1072 de 2015, arts. 2.2.4.6.33 y 2.2.4.6.34; Resolución 0312 de 2019, estándar 7.1.4).

## Registro

| N.º | Fecha | Fuente (inspección / indicador / investigación / auditoría / revisión / ARL / autoridad / trabajador) | Descripción del hallazgo | Causa raíz | Tipo (correctiva / preventiva / mejora) | Acción | Responsable | Fecha límite | Comunicada a | Fecha de cierre | Verificación de eficacia |
|---|---|---|---|---|---|---|---|---|---|---|---|
{{#if acciones.length}}
{{#each acciones}}
| {{n}} | {{fecha}} | {{origen}} | {{celda hallazgo}} | {{celda causa}} | {{tipo}}{{#if jerarquia}} ({{jerarquia}}){{/if}} | {{celda descripcion}} | {{celda responsable}} | {{fechaLimite}} | | {{fechaCierre}} | {{celda eficacia}} |
{{/each}}
{{else}}
| 1 | | | | | | | | | | | |
| 2 | | | | | | | | | | | |
| 3 | | | | | | | | | | | |
{{/if}}

## Instrucciones

- Identificar y analizar las causas fundamentales de las no conformidades (Decreto 1072 de 2015, art. 2.2.4.6.33, num. 1).
- Adoptar, planificar y aplicar la acción, comprobar su eficacia después de implementada y documentarla (art. 2.2.4.6.33, num. 2).
- Si las medidas de prevención y protección son inadecuadas o pueden dejar de ser eficaces, se evalúan y se priorizan sin demora: esas acciones van primero en el registro (art. 2.2.4.6.33, parágrafo 1).
- Toda acción se documenta, tiene responsable y fecha de cumplimiento, y se difunde a los niveles pertinentes. En la columna "Comunicada a" se anota a quién se comunicó (art. 2.2.4.6.33, parágrafo 2).
- Las acciones correctivas que ordenen las autoridades administrativas o recomiende la ARL también se registran aquí (Resolución 0312 de 2019, estándar 7.1.4).
