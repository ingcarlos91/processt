---
codigo: ACT-04
nombre: Conformación, reglamento y procedimiento del Comité de Convivencia Laboral
tipo: ACT
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.8"]
normas: ["RES-3461-2025","LEY-1010-2006","LEY-2365-2024"]
---
## Fundamento

**{{empresa.razonSocial}}** conforma el Comité de Convivencia Laboral (CCL) como medida preventiva del acoso laboral, de conformidad con la Ley 1010 de 2006 y la Resolución 3461 de 2025 del Ministerio del Trabajo, que derogó las Resoluciones 652 y 1356 de 2012. Cuando la empresa tenga varios centros de trabajo, se conforma un comité en la sede principal y uno por cada centro de trabajo.

> Nota para la consultora: verificar en el texto oficial de la Resolución 3461 de 2025 el número de integrantes según el tamaño de la empresa y el procedimiento de elección.

## Convocatoria y elección de representantes de los trabajadores

{{empresa.ciudad}}, {{fecha}}

Se convoca a los trabajadores a postular candidatos y votar por sus representantes ante el Comité de Convivencia Laboral, para un periodo de dos (2) años. Los candidatos deben tener competencias actitudinales y comportamentales como respeto, imparcialidad, tolerancia, serenidad, confidencialidad, reserva en el manejo de información, ética y habilidades de comunicación asertiva, liderazgo y resolución de conflictos. No podrán integrar el comité trabajadores a quienes se les haya formulado queja de acoso laboral o que hayan sido víctimas de acoso laboral en los últimos seis (6) meses.

## Acta de conformación

Fecha de conformación: {{integrantes.ccl.inicio}}. Periodo: hasta el {{integrantes.ccl.fin}}.

| Representación | Rol | Nombre | Cédula | Cargo | Firma |
|---|---|---|---|---|---|
{{#if integrantes.ccl.hayMiembros}}
{{#each integrantes.ccl.miembros}}
| {{representa}} | {{rolTexto}} | {{nombre}} | {{cedula}} | {{cargo}} | |
{{/each}}
{{else}}
| Empleador | Principal | | | | |
| Empleador | Suplente | | | | |
| Trabajadores | Principal | | | | |
| Trabajadores | Suplente | | | | |
{{/if}}

Presidente: {{integrantes.ccl.presidente}}  Secretario: {{integrantes.ccl.secretario}}

## Reglamento de funcionamiento

1. **Reuniones:** ordinarias una vez al mes y extraordinarias cuando se presenten casos que requieran intervención inmediata.
2. **Quórum:** mitad más uno de sus integrantes.
3. **Confidencialidad:** toda la información es reservada; los integrantes firman acuerdo de confidencialidad.
4. **Actas:** de cada reunión se levanta acta con los temas tratados y los compromisos.
5. **Informes:** el comité presenta informes a la alta dirección sobre su gestión, cuyos resultados se integran al SG-SST.
6. **Competencia:** el comité no conoce casos de acoso sexual, que se tramitan por el protocolo específico de la Ley 2365 de 2024.

## Funciones

1. Recibir y dar trámite a las quejas en las que se describan situaciones que puedan constituir acoso laboral, con sus pruebas.
2. Examinar de manera confidencial los casos.
3. Escuchar a las partes involucradas de manera individual sobre los hechos.
4. Adelantar reuniones con el fin de crear un espacio de diálogo entre las partes, promoviendo compromisos mutuos para llegar a una solución.
5. Formular un plan de mejora concertado entre las partes.
6. Hacer seguimiento a los compromisos adquiridos.
7. Si no hay acuerdo o la conducta persiste, informar a la alta dirección y cerrar el caso; el trabajador puede presentar la queja ante el inspector de trabajo o demandar ante el juez competente.
8. Presentar recomendaciones para el desarrollo efectivo de las medidas preventivas y correctivas del acoso laboral.

## Procedimiento de atención de quejas

| Paso | Actividad | Plazo |
|---|---|---|
| 1 | Recepción de la queja escrita (física o al correo {{op.correoQuejas}}) | Día 0 |
| 2 | Revisión de competencia y citación a las partes por separado | Dentro de los 10 días |
| 3 | Escucha individual de las partes | — |
| 4 | Reunión de diálogo y acuerdo de compromisos | — |
| 5 | Plan de mejora y seguimiento de compromisos | — |
| 6 | Cierre del caso e informe a la alta dirección | Máximo 65 días calendario desde la recepción |

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal
