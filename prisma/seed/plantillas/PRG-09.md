---
codigo: PRG-09
nombre: Plan Estratégico de Seguridad Vial (PESV) — documento base
tipo: PRG
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: []
normas: ["LEY-1503-2011","LEY-2050-2020","DEC-1252-2021","RES-40595-2022","CIR-034-2026","RES-0312-2019","LEY-1562-2012"]
condicion: {"alguno":[{"vehiculosMin":11},{"conductoresMin":2}]}
---
## Fundamento

**{{empresa.razonSocial}}** {{#if (gte pesv.vehiculos 11)}}cuenta con una flota de {{pesv.vehiculos}} vehículos (más de diez){{#if (gte pesv.conductores 2)}} y contrata o administra {{pesv.conductores}} conductores{{/if}}{{else}}contrata o administra {{pesv.conductores}} conductores{{/if}}, por lo que está obligada a diseñar e implementar el Plan Estratégico de Seguridad Vial según su misionalidad y tamaño (Ley 1503 de 2011, art. 12, en su texto vigente; Decreto 1252 de 2021, art. 2.3.2.3.2), articulado al SG-SST (Resolución 0312 de 2019, art. 32) y sin aval previo de autoridad. La verificación corresponde {{#if pesv.esTransporte}}a la Superintendencia de Transporte o al organismo de tránsito, según su competencia{{else}}al Ministerio del Trabajo{{/if}} (Ley 2050 de 2020, art. 1). La obligación cubre los vehículos propios, arrendados o en leasing, renting o arrendamiento financiero (en este caso a cargo del arrendatario o locatario, Decreto 1252 de 2021, art. 2.3.2.3.2 parágrafo 3), los de los conductores contratados y los vehículos de los trabajadores puestos al servicio de la empresa. La empresa puede acreditar el diseño e implementación con la certificación vigente en la norma ISO 39001 (parágrafo 2).

**Empresas nuevas:** una organización obligada que se constituya después de la Resolución 40595 de 2022 tiene un plazo máximo de un (1) año desde su constitución para diseñar e implementar el PESV (art. 3).

## Contenido mínimo legal

El PESV contiene como mínimo (Ley 1503 de 2011, art. 12):

1. **Diagnóstico y caracterización** de los riesgos de seguridad vial asociados a la flota o a los conductores (pasos 5 y 6).
2. **Capacitación en seguridad vial a todos los trabajadores**, sin importar su cargo o rol (paso 10).
3. **Compromisos claros del nivel directivo** con las acciones y estrategias de seguridad vial (pasos 3 y 4).
4. **Inspección y mantenimiento periódico de los vehículos**, incluidos los vehículos propios de los trabajadores puestos al servicio de la empresa (pasos 16 y 17; PRG-06 y PRG-07).

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
{{#if pesv.esTransporte}}- **Reporte anual de autogestión** de los indicadores con corte al 31 de diciembre, ante la entidad verificadora que corresponda (Superintendencia de Transporte u organismo de tránsito), por los medios que ella disponga (Resolución 40595 de 2022, paso 20).
{{else}}- **Reporte anual de autogestión** ante el Ministerio del Trabajo con corte al 31 de diciembre y plazo hasta el 31 de enero del año siguiente, según el último dígito del NIT; después de esa fecha es extemporáneo (Circular 034 de 2026 del Ministerio del Trabajo; Resolución 40595 de 2022, paso 20).
{{/if}}- Sanciones por no diseñar o implementar el PESV: {{#if pesv.esTransporte}}las del régimen sancionatorio del transporte al que remite la Ley 2050 de 2020, art. 6{{else}}las del art. 13 de la Ley 1562 de 2012 (Ley 2050 de 2020, art. 6){{/if}}.

## Política de seguridad vial

{{empresa.razonSocial}} se compromete a prevenir los siniestros viales de sus trabajadores y de terceros, mediante el cumplimiento de las normas de tránsito, el mantenimiento preventivo y la inspección preoperacional de sus vehículos y de los vehículos de los trabajadores puestos a su servicio, la capacitación en seguridad vial de todos sus trabajadores y la formación específica de sus conductores, y la promoción de comportamientos seguros en la vía, y asigna los recursos para el diseño, la implementación y el seguimiento del PESV.

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
