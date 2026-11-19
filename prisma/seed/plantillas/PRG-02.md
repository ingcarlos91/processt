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

Se realizan conforme a la Resolución 1843 de 2025 y al profesiograma de la empresa (documento DOC-07): ingreso, periódicas (con la periodicidad que defina el médico, máximo cada tres años), por cambio de ocupación, post incapacidad y de retiro. El costo es asumido por el empleador. La empresa recibe únicamente el concepto de aptitud y las recomendaciones; la historia clínica queda bajo custodia de la IPS.

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
| Pausas activas | Diaria | Responsable del SG-SST / líderes |
| Semana de la salud (tamizajes con EPS/ARL) | Anual | Responsable del SG-SST |
| Campañas de estilos de vida saludable (alimentación, actividad física, sueño) | Trimestral | Responsable del SG-SST |
| Prevención del consumo de alcohol, tabaco y SPA | Semestral | Responsable del SG-SST |
| Promoción de la salud mental (Decreto 728 de 2025) | Semestral | Responsable del SG-SST / ARL |
| Seguimiento a restricciones y recomendaciones médicas | Mensual | Responsable del SG-SST |
| Vacunación según riesgo | Según esquema | Responsable del SG-SST / EPS |

## Restricciones y recomendaciones médico-laborales

Las recomendaciones emitidas por el médico se comunican por escrito al trabajador y al jefe inmediato, se registran en el formato FOR-02 y se verifica su cumplimiento mensualmente (Resolución 0312 de 2019, estándar 3.1.6).

## Servicios de higiene

La empresa garantiza agua potable, servicios sanitarios suficientes y en buen estado, y mecanismos de disposición de basuras y residuos (estándares 3.1.8 y 3.1.9), verificados mediante inspecciones.

## Indicadores

- Cumplimiento de evaluaciones médicas: (evaluaciones realizadas / programadas) × 100.
- Cumplimiento de recomendaciones: (recomendaciones implementadas / emitidas) × 100.
- Ausentismo por causa médica, prevalencia e incidencia de enfermedad laboral (Resolución 0312 de 2019, art. 30).
