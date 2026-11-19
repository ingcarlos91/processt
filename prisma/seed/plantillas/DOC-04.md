---
codigo: DOC-04
nombre: Asignación de recursos y presupuesto del SG-SST
tipo: DOC
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.3"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Definir y asignar los recursos financieros, técnicos, humanos y de otra índole requeridos para el diseño, implementación, revisión, evaluación y mejora del SG-SST de **{{empresa.razonSocial}}** durante el año {{anio}} (Decreto 1072 de 2015, art. 2.2.4.6.8 numeral 4; Resolución 0312 de 2019, estándar 1.1.3).

## Recursos humanos

- Responsable del SG-SST: {{default responsable.nombre "Por designar"}}.
- {{#if comites.copasst.esVigia}}Vigía de SST{{else}}Integrantes del COPASST{{/if}}, con el tiempo de cuatro (4) horas semanales dentro de la jornada para el cumplimiento de sus funciones (Resolución 2013 de 1986, art. 7).
- Comité de Convivencia Laboral y brigada de emergencias.
- Asesoría de la ARL {{default empresa.arl "______"}}.

## Recursos técnicos y físicos

Espacio para reuniones de los comités, equipos de cómputo, elementos de emergencia (extintores, botiquín, camilla, señalización), elementos de protección personal y archivo físico o digital de la documentación.

## Presupuesto anual

| Rubro | Descripción | Estándar | Valor ($) |
|---|---|---|---|
{{#each presupuesto}}
| {{rubro}} | {{descripcion}} | {{estandar}} | {{valor}} |
{{/each}}
| **Total** | | | **{{op.presupuestoTotal}}** |

## Aprobación

El presente presupuesto se aprueba y se ejecutará conforme al plan anual de trabajo {{anio}}.

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
