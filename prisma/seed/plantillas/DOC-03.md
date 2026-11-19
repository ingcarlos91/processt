---
codigo: DOC-03
nombre: Designación del responsable del SG-SST
tipo: DOC
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.1","1.2.3"]
normas: ["DEC-1072-2015","RES-0312-2019","RES-4927-2016"]
---
## Designación

{{empresa.ciudad}}, {{fecha}}

Señor(a)
**{{responsable.nombre}}**
{{responsable.doc}}

**Asunto:** Designación como responsable del Sistema de Gestión de la Seguridad y Salud en el Trabajo

Por medio de la presente, **{{empresa.razonSocial}}**, NIT {{empresa.nit}}, en cumplimiento del artículo 2.2.4.6.8 numeral 10 del Decreto 1072 de 2015 y del estándar 1.1.1 de la Resolución 0312 de 2019, le designa como responsable del diseño, administración y ejecución del SG-SST de la empresa.

## Verificación del perfil

| Requisito | Exigencia para empresa de nivel {{empresa.nivel}} | Registro |
|---|---|---|
| Formación | {{#if (eq empresa.nivel 7)}}Técnico, tecnólogo o profesional en SST (Res. 0312 art. 4){{/if}}{{#if (eq empresa.nivel 21)}}Tecnólogo o profesional en SST (Res. 0312 art. 10){{/if}}{{#if (eq empresa.nivel 60)}}Profesional en SST o con posgrado en SST (Res. 0312 art. 17){{/if}} | {{default responsable.perfilTexto "Por registrar"}} |
| Licencia en SST vigente | Obligatoria | {{default responsable.licencia "Por registrar"}} {{#if responsable.licenciaFecha}}(expedida {{responsable.licenciaFecha}}){{/if}} |
| Curso virtual de 50 horas | Obligatorio (Decreto 1072 art. 2.2.4.6.35) | {{default responsable.curso50hFecha "Por registrar"}} |

## Funciones

1. Planear, organizar, dirigir, desarrollar y aplicar el SG-SST, y realizar como mínimo una vez al año su evaluación.
2. Informar a la alta dirección sobre el funcionamiento y los resultados del SG-SST.
3. Promover la participación de todos los miembros de la empresa en la implementación del SG-SST.
4. Realizar la autoevaluación anual de estándares mínimos y formular el plan de mejoramiento.
5. Custodiar la documentación del SG-SST conforme al artículo 2.2.4.6.13 del Decreto 1072 de 2015.

## Recursos y autoridad

La empresa le otorga la autoridad y los recursos necesarios para el cumplimiento de estas funciones, según el presupuesto aprobado del SG-SST.

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

______________________________________
**{{responsable.nombre}}** — Acepto la designación — {{responsable.doc}}
