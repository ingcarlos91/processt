---
codigo: PLN-01
nombre: Plan anual de trabajo del SG-SST
tipo: PLN
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.4.1"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Establecer las actividades, responsables, recursos y cronograma para alcanzar los objetivos del SG-SST de **{{empresa.razonSocial}}** durante el periodo enero a diciembre de {{anio}} (Decreto 1072 de 2015, art. 2.2.4.6.17 parágrafo 2; Resolución 0312 de 2019, estándar 2.4.1 y art. 26).

## Objetivos y metas

El plan se formula para alcanzar cada uno de los objetivos del SG-SST definidos en el documento de objetivos e indicadores (DOC-01), con sus metas (Decreto 1072 de 2015, arts. 2.2.4.6.17 numeral 2.3 y 2.2.4.6.18 numeral 3):

| N.º | Objetivo | Meta |
|---|---|---|
| 1 | Identificar los peligros, evaluar y valorar los riesgos y establecer controles | 100 % de los riesgos prioritarios (nivel I y II) con medidas de intervención implementadas |
| 2 | Proteger la seguridad y salud de los trabajadores mediante la prevención de accidentes y enfermedades | Frecuencia de accidentalidad menor que la del año anterior y 0 accidentes mortales |
| 3 | Cumplir la normatividad vigente y los estándares mínimos | Autoevaluación de estándares mínimos superior al 85 % |
| 4 | Ejecutar el plan anual de trabajo | ≥ 90 % de actividades ejecutadas |
| 5 | Desarrollar las competencias en SST de los trabajadores | ≥ 90 % de cobertura del programa de capacitación |
| 6 | Promover la salud física y mental de los trabajadores | Ausentismo por causa médica menor que el del año anterior |

Las actividades del cronograma se relacionan con los objetivos por su estándar mínimo: recursos, capacitación y comités (estándares 1.x) apoyan los objetivos 3 y 5; salud (3.x) los objetivos 2 y 6; peligros y riesgos (4.x) el objetivo 1; emergencias (5.x) el objetivo 2; verificación y mejora (6.x y 7.x) los objetivos 3 y 4.

## Cronograma de actividades

| Mes | Actividad | Estándar | Responsable | Recursos | Fundamento |
|---|---|---|---|---|---|
{{#each plan}}
| {{mesNombre}} | {{celda actividad}} | {{estandar}} | {{responsable}} | {{recursos}} | {{celda normaRef}} |
{{/each}}

## Seguimiento

El responsable del SG-SST hará seguimiento mensual a la ejecución del plan y calculará el indicador de cumplimiento (actividades ejecutadas / actividades programadas × 100). El resultado se informa a la alta dirección y al {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}}. Las actividades no ejecutadas se registran con su causa y su acción de mejora.

El plan se actualiza cuando se gestione un cambio interno o externo que lo afecte (Decreto 1072 de 2015, art. 2.2.4.6.26), y con los resultados de la auditoría anual (art. 2.2.4.6.29), de la revisión por la alta dirección (art. 2.2.4.6.31) y de la autoevaluación de estándares mínimos (Resolución 0312 de 2019, arts. 26 y 28). La revisión por la alta dirección, la auditoría anual y la rendición de cuentas (art. 2.2.4.6.8 numeral 3) se programan para toda empresa, cualquiera sea su tamaño.

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal (empleador) — {{empresa.representanteDoc}}

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST — {{responsable.doc}}
