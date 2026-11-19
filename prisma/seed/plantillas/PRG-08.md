---
codigo: PRG-08
nombre: Programa de prevención y protección contra caídas en trabajo en alturas
tipo: PRG
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.3"]
normas: ["RES-4272-2021","RES-1843-2025","DEC-1072-2015","RES-0312-2019"]
condicion: {"disparador":"alturas"}
---
## Objetivo

Prevenir las caídas en los trabajos en alturas realizados por trabajadores y contratistas de **{{empresa.razonSocial}}** (Resolución 4272 de 2021, arts. 4 y 5; Resolución 0312 de 2019, estándar 4.2.3).

## Alcance

Toda actividad o desplazamiento en la que exista el riesgo de caída a una altura **mayor a 2,0 metros** sobre un nivel inferior (Resolución 4272 de 2021, art. 3), realizada por trabajadores propios, en misión o contratistas.

## Tareas y cargos expuestos

{{#each altoRiesgo}}
{{#if (eq tipo "alturas")}}
- **Tareas:** {{tareas}}
- **Cargos:** {{cargos}}
{{/if}}
{{/each}}

## Medidas de prevención

1. **Capacitación y certificación por rol (art. 27):** jefe de área, 8 horas; trabajador autorizado, 32 horas; coordinador de trabajo en alturas, 80 horas; entrenador, 130 horas. **Reentrenamiento** de mínimo 8 horas al ingresar a la empresa, cuando cambien las condiciones de operación o los equipos, y cuando se detecten fallas en el desempeño; no es una renovación anual automática.
2. Designación del coordinador de trabajo en alturas: **{{op.coordinadorAlturas.nombre}}**{{#if op.coordinadorAlturas.cedula}} (certificado {{op.coordinadorAlturas.cedula}}){{/if}}.
3. **Permiso de trabajo** con lista de chequeo diligenciado antes de cada tarea y cerrado al terminarla (art. 15).
4. Delimitación y señalización del área de trabajo y de la zona de posible caída de objetos.
5. **Aptitud médica:** evaluación médica ocupacional con énfasis en trabajo en alturas y concepto de aptitud específico para la tarea, conforme a la Resolución 1843 de 2025 (art. 17); periodicidad definida por la empresa, máximo cada 3 años (art. 15).
6. **Sistemas de acceso** (escaleras, andamios, plataformas): hoja de vida de cada equipo e inspección al menos anual por persona competente (art. 16), además de la inspección preuso.

## Medidas de protección

- Sistemas de restricción y detención de caídas: arnés de cuerpo completo, eslingas con absorbedor, líneas de vida y puntos de anclaje certificados, seleccionados según la tarea.
- Inspección preuso de los EPP contra caídas por el trabajador e inspección al menos anual por persona competente, con registro (art. 61); retiro de servicio de todo equipo con daño o que haya detenido una caída.

## Plan de emergencias y rescate (art. 26)

Plan de rescate escrito y específico para cada tarea, con equipos y personal entrenado para atender a un trabajador suspendido en el menor tiempo posible, practicado mediante simulacros y articulado con el plan de emergencias (PLN-04).

## Permiso de trabajo en alturas

| Campo | Información |
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
