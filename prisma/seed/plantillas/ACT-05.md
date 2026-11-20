---
codigo: ACT-05
nombre: Conformación de la brigada de emergencias
tipo: ACT
nivelMin: 7
carpeta: 5. Gestión de amenazas
estandares: ["5.1.2"]
normas: ["DEC-1072-2015","RES-0312-2019","RES-4272-2021","RES-0491-2020"]
---
## Fundamento

El empleador debe conformar, capacitar, entrenar y dotar la brigada de prevención, preparación y respuesta ante emergencias, que incluye la atención de primeros auxilios, de acuerdo con su nivel de riesgo y los recursos disponibles (Decreto 1072 de 2015, art. 2.2.4.6.25 numeral 11; Resolución 0312 de 2019, estándar 5.1.2).

## Acta de conformación

En {{empresa.ciudad}}, el {{integrantes.brigada.inicio}}, **{{empresa.razonSocial}}** conforma su brigada de emergencias con los siguientes integrantes:

| Nombre | Documento | Cargo | Rol en la brigada | Firma |
|---|---|---|---|---|
{{#if integrantes.brigada.hayMiembros}}
{{#each integrantes.brigada.miembros}}
| {{nombre}} | {{doc}} | {{cargo}} | {{rolTexto}} | |
{{/each}}
{{else}}
| | | | Jefe de brigada | |
| | | | Primeros auxilios | |
| | | | Control de incendios | |
| | | | Evacuación | |
{{/if}}

La brigada participa en el simulacro anual de todos los trabajadores (Decreto 1072 de 2015, art. 2.2.4.6.25 numeral 10; Resolución 0312 de 2019, estándar 5.1.1) y en la inspección periódica de los equipos de emergencia (numeral 12).

## Dimensionamiento

El número de brigadistas se define según las necesidades y el tamaño de la empresa ({{empresa.trabajadores}} trabajadores; Resolución 0312 de 2019, estándar 5.1.2). Criterio adoptado por la empresa: al menos un brigadista por área, piso o sede y por turno, de modo que siempre haya brigadistas presentes mientras haya personal trabajando.

| Sede / área | Turno | Brigadistas necesarios | Brigadistas asignados |
|---|---|---|---|
{{#each sedes}}
| {{nombre}} | | | |
{{/each}}

## Funciones

**Antes:** participar en capacitaciones y simulacros, inspeccionar equipos de emergencia, conocer las rutas de evacuación.
**Durante:** dar la alarma, controlar conatos de incendio, prestar primeros auxilios, guiar la evacuación hacia el punto de encuentro.
**Después:** verificar el personal en el punto de encuentro, apoyar a los organismos de socorro, evaluar el evento y proponer mejoras.

{{#if (or dis.alturas dis.confinados)}}
## Rescate en tareas de alto riesgo

{{#if dis.alturas}}- **Rescate en alturas:** la brigada cuenta con brigadistas o personal capacitado y entrenado para el plan de rescate en alturas, con equipos de rescate certificados (Resolución 4272 de 2021, art. 26 y art. 5 literal d).
{{/if}}{{#if dis.confinados}}- **Rescate en espacios confinados:** se dispone de personal formado para ejecutar el procedimiento de rescate, que haya participado en la práctica del plan, con elementos de rescate certificados (Resolución 0491 de 2020, art. 27 numerales 4, 6 y 7).
{{/if}}
{{/if}}

## Plan de capacitación de la brigada

La intensidad es la que sugiere la empresa (ninguna norma fija horas para la brigada); se ajusta con la ARL según el nivel de riesgo.

| Tema | Intensidad sugerida | Mes |
|---|---|---|
| Primeros auxilios básicos | 8 h | {{op.brigadaPlan.capacitacion}} |
| Prevención y control de incendios, uso de extintores | 4 h | {{op.brigadaPlan.capacitacion}} |
| Evacuación y rescate | 4 h | {{op.brigadaPlan.capacitacion}} |
{{#if dis.alturas}}
| Rescate en alturas (plan de rescate de la empresa) | Según el plan | {{op.brigadaPlan.capacitacion}} |
{{/if}}
{{#if dis.confinados}}
| Rescate en espacios confinados | Según el plan | {{op.brigadaPlan.capacitacion}} |
{{/if}}
| Simulacro anual | Una jornada | {{op.brigadaPlan.simulacro}} |

Registro de la capacitación realizada (soporte del estándar 5.1.2):

| Fecha | Tema | Horas | Entidad o instructor | Asistentes |
|---|---|---|---|---|
| | | | | |

## Dotación

Botiquín de primeros auxilios según el riesgo y el número de trabajadores, camilla con inmovilizadores, extintores según el tipo de fuego, chalecos o brazaletes de identificación, linterna, pito o megáfono.

Registro de entrega de la dotación:

| Fecha | Elemento | Cantidad | Ubicación | Recibe (nombre y firma) |
|---|---|---|---|---|
| | | | | |

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
