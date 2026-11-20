---
codigo: DOC-06
nombre: Reglamento de Higiene y Seguridad Industrial
tipo: DOC
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: []
normas: ["CST-1950","LEY-962-2005","RES-2400-1979","LEY-9-1979","DEC-1072-2015","LEY-1562-2012","RES-2013-1986","RES-1843-2025"]
condicion: {"trabajadoresMin":10}
---
## Identificación de la empresa

Reglamento elaborado conforme a los artículos 348 a 352 del Código Sustantivo del Trabajo. Es obligatorio para los empleadores con diez (10) o más trabajadores permanentes y, si se trata de un establecimiento nuevo, debe elaborarse a más tardar dentro de los tres (3) meses siguientes al inicio de labores (art. 349, modificado por la Ley 962 de 2005, art. 55). El texto vigente del art. 349 ya no exige aprobación del Ministerio del Trabajo, que vigila su cumplimiento y puede sancionar (arts. 349 y 352). Contiene, por lo menos, los puntos del art. 350 y se fija en dos lugares visibles (art. 351).

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

La empresa se compromete a cumplir las disposiciones legales vigentes que garantizan la oportuna y adecuada prevención de los accidentes de trabajo y las enfermedades laborales, de conformidad con los artículos 57, 58 y 348 a 352 del Código Sustantivo del Trabajo, la Ley 9 de 1979, la Resolución 2400 de 1979, la Ley 1562 de 2012, el Decreto 1072 de 2015 y demás normas que con tal fin se establezcan.

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

## Artículo 4. Obligaciones y prevención de accidentes y enfermedades

La empresa y sus trabajadores darán estricto cumplimiento a las disposiciones legales, así como a las normas técnicas e internas que se adopten para la prevención de accidentes y enfermedades, en las actividades de medicina preventiva y del trabajo, higiene y seguridad industrial, concordantes con el presente reglamento y con el SG-SST (Código Sustantivo del Trabajo, art. 350 numeral 2). La empresa suministra y acondiciona locales y equipos de trabajo que garanticen la seguridad y salud de los trabajadores (art. 348).

## Artículo 5. Protección e higiene personal

La empresa suministra sin costo los elementos de protección personal que requiere cada cargo según la matriz de peligros, capacita en su uso y mantenimiento, y los repone cuando se deterioran. Los trabajadores están obligados a usarlos y conservarlos, a cumplir las normas de higiene personal y de orden y aseo, y a reportar las condiciones inseguras (Código Sustantivo del Trabajo, art. 350 numeral 1; Decreto 1072 de 2015, art. 2.2.4.6.24 parágrafo 1).

## Artículo 6. Servicio médico y sanidad del establecimiento

- La empresa practica a sus trabajadores las evaluaciones médicas ocupacionales de ingreso, periódicas y de egreso, por medio de prestadores con licencia en SST (Código Sustantivo del Trabajo, arts. 348 y 350 numeral 3; Resolución 1843 de 2025). La empresa recibe solo el concepto de aptitud y las recomendaciones, nunca el diagnóstico, que permanece reservado en la historia clínica.
- Dispone de botiquín y de personal de la brigada capacitado en primeros auxilios.
- Mantiene los servicios sanitarios, el agua para consumo humano, la limpieza y la disposición de residuos en condiciones higiénicas (Ley 9 de 1979; Resolución 2400 de 1979).
- Cuando la ley lo exija, dispone de salas cuna o salas de lactancia (art. 350 numeral 3).

## Artículo 7. Condiciones de los locales

La empresa no facilita alojamiento a trabajadores en edificios destinados a actividades peligrosas o insalubres (Código Sustantivo del Trabajo, art. 350 numeral 4) y provee sillas a los trabajadores cuya labor lo permita, en especial en tiendas, fábricas, talleres y establecimientos similares (art. 350 numeral 5).

## Artículo 8. Disposiciones especiales según la actividad

{{#if (or dis.trabajoCaliente dis.electrico dis.quimicos)}}
{{#if dis.trabajoCaliente}}- **Soldadura y trabajos en caliente:** los locales donde se suelda tienen ventilación y separación adecuadas, y los trabajadores usan la protección específica para soldadura (careta, guantes, ropa ignífuga) (Código Sustantivo del Trabajo, art. 350 numeral 6; Resolución 2400 de 1979).
{{/if}}{{#if dis.electrico}}- **Riesgo eléctrico:** las instalaciones y los trabajos eléctricos se ejecutan por personal calificado, con bloqueo y etiquetado y elementos dieléctricos (art. 350 numeral 8; Resolución 2400 de 1979).
{{/if}}{{#if dis.quimicos}}- **Sustancias inflamables o peligrosas:** se almacenan en lugares ventilados, señalizados y separados de fuentes de ignición, con sus fichas de datos de seguridad disponibles (art. 350 numeral 8).
{{/if}}
{{else}}
La empresa no registra actividades de soldadura, energía eléctrica ni depósitos de sustancias inflamables o explosivas.
{{/if}}
Si la empresa llega a desarrollar actividades mineras o petroleras, agrícolas, ganaderas o forestales, adopta las normas especiales de higiene y seguridad de esos sectores (art. 350 numerales 7 y 9) y actualiza este reglamento.

## Artículo 9. Inducción

La empresa ha implementado un proceso de inducción del trabajador a las actividades que deba desempeñar, capacitándolo respecto a las medidas de prevención y seguridad que exija el medio ambiente laboral y el trabajo específico que vaya a realizar.

## Artículo 10. Publicación y vigencia

Este reglamento permanecerá fijado en por lo menos dos (2) lugares visibles de los locales de trabajo (Código Sustantivo del Trabajo, art. 351) y su contenido se da a conocer a todos los trabajadores en el momento de su ingreso. Entra en vigencia a partir de su publicación; la empresa lo actualiza cuando cambien sus peligros, su actividad o las normas aplicables.

## Firma

Fecha: {{fecha}}

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
