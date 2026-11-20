---
codigo: DOC-01
nombre: Objetivos e indicadores del SG-SST
tipo: DOC
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.2.1","6.1.1","3.3.1","3.3.2","3.3.3","3.3.4","3.3.5","3.3.6"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo del documento

Definir los objetivos del SG-SST de **{{empresa.razonSocial}}** para el año {{anio}}, sus metas y los indicadores con los que se medirán, en coherencia con la política de SST y el plan anual de trabajo (Decreto 1072 de 2015, arts. 2.2.4.6.18 y 2.2.4.6.19 a 2.2.4.6.22). Los indicadores hacen parte del plan estratégico de la empresa y se alinean con él (art. 2.2.4.6.19).

## Base para definir los objetivos

Los objetivos se expresan de conformidad con la política de SST y con el resultado de la evaluación inicial y de las auditorías (Decreto 1072 de 2015, art. 2.2.4.6.18):

- **Política de SST:** cada objetivo desarrolla uno de sus compromisos (art. 2.2.4.6.7).
- **Evaluación inicial / autoevaluación de estándares mínimos:** {{#if evaluacion.existe}}{{evaluacion.fecha}}, puntaje {{evaluacion.puntaje}} % ({{evaluacion.valoracion}}). Los estándares no cumplidos se incorporan al plan de mejoramiento y al plan anual.{{else}}pendiente; al realizarla, sus resultados se incorporan a estos objetivos.{{/if}}
- **Auditoría:** {{#if ultimaAuditoria}}auditoría {{ultimaAuditoria.anio}}, conformidad {{ultimaAuditoria.conformidad}}.{{else}}la auditoría anual (art. 2.2.4.6.29) se tendrá en cuenta en la revisión de estos objetivos.{{/if}}
- **Riesgos prioritarios:** {{#if matriz.prioritarios.length}}{{len matriz.prioritarios}} riesgo(s) de nivel I o II en la matriz de peligros.{{else}}los que identifique la matriz de peligros.{{/if}}
- **Tamaño y actividad:** {{empresa.trabajadores}} trabajadores, clase de riesgo {{empresa.claseRiesgoRomano}}, {{empresa.nivel}} estándares mínimos.

## Objetivos y metas

| N.º | Objetivo | Meta | Indicador |
|---|---|---|---|
| 1 | Identificar los peligros, evaluar y valorar los riesgos y establecer controles | 100 % de los riesgos prioritarios (nivel I y II) con medidas de intervención implementadas | Intervención de riesgos prioritarios |
| 2 | Proteger la seguridad y salud de los trabajadores mediante la prevención de accidentes y enfermedades | Frecuencia de accidentalidad del año menor que la del año anterior (línea base: ______ ) y 0 accidentes mortales | Frecuencia, severidad y mortalidad |
| 3 | Cumplir la normatividad vigente y los estándares mínimos | Autoevaluación de estándares mínimos superior al 85 % | Cumplimiento de estándares mínimos |
| 4 | Ejecutar el plan anual de trabajo | Cumplimiento igual o superior al 90 % | Cumplimiento del plan anual |
| 5 | Desarrollar las competencias en SST de los trabajadores | Cobertura del programa de capacitación igual o superior al 90 % | Cobertura de capacitación |
| 6 | Promover la salud física y mental de los trabajadores | Ausentismo por causa médica del año menor que el del año anterior (línea base: ______ %) | Ausentismo por causa médica |

Los objetivos son claros, medibles y cuantificables y tienen metas definidas; son adecuados al tamaño y actividad de la empresa; son coherentes con el plan anual de trabajo, que se formula para alcanzar cada uno de ellos; son compatibles con la normatividad vigente; están documentados y se comunican a todos los trabajadores; y se revisan y evalúan como mínimo una vez al año, actualizándolos si es necesario (Decreto 1072 de 2015, art. 2.2.4.6.18 numerales 1 a 6).

## Fichas técnicas de los indicadores

{{#each indicadores}}
### {{inc @index}}. {{nombre}} ({{tipo}})

| Campo | Contenido |
|---|---|
| Definición | {{definicion}} |
| Interpretación | {{interpretacion}} |
| Límite / meta | {{meta}} |
| Método de cálculo | {{formula}} |
| Fuente de información | {{fuente}} |
| Periodicidad | {{periodicidad}} |
| Responsable | {{responsable}} |
| Personas que deben conocer el resultado | {{quienConoce}} |

{{/each}}

## Indicadores complementarios de estructura, proceso y resultado

Para cubrir los aspectos que el Decreto 1072 de 2015 pide considerar (arts. 2.2.4.6.20, 2.2.4.6.21 y 2.2.4.6.22), se definen además:

| Indicador (tipo) | Definición | Interpretación | Límite | Método de cálculo | Fuente | Periodicidad | Quién conoce el resultado |
|---|---|---|---|---|---|---|---|
| Responsabilidades, {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}}, plan de emergencias y plan de capacitación definidos (estructura) | Existencia de los elementos de estructura de los numerales 4, 7, 10 y 11 del art. 2.2.4.6.20 | Elementos de estructura vigentes | 100 % | Elementos vigentes / 4 × 100 | DOC-02, actas del comité, plan de emergencias, programa de capacitación | Anual | Alta dirección, {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}} |
| Evaluación inicial realizada (proceso) | Evaluación inicial o autoevaluación de estándares del año realizada y documentada | Indica si existe línea base actualizada | Sí | Sí = 100 %, No = 0 % | Autoevaluación de estándares mínimos | Anual | Alta dirección, {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}} |
| Ejecución de acciones correctivas, preventivas y de mejora (proceso) | Acciones cerradas en el plazo, incluidas las de investigaciones e inspecciones | Por cada 100 acciones con plazo vencido, X se cerraron | ≥ 90 % | Acciones cerradas en plazo / acciones con plazo vencido × 100 | Registro de acciones (FOR-06) | Trimestral | Alta dirección, {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}} |
| Reporte e investigación de AT, incidentes y EL (proceso) | Eventos reportados en 2 días hábiles e investigados | Grado de cumplimiento del proceso de reporte e investigación | 100 % | Eventos reportados e investigados a tiempo / eventos ocurridos × 100 | Registro de eventos e investigaciones | Trimestral | Alta dirección, {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}} |
| Ejecución del plan de prevención y atención de emergencias (proceso) | Actividades del plan de emergencias ejecutadas (simulacro, brigada, inspecciones de equipos) | Por cada 100 actividades programadas se ejecutaron X | ≥ 90 % | Actividades ejecutadas / programadas × 100 | Plan de emergencias, informe de simulacro | Anual | Alta dirección, brigada |
| Eficacia de las acciones (resultado) | Acciones cerradas cuya eficacia se verificó sin repetición del evento o hallazgo | Proporción de acciones que eliminaron la causa | ≥ 80 % | Acciones eficaces / acciones cerradas × 100 | Registro de acciones (FOR-06) | Anual | Alta dirección, {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}} |
| No conformidades del plan anual (resultado) | Actividades del plan no ejecutadas o ejecutadas fuera de plazo, con su acción de mejora | Desviaciones del plan que requieren acción | 0 sin acción | N.º de actividades incumplidas sin acción de mejora | Seguimiento del plan anual | Semestral | Alta dirección |
{{#if (gte empresa.nivel 60)}}| Cumplimiento de los programas de vigilancia epidemiológica y del cronograma de mediciones ambientales (proceso / resultado) | Actividades de los PVE y mediciones ejecutadas frente a las programadas | Grado de ejecución de la vigilancia de la salud y del ambiente | ≥ 90 % | Actividades ejecutadas / programadas × 100 | PVE, informes de mediciones | Anual | Alta dirección, {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}} |
{{/if}}

## Reglas para el cálculo de los indicadores

1. En los indicadores se cuenta a todas las personas que laboran en las instalaciones, sedes o centros de trabajo bajo cualquier modalidad: dependientes, independientes, cooperados, estudiantes y trabajadores en misión (Resolución 0312 de 2019, art. 23 y art. 30 numeral 1).
2. Todo accidente o enfermedad con incapacidad temporal de un (1) día o más se reporta y se tiene en cuenta en el cálculo (art. 30 numeral 5).
3. La empresa no crea mecanismos que fomenten el no reporte ni reconoce bonos, premios o estímulos por no reportar accidentes, enfermedades o incapacidades; las metas de reducción no se usan para desestimular el reporte (art. 30 numerales 2 y 3).
4. No se levantan ni suspenden incapacidades temporales, ni se crean programas de reincorporación temprana sin el consentimiento del trabajador y del médico tratante (art. 30 numeral 4).

## Aprobación

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST — {{responsable.doc}}
