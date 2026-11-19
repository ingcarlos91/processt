# Contrato de variables para plantillas (Handlebars sobre Markdown)

Formato de archivo: front matter entre `---` con `codigo, nombre, tipo, nivelMin, carpeta, estandares (JSON), normas (JSON), condicion (JSON)`.
Cada sección empieza con `## ` y se guarda como sección editable independiente.

Helpers: `{{inc @index}}`, `{{#if (eq a b)}}`, `{{#if (gte a b)}}`, `{{upper x}}`, `{{join lista ", "}}`, `{{#if (or a b)}}`, `{{#if (and a b)}}`, `{{default x "texto"}}`.

| Variable | Contenido |
|---|---|
| `empresa.*` | razonSocial, nit, direccion, ciudad, departamento, telefono, correo, representanteLegal, representanteCedula, ciiu, actividad, claseRiesgo, claseRiesgoRomano, arl, eps, trabajadores, contratistas, aprendices, vehiculos, horario, turnos, nivel, sector |
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
| `capacitaciones[]` | tema, dirigidoA, mes, norma |
| `plan[]` | mes, mesNombre, actividad, responsable, estandar, recursos, normaRef |
| `evaluacion` | existe, fecha, tipo, puntaje, valoracion, accion, items[] {codigo, descripcion, estado, puntaje, obtenido, observacion} |
| `planMejora[]` | estandar, actividad, responsable, fecha, recursos, soporte |
| `dis.*` | disparadores booleanos (alturas, confinados, quimicos, electrico, ruido, ...) |
| `indicadores[]` | nombre, tipo, definicion, formula, meta, periodicidad, fuente, responsable, interpretacion, quienConoce |
| `documentosLista[]` | codigo, nombre, version, carpeta |
| `pve[]` | nombre, peligro, cargos, examenes |
| `amenazas[]` | amenaza, tipo, origen, calificacion, descripcion |
| `presupuesto[]` | rubro, descripcion, estandar |
| `altoRiesgo[]` | tipo, tareas, cargos, norma |
