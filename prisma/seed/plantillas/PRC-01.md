---
codigo: PRC-01
nombre: Procedimiento de control de documentos, registros y retención documental
tipo: PRC
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.5.1"]
normas: ["DEC-1072-2015","RES-0312-2019","LEY-1581-2012"]
---
## Objetivo

Establecer la forma de elaborar, codificar, aprobar, distribuir, actualizar, conservar y disponer los documentos y registros del SG-SST de **{{empresa.razonSocial}}** (Decreto 1072 de 2015, arts. 2.2.4.6.12 y 2.2.4.6.13).

## Alcance

Aplica a todos los documentos y registros del SG-SST, en papel, medio magnético, óptico, electrónico, fotografía o una combinación de estos, bajo la custodia del responsable del SG-SST (Decreto 1072 de 2015, art. 2.2.4.6.12 parágrafo 1).

## Codificación

Los documentos se identifican con el código `{TIPO}-{NN}`:

| Prefijo | Tipo |
|---|---|
| POL | Política |
| DOC | Documento |
| PLN | Plan |
| PRG | Programa |
| PRC | Procedimiento |
| MTZ | Matriz |
| FOR | Formato / registro |
| ACT | Acta |

Cada documento indica código, versión, fecha de emisión, quién elaboró, revisó y aprobó.

## Elaboración, aprobación y actualización

1. El responsable del SG-SST elabora o actualiza el documento.
2. El representante legal aprueba con su firma los documentos que lo requieran (política, plan anual, objetivos, designaciones, presupuesto).
3. Toda modificación incrementa la versión y se registra en el listado maestro.
4. Los documentos se redactan de manera clara y entendible para quienes deben aplicarlos o consultarlos, y se revisan y actualizan cuando sea necesario: cuando cambie la normatividad, los procesos o los resultados del SG-SST, y como mínimo una vez al año los que la norma exige (art. 2.2.4.6.12 parágrafo 2).
5. **Distribución:** la versión vigente se difunde y se pone a disposición de los trabajadores en los apartes que les competen (cartelera, inducción, correo o carpeta compartida); las versiones obsoletas se retiran de uso y se conservan identificadas como tales (art. 2.2.4.6.12 parágrafo 2).

## Listado maestro de documentos

| Código | Documento | Versión | Carpeta |
|---|---|---|---|
{{#each documentosLista}}
| {{codigo}} | {{celda nombre}} | {{version}} | {{carpeta}} |
{{/each}}

## Registros que se conservan además del listado

El empleador mantiene disponibles y actualizados, además de los documentos del listado, los registros que exige el art. 2.2.4.6.12 del Decreto 1072 de 2015:

| Registro | Numeral | Dónde se conserva |
|---|---|---|
| Entrega de equipos y elementos de protección personal | 8 | |
| Entrega de protocolos de seguridad, fichas técnicas e instructivos | 9 | |
| Convocatoria, elección y conformación del {{#if comites.copasst.esVigia}}Vigía (delegación) y soportes de sus actuaciones{{else}}COPASST y actas de sus reuniones{{/if}} | 10 | |
| Reportes e investigaciones de incidentes, accidentes de trabajo y enfermedades laborales | 11 | |
| Resultados de mediciones ambientales y de monitoreos biológicos (si aplican) | 13 | |
| Inspecciones a instalaciones, máquinas o equipos | 14 | |
| Evidencias de las gestiones para el control de los riesgos prioritarios | 16 | |
| Soportes de afiliación y pago a la seguridad social | Res. 0312 de 2019 | |
| Comunicaciones de trabajadores, ARL o autoridades en riesgos laborales | Res. 0312 de 2019 | |

## Conservación y retención

Los documentos y registros se conservan de manera controlada, legibles, identificables y accesibles, protegidos contra daño, deterioro o pérdida. Se admite la conservación electrónica siempre que se garantice la preservación de la información.

| Registro | Tiempo mínimo de conservación |
|---|---|
| Resultados de perfiles epidemiológicos de salud y conceptos de exámenes de ingreso, periódicos y de retiro (cuando la empresa no cuenta con médico especialista en SST) | 20 años desde el retiro del trabajador (art. 2.2.4.6.13 num. 1) |
| Cuando la empresa cuenta con médico especialista en SST: resultados de exámenes de ingreso, periódicos y de egreso y de los complementarios (paraclínicos, audiometrías, espirometrías, monitoreo biológico, etc.), bajo reserva y custodia del médico | 20 años desde el retiro del trabajador (num. 2) |
| Resultados de mediciones y monitoreo a los ambientes de trabajo | 20 años desde el retiro del trabajador (num. 3) |
| Registros de las actividades de capacitación, formación y entrenamiento en SST | 20 años desde el retiro del trabajador (num. 4) |
| Registro del suministro de elementos y equipos de protección personal | 20 años desde el retiro del trabajador (num. 5) |
| Demás documentos y registros del SG-SST (incluidos afiliación a seguridad social y comunicaciones) | El que fije la tabla de retención documental de la empresa: ______ años. La norma no fija un plazo; el empleador elabora y cumple su propio sistema de retención (art. 2.2.4.6.13, inciso final) |

Las historias clínicas ocupacionales permanecen bajo custodia de la IPS o del médico que realiza las evaluaciones. La información de salud es dato sensible y se trata conforme a la Ley 1581 de 2012.

## Acceso

El responsable del SG-SST tiene acceso a todos los documentos y registros, excepto a las historias clínicas ocupacionales de los trabajadores, salvo que tenga perfil de médico especialista en SST (art. 2.2.4.6.13). El trabajador puede consultar los registros relativos a su salud solicitándolos al médico responsable en la empresa, si lo hay, o a la institución prestadora de servicios de SST que los efectuó, con garantía de confidencialidad (art. 2.2.4.6.12 parágrafo 3).
