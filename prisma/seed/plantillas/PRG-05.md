---
codigo: PRG-05
nombre: Programas de vigilancia epidemiológica
tipo: PRG
nivelMin: 60
carpeta: 3. Gestión de la salud
estandares: ["3.1.2","4.1.4"]
normas: ["DEC-1072-2015","DEC-1477-2014","RES-0312-2019"]
---
## Objetivo

Vigilar de manera sistemática la exposición a los peligros prioritarios y sus efectos en la salud de los trabajadores de **{{empresa.razonSocial}}**, para intervenir de forma oportuna (Decreto 1072 de 2015, art. 2.2.4.6.12 numeral 13).

## Programas definidos

{{#each pve}}
### {{inc @index}}. PVE {{nombre}}

- **Peligro:** {{peligro}}
- **Población objeto:** {{cargos}}
- **Evaluación de la exposición:** mediciones ambientales y evaluaciones de puesto de trabajo según el peligro.
- **Evaluación de la salud:** {{examenes}}
- **Clasificación de casos:** sanos, sospechosos, confirmados.
- **Intervención:** en la fuente, el medio y el trabajador, según la jerarquía de controles.
- **Indicadores:** cobertura del PVE, incidencia y prevalencia de casos, cumplimiento de actividades.

{{/each}}
{{#unless pve.length}}
Se definirán a partir de los peligros prioritarios de la matriz.
{{/unless}}
