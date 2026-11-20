---
codigo: ACT-02
nombre: Acta de reunión del COPASST / registro de actuaciones del Vigía (formato)
tipo: ACT
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.6"]
normas: ["RES-2013-1986","DL-1295-1994","DEC-1072-2015"]
---
## Datos de la reunión

{{#if comites.copasst.esVigia}}Registro de las actuaciones del Vigía de SST (Decreto 1072 de 2015, art. 2.2.4.6.12 numeral 10). El Vigía se reúne como mínimo una vez al mes con el responsable del SG-SST.{{else}}Acta de reunión del COPASST. El comité se reúne como mínimo una vez al mes, en las instalaciones de la empresa y dentro de la jornada de trabajo (Resolución 2013 de 1986, art. 7).{{/if}}

| Campo | Información |
|---|---|
| Acta N.º | |
| Fecha | |
| Hora inicio / fin | |
| Lugar | |
| Dentro de la jornada de trabajo | Sí ☐ No ☐ |
| Convocatoria escrita enviada el | |
| Tipo | Ordinaria ☐ Extraordinaria ☐ |
| Motivo de la extraordinaria | Accidente grave ☐ Riesgo inminente ☐ Otro ☐ |
| Fecha del evento (extraordinaria) | |
| Jefe del área del evento (asistente) | |

Si la reunión es extraordinaria por accidente grave o riesgo inminente, debe realizarse dentro de los cinco (5) días siguientes al evento y con la presencia del jefe del área donde ocurrió (Resolución 2013 de 1986, art. 7).

## Asistentes y quórum

| Nombre | Rol | Asistió | Firma |
|---|---|---|---|
{{#if integrantes.copasst.hayMiembros}}
{{#each integrantes.copasst.miembros}}
| {{nombre}} | {{rolTexto}} {{representa}} | ☐ | |
{{/each}}
{{else}}
{{#if comites.copasst.esVigia}}
| | Vigía | ☐ | |
{{else}}
| | Presidente | ☐ | |
| | Secretario | ☐ | |
| | | ☐ | |
{{/if}}
{{/if}}
| {{responsable.nombre}} | Responsable del SG-SST (invitado) | ☐ | |

{{#unless comites.copasst.esVigia}}
Principales presentes: ____ de ____. Quórum: Sí ☐ No ☐. El quórum es la mitad más uno de los miembros; si a los treinta (30) minutos de la hora fijada no lo hay, el comité sesiona con los presentes y sus decisiones son válidas (Resolución 2013 de 1986, art. 8). Los suplentes asisten solo en ausencia de los principales (art. 2).
{{/unless}}

## Orden del día

1. Verificación de la asistencia y del quórum.
2. Lectura y aprobación del acta anterior y seguimiento de compromisos (Resolución 2013 de 1986, art. 13).
3. Respuesta de la gerencia a las recomendaciones presentadas (art. 14).
4. Accidentes de trabajo, incidentes y enfermedades laborales del mes y sus investigaciones.
5. Resultados de inspecciones realizadas.
6. Avance del plan anual de trabajo y del programa de capacitación.
7. Sugerencias y reclamos de los trabajadores en materia de SST (art. 11).
8. Propuestas de medidas preventivas y recomendaciones a la gerencia.
9. Temas periódicos, cuando correspondan: revisión anual del programa de capacitación (Decreto 1072 de 2015, art. 2.2.4.6.11 parágrafo 1), planificación de la auditoría anual (art. 2.2.4.6.29) y resultados de la revisión por la alta dirección (art. 2.2.4.6.31 parágrafo).
10. Compromisos y varios.

## Desarrollo

(Registrar lo tratado en cada punto)

{{#if accidentalidad.pendientes.length}}
**Punto 4 — Eventos con investigación pendiente o en curso**

| Fecha | Tipo | Cargo | Investigación |
|---|---|---|---|
{{#each accidentalidad.pendientes}}
| {{fecha}} | {{tipo}} | {{celda cargo}} | {{investigacion}} |
{{/each}}
{{/if}}

## Compromisos

| N.º | Compromiso | Responsable | Fecha |
|---|---|---|---|
| | | | |

## Tiempo dedicado

| Integrante | Horas dedicadas en la semana a funciones del {{#if comites.copasst.esVigia}}Vigía{{else}}comité{{/if}} |
|---|---|
| | |

El empleador concede a cada miembro del comité como mínimo cuatro (4) horas semanales dentro de la jornada (Decreto Ley 1295 de 1994, art. 63 literal b){{#if comites.copasst.esVigia}}; para el Vigía se aplica como buena práctica{{/if}}.

## Firmas

{{#if comites.copasst.esVigia}}
______________________ {{#with integrantes.copasst.miembros.[0]}}{{nombre}}{{else}}Vigía de SST{{/with}} (Vigía)  ______________________ {{responsable.nombre}} (Responsable del SG-SST)
{{else}}
______________________ {{integrantes.copasst.presidente}} (Presidente)  ______________________ {{integrantes.copasst.secretario}} (Secretario)
{{/if}}
