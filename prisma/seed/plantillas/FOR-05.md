---
codigo: FOR-05
nombre: Informe de simulacro de emergencias
tipo: FOR
nivelMin: 7
carpeta: 5. Gestión de amenazas
estandares: ["5.1.1"]
normas: ["DEC-1072-2015"]
---
## Datos del simulacro

| Campo | Información |
|---|---|
| Fecha | |
| Sede | {{#each sedes}}{{nombre}}{{#unless @last}} / {{/unless}}{{/each}} |
| Punto de encuentro | {{op.puntoEncuentro}} |
| Escenario simulado | ☐ Sismo ☐ Incendio ☐ Otro: |
| Tipo | ☐ Avisado ☐ Sin aviso |
| Hora de la alarma | |
| Hora de llegada del último trabajador al punto de encuentro | |
| Tiempo total de evacuación | |
| Número de participantes | |

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

| Hallazgo | Acción | Responsable | Fecha |
|---|---|---|---|
| | | | |

Firmas: ______________ {{#each integrantes.brigada.miembros}}{{#if (eq rol "jefe_brigada")}}{{nombre}}{{/if}}{{/each}} (Jefe de brigada)   ______________ {{responsable.nombre}} (Responsable del SG-SST)
