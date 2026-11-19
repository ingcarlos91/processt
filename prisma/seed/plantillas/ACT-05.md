---
codigo: ACT-05
nombre: Conformación de la brigada de emergencias
tipo: ACT
nivelMin: 7
carpeta: 5. Gestión de amenazas
estandares: ["5.1.2"]
normas: ["DEC-1072-2015","DEC-2157-2017"]
---
## Fundamento

El empleador debe conformar, capacitar, entrenar y dotar la brigada de prevención, preparación y respuesta ante emergencias, que incluye la atención de primeros auxilios (Decreto 1072 de 2015, art. 2.2.4.6.25 numeral 11; Resolución 0312 de 2019, estándar 5.1.2).

## Acta de conformación

En {{empresa.ciudad}}, el {{integrantes.brigada.inicio}}, **{{empresa.razonSocial}}** conforma su brigada de emergencias con los siguientes integrantes voluntarios:

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

Se recomienda al menos un brigadista por área y por turno.

## Funciones

**Antes:** participar en capacitaciones y simulacros, inspeccionar equipos de emergencia, conocer las rutas de evacuación.
**Durante:** dar la alarma, controlar conatos de incendio, prestar primeros auxilios, guiar la evacuación hacia el punto de encuentro.
**Después:** verificar el personal en el punto de encuentro, apoyar a los organismos de socorro, evaluar el evento y proponer mejoras.

## Plan de capacitación de la brigada

| Tema | Intensidad | Mes |
|---|---|---|
| Primeros auxilios básicos | 8 h | {{op.brigadaPlan.capacitacion}} |
| Prevención y control de incendios, uso de extintores | 4 h | {{op.brigadaPlan.capacitacion}} |
| Evacuación y rescate | 4 h | {{op.brigadaPlan.capacitacion}} |
| Simulacro anual | Una jornada | {{op.brigadaPlan.simulacro}} |

## Dotación

Botiquín tipo A o B, camilla con inmovilizadores, extintores según tipo de fuego, chalecos o brazaletes de identificación, linterna, pito o megáfono.

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
