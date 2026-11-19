---
codigo: FOR-07
nombre: Informe de investigación de incidente, accidente de trabajo o enfermedad laboral
tipo: INF
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.2.2"]
normas: ["RES-1401-2007","DEC-1072-2015","RES-0312-2019"]
descripcion: Se genera uno por cada evento desde la pestaña Accidentes e incidentes.
---
## Datos de la empresa

| Campo | |
|---|---|
| Razón social | {{empresa.razonSocial}} |
| NIT | {{empresa.nit}} |
| Actividad económica | {{empresa.actividad}} |
| ARL | {{default empresa.arl "______"}} |
| Dirección | {{default empresa.direccion "______"}}, {{empresa.ciudad}} |

## Datos del evento

| Campo | |
|---|---|
| Tipo de evento | {{ev.tipo}}{{#if ev.esAT}} — {{ev.gravedad}}{{/if}} |
| Fecha y hora | {{ev.fecha}}{{#if ev.hora}}, {{ev.hora}}{{/if}} |
| Lugar | {{default ev.lugar "______"}} |
| Tarea que realizaba | {{default ev.tarea "______"}} |
| Forma del evento | {{default ev.mecanismo "______"}} |
| Agente | {{default ev.agente "______"}} |
{{#if ev.esAT}}| Tipo de lesión | {{default ev.lesion "______"}} |
| Parte del cuerpo afectada | {{default ev.parteCuerpo "______"}} |
| Días de incapacidad | {{ev.dias}}{{#if ev.diasCargados}} (más {{ev.diasCargados}} días cargados){{/if}} |
{{/if}}| Testigos | {{default ev.testigos "Ninguno"}} |
{{#if ev.fechaReporte}}| Reporte a la ARL (FURAT/FUREL) | {{ev.fechaReporte}}{{#if ev.furat}} — radicado {{ev.furat}}{{/if}} |
{{/if}}{{#if ev.reporteMinisterio}}| Reporte al Ministerio del Trabajo | {{ev.reporteMinisterio}} |
{{/if}}

## Datos del trabajador

| Campo | |
|---|---|
| Nombre | {{default ev.trabajador "______"}} |
| Cédula | {{default ev.cedula "______"}} |
| Cargo | {{default ev.cargo "______"}} |
| Tipo de vinculación | {{default ev.vinculacion "______"}} |
| Antigüedad en el cargo | {{default ev.antiguedad "______"}} |

## Descripción del evento

{{default ev.descripcion "______"}}

## Equipo investigador

Conformado según la Resolución 1401 de 2007, art. 7: jefe inmediato o supervisor, representante del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} y responsable del SG-SST{{#if ev.esGrave}}, con la participación de un profesional con licencia en SST por tratarse de un accidente {{ev.gravedad}}{{/if}}.

| Nombre | Cargo | Rol en la investigación | Firma |
|---|---|---|---|
{{#if ev.hayEquipo}}
{{#each ev.equipo}}
| {{nombre}} | {{cargo}} | {{rol}} | |
{{/each}}
{{else}}
| | | Jefe inmediato o supervisor | |
| | | Representante del COPASST o Vigía | |
| | | Responsable del SG-SST | |
{{/if}}

Fecha de inicio de la investigación: {{default ev.invInicio "______"}}

## Análisis de causas

{{#if ev.porques.length}}
**Análisis de los porqués**

{{#each ev.porques}}
{{inc @index}}. {{this}}
{{/each}}

{{/if}}
| Tipo de causa | Descripción |
|---|---|
| Causas inmediatas — actos subestándar | {{#if ev.actos.length}}{{join ev.actos "; "}}{{else}}______{{/if}} |
| Causas inmediatas — condiciones subestándar | {{#if ev.condiciones.length}}{{join ev.condiciones "; "}}{{else}}______{{/if}} |
| Causas básicas — factores personales | {{#if ev.personales.length}}{{join ev.personales "; "}}{{else}}______{{/if}} |
| Causas básicas — factores del trabajo | {{#if ev.trabajo.length}}{{join ev.trabajo "; "}}{{else}}______{{/if}} |
{{#if ev.peligro}}| Peligro relacionado (matriz GTC 45) | {{ev.peligro}} |
{{/if}}

{{#if ev.conclusion}}**Conclusión:** {{ev.conclusion}}
{{/if}}

## Medidas de control

Definidas con la jerarquía de controles: eliminación, sustitución, controles de ingeniería, controles administrativos y elementos de protección personal (Decreto 1072 de 2015, art. 2.2.4.6.24).

| N.º | Medida | Tipo | Jerarquía | Responsable | Fecha límite | Estado |
|---|---|---|---|---|---|---|
{{#if ev.acciones.length}}
{{#each ev.acciones}}
| {{n}} | {{celda descripcion}} | {{tipo}} | {{jerarquia}} | {{responsable}} | {{fechaLimite}} | {{estado}} |
{{/each}}
{{else}}
| 1 | | | | | | |
| 2 | | | | | | |
{{/if}}

Las medidas se registran en el formato de acciones correctivas, preventivas y de mejora (FOR-06) y se incluyen en el plan anual de trabajo.

## Lecciones aprendidas

{{default ev.lecciones "______"}}

Las lecciones aprendidas se divulgan a los trabajadores y al {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} (Decreto 1072 de 2015, art. 2.2.4.6.32).

## Cierre

| Campo | |
|---|---|
| Fecha de cierre de la investigación | {{default ev.invCierre "______"}} |
{{#if ev.esGrave}}| Remisión a la ARL (accidente {{ev.gravedad}}) | {{default ev.remitidaArl "______"}} |
{{/if}}

{{#if ev.esGrave}}Por tratarse de un accidente {{ev.gravedad}}, este informe se remite a la ARL dentro de los quince (15) días siguientes al evento (Resolución 1401 de 2007).
{{/if}}

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST
