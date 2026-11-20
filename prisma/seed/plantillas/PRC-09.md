---
codigo: PRC-09
nombre: Procedimiento de investigación de incidentes, accidentes de trabajo y enfermedades laborales
tipo: PRC
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.2.2","3.2.3","7.1.3"]
normas: ["RES-1401-2007","DEC-1072-2015","RES-0312-2019","RES-0156-2005","DL-1295-1994","LEY-1562-2012","LEY-1581-2012"]
---
## Objetivo

Investigar todos los incidentes y accidentes de trabajo y las enfermedades laborales de **{{empresa.razonSocial}}** para identificar sus causas básicas e inmediatas, adoptar medidas de intervención que eviten su repetición y mejorar el SG-SST (Resolución 1401 de 2007, arts. 2 y 4; Decreto 1072 de 2015, art. 2.2.4.6.32).

## Alcance

Aplica a los eventos que sufran los trabajadores dependientes, los trabajadores en misión, los aprendices, los contratistas y demás personas vinculadas a la empresa bajo cualquier modalidad (Resolución 1401 de 2007, arts. 1 y 8). En los eventos de trabajadores en misión o de contratistas, la investigación se hace de manera conjunta con la empresa de servicios temporales o el contratante, y el informe indica el correctivo que corresponde a cada una (art. 8).

## Definiciones (Resolución 1401 de 2007, art. 3; Ley 1562 de 2012)

- **Incidente de trabajo:** suceso acaecido en el curso del trabajo o en relación con este, que tuvo el potencial de ser un accidente, en el que hubo personas involucradas sin que sufrieran lesiones o se presentaran daños a la propiedad o pérdida en los procesos.
- **Accidente de trabajo:** todo suceso repentino que sobrevenga por causa o con ocasión del trabajo y que produzca en el trabajador una lesión orgánica, una perturbación funcional o psiquiátrica, una invalidez o la muerte (Ley 1562 de 2012, art. 3).
- **Accidente grave:** el que trae como consecuencia amputación de cualquier segmento corporal; fractura de huesos largos (fémur, tibia, peroné, húmero, radio y cúbito); trauma craneoencefálico; quemaduras de segundo y tercer grado; lesiones severas de mano, como aplastamiento o quemaduras; lesiones severas de columna vertebral con compromiso de médula espinal; lesiones oculares que comprometan la agudeza o el campo visual, o lesiones que comprometan la capacidad auditiva.
- **Investigación de accidente o incidente:** proceso sistemático de determinación y ordenación de causas, hechos o situaciones que generaron o favorecieron la ocurrencia del evento, que se realiza con el objeto de prevenir su repetición mediante el control de los riesgos que lo produjeron.
- **Causas básicas:** causas reales que se manifiestan detrás de los síntomas; razones por las cuales ocurren los actos y condiciones subestándar o inseguros (factores personales y factores del trabajo).
- **Causas inmediatas:** circunstancias que se presentan justamente antes del contacto; por lo general son observables o se hacen sentir. Se clasifican en actos subestándar o inseguros (comportamientos) y condiciones subestándar o inseguras (del ambiente de trabajo).
- **Aportante:** empleador o contratante obligado a investigar; en este procedimiento, la empresa.

## Responsables

- **Trabajador y testigos:** informan de inmediato el evento y rinden su versión de los hechos.
- **Jefe inmediato o supervisor:** asegura la atención del lesionado, preserva el sitio e integra el equipo investigador.
- **Responsable del SG-SST ({{responsable.nombre}}):** reporta el evento (PRC-08), convoca y coordina el equipo investigador, elabora el informe en el formato FOR-07 y hace seguimiento a las medidas.
- **{{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}}:** participa en la investigación y verifica el cumplimiento de las medidas.
- **Representante legal ({{empresa.representanteLegal}}):** provee los recursos, firma el informe y remite a la ARL los informes de accidentes graves y mortales (art. 4 nums. 6 y 9).
- **ARL {{empresa.arl}}:** asesora, suministra la metodología y el formato, revisa los informes de accidentes graves y mortales y emite concepto (art. 5).

## Equipo investigador (Resolución 1401 de 2007, art. 7)

Conformado como mínimo por:

1. El jefe inmediato o supervisor del trabajador accidentado o del área donde ocurrió el evento.
2. Un representante del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}}.
3. El encargado del desarrollo del SG-SST.

Si la empresa no cuenta con esa estructura, el equipo se conforma con trabajadores capacitados para la investigación (art. 7; Decreto 1072 de 2015, art. 2.2.4.6.32, parágrafo 2).

Cuando el accidente sea grave (art. 3) o produzca la muerte, participan además un profesional con licencia en Seguridad y Salud en el Trabajo, propio o contratado, y el personal de la empresa encargado del diseño de normas, procesos o mantenimiento. El equipo puede apoyarse en expertos internos o externos (art. 7, parágrafo). En la empresa, el profesional con licencia es {{consultora.profesional}} ({{consultora.nombre}}, licencia {{consultora.licencia}}).

En los accidentes mortales la investigación se realiza obligatoriamente en el formato suministrado por la ARL (art. 4 num. 3); el FOR-07 lo acompaña como registro interno.

## Muerte del trabajador por accidente o enfermedad laboral

Cuando un accidente de trabajo o una enfermedad laboral cause la muerte del trabajador, la empresa adelanta la investigación junto con el {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} dentro de los quince (15) días calendario siguientes a la ocurrencia de la muerte. La ARL evalúa la investigación, emite concepto en un plazo máximo de quince (15) días hábiles con las acciones de prevención que la empresa debe tomar, y en los diez (10) días hábiles siguientes remite el expediente a la Dirección Territorial u Oficina Especial del Ministerio del Trabajo (Decreto 1072 de 2015, art. 2.2.4.1.6; Resolución 1401 de 2007, art. 14).

## Procedimiento

| Paso | Actividad | Responsable | Plazo | Norma |
|---|---|---|---|---|
| 1 | Atender al lesionado (primeros auxilios y traslado a la red de la ARL), preservar el sitio del evento e informar al jefe inmediato y al responsable del SG-SST. Aplica también a los incidentes. | Trabajador, testigos, brigadista, jefe inmediato | Inmediato | Res. 1401/2007 art. 4 |
| 2 | Registrar el evento en PROCESST con las variables del FURAT: identificación del trabajador, fecha, hora, día, lugar, sitio exacto, tarea, agente, mecanismo, tipo de lesión, parte del cuerpo, jornada habitual, turno, tiempo laborado y testigos. | Responsable del SG-SST | Como práctica de la empresa, el mismo día | Res. 156/2005; Res. 1401/2007 art. 9 |
| 3 | Reportar el accidente de trabajo a la ARL y la EPS (FURAT) o la enfermedad laboral (FUREL), según el PRC-08. Si el accidente es grave o mortal, o se trata de una enfermedad laboral, reportar además a la Dirección Territorial del Ministerio del Trabajo. Los incidentes no se reportan a la ARL, pero sí se investigan. | Responsable del SG-SST / representante legal | 2 días hábiles | DL 1295/1994 art. 62; Res. 156/2005 art. 3; Decreto 1072/2015 art. 2.2.4.1.7 |
| 4 | Conformar el equipo investigador según la gravedad del evento (art. 7) y registrar nombre, cargo y documento de cada integrante. | Responsable del SG-SST | Lo antes posible; como práctica de la empresa, dentro de los 2 días siguientes (la norma no fija plazo) | Res. 1401/2007 arts. 4 num. 1 y 7 |
| 5 | Iniciar la investigación: registrar la fecha de inicio, el lugar y la dirección donde se realiza y las fechas y horas de cada sesión. | Equipo investigador | Dentro de los 15 días siguientes a la ocurrencia | Res. 1401/2007 arts. 4 num. 2 y 13 |
| 6 | Recolectar evidencias: inspección y reconocimiento del área, fotografías, videos, diagramas, revisión de procedimientos, permisos, registros de mantenimiento, entregas de EPP y capacitación. Subir los soportes al expediente del evento. | Equipo investigador | Durante la investigación | Res. 1401/2007 art. 10 |
| 7 | Entrevistar al trabajador y a los testigos y registrar su versión; identificar a los testigos con nombre y documento. | Equipo investigador | Durante la investigación | Res. 1401/2007 art. 10 |
| 8 | Describir el evento: relato completo y detallado que responda qué actividad realizaba, cuándo, dónde, cómo, por qué y con quién ocurrió. | Equipo investigador | Durante la investigación | Res. 1401/2007 art. 10 |
| 9 | Analizar las causas con el método de los porqués (o árbol de causas): relacionar todas las causas inmediatas (actos y condiciones subestándar) y básicas (factores personales y del trabajo). Identificar el peligro relacionado en la matriz de peligros y actualizarla si el peligro no estaba o si el accidente fue grave o mortal. | Equipo investigador | Durante la investigación | Res. 1401/2007 arts. 3 y 11; Decreto 1072/2015 art. 2.2.4.6.15 |
| 10 | Definir las medidas de intervención: cada una con tipo, jerarquía de controles, responsable y fecha de ejecución, dirigidas a la fuente, el medio y el trabajador y con relación lógica con las causas básicas. Definir también las acciones para los demás trabajadores potencialmente expuestos al mismo peligro (otros cargos, turnos o sedes) (Res. 0312/2019, estándar 3.2.2). Incluir las que recomienden el {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}}, la ARL o las autoridades. Registrarlas en el FOR-06 y en el plan anual de trabajo. | Equipo investigador / representante legal | Con el informe | Res. 1401/2007 arts. 4 nums. 5 y 6, y 12; Decreto 1072/2015 arts. 2.2.4.6.24 y 2.2.4.6.32 par. 1; Res. 0312/2019 est. 3.2.2 |
| 11 | Cerrar el informe de investigación (FOR-07) con el contenido de los arts. 9 a 13: identificación del aportante y del trabajador, información del evento, descripción, causas, medidas, lecciones aprendidas, equipo investigador con nombre, cargo, identificación y firma, firma del representante legal, lugar, dirección, fechas y horas de la investigación. | Responsable del SG-SST / equipo | Dentro de los 15 días siguientes a la ocurrencia | Res. 1401/2007 arts. 4 num. 2 y 9 a 13 |
| 12 | Si el accidente es grave o mortal, remitir el informe firmado por el representante legal a la ARL. La ARL lo evalúa, lo complementa si hace falta y emite concepto en 15 días hábiles; en los mortales remite la investigación y su concepto a la Dirección Territorial del Ministerio del Trabajo dentro de los 10 días hábiles siguientes al concepto. Registrar la fecha de remisión. | Representante legal | Dentro de los 15 días siguientes a la ocurrencia | Res. 1401/2007 arts. 4 num. 9 y 14 |
| 13 | Divulgar las lecciones aprendidas a los trabajadores relacionados con las causas o los controles y al {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}}; informar a la alta dirección. | Responsable del SG-SST | Como práctica de la empresa, dentro del mes siguiente (la norma no fija plazo) | Decreto 1072/2015 art. 2.2.4.6.32 nums. 2 y 3 |
| 14 | Hacer seguimiento a la ejecución de las medidas, registrar su cumplimiento y verificar su efectividad; ajustar las que no funcionen. | Responsable del SG-SST / {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}} | Según la fecha de cada medida | Res. 1401/2007 arts. 4 num. 7 y 12; Decreto 1072/2015 art. 2.2.4.6.33 |
| 15 | Calcular los indicadores de control e impacto: frecuencia, severidad, mortalidad, prevalencia e incidencia de enfermedad laboral, proporción de eventos investigados y de medidas cerradas (FOR-08). | Responsable del SG-SST | Mensual y anual | Res. 1401/2007 art. 4 num. 8; Res. 0312/2019 art. 30 |
| 16 | Archivar el informe, los soportes y las pruebas de los correctivos a disposición del Ministerio del Trabajo, y mantener disponibles los reportes e investigaciones. | Responsable del SG-SST | Por política de la empresa, 20 años (la norma no fija plazo para estos documentos) | Res. 1401/2007 art. 4 num. 10; Decreto 1072/2015 art. 2.2.4.6.12 num. 11 |

## Enfermedad laboral

La Resolución 0312 de 2019 (estándar 3.2.2) verifica que las investigaciones de incidentes, accidentes de trabajo y enfermedades laborales se realicen dentro de los quince (15) días siguientes a su ocurrencia; para la enfermedad laboral, la empresa cuenta ese plazo desde el diagnóstico. Cuando la EPS, la ARL o la junta de calificación determine el origen laboral de una enfermedad, la empresa la reporta con el FUREL (PRC-08) y la investiga con este mismo procedimiento para determinar las causas y las deficiencias del SG-SST que permitieron la exposición, revisar la matriz de peligros, los programas de vigilancia epidemiológica y las medidas de control, e informar a los trabajadores expuestos (Decreto 1072 de 2015, art. 2.2.4.6.32). Se registra solo el concepto de origen y la incapacidad; el diagnóstico es dato sensible (Ley 1581 de 2012).

## Formato de investigación

Cada evento se registra e investiga en PROCESST, que genera el informe de investigación FOR-07 con las secciones que exige la Resolución 1401 de 2007: 1. identificación del aportante; 2. identificación del trabajador; 3. información del evento; 4. descripción; 5. análisis de causas; 6. medidas de intervención; 7. lecciones aprendidas; 8. equipo investigador y firmas; 9. datos de la investigación y remisión a la ARL. El sistema no permite cerrar la investigación sin descripción, equipo completo según la gravedad con identificación, causas inmediatas y básicas y medidas con responsable y fecha. El informe firmado se archiva como soporte del estándar 3.2.2.

Los eventos y sus investigaciones se consolidan en el registro y análisis estadístico (FOR-08) y las medidas en el registro de acciones correctivas, preventivas y de mejora (FOR-06).

## Resultados

Los resultados de las investigaciones permiten identificar y documentar las deficiencias del SG-SST, informar a los trabajadores directamente relacionados con sus causas, informar a la alta dirección sobre el ausentismo por incidentes, accidentes y enfermedades laborales, y alimentar el plan anual de trabajo, la revisión por la dirección y la mejora continua (Decreto 1072 de 2015, art. 2.2.4.6.32). El incumplimiento de la investigación se sanciona conforme al Decreto Ley 1295 de 1994, art. 91 (Resolución 1401 de 2007, art. 15).
