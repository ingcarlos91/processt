---
codigo: MTZ-02
nombre: Matriz de identificación de peligros, evaluación y valoración de riesgos
tipo: MTZ
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.1.2","4.2.1"]
normas: ["GTC-45-2012","DEC-1072-2015","RES-0312-2019"]
---
## Información general

| Campo | |
|---|---|
| Empresa | {{empresa.razonSocial}} — NIT {{empresa.nit}} |
| Metodología | GTC 45 (ver PRC-10) |
| Fecha de elaboración / actualización | {{fecha}} |
| Versión de la matriz | {{#if matriz.version}}v{{matriz.version.numero}} cerrada el {{matriz.version.fecha}} — {{matriz.version.motivo}}{{else}}Versión inicial en elaboración{{/if}} |
| Elaboró | {{responsable.nombre}} — Licencia SST {{default responsable.licencia "______"}} |
| Participantes | Trabajadores de las áreas, {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} |

> La matriz completa con todas sus columnas se entrega también en formato Excel.

## Resumen

| Clasificación | Peligros identificados | Prioritarios (I y II) |
|---|---|---|
{{#each matriz.porClasificacion}}
| {{clasificacion}} | {{total}} | {{prioritarios}} |
{{/each}}

## Matriz

| Proceso | Zona | Actividad | Tarea | Rut. | Clasificación | Peligro | Efectos | Controles existentes | ND | NE | NP | NC | NR | Nivel | Aceptabilidad | Expuestos | Medidas de intervención |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
{{#each matriz.filas}}
| {{celda proceso}} | {{celda zona}} | {{celda actividad}} | {{celda tarea}} | {{rutinaria}} | {{clasificacion}} | {{celda descripcion}} | {{celda efectos}} | {{celda controlesFuente}} {{celda controlesMedio}} {{celda controlesIndividuo}} | {{nd}} | {{ne}} | {{np}} | {{nc}} | {{nr}} | {{nivelRiesgo}} | {{aceptabilidad}} | {{expuestos}} | {{#if eliminacion}}Elim.: {{celda eliminacion}}. {{/if}}{{#if sustitucion}}Sust.: {{celda sustitucion}}. {{/if}}{{#if ingenieria}}Ing.: {{celda ingenieria}}. {{/if}}{{#if administrativa}}Adm.: {{celda administrativa}}. {{/if}}{{#if epp}}EPP: {{celda epp}}{{/if}} |
{{/each}}

## Riesgos prioritarios

{{#if matriz.prioritarios.length}}
{{#each matriz.prioritarios}}
{{inc @index}}. **{{descripcion}}** ({{clasificacion}}) — {{tarea}} — Nivel {{nivelRiesgo}} ({{aceptabilidad}})
{{/each}}
{{else}}
No se identificaron riesgos de nivel I o II.
{{/if}}
