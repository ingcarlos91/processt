---
codigo: PRG-02
nombre: Programa de medicina preventiva y del trabajo
tipo: PRG
nivelMin: 21
carpeta: 3. Gestión de la salud
estandares: ["3.1.1","3.1.2","3.1.3","3.1.4","3.1.5","3.1.6","3.1.7"]
normas: ["DEC-1072-2015","RES-0312-2019","RES-1843-2025","DEC-1477-2014","DEC-1072-2015-CAP13"]
---
## Objetivo

Promover, prevenir y vigilar las condiciones de salud de los trabajadores de **{{empresa.razonSocial}}** frente a los peligros identificados, mediante evaluaciones médicas ocupacionales, vigilancia epidemiológica y actividades de promoción y prevención (Decreto 1072 de 2015, art. 2.2.4.6.8 numeral 8; Resolución 0312 de 2019, estándares 3.1.1 a 3.1.7).

## Diagnóstico de condiciones de salud

El diagnóstico se construye a partir de: (a) la encuesta de perfil sociodemográfico y morbilidad sentida; (b) el informe de condiciones de salud que entrega la IPS con base en las evaluaciones médicas ocupacionales; (c) las estadísticas de ausentismo, accidentalidad y enfermedad laboral.

## Evaluaciones médicas ocupacionales

Se realizan conforme a la Resolución 1843 de 2025 y al perfil de cargo (profesiograma) de la empresa (documento DOC-07), que el empleador elabora y entrega al prestador con la matriz de peligros (arts. 5 literal d y 16). Son seis tipos (arts. 8 a 14): pre-ingreso; periódicas programadas y por cambio de ocupación; de egreso, dentro de los cinco (5) días hábiles siguientes al retiro y con constancia de notificación; de retorno laboral tras ausencia no médica de noventa (90) días o más; post-incapacidad de treinta (30) días o más; y de seguimiento. La periodicidad de las periódicas la define la empresa en este programa con justificación técnica, sin superar tres (3) años (art. 15). El costo lo asume en su totalidad el empleador y la ARL no puede pagarlas (arts. 5 literal a y 6). La empresa recibe únicamente el concepto de aptitud (apto, apto con recomendaciones, apto con restricciones o aplazado; se evita "no apto", art. 19) y las recomendaciones; la historia clínica queda bajo custodia del prestador durante veinte (20) años, sin copia en la empresa (art. 30). Está prohibido exigir prueba de embarazo, VIH o VDRL (art. 21).

## Programas de vigilancia epidemiológica (PVE)

Con base en los peligros prioritarios de la matriz se establecen los siguientes PVE:

| PVE | Peligro asociado | Cargos expuestos | Exámenes de seguimiento |
|---|---|---|---|
{{#each pve}}
| {{nombre}} | {{celda peligro}} | {{celda cargos}} | {{celda examenes}} |
{{/each}}
{{#unless pve.length}}
| Se definirán al completar la matriz de peligros | | | |
{{/unless}}

## Actividades de promoción y prevención

| Actividad | Periodicidad | Responsable |
|---|---|---|
| Pausas activas (Resolución 1843 de 2025, art. 5 literal h) | Diaria | Responsable del SG-SST / líderes |
| Semana de la salud (tamizajes con EPS/ARL) | Anual | Responsable del SG-SST |
| Campañas de estilos de vida saludable (alimentación, actividad física, sueño) | Trimestral | Responsable del SG-SST |
| Campañas de prevención de la farmacodependencia, el alcoholismo y el tabaquismo (Resolución 1843 de 2025, art. 25; Decreto 1072 de 2015, art. 2.2.4.13.3) | Semestral | Responsable del SG-SST / ARL |
| Plan de intervención en salud mental basado en la evaluación psicosocial (Decreto 1072 de 2015, art. 2.2.4.13.4) | Semestral | Responsable del SG-SST / ARL |
| Seguimiento a restricciones y recomendaciones médicas | Mensual | Responsable del SG-SST |
| Vacunación según riesgo | Según esquema | Responsable del SG-SST / EPS |

## Restricciones y recomendaciones médico-laborales

El concepto y las recomendaciones emitidas por el médico se comunican por escrito a cada trabajador, con evidencia (Resolución 1843 de 2025, art. 5 literal i), se registran en el formato FOR-02 y se verifica su cumplimiento mensualmente (Resolución 0312 de 2019, estándar 3.1.6). Cuando hay restricciones, la empresa adapta las condiciones del puesto en máximo veinte (20) días hábiles (art. 5 literal f).

## Servicios de higiene

La empresa garantiza agua potable, servicios sanitarios suficientes y en buen estado, y mecanismos de disposición de basuras y residuos (estándares 3.1.8 y 3.1.9), verificados mediante inspecciones.

## Indicadores

- Cumplimiento de evaluaciones médicas: (evaluaciones realizadas / programadas) × 100.
- Cumplimiento de recomendaciones: (recomendaciones implementadas / emitidas) × 100.
- Ausentismo por causa médica, prevalencia e incidencia de enfermedad laboral (Resolución 0312 de 2019, art. 30).
