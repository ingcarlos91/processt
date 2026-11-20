---
codigo: FOR-05
nombre: Informe de simulacro de emergencias
tipo: FOR
nivelMin: 7
carpeta: 5. Gestión de amenazas
estandares: ["5.1.1"]
normas: ["DEC-1072-2015","RES-0312-2019","RES-4272-2021","RES-0491-2020","RES-0591-2024"]
---
## Datos del simulacro

Se diligencia un informe por sede y por turno. El simulacro se hace al menos una vez al año con la participación de todos los trabajadores (Decreto 1072 de 2015, art. 2.2.4.6.25 numeral 10; Resolución 0312 de 2019, estándar 5.1.1).

| Campo | Información |
|---|---|
| Fecha | |
| Sede | ☐ {{#each sedes}}{{nombre}}{{#unless @last}} ☐ {{/unless}}{{/each}} |
| Turno | |
| Punto de encuentro | {{op.puntoEncuentro}} |
| Escenario simulado | ☐ Sismo ☐ Incendio{{#if dis.alturas}} ☐ Rescate en alturas{{/if}}{{#if dis.confinados}} ☐ Rescate en espacio confinado{{/if}}{{#if dis.residuosSalud}} ☐ Derrame de residuos de atención en salud{{/if}} ☐ Otro: |
| Tipo | ☐ Avisado ☐ Sin aviso |
| Hora de la alarma | |
| Hora de llegada del último trabajador al punto de encuentro | |
| Tiempo total de evacuación | |

## Cobertura

| Trabajadores convocados (sede y turno) | Participantes | Cobertura (%) | Contratistas y visitantes |
|---|---|---|---|
| | | | |

Se anexa la lista de asistencia firmada. Los trabajadores que no participaron se programan en un simulacro posterior del mismo año.

{{#if (or dis.alturas dis.confinados dis.residuosSalud)}}
## Práctica de los planes de rescate y contingencia

{{#if dis.alturas}}- **Rescate en alturas:** el capítulo de alturas del plan de emergencias se practica y verifica (Resolución 4272 de 2021, art. 26). Tiempo hasta la llegada del rescate: ______; equipos certificados usados: ______.
{{/if}}{{#if dis.confinados}}- **Rescate en espacio confinado:** el plan se practica y verifica formalmente al menos una vez antes de la actividad (Resolución 0491 de 2020, art. 27 numeral 2). Espacio y escenario: ______; participantes en el rescate: ______.
{{/if}}{{#if dis.residuosSalud}}- **Contingencia con residuos:** simulacro del plan de contingencias para el manejo de residuos (Resolución 0591 de 2024, manual, numeral 4.1.1.3.3). Escenario: ______.
{{/if}}
{{/if}}

## Evaluación

| Aspecto | Bueno | Regular | Malo | Observación |
|---|---|---|---|---|
| Activación y audibilidad de la alarma | | | | |
| Respuesta de los trabajadores | | | | |
| Actuación de la brigada | | | | |
| Uso de rutas de evacuación | | | | |
| Conteo en el punto de encuentro | | | | |
| Atención de lesionados simulados | | | | |

## Oportunidades de mejora

Los hallazgos se registran como acciones correctivas o de mejora y se usan para actualizar el plan de emergencias (PLN-04).

| Hallazgo | Acción | Responsable | Fecha |
|---|---|---|---|
| | | | |

Firmas: ______________ {{#each integrantes.brigada.miembros}}{{#if (eq rol "jefe_brigada")}}{{nombre}}{{/if}}{{/each}} (Jefe de brigada)   ______________ {{responsable.nombre}} (Responsable del SG-SST)
