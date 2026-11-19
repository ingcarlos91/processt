---
codigo: PRG-01
nombre: Programa de capacitación, inducción y reinducción en SST
tipo: PRG
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.2.1","1.2.2"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Proporcionar a los trabajadores de **{{empresa.razonSocial}}** los conocimientos necesarios para identificar los peligros y controlar los riesgos de su trabajo, prevenir accidentes de trabajo y enfermedades laborales y actuar ante emergencias (Decreto 1072 de 2015, art. 2.2.4.6.11; Resolución 0312 de 2019, estándares 1.2.1 y 1.2.2).

## Alcance

Aplica a todos los trabajadores dependientes, contratistas, cooperados, aprendices y trabajadores en misión, en todos los niveles de la organización.

## Inducción y reinducción

Todo trabajador que ingrese recibe, antes de iniciar labores, una inducción en SST que incluye como mínimo:

1. Política de SST y objetivos del SG-SST.
2. Peligros y riesgos de su cargo y las medidas de control (según matriz de peligros).
3. Procedimientos seguros de trabajo y uso de elementos de protección personal.
4. Reporte de incidentes, accidentes, condiciones y actos inseguros (autorreporte).
5. Plan de emergencias: rutas de evacuación, punto de encuentro, brigada.
6. Funciones del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} y del Comité de Convivencia Laboral.
7. Derechos y deberes en el Sistema General de Riesgos Laborales.

La reinducción se realiza una vez al año o cuando cambien las condiciones de trabajo, el cargo o la normatividad.

## Cronograma temático {{anio}}

| N.º | Tema | Dirigido a | Mes | Fundamento |
|---|---|---|---|---|
{{#each capacitaciones}}
| {{inc @index}} | {{celda tema}} | {{celda dirigidoA}} | {{mes}} | {{celda norma}} |
{{/each}}

## Necesidades de capacitación por cargo

| Cargo | Temas específicos |
|---|---|
{{#each cargos}}
| {{nombre}} | {{join capacitaciones "; "}} |
{{/each}}

## Evaluación y registros

- Cada capacitación se registra en el formato de asistencia con fecha, tema, duración, facilitador y firma de los asistentes.
- Se evalúa la comprensión mediante prueba escrita u oral.
- Indicador de cobertura: (trabajadores capacitados / trabajadores programados) × 100. Meta ≥ 90 %.
- Indicador de cumplimiento: (capacitaciones ejecutadas / capacitaciones programadas) × 100.
- Los registros se conservan veinte (20) años (Decreto 1072 de 2015, art. 2.2.4.6.13).

## Revisión

El programa se revisa como mínimo una vez al año con la participación del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} y la alta dirección, para identificar las acciones de mejora (art. 2.2.4.6.11, parágrafo 1).
