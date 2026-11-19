---
codigo: DOC-07
nombre: Profesiograma (perfiles de cargo y evaluaciones médicas ocupacionales)
tipo: DOC
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.1.3","3.1.4"]
normas: ["RES-1843-2025","DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Informar al médico que realiza las evaluaciones médicas ocupacionales los perfiles de cargo de **{{empresa.razonSocial}}**, con sus tareas, peligros y exposiciones, y definir las evaluaciones y exámenes complementarios por cargo (Resolución 1843 de 2025; Resolución 0312 de 2019, estándares 3.1.3 y 3.1.4).

> Este documento lo debe validar el médico especialista en SST o medicina del trabajo de la IPS, quien define la periodicidad y los énfasis definitivos.

## Perfiles por cargo

{{#each cargos}}
### {{inc @index}}. {{nombre}} ({{nPersonas}} persona{{#if (gt nPersonas 1)}}s{{/if}})

**Funciones:** {{default funciones "Ver descripción del cargo."}}

**Tareas:** {{join tareas "; "}}

**Peligros a los que está expuesto:**

| Clasificación | Peligro | Nivel de riesgo |
|---|---|---|
{{#each peligros}}
| {{clasificacion}} | {{celda descripcion}} | {{nivelRiesgo}} |
{{/each}}

**Evaluaciones médicas y exámenes complementarios:**

| Examen | Ingreso | Periódico | Retiro |
|---|---|---|---|
{{#each examenes}}
| {{this}} | ✔ | ✔ | ✔ |
{{/each}}

{{#if altoRiesgo.length}}**Tareas de alto riesgo:** {{join altoRiesgo ", "}} — requieren concepto de aptitud específico para la tarea.{{/if}}

{{/each}}

## Periodicidad y criterios

- Evaluación de ingreso: antes del inicio de labores.
- Evaluación periódica: según el criterio del médico, con base en la exposición; como máximo cada tres (3) años.
- Evaluación de retiro: dentro de los cinco (5) días hábiles siguientes a la terminación del vínculo.
- Evaluación post incapacidad o por reintegro: cuando la incapacidad sea prolongada o el médico lo recomiende.
- Está prohibido exigir prueba de embarazo o de VIH como requisito de ingreso.

Elaboró: {{consultora.profesional}} — Licencia SST {{consultora.licencia}}  |  Fecha: {{fecha}}

IPS: {{op.ips}}

Validó (médico de la IPS): {{op.medicoIps.nombre}}  Licencia: {{default op.medicoIps.cedula "__________"}}
