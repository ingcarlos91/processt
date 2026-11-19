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

**{{empresa.razonSocial}}** conforma el Comité de Convivencia Laboral (CCL) como medida preventiva del acoso laboral, de conformidad con la Ley 1010 de 2006 y la Resolución 3461 de 2025 del Ministerio del Trabajo, que derogó las Resoluciones 652 y 1356 de 2012 (art. 16). La obligación aplica a todo empleador sin umbral de tamaño (art. 2). Cuando la empresa tenga varios centros de trabajo, se conforma un comité central en la sede principal y uno por cada centro de trabajo (art. 3).

**Composición según el número de trabajadores (art. 3):** menos de 5 trabajadores, 1 representante de los trabajadores y 1 del empleador, sin suplentes; de 5 a 20, 1 y 1 con sus suplentes; más de 20, 2 y 2 con sus suplentes. Por tener {{empresa.trabajadores}} trabajadores, el comité de {{empresa.razonSocial}} se integra con **{{integrantes.ccl.composicion.texto}}**. El empleador designa directamente a sus representantes; los trabajadores eligen los suyos mediante votación secreta.

## Convocatoria y elección de representantes de los trabajadores

{{empresa.ciudad}}, {{fecha}}

Se convoca a los trabajadores a postular candidatos y votar por sus representantes ante el Comité de Convivencia Laboral, para un periodo de dos (2) años (art. 5). Se elegirán {{integrantes.ccl.composicion.porParte}} representante(s) principal(es){{#if integrantes.ccl.composicion.suplentes}} y sus suplentes{{/if}}. Los candidatos deben tener competencias actitudinales y comportamentales como respeto, imparcialidad, tolerancia, serenidad, confidencialidad, reserva en el manejo de información, ética y habilidades de comunicación asertiva, liderazgo y resolución de conflictos. No podrán integrar el comité los trabajadores a quienes se les haya formulado queja de acoso laboral o que hayan sido víctimas de acoso laboral en el año anterior a la elección o designación.

## Acta de conformación

Fecha de conformación: {{integrantes.ccl.inicio}}. Periodo: hasta el {{integrantes.ccl.fin}}.

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

Presidente: {{integrantes.ccl.presidente}}  Secretario: {{integrantes.ccl.secretario}}

## Reglamento de funcionamiento (art. 4)

1. **Reuniones (arts. 9 y 10):** ordinarias una vez al mes y extraordinarias cada vez que se reciba una queja o se presenten casos que requieran intervención inmediata.
2. **Quórum:** mitad más uno de sus integrantes (art. 9).
3. **Confidencialidad:** toda la información es reservada; los integrantes suscriben un acuerdo de confidencialidad que hace parte de este reglamento (art. 4).
4. **Actas:** de cada reunión se levanta acta con los temas tratados y los compromisos.
5. **Informes (art. 6):** el comité presenta a la alta dirección informes trimestrales sobre su gestión y un informe anual con resultados y recomendaciones, que se integran al SG-SST.
6. **Capacitación (art. 12):** la empresa capacita a los directivos, los mandos medios y los miembros del comité en prevención del acoso laboral, resolución de conflictos y funcionamiento del comité.
7. **Competencia:** el comité no conoce casos de acoso sexual (art. 6 par. 1), que se tramitan por el protocolo específico de la Ley 2365 de 2024 y el Decreto 1040 de 2026 (PRC-06).

## Funciones (art. 6)

1. Recibir y dar trámite a las quejas en las que se describan situaciones que puedan constituir acoso laboral, con sus pruebas.
2. Examinar de manera confidencial los casos.
3. Escuchar a las partes involucradas de manera individual sobre los hechos.
4. Adelantar reuniones con el fin de crear un espacio de diálogo entre las partes, promoviendo compromisos mutuos para llegar a una solución.
5. Formular un plan de mejora concertado entre las partes.
6. Hacer seguimiento mensual a los compromisos adquiridos.
7. Si no hay acuerdo o la conducta persiste, remitir el caso a la alta dirección y cerrar la actuación del comité; el trabajador puede presentar la queja ante el inspector de trabajo o demandar ante el juez competente.
8. Presentar a la alta dirección recomendaciones para el desarrollo efectivo de las medidas preventivas y correctivas del acoso laboral.

## Procedimiento de atención de quejas (art. 6)

Plazos en días calendario, contados desde la recepción de la queja. El trámite completo no supera los sesenta y cinco (65) días calendario.

| Paso | Actividad | Plazo |
|---|---|---|
| 1 | Recepción de la queja (física o al correo {{op.correoQuejas}}), registro y trámite inicial; convocatoria de reunión extraordinaria del comité | 5 días |
| 2 | Examen confidencial del caso y de las pruebas | 5 días (ampliable a 10; máximo 15) |
| 3 | Escucha individual de las partes | 5 días |
| 4 | Reunión de diálogo entre las partes y formulación del plan de mejora concertado | 5 días (ampliable; máximo 15) |
| 5 | Presentación de recomendaciones a la alta dirección | De 5 a 10 días |
| 6 | Si no hay acuerdo o la conducta persiste: remisión del caso a la alta dirección y cierre de la actuación del comité | Máximo 15 días |
| 7 | Seguimiento a los compromisos del plan de mejora | Mensual |

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
