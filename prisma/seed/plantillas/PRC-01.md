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

Aplica a todos los documentos y registros del SG-SST, en medio físico o electrónico.

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
4. Los documentos se revisan cuando cambie la normatividad, los procesos o los resultados del SG-SST, y como mínimo una vez al año los que la norma exige.

## Listado maestro de documentos

| Código | Documento | Versión | Carpeta |
|---|---|---|---|
{{#each documentosLista}}
| {{codigo}} | {{celda nombre}} | {{version}} | {{carpeta}} |
{{/each}}

## Conservación y retención

Los documentos y registros se conservan de manera controlada, legibles, identificables y accesibles, protegidos contra daño, deterioro o pérdida. Se admite la conservación electrónica siempre que se garantice la preservación de la información.

| Registro | Tiempo mínimo de conservación |
|---|---|
| Resultados de perfiles epidemiológicos de salud y conceptos de exámenes de ingreso, periódicos y de retiro | 20 años desde el retiro del trabajador |
| Resultados de mediciones y monitoreo a los ambientes de trabajo | 20 años desde el retiro del trabajador |
| Registros de las actividades de capacitación, formación y entrenamiento en SST | 20 años desde el retiro del trabajador |
| Registro del suministro de elementos y equipos de protección personal | 20 años desde el retiro del trabajador |
| Demás documentos del SG-SST | Mínimo 5 años o según la tabla de retención documental de la empresa |

Las historias clínicas ocupacionales permanecen bajo custodia de la IPS o del médico que realiza las evaluaciones. La información de salud es dato sensible y se trata conforme a la Ley 1581 de 2012.

## Acceso

El responsable del SG-SST tiene acceso a todos los documentos, excepto a las historias clínicas ocupacionales. Los trabajadores pueden consultar los registros relacionados con su salud, con garantía de confidencialidad.
