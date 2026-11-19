---
codigo: DOC-06
nombre: Reglamento de Higiene y Seguridad Industrial
tipo: DOC
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: []
normas: ["CST-1950","RES-2400-1979","LEY-9-1979","DEC-1072-2015"]
condicion: {"trabajadoresMin":10}
---
## Identificación de la empresa

| Campo | Información |
|---|---|
| Razón social | {{empresa.razonSocial}} |
| NIT | {{empresa.nit}} |
| Dirección | {{empresa.direccion}}, {{empresa.ciudad}} |
| Actividad económica | {{empresa.ciiu}} — {{empresa.actividad}} |
| ARL | {{empresa.arl}} |
| Clase de riesgo | {{empresa.claseRiesgoRomano}} |
{{#each sedes}}
| Centro de trabajo | {{nombre}} — {{direccion}} |
{{/each}}

## Artículo 1. Objeto

La empresa se compromete a dar cumplimiento a las disposiciones legales vigentes tendientes a garantizar los mecanismos que aseguren una oportuna y adecuada prevención de los accidentes de trabajo y enfermedades laborales, de conformidad con los artículos 34, 57, 58, 108, 205, 206, 217, 220, 221, 282, 283, 348, 349, 350 y 351 del Código Sustantivo del Trabajo, la Ley 9 de 1979, la Resolución 2400 de 1979, la Ley 1562 de 2012, el Decreto 1072 de 2015 y demás normas que con tal fin se establezcan.

## Artículo 2. Sistema de Gestión de la Seguridad y Salud en el Trabajo

La empresa se obliga a promover y garantizar la constitución y funcionamiento del {{#if comites.copasst.esVigia}}Vigía de Seguridad y Salud en el Trabajo{{else}}Comité Paritario de Seguridad y Salud en el Trabajo{{/if}}, de conformidad con la Resolución 2013 de 1986 y el Decreto 1072 de 2015, y a desarrollar el Sistema de Gestión de la Seguridad y Salud en el Trabajo con los recursos necesarios.

## Artículo 3. Peligros existentes

Los peligros existentes en la empresa, identificados en la matriz de peligros, son principalmente:

{{#each matriz.porClasificacion}}
- **{{clasificacion}}:** {{total}} peligros identificados.
{{/each}}
{{#unless matriz.porClasificacion.length}}
- Los peligros se detallan en la matriz de identificación de peligros y valoración de riesgos.
{{/unless}}

Parágrafo: a efecto de que los peligros contemplados no se traduzcan en accidentes de trabajo o enfermedades laborales, la empresa ejerce su control en la fuente, en el medio transmisor o en el trabajador, de conformidad con lo estipulado en el SG-SST.

## Artículo 4. Obligaciones

La empresa y sus trabajadores darán estricto cumplimiento a las disposiciones legales, así como a las normas técnicas e internas que se adopten para lograr la implantación de las actividades de medicina preventiva y del trabajo, higiene y seguridad industrial, que sean concordantes con el presente reglamento y con el SG-SST.

## Artículo 5. Inducción

La empresa ha implementado un proceso de inducción del trabajador a las actividades que deba desempeñar, capacitándolo respecto a las medidas de prevención y seguridad que exija el medio ambiente laboral y el trabajo específico que vaya a realizar.

## Artículo 6. Publicación y vigencia

Este reglamento permanecerá exhibido en por lo menos dos (2) lugares visibles de los locales de trabajo, junto con la resolución aprobatoria si la hubiere, cuyos contenidos se dan a conocer a todos los trabajadores en el momento de su ingreso. El reglamento entra en vigencia a partir de su publicación y durante el tiempo que la empresa conserve, sin cambios sustanciales, las condiciones existentes en el momento de su aprobación.

## Firma

Fecha: {{fecha}}

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal
