# Avance del desarrollo

## Cómo correr en local

```bash
# Node 24 (nvm) y Docker
nvm use 24
docker start processt-pg || docker run -d --name processt-pg -e POSTGRES_USER=processt -e POSTGRES_PASSWORD=processt -e POSTGRES_DB=processt -p 5433:5432 postgres:16-alpine
npm install
npx prisma migrate dev      # crea/actualiza tablas
npx prisma db seed          # normas, 60 estándares, reglas, CIIU, biblioteca GTC 45, 48 plantillas
npx tsx scripts/demo.ts     # (opcional) empresa de demostración: restaurante de 15 trabajadores
npx tsx scripts/usuario.ts correo@dominio.com "Nombre Apellido" "ContraseñaSegura1" admin   # crea o restablece un usuario
npm run dev                 # http://localhost:3000 → pide login
```

`.env` debe tener `DATABASE_URL` y `AUTH_SECRET` (secreto para firmar sesiones; genérelo con `openssl rand -base64 48`).

IA opcional: agregar `AI_GATEWAY_API_KEY=...` en `.env`. Sin clave, “Sugerir tareas y peligros” busca por palabras clave en la biblioteca.

## Hecho (19 nov 2026)

| Hito | Estado | Notas |
|---|---|---|
| H0 Arranque | ✅ | Next.js 16, Prisma 6, Postgres 16 en Docker (puerto 5433). Sin Clerk ni Vercel todavía: uso local. |
| H1 Modelo de datos | ✅ | 30+ tablas. Biblioteca (sector → cargo tipo → tarea tipo → peligro) e instancia por empresa. |
| H2 Semillas normativas | ✅ | 60 estándares (suman 100; 7 y 21 correctos), 38 normas, 20 reglas con norma_ref, 131 CIIU, 49 peligros, 47 tareas, 8 sectores. |
| H3 Empresas e intake | ✅ | Cuestionario de 6 pasos (sin "Estado actual" desde el 20 nov 2026: lo que la empresa tiene se califica en el diagnóstico); CIIU sugiere clase de riesgo y sector; motor de reglas con fundamento por conclusión. |
| H4 Evaluación | ✅ | Tabla de valores, puntaje ajustado (7/21) o sobre 100 (60), valoración art. 28, plan de mejoramiento automático, Excel. |
| H5 Matriz GTC 45 | ✅ | Peligros por tarea, zona y cargo; ND/NE/NC editables; expuestos calculados; IA o biblioteca; guardar en biblioteca; versiones; Excel GTC 45. |
| H6 Documentos | ✅ | 48 plantillas escritas desde cero sobre la norma; generación por secciones con ediciones preservadas; Word con encabezado y pie; ZIP por carpetas de estándar. |
| H7 Plan anual | ✅ | ~110 actividades con estándar y norma; en nov-dic se planea el año siguiente (Res. 0312 art. 26). Sin correos aún. |
| H8 Tablero y comités | ✅ | Alertas, comités con periodos, indicadores art. 30 con registro de eventos y fichas técnicas. |
| UI | ✅ | 100 % shadcn (base-nova): sidebar-07, Card, Table, Field, NativeSelect, Dialog, Empty, Alert. Marca PROCESST. Fuente Plus Jakarta Sans (libre, reemplaza a BW Modelica). |

## Agregado después

- Explicaciones “¿Por qué?”: ícono ⓘ en cada decisión y panel lateral con todas las decisiones de la empresa.
- Peligros especiales detectados desde la matriz (no solo desde el cuestionario), con alerta.
- Datos de la profesional en “Mi consultora”: se precargan como responsable del SG-SST y firman como “Elaboró”.
- Logo por empresa (PNG/JPG, 2 MB) en el encabezado de Word y Excel; se guarda en `uploads/logos/` (fuera de git).

- Biblioteca ampliada: 25 sectores, 177 cargos tipo, 115 tareas, 89 peligros, 29 zonas y 166 elementos de catálogo (43 exámenes, 59 EPP, 64 capacitaciones). Semilla aditiva: `npx prisma db seed` agrega lo nuevo sin tocar lo validado.
- Biblioteca editable desde la app: crear sectores, cargos tipo, tareas tipo (con peligros y zonas) y peligros; catálogos de exámenes, EPP y capacitaciones.
- “Ampliar con IA” por sector (requiere AI_GATEWAY_API_KEY): la IA crea cargos, tareas y peligros sin validar.

- Biblioteca en dos niveles: general (todas las empresas) y propia de cada empresa (pestaña “Biblioteca propia”). Lo propio no aparece en otras empresas; “Publicar en general” lo comparte. Al guardar desde la matriz se elige el nivel.

- Login propio (sin servicios externos): usuarios con contraseña cifrada (scrypt), sesión firmada en cookie httpOnly (jose, 7 días), `proxy.ts` protege páginas y descargas, y cada server action verifica la sesión. Página Usuarios (admin) y cambio de contraseña en Mi consultora.

- Documentos diligenciados: integrantes de comités, datos de la elección del COPASST y “Datos para los documentos” (emergencias, contactos, inventarios, presupuesto) en la pestaña Datos; aviso de datos faltantes en Documentos.
- Editor visual (Tiptap) tipo Word para las secciones, con tablas editables; guarda Markdown. Modo avanzado opcional.

- Archivos: subir documento firmado (pasa a Firmado y avisa si cambió después), evidencias por actividad del plan (la marca ejecutada), soportes por ítem de la evaluación, actas por comité, pestaña Evidencias por estándar y expediente ZIP para Ministerio/ARL. PDF, imágenes, Word y Excel hasta 10 MB; nunca se borran (se retiran con motivo). Se guardan en `uploads/empresas/` (fuera de git).

- Accidentes e incidentes: pestaña con registro por evento (AT, incidente, EL, ausentismo), semáforo de plazos (FURAT 2 días hábiles — Decreto Ley 1295/1994 art. 62; investigación 15 días y remisión a ARL de graves/mortales — Res. 1401/2007), investigación (equipo art. 7, porqués, causas inmediatas y básicas, peligro relacionado → matriz), sugerencias por IA o por reglas, acciones con jerarquía de controles (modelo `Accion`, FOR-06) que se pueden llevar al plan anual, informe FOR-07 por evento en Word, soportes por evento en Evidencias (3.2.1/3.2.2). Nuevos FOR-07 (por evento, tipo INF) y FOR-08 (registro y análisis estadístico); FOR-06, ACT-06, ACT-02 y PRC-09 se alimentan de los eventos. Aviso de plazos vencidos en el Resumen.

- Biblioteca → Accidentes (global): formas del evento con causas, medidas, lesiones/agentes/partes típicas y lección sugerida; agentes; tipos de lesión (con “sugiere grave”, Res. 1401/2007 art. 3); partes del cuerpo. Alimentan el formulario (selector con búsqueda y texto libre, típicas primero) y las sugerencias de investigación. Precarga: lugares desde sedes/zonas, tareas del cargo, responsable y fecha (+30 días) de acciones, lección por forma.

- Versiones de la matriz: el cierre guarda filas completas, quién cerró y resumen; página Cargos y matriz → Versiones para ver, descargar en Excel (`?version=N`) y comparar con la vigente (agregados, quitados, cambios de nivel y controles); versiones antiguas compatibles. MTZ-02 muestra la versión. Avisos de actualización: más de un año (obligatorio), accidente mortal (obligatorio), grave (recomendado) — Decreto 1072/2015 art. 2.2.4.6.15; Res. 0312/2019 estándar 4.1.2. “Completar procesos y zonas” trae peligros como sugeridos. Ayuda solo en encabezados; explicación de cada dato en tooltip.

- Manual de ayuda por sección: botón “Ayuda” en el encabezado abre un panel con la ayuda de la pantalla actual (qué incluye cada tarjeta, qué hace cada botón, paso a paso, consejos, normas y secciones relacionadas), buscador en todo el manual e índice. Contenido en `src/lib/manual.ts` (actualizar al cambiar una pantalla).

- Documento de identidad con tipo (C.C., C.E., Pasaporte, PPT, PEP, T.I.) para representante legal, responsable SG-SST, profesional, integrantes de comités (editables) y trabajador accidentado; todas las firmas y actas lo precargan.

- Planeador (global y por empresa): plan anual, comités, plazos de accidentes, acciones, matriz, autoevaluación, curso 20 h, exámenes, reposición de EPP y recordatorios; agenda y calendario; exportar .ics.
- Tablero de la consultora en el inicio (cartera, atención 14 días, prioridad por empresa).
- Informe mensual de gestión en Word por empresa.
- Trabajadores: importar desde Excel, exámenes (solo conceptos), entregas de EPP, capacitaciones con asistencia; alimentan FOR-01 (consolidado), FOR-02, MTZ-04, PRG-01 y el planeador.

- Inspecciones (listas editables en Biblioteca, hallazgos a FOR-06, fotos, PRG-06, planeador). Entidades globales (EPS, AFP, ARL, escolaridad). Bitácora de visitas con contrato (horas y valor), en planeador, tablero e informe.

- Exportación a PDF con Playwright (documentos, informe de gestión, informe de investigación, informe de auditoría). En Vercel requerirá Chromium para serverless.
- Auditoría interna anual (13 aspectos del art. 2.2.4.6.30 con evidencia de PROCESST, no conformidades a FOR-06, informe Word/PDF, PRG-10, ACT-06, planeador).
- Diagnóstico inicial opcional: crear empresa «Empezar con diagnóstico» (etapa diagnóstico, sin matriz ni documentos), lista de chequeo por PHVA con puntaje Res. 0312, informe PDF membreteado por la consultora y firmado, «Iniciar el SG-SST con este diagnóstico» (evaluación inicial + plan de mejoramiento + plan anual + documentos), línea base en Resumen e informe mensual.
- Trazabilidad de datos (lib/completitud): cada dato faltante con dónde se llena y qué documentos lo usan (leído de las plantillas); panel en Documentos, insignia por documento, aviso dentro de cada documento y alerta en Resumen. Evaluación de cumplimiento de la matriz legal (columna «Cumple» de MTZ-01). Celdas de registros sin dato muestran «Pendiente», «Sin registrar», «Por definir» o «Ninguno identificado». Verificado: 270 pantallas sin errores y 309 descargas (Word, PDF, Excel, ZIP) correctas.

- Auditoría normativa completa (docs/09): catálogo ampliado a ~60 normas verificadas, reglas con umbrales corregidos (PESV 11 vehículos o 2 conductores con niveles, alturas 2,0 m, Decreto 2157 restringido, Res. 1075 derogada, Decreto 768/2022), campo de conductores, nuevos disparadores, reporte de EL al Ministerio.
- Biblioteca "universo grande": 321 peligros (GTC 45 completo, todos con controles existentes, cinco medidas de la jerarquía, EPP, exámenes, capacitaciones, normas y PVE), 138 zonas, 659 tareas, 621 cargos, 80 sectores con 472 procesos, en módulos `prisma/seed/biblioteca/estructura-*.ts` validados por `scripts/validar-biblioteca.ts`. La semilla actualiza lo no validado y enlaza peligros por `claveSemilla`.
- Trazabilidad de condiciones: panel "¿Por qué? → 9. Qué dato dispara cada condición" (solo las que aplican), marcas por trabajador (conduce, modalidad, turno nocturno, alimentos, alto riesgo) que alimentan el motor, campos de experiencia/rol/curso de 20 h del responsable, obligaciones legales periódicas en el planeador, POL-04 desconexión.
- Accidentes alineados con la Res. 1401/2007 (campos de los arts. 9-13, equipo por gravedad, formato FOR-07 reordenado, PRC-09 en 16 pasos). UI: login, sidebar, móvil, descripciones cortas, formularios largos en panel lateral con secciones.

- Barrido E2E completo con el plugin de Chrome (empresa nueva → diagnóstico → SG-SST → todos los módulos). Arreglos: fechas por defecto en hora local (antes en UTC daban el día siguiente después de las 7 p. m.); buscador de trabajadores registrados en el formulario de eventos; equipo investigador propuesto con documentos; sugerencias de investigación priorizan la matriz del cargo (pinchazo en clínica → riesgo biológico) y la forma “Corte o pinchazo” incluye causas y medidas de bioseguridad (la semilla solo agrega a las formas existentes); indicadores usan los trabajadores de la empresa en meses sin registro (marcados “estimado”); obligaciones legales periódicas solo desde el ingreso de la empresa a PROCESST; calificación rápida de la auditoría sin perder clics; fecha del último curso de 20 horas en Mi consultora.

- Verificación normativa por artefacto (docs/requisitos/): 57 artefactos y 486 requisitos contrastados con el texto oficial en 6 frentes; plantillas corregidas (citas, contenido faltante, afirmaciones sin sustento) y 3 nuevas: ACT-03 (capacitación COPASST/Vigía, 1.1.7), DOC-12 (indicadores mínimos del art. 30, 3.3.1-3.3.6) y FOR-09 (afiliación y pago de seguridad social, 1.1.4-1.1.5). 510 requisitos registrados en src/lib/requisitos/ con norma, artículo y sección; `npm run validar:requisitos` los comprueba. Panel "Sustento normativo" en cada documento (solo interfaz, no sale en Word/PDF) y botón "Ver" en Plantillas (vista de lectura con datos reales). Catálogo con 7 normas nuevas verificadas (73). Decisiones de la consultora: obligaciones del Decreto 1072 también para 7 y 21 estándares en versión simplificada, "no apto" solo en regímenes especiales, aviso de AT según Decreto 1072 con nota de la Res. 2851, auditoría anual para todas. Lógica corregida: puntaje de 7/21 sobre los ítems del nivel (la lectura del art. 27 que sumaba el máximo de los ítems que no le corresponden se revirtió porque daba "aceptable" sin cumplir nada), definición de incidente, festivos en plazos, muerte por AT/EL, cierre de investigación (art. 13), indicadores art. 30, tipos y conceptos de la Res. 1843. En cada despliegue se recalculan las empresas existentes (scripts/actualizar-empresas.ts). Lo que falta de código está en docs/requisitos/PENDIENTES-CODIGO.md.

- Cierre de la verificación normativa (docs/requisitos/PENDIENTES-CODIGO.md sin pendientes; DECISIONES.md con las 15 dudas resueltas por norma). PRC-06 completo frente al Decreto 1040/2026 (texto oficial). Requisitos condicionados por nivel, comité o disparador (`si`) y por norma aplicable: la empresa de prueba cubre 460/460. Accidentes: datos FURAT, expuestos, "dirigida a", muerte por EL, visitantes sin FURAT; indicadores del año y del anterior en FOR-08, DOC-12, DOC-05 y ACT-06. Comités: calidad separada del cargo, composición validada y congelada, elección del CCL, CCL por sede. Salud: vigencia de restricciones y adaptación en 20 días hábiles, exámenes no se borran, periodicidad por cargo. Evaluación: sin "No aplica" en nivel 60, no se cierra con pendientes, Excel completo. Auditoría: independencia y comunicación de resultados. Planeador: autoevaluación en diciembre, reportes a la ARL, julio, reentrenamiento de alturas a 18 meses. Matriz: seguimiento de medidas (4.2.2). Catálogo, estándares, listas de inspección y disparador serviciosSalud.

- Plazos y tareas automáticas: catálogo único (src/lib/plazos.ts) con los 29 plazos que el sistema programa solo (qué los genera, cuánto, desde cuándo, legal o criterio de la empresa, norma); todo el código lee de ahí. Pantalla Normas y estándares → Plazos y tareas automáticas (legales de solo lectura; los de la empresa se editan y se guardan en Consultora.parametros). Cada formulario que crea tareas lo avisa antes de guardar ("Al guardar se programa en el planeador", con fecha y norma) y confirma después con un mensaje: accidentes, exámenes, retiro, EPP, capacitación, acciones, comités, inspecciones, autoevaluación, matriz, auditoría y cursos del responsable. Días hábiles en src/lib/fechas.ts (festivos de Colombia).

- Ruta de implementación (src/lib/ruta.ts): 10 pasos en el orden del Decreto 1072 y la Res. 0312 (diagnóstico e inicio, datos, matriz, trabajadores, comités, documentos, plan anual, inducción/exámenes/EPP, operación, cierre del año) que se cumplen solos con los datos. Tarjeta en el Resumen con el siguiente paso, panel con la ruta completa, una línea en la pestaña del paso actual y columna "Ruta" en el tablero. Reemplaza los avisos de etapa y de datos faltantes del Resumen.

## Pendiente

- PDF directo (hoy: Word; PDF desde Word o imprimir).
- Correos de recordatorio y despliegue (Vercel + Neon). Recuperación de contraseña por correo.
- Validar con la consultora: textos de plantillas, valores ND/NE/NC de la biblioteca, umbral del CCL en la Res. 3461/2025.
- Calidad: pruebas automatizadas (fase siguiente).
