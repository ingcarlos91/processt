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

## Acciones de mejora

| N.º | Estándar | Actividad | Responsable | Fecha límite | Recursos | Soporte de efectividad |
|---|---|---|---|---|---|---|
{{#each planMejora}}
| {{inc @index}} | {{estandar}} | {{celda actividad}} | {{responsable}} | {{fecha}} | {{recursos}} | {{celda soporte}} |
{{/each}}

## Seguimiento y reporte

- El plan de mejoramiento se incluye y aprueba dentro del plan anual de trabajo.
- El avance se informa en el mes de julio y se registra en la aplicación del Fondo de Riesgos Laborales del Ministerio del Trabajo, con copia a la ARL, según la circular vigente (Circular 027 de 2026).
- {{#if (eq evaluacion.valoracion "CRÍTICO")}}Por valoración crítica, se reporta avance a la ARL a los tres (3) meses.{{/if}}{{#if (eq evaluacion.valoracion "MODERADAMENTE ACEPTABLE")}}Por valoración moderadamente aceptable, se reporta avance a la ARL a los seis (6) meses.{{/if}}

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST
