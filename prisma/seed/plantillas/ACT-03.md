---
codigo: ACT-03
nombre: Plan y registro de capacitación del COPASST / Vigía
tipo: ACT
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.7"]
normas: ["RES-0312-2019","DL-1295-1994","RES-2013-1986","RES-4927-2016","DEC-1072-2015","RES-1401-2007"]
---
## Fundamento

**{{empresa.razonSocial}}** capacita a {{#if comites.copasst.esVigia}}su Vigía de Seguridad y Salud en el Trabajo{{else}}los integrantes de su COPASST{{/if}} para el cumplimiento efectivo de sus responsabilidades. La Resolución 0312 de 2019 exige capacitar a los integrantes del COPASST (art. 16, estándar 1.1.7, verificado con los documentos que evidencian la capacitación; en empresas de 11 a 50 trabajadores, el art. 9 lo incluye en el ítem de conformar, capacitar y verificar el COPASST). La afiliación a la ARL da derecho a que esta capacite a los miembros del comité paritario y a los vigías (Decreto Ley 1295 de 1994, art. 35 literal c), y el empleador debe proporcionar los medios para el funcionamiento del comité (Resolución 2013 de 1986, art. 14).{{#if comites.copasst.esVigia}} En empresas con Vigía, este plan es una buena práctica que soporta el ejercicio de las funciones que el Vigía comparte con el comité (Decreto Ley 1295 de 1994, art. 35 parágrafo).{{/if}}

## Integrantes a capacitar

| Nombre | Documento | Rol | Representa |
|---|---|---|---|
{{#if integrantes.copasst.hayMiembros}}
{{#each integrantes.copasst.miembros}}
| {{nombre}} | {{doc}} | {{rolTexto}} | {{representa}} |
{{/each}}
{{else}}
| | | | |
| | | | |
{{/if}}

Periodo del {{#if comites.copasst.esVigia}}Vigía{{else}}comité{{/if}}: del {{integrantes.copasst.inicio}} al {{integrantes.copasst.fin}}. Los integrantes que ingresen durante el periodo (por ejemplo, suplentes que asumen) reciben la capacitación al ingresar.

## Temas mínimos

| N.º | Tema | Fundamento | Fecha programada | Responsable / entidad |
|---|---|---|---|---|
| 1 | Funciones y funcionamiento del {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}}: reuniones, quórum, actas, límites | Resolución 2013 de 1986, arts. 7 a 13; Decreto Ley 1295 de 1994, art. 63 | | |
| 2 | El SG-SST de la empresa: política, objetivos, plan anual, matriz de peligros | Decreto 1072 de 2015, arts. 2.2.4.6.8 numeral 9 y 2.2.4.6.11 | | |
| 3 | Inspecciones de seguridad a lugares de trabajo, máquinas y equipos | Resolución 2013 de 1986, art. 11 | | |
| 4 | Investigación de incidentes y accidentes de trabajo como integrante del equipo investigador | Resolución 1401 de 2007, art. 7 | | |
| 5 | Participación en la revisión del programa de capacitación, la auditoría anual y la revisión por la dirección | Decreto 1072 de 2015, arts. 2.2.4.6.11 parágrafo 1, 2.2.4.6.29 y 2.2.4.6.31 | | |
| 6 | Curso virtual de 50 horas en SST (dirigido, entre otros, a los miembros del COPASST; gratuito a través de la ARL) | Resolución 4927 de 2016, arts. 2 y 3 | | ARL {{empresa.arl}} |

## Registro de asistencia

| Fecha | Tema | Intensidad (horas) | Nombre del asistente | Firma |
|---|---|---|---|---|
| | | | | |
| | | | | |

Se conservan las planillas, los certificados (por ejemplo, el del curso de 50 horas) y el material como evidencia del estándar 1.1.7.

## Evaluación de la eficacia

| Tema | Método de evaluación | Resultado | Acción de mejora |
|---|---|---|---|
| | | | |

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST
