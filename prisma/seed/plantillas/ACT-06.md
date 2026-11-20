---
codigo: ACT-06
nombre: Acta de revisión del SG-SST por la alta dirección
tipo: ACT
nivelMin: 7
carpeta: 6. Verificación del SG-SST
estandares: ["6.1.3","7.1.2"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Datos de la revisión

| Campo | Información |
|---|---|
| Empresa | {{empresa.razonSocial}} |
| Periodo revisado | Enero a diciembre de {{anio}} |
| Fecha de la revisión | |
| Participantes | {{empresa.representanteLegal}} (representante legal), {{responsable.nombre}} (responsable del SG-SST), {{integrantes.copasst.presidente}} ({{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}}) |

La alta dirección revisa el SG-SST por lo menos una vez al año, cualquiera que sea el tamaño de la empresa (Decreto 1072 de 2015, art. 2.2.4.6.31).{{#if (eq empresa.nivel 7)}} Para una empresa de 7 estándares, la revisión puede ser breve; los 24 aspectos se responden en forma proporcional al tamaño de la empresa.{{else}} Corresponde al estándar 6.1.3 de la Resolución 0312 de 2019.{{/if}}

## Revisión (art. 2.2.4.6.31 del Decreto 1072 de 2015)

| N.º | Aspecto | Resultado / análisis |
|---|---|---|
| 1 | Eficacia de las estrategias para alcanzar objetivos, metas y resultados | |
| 2 | Cumplimiento del plan de trabajo anual y su cronograma | Plan {{anio}}: {{len plan}} actividad(es) programada(s). Ejecutadas: ______. |
| 3 | Suficiencia de los recursos asignados | |
| 4 | Capacidad del SG-SST para satisfacer las necesidades de la empresa en SST | |
| 5 | Necesidad de cambios en el SG-SST, incluida la política y los objetivos | |
| 6 | Eficacia de las medidas de seguimiento de revisiones anteriores | |
| 7 | Resultados de indicadores y auditorías anteriores | Indicadores {{accidentalidad.indicadores.anio}} (Res. 0312/2019 art. 30): frecuencia {{accidentalidad.indicadores.frecuencia}} y severidad {{accidentalidad.indicadores.severidad}} por cada 100 trabajadores (promedio mensual), proporción de AT mortales {{accidentalidad.indicadores.mortalidad}}, prevalencia {{accidentalidad.indicadores.prevalencia}} e incidencia {{accidentalidad.indicadores.incidencia}} de enfermedad laboral por 100.000 trabajadores, ausentismo {{accidentalidad.indicadores.ausentismo}}{{#if accidentalidad.indicadores.estimado}} (con meses estimados){{/if}}; año anterior: frecuencia {{accidentalidad.anterior.indicadores.frecuencia}}, severidad {{accidentalidad.anterior.indicadores.severidad}}, ausentismo {{accidentalidad.anterior.indicadores.ausentismo}}; cumplimiento del plan anual: {{#if planEjecucion.hay}}{{planEjecucion.texto}}{{else}}______.{{/if}} (Ver registro anual de indicadores mínimos.) {{#if ultimaAuditoria}}Auditoría interna {{ultimaAuditoria.anio}} (cerrada el {{ultimaAuditoria.cierre}}): conformidad {{ultimaAuditoria.conformidad}}, {{ultimaAuditoria.noConformes}} no conformidad(es) y {{ultimaAuditoria.acciones}} acción(es).{{/if}} |
| 8 | Nuevas prioridades y objetivos estratégicos | |
| 9 | Eficacia de las medidas de prevención y control de peligros | |
| 10 | Comunicación de resultados y desempeño a los trabajadores | |
| 11 | Decisiones para mejorar la identificación de peligros y el control de riesgos | |
| 12 | Promoción de la participación de los trabajadores | |
| 13 | Cumplimiento de la normatividad y de los estándares mínimos | {{#if evaluacion.existe}}Última {{evaluacion.tipo}}: {{evaluacion.puntaje}} % ({{evaluacion.valoracion}}).{{/if}} |
| 14 | Acciones de mejora continua | {{#if accidentalidad.hayAcciones}}{{accidentalidad.resumen.accionesCerradas}} acción(es) cerrada(s) y {{accidentalidad.resumen.accionesAbiertas}} abierta(s) en el registro FOR-06.{{/if}} |
| 15 | Cumplimiento de planes específicos, metas y objetivos | |
| 16 | Inspecciones sistemáticas de puestos, máquinas, equipos e instalaciones | |
| 17 | Vigilancia de las condiciones de los ambientes de trabajo | |
| 18 | Vigilancia de las condiciones de salud de los trabajadores | |
| 19 | Actualización de la identificación de peligros y evaluación de riesgos | |
| 20 | Notificación e investigación de incidentes, accidentes y enfermedades | {{accidentalidad.resumen.texto}} |
| 21 | Ausentismo laboral por causas asociadas a SST | {{accidentalidad.resumen.diasAt}} día(s) perdido(s) por accidentes de trabajo y {{accidentalidad.resumen.el}} enfermedad(es) laboral(es) en {{accidentalidad.resumen.anio}}. Días de ausencia por enfermedad laboral: {{accidentalidad.resumen.diasEl}} ({{accidentalidad.resumen.elNuevas}} caso(s) nuevo(s) y {{accidentalidad.resumen.elAntiguas}} antiguo(s)). Días de ausencia por enfermedad común: {{accidentalidad.resumen.diasAusentismo}}. |
| 22 | Pérdidas (daños a la propiedad, máquinas, equipos) relacionadas con SST | |
| 23 | Deficiencias en la gestión de SST | |
| 24 | Efectividad de los programas de rehabilitación | |

## Conclusiones

## Decisiones y acciones de mejora

| N.º | Acción | Responsable | Fecha |
|---|---|---|---|
| | | | |

## Comunicación

Los resultados se documentan y se divulgan al {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} y al responsable del SG-SST, quien define e implementa las acciones preventivas, correctivas y de mejora (art. 2.2.4.6.31, parágrafo). Los resultados y el desempeño del SG-SST también se comunican a los trabajadores (art. 2.2.4.6.31, num. 10).

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST — {{responsable.doc}}
