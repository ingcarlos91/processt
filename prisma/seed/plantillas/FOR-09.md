---
codigo: FOR-09
nombre: Verificación de afiliación y pago de la seguridad social
tipo: FOR
nivelMin: 7
carpeta: 1. Recursos
estandares: ["1.1.4","1.1.5"]
normas: ["RES-0312-2019","DL-1295-1994","LEY-1562-2012","LEY-100-1993","DEC-1072-2015","DEC-2090-2003"]
---
## Objetivo

Verificar que todas las personas que trabajan para **{{empresa.razonSocial}}**, independientemente de su forma de vinculación o contratación, estén afiliadas y con aportes pagados a los sistemas de salud, pensión y riesgos laborales (Resolución 0312 de 2019, estándar 1.1.4: arts. 3, 9 y 16).

## Fundamento

- La afiliación al Sistema General de Riesgos Laborales es obligatoria para los trabajadores dependientes y para los contratistas con contrato de prestación de servicios de más de un mes; el empleador paga la totalidad de la cotización de sus trabajadores y la traslada a la ARL (Decreto Ley 1295 de 1994, arts. 4, 13 y 21 literales a y b; Ley 1562 de 2012, art. 2).
- La afiliación a salud y a pensión de los trabajadores dependientes es obligatoria (Ley 100 de 1993, arts. 15 y 157).
- La empresa no puede patrocinar, permitir ni usar agremiaciones o asociaciones para afiliar a sus trabajadores al Sistema de Riesgos Laborales (Resolución 0312 de 2019, art. 24).
- En contratistas, la afiliación se verifica antes del inicio y periódicamente, considerando la rotación de personal (Decreto 1072 de 2015, art. 2.2.4.6.28 numeral 3; ver PRC-04).

## Método de verificación

1. Se toma la lista de trabajadores a la fecha (planta, en misión, aprendices y contratistas{{#if empresa.contratistas}}: hoy {{empresa.trabajadores}} trabajadores y {{empresa.contratistas}} contratista(s){{/if}}).
2. Se compara con la planilla de pago de aportes (PILA) de los cuatro (4) meses anteriores a la verificación; en contratistas, con la última planilla que entregaron.
3. Se verifica, por persona, salud, pensión y ARL, y que la clase de riesgo de la ARL corresponda a la actividad o al centro de trabajo.
{{#if (gte empresa.nivel 60)}}4. Muestra (Resolución 0312 de 2019, art. 16, estándar 1.1.4): de 51 a 200 trabajadores, el 10 %; desde 201 trabajadores, 30 trabajadores; igual para los contratistas.
{{/if}}

Cualquier persona sin afiliación o sin pago se regulariza antes de que continúe trabajando y se deja registro de la corrección.

## Registro de verificación

Periodo verificado: ____________ a ____________   Fecha: ____________

| N.º | Nombre | Documento | Vinculación | Salud (EPS) | Pensión (AFP) | ARL y clase de riesgo | Planillas revisadas | Cumple | Acción |
|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | |
| 2 | | | | | | | | | |
| 3 | | | | | | | | | |

## Trabajadores en actividades de alto riesgo (pensión especial)

{{#if dis.altoRiesgoPension}}La empresa registra actividades de alto riesgo para la salud del trabajador del Decreto 2090 de 2003. Se identifican y relacionan los trabajadores que se dedican a ellas en forma permanente (Decreto 1072 de 2015, art. 2.2.4.6.15 parágrafo 4) y se verifica que se pague la cotización especial a pensión que fija esa norma (Resolución 0312 de 2019, estándar 1.1.5). Para cada uno, la identificación de peligros incluye la definición del cargo: funciones, tareas, jornada y lugar de trabajo (Resolución 0312 de 2019, art. 31).

| Nombre | Documento | Cargo | Actividad de alto riesgo (Decreto 2090 de 2003) | Funciones y tareas | Jornada | Lugar | Cotización especial verificada en PILA |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

Antes de aplicar este registro, la consultora confirma el régimen de cotización especial vigente para cada trabajador según su fecha de vinculación.{{else}}No aplica: la empresa no registra actividades de alto riesgo del Decreto 2090 de 2003. Si se incorporan, se identifica a los trabajadores que las realizan en forma permanente y se verifica la cotización especial a pensión (Decreto 1072 de 2015, art. 2.2.4.6.15 parágrafo 4; Resolución 0312 de 2019, estándar 1.1.5).{{/if}}

## Firmas

______________________________________
**{{responsable.nombre}}** — Responsable del SG-SST — {{responsable.doc}}
