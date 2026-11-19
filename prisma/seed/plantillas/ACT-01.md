---
codigo: ACT-01
nombre: Conformación del COPASST o designación del Vigía de SST
tipo: ACT
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.6"]
normas: ["RES-2013-1986","DL-1295-1994","DEC-1072-2015","RES-0312-2019"]
---
## Fundamento

{{#if comites.copasst.esVigia}}
Por tener menos de diez (10) trabajadores, **{{empresa.razonSocial}}** debe contar con un Vigía de Seguridad y Salud en el Trabajo, designado por el empleador, que cumple las funciones del COPASST (Decreto Ley 1295 de 1994, art. 35 parágrafo; Decreto 1072 de 2015, art. 2.2.4.6.12 numeral 10; Resolución 2013 de 1986, arts. 1 y 3).
{{else}}
Por tener {{empresa.trabajadores}} trabajadores, **{{empresa.razonSocial}}** debe conformar un Comité Paritario de Seguridad y Salud en el Trabajo (COPASST) con la siguiente composición: {{comites.copasst.composicion}} (Resolución 2013 de 1986, art. 2). El periodo es de dos (2) años (Decreto Ley 1295 de 1994, art. 63 literal a) y el comité se reúne como mínimo una vez al mes dentro de la jornada laboral (Resolución 2013 de 1986, art. 7).
{{/if}}

{{#if comites.copasst.esVigia}}
## Designación del Vigía

{{empresa.ciudad}}, {{integrantes.copasst.inicio}}

El representante legal de {{empresa.razonSocial}} designa como Vigía de Seguridad y Salud en el Trabajo a:

| Rol | Nombre | Documento | Cargo |
|---|---|---|---|
{{#if integrantes.copasst.hayMiembros}}
{{#each integrantes.copasst.miembros}}
| {{rolTexto}} | {{nombre}} | {{doc}} | {{cargo}} |
{{/each}}
{{else}}
| Vigía principal | | | |
| Suplente | | | |
{{/if}}

Periodo: dos (2) años, del {{integrantes.copasst.inicio}} al {{integrantes.copasst.fin}}.

## Funciones del Vigía

1. Proponer la adopción de medidas y actividades que procuren y mantengan la salud en los lugares de trabajo.
2. Proponer y participar en actividades de capacitación en SST.
3. Colaborar con los funcionarios de entidades gubernamentales de SST en las actividades que realicen en la empresa.
4. Vigilar el desarrollo de las actividades del SG-SST.
5. Colaborar en el análisis de las causas de los accidentes de trabajo y enfermedades laborales y proponer medidas correctivas.
6. Visitar periódicamente los lugares de trabajo e inspeccionar ambientes, máquinas, equipos y operaciones.
7. Estudiar y considerar las sugerencias de los trabajadores en materia de SST.
8. Servir como organismo de coordinación entre el empleador y los trabajadores.

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

______________________________________
{{#with integrantes.copasst.miembros.[0]}}**{{nombre}}** — Vigía de SST, acepto la designación{{#if doc}} — {{doc}}{{/if}}{{else}}**Vigía de SST** — Acepto la designación{{/with}}
{{else}}
## Convocatoria a elecciones

{{empresa.ciudad}}, {{#if integrantes.copasst.eleccion.convocatoria}}{{integrantes.copasst.eleccion.convocatoria}}{{else}}{{fecha}}{{/if}}

La gerencia de {{empresa.razonSocial}} convoca a todos los trabajadores a inscribir sus candidatos y participar en la elección de sus representantes ante el COPASST para el periodo de dos (2) años.

- Inscripción de candidatos: del {{integrantes.copasst.eleccion.inscripcionDesde}} al {{integrantes.copasst.eleccion.inscripcionHasta}}.
- Fecha de votación: {{integrantes.copasst.eleccion.fechaVotacion}}. Lugar: {{integrantes.copasst.eleccion.lugar}}. Horario: {{integrantes.copasst.eleccion.horario}}.
- Se elegirán {{comites.copasst.porParte}} representante(s) principal(es) y sus suplentes por los trabajadores.

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

## Acta de votación y escrutinio

El día {{integrantes.copasst.eleccion.fechaVotacion}}, en {{integrantes.copasst.eleccion.lugar}}, se realizó la votación para elegir a los representantes de los trabajadores ante el COPASST, con los siguientes resultados:

| Candidato | Votos |
|---|---|
{{#if integrantes.copasst.eleccion.resultados.length}}
{{#each integrantes.copasst.eleccion.resultados}}
| {{candidato}} | {{votos}} |
{{/each}}
{{else}}
| | |
| | |
{{/if}}
| Votos en blanco | {{integrantes.copasst.eleccion.blanco}} |
| Votos nulos | {{integrantes.copasst.eleccion.nulos}} |
| **Total de votantes** | {{integrantes.copasst.eleccion.votantes}} |

Jurados de votación: {{integrantes.copasst.eleccion.jurados}}

______________________ ______________________

## Acta de conformación del COPASST

En {{empresa.ciudad}}, el día {{integrantes.copasst.inicio}}, se reunieron los representantes del empleador designados por el representante legal y los representantes de los trabajadores elegidos por votación, para conformar el COPASST de {{empresa.razonSocial}} por el periodo de dos (2) años.

| Representación | Rol | Nombre | Documento | Cargo | Firma |
|---|---|---|---|---|---|
{{#if integrantes.copasst.hayMiembros}}
{{#each integrantes.copasst.miembros}}
| {{representa}} | {{rolTexto}} | {{nombre}} | {{doc}} | {{cargo}} | |
{{/each}}
{{else}}
| Empleador | Principal | | | | |
| Empleador | Suplente | | | | |
| Trabajadores | Principal | | | | |
| Trabajadores | Suplente | | | | |
{{/if}}

- Presidente (designado por el empleador): {{integrantes.copasst.presidente}}
- Secretario (elegido por el comité): {{integrantes.copasst.secretario}}

El empleador concede a los miembros del comité cuatro (4) horas semanales dentro de la jornada para el cumplimiento de sus funciones (Decreto Ley 1295 de 1994, art. 63 literal b). Las reuniones ordinarias se realizarán mensualmente (Resolución 2013 de 1986, art. 7).

## Funciones del COPASST

1. Proponer la adopción de medidas y actividades que procuren y mantengan la salud en los lugares de trabajo.
2. Proponer y participar en actividades de capacitación en SST dirigidas a trabajadores, supervisores y directivos.
3. Colaborar con los funcionarios de entidades gubernamentales de SST.
4. Vigilar el desarrollo de las actividades del SG-SST y el cumplimiento del reglamento de higiene y seguridad industrial.
5. Colaborar en el análisis de las causas de los accidentes de trabajo y enfermedades laborales y proponer medidas correctivas.
6. Visitar periódicamente los lugares de trabajo e inspeccionar ambientes, máquinas, equipos y operaciones.
7. Estudiar y considerar las sugerencias de los trabajadores en materia de SST.
8. Servir como organismo de coordinación entre empleador y trabajadores.
9. Solicitar periódicamente a la empresa informes sobre accidentalidad y enfermedades laborales.
10. Elegir al secretario del comité y mantener un archivo de las actas.
11. Participar en la planificación de la auditoría anual del SG-SST.
{{/if}}
