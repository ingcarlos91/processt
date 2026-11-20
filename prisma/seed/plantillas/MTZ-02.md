---
codigo: MTZ-02
nombre: Matriz de identificación de peligros, evaluación y valoración de riesgos
tipo: MTZ
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.1.2","4.2.1","4.2.2"]
normas: ["GTC-45-2012","DEC-1072-2015","RES-0312-2019"]
---
## Información general

| Campo | Información |
|---|---|
| Empresa | {{empresa.razonSocial}} — NIT {{empresa.nit}} |
| Metodología | GTC 45 (ver PRC-10) |
| Fecha de elaboración / actualización | {{fecha}} |
| Versión de la matriz | {{#if matriz.version}}v{{matriz.version.numero}} cerrada el {{matriz.version.fecha}} — {{matriz.version.motivo}}{{else}}Versión inicial en elaboración{{/if}} |
| Elaboró | {{responsable.nombre}} — Licencia SST {{default responsable.licencia "______"}} |
| Participantes | Trabajadores de las áreas, {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} |

> La matriz completa con todas las columnas de la GTC 45 (incluidas la interpretación del nivel de probabilidad, la peor consecuencia y la existencia de un requisito legal específico) se entrega también en formato Excel. La metodología y las escalas están en el PRC-10.

La matriz se elabora con la participación de todos los niveles de la empresa, se documenta y se actualiza como mínimo una vez al año y cada vez que ocurra un accidente de trabajo mortal o un evento catastrófico, o haya cambios en procesos, instalaciones, maquinaria o equipos (Decreto 1072 de 2015, arts. 2.2.4.6.12 num. 3 y 2.2.4.6.15, parágrafo 1).

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
| {{celda proceso}} | {{celda zona}} | {{celda actividad}} | {{celda tarea}} | {{rutinaria}} | {{clasificacion}} | {{celda descripcion}} | {{celda efectos}} | {{#if (or controlesFuente controlesMedio controlesIndividuo)}}{{#if controlesFuente}}Fuente: {{celda controlesFuente}}. {{/if}}{{#if controlesMedio}}Medio: {{celda controlesMedio}}. {{/if}}{{#if controlesIndividuo}}Individuo: {{celda controlesIndividuo}}{{/if}}{{else}}Ninguno identificado{{/if}} | {{nd}} | {{ne}} | {{np}} | {{nc}} | {{nr}} | {{nivelRiesgo}} | {{aceptabilidad}} | {{expuestos}} | {{#if eliminacion}}Elim.: {{celda eliminacion}}. {{/if}}{{#if sustitucion}}Sust.: {{celda sustitucion}}. {{/if}}{{#if ingenieria}}Ing.: {{celda ingenieria}}. {{/if}}{{#if administrativa}}Adm.: {{celda administrativa}}. {{/if}}{{#if epp}}EPP: {{celda epp}}{{/if}} |
{{/each}}

## Riesgos prioritarios

{{#if matriz.prioritarios.length}}
{{#each matriz.prioritarios}}
{{inc @index}}. **{{descripcion}}** ({{clasificacion}}) — {{tarea}} — Nivel {{nivelRiesgo}} ({{aceptabilidad}})
{{/each}}
{{else}}
No se identificaron riesgos de nivel I o II.
{{/if}}

## Implementación y verificación de las medidas de control

Las medidas de intervención se implementan según la jerarquía de controles (Decreto 1072 de 2015, art. 2.2.4.6.24; Resolución 0312 de 2019, estándar 4.2.1). Para cada medida de los riesgos prioritarios se registran el responsable, la fecha y el estado de implementación. Además se verifica en sitio que los trabajadores aplican los controles: procedimientos, permisos de trabajo, señalización y uso de los elementos de protección personal (Resolución 0312 de 2019, estándar 4.2.2). La verificación se hace por observación directa durante las inspecciones (PRG-06), con soportes del cumplimiento. Lo que no se cumple genera una acción en el FOR-06 (Decreto 1072 de 2015, arts. 2.2.4.6.22 num. 9 y 2.2.4.6.33).

| Peligro (nivel) | Medida de intervención | Responsable | Fecha de implementación | Estado | Verificación de la aplicación por los trabajadores (fecha, método, resultado) | ¿Eficaz? |
|---|---|---|---|---|---|---|
{{#if matriz.prioritarios.length}}
{{#each matriz.prioritarios}}
| {{celda descripcion}} ({{nivelRiesgo}}) | {{#if eliminacion}}Elim.: {{celda eliminacion}}. {{/if}}{{#if sustitucion}}Sust.: {{celda sustitucion}}. {{/if}}{{#if ingenieria}}Ing.: {{celda ingenieria}}. {{/if}}{{#if administrativa}}Adm.: {{celda administrativa}}. {{/if}}{{#if epp}}EPP: {{celda epp}}{{/if}} | | | | | |
{{/each}}
{{else}}
| | | | | | | |
{{/if}}

Frecuencia de verificación: riesgos de nivel I, mensual; nivel II, trimestral; nivel III, en las inspecciones planeadas (criterio de la empresa).
