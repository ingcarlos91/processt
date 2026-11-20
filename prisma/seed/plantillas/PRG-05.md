---
codigo: PRG-05
nombre: Programas de vigilancia epidemiológica
tipo: PRG
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.1.2","4.1.4"]
normas: ["RES-1843-2025","DEC-1072-2015","DEC-1477-2014","RES-0312-2019","RES-2646-2008","RES-2764-2022"]
---
## Objetivo

Vigilar de manera sistemática la exposición a los peligros prioritarios y sus efectos en la salud de los trabajadores de **{{empresa.razonSocial}}**, para intervenir a tiempo. El empleador debe implementar los sistemas de vigilancia epidemiológica según los riesgos de la empresa y el diagnóstico de condiciones de salud (Resolución 1843 de 2025, art. 5 literal e) y mantenerlos documentados. La documentación incluye los resultados de las mediciones ambientales y los perfiles de salud de los monitoreos biológicos, cuando apliquen (Decreto 1072 de 2015, art. 2.2.4.6.12 numeral 13). Cada PVE se orienta a los agentes de riesgo de la Tabla de Enfermedades Laborales (Decreto 1477 de 2014, art. 1 y anexo técnico, sección I).

## Criterios generales de los PVE

- **Evaluaciones periódicas:** los criterios, métodos y procedimientos de las evaluaciones periódicas y la interpretación de resultados se definen y justifican técnicamente en cada PVE, según la edad, el tipo, la magnitud, la frecuencia y el tiempo de exposición (Resolución 1843 de 2025, art. 10 literal A). La periodicidad la fija la empresa con esa justificación; el máximo de tres (3) años se admite solo en caso excepcional (art. 15).
- **Parámetros de referencia:** BEI de la ACGIH; criterios IARC para cancerígenos; OIT para neumoconiosis; CDC para agentes biológicos (art. 28).
- **Protocolo propio:** cuando el agente no tiene parámetros de referencia, el PVE incluye un protocolo con (art. 28 parágrafo):
  1. el agente, con su número CAS si es químico;
  2. los órganos blanco;
  3. los criterios de vigilancia;
  4. la frecuencia de la evaluación y de las pruebas complementarias;
  5. los antecedentes relevantes;
  6. el contenido específico de la historia clínica y del examen físico;
  7. las situaciones especiales (embarazo, susceptibilidad individual, inmunosupresión);
  8. otros elementos técnicos.
- **Ingreso al PVE:** el médico evaluador indica en el concepto si el trabajador ingresa a las acciones específicas del PVE (art. 4 literal f).
- **Reserva:** la empresa recibe solo información agregada y conceptos de aptitud; los resultados individuales quedan en la historia clínica bajo custodia del prestador (arts. 30 y 31).

## Programas definidos

{{#each pve}}
### {{inc @index}}. PVE {{nombre}}

- **Peligro:** {{peligro}}
- **Población objeto (universo):** {{cargos}}
- **Objetivos específicos y metas:** __________ (definir para el periodo, con el criterio de evaluación de resultados).
- **Evaluación de la exposición:** mediciones ambientales o evaluaciones de puesto de trabajo según el peligro; registrar fecha, resultado y valor límite de referencia.
- **Evaluación de la salud:** {{examenes}}. Periodicidad y criterios de interpretación: __________ (definidos por el médico del PVE).
- **Clasificación de casos:** la define el médico del PVE (como buena práctica: sanos, sospechosos, confirmados).
- **Intervención:** en la fuente, el medio y el trabajador, según la jerarquía de controles (Decreto 1072 de 2015, art. 2.2.4.6.24).
- **Indicadores:** cobertura del PVE, incidencia y prevalencia de casos, cumplimiento de actividades.
- **Evaluación del programa:** anual, comparando objetivos y logros.

{{/each}}
{{#unless pve.length}}
Se definirán a partir de los peligros prioritarios de la matriz. Si la evaluación psicosocial muestra riesgo alto o efectos en la salud, se crea el PVE psicosocial (sección siguiente).
{{/unless}}

## PVE psicosocial

Es obligatorio cuando los trabajadores están expuestos a factores psicosociales evaluados como de **alto riesgo** o que estén causando efectos negativos en la salud, el bienestar o el trabajo. Se hace con apoyo de expertos y asesoría de la ARL (Resolución 2646 de 2008, art. 16; Resolución 2764 de 2022, art. 8).

Componentes mínimos (Resolución 2646 de 2008, art. 17):

1. **Método:** objetivos, universo y procedimientos.
2. **Objetivo:** monitoreo e intervención permanente, con objetivos específicos y criterios de evaluación de resultados.
3. **Procedimiento:**
   - evaluación con la batería;
   - criterios para identificar grupos prioritarios;
   - medidas de intervención con indicadores;
   - seguimiento y nuevas acciones.
4. **Sistema de información:** fuentes, instrumentos, calidad de los datos, consolidación, análisis y divulgación, con reserva.
5. **Evaluación anual del programa:** objetivos frente a logros, con indicadores y criterios cualitativos.
6. **Gestión administrativa:** recursos físicos, técnicos, financieros y humanos asignados por el empleador.

Criterios de inclusión de trabajadores (Resolución 2764 de 2022, art. 8):
- quejas de acoso laboral;
- consumo problemático de alcohol o sustancias psicoactivas;
- accidentes de trabajo reincidentes;
- patologías por exposición psicosocial, calificadas o en proceso de calificación;
- incapacidades relacionadas con riesgo psicosocial;
- eventos vitales estresantes;
- estrés postraumático;
- efectos derivados de emergencias.

En todos los casos se garantiza la reserva y la confidencialidad.
