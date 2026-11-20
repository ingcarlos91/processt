---
codigo: PRG-01
nombre: Programa de capacitación, inducción y reinducción en SST
tipo: PRG
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.7","1.2.1","1.2.2"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Proporcionar a los trabajadores de **{{empresa.razonSocial}}** los conocimientos necesarios para identificar los peligros y controlar los riesgos de su trabajo, prevenir accidentes de trabajo y enfermedades laborales y actuar ante emergencias (Decreto 1072 de 2015, art. 2.2.4.6.11; Resolución 0312 de 2019, estándares 1.2.1 y 1.2.2).

## Alcance

Aplica a todos los trabajadores dependientes, contratistas, cooperados, aprendices y trabajadores en misión, en todos los niveles de la organización (Decreto 1072 de 2015, art. 2.2.4.6.11).

## Inducción y reinducción

Todo trabajador que ingrese por primera vez recibe, antes de iniciar labores, una inducción en SST con aspectos generales y específicos de sus actividades, incluidos la identificación y el control de peligros y riesgos y la prevención de accidentes de trabajo y enfermedades laborales (Decreto 1072 de 2015, art. 2.2.4.6.11, parágrafo 2). Incluye como mínimo:

1. Política de SST y objetivos del SG-SST.
2. Peligros y riesgos de su cargo y las medidas de control (según matriz de peligros).
3. Procedimientos seguros de trabajo y uso de elementos de protección personal.
4. Reporte de incidentes, accidentes, condiciones y actos inseguros (autorreporte).
5. Plan de emergencias: rutas de evacuación, punto de encuentro, brigada.
6. Funciones del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} y del Comité de Convivencia Laboral.
7. Derechos y deberes en el Sistema General de Riesgos Laborales.

Como política de la empresa, la reinducción se hace una vez al año y cada vez que cambien las condiciones de trabajo, el cargo o la normatividad. La norma no fija una periodicidad, pero la evaluación inicial y la anual revisan el cumplimiento de la inducción y la reinducción (Decreto 1072 de 2015, art. 2.2.4.6.16, num. 5).

Los integrantes del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} reciben capacitación para cumplir sus funciones: responsabilidades del comité o vigía, identificación de peligros, inspecciones e investigación de incidentes y accidentes. Se dejan los soportes de asistencia y de los temas tratados {{#if (gte empresa.nivel 21)}}(Resolución 0312 de 2019, estándar 1.1.7 y art. 9, ítem 4: "conformar, capacitar y verificar"){{else}}(buena práctica de la empresa: los 7 estándares del art. 3 de la Resolución 0312 de 2019 no incluyen este ítem; se hace para que el Vigía cumpla sus funciones){{/if}}.

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

## Ejecución

{{#if nomina.hayCapacitaciones}}
| Fecha | Tema | Horas | Modalidad | Facilitador (idóneo) | Asistentes |
|---|---|---|---|---|---|
{{#each nomina.capacitaciones}}
| {{fecha}} | {{celda tema}} | {{horas}} | {{modalidad}} | {{celda facilitador}} | {{asistentes}} |
{{/each}}

Total de horas de capacitación: {{nomina.horasCapacitacion}}. Cobertura: {{nomina.cobertura}} de los trabajadores activos ha asistido al menos a una capacitación.
{{else}}
Las capacitaciones ejecutadas, con su lista de asistencia, se registran en PROCESST y se consolidan en esta sección.
{{/if}}

## Evaluación y registros

- Cada capacitación se registra en el formato de asistencia con fecha, tema, duración, facilitador y firma de los asistentes.
- Las capacitaciones las imparte personal idóneo, con conocimiento del tema; en el registro se anota la formación del facilitador (Decreto 1072 de 2015, art. 2.2.4.6.11).
- Como buena práctica, la empresa evalúa la comprensión con una prueba escrita u oral.
- Indicadores propios de la empresa (Resolución 0312 de 2019, art. 30, num. 6): cobertura = (trabajadores capacitados / trabajadores programados) × 100, con meta de 90 % o más; cumplimiento = (capacitaciones ejecutadas / capacitaciones programadas) × 100.
- Los registros de capacitación, formación y entrenamiento se conservan al menos veinte (20) años, contados desde que termina la relación laboral del trabajador (Decreto 1072 de 2015, art. 2.2.4.6.13).

## Revisión

El programa se revisa como mínimo una vez al año con la participación del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} y la alta dirección, para identificar las acciones de mejora (art. 2.2.4.6.11, parágrafo 1).
