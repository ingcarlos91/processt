# 02 · Estándares mínimos (Resolución 0312 de 2019) — el motor de reglas

## 1. ¿Cuántos estándares le aplican a una empresa?

| Caso | Estándares | Quién puede DISEÑAR el SG-SST (art. 4, 10, 17) |
|---|---|---|
| ≤ 10 trabajadores **y** riesgo I, II o III | **7** (art. 3) | Técnico en SST con licencia + 1 año de experiencia + curso 50 h (o tecnólogo/profesional/posgrado en SST con licencia y curso) |
| 11 a 50 trabajadores **y** riesgo I, II o III | **21** (art. 9) | Tecnólogo en SST con licencia + 2 años de experiencia + curso 50 h (o profesional/posgrado en SST con licencia y curso) |
| > 50 trabajadores (cualquier riesgo) **o** ≤ 50 con riesgo IV o V | **60** (art. 16) | Profesional en SST o con posgrado en SST, licencia vigente y curso 50 h |
| Unidades de producción agropecuaria ≤ 10 trabajadores permanentes, riesgo I-III | 3 obligaciones (art. 7) | Igual que ≤ 10 |

Regla de entrada del software: `n_trabajadores` + `clase_riesgo` → `nivel ∈ {7, 21, 60}` → lista de ítems aplicables → lista de documentos a generar.

> Nota: para contar trabajadores, el art. 30 cuenta a **todas las personas que trabajan en las instalaciones**: dependientes, contratistas, estudiantes, trabajadores en misión. La clase de riesgo la asigna la ARL según el CIIU (Decreto 768/2022 (que derogó el Decreto 1607/2002)); si hay varios centros de trabajo puede haber varias clases: se toma la más alta.

## 2. Tabla de Valores (art. 27) — 60 ítems, 100 puntos

> Reconstruida a partir del texto del art. 16 y de la estructura PHVA de la Tabla de Valores; los pesos cuadran con los totales oficiales (10 + 15 + 20 + 30 + 10 + 5 + 10 = 100). **Cotejar con el PDF oficial antes de usar en producción.**
> Columna **7** = aplica a empresas de ≤ 10 trabajadores riesgo I-III (art. 3). Columna **21** = aplica a 11-50 riesgo I-III (art. 9). Los 60 aplican a todas las demás.

### I. PLANEAR

**1. RECURSOS (10 %)**

| Ítem | Descripción | Pts | 7 | 21 |
|---|---|---|---|---|
| 1.1.1 | Responsable del SG-SST asignado, con perfil y licencia según tamaño/riesgo | 0,5 | ✔ | ✔ |
| 1.1.2 | Responsabilidades en SST asignadas, documentadas y comunicadas en todos los niveles | 0,5 | | |
| 1.1.3 | Asignación de recursos (financieros, técnicos, humanos) para el SG-SST | 0,5 | | ✔ |
| 1.1.4 | Afiliación al SGRL y pago de seguridad social de todos los trabajadores | 0,5 | ✔ | ✔ |
| 1.1.5 | Identificación de trabajadores de alto riesgo y cotización especial de pensión (Decreto 2090/2003) | 0,5 | | |
| 1.1.6 | Conformación y funcionamiento del COPASST (o Vigía) | 0,5 | | ✔ |
| 1.1.7 | Capacitación del COPASST / Vigía | 0,5 | | |
| 1.1.8 | Conformación y funcionamiento del Comité de Convivencia Laboral | 0,5 | | ✔ |
| 1.2.1 | Programa anual de capacitación en SST (incluye inducción/reinducción) | 2 | ✔ | ✔ |
| 1.2.2 | Inducción y reinducción en SST a todos los trabajadores | 2 | | |
| 1.2.3 | Responsable del SG-SST con curso virtual de 50 horas | 2 | | |

**2. GESTIÓN INTEGRAL DEL SG-SST (15 %)**

| Ítem | Descripción | Pts | 7 | 21 |
|---|---|---|---|---|
| 2.1.1 | Política de SST escrita, fechada, firmada por el representante legal, divulgada, revisada anualmente | 1 | | ✔ |
| 2.2.1 | Objetivos de SST claros, medibles, cuantificables, con metas, documentados, revisados | 1 | | |
| 2.3.1 | Evaluación inicial del SG-SST e identificación de prioridades | 1 | | |
| 2.4.1 | Plan anual de trabajo con objetivos, metas, responsables, recursos, cronograma, firmado | 2 | ✔ | ✔ |
| 2.5.1 | Archivo y retención documental del SG-SST | 2 | | ✔ |
| 2.6.1 | Rendición de cuentas anual sobre el desempeño en SST | 1 | | |
| 2.7.1 | Matriz legal actualizada | 2 | | |
| 2.8.1 | Mecanismos de comunicación interna/externa y autorreporte de condiciones | 1 | | |
| 2.9.1 | Identificación y evaluación de requisitos de SST en adquisiciones (compras) | 1 | | |
| 2.10.1 | Evaluación y selección de proveedores y contratistas con criterios de SST | 2 | | |
| 2.11.1 | Procedimiento de gestión del cambio (evaluación del impacto en SST de cambios internos/externos) | 1 | | |

### II. HACER

**3. GESTIÓN DE LA SALUD (20 %)**

| Ítem | Descripción | Pts | 7 | 21 |
|---|---|---|---|---|
| 3.1.1 | Descripción sociodemográfica y diagnóstico de condiciones de salud | 1 | | ✔ |
| 3.1.2 | Actividades de medicina del trabajo y de promoción y prevención de la salud | 1 | | ✔ |
| 3.1.3 | Perfiles de cargo (profesiograma) entregados al médico que hace las evaluaciones | 1 | | |
| 3.1.4 | Evaluaciones médicas ocupacionales (ingreso, periódicas, retiro) según peligros y periodicidad | 1 | ✔ | ✔ |
| 3.1.5 | Custodia de historias clínicas ocupacionales por el prestador | 1 | | |
| 3.1.6 | Cumplimiento de restricciones y recomendaciones médico-laborales | 1 | | ✔ |
| 3.1.7 | Estilos de vida y entornos saludables (tabaquismo, alcohol, SPA, etc.) | 1 | | |
| 3.1.8 | Agua potable, servicios sanitarios y disposición de basuras | 1 | | |
| 3.1.9 | Eliminación adecuada de residuos sólidos, líquidos y gaseosos | 1 | | |
| 3.2.1 | Reporte de AT y EL a ARL, EPS y Dirección Territorial dentro de 2 días hábiles | 2 | | ✔ |
| 3.2.2 | Investigación de incidentes, AT y EL (Res. 1401/2007) | 2 | | ✔ |
| 3.2.3 | Registro y análisis estadístico de incidentes, AT y EL | 1 | | |
| 3.3.1 | Medición de la frecuencia de accidentalidad (mensual) | 1 | | |
| 3.3.2 | Medición de la severidad de accidentalidad (mensual) | 1 | | |
| 3.3.3 | Medición de la mortalidad por AT (anual) | 1 | | |
| 3.3.4 | Medición de la prevalencia de EL (anual) | 1 | | |
| 3.3.5 | Medición de la incidencia de EL (anual) | 1 | | |
| 3.3.6 | Medición del ausentismo por causa médica (mensual) | 1 | | |

**4. GESTIÓN DE PELIGROS Y RIESGOS (30 %)**

| Ítem | Descripción | Pts | 7 | 21 |
|---|---|---|---|---|
| 4.1.1 | Metodología documentada de identificación de peligros, evaluación y valoración de riesgos (p. ej. GTC 45) | 4 | | |
| 4.1.2 | Identificación de peligros y valoración de riesgos con participación de todos los niveles; actualización anual y ante cambios | 4 | ✔ | ✔ |
| 4.1.3 | Identificación de sustancias carcinógenas o con toxicidad aguda | 3 | | |
| 4.1.4 | Mediciones ambientales (químicos, físicos, biológicos) de riesgos prioritarios | 4 | | |
| 4.2.1 | Implementación de medidas de prevención y control según jerarquía de controles | 2,5 | ✔ | |
| 4.2.2 | Verificación de la aplicación de las medidas por los trabajadores | 2,5 | | |
| 4.2.3 | Procedimientos, instructivos, fichas y protocolos de SST | 2,5 | | |
| 4.2.4 | Inspecciones sistemáticas a instalaciones, maquinaria y equipos con participación del COPASST | 2,5 | | |
| 4.2.5 | Mantenimiento periódico de instalaciones, equipos, máquinas y herramientas | 2,5 | | ✔ |
| 4.2.6 | Entrega y reposición de EPP; verificación con contratistas | 2,5 | | ✔ |

**5. GESTIÓN DE AMENAZAS (10 %)**

| Ítem | Descripción | Pts | 7 | 21 |
|---|---|---|---|---|
| 5.1.1 | Plan de prevención, preparación y respuesta ante emergencias (con análisis de vulnerabilidad, simulacro anual) | 5 | | ✔ |
| 5.1.2 | Brigada de emergencias conformada, capacitada y dotada | 5 | | ✔ |

### III. VERIFICAR

**6. VERIFICACIÓN DEL SG-SST (5 %)**

| Ítem | Descripción | Pts | 7 | 21 |
|---|---|---|---|---|
| 6.1.1 | Indicadores de estructura, proceso y resultado definidos (ficha técnica) | 1,25 | | |
| 6.1.2 | Auditoría interna al menos una vez al año | 1,25 | | |
| 6.1.3 | Revisión anual por la alta dirección | 1,25 | | ✔ |
| 6.1.4 | Auditoría planificada con el COPASST | 1,25 | | |

### IV. ACTUAR

**7. MEJORAMIENTO (10 %)**

| Ítem | Descripción | Pts | 7 | 21 |
|---|---|---|---|---|
| 7.1.1 | Acciones de promoción y prevención definidas con base en resultados del SG-SST | 2,5 | | |
| 7.1.2 | Acciones correctivas, preventivas y de mejora de la revisión por la alta dirección | 2,5 | | |
| 7.1.3 | Acciones de mejora derivadas de investigaciones de incidentes, AT y EL | 2,5 | | |
| 7.1.4 | Plan de mejoramiento por requerimientos de autoridades y ARL | 2,5 | | |

Totales: 7 ítems para ≤10 (1.1.1, 1.1.4, 1.2.1, 2.4.1, 3.1.4, 4.1.2, 4.2.1). 21 ítems para 11-50 (1.1.1, 1.1.3, 1.1.4, 1.1.6, 1.1.8, 1.2.1, 2.1.1, 2.4.1, 2.5.1, 3.1.1, 3.1.2, 3.1.4, 3.1.6, 3.2.1, 3.2.2, 4.1.2, 4.2.5, 4.2.6, 5.1.1, 5.1.2, 6.1.3).

**Cómo se califica** (art. 27-28): cada ítem se marca "cumple totalmente" (puntaje completo), "no cumple" (0) o "no aplica" (se justifica y el puntaje se redistribuye/ajusta). Para empresas de 7 o 21 estándares la plataforma del Fondo de Riesgos Laborales reparte los 100 puntos entre los ítems aplicables. El software debe calcular ambos modos: puntaje bruto sobre 100 y puntaje ajustado sobre ítems aplicables.

## 3. Resultado de la autoevaluación (art. 28)

| Puntaje | Valoración | Acción obligatoria |
|---|---|---|
| < 60 % | **Crítico** | Plan de mejoramiento inmediato; reporte de avances a la ARL a los **3 meses**; seguimiento anual y visita del Ministerio. |
| 60 % – 85 % | **Moderadamente aceptable** | Plan de mejoramiento; reporte de avances a la ARL a los **6 meses**; visita planeada del Ministerio. |
| > 85 % | **Aceptable** | Mantener calificación y evidencias; incluir mejoras en el plan anual. |

El plan de mejoramiento debe tener: **actividades, responsables, plazo, recursos y soportes de efectividad**. Avance en julio de cada año. Se registra en sgrl.mintrabajo.gov.co (Circular 027/2026 fijó 31 jul 2026 para la vigencia 2025).

## 4. Indicadores mínimos (art. 30) — fórmulas que el software calcula

| Indicador | Periodicidad | Fórmula |
|---|---|---|
| Frecuencia de accidentalidad | Mensual | (N.º AT del mes / N.º trabajadores del mes) × 100 |
| Severidad de accidentalidad | Mensual | ((días de incapacidad por AT + días cargados) del mes / N.º trabajadores del mes) × 100 |
| Proporción de AT mortales | Anual | (AT mortales del año / total AT del año) × 100 |
| Prevalencia de EL | Anual | (casos nuevos + antiguos de EL en el periodo / promedio de trabajadores) × 100.000 |
| Incidencia de EL | Anual | (casos nuevos de EL en el periodo / promedio de trabajadores) × 100.000 |
| Ausentismo por causa médica | Mensual | (días de ausencia por incapacidad laboral o común / días de trabajo programados del mes) × 100 |

Además, Decreto 1072 arts. 2.2.4.6.19-22 exige indicadores de **estructura, proceso y resultado**, cada uno con ficha técnica de 7 campos: definición, interpretación, límite/meta, método de cálculo, fuente, periodicidad, quién debe conocerlo.

## 5. Calendario anual (arts. 25-26)

- **Enero-diciembre**: ejecución del plan anual.
- **Diciembre**: autoevaluación → plan de mejoramiento → plan anual del año siguiente.
- **Julio**: informe de avance del plan de mejoramiento.
- Registro en plataforma del Ministerio según circular anual.
