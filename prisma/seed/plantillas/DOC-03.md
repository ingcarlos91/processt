---
codigo: DOC-03
nombre: Designación del responsable del SG-SST
tipo: DOC
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.1","1.2.3"]
normas: ["DEC-1072-2015","RES-0312-2019","RES-4927-2016","CIR-047-2025"]
---
## Designación

{{empresa.ciudad}}, {{fecha}}

Señor(a)
**{{responsable.nombre}}**
{{responsable.doc}}

**Asunto:** Designación como responsable del Sistema de Gestión de la Seguridad y Salud en el Trabajo

Por medio de la presente, **{{empresa.razonSocial}}**, NIT {{empresa.nit}}, en cumplimiento del artículo 2.2.4.6.8 numeral 10 del Decreto 1072 de 2015 y del estándar 1.1.1 de la Resolución 0312 de 2019, le designa como responsable del SG-SST de la empresa para:

{{#if (eq empresa.nivel 7)}}- ☐ El diseño, la administración y la ejecución del SG-SST.
- ☐ Solo la administración y la ejecución del SG-SST. Quien solo cuenta con el curso virtual de 50 horas puede administrar y ejecutar el SG-SST en empresas de diez (10) o menos trabajadores con riesgo I, II o III, pero no diseñarlo (Resolución 0312 de 2019, art. 4). El diseño lo realizó: ______________________, licencia en SST N.º ____________.{{else}}El diseño, la administración y la ejecución del SG-SST.{{/if}}

## Verificación del perfil

| Requisito | Exigencia para empresa de nivel {{empresa.nivel}} | Registro |
|---|---|---|
| Formación | {{#if (eq empresa.nivel 7)}}Técnico en SST o en alguna de sus áreas; también tecnólogo, profesional o profesional con posgrado en SST (Res. 0312 arts. 3 y 4){{/if}}{{#if (eq empresa.nivel 21)}}Tecnólogo en SST o en alguna de sus áreas; también profesional o profesional con posgrado en SST (Res. 0312 arts. 9 y 10){{/if}}{{#if (eq empresa.nivel 60)}}Profesional en SST o profesional con posgrado en SST (Res. 0312 arts. 16 y 17){{/if}} | {{default responsable.perfilTexto "Por registrar"}} |
| Experiencia certificada en SST | {{#if (eq empresa.nivel 7)}}Mínimo un (1) año, si quien diseña es técnico (Res. 0312 art. 4){{/if}}{{#if (eq empresa.nivel 21)}}Mínimo dos (2) años, si quien diseña es tecnólogo (Res. 0312 art. 10){{/if}}{{#if (eq empresa.nivel 60)}}No se fija mínimo para el profesional (Res. 0312 art. 17){{/if}} | ______ años (adjuntar certificaciones) |
| Licencia en SST vigente | {{#if (eq empresa.nivel 7)}}Obligatoria para quien diseña. No la requiere el trabajador de la empresa, con vínculo laboral, que solo ejecuta el SG-SST en una empresa de diez (10) o menos trabajadores con riesgo I, II o III (Res. 4927 de 2016, art. 14){{else}}Obligatoria (Res. 0312 arts. 10 y 17){{/if}} | {{default responsable.licencia "Por registrar"}} {{#if responsable.licenciaFecha}}(expedida {{responsable.licenciaFecha}}){{/if}} |
| Curso virtual de 50 horas | Obligatorio para todo responsable de la ejecución, tenga o no licencia (Decreto 1072 art. 2.2.4.6.35; Res. 4927 de 2016, art. 14 parágrafo 1) | {{default responsable.curso50hFecha "Por registrar"}} |
| Actualización de 20 horas | Cada tres (3) años, para mantener vigente el certificado del curso de 50 horas (Res. 4927 de 2016, art. 16; Circular 047 de 2025) | Fecha: ____________ |
| Hoja de vida con soportes | Se adjunta a esta designación (Res. 0312, estándar 1.1.1) | ☐ Adjunta |

## Funciones

1. Planear, organizar, dirigir, desarrollar y aplicar el SG-SST, y realizar como mínimo una vez al año su evaluación.
2. Informar a la alta dirección sobre el funcionamiento y los resultados del SG-SST.
3. Promover la participación de todos los miembros de la empresa en la implementación del SG-SST.
4. Realizar la autoevaluación anual de estándares mínimos y formular el plan de mejoramiento.
5. Custodiar la documentación del SG-SST conforme al artículo 2.2.4.6.13 del Decreto 1072 de 2015.

## Recursos y autoridad

La empresa le otorga la autoridad y los recursos necesarios para el cumplimiento de estas funciones, según el presupuesto aprobado del SG-SST.

Esta designación no traslada al responsable, coordinador o asesor las responsabilidades del empleador en el SG-SST ni exonera a la empresa de cumplir, ejecutar, invertir y realizar todas las actividades del sistema; cualquier cláusula en contrario no tiene efecto (Resolución 4927 de 2016, art. 15).

## Firmas

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

______________________________________
**{{responsable.nombre}}** — Acepto la designación — {{responsable.doc}}
