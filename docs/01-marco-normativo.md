# 01 · Marco normativo del SG-SST en Colombia (corte: noviembre 2026)

> Objetivo de este documento: tener claro **qué exige la ley**, para que el software no invente requisitos ni se quede corto. Todo lo que diga "verificar" debe contrastarse con el texto oficial antes de usarlo en una plantilla legal.

## 1. Normas estructurales (la columna vertebral)

| Norma | Qué regula | Por qué importa para el software |
|---|---|---|
| **Ley 1562 de 2012** | Reforma del Sistema General de Riesgos Laborales. Cambia "Programa de Salud Ocupacional" por SG-SST y lo hace obligatorio para todo empleador. | Base legal de la obligación. Va en la matriz legal de todo cliente. |
| **Decreto Ley 1295 de 1994** | Organiza el SGRL: ARL, cotizaciones, prestaciones, sanciones (art. 91). | Sanciones y afiliación. Matriz legal. |
| **Decreto 1072 de 2015**, Libro 2, Parte 2, Título 4, **Capítulo 6** (arts. 2.2.4.6.1 a 2.2.4.6.42; compila el Decreto 1443 de 2014) | **El "cómo"** del SG-SST: ciclo PHVA, política, obligaciones del empleador, documentación, conservación, evaluación inicial, planificación, indicadores, emergencias, gestión del cambio, adquisiciones, contratistas, auditoría, revisión por la alta dirección, investigación de incidentes, acciones correctivas, mejora continua. | **Define la lista de documentos obligatorios** (art. 2.2.4.6.12) y el contenido mínimo de cada uno. Es la fuente principal de las plantillas. Ver `03-documentos-sgsst.md`. |
| **Resolución 0312 de 2019** (MinTrabajo) | **Estándares mínimos** del SG-SST: 7, 21 o 60 según tamaño y clase de riesgo. Tabla de Valores (art. 27) para la autoevaluación. Plan de mejoramiento (art. 28). Indicadores mínimos (art. 30). Perfil de quien diseña el SG-SST (arts. 4, 10, 17). | **Es el motor de reglas del software**: qué le aplica a cada empresa y cómo se califica. Ver `02-estandares-minimos.md`. Sigue vigente a nov-2026; no ha sido reemplazada. |
| **Decreto 1607 de 2002** | Tabla de clasificación de actividades económicas (CIIU) por **clase de riesgo I a V**. | El software debe inferir la clase de riesgo a partir del código CIIU del cliente (con posibilidad de ajuste manual, porque la ARL puede clasificar por centro de trabajo). |
| **Decreto 1477 de 2014** (+ Decreto 676 de 2020) | Tabla de enfermedades laborales. | Referencia en PVE e investigación de EL. |

## 2. Normas temáticas que generan documentos o registros concretos

| Norma | Tema | Documento/registro que genera |
|---|---|---|
| **Resolución 2013 de 1986** | COPASST (antes COPASO): conformación, periodo de 2 años, reuniones mensuales. Vigía de SST para < 10 trabajadores (Decreto 1072 define Vigía). | Convocatoria, acta de elección, acta de conformación, actas mensuales, registro de capacitación. |
| **Resolución 3461 de 2025** (MinTrabajo, 1 sep 2025; deroga Res. 652 y 1356 de 2012) | **Comité de Convivencia Laboral (CCL)**: comité central + uno por centro de trabajo, reuniones **mensuales** (antes trimestrales), procedimiento de quejas ≤ 65 días calendario, no conoce acoso sexual (Ley 2365 de 2024 exige procedimiento aparte), exige política escrita de prevención de acoso laboral y canales de atención psicológica, cubre contratistas y aprendices. Sus resultados se integran al SG-SST. | Acta de conformación, política de prevención del acoso laboral, procedimiento de quejas, actas mensuales, procedimiento de acoso sexual separado. **Verificar** umbral de obligatoriedad (una fuente dice ≥ 10 trabajadores). |
| **Ley 1010 de 2006** | Acoso laboral. | Base de la política y del reglamento interno. |
| **Ley 2365 de 2024** | Acoso sexual en el trabajo. | Protocolo de prevención y atención del acoso sexual. |
| **Resolución 1401 de 2007** | Investigación de incidentes y accidentes de trabajo. Equipo investigador, plazo de 15 días para enviar investigación de AT grave o mortal a la ARL. | Procedimiento de investigación, formato de investigación, lecciones aprendidas. |
| **Resolución 1843 de 2025** (MinTrabajo, 29 abr 2025; **deroga Res. 2346 de 2007 y 1918 de 2009**) | **Evaluaciones médicas ocupacionales**: ingreso, periódicas (máx. cada 3 años), retiro; a cargo del empleador; prohíbe pedir prueba de embarazo o VIH; la empresa solo recibe el concepto de aptitud; exige **profesiograma** actualizado; custodia de historias clínicas en IPS/médico. | Profesiograma por cargo, procedimiento de evaluaciones médicas, registro de conceptos de aptitud, carta de custodia de HC. **Verificar** texto oficial: todas las plantillas de exámenes médicos deben citar esta norma y no la 2346. |
| **Resolución 2646 de 2008** + **Resolución 2764 de 2022** | Factores de **riesgo psicosocial**. La 2764 adopta la Batería de Instrumentos como referente mínimo obligatorio; periodicidad **anual** si riesgo alto, **cada 2 años** si medio/bajo; aplicada por psicólogo con licencia en SST. | Programa de riesgo psicosocial, consentimiento informado, informe de resultados, plan de intervención. |
| **Decreto 728 de 2025** (25 jun 2025; adiciona Capítulo 13 al Decreto 1072) | **Salud mental y prevención del consumo de SPA** en el trabajo: programas de sensibilización, prevención e intervención; integrarlos en la matriz de peligros, el plan anual y la vigilancia epidemiológica; registros anuales. | Programa de salud mental y prevención de SPA; actividades en el plan anual; registros. |
| **Ley 2460 de 2025** (jun 2025, modifica Ley 1616 de 2013) | Salud mental como componente obligatorio del SG-SST; medidas de bienestar; coordinación con ARL; prohíbe despido de trabajador con trastorno mental sin autorización. | Refuerza el programa anterior. **Verificar** alcance exacto en texto oficial (varias afirmaciones vienen de blogs). |
| **Resolución 4272 de 2021** | Trabajo en alturas (≥ 1,5 m): certificación, permiso de trabajo, coordinador. | Programa de prevención y protección contra caídas, permiso de trabajo en alturas, hoja de vida de equipos. Solo aplica según actividad. |
| **Resolución 0491 de 2020** | Espacios confinados. | Programa, permisos, inventario de espacios. Según actividad. |
| **Decreto 1496 de 2018** + **Res. 0773 de 2021** | Sistema Globalmente Armonizado (SGA) para químicos. | Inventario de químicos, FDS, matriz de compatibilidad, etiquetado. Según actividad. |
| **Resolución 2400 de 1979** | Estatuto de seguridad industrial (higiene, locativo, eléctrico, etc.). | Inspecciones, reglamento de higiene y seguridad industrial. |
| **Resolución 8321 de 1983** | Ruido. | Mediciones y PVE auditivo. Según actividad. |
| **Ley 9 de 1979** | Código sanitario. Reglamento de Higiene y Seguridad Industrial (art. 349 CST exige reglamento en empresas ≥ 10 trabajadores). | Reglamento de Higiene y Seguridad Industrial. |
| **Decreto 2157 de 2017** | Gestión del riesgo de desastres (plan de gestión del riesgo para entidades públicas y privadas). | Plan de emergencias / análisis de vulnerabilidad. |
| **Ley 1503 de 2011 + Res. 40595 de 2022** | **Plan Estratégico de Seguridad Vial (PESV)**: obligatorio para empresas con ≥ 10 vehículos (propios, contratados, en leasing) o conductores. | Módulo opcional. |
| **Resolución 4927 de 2016** (+ Decreto 1072 art. 2.2.4.6.35) | Curso virtual de 50 horas en SG-SST para el responsable. | Validación del perfil del responsable del cliente. |
| **Resolución 908 de 2025** (MinSalud) | Licencia en SST digital y nacional para personas naturales/jurídicas prestadoras. | El software debe registrar y mostrar la licencia vigente de la consultora en cada documento que firme. **Verificar**. |
| **GTC 45 (2012)** | Guía técnica para identificación de peligros y valoración de riesgos. No es ley, pero es la metodología de referencia nacional. | **Metodología de la matriz de peligros** que genera el software. |
| **Decreto 0223 de 2026** | Practicantes y contratos de aprendizaje: vinculación y cobertura en el SGRL. | Afecta el conteo de personas cubiertas. **Verificar**. |

## 3. Obligaciones periódicas (lo que el software debe recordar y generar cada año)

| Cuándo | Obligación | Fuente |
|---|---|---|
| **Diciembre** de cada año | Autoevaluación con la Tabla de Valores; elaborar el **plan de mejoramiento**; formular el **plan anual de trabajo** del año siguiente (inicia 1 de enero). | Res. 0312 arts. 26-28 |
| **Hasta 31 de julio** del año siguiente (según Circular 027 de 2026; en años anteriores el plazo fue distinto) | **Registrar** la autoevaluación y el plan de mejoramiento en la aplicación del Fondo de Riesgos Laborales (sgrl.mintrabajo.gov.co) y enviar copia a la ARL. | Circular 027 de 2026 (MinTrabajo, 26 feb 2026) |
| **Julio** de cada año | Informe de avance del plan de mejoramiento. | Res. 0312 art. 28 par.; Circular 027/2026 |
| Mensual | Indicadores: frecuencia y severidad de AT, ausentismo por causa médica. Reunión COPASST. Reunión CCL (Res. 3461/2025). | Res. 0312 art. 30; Res. 2013/1986; Res. 3461/2025 |
| Anual | Prevalencia e incidencia de EL, proporción de AT mortales. Revisión por la alta dirección. Auditoría interna. Rendición de cuentas. Revisión de política y objetivos. Actualización de matriz de peligros. Simulacro. Revisión del programa de capacitación. | Decreto 1072; Res. 0312 |
| Cada 2 años | Elección de COPASST y CCL. | Res. 2013/1986; Res. 3461/2025 |
| 1 a 2 años | Batería de riesgo psicosocial. | Res. 2764/2022 |
| ≤ 3 años | Exámenes médicos periódicos (el profesiograma puede exigir menos). | Res. 1843/2025 |
| 2 días hábiles | Reporte de AT/EL a la ARL y EPS (FURAT/FUREL). | Decreto 1072, Res. 0312 ítem 3.2.1 |
| 15 días | Investigación de AT grave o mortal enviada a la ARL. | Res. 1401/2007 |

## 4. Conservación de documentos (Decreto 1072 art. 2.2.4.6.13)

**20 años desde el retiro del trabajador** para: conceptos de exámenes médicos y perfiles epidemiológicos; resultados de mediciones ambientales; registros de capacitación; registros de entrega de EPP. Lo demás, según el sistema de retención documental de la empresa. Se admite conservación electrónica. → El software debe tener política de retención y **nunca borrar** estos registros.

## 5. Sanciones (para el discurso comercial, no para plantillas)

Ley 1562/2012 art. 13: multas de 1 a 500 SMMLV según tamaño de empresa e infracción; hasta 1.000 SMMLV en caso de AT mortal por incumplimiento; cierre temporal o definitivo. Esto es lo que vende el servicio de la consultora.

## 6. Qué verificar antes de producir plantillas legales

1. Texto oficial de **Res. 1843/2025** (exámenes médicos): periodicidad y contenido del profesiograma.
2. Texto oficial de **Res. 3461/2025**: umbral de empresas obligadas, tamaño del comité por número de trabajadores.
3. **Ley 2460/2025** y **Decreto 728/2025**: contenido mínimo del programa de salud mental.
4. **Circular 027/2026**: confirmar que el plazo de julio se repite cada año (la circular es anual; en 2027 saldrá otra).
5. **Res. 0312/2019** Tabla de Valores: cotejar la tabla de `02-estandares-minimos.md` con el PDF oficial del Ministerio.
6. **Decreto 1607/2002**: cargar la tabla CIIU→clase de riesgo (hay versiones actualizadas con CIIU rev. 4 adaptada por el DANE).

## Fuentes consultadas

- Res. 0312 de 2019 texto: https://normograma.mintic.gov.co/mintic/compilacion/docs/resolucion_mtra_0312_2019.htm
- Decreto 1072 de 2015 cap. 6: https://normativa.colpensiones.gov.co/colpensiones/docs/decreto_1072_2015_pr009.htm y pr010
- Circular 027 de 2026: https://safetya.co/normatividad/circular-027-de-2026/
- Res. 3461 de 2025: https://www.funcionpublica.gov.co/eva/gestornormativo/norma_pdf.php?i=262916 ; https://safetya.co/normatividad/resolucion-3461-de-2025/
- Decreto 728 de 2025: https://safetya.co/normatividad/decreto-0728-de-2025/ ; https://www.ugpp.gov.co/wp-content/uploads/2024/11/Decreto_0728_de_2025.pdf
- Ley 2460 de 2025: https://blog.ucc.edu.co/ley-2460-de-2025-salud-mental ; https://www.implementandosgi.com/normatividad/ley-2460-de-2025/
- Res. 2764 de 2022: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=127124
- Guías 2026 (secundarias): https://sstalent.co/blog/normativas-sst-colombia-2026 ; https://intersaludocupacional.com/normatividad-sst-2026-en-colombia/ ; https://highteck.com.co/sg-sst-guia-completa-estandares-minimos/
