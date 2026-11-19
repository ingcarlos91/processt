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
| `cargos[]` | nombre, nPersonas, area, funciones, tareas[], peligros[] {clasificacion, descripcion, nivelRiesgo}, epp[], examenes[], capacitaciones[], altoRiesgo[] |
| `matriz.filas[]` | proceso, zona, actividad, tarea, rutinaria, clasificacion, descripcion, efectos, controlesFuente, controlesMedio, controlesIndividuo, nd, ne, np, interpNp, nc, nr, nivelRiesgo, aceptabilidad, expuestos, peorConsecuencia, requisitoLegal, eliminacion, sustitucion, ingenieria, administrativa, epp |
| `matriz.prioritarios[]` | filas con nivel de riesgo I o II |
| `matriz.porClasificacion[]` | clasificacion, total, prioritarios |
| `normas[]` | codigo, tipo, numero, anio, entidad, nombre, articulosClave, resumen, evidenciaCumplimiento |
| `estandares[]` | codigo, ciclo, grupo, descripcion, puntaje |
| `comites` | copasst {aplica, esVigia, composicion}, ccl {aplica}, brigada {aplica} |
| `integrantes.*` | copasst, ccl, brigada: {registrado, inicio, fin, miembros[], hayMiembros, presidente, secretario, eleccion}; `integrantes.ccl.composicion` {porParte, suplentes, texto} (Res. 3461/2025 art. 3) |
| `pesv` | aplica, nivel (basico/estandar/avanzado/null), nivelTexto, vehiculos, conductores, esTransporte, misionalidad, esBasico, esEstandar, esAvanzado, pasos[] {n, fase, nombre}, totalPasos (Res. 40595/2022) |
| `capacitaciones[]` | tema, dirigidoA, mes, norma |
| `plan[]` | mes, mesNombre, actividad, responsable, estandar, recursos, normaRef |
| `evaluacion` | existe, fecha, tipo, puntaje, valoracion, accion, items[] {codigo, descripcion, estado, puntaje, obtenido, observacion} |
| `planMejora[]` | estandar, actividad, responsable, fecha, recursos, soporte |
| `dis.*` | disparadores booleanos (alturas, confinados, quimicos, electrico, ruido, actividadIndustrial, almacenamientoCarga, aglomeracionesPublico, serviciosPublicos, obraCivilMayor, ...) |
| `indicadores[]` | nombre, tipo, definicion, formula, meta, periodicidad, fuente, responsable, interpretacion, quienConoce |
| `documentosLista[]` | codigo, nombre, version, carpeta |
| `pve[]` | nombre, peligro, cargos, examenes |
| `amenazas[]` | amenaza, tipo, origen, calificacion, descripcion |
| `presupuesto[]` | rubro, descripcion, estandar |
| `altoRiesgo[]` | tipo, tareas, cargos, norma |
| `ev.*` (solo FOR-07, un evento) | tipo, esAT, esIncidente, esEL, gravedad, esGrave, esMortal; fecha, hora, diaSemana, lugar, sitioExacto, tipoAccidente, jornadaHabitual ("Sí"/"No"/""), turno, tiempoLaborado; trabajador, doc, vinculacion, cargo, antiguedad (en el cargo), tiempoEmpresa, tarea; mecanismo, agente, lesion, parteCuerpo, testigos, dias, diasCargados; descripcion, versionTrabajador, versionTestigos; fechaReporte, furat, reporteMinisterio; equipo[] {nombre, cargo, documento, rol}, hayEquipo, rolesMinimos[]; porques[], actos[], condiciones[], personales[], trabajo[], conclusion, peligro; acciones[] {n, descripcion, tipo, jerarquia, responsable, fechaLimite, estado}; lecciones; invInicio, invCierre, invCerrada, invLugar (si está vacío, la dirección de la empresa), invFechas, remitidaArl, plazoRemision; soportes[] (Res. 1401/2007 arts. 9 a 14) |

## Documento de identidad

Toda persona trae `doc` ya formateado con su tipo: `empresa.representanteDoc`, `responsable.doc`, `consultora.doc`, `integrantes.*.miembros[].doc`, `ev.doc`. Tipos: C.C., C.E., Pasaporte, PPT, PEP, T.I. En las firmas (`**Nombre** — Cargo — {{…doc}}`) el Word lo pone debajo del cargo.
