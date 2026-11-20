# Cambios de código derivados de la verificación normativa (20 nov 2026)

Marcados [x] los hechos. Cada uno cita la norma que lo exige. Fuente: reportes de los frentes A–F (docs/requisitos/*.json).

## Hechos
- [x] Puntaje de autoevaluación 7/21: ítems que no aplican suman su máximo (Res. 0312 art. 27).
- [x] "No apto" solo en regímenes especiales; tipos de evaluación del art. 8; campo `regimen` (Res. 1843 arts. 2, 8, 19).
- [x] Definición de incidente (Res. 1401 art. 3).
- [x] Días hábiles sin festivos de Colombia (plazos FURAT y Dirección Territorial).
- [x] FURAT: no inventar la fecha de reporte; nota Res. 2851/2015 para AT leves (decisión 3).
- [x] Muerte por AT o EL: investigación en 15 días con el COPASST (Decreto 1072 art. 2.2.4.1.6); EL cita estándar 3.2.2.
- [x] Cierre de investigación exige lugar, fechas y horas y cargo de los investigadores (Res. 1401 art. 13).
- [x] Indicadores: denominador con contratistas y aprendices, sin visitantes; prevalencia con casos antiguos; mortalidad nula sin AT; texto de severidad; rótulos "por 100 trabajadores" (Res. 0312 art. 30).
- [x] Rutas de descarga verifican usuario activo.
- [x] Catálogo: 7 normas nuevas verificadas.

## Pendientes
### Frente B (evaluación y mejora)
- [x] contexto.ts: estadísticas de 2 años, indicadores del año anterior, plan ejecutado vs programado, días por EL (Decreto 1072 arts. 2.2.4.6.16 par. 1 y .31) → DOC-05, ACT-06, DOC-12. (Frente E: estadísticas de 2 años, indicadores del año anterior y días por EL hechos en `accidentalidad`; plan ejecutado vs programado queda al frente B.)
- [x] contexto.ts: `evaluacion.items` con `justificacion`; DOC-05 con la evaluación inicial; quitar "ninguno" de `pve`.
- [x] excel.ts `evaluacionXlsx`: ciclo, grupo con peso, justificación de "no aplica", ítems que no aplican al nivel con su máximo, fecha y firma (Res. 0312 art. 27).
- [x] planeador: autoevaluación en diciembre (art. 26); reporte de avance a la ARL a 3/6 meses (art. 28); informe de julio y registro hasta el 31 de julio (Circular 027/2026).
- [x] cerrarEvaluacion: no cerrar con ítems pendientes.
- [x] informe de auditoría: independencia del auditor, no conformidades anteriores, a quién se comunicó, causa raíz (Decreto 1072 art. 2.2.4.6.29).
- [x] informe del diagnóstico: no presentarlo como evaluación inicial completa; licencia de quien firma.
- [x] plan/generar.ts: auditoría anual y revisión por la dirección en todos los niveles (decisiones 1 y 4).
- [x] B1: "No aplica" no se ofrece en nivel 60 y cuenta como no cumplido; la interfaz pide recalificar (Res. 0312 arts. 16 y 27). También en el diagnóstico.
- [x] contexto.ts: `planEjecucion` (ejecutadas vs programadas del año) para ACT-06 (Decreto 1072 art. 2.2.4.6.31 num. 2). Faltan estadísticas de 2 años, indicadores del año anterior y días por EL (línea 19).
- [x] Planeador: reentrenamiento de alturas cada 18 meses por trabajador (Res. 4272/2021 art. 27 num. 4 lit. b) y actualización de espacios confinados cada 3 años (Res. 0491/2020 art. 30 par.).

### Frente D (comités)
- [x] estandares.ts: 1.1.7 `aplica21: true` (Res. 0312 art. 9 ítem 4).
- [x] plan/generar.ts: capacitación COPASST/Vigía en nivel 7 (SIVIGE ya está en el planeador como obligación legal); tarea semestral SIVIGE (Ley 2365 art. 11 num. 7, últimos 10 días del semestre); reunión CCL cita Res. 3461 art. 9.
- [x] Editor de comités: datos de elección del CCL y `fechaConvocatoria`; validar paridad y número contra composición; ocultar "Representa" en Vigía; editar fechas del periodo.
- [x] Modelo comiteMiembro: separar calidad (principal/suplente) del cargo (presidente/secretario).
- [x] Composición congelada al crear el comité (Res. 3461 art. 5 par. 1).
- [x] crearComite: normaRef del Vigía.
- [x] CCL por centro de trabajo (Res. 3461 art. 3).
- [x] normas.ts: URL de LEY-2191-2022 a SISJUR 119802; fechas de Res. 3461 (11 sep 2025) y Decreto 1040 (5 ago 2026).

### Frente E (accidentes y peligros)
- [x] contexto.ts: `accidentalidad.indicadores` y `accidentalidad.anterior` para FOR-08 (Res. 0312 art. 30, est. 3.2.3).
- [x] eventos.ts: definición de EL sin "calificada por…" o citar DL-019-2012 art. 142; no generar FURAT para visitantes.
- [x] contextoEvento: `esMortal` para EL; `aTiempo` para FOR-07.
- [x] Modelo Evento: sexo, fecha de nacimiento, EPS, AFP, sede (Res. 1401 art. 9); Accion: dirigida a y causa básica; trabajadores potencialmente expuestos (est. 3.2.2).
- [x] gtc45 SIGNIFICADO_NR: nivel II suspender si NR ≥ 360; nivel IV completo.
- [x] excel.ts hoja de escalas: NP y significado de niveles.
- [x] Matriz: responsable, fecha, estado y verificación por medida (est. 4.2.1 y 4.2.2).
- [x] normas.ts: URL de RES-0773-2021 (sirve el Decreto 1496). Se usa la compilación del normograma del ICBF; la de Función Pública no se pudo abrir para confirmarla.

### Frente C (salud)
- [x] "No apto" solo en regímenes especiales; apto con recomendaciones; tipos retorno laboral y seguimiento; etiquetas Pre-ingreso y Egreso.
- [x] ExamenMedico: vigencia de la restricción y fecha de adaptación del puesto (20 días hábiles) para FOR-02 (Res. 1843 art. 19 par., art. 5 lit. f).
- [x] eliminarExamen: impedir o advertir el borrado (conservación 20 años, Decreto 1072 art. 2.2.4.6.13).
- [x] Periodicidad por cargo y examen (Res. 1843 art. 15) para el "próximo examen".
- [x] complementarios: licencia SST del médico de la IPS.
- [x] contexto.ts: `cargos[].controles` de la matriz para DOC-07 (art. 16).
- [x] Plan anual/planeador: pausas activas y PVE para todas las empresas con exposición.
- [x] _CONTRATO.md: documentar `cargos[].epp`.

### Frente A (núcleo)
- [x] plan/generar.ts: revisión por la dirección (art. 2.2.4.6.31), auditoría (.29) y rendición de cuentas (.8 num. 3) para todos los niveles; capacitación COPASST con 1.1.6 en nivel 21 y 1.1.7 en 60; "según perfil de cargo (Res. 1843/2025)".
- [x] contexto.ts `responsable`: experienciaAnios, rol y curso20hFecha para DOC-03.
- [x] contexto.ts presupuesto: rubro de evaluaciones médicas según perfil de cargo (Res. 1843/2025).
- [x] indicadores: "Recursos asignados" definición vs fórmula.
- [x] estandares.ts 1.1.4: "cuatro (4) meses anteriores" (Res. 0312 art. 16).
- [x] normas.ts: completar articulosClave faltantes (DEC-1607-2002 y RES-2346-2007 están derogadas; la Circular 047/2025 se organiza por numerales). (RES-0908-2025 completada con el texto de SISJUR; quedan DEC-1607-2002, CIR-047-2025 y RES-2346-2007 sin verificar artículo por artículo.)
- [x] PRG-01: agregar 1.1.7 a sus estándares.

### Frente F
- [x] contexto.ts PASOS_PESV: paso 9 en Implementación; pasos 23 (mejora continua) y 24 (comunicación y participación) (Res. 40595/2022 anexo).
- [x] Biblioteca de inspecciones: alarma, señalización e iluminación de emergencia (Decreto 1072 art. 2.2.4.6.25 num. 12); protección contra caídas y sistemas de acceso (Res. 4272/2021 arts. 16 y 61); detectores de gases y rescate en confinados (Res. 0491/2020 art. 7); vehículos con preoperacional antes de cada uso (Res. 40595/2022 paso 16); extintores y botiquín citan el Decreto 1072; bioseguridad con capacitación y plan de contingencia (Decreto 780/2016 art. 2.8.10.6).
- [x] Decreto 2157/2017 fuera de los peligros de peligros-2.ts y de la matriz legal sin su disparador (docs/09).
- [x] complementarios: administrador del programa de alturas (Res. 4272 art. 61 lit. c), supervisor y vigía de confinados (Res. 0491 art. 10) en PRG-08 y PRG-11.
- [x] PRG-06: filas condicionales para alturas/confinados y alarmas en el cronograma (las listas ya existen en la biblioteca).
- [x] PLN-04: PON de inundación, fuga de gas y accidente de tránsito; vulnerabilidad por amenaza; presupuesto del plan.

### Decisiones aplicadas
- [x] C1: disparador `serviciosSalud` (CIIU 86 y 87) en el motor, con explicación y regla SERVICIOS-SALUD; PRG-03 lo usa.
- [x] F1: sección editada cuyo título ya no está en la plantilla se conserva y queda "para revisar".

## Dudas para la consultora
- A: código FOR-09 (afiliación); régimen especial de pensión por fecha de vinculación (litigio Decreto 1435/2025); horas semanales del Vigía.
- C: variable "presta servicios de salud mental" (hoy aproximada con residuosSalud); criterio de pruebas de alcohol y SPA (disparadores de alto riesgo o clase IV-V); FOR-01 anónima sin seguimiento individual.
- B: ¿"No aplica" en nivel 60 se permite con justificación? ¿Criterio de competencia del auditor (licencia o curso de 50 h)?
- D: escogencia del Vigía (votación o designación con participación); CCL con exactamente 5 o 20 trabajadores; ACT-03 con Vigía como buena práctica; requisitos del Decreto 1040 con confianza media.
- E: frecuencia de verificación de controles (I mensual, II trimestral, III en inspecciones); plazo de investigación de EL desde el diagnóstico; notificar AT leves a la Dirección Territorial por prudencia.
