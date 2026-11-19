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
| H3 Empresas e intake | ✅ | Cuestionario de 7 pasos; CIIU sugiere clase de riesgo y sector; motor de reglas con fundamento por conclusión. |
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

## Pendiente

- PDF directo (hoy: Word; PDF desde Word o imprimir).
- Correos de recordatorio y despliegue (Vercel + Neon). Recuperación de contraseña por correo.
- Validar con la consultora: textos de plantillas, valores ND/NE/NC de la biblioteca, umbral del CCL en la Res. 3461/2025.
- Calidad: pruebas automatizadas (fase siguiente).
