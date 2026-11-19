# 05 · Diseño del producto

Nombre de trabajo: **processt** (carpeta del proyecto). Decidir nombre comercial después.

## 1. Principios

1. **Multi-cliente desde el día uno**: la unidad es "empresa cliente"; la consultora ve todas.
2. **Generar, no editar**: el usuario captura datos estructurados; los documentos son una salida. Si cambia un dato, se regeneran.
3. **El estándar es la columna vertebral**: todo (documento, evidencia, tarea, indicador) cuelga de un ítem de la Res. 0312 (1.1.1 … 7.1.4). Así el expediente queda ordenado como lo pide el Ministerio.
4. **Reglas explícitas y versionadas**: "qué aplica" y "qué dice la plantilla" viven en datos (no en código) para poder actualizarlos cuando cambie la norma.
5. **La consultora siempre puede sobreescribir**: cualquier texto generado se puede editar y la edición se conserva aunque se regenere.

## 2. Módulos

### M1. Empresas (intake)
Wizard de alta de cliente en pasos cortos:
1. Identificación: razón social, NIT, dirección, ciudad, representante legal, correo, teléfono, logo.
2. Actividad: código CIIU (búsqueda), descripción, **clase de riesgo** (sugerida por Decreto 768/2022, editable), ARL, EPS mayoritaria, caja.
3. Personas: n.º trabajadores por tipo (planta, contratistas, aprendices, en misión), turnos, horario. Lista de **cargos** (con cantidad por cargo) y **sedes/centros de trabajo**.
4. Procesos: lista de procesos/áreas (plantilla por sector: "oficina administrativa", "bodega", "cocina", "obra"...).
5. Peligros disparadores (checklist sí/no): trabajo en alturas, espacios confinados, químicos, vehículos (cuántos), electricidad, manipulación de alimentos, ruido, radiaciones, cargas, atención al público, etc.
6. Estado actual: ¿tiene responsable SST?, ¿COPASST?, ¿CCL?, ¿política?, ¿exámenes?… (alimenta la evaluación inicial).
7. Responsable del SG-SST en la empresa (nombre, licencia, curso 50 h) y datos de la consultora (licencia, firma).

Salida: `nivel` (7/21/60), lista de ítems aplicables, lista de documentos a generar, normas de la matriz legal, calendario inicial.

### M2. Motor de reglas (aplicabilidad)
Tabla de reglas: `condición → ítems/documentos/normas`. Ejemplos:
- `trabajadores ≤ 10 ∧ riesgo ∈ {I,II,III}` → nivel 7.
- `trabajadores ≥ 10` → Reglamento de Higiene, COPASST (en vez de Vigía), CCL.
- `alturas = sí` → PRG-08, procedimiento, permiso, Res. 4272 en matriz legal, ítem 4.2.3 reforzado.
- `vehículos > 10` (11 o más) `∨ conductores ≥ 2` → PESV (nivel según Res. 40595/2022).
- `químicos = sí` → MTZ-03, SGA.
- `trabajadores > 50 ∨ CCL recomienda` → batería psicosocial.
Las reglas se guardan en datos con fecha de vigencia y referencia normativa.

### M3. Evaluación inicial y autoevaluación
Checklist de los 60 ítems (filtrado al nivel). Cada ítem: cumple / no cumple / no aplica (justificación), observación, evidencia adjunta. Cálculo de puntaje bruto y ajustado, valoración (crítico/moderado/aceptable), y generación automática del **plan de mejoramiento** (un renglón por ítem no cumplido con actividad sugerida, responsable, plazo). Se puede correr como "evaluación inicial" (al entrar) y como "autoevaluación anual" (diciembre); histórico por año. Exporta en el formato que pide la plataforma del Fondo de Riesgos Laborales.

### M4. Matriz de peligros (GTC 45)
Editor tipo hoja de cálculo: proceso → zona/lugar → actividad → tarea → rutinaria sí/no → peligro (clasificación GTC 45: biológico, físico, químico, psicosocial, biomecánico, condiciones de seguridad, fenómenos naturales) → efectos → controles existentes (fuente/medio/individuo) → ND, NE, NP, NC, NR → interpretación → aceptabilidad → n.º expuestos → peor consecuencia → requisito legal → medidas de intervención (eliminación, sustitución, ingeniería, administrativos, EPP).
**Biblioteca prellenada** por sector y por cargo (p. ej. "auxiliar administrativo": biomecánico postura prolongada sedente, psicosocial carga mental, físico iluminación, condiciones de seguridad locativo). La consultora importa la plantilla del sector y ajusta. De la matriz se derivan automáticamente: matriz de EPP, profesiograma, procedimientos seguros que aplican, PVE, temas del plan de capacitación, matriz legal.

### M5. Generador de documentos
- Plantillas en formato editable (DOCX con marcadores o Markdown → DOCX/PDF) con variables `{{empresa.razon_social}}`, bloques condicionales (`{{#if nivel>=21}}`), tablas iteradas (cargos, peligros, cronograma).
- Encabezado/pie con logo del cliente, código, versión, fecha, página; pie con "Elaboró: consultora + licencia / Revisó / Aprobó: representante legal".
- Listado maestro de documentos automático.
- Botón "Generar todo" (ZIP ordenado por estándar) y regeneración individual.
- Editor en línea para ajustar un documento sin salir del sistema; las ediciones manuales se marcan y se preservan.
- Firma: campo de firma del representante legal (imagen) y, en fase 2, firma electrónica.

### M6. Plan anual y calendario
Plan anual generado desde el nivel + prioridades del diagnóstico: actividades mensuales (capacitaciones, inspecciones, reuniones COPASST/CCL, exámenes, simulacro, mediciones, auditoría, revisión por la dirección, autoevaluación, registro en FRL). Vista Gantt/calendario, responsables, % de ejecución (indicador de proceso automático). Recordatorios por correo/WhatsApp a consultora y cliente.

### M7. Evidencias y ejecución
Por cada actividad/ítem: subir evidencia (foto, PDF, acta, lista de asistencia). Formatos digitales rellenables desde el celular: lista de asistencia a capacitación, inspección, entrega de EPP, acta de reunión, autorreporte. Todo queda ligado al ítem del estándar → el expediente para el Ministerio se arma solo.

### M8. Eventos e indicadores
Registro de AT, incidentes, EL, ausentismo (días), número de trabajadores por mes. Cálculo de los 6 indicadores de la Res. 0312 art. 30 + indicadores de estructura/proceso/resultado con ficha técnica. Tablero por cliente y tablero global de la consultora.

### M9. Comités
COPASST, CCL, brigada: integrantes, periodo, elección, actas con agenda estándar, seguimiento de compromisos, alerta de vencimiento de periodo (2 años) y de reunión mensual.

### M10. Personas (fase 2)
Trabajadores del cliente: cargo, sede, fecha de ingreso, ARL/EPS/AFP, exámenes (fechas y concepto de aptitud, nunca el diagnóstico), EPP entregado, capacitaciones recibidas, encuesta sociodemográfica. Habilita el informe de condiciones de salud y la inducción virtual.

### M11. Portal del cliente
Tablero: % de cumplimiento, próximas tareas, documentos para firmar, evidencias pendientes. Solo lectura del expediente.

### M12. Administración de la consultora
Varias consultoras (multi-tenant) → clientes → usuarios. Plantillas propias (fork de la plantilla base). Cotizador (precio por nivel). Registro de licencia y firma.

## 3. Modelo de datos (núcleo)

```
Consultora(id, nombre, licencia_sst, firma_img)
Usuario(id, consultora_id, rol)
Empresa(id, consultora_id, razon_social, nit, ciiu, clase_riesgo, arl, rep_legal, logo, n_trabajadores, nivel_estandares)
Sede(id, empresa_id, nombre, direccion, clase_riesgo)
Cargo(id, empresa_id, nombre, n_personas, area)
Proceso(id, empresa_id, nombre)
Peligro(id, empresa_id, proceso_id, cargo_id?, clasificacion, descripcion, efectos, controles_*, nd, ne, nc, nr, aceptabilidad, medidas_*)
Estandar(codigo "4.1.2", ciclo, grupo, descripcion, puntaje, aplica_7, aplica_21)
Evaluacion(id, empresa_id, tipo inicial|anual, anio, puntaje, valoracion)
EvaluacionItem(evaluacion_id, estandar_codigo, estado cumple|no|na, justificacion, evidencia_ids)
PlantillaDocumento(id, codigo "POL-01", nombre, tipo, nivel_min, estandares[], contenido, version, vigente_desde, consultora_id? (override))
Documento(id, empresa_id, plantilla_id, version, contenido_generado, ediciones_manuales, estado borrador|aprobado|firmado, archivo_url)
Norma(id, nombre, tema, condicion_aplicabilidad, url_oficial, vigente_desde, derogada_por?)
ReglaAplicabilidad(id, condicion_json, efecto_json, referencia_normativa, vigente_desde)
ActividadPlan(id, empresa_id, anio, nombre, estandar_codigo, mes, responsable, estado, evidencia_ids)
Evidencia(id, empresa_id, estandar_codigo, actividad_id?, archivo_url, fecha, descripcion)
Evento(id, empresa_id, tipo AT|incidente|EL|ausentismo, fecha, dias_incapacidad, mortal, investigacion_doc_id)
Comite(id, empresa_id, tipo COPASST|VIGIA|CCL|BRIGADA, periodo_inicio, periodo_fin), ComiteMiembro, ActaComite
Trabajador(id, empresa_id, cargo_id, sede_id, ...) [fase 2]
```

## 4. Alcance por fases

### MVP (fase 1, objetivo: que la esposa lo use con sus clientes reales)
- M1 intake, M2 reglas (7/21/60 + disparadores básicos), M3 evaluación inicial con puntaje y plan de mejoramiento, M4 matriz de peligros con biblioteca de 5-6 sectores comunes, M5 generador para los ~30 documentos del nivel 21 (cubre también los 7), M6 plan anual + calendario simple, M12 básico (una consultora).
- Salida: ZIP con DOCX + PDF ordenado por estándar, listado maestro, matriz legal.

### Fase 2
- M7 evidencias y formatos móviles, M8 indicadores, M9 comités, M11 portal cliente, nivel 60 completo (PVE, auditoría, revisión por la dirección), alertas.

### Fase 3
- M10 trabajadores e inducción virtual, firma electrónica, multi-consultora (vender a otras consultoras), integración con plataforma del FRL (exportar formato exacto), asistente con IA para redactar secciones específicas (p. ej. descripción del proceso productivo, análisis de vulnerabilidad) a partir de los datos.

## 5. Dónde entra la IA (sin que sea el núcleo)

- Sugerir peligros y controles para un cargo/proceso descrito en texto libre (sobre la biblioteca, no en su lugar).
- Redactar párrafos variables (descripción de la empresa, justificación de "no aplica", análisis de vulnerabilidad narrativo).
- Leer una carpeta de SG-SST existente (cliente que viene de otra consultora) y mapearla a los ítems para la evaluación inicial.
- Vigilancia normativa: resumir normas nuevas y proponer cambios de plantilla (siempre con aprobación humana).

## 6. Riesgos del producto

- **Exactitud legal**: una plantilla con norma derogada expone a la consultora. Mitigación: plantillas con referencia normativa y fecha; revisión por la esposa antes de "publicar" una plantilla.
- **Datos sensibles**: información de salud de trabajadores (Ley 1581/2012 de datos personales, dato sensible). Mitigación: en fase 1 no almacenar diagnósticos, solo conceptos de aptitud; cifrado; retención de 20 años.
- **Sobreautomatizar**: el Ministerio valora evidencias reales de implementación, no carpetas bonitas. El software debe empujar la ejecución (calendario, evidencias), no solo generar papel.
