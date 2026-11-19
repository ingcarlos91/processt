---
codigo: DOC-07
nombre: Perfil de cargo (profesiograma) para las evaluaciones médicas ocupacionales
tipo: DOC
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.1.3","3.1.4"]
normas: ["RES-1843-2025","DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Documentar el **perfil de cargo** de cada cargo de **{{empresa.razonSocial}}** (conocido en la práctica como profesiograma), con sus funciones, tareas, peligros y exposiciones, y los exámenes complementarios propuestos por cargo. El perfil de cargo lo elabora el empleador y lo entrega al prestador de las evaluaciones médicas ocupacionales junto con la matriz de peligros y los indicadores del SG-SST, para que el médico oriente los énfasis de cada evaluación (Resolución 1843 de 2025, arts. 3 literal m, 5 literal d y 16; Resolución 0312 de 2019, estándares 3.1.3 y 3.1.4).

> El médico especialista en SST o medicina del trabajo de la IPS revisa este perfil y recomienda los énfasis y exámenes complementarios definitivos. La periodicidad de las evaluaciones periódicas la define la empresa en el SG-SST con justificación técnica, sin superar tres (3) años (art. 15).

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

| Examen | Pre-ingreso | Periódica | Egreso |
|---|---|---|---|
{{#each examenes}}
| {{this}} | ✔ | ✔ | ✔ |
{{/each}}

{{#if altoRiesgo.length}}**Tareas de alto riesgo:** {{join altoRiesgo ", "}} — requieren concepto de aptitud específico para la tarea (Resolución 1843 de 2025, art. 17).{{/if}}

{{/each}}

## Tipos de evaluación, periodicidad y criterios (Resolución 1843 de 2025)

- **Pre-ingreso** (art. 9): antes del inicio de labores, según el perfil del cargo.
- **Periódicas programadas y por cambio de ocupación** (art. 10): con la periodicidad definida por la empresa en el SG-SST con justificación técnica, como máximo cada tres (3) años (art. 15); por cambio de ocupación, antes de asumir las nuevas funciones cuando cambien los peligros.
- **Egreso** (art. 11): dentro de los cinco (5) días hábiles siguientes a la terminación del vínculo; se conserva la constancia de notificación al trabajador.
- **Retorno laboral** (art. 12): tras una ausencia no médica de noventa (90) días o más.
- **Post-incapacidad** (art. 13): tras una incapacidad de treinta (30) días o más.
- **Seguimiento** (art. 14): cuando el médico lo recomiende para vigilar una condición de salud o una restricción.
- El concepto de aptitud se expresa como apto, apto con recomendaciones, apto con restricciones o aplazado; se evita la expresión "no apto" (art. 19). Se comunica por escrito a cada trabajador, con evidencia (art. 5 literal i), y la empresa adapta el puesto a las restricciones en máximo veinte (20) días hábiles (art. 5 literal f).
- El costo de las evaluaciones lo asume en su totalidad el empleador; la ARL no puede pagarlas (arts. 5 literal a y 6).
- Está prohibido exigir prueba de embarazo, de VIH o VDRL (art. 21).
- La historia clínica ocupacional la custodia el prestador durante veinte (20) años; la empresa no conserva copia (art. 30).

Elaboró: {{responsable.nombre}} — Licencia SST {{default responsable.licencia "______"}}  |  Fecha: {{fecha}}

IPS: {{op.ips}}

Revisó (médico de la IPS): {{op.medicoIps.nombre}}  Licencia: {{default op.medicoIps.cedula "__________"}}
