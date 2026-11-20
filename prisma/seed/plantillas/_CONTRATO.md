# Contrato de variables para plantillas (Handlebars sobre Markdown)

Formato de archivo: front matter entre `---` con `codigo, nombre, tipo, nivelMin, carpeta, estandares (JSON), normas (JSON), condicion (JSON)`.
Cada sección empieza con `## ` y se guarda como sección editable independiente.

Helpers: `{{inc @index}}`, `{{#if (eq a b)}}`, `{{#if (gte a b)}}`, `{{upper x}}`, `{{join lista ", "}}`, `{{#if (or a b)}}`, `{{#if (and a b)}}`, `{{default x "texto"}}`.

| Variable | Contenido |
|---|---|
| `empresa.*` | razonSocial, nit, direccion, ciudad, departamento, telefono, correo, representanteLegal, representanteCedula, representanteTipoDoc (abreviatura), representanteDoc ("C.C. 123", "C.E. 456"…), ciiu, actividad, claseRiesgo, claseRiesgoRomano, arl, eps, trabajadores, contratistas, aprendices, vehiculos, conductores, esTransporte, horario, turnos, nivel, sector |
| `responsable.*` | nombre, cedula, cargo, perfilTexto, licencia, licenciaFecha, curso50hFecha |
| `consultora.*` | nombre, profesional, cedula, licencia, correo, telefono |
| `fecha`, `anio`, `anioSiguiente` | fecha de emisión (texto), año vigente |
| `sedes[]` | nombre, direccion, ciudad |
| `procesos[]` | nombre, descripcion, tareas[] (texto) |
| `cargos[]` | nombre, nPersonas, area, funciones, tareas[], peligros[] {clasificacion, descripcion, nivelRiesgo}, epp[] (EPP sugerido por los peligros de la matriz del cargo, sin repetir), examenes[], capacitaciones[], altoRiesgo[], periodicidadMeses (número o null), periodicidad ("Cada año", "Cada 6 meses"; vacío si no está definida), periodicidadMotivo (justificación técnica, Res. 1843/2025 art. 15), controles[] {peligro, fuente, medio, individuo, medidas} (controles de la matriz del cargo, Res. 1843/2025 art. 16) |
| `matriz.filas[]` | proceso, zona, actividad, tarea, rutinaria, clasificacion, descripcion, efectos, controlesFuente, controlesMedio, controlesIndividuo, nd, ne, np, interpNp, nc, nr, nivelRiesgo, aceptabilidad, expuestos, peorConsecuencia, requisitoLegal, eliminacion, sustitucion, ingenieria, administrativa, epp |
| `matriz.prioritarios[]` | filas con nivel de riesgo I o II |
| `matriz.porClasificacion[]` | clasificacion, total, prioritarios |
| `normas[]` | codigo, tipo, numero, anio, entidad, nombre, articulosClave, resumen, evidenciaCumplimiento |
| `estandares[]` | codigo, ciclo, grupo, descripcion, puntaje |
| `comites` | copasst {aplica, esVigia, composicion}, ccl {aplica}, brigada {aplica} |
| `integrantes.*` | copasst, ccl, brigada: {registrado, sede, inicio, fin, miembros[] (rolTexto = calidad · cargo en el comité; calidad, calidadTexto, cargoComite, representa), principales[], suplentes[], hayMiembros, presidente, secretario, eleccion {convocatoria, inscripcionDesde, …}}; `integrantes.ccl.composicion` {porParte, suplentes, texto, tramo, trabajadores, congelada} congelada al conformar (Res. 3461/2025 arts. 3 y 5 par. 1); `integrantes.ccl.otrasSedes[]` {sede, inicio, fin} (CCL por centro de trabajo, art. 3). `comites.copasst.trabajadoresConformacion`: trabajadores con que se fijó la composición del COPASST (Res. 2013/1986 art. 2) |
| `pesv` | aplica, nivel (basico/estandar/avanzado/null), nivelTexto, vehiculos, conductores, esTransporte, misionalidad, esBasico, esEstandar, esAvanzado, pasos[] {n, fase, nombre}, totalPasos (Res. 40595/2022) |
| `capacitaciones[]` | tema, dirigidoA, mes, norma |
| `plan[]` | mes, mesNombre, actividad, responsable, estandar, recursos, normaRef |
| `plan[]` ejecución: `planEjecucion` | anio, hay, programadas, ejecutadas, programadasALaFecha, ejecutadasALaFecha, pct, texto (año en curso; Decreto 1072 art. 2.2.4.6.31 num. 2) |
| `evaluacion` | la última evaluación: existe, fecha, tipo, nivel, cerrada, puntaje, valoracion, accion, pendientes, items[] {codigo, ciclo, grupo, subgrupo, descripcion, estado, puntaje, obtenido, observacion, justificacion}, noCorresponden[] {codigo, ciclo, grupo, subgrupo, descripcion, puntaje} (7 y 21: ítems que no le corresponden al nivel, art. 27), puntajeNoCorresponden |
| `evaluacionInicial` | igual que `evaluacion`, pero la de tipo inicial (DOC-05) |
| `planMejora[]` | estandar, actividad, responsable, fecha, recursos, soporte (de la última evaluación) |
| `planMejoraInicial[]` | igual, de la evaluación inicial |
| `dis.*` | disparadores booleanos (alturas, confinados, quimicos, electrico, ruido, actividadIndustrial, almacenamientoCarga, aglomeracionesPublico, serviciosPublicos, obraCivilMayor, ...) |
| `indicadores[]` | nombre, tipo, definicion, formula, meta, periodicidad, fuente, responsable, interpretacion, quienConoce |
| `documentosLista[]` | codigo, nombre, version, carpeta |
| `pve[]` | nombre, peligro, cargos, examenes |
| `amenazas[]` | amenaza, tipo, origen, calificacion, descripcion |
| `presupuesto[]` | rubro, descripcion, estandar |
| `altoRiesgo[]` | tipo, tareas, cargos, norma |
| `accidentalidad.indicadores` / `accidentalidad.anterior.indicadores` | anio, hayDatos, mesesConDatos, estimado, frecuencia, severidad (promedio mensual por 100 trabajadores), mortalidad, prevalencia, incidencia (por 100.000), ausentismo, promedioTrabajadores, meses[] {mes, trabajadores, accidentes, diasIncapacidad, diasCargados, diasAusencia, diasProgramados, frecuencia, severidad, ausentismo} — textos ya formateados (Res. 0312/2019 art. 30). `accidentalidad.anterior.resumen` = resumen del año anterior; `accidentalidad.ultimosDosAnios[]` {anio, at, gravesMortales, diasAt, el, diasAusencia, frecuencia, severidad, hayDatos} (Decreto 1072 art. 2.2.4.6.16 par. 1); `accidentalidad.resumen` suma diasEl, elNuevas, elAntiguas, elPrevalentes, elMortales; `accidentalidad.acciones[]` suma dirigidaA |
| `ev.*` (solo FOR-07, un evento) | tipo, esAT, esIncidente, esEL, gravedad, esGrave, esMortal (AT o EL con muerte), esVisitante; sexo, fechaNacimiento, eps, afp, sede, expuestos (est. 3.2.2); aTiempo (cierre dentro de los 15 días), plazoInvestigacion; fecha, hora, diaSemana, lugar, sitioExacto, tipoAccidente, jornadaHabitual ("Sí"/"No"/""), turno, tiempoLaborado; trabajador, doc, vinculacion, cargo, antiguedad (en el cargo), tiempoEmpresa, tarea; mecanismo, agente, lesion, parteCuerpo, testigos, dias, diasCargados; descripcion, versionTrabajador, versionTestigos; fechaReporte, furat, reporteMinisterio; equipo[] {nombre, cargo, documento, rol}, hayEquipo, rolesMinimos[]; porques[], actos[], condiciones[], personales[], trabajo[], conclusion, peligro; acciones[] {n, descripcion, causa, dirigidaA, tipo, jerarquia, responsable, fechaLimite, estado}; lecciones; invInicio, invCierre, invCerrada, invLugar (si está vacío, la dirección de la empresa), invFechas, remitidaArl, plazoRemision; soportes[] (Res. 1401/2007 arts. 9 a 14) |

## Documento de identidad

Toda persona trae `doc` ya formateado con su tipo: `empresa.representanteDoc`, `responsable.doc`, `consultora.doc`, `integrantes.*.miembros[].doc`, `ev.doc`. Tipos: C.C., C.E., Pasaporte, PPT, PEP, T.I. En las firmas (`**Nombre** — Cargo — {{…doc}}`) el Word lo pone debajo del cargo.
