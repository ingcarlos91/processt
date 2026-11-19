---
codigo: POL-01
nombre: Política de Seguridad y Salud en el Trabajo
tipo: POL
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.1.1"]
normas: ["DEC-1072-2015","LEY-1562-2012","RES-0312-2019"]
---
## Declaración

**{{empresa.razonSocial}}**, identificada con NIT {{empresa.nit}}, dedicada a {{empresa.actividad}}, con domicilio en {{empresa.ciudad}}, se compromete desde su más alta dirección con la implementación, mantenimiento y mejora continua del Sistema de Gestión de la Seguridad y Salud en el Trabajo (SG-SST), con el fin de proteger la seguridad y la salud de todos sus trabajadores, independientemente de su forma de contratación o vinculación, incluidos contratistas, subcontratistas, trabajadores en misión, aprendices y visitantes, en todos sus centros de trabajo.

## Alcance

Esta política aplica a todos los centros de trabajo de la empresa{{#if sedes.length}} ({{#each sedes}}{{nombre}}{{#unless @last}}, {{/unless}}{{/each}}){{/if}} y a todas las personas que desarrollan actividades en ellos o en su nombre, en todos los procesos y turnos.

## Compromisos

La alta dirección de {{empresa.razonSocial}} se compromete a:

1. **Identificar los peligros, evaluar y valorar los riesgos y establecer los respectivos controles**, priorizando la eliminación y sustitución, seguidas de controles de ingeniería, administrativos y elementos de protección personal.
2. **Proteger la seguridad y salud de todos los trabajadores** mediante la mejora continua del SG-SST, la prevención de accidentes de trabajo y enfermedades laborales y la promoción de la salud, incluida la salud mental.
3. **Cumplir la normatividad nacional vigente aplicable en materia de riesgos laborales**, incluidos los estándares mínimos del SG-SST, y otros requisitos que suscriba la empresa.
4. Asignar los recursos financieros, técnicos y humanos necesarios para el diseño, implementación, revisión, evaluación y mejora del SG-SST.
5. Garantizar la participación y consulta de los trabajadores y de sus representantes ante el {{#if comites.copasst.esVigia}}Vigía de Seguridad y Salud en el Trabajo{{else}}Comité Paritario de Seguridad y Salud en el Trabajo (COPASST){{/if}}.
6. Prepararse para responder ante emergencias que puedan afectar a las personas, las instalaciones y el entorno.

## Comunicación y revisión

Esta política es concisa, está redactada con claridad, está fechada y firmada por el representante legal, será divulgada a todos los niveles de la organización, estará accesible a los trabajadores y demás partes interesadas en lugares visibles, y será comunicada al {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}}. Se revisará como mínimo una (1) vez al año y se actualizará cuando ocurran cambios en la organización o en la legislación.

Fundamento: Decreto 1072 de 2015, artículos 2.2.4.6.5, 2.2.4.6.6 y 2.2.4.6.7; Resolución 0312 de 2019, estándar 2.1.1.

## Firma

Dada en {{empresa.ciudad}}, el {{fecha}}.

&nbsp;

______________________________________
**{{empresa.representanteLegal}}**
Representante Legal
C.C. {{empresa.representanteCedula}}
