---
codigo: PLN-02
nombre: Plan de mejoramiento de estándares mínimos
tipo: PLN
nivelMin: 7
carpeta: 7. Mejoramiento
estandares: ["7.1.4"]
normas: ["RES-0312-2019","CIR-027-2026"]
---
## Objetivo

Definir las acciones para subsanar los estándares mínimos no cumplidos identificados en la {{#if evaluacion.existe}}{{evaluacion.tipo}} del {{evaluacion.fecha}}{{else}}evaluación{{/if}} de **{{empresa.razonSocial}}** (Resolución 0312 de 2019, art. 28).

## Resultado de la evaluación

{{#if evaluacion.existe}}
Puntaje obtenido: **{{evaluacion.puntaje}} %**. Valoración: **{{evaluacion.valoracion}}**.

Acción exigida por la norma: {{evaluacion.accion}}
{{else}}
Pendiente de diligenciar la evaluación de estándares mínimos.
{{/if}}

Valoración según el puntaje (Resolución 0312 de 2019, art. 28):

| Puntaje | Valoración | Qué exige la norma |
|---|---|---|
| Menos de 60 % | Crítico | Plan de mejoramiento de inmediato; reporte de avances a la ARL en máximo tres (3) meses; seguimiento anual y plan de visita del Ministerio del Trabajo |
| 60 % a 85 % | Moderadamente aceptable | Plan de mejoramiento; reporte de avances a la ARL en máximo seis (6) meses; plan de visita del Ministerio del Trabajo |
| Más de 85 % | Aceptable | Mantener la calificación y las evidencias a disposición del Ministerio del Trabajo e incluir las mejoras en el plan anual de trabajo |

## Acciones de mejora

Cada acción indica la actividad concreta, el responsable, el plazo, los recursos y la evidencia que demostrará su efectividad (Resolución 0312 de 2019, art. 28).

| N.º | Estándar | Actividad | Responsable | Fecha límite | Recursos | Evidencia de efectividad |
|---|---|---|---|---|---|---|
{{#each planMejora}}
| {{inc @index}} | {{estandar}} | {{celda actividad}} | {{responsable}} | {{fecha}} | {{recursos}} | {{celda soporte}} |
{{/each}}

## Seguimiento y reporte

- **Ciclo anual (Resolución 0312 de 2019, art. 26):** cada diciembre se aplica la autoevaluación de estándares mínimos, se elabora este plan de mejoramiento, que se aprueba dentro del plan anual de trabajo, y se formula el plan anual que se ejecuta desde el 1 de enero del año siguiente.
- **Copia a la ARL (art. 28, parágrafo 1):** la autoevaluación y el plan de mejoramiento se envían a la ARL, por correo electrónico o en físico, para su revisión y recomendaciones.
- **Registro ante el Ministerio del Trabajo (art. 28, parágrafo 2; Circular 027 de 2026):** la autoevaluación y el plan de mejoramiento se registran en la aplicación del Fondo de Riesgos Laborales (https://sgrl.mintrabajo.gov.co/). Para la vigencia 2025, el plazo es el 31 de julio de 2026. Cada año, la circular vigente del Ministerio fija el plazo.
- **Informe de avance (art. 28):** en el mes de julio se presenta el avance del plan, teniendo en cuenta las recomendaciones de la ARL.
{{#if (eq evaluacion.valoracion "CRÍTICO")}}- **Valoración crítica:** el plan se ejecuta de inmediato y se envía a la ARL un reporte de avances en máximo tres (3) meses después de la autoevaluación; el Ministerio del Trabajo hace seguimiento anual y plan de visita (art. 28).
{{/if}}{{#if (eq evaluacion.valoracion "MODERADAMENTE ACEPTABLE")}}- **Valoración moderadamente aceptable:** se envía a la ARL un reporte de avances en máximo seis (6) meses después de la autoevaluación; el Ministerio del Trabajo hace plan de visita (art. 28).
{{/if}}{{#if (eq evaluacion.valoracion "ACEPTABLE")}}- **Valoración aceptable:** se mantiene la calificación y las evidencias a disposición del Ministerio del Trabajo y las mejoras se incluyen en el plan anual de trabajo (art. 28).
{{/if}}

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST — {{responsable.doc}}
