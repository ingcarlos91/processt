---
codigo: PRG-09
nombre: Plan Estratégico de Seguridad Vial (PESV) — documento base
tipo: PRG
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: []
normas: ["LEY-1503-2011","LEY-2050-2020","DEC-1252-2021","RES-40595-2022","CIR-034-2026","RES-0312-2019"]
condicion: {"alguno":[{"vehiculosMin":11},{"conductoresMin":2}]}
---
## Fundamento

**{{empresa.razonSocial}}** {{#if (gte pesv.vehiculos 11)}}cuenta con una flota de {{pesv.vehiculos}} vehículos (más de diez){{#if (gte pesv.conductores 2)}} y contrata o administra {{pesv.conductores}} conductores{{/if}}{{else}}contrata o administra {{pesv.conductores}} conductores{{/if}}, por lo que está obligada a diseñar e implementar el Plan Estratégico de Seguridad Vial (Ley 1503 de 2011, art. 12, modificado por el Decreto Ley 2106 de 2019, art. 110; Decreto 1079 de 2015, art. 2.3.2.3.2, sustituido por el Decreto 1252 de 2021), articulado al SG-SST (Resolución 0312 de 2019, art. 32) y sin aval previo de autoridad. La verificación corresponde {{#if pesv.esTransporte}}a la Superintendencia de Transporte{{else}}al Ministerio del Trabajo{{/if}} (Ley 2050 de 2020, art. 1). La obligación cubre los vehículos propios, arrendados o en leasing (en este caso a cargo del arrendatario) y los de los conductores contratados.

## Nivel del PESV (Resolución 40595 de 2022, Tabla 1)

| Criterio | Valor |
|---|---|
| Misionalidad | {{#if pesv.esTransporte}}1 — Empresa de transporte terrestre automotor (CIIU {{empresa.ciiu}}){{else}}2 — Organización que no es de transporte (CIIU {{empresa.ciiu}}){{/if}} |
| Vehículos de la flota | {{pesv.vehiculos}} |
| Conductores contratados o administrados | {{pesv.conductores}} |
| **Nivel de diseño e implementación** | **{{pesv.nivelTexto}}** ({{pesv.totalPasos}} pasos) |

Umbrales de la Tabla 1: {{#if pesv.esTransporte}}básico, 11 a 19 vehículos o 2 a 19 conductores; estándar, 20 a 50; avanzado, más de 50{{else}}básico, 11 a 49 vehículos o 2 a 49 conductores; estándar, 50 a 100; avanzado, más de 100{{/if}}. Cuando la organización cae en dos niveles aplica el más alto. El nivel se revisa cuando cambie el tamaño de la flota o el número de conductores.

## Pasos de la metodología aplicables al nivel {{pesv.nivelTexto}}

| Paso | Fase | Componente | Estado |
|---|---|---|---|
{{#each pesv.pasos}}
| {{n}} | {{fase}} | {{nombre}} | |
{{/each}}

{{#if pesv.esBasico}}En el nivel básico no se exigen el comité de seguridad vial, la investigación interna de siniestros viales, la gestión del cambio y de contratistas ni el archivo y retención documental, aunque la empresa puede adoptarlos voluntariamente.{{/if}}{{#if pesv.esEstandar}}El nivel estándar añade al básico el comité de seguridad vial, la investigación interna de siniestros viales, la gestión del cambio y de contratistas y el archivo y retención documental.{{/if}}{{#if pesv.esAvanzado}}El nivel avanzado exige los 24 pasos, incluidos la responsabilidad y el comportamiento seguro y el registro y análisis estadístico de siniestros viales.{{/if}}

> Nota: el PESV es un sistema propio; este documento es el punto de partida y debe desarrollarse con la metodología completa del anexo de la Resolución 40595 de 2022 para el nivel que corresponda.

## Seguimiento y reporte

- Indicadores del PESV (paso 20) y auditoría anual (paso 22) con la metodología de la Resolución 40595 de 2022.
{{#unless pesv.esTransporte}}- **Reporte anual de autogestión** ante el Ministerio del Trabajo con corte al 31 de diciembre y plazo hasta el 31 de enero del año siguiente, según el último dígito del NIT (Circular 034 de 2026 del Ministerio del Trabajo; Resolución 0312 de 2019, art. 32).
{{/unless}}- Sanciones: {{#if pesv.esTransporte}}las de la Ley 336 de 1996{{else}}las del art. 13 de la Ley 1562 de 2012{{/if}} (Ley 2050 de 2020, art. 6).

## Política de seguridad vial

{{empresa.razonSocial}} se compromete a prevenir los siniestros viales de sus trabajadores y de terceros, mediante el cumplimiento de las normas de tránsito, el mantenimiento preventivo y la inspección preoperacional de sus vehículos, la formación de sus conductores y la promoción de comportamientos seguros en la vía, y asigna los recursos para el diseño, la implementación y el seguimiento del PESV.

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
