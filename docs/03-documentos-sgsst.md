# 03 · Inventario de documentos del SG-SST (lo que el software debe generar)

Fuente principal: Decreto 1072 art. 2.2.4.6.12 (16 documentos mínimos) + lo que cada ítem de la Res. 0312 pide como evidencia + normas temáticas. Cada documento indica: **nivel** en que se exige (7 / 21 / 60), **ítem** que soporta, **insumos** (datos de la empresa que necesita), y **tipo** (documento maestro, programa, procedimiento, formato/registro, acta).

Convención de código sugerida: `SST-{TIPO}-{NN}` con tipos DOC (documento), PRG (programa), PRC (procedimiento), FOR (formato), ACT (acta), MTZ (matriz), PLN (plan), POL (política).

## A. Documentos base del sistema (Planear)

| Código | Documento | Nivel | Ítems | Insumos | Notas de contenido mínimo |
|---|---|---|---|---|---|
| POL-01 | Política de SST | 21 | 2.1.1 | razón social, NIT, actividad, rep. legal, fecha | 5 requisitos (D.1072 art. 2.2.4.6.6) y 3 objetivos mínimos (art. 2.2.4.6.7). Firmada y fechada. |
| POL-02 | Política de prevención del consumo de alcohol, tabaco y SPA | 60 (recomendado 21) | 3.1.7 | | Decreto 728/2025: ampliar a salud mental. |
| POL-03 | Política de prevención del acoso laboral y convivencia | 21 | 1.1.8 | | Exigida por Res. 3461/2025. |
| DOC-01 | Objetivos e indicadores del SG-SST | 60 | 2.2.1, 6.1.1 | metas | Objetivos medibles + ficha técnica por indicador (7 campos). |
| DOC-02 | Roles, responsabilidades y rendición de cuentas | 60 | 1.1.2, 2.6.1 | organigrama, cargos | Por nivel: alta dirección, responsable SG-SST, jefes, trabajadores, COPASST, CCL, brigada. |
| DOC-03 | Asignación de responsable del SG-SST (carta/acta) | 7 | 1.1.1 | nombre, licencia, curso 50 h | Verificar perfil vs. tamaño/riesgo (arts. 4, 10, 17). |
| DOC-04 | Asignación de recursos / presupuesto anual SST | 21 | 1.1.3 | presupuesto | Rubros: exámenes, EPP, capacitación, emergencias, mediciones, honorarios. |
| DOC-05 | Evaluación inicial / diagnóstico (Tabla de Valores + 8 aspectos del art. 2.2.4.6.16) | 60 (en práctica siempre) | 2.3.1 | respuestas del checklist | Produce puntaje, valoración, prioridades. |
| PLN-01 | Plan anual de trabajo | 7 | 2.4.1 | prioridades, calendario, responsables | Objetivos, metas, actividades, responsables, cronograma, recursos; firmado por empleador y responsable. |
| PLN-02 | Plan de mejoramiento (post-autoevaluación) | 60 (en práctica siempre) | 7.1.4 | ítems no cumplidos | Actividades, responsables, plazo, recursos, soportes. |
| MTZ-01 | Matriz legal | 60 | 2.7.1 | actividad, peligros, tamaño | Generada por reglas: normas aplicables según CIIU, tamaño, peligros (alturas, químicos, vehículos...). |
| PRC-01 | Procedimiento de control de documentos y retención documental | 21 | 2.5.1 | | Listado maestro + tabla de retención (20 años). |
| PRC-02 | Procedimiento de comunicación, participación y autorreporte | 60 | 2.8.1 | | Formato de autorreporte de condiciones. |
| PRC-03 | Procedimiento de adquisiciones con criterios SST | 60 | 2.9.1 | | |
| PRC-04 | Procedimiento de selección y evaluación de proveedores y contratistas | 60 | 2.10.1 | | 6 puntos del art. 2.2.4.6.28. Formato de evaluación. |
| PRC-05 | Procedimiento de gestión del cambio | 60 | 2.11.1 | | Formato de evaluación de cambios. |
| DOC-06 | Reglamento de Higiene y Seguridad Industrial | ≥ 10 trab. | — | peligros, sede | Art. 349 CST, Res. 2400/1979. |
| PRG-01 | Programa anual de capacitación (+ inducción y reinducción) | 7 | 1.2.1, 1.2.2 | cargos, peligros | Cronograma temático; formato de asistencia; evaluación; certificado de inducción. |

## B. Comités

| Código | Documento | Nivel | Ítems | Notas |
|---|---|---|---|---|
| ACT-01 | Convocatoria, votación y acta de conformación del COPASST (o designación del Vigía si < 10) | 21 | 1.1.6 | Res. 2013/1986; periodo 2 años; paridad empleador/trabajadores según tamaño (1-1 <10 Vigía; 10-49: 1 y 1; 50-499: 2 y 2; 500-999: 3 y 3; >1000: 4 y 4). |
| ACT-02 | Actas mensuales COPASST (plantilla) | 21 | 1.1.6 | |
| ACT-03 | Registro de capacitación del COPASST | 60 | 1.1.7 | |
| ACT-04 | Conformación del Comité de Convivencia Laboral + reglamento + procedimiento de quejas | 21 | 1.1.8 | Res. 3461/2025: mensual, ≤ 65 días, comité por centro de trabajo. |
| PRC-06 | Protocolo de prevención y atención del acoso sexual | 21 | — | Ley 2365/2024, separado del CCL. |

## C. Gestión de la salud (Hacer)

| Código | Documento | Nivel | Ítems | Notas |
|---|---|---|---|---|
| FOR-01 | Encuesta de perfil sociodemográfico + informe de condiciones de salud | 21 | 3.1.1 | Encuesta por trabajador → informe agregado automático (gráficas). |
| PRG-02 | Programa de medicina preventiva y del trabajo / PyP | 21 | 3.1.2 | Actividades según diagnóstico. |
| DOC-07 | Profesiograma (perfil de cargo con exámenes por peligro) | 60 | 3.1.3, 3.1.4 | Res. 1843/2025. Generado por cargo a partir de la matriz de peligros. |
| PRC-07 | Procedimiento de evaluaciones médicas ocupacionales + registro de conceptos de aptitud | 7 | 3.1.4 | Res. 1843/2025. Carta de remisión a IPS. |
| DOC-08 | Carta de custodia de historias clínicas (IPS) | 60 | 3.1.5 | |
| FOR-02 | Registro y seguimiento de restricciones y recomendaciones médicas | 21 | 3.1.6 | |
| PRG-03 | Programa de estilos de vida saludable, salud mental y prevención de SPA | 60 | 3.1.7 | Decreto 728/2025, Ley 2460/2025. |
| FOR-03 | Inspección de saneamiento básico (agua, baños, residuos) | 60 | 3.1.8, 3.1.9 | |
| PRC-08 | Procedimiento de reporte de AT/EL (FURAT/FUREL) | 21 | 3.2.1 | |
| PRC-09 | Procedimiento + formato de investigación de incidentes, AT y EL | 21 | 3.2.2 | Res. 1401/2007; equipo investigador mínimo. |
| FOR-04 | Registro estadístico de AT, EL, incidentes y ausentismo | 60 | 3.2.3, 3.3.x | Se alimenta con eventos y calcula los 6 indicadores. |
| PRG-04 | Programa de riesgo psicosocial | 60 (si aplica batería) | — | Res. 2646/2008, 2764/2022. |
| PRG-05 | Programas de vigilancia epidemiológica (PVE) por peligro prioritario (osteomuscular, auditivo, visual, químico, psicosocial…) | 60 | 3.1.2, 4.1.4 | Se instancian según peligros prioritarios de la matriz. |

## D. Gestión de peligros y riesgos

| Código | Documento | Nivel | Ítems | Notas |
|---|---|---|---|---|
| PRC-10 | Metodología de identificación de peligros y valoración de riesgos (GTC 45) | 60 | 4.1.1 | Plantilla estándar con escalas ND/NE/NC. |
| MTZ-02 | **Matriz de identificación de peligros, evaluación y valoración de riesgos** | 7 | 4.1.2 | Por proceso / zona / actividad / tarea / cargo. Pieza central. Prellenada por sector. |
| MTZ-03 | Inventario de sustancias químicas + carcinógenas / toxicidad aguda + FDS | 60 (si hay químicos) | 4.1.3 | SGA. |
| PLN-03 | Cronograma de mediciones ambientales (ruido, iluminación, material particulado...) | 60 (si aplica) | 4.1.4 | |
| DOC-09 | Plan de intervención / controles por peligro (jerarquía de controles) | 7 | 4.2.1, 4.2.2 | Sale de la matriz. |
| PRC-11..n | Procedimientos seguros de trabajo por tarea crítica (alturas, confinados, eléctrico, izaje, manejo de cargas, químicos, etc.) | 60 (según peligros) | 4.2.3 | Biblioteca de procedimientos que se activan por peligro. |
| PRG-06 | Programa de inspecciones + formatos (locativa, extintores, botiquín, EPP, herramientas, vehículos) | 60 | 4.2.4 | |
| PRG-07 | Programa de mantenimiento preventivo + hojas de vida de equipos | 21 | 4.2.5 | |
| MTZ-04 | Matriz de EPP por cargo + formato de entrega y reposición | 21 | 4.2.6 | Se deriva de la matriz de peligros. |
| PRG-08 | Programa de protección contra caídas (alturas) | si aplica | — | Res. 4272/2021. |
| PRG-09 | Programa de seguridad vial (PESV) | si ≥ 10 vehículos | — | Res. 40595/2022. |

## E. Gestión de amenazas

| Código | Documento | Nivel | Ítems | Notas |
|---|---|---|---|---|
| PLN-04 | Plan de prevención, preparación y respuesta ante emergencias (13 puntos del art. 2.2.4.6.25) + análisis de amenazas y vulnerabilidad + PON + planos/rutas | 21 | 5.1.1 | Análisis de vulnerabilidad por metodología de colores o similar. |
| ACT-05 | Conformación y capacitación de la brigada + inventario de dotación | 21 | 5.1.2 | |
| FOR-05 | Informe de simulacro | 21 | 5.1.1 | Anual. |

## F. Verificar y Actuar

| Código | Documento | Nivel | Ítems | Notas |
|---|---|---|---|---|
| DOC-10 | Fichas técnicas de indicadores + tablero | 60 | 6.1.1 | Estructura/proceso/resultado. |
| PRG-10 | Programa de auditoría interna + plan + lista de verificación + informe | 60 | 6.1.2, 6.1.4 | 13 puntos de alcance (art. 2.2.4.6.30). |
| ACT-06 | Acta de revisión por la alta dirección | 21 | 6.1.3 | 24 puntos del art. 2.2.4.6.31. |
| DOC-11 | Informe de rendición de cuentas | 60 | 2.6.1 | |
| FOR-06 | Registro de acciones correctivas, preventivas y de mejora | 60 | 7.1.1–7.1.4 | Causa raíz, responsable, fecha, verificación de eficacia. |

## G. Registros operativos recurrentes (formatos)

Asistencia a capacitación · Inducción · Entrega de EPP · Inspección · Autorreporte de condiciones · Permiso de trabajo · Reporte de incidente · Acta de reunión · Lista de chequeo de contratistas · Evaluación de proveedores · Consentimiento informado (batería) · Seguimiento a recomendaciones médicas.

## H. Totales aproximados

- Nivel 7: ~10 documentos.
- Nivel 21: ~30 documentos.
- Nivel 60: 50-70 documentos (según peligros activados).

Esto es justamente lo que hoy la consultora construye "de cero" por cliente. Todos comparten el 80 % del texto y cambian por: datos de la empresa, nivel, sector/peligros, cargos y sedes.
