---
codigo: PRG-08
nombre: Programa de prevención y protección contra caídas en trabajo en alturas
tipo: PRG
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.3"]
normas: ["RES-4272-2021","DEC-1072-2015"]
condicion: {"disparador":"alturas"}
---
## Objetivo

Prevenir las caídas en los trabajos en alturas realizados por trabajadores y contratistas de **{{empresa.razonSocial}}** (Resolución 4272 de 2021).

## Alcance

Todo trabajo en el que exista el riesgo de caer a 1,5 m o más sobre un nivel inferior.

## Tareas y cargos expuestos

{{#each altoRiesgo}}
{{#if (eq tipo "alturas")}}
- **Tareas:** {{tareas}}
- **Cargos:** {{cargos}}
{{/if}}
{{/each}}

## Medidas de prevención

1. Capacitación y certificación de los trabajadores según su rol (trabajador autorizado, coordinador de trabajo en alturas).
2. Designación del coordinador de trabajo en alturas: ______________________.
3. Sistema de permiso de trabajo y listas de chequeo antes de cada tarea.
4. Delimitación y señalización del área.
5. Evaluación médica con concepto de aptitud para trabajo en alturas.
6. Inspección de equipos y sistemas de acceso (escaleras, andamios, plataformas).

## Medidas de protección

- Sistemas de restricción y detención de caídas: arnés de cuerpo completo, eslingas con absorbedor, líneas de vida y puntos de anclaje certificados.
- Inspección preuso y periódica de los equipos, con hoja de vida.

## Plan de emergencias y rescate

Procedimiento de rescate específico para cada tarea, con equipos y personal entrenado, para atender a un trabajador suspendido en el menor tiempo posible.

## Permiso de trabajo en alturas

| Campo | |
|---|---|
| Fecha y hora | |
| Lugar y altura aproximada | |
| Tarea | |
| Trabajadores (nombre, certificado vigente) | |
| Peligros identificados | |
| Sistema de acceso | |
| Equipos de protección contra caídas (inspeccionados) | |
| Plan de rescate | |
| Autoriza (coordinador de alturas) | |
| Cierre del permiso | |
