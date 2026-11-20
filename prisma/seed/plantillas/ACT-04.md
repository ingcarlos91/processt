---
codigo: ACT-04
nombre: Conformación, reglamento y procedimiento del Comité de Convivencia Laboral
tipo: ACT
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.8"]
normas: ["RES-3461-2025","LEY-1010-2006","LEY-2365-2024","DEC-1040-2026"]
---
## Fundamento

**{{empresa.razonSocial}}** conforma el Comité de Convivencia Laboral (CCL) como medida preventiva del acoso laboral, de conformidad con la Ley 1010 de 2006 y la Resolución 3461 de 2025 del Ministerio del Trabajo, que derogó las Resoluciones 652 y 1356 de 2012 (art. 16). La obligación aplica a todo empleador sin umbral de tamaño (art. 2). Cuando la empresa tenga varios centros de trabajo, se conforma un comité de nivel central y uno por cada centro de trabajo (art. 3).{{#if integrantes.ccl.hayOtrasSedes}} Este documento corresponde al comité de nivel central{{#if integrantes.ccl.sede}} ({{integrantes.ccl.sede}}){{/if}}; los centros de trabajo tienen su propio comité, con su propia acta: {{#each integrantes.ccl.otrasSedes}}{{sede}} (del {{inicio}} al {{fin}}){{#unless @last}}; {{/unless}}{{/each}}.{{/if}}

**Composición según el número de trabajadores (art. 3):** menos de 5 trabajadores, 1 representante de los trabajadores y 1 del empleador; más de 5 y menos de 20, 1 y 1 con sus suplentes; más de 20, 2 y 2 con sus suplentes. La norma no ubica expresamente a las empresas de exactamente 5 o 20 trabajadores; la empresa aplica el tramo más protector: con 5 trabajadores, 1 y 1 con sus suplentes, y con 20, 2 y 2 con sus suplentes. Se pueden designar más integrantes, siempre en igual número por cada parte. Por tener {{integrantes.ccl.composicion.trabajadores}} trabajadores al momento de la conformación ({{integrantes.ccl.composicion.tramo}}), el comité de {{empresa.razonSocial}} se integra con **{{integrantes.ccl.composicion.texto}}**. Si el número de trabajadores cambia durante el periodo, no es necesario ajustar la conformación hasta que este termine (art. 5 parágrafo 1).

**Empresas de servicios temporales (art. 3 parágrafos 1 y 2):** las quejas de los trabajadores en misión se tramitan en primera instancia ante el CCL de la empresa usuaria, con la participación de al menos un representante del CCL de la empresa de servicios temporales, que mantiene sus responsabilidades como empleadora.

El CCL tiene un rol preventivo, orientador, conciliador y canalizador; no determina si existe o no acoso laboral (art. 6).

## Convocatoria y elección de representantes de los trabajadores

{{empresa.ciudad}}, {{#if integrantes.ccl.eleccion.convocatoria}}{{integrantes.ccl.eleccion.convocatoria}}{{else}}______{{/if}}

Se convoca a los trabajadores a postular candidatos y votar por sus representantes ante el Comité de Convivencia Laboral, para un periodo de dos (2) años (art. 5). Se elegirán {{integrantes.ccl.composicion.porParte}} representante(s) principal(es){{#if integrantes.ccl.composicion.suplentes}} y sus suplentes{{/if}}. El empleador designa directamente a sus representantes; los trabajadores eligen los suyos mediante votación secreta, con escrutinio público (art. 3). Procedimiento de votación:

- Inscripción de candidatos: del {{integrantes.ccl.eleccion.inscripcionDesde}} al {{integrantes.ccl.eleccion.inscripcionHasta}}.
- Votación secreta: {{integrantes.ccl.eleccion.fechaVotacion}}. Lugar: {{integrantes.ccl.eleccion.lugar}}. Horario: {{integrantes.ccl.eleccion.horario}}.
- Escrutinio público al cierre de la votación, con jurados: {{integrantes.ccl.eleccion.jurados}}.

Los representantes del empleador no tienen que ser de nivel directivo ni los de los trabajadores de nivel operativo. Los candidatos deben tener competencias actitudinales y comportamentales como respeto, imparcialidad, tolerancia, serenidad, confidencialidad, reserva en el manejo de información, ética y habilidades de comunicación asertiva, liderazgo y resolución de conflictos (art. 3). No podrán integrar el comité los trabajadores a quienes se les haya formulado queja de acoso laboral o que hayan sido víctimas de acoso laboral en el año anterior a su conformación (art. 3).

**Resultado del escrutinio**

| Candidato | Votos |
|---|---|
{{#if integrantes.ccl.eleccion.resultados.length}}
{{#each integrantes.ccl.eleccion.resultados}}
| {{candidato}} | {{votos}} |
{{/each}}
{{else}}
| | |
| | |
{{/if}}
| Votos en blanco | {{integrantes.ccl.eleccion.blanco}} |
| Votos nulos | {{integrantes.ccl.eleccion.nulos}} |
| **Total de votantes** | {{integrantes.ccl.eleccion.votantes}} |

## Acta de conformación

Fecha de conformación (comunicación de la elección y designación): {{integrantes.ccl.inicio}}. Periodo de dos (2) años, hasta el {{integrantes.ccl.fin}} (art. 5).

| Representación | Rol | Nombre | Documento | Cargo | Firma |
|---|---|---|---|---|---|
{{#if integrantes.ccl.hayMiembros}}
{{#each integrantes.ccl.miembros}}
| {{representa}} | {{rolTexto}} | {{nombre}} | {{doc}} | {{cargo}} | |
{{/each}}
{{else}}
| Empleador | Principal | | | | |
{{#if (gte integrantes.ccl.composicion.porParte 2)}}| Empleador | Principal | | | | |
{{/if}}{{#if integrantes.ccl.composicion.suplentes}}| Empleador | Suplente | | | | |
{{#if (gte integrantes.ccl.composicion.porParte 2)}}| Empleador | Suplente | | | | |
{{/if}}{{/if}}| Trabajadores | Principal | | | | |
{{#if (gte integrantes.ccl.composicion.porParte 2)}}| Trabajadores | Principal | | | | |
{{/if}}{{#if integrantes.ccl.composicion.suplentes}}| Trabajadores | Suplente | | | | |
{{#if (gte integrantes.ccl.composicion.porParte 2)}}| Trabajadores | Suplente | | | | |
{{/if}}{{/if}}{{/if}}

Presidente (elegido de mutuo acuerdo por los integrantes, art. 7): {{integrantes.ccl.presidente}}  Secretario (elegido de mutuo acuerdo, art. 8): {{integrantes.ccl.secretario}}

Si un miembro principal se retira, su suplente asume sin necesidad de convocar nuevas elecciones (art. 5). Al terminar el periodo, el comité entrega toda la documentación al nuevo comité para su custodia y reserva (art. 5 parágrafo 2).

## Reglamento de funcionamiento (art. 4)

1. **Reuniones (arts. 9 y 10):** ordinarias una vez al mes, para informes, seguimiento a compromisos y recomendaciones; extraordinarias cada vez que se reciba una queja o se presenten casos que requieran intervención inmediata.
2. **Quórum:** mitad más uno de sus integrantes (art. 9).
3. **Confidencialidad:** toda la información es reservada, durante el trámite y después del cierre de los casos; los integrantes suscriben el acuerdo de confidencialidad que hace parte de este reglamento (art. 4).
4. **Actas:** de cada reunión se levanta acta con los temas tratados y los compromisos, en el formato de este documento.
5. **Informes (art. 6 nums. 9 y 10):** el comité presenta a la alta dirección informes trimestrales de gestión con estadísticas y casos (sin datos que identifiquen a las personas) y un informe anual de resultados, además de los que soliciten los organismos de control. Estos informes se integran al SG-SST.
6. **Capacitación (art. 12):** la empresa capacita a los directivos, los mandos medios y los miembros del comité en resolución de conflictos, comunicación asertiva y habilidades sociales; la ARL apoya la capacitación de los miembros del comité (art. 14).
7. **Principios (art. 6 par. 4):** celeridad, eficacia, imparcialidad, confidencialidad y no discriminación, con perspectiva de género.
8. **Competencia:** el comité no conoce casos de acoso sexual, porque no son conciliables (art. 6 par. 1); se tramitan por el protocolo específico de la Ley 2365 de 2024 y el Decreto 1040 de 2026 (PRC-06).
9. **Reglamento interno de trabajo:** este procedimiento interno, confidencial, conciliatorio y efectivo se incorpora al Reglamento Interno de Trabajo (Ley 1010 de 2006, art. 9 num. 1).

## Acuerdo de confidencialidad

Los integrantes del Comité de Convivencia Laboral de {{empresa.razonSocial}} se obligan a guardar reserva absoluta sobre las quejas, las pruebas, la identidad de las personas involucradas y todo lo tratado en el comité; a no divulgar ni usar esa información para fines distintos al trámite; a custodiar los documentos en el archivo reservado del comité, y a mantener esta obligación después de terminar su periodo y de cerrar cada caso (Resolución 3461 de 2025, art. 4).

| Nombre | Documento | Firma |
|---|---|---|
{{#if integrantes.ccl.hayMiembros}}
{{#each integrantes.ccl.miembros}}
| {{nombre}} | {{doc}} | |
{{/each}}
{{else}}
| | | |
| | | |
{{/if}}

## Funciones (art. 6)

1. Recibir y dar trámite a las quejas en las que se describan situaciones que puedan constituir acoso laboral, con sus pruebas.
2. Examinar de manera confidencial los casos.
3. Escuchar a las partes involucradas de manera individual sobre los hechos.
4. Adelantar reuniones con el fin de crear un espacio de diálogo entre las partes, promoviendo compromisos mutuos para llegar a una solución, y formular un plan de mejora concertado.
5. Hacer seguimiento mensual a los compromisos adquiridos.
6. Si no hay acuerdo, se incumplen los compromisos o la conducta persiste, informar a la alta dirección y cerrar la actuación del comité; el trabajador puede presentar la queja ante el inspector de trabajo o demandar ante el juez competente.
7. Presentar a la alta dirección recomendaciones para el desarrollo efectivo de las medidas preventivas y correctivas del acoso laboral, con copia al trabajador.
8. Hacer seguimiento mensual al cumplimiento de las recomendaciones por parte de talento humano y del SG-SST.
9. Elaborar informes trimestrales de gestión para la alta dirección.
10. Elaborar el informe anual de resultados y los informes que soliciten los organismos de control.

## Funciones del presidente y del secretario (arts. 7 y 8)

- **Presidente:** convoca y preside las sesiones ordinarias y extraordinarias, tramita las recomendaciones ante la administración y les hace seguimiento mensual, gestiona los recursos con la alta dirección, garantiza la confidencialidad y vela por el cumplimiento de las funciones del comité.
- **Secretario:** recibe las quejas escritas con sus pruebas, convoca a las sesiones indicando día, hora y lugar, cita a las partes de manera individual y conjunta, lleva el archivo y la reserva de la información, elabora el orden del día y las actas, envía las recomendaciones a las dependencias, hace seguimiento a los compromisos y remite los informes trimestrales a la alta dirección. Por acuerdo del comité, el rol puede ser rotativo con designación formal.

## Procedimiento de atención de quejas (art. 6)

Plazos en días calendario. Cada plazo se cuenta desde el final del paso anterior; las prórrogas se justifican por escrito. El trámite preventivo completo no supera los sesenta y cinco (65) días calendario desde la queja formal; el seguimiento mensual no se cuenta dentro de ese término (art. 6 parágrafos 2 y 3).

| Paso | Actividad | Plazo |
|---|---|---|
| 1 | Recepción de la queja (física o al correo {{op.correoQuejas}}), registro y trámite inicial; convocatoria de reunión extraordinaria del comité | 5 días |
| 2 | Examen confidencial del caso y de las pruebas | 5 días (prórroga de 10 con justificación escrita; máximo 15) |
| 3 | Escucha individual de las partes | 5 días |
| 4 | Reunión de diálogo entre las partes y formulación del plan de mejora concertado | 5 días después de escuchar a las partes (prórroga de 10 con justificación escrita; máximo 15) |
| 5 | Si no hay acuerdo, se incumple o la conducta persiste: informe a la alta dirección y cierre de la actuación del comité | Máximo 15 días después de verificar el incumplimiento |
| 6 | Recomendaciones a la alta dirección, con copia al trabajador | De 5 a 10 días |
| 7 | Seguimiento a los compromisos del plan de mejora y a las recomendaciones | Mensual |

## Responsabilidades del empleador y recursos (arts. 12 y 13)

- **Medidas preventivas:** política de prevención del acoso (POL-03), actividades de sensibilización e integración, capacitación en no discriminación con perspectiva de género, procedimiento de queja y capacitación con la ARL en primeros auxilios psicológicos para el comité, el COPASST o Vigía y la brigada (art. 12).
- **Medidas correctivas:** intervención de los factores de riesgo psicosocial con participación de los trabajadores, traslado a otra dependencia cuando lo recomienden el médico laboral, el médico tratante o el CCL, espacio de apoyo en crisis para quienes presentaron quejas, socialización de las rutas de salud mental y atención de las recomendaciones del comité (art. 12).
- **Recursos del comité (art. 13):** espacio físico y elementos para el manejo reservado de los documentos, recursos financieros y técnicos, y tiempo dentro de la jornada laboral para que los integrantes cumplan sus funciones.

## Formato de acta de reunión

| Campo | Información |
|---|---|
| Acta N.º / fecha / hora | |
| Tipo | Ordinaria ☐ Extraordinaria (queja) ☐ |
| Integrantes presentes / total | ____ de ____ (quórum: mitad más uno, art. 9) |
| Temas tratados (sin datos que identifiquen a las partes) | |
| Seguimiento a compromisos y recomendaciones | |
| Compromisos (responsable y fecha) | |

Firmas: ______________________ (Presidente)  ______________________ (Secretario)

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
