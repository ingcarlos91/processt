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
- [ ] contexto.ts: estadísticas de 2 años, indicadores del año anterior, plan ejecutado vs programado, días por EL (Decreto 1072 arts. 2.2.4.6.16 par. 1 y .31) → DOC-05, ACT-06, DOC-12.
- [ ] contexto.ts: `evaluacion.items` con `justificacion`; DOC-05 con la evaluación inicial; quitar "ninguno" de `pve`.
- [ ] excel.ts `evaluacionXlsx`: ciclo, grupo con peso, justificación de "no aplica", ítems que no aplican al nivel con su máximo, fecha y firma (Res. 0312 art. 27).
- [ ] planeador: autoevaluación en diciembre (art. 26); reporte de avance a la ARL a 3/6 meses (art. 28); informe de julio y registro hasta el 31 de julio (Circular 027/2026).
- [ ] cerrarEvaluacion: no cerrar con ítems pendientes.
- [ ] informe de auditoría: independencia del auditor, no conformidades anteriores, a quién se comunicó, causa raíz (Decreto 1072 art. 2.2.4.6.29).
- [ ] informe del diagnóstico: no presentarlo como evaluación inicial completa; licencia de quien firma.
- [x] plan/generar.ts: auditoría anual y revisión por la dirección en todos los niveles (decisiones 1 y 4).

### Frente D (comités)
- [ ] estandares.ts: 1.1.7 `aplica21: true` (Res. 0312 art. 9 ítem 4).
- [x] plan/generar.ts: capacitación COPASST/Vigía en nivel 7 (SIVIGE ya está en el planeador como obligación legal); tarea semestral SIVIGE (Ley 2365 art. 11 num. 7, últimos 10 días del semestre); reunión CCL cita Res. 3461 art. 9.
- [ ] Editor de comités: datos de elección del CCL y `fechaConvocatoria`; validar paridad y número contra composición; ocultar "Representa" en Vigía; editar fechas del periodo.
- [ ] Modelo comiteMiembro: separar calidad (principal/suplente) del cargo (presidente/secretario).
- [ ] Composición congelada al crear el comité (Res. 3461 art. 5 par. 1).
- [ ] crearComite: normaRef del Vigía.
- [ ] CCL por centro de trabajo (Res. 3461 art. 3).
- [ ] normas.ts: URL de LEY-2191-2022 a SISJUR 119802; fechas de Res. 3461 (11 sep 2025) y Decreto 1040 (5 ago 2026).

### Frente E (accidentes y peligros)
- [ ] contexto.ts: `accidentalidad.indicadores` y `accidentalidad.anterior` para FOR-08 (Res. 0312 art. 30, est. 3.2.3).
- [x] eventos.ts: definición de EL sin "calificada por…" o citar DL-019-2012 art. 142; no generar FURAT para visitantes.
- [ ] contextoEvento: `esMortal` para EL; `aTiempo` para FOR-07.
- [ ] Modelo Evento: sexo, fecha de nacimiento, EPS, AFP, sede (Res. 1401 art. 9); Accion: dirigida a y causa básica; trabajadores potencialmente expuestos (est. 3.2.2).
- [x] gtc45 SIGNIFICADO_NR: nivel II suspender si NR ≥ 360; nivel IV completo.
- [ ] excel.ts hoja de escalas: NP y significado de niveles.
- [ ] Matriz: responsable, fecha, estado y verificación por medida (est. 4.2.1 y 4.2.2).
- [ ] normas.ts: URL de RES-0773-2021 (sirve el Decreto 1496).

### Frente C (salud)
- [x] "No apto" solo en regímenes especiales; apto con recomendaciones; tipos retorno laboral y seguimiento; etiquetas Pre-ingreso y Egreso.
- [ ] ExamenMedico: vigencia de la restricción y fecha de adaptación del puesto (20 días hábiles) para FOR-02 (Res. 1843 art. 19 par., art. 5 lit. f).
- [ ] eliminarExamen: impedir o advertir el borrado (conservación 20 años, Decreto 1072 art. 2.2.4.6.13).
- [ ] Periodicidad por cargo y examen (Res. 1843 art. 15) para el "próximo examen".
- [ ] complementarios: licencia SST del médico de la IPS.
- [ ] contexto.ts: `cargos[].controles` de la matriz para DOC-07 (art. 16).
- [x] Plan anual/planeador: pausas activas y PVE para todas las empresas con exposición.
- [ ] _CONTRATO.md: documentar `cargos[].epp`.

### Frente A (núcleo)
- [x] plan/generar.ts: revisión por la dirección (art. 2.2.4.6.31), auditoría (.29) y rendición de cuentas (.8 num. 3) para todos los niveles; capacitación COPASST con 1.1.6 en nivel 21 y 1.1.7 en 60; "según perfil de cargo (Res. 1843/2025)".
- [ ] contexto.ts `responsable`: experienciaAnios, rol y curso20hFecha para DOC-03.
- [ ] contexto.ts presupuesto: rubro de evaluaciones médicas según perfil de cargo (Res. 1843/2025).
- [ ] indicadores: "Recursos asignados" definición vs fórmula.
- [ ] estandares.ts 1.1.4: "cuatro (4) meses anteriores" (Res. 0312 art. 16).
- [ ] normas.ts: completar articulosClave faltantes.
- [ ] PRG-01: agregar 1.1.7 a sus estándares.

### Frente F
(se agrega al terminar)

## Dudas para la consultora
- A: código FOR-09 (afiliación); régimen especial de pensión por fecha de vinculación (litigio Decreto 1435/2025); horas semanales del Vigía.
- C: variable "presta servicios de salud mental" (hoy aproximada con residuosSalud); criterio de pruebas de alcohol y SPA (disparadores de alto riesgo o clase IV-V); FOR-01 anónima sin seguimiento individual.
- B: ¿"No aplica" en nivel 60 se permite con justificación? ¿Criterio de competencia del auditor (licencia o curso de 50 h)?
- D: escogencia del Vigía (votación o designación con participación); CCL con exactamente 5 o 20 trabajadores; ACT-03 con Vigía como buena práctica; requisitos del Decreto 1040 con confianza media.
- E: frecuencia de verificación de controles (I mensual, II trimestral, III en inspecciones); plazo de investigación de EL desde el diagnóstico; notificar AT leves a la Dirección Territorial por prudencia.
