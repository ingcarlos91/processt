---
codigo: DOC-04
nombre: Asignación de recursos y presupuesto del SG-SST
tipo: DOC
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.3"]
normas: ["DEC-1072-2015","RES-0312-2019","DL-1295-1994"]
---
## Objetivo

Definir y asignar los recursos financieros, técnicos, humanos y de otra índole requeridos para el diseño, implementación, revisión, evaluación y mejora del SG-SST de **{{empresa.razonSocial}}** durante el año {{anio}} (Decreto 1072 de 2015, art. 2.2.4.6.8 numeral 4; Resolución 0312 de 2019, estándar 1.1.3).

## Recursos humanos

- Responsable del SG-SST: {{default responsable.nombre "Por designar"}}.
- {{#if comites.copasst.esVigia}}Vigía de SST, con el tiempo necesario dentro de la jornada para cumplir sus funciones (Decreto 1072 de 2015, art. 2.2.4.6.8 numeral 9). Como buena práctica, la empresa le asigna ______ horas semanales.{{else}}Integrantes del COPASST, con un mínimo de cuatro (4) horas semanales por miembro dentro de la jornada normal de trabajo para el funcionamiento del comité (Decreto Ley 1295 de 1994, art. 63 literal b).{{/if}}
- Comité de Convivencia Laboral y brigada de emergencias.
- Asesoría de la ARL {{default empresa.arl "______"}}.

## Recursos técnicos, tecnológicos y físicos

Espacio para reuniones de los comités, equipos de cómputo y software para la gestión y el archivo digital del SG-SST, elementos de emergencia (extintores, botiquín, camilla, señalización), elementos de protección personal y archivo físico de la documentación.

## Presupuesto anual

Cada rubro financia las actividades del plan anual de trabajo {{anio}} (PLN-01) asociadas al mismo estándar mínimo, lo que permite evidenciar la asignación de recursos con base en el plan (Resolución 0312 de 2019, estándar 1.1.3).

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
