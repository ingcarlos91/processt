---
codigo: ACT-01
nombre: Conformación del COPASST o designación del Vigía de SST
tipo: ACT
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.6"]
normas: ["RES-2013-1986","DL-1295-1994","DEC-1072-2015","RES-0312-2019","RES-1401-2007"]
---
## Fundamento

{{#if comites.copasst.esVigia}}
Por tener menos de diez (10) trabajadores, **{{empresa.razonSocial}}** no está obligada a conformar un comité paritario (Resolución 2013 de 1986, art. 1) y cuenta con un Vigía de Seguridad y Salud en el Trabajo, que cumple las mismas funciones del comité (Decreto Ley 1295 de 1994, art. 35 literal c y parágrafo). Los soportes de la designación del Vigía y los registros de sus actuaciones hacen parte de la documentación del SG-SST (Decreto 1072 de 2015, art. 2.2.4.6.12 numeral 10).
{{else}}
Por tener {{empresa.trabajadores}} trabajadores, **{{empresa.razonSocial}}** debe conformar un Comité Paritario de Seguridad y Salud en el Trabajo (COPASST), obligatorio desde diez (10) trabajadores (Resolución 2013 de 1986, art. 1), con la siguiente composición: {{comites.copasst.composicion}}. La norma fija, por cada parte, un representante de 10 a 49 trabajadores; dos de 50 a 499; tres de 500 a 999, y cuatro desde 1.000 trabajadores, cada uno con su suplente (art. 2). El periodo es de dos (2) años (Decreto Ley 1295 de 1994, art. 63 literal a, que modificó el año previsto en el art. 6 de la Resolución 2013). Los soportes de la convocatoria, la elección y la conformación hacen parte de la documentación del SG-SST (Decreto 1072 de 2015, art. 2.2.4.6.12 numeral 10).

Cuando la empresa tenga dos o más establecimientos, puede conformar un comité por cada uno, con representación calculada sobre los trabajadores del municipio y los municipios vecinos (Resolución 2013 de 1986, art. 4).
{{/if}}

## Elección y designación

{{#if comites.copasst.esVigia}}
Ninguna norma vigente define si el Vigía se elige o se designa. Para garantizar la participación de los trabajadores en el SG-SST (Decreto 1072 de 2015, art. 2.2.4.6.8 numeral 9), la empresa recomienda que el Vigía sea elegido por los trabajadores o designado por el representante legal con su participación, y deja constancia en este documento.

{{empresa.ciudad}}, {{integrantes.copasst.inicio}}

En la fecha, con participación de los trabajadores, se escoge como Vigía de Seguridad y Salud en el Trabajo de {{empresa.razonSocial}} a la persona que se registra en el acta de conformación.

Forma de escogencia: Elección por los trabajadores ☐  Designación con participación de los trabajadores ☐
{{else}}
### Convocatoria a elecciones

{{empresa.ciudad}}, {{#if integrantes.copasst.eleccion.convocatoria}}{{integrantes.copasst.eleccion.convocatoria}}{{else}}______{{/if}}

La gerencia de {{empresa.razonSocial}} convoca a todos los trabajadores a inscribir sus candidatos y a participar, mediante votación libre, en la elección de sus representantes ante el COPASST para el periodo de dos (2) años (Resolución 2013 de 1986, arts. 5 y 14).

- Inscripción de candidatos: del {{integrantes.copasst.eleccion.inscripcionDesde}} al {{integrantes.copasst.eleccion.inscripcionHasta}}.
- Fecha de votación: {{integrantes.copasst.eleccion.fechaVotacion}}. Lugar: {{integrantes.copasst.eleccion.lugar}}. Horario: {{integrantes.copasst.eleccion.horario}}.
- Se elegirán {{comites.copasst.porParte}} representante(s) principal(es) de los trabajadores y sus suplentes (art. 2).

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

### Acta de votación y escrutinio

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

### Designación de los representantes del empleador

El representante legal de {{empresa.razonSocial}} designa directamente a los representantes del empleador ante el COPASST, principales y suplentes, que se relacionan en el acta de conformación, y designa entre ellos al presidente del comité (Resolución 2013 de 1986, arts. 5, 9 y 14).

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
{{/if}}

## Acta de conformación

{{#if comites.copasst.esVigia}}
| Rol | Nombre | Documento | Cargo | Firma |
|---|---|---|---|---|
{{#if integrantes.copasst.hayMiembros}}
{{#each integrantes.copasst.miembros}}
| {{rolTexto}} | {{nombre}} | {{doc}} | {{cargo}} | |
{{/each}}
{{else}}
| Vigía | | | | |
{{/if}}

Periodo: del {{integrantes.copasst.inicio}} al {{integrantes.copasst.fin}}. La norma no fija el periodo del Vigía; la empresa adopta dos (2) años por analogía con el del comité paritario (Decreto Ley 1295 de 1994, art. 63 literal a). Designar un suplente del Vigía es una buena práctica, no una exigencia legal.
{{else}}
En {{empresa.ciudad}}, el día {{integrantes.copasst.inicio}}, se reunieron los representantes del empleador designados por el representante legal y los representantes de los trabajadores elegidos por votación, para conformar el COPASST de {{empresa.razonSocial}} por el periodo de dos (2) años, del {{integrantes.copasst.inicio}} al {{integrantes.copasst.fin}}.

| Representación | Rol | Nombre | Documento | Cargo | Firma |
|---|---|---|---|---|---|
{{#if integrantes.copasst.hayMiembros}}
{{#each integrantes.copasst.miembros}}
| {{representa}} | {{rolTexto}} | {{nombre}} | {{doc}} | {{cargo}} | |
{{/each}}
{{else}}
| Empleador | Principal | | | | |
{{#if (gte comites.copasst.porParte 2)}}| Empleador | Principal | | | | |
{{/if}}{{#if (gte comites.copasst.porParte 3)}}| Empleador | Principal | | | | |
{{/if}}{{#if (gte comites.copasst.porParte 4)}}| Empleador | Principal | | | | |
{{/if}}| Empleador | Suplente | | | | |
{{#if (gte comites.copasst.porParte 2)}}| Empleador | Suplente | | | | |
{{/if}}{{#if (gte comites.copasst.porParte 3)}}| Empleador | Suplente | | | | |
{{/if}}{{#if (gte comites.copasst.porParte 4)}}| Empleador | Suplente | | | | |
{{/if}}| Trabajadores | Principal | | | | |
{{#if (gte comites.copasst.porParte 2)}}| Trabajadores | Principal | | | | |
{{/if}}{{#if (gte comites.copasst.porParte 3)}}| Trabajadores | Principal | | | | |
{{/if}}{{#if (gte comites.copasst.porParte 4)}}| Trabajadores | Principal | | | | |
{{/if}}| Trabajadores | Suplente | | | | |
{{#if (gte comites.copasst.porParte 2)}}| Trabajadores | Suplente | | | | |
{{/if}}{{#if (gte comites.copasst.porParte 3)}}| Trabajadores | Suplente | | | | |
{{/if}}{{#if (gte comites.copasst.porParte 4)}}| Trabajadores | Suplente | | | | |
{{/if}}{{/if}}

- Presidente (designado por el empleador entre sus representantes, cada año): {{integrantes.copasst.presidente}}
- Secretario (elegido por el comité entre la totalidad de sus miembros): {{integrantes.copasst.secretario}}

Solo los miembros principales asisten a las reuniones; los suplentes asisten en ausencia de los principales (Resolución 2013 de 1986, art. 2).
{{/if}}

## Funcionamiento

{{#if comites.copasst.esVigia}}
1. **Reuniones y registros:** el Vigía se reúne como mínimo una vez al mes con el responsable del SG-SST, dentro de la jornada, y deja registro de sus actuaciones en el formato ACT-02 (Decreto 1072 de 2015, art. 2.2.4.6.12 numeral 10; Resolución 2013 de 1986, art. 7, aplicable por tener el Vigía las mismas funciones del comité). Ante un accidente grave o un riesgo inminente, se reúne dentro de los cinco (5) días siguientes con el jefe del área donde ocurrió.
2. **Presidencia y secretaría:** el Vigía cumple personalmente las tareas que en el comité tienen el presidente y el secretario: preparar el temario, informar a los trabajadores sobre sus actividades, llevar el archivo de sus registros y tramitar sus recomendaciones ante la gerencia (Resolución 2013 de 1986, arts. 12 y 13).
3. **Tiempo:** como buena práctica, la empresa le concede tiempo dentro de la jornada en la misma medida que a los miembros del comité (cuatro horas semanales, Decreto Ley 1295 de 1994, art. 63 literal b).
{{else}}
1. **Reuniones ordinarias:** como mínimo una vez al mes, en las instalaciones de la empresa y dentro de la jornada de trabajo (Resolución 2013 de 1986, art. 7).
2. **Reuniones extraordinarias:** cuando ocurra un accidente grave o se presente un riesgo inminente, el comité se reúne dentro de los cinco (5) días siguientes, con la presencia del jefe del área donde ocurrió (art. 7).
3. **Quórum:** la mitad más uno de sus miembros. Si pasados treinta (30) minutos de la hora fijada no hay quórum, el comité sesiona con los presentes y sus decisiones son válidas (art. 8).
4. **Presidente:** designado por el empleador entre sus representantes, cada año. Preside y orienta las reuniones, gestiona el lugar, convoca por escrito a las reuniones mensuales, prepara el temario, tramita ante la gerencia las recomendaciones aprobadas e informa a los trabajadores sobre las actividades del comité (arts. 9 y 12).
5. **Secretario:** elegido por el comité. Verifica la asistencia, toma nota de los temas, elabora el acta y la somete a aprobación del comité, y lleva el archivo de actas y documentos (arts. 9 y 13).
6. **Tiempo:** el empleador concede a cada miembro como mínimo cuatro (4) horas semanales dentro de la jornada para el cumplimiento de sus funciones (Decreto Ley 1295 de 1994, art. 63 literal b).
7. **Límites:** el comité no trata asuntos del contrato de trabajo, de personal, disciplinarios ni sindicales (Resolución 2013 de 1986, art. 10).
{{/if}}

**Compromisos del empleador:** facilitar la elección libre y oportuna de los representantes de los trabajadores, designar a los suyos, proporcionar los medios y recursos necesarios para el funcionamiento del {{#if comites.copasst.esVigia}}Vigía{{else}}comité{{/if}} y estudiar sus recomendaciones e informar las decisiones adoptadas (Resolución 2013 de 1986, art. 14; Decreto 1072 de 2015, art. 2.2.4.6.8 numerales 4 y 9).

## Funciones

{{#if comites.copasst.esVigia}}El Vigía cumple las mismas funciones del comité (Decreto Ley 1295 de 1994, art. 35 parágrafo):{{else}}Funciones del COPASST (Resolución 2013 de 1986, art. 11):{{/if}}

1. Proponer la adopción de medidas y actividades que procuren y mantengan la salud en los lugares de trabajo.
2. Proponer y participar en actividades de capacitación en SST dirigidas a trabajadores, supervisores y directivos.
3. Colaborar con los funcionarios de entidades gubernamentales de SST en las actividades que realicen en la empresa.
4. Vigilar el desarrollo de las actividades del SG-SST y el cumplimiento del reglamento de higiene y seguridad industrial.
5. Colaborar en el análisis de las causas de los accidentes de trabajo y enfermedades laborales y proponer medidas correctivas; participar en el equipo investigador de incidentes y accidentes (Resolución 1401 de 2007, art. 7).
6. Visitar periódicamente los lugares de trabajo e inspeccionar ambientes, máquinas, equipos y operaciones.
7. Estudiar y considerar las sugerencias de los trabajadores en materia de SST.
8. Servir como organismo de coordinación entre empleador y trabajadores.
9. Tramitar los reclamos de los trabajadores relacionados con la seguridad y salud en el trabajo.
10. Solicitar periódicamente a la empresa informes sobre accidentalidad y enfermedades laborales.
11. {{#if comites.copasst.esVigia}}Llevar el archivo de sus registros{{else}}Elegir al secretario del comité y mantener un archivo de las actas{{/if}}.
12. Participar en la revisión anual del programa de capacitación con la alta dirección (Decreto 1072 de 2015, art. 2.2.4.6.11 parágrafo 1).
13. Participar en la planificación de la auditoría anual del SG-SST (Decreto 1072 de 2015, art. 2.2.4.6.29) y conocer los resultados de la revisión por la alta dirección (art. 2.2.4.6.31 parágrafo).

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

{{#if comites.copasst.esVigia}}
______________________________________
{{#with integrantes.copasst.miembros.[0]}}**{{nombre}}** — Vigía de SST, acepto{{#if doc}} — {{doc}}{{/if}}{{else}}**Vigía de SST** — Acepto{{/with}}
{{else}}
______________________ {{integrantes.copasst.presidente}} (Presidente)  ______________________ {{integrantes.copasst.secretario}} (Secretario)
{{/if}}
