---
codigo: PRG-11
nombre: Programa de gestión para trabajo en espacios confinados
tipo: PRG
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.3"]
normas: ["RES-0491-2020","RES-2605-2020","RES-0312-2019"]
condicion: {"disparador":"confinados"}
---
## Objetivo

Prevenir accidentes en el trabajo en espacios confinados de **{{empresa.razonSocial}}**, mediante un programa de gestión articulado al SG-SST (Resolución 0491 de 2020, art. 7, vigente desde el 1 de agosto de 2021 según la Resolución 2605 de 2020; Resolución 0312 de 2019, estándar 4.2.3).

## Componentes

1. **Inventario** de espacios confinados con su clasificación, peligros y señalización (art. 14).
2. **Roles** (art. 10): administrador del programa, supervisor, vigía y trabajador entrante; personal de rescate entrenado.
3. **Capacitación por rol** (arts. 29 y 30): administrador, 8 horas; trabajador entrante, 16 horas; supervisor, 20 horas; vigía, 8 horas. **Actualización cada tres (3) años** a cargo del empleador (Resolución 2605 de 2020, art. 3); no es anual.
4. **Permiso de entrada** escrito y previo (art. 17), con **mediciones atmosféricas** de oxígeno, inflamables y tóxicos antes del ingreso y durante el trabajo (art. 21).
5. Ventilación, aislamiento de energías y bloqueo y etiquetado antes del ingreso.
6. **Plan de rescate** específico, con equipos y personal entrenado, practicado periódicamente (art. 27).
7. Aptitud médica para la tarea conforme a la Resolución 1843 de 2025.

## Inventario de espacios confinados

| N.º | Espacio | Ubicación | Peligros | Acceso | Señalizado |
|---|---|---|---|---|---|
{{#if op.espaciosConfinados.length}}
{{#each op.espaciosConfinados}}
| {{inc @index}} | {{celda espacio}} | {{celda ubicacion}} | {{celda peligros}} | {{celda acceso}} | {{senalizado}} |
{{/each}}
{{else}}
| 1 | | | | | |
{{/if}}
