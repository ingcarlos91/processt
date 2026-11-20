---
codigo: POL-02
nombre: Política de prevención del consumo de alcohol, tabaco y sustancias psicoactivas y de promoción de la salud mental
tipo: POL
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.1.7"]
normas: ["DEC-1072-2015-CAP13","RES-1843-2025","LEY-1335-2009","LEY-2354-2024","LEY-2460-2025","LEY-1616-2013","LEY-2466-2025","LEY-1581-2012","RES-2764-2022","RES-40595-2022","CST-1950"]
---
## Declaración

**{{empresa.razonSocial}}** reconoce que el consumo de alcohol, tabaco y sustancias psicoactivas (SPA) afecta la salud, la seguridad, el desempeño y la convivencia, y que la salud mental es un componente esencial del bienestar de los trabajadores. Por eso adopta esta política como parte de su Sistema de Gestión de la Seguridad y Salud en el Trabajo. Las campañas de prevención de la farmacodependencia, el alcoholismo y el tabaquismo deben contar con una política y un programa (Resolución 1843 de 2025, arts. 5 literal g y 25). La política también cumple el Decreto 728 de 2025 (Capítulo 13 del Título 4, Parte 2, Libro 2 del Decreto 1072 de 2015), la Ley 1616 de 2013 modificada por la Ley 2460 de 2025, y la Ley 1335 de 2009 modificada por la Ley 2354 de 2024 (ambientes libres de humo y aerosoles).

## Alcance

Aplica a todos los trabajadores, contratistas, aprendices, trabajadores en misión y visitantes, durante la jornada laboral, en las instalaciones de la empresa, en vehículos de la empresa o en actividades realizadas en su representación (Decreto 1072 de 2015, art. 2.2.4.13.2).

## Lineamientos

1. **Consumo de alcohol y SPA.** Está prohibido presentarse a trabajar bajo los efectos del alcohol o de sustancias psicoactivas. También está prohibido poseer, distribuir, comercializar o consumir estas sustancias durante la jornada o en las instalaciones.
2. **Ambientes libres de humo y aerosoles.** Está prohibido fumar en las áreas cerradas del lugar de trabajo y en los vehículos que se usan para trabajar (Ley 1335 de 2009, arts. 19 y 21). La prohibición incluye los cigarrillos electrónicos, vapeadores, productos de tabaco calentado y demás sucedáneos (Ley 2354 de 2024, arts. 1 y 4). La empresa fija avisos visibles de "espacio libre de humo" y adopta medidas para hacer cumplir la prohibición (Ley 1335 de 2009, art. 20).
3. **Prevención del consumo de SPA.** Con la asesoría de la ARL, la empresa desarrolla un programa de prevención en siete pasos (Decreto 1072 de 2015, art. 2.2.4.13.3), siguiendo la guía técnica general y los protocolos adoptados por la Resolución 2764 de 2022 (arts. 1 y 6). Los pasos son:
   1. establecer un programa de sensibilización;
   2. definir el programa de intervención;
   3. ejecutar el programa de sensibilización;
   4. implementar la identificación activa de casos;
   5. asegurar la asistencia profesional;
   6. hacer seguimiento y evaluar los resultados;
   7. implementar acciones de mejora.

   Incluye campañas de prevención de la farmacodependencia, el alcoholismo y el tabaquismo (Resolución 1843 de 2025, art. 25).
4. **Salud mental.** La empresa:
   - ejecuta las estrategias de prevención de problemas y trastornos mentales que diseñe la ARL;
   - construye un plan de intervención en salud mental con base en los resultados de la evaluación de factores de riesgo psicosocial;
   - monitorea de forma permanente esos factores dentro del SG-SST, con manejo ético y confidencial de la información (Decreto 1072 de 2015, arts. 2.2.4.13.4 y 2.2.4.13.6).

   El programa PRG-03 desarrolla este lineamiento.
5. **Ambiente libre de acoso y bienestar.** La empresa promueve y armoniza con las acciones de la ARL de prevención, sensibilización, orientación y control de los riesgos psicosociales, para garantizar un ambiente laboral libre de acoso. Además, implementa medidas que contribuyan al bienestar y la salud mental de los trabajadores durante la jornada laboral, como pausas, gestión de las cargas de trabajo y de la jornada (Ley 1616 de 2013, art. 9 parágrafo, adicionado por la Ley 2460 de 2025, art. 9).
6. **Rutas de atención.** La empresa orienta a quien manifieste necesitar apoyo:
   - a su EPS, que garantiza la atención integral en salud mental y consumo de SPA (Decreto 1072 de 2015, art. 2.2.4.13.8);
   - al espacio de escucha y soporte en crisis no presencial de la ARL (art. 2.2.4.13.7).
7. **No discriminación y confidencialidad.** Ningún trabajador será despedido ni presionado a renunciar por razones de enfermedad o afectaciones a su salud mental (Código Sustantivo del Trabajo, art. 59 numeral 15, adicionado por la Ley 2466 de 2025, art. 17). La información relacionada se trata como dato sensible (Ley 1581 de 2012, art. 5).
8. **Pruebas de alcohol y SPA.** {{#if (or dis.alturas dis.conduccion dis.electrico dis.izaje dis.maquinaria dis.quimicos (gte empresa.claseRiesgo 4))}}La empresa tiene actividades que implican riesgo para los demás o responsabilidad frente a terceros ({{#if dis.alturas}}trabajo en alturas, {{/if}}{{#if dis.conduccion}}conducción, {{/if}}{{#if dis.electrico}}trabajo eléctrico, {{/if}}{{#if dis.izaje}}izaje, {{/if}}{{#if dis.maquinaria}}operación de máquinas, {{/if}}{{#if dis.quimicos}}manejo de sustancias peligrosas, {{/if}}{{#if (gte empresa.claseRiesgo 4)}}actividades de clase de riesgo {{empresa.claseRiesgoRomano}}{{/if}}). En estas actividades podrá aplicar pruebas de alcoholimetría y detección de SPA. Las pruebas son preventivas, deben estar justificadas técnicamente en el SG-SST y se aplican conforme al programa de prevención. Las toma personal médico con licencia en SST. En las actividades del parágrafo 1 del art. 24 no requieren autorización del trabajador (Resolución 1843 de 2025, art. 24).{{#if dis.conduccion}} En conductores se articulan con el Plan Estratégico de Seguridad Vial (Resolución 40595 de 2022).{{/if}}{{else}}La empresa no tiene, según su matriz, actividades con riesgo para terceros. Por eso no aplica pruebas de alcohol ni de SPA; solo podría aplicarlas en esos casos, con justificación técnica en el SG-SST (Resolución 1843 de 2025, arts. 24 y 25).{{/if}} Ante un resultado positivo, la empresa exhorta al trabajador a iniciar tratamiento por su EPS. Los resultados son confidenciales (art. 25).
9. **Información anual.** La empresa mantiene a disposición de los inspectores del trabajo la información anual sobre la planeación, implementación, seguimiento, evaluación y ajustes de estas actividades. La información va discriminada por actividad económica, número de trabajadores, ocupación, sexo y edad (Decreto 1072 de 2015, art. 2.2.4.13.10).
10. **Talento humano en salud mental.** Si la empresa tiene personal que trabaja en salud mental (urgencias, consulta externa, hospitalización, atención de violencias o atención psicosocial en emergencias), realiza acciones de protección especial para ese personal con asesoría de la ARL (Decreto 1072 de 2015, art. 2.2.4.13.5).

## Responsabilidades

- **Alta dirección:** aprobar la política y asignar recursos para su cumplimiento.
- **Responsable del SG-SST:** planear, ejecutar, hacer seguimiento, evaluar y ajustar las actividades, y articularlas con la ARL y la EPS (Decreto 1072 de 2015, art. 2.2.4.13.6).
- **Jefes inmediatos:** vigilar el cumplimiento, gestionar las cargas de trabajo y reportar situaciones de riesgo.
- **Trabajadores y contratistas** (art. 2.2.4.13.9):
  - velar por el cuidado integral de su salud;
  - participar en la identificación del riesgo y en la prevención del consumo de SPA;
  - asistir a las actividades programadas;
  - participar en las estrategias de salud mental;
  - seguir las recomendaciones médicas emitidas en el marco del SG-SST.
- **ARL {{empresa.arl}}:** asesoría y asistencia técnica, campañas y espacio de escucha y soporte en crisis (art. 2.2.4.13.7).

## Firma

Dada en {{empresa.ciudad}}, el {{fecha}}. Como buena práctica, se revisará cada año junto con la revisión por la dirección.

______________________________________
**{{empresa.representanteLegal}}**
Representante Legal
{{empresa.representanteDoc}}
