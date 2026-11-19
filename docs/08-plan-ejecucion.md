# 08 · Plan de ejecución del MVP (para desarrollar con Opus)

> Modo de trabajo: **que funcione primero**. Sin pruebas automatizadas en esta fase. Cada hito termina con una verificación manual ("criterio de funciona"). Todo lo que el sistema genere debe poder rastrearse a una norma (ver `01`, `02`, `03`, `07`). Idioma de UI, datos y código de dominio: **español** (nombres de tablas y campos en español sin tildes, p. ej. `empresa`, `clase_riesgo`).

## 0. Decisiones cerradas

| Tema | Decisión |
|---|---|
| Uso | Herramienta interna para una consultora. Un solo tenant activo; la tabla `consultora` existe pero no hay UI multi-tenant. |
| Framework | Next.js (App Router) + TypeScript + Tailwind + shadcn/ui. Runtime Node.js (sin edge). |
| Base de datos | PostgreSQL en Neon (Vercel Marketplace) + **Prisma**. |
| Archivos | Vercel Blob privado (evidencias, logos, PDF/DOCX generados). |
| Auth | Clerk (Vercel Marketplace). Roles: `consultora` (todo) y `cliente` (solo lectura de su empresa; fase 2). |
| Plantillas | **Markdown + Handlebars** guardadas en BD, con variables, condicionales y bucles. Editor en línea. Exportación a **PDF** (HTML → Playwright/Chromium) y **DOCX** (`docx` npm a partir del AST de remark). |
| IA | AI SDK 7 vía Vercel AI Gateway, modelo `anthropic/claude-sonnet-5-5` para sugerencias y `anthropic/claude-opus-5-5` para redacción larga. Siempre con salida estructurada (schema) y estado `sugerido` hasta aprobación. |
| Hosting | Vercel (preview + production) + Neon. |
| Ediciones manuales | Cada documento se guarda por secciones; cada sección tiene `contenido_generado` y `contenido_editado` (nullable). Al regenerar se actualiza `contenido_generado`; si existe `contenido_editado` se conserva y se marca "revisar" cuando el generado cambió. |

## 1. Estructura del repositorio

```
processt/
  CLAUDE.md                      ← contexto para agentes
  docs/                          ← este plan y la base normativa
  prisma/schema.prisma
  prisma/seed/                   ← semillas: estandares.ts, normas.ts, reglas.ts, ciiu.ts, biblioteca/*.ts, plantillas/*.md
  src/app/                       ← rutas (App Router)
    (auth)/
    empresas/[id]/{resumen,intake,evaluacion,matriz,documentos,plan,comites}/
    biblioteca/{peligros,tareas,cargos,sectores}/
    plantillas/
    api/
  src/lib/
    reglas/        ← motor de aplicabilidad (nivel, ítems, documentos, normas)
    gtc45/         ← escalas y cálculo ND/NE/NP/NC/NR
    indicadores/   ← fórmulas Res. 0312 art. 30
    generador/     ← render Handlebars → Markdown → HTML/PDF/DOCX, ZIP, listado maestro
    ia/            ← prompts y schemas (sugerir tareas, peligros, redactar secciones)
  src/components/
```

## 2. Hitos

### H0 · Arranque del proyecto (medio día)

1. `npx create-next-app@latest . --ts --tailwind --app --src-dir --eslint --yes` en la carpeta `processt`. Inicializar git.
2. `npx shadcn@latest init` y añadir: button, input, select, table, dialog, form, tabs, card, badge, sheet, textarea, checkbox, dropdown-menu, command, toast.
3. Instalar: `prisma @prisma/client zod handlebars remark remark-parse remark-gfm unified docx playwright-core @sparticuz/chromium jszip date-fns ai @ai-sdk/react` + `@clerk/nextjs` + `@vercel/blob`.
4. `npm i -g vercel`, `vercel link`, provisionar Neon y Clerk desde el Marketplace (`vercel integration add`), `vercel env pull .env.local`.
5. Layout base: barra lateral con Empresas, Biblioteca, Plantillas, Calendario. Login con Clerk; todo detrás de login.
6. Deploy preview.

**Funciona si:** abre en Vercel, pide login, muestra el layout vacío.

### H1 · Modelo de datos (1 día)

Schema Prisma con estas entidades (campos detallados en `05` §3 y `07` §2):

- Núcleo: `consultora`, `usuario`, `empresa`, `sede`, `zona`, `proceso`, `cargo`, `tarea`, `cargo_tarea`.
- Normativo: `estandar` (60 filas), `norma`, `regla_aplicabilidad`, `ciiu_clase_riesgo`.
- Evaluación: `evaluacion`, `evaluacion_item`, `plan_mejoramiento_item`.
- Peligros: `sector_tipo`, `proceso_tipo`, `zona_tipo`, `cargo_tipo`, `tarea_tipo`, `peligro_catalogo`, `tarea_tipo_peligro`, `zona_tipo_peligro`, `cargo_tipo_peligro`, `cargo_tipo_tarea`, `peligro_evaluado`, `matriz_version`.
- Documentos: `plantilla` (codigo, nombre, tipo, nivel_min, estandares[], norma_base[], contenido_md, version, vigente_desde), `plantilla_seccion`, `documento`, `documento_seccion`, `documento_archivo`.
- Plan: `actividad_plan`, `evidencia`.
- Eventos: `evento` (AT, incidente, EL, ausentismo), `trabajadores_mes`.
- Comités: `comite`, `comite_miembro`, `acta`.

Campos obligatorios de `empresa`: razon_social, nit, digito_verificacion, direccion, ciudad, departamento, telefono, correo, representante_legal (nombre, cedula), ciiu, descripcion_actividad, clase_riesgo (1-5), arl, n_trabajadores_planta, n_contratistas, n_aprendices, n_en_mision, nivel_estandares (7|21|60, calculado), responsable_sst (nombre, cedula, licencia, curso_50h, fecha_curso), logo_url, fecha_inicio_sgsst.

**Funciona si:** `prisma migrate dev` corre y `prisma studio` muestra las tablas.

### H2 · Semillas normativas (1 día)

1. `estandares.ts`: los 60 ítems de `02` §2 con ciclo, grupo, subgrupo, codigo, descripcion, puntaje, aplica_7, aplica_21, y para cada uno el **modo de verificación** resumido del art. 16 de la Res. 0312 (qué evidencia pide el inspector).
2. `normas.ts`: catálogo de `01` §1-2 con: nombre, numero, año, entidad, tema, resumen, url_oficial, condicion_aplicabilidad (JSON: `siempre` | `trabajadores>=10` | `peligro:alturas` | `vehiculos>=10` | …), vigente_desde, derogada_por.
3. `reglas.ts`: reglas de `05` §M2 en JSON `{ si: {...}, entonces: { nivel?, items?: [], documentos?: [], normas?: [], comites?: [] }, norma_ref }`. Mínimo:
   - nivel 7 / 21 / 60 (Res. 0312 arts. 3, 9, 16; riesgo IV-V siempre 60; UPA aparte).
   - `trabajadores < 10` → Vigía; `>= 10` → COPASST con tamaño según Res. 2013/1986; `>= 10` → Reglamento de Higiene (art. 349 CST).
   - CCL para todas (Res. 3461/2025; confirmar umbral); protocolo acoso sexual (Ley 2365/2024).
   - `alturas` → PRG-08 + Res. 4272/2021; `confinados` → Res. 0491/2020; `quimicos` → MTZ-03 + Decreto 1496/2018; `vehiculos >= 10` → PESV; `ruido` → Res. 8321/1983 + PVE auditivo; `> 50 trabajadores` → batería psicosocial Res. 2764/2022; siempre → Decreto 728/2025 programa salud mental/SPA.
4. `ciiu.ts`: tabla CIIU rev. 4 A.C. → clase de riesgo según Decreto 1607/2002. Empezar con las divisiones (2 dígitos) más frecuentes y permitir override manual; completar después.
5. Semilla de `plantilla` con los archivos `prisma/seed/plantillas/*.md` (ver H6 y Anexo A).

**Funciona si:** `prisma db seed` carga 60 estándares, ≥ 25 normas, ≥ 12 reglas, y en la UI `/biblioteca/normas` se listan.

### H3 · Empresas e intake (2 días)

1. Lista de empresas + botón "Nueva empresa".
2. Wizard de 7 pasos (`05` §M1). Paso 2: buscador de CIIU que sugiere clase de riesgo; editable con justificación. Paso 3: cargos con n.º de personas y sede/zona; paso 4: procesos (propuestos desde `sector_tipo`); paso 5: checklist de disparadores; paso 6: estado actual (sí/no por ítem clave); paso 7: responsable SST + datos de la consultora (licencia).
3. Al guardar, `lib/reglas` calcula y persiste: `nivel_estandares`, ítems aplicables, documentos a generar, normas aplicables (→ matriz legal), comités requeridos. Mostrar en `/empresas/[id]/resumen` con la referencia normativa de cada conclusión ("Nivel 21 por Res. 0312 art. 9").
4. Validación del perfil del responsable contra arts. 4/10/17 de la Res. 0312: mostrar advertencia si no cumple.

**Funciona si:** una empresa de 15 trabajadores riesgo II queda en nivel 21 con 21 ítems, COPASST, CCL, Reglamento de Higiene y ~30 documentos; una de 8 trabajadores riesgo I queda en nivel 7 con Vigía.

### H4 · Evaluación inicial y autoevaluación (1,5 días)

1. Pantalla checklist por ciclo/grupo, filtrada por nivel, con estado cumple / no cumple / no aplica (justificación obligatoria), observación, evidencia opcional. Precargar desde el paso 6 del intake.
2. Cálculo: puntaje bruto (sobre 100) y ajustado (sobre ítems aplicables), valoración según art. 28 (crítico / moderadamente aceptable / aceptable) y la acción obligatoria asociada.
3. Generar `plan_mejoramiento_item` por cada "no cumple": actividad sugerida (del estándar), responsable, plazo (3 meses si crítico, 6 si moderado), recursos, soporte esperado.
4. Histórico por año; tipo `inicial` o `anual`.
5. Exportar PDF del informe y XLSX con el formato de la Tabla de Valores (para la plataforma del Fondo de Riesgos Laborales).

**Funciona si:** marcar 12 de 21 ítems da puntaje, valoración y 9 renglones de plan de mejoramiento, y el PDF sale con la referencia a los arts. 27-28.

### H5 · Biblioteca y matriz de peligros GTC 45 (3 días)

1. CRUD de biblioteca: `peligro_catalogo` (con clasificación GTC 45, efectos, ND/NE/NC por defecto, controles, EPP, exámenes, capacitaciones, normas, PVE), `tarea_tipo`, `cargo_tipo`, `zona_tipo`, `sector_tipo`, y sus relaciones. Campo `validado` (bool) en cada registro.
2. Semilla de biblioteca: 6 sectores (oficinas/servicios, comercio, restaurantes, construcción pequeña, manufactura ligera, transporte), ~40 cargos tipo, ~120 tareas tipo, ~80 peligros. Generar la semilla con IA siguiendo la clasificación y ejemplos de la GTC 45 y marcarla `validado=false`.
3. En la empresa: pantalla `matriz` con tabla editable (TanStack Table). Flujo: botón "Proponer desde el sector" → crea procesos/zonas/cargos/tareas tipo; por cargo, textarea "funciones" + botón "Sugerir con IA" → `lib/ia/sugerirTareasYPeligros` devuelve JSON (tareas, proceso, zona, rutinaria, peligros con ND/NE/NC y controles) → filas en estado `sugerido`.
4. Cálculo `lib/gtc45`: NP, NR, interpretación, aceptabilidad, expuestos (según origen tarea/zona/cargo).
5. Aprobar filas; al aprobar un peligro/tarea "nuevo", ofrecer "guardar en biblioteca".
6. Versionar la matriz (`matriz_version`) con fecha y motivo (inicial, anual, gestión del cambio).
7. Derivados (solo datos, los documentos se generan en H6): peligros por cargo → profesiograma; EPP por cargo; temas de capacitación; tareas de alto riesgo → procedimientos; normas por peligro → matriz legal; NR I-II → prioridades.
8. Exportar XLSX con las columnas exactas de la GTC 45 (`07` §1).

**Funciona si:** para "auxiliar de bodega: recibe mercancía, sube cajas a estantes con escalera, maneja montacargas" la IA propone ≥ 3 tareas y ≥ 6 peligros con clasificación GTC 45 correcta; al aprobar, el XLSX muestra expuestos = n.º de personas del cargo y NR calculado.

### H6 · Plantillas y generador de documentos (3 días)

1. Motor: `lib/generador/render(plantilla, contexto)` con Handlebars (helpers: `fecha`, `mayusculas`, `lista`, `tabla`, `si_nivel`). Contexto = empresa + cargos + matriz + normas + comités + consultora + fecha.
2. Plantillas en `prisma/seed/plantillas/` (ver Anexo A): escribir las ~30 del nivel 21 (cubren también el nivel 7). Cada plantilla con front matter: `codigo, nombre, tipo, nivel_min, estandares, normas, secciones`.
3. Generación: botón "Generar todos los documentos aplicables" → crea `documento` + `documento_seccion` por plantilla aplicable; botón por documento para regenerar; listado maestro automático (código, nombre, versión, fecha, estado).
4. Editor en línea (Markdown con vista previa) por sección; marca "editado" y "revisar" según la regla de §0.
5. Exportar: PDF (encabezado con logo, código, versión, fecha, pie "Elaboró: consultora + licencia / Aprobó: representante legal") y DOCX. Botón ZIP ordenado por carpeta de estándar (`1. Recursos/`, `2. Gestión integral/` …).
6. Estados: borrador → aprobado → firmado (adjuntar PDF firmado).

**Funciona si:** una empresa nivel 21 recibe un ZIP con ~30 documentos sin ningún marcador `{{` sin resolver, con NIT y razón social correctos en todos, y la política cita Decreto 1072 arts. 2.2.4.6.5-7.

### H7 · Plan anual y calendario (1,5 días)

1. Generar `actividad_plan` del año desde: nivel (actividades mínimas por ítem), prioridades de la matriz (NR I-II), plan de mejoramiento, comités (reunión mensual COPASST/CCL), obligaciones periódicas de `01` §3 (exámenes, simulacro, batería, autoevaluación en diciembre, registro en julio, revisión por la dirección, auditoría, rendición de cuentas).
2. Vista mensual y tabla; estado pendiente/ejecutada/vencida; % de ejecución.
3. Documento PLN-01 se genera desde estas actividades (H6).
4. Recordatorios por correo (Resend) con cron diario: vencimientos a 7 días.

**Funciona si:** el plan de una empresa nivel 21 tiene actividades en los 12 meses, incluye "Autoevaluación de estándares mínimos" en diciembre y "Registro en plataforma FRL" en julio, y el PLN-01 las lista.

### H8 · Tablero y comités (1 día)

1. Resumen de empresa: nivel, puntaje de última evaluación, % plan anual, documentos por estado, próximas 10 actividades, alertas (periodo de COPASST vence, matriz con más de 12 meses, responsable sin curso 50 h).
2. Comités: conformación (integrantes, periodo 2 años), actas desde plantilla ACT-02/ACT-04 con agenda estándar, compromisos.
3. Tablero global de la consultora: todas las empresas con semáforo.

### Fase 2 (después del MVP)
Evidencias móviles, eventos e indicadores (art. 30), portal del cliente, nivel 60 completo (auditoría, revisión por la dirección, PVE), firma electrónica, lectura con IA de carpetas existentes.

## 3. Orden de ejecución y estimación

H0 → H1 → H2 → H3 → H4 → H6 (con 10 plantillas) → H5 → H6 (resto de plantillas, derivados de la matriz) → H7 → H8. Total aproximado: 14-16 días de trabajo de agente con revisión humana al final de cada hito.

Regla para el agente: al terminar cada hito, hacer commit, desplegar preview y escribir en `docs/avance.md` qué quedó y qué falta.

---

## Anexo A · Especificación de plantillas del nivel 21 (contenido mínimo y norma)

Variables disponibles en todas: `empresa.*`, `consultora.*`, `fecha`, `anio`, `cargos[]`, `sedes[]`, `nivel`, `estandares_aplicables[]`, `normas_aplicables[]`, `comites`, `matriz.*`.

| Código | Secciones mínimas | Norma que lo define |
|---|---|---|
| POL-01 Política de SST | 1 Compromiso de la alta dirección; 2 Alcance (todos los centros y trabajadores, contratistas); 3 Objetivos (identificar peligros/controlar riesgos; proteger seguridad y salud mediante mejora continua; cumplir normativa); 4 Compromiso con recursos y participación; 5 Firma rep. legal, fecha, "revisión anual" | D.1072 arts. 2.2.4.6.5, .6, .7 |
| POL-02 Política de prevención de alcohol, tabaco, SPA y promoción de salud mental | compromiso, prohibiciones, medidas, confidencialidad, firma | Res. 1075/1992, Decreto 728/2025, Ley 2460/2025 |
| POL-03 Política de prevención del acoso laboral y convivencia | compromiso, definición de acoso (Ley 1010), canales, CCL, no represalias | Ley 1010/2006, Res. 3461/2025 |
| DOC-01 Objetivos e indicadores | tabla objetivo → indicador → meta → fórmula → fuente → periodicidad → responsable; fichas técnicas (7 campos) | D.1072 arts. 2.2.4.6.18, .19 |
| DOC-02 Roles y responsabilidades + rendición de cuentas | por rol (alta dirección, responsable SG-SST, jefes, trabajadores, COPASST/Vigía, CCL, brigada, contratistas); mecanismo anual de rendición | D.1072 art. 2.2.4.6.8 nums. 2-3, 2.2.4.6.10 |
| DOC-03 Designación del responsable del SG-SST | datos, perfil, licencia, curso 50 h, funciones (planear, organizar, dirigir, desarrollar, evaluar anualmente, informar a la dirección) | D.1072 art. 2.2.4.6.8 num. 10; Res. 0312 arts. 4/10/17 |
| DOC-04 Asignación de recursos / presupuesto | tabla de rubros por actividad del plan anual, firmado | D.1072 art. 2.2.4.6.8 num. 4; Res. 0312 ítem 1.1.3 |
| DOC-05 Evaluación inicial | 8 aspectos del art. 2.2.4.6.16 + Tabla de Valores + resultado + prioridades | D.1072 art. 2.2.4.6.16; Res. 0312 arts. 27-28 |
| PLN-01 Plan anual de trabajo | objetivos, metas, actividades (tabla mensual), responsables, recursos, firmas empleador y responsable | D.1072 art. 2.2.4.6.17 par. 2; Res. 0312 ítem 2.4.1 |
| PLN-02 Plan de mejoramiento | tabla ítem no cumplido → actividad → responsable → plazo → recursos → soporte | Res. 0312 art. 28 |
| MTZ-01 Matriz legal | tabla norma → entidad → año → artículos aplicables → evidencia de cumplimiento → estado | D.1072 art. 2.2.4.6.8 par.; Res. 0312 ítem 2.7.1 |
| PRC-01 Control de documentos y retención | codificación, versiones, listado maestro, tabla de retención (20 años para los 5 tipos del art. 2.2.4.6.13) | D.1072 arts. 2.2.4.6.12, .13 |
| DOC-06 Reglamento de Higiene y Seguridad Industrial | identificación, obligación de cumplir, riesgos por clasificación de la matriz, obligaciones, publicación | Art. 349 CST, Res. 2400/1979, Ley 9/1979 |
| PRG-01 Programa de capacitación + inducción | objetivos, responsables, cronograma temático (temas derivados de la matriz + obligatorios: política, peligros, emergencias, autorreporte, EPP), inducción/reinducción, evaluación, registros | D.1072 art. 2.2.4.6.11; Res. 0312 ítems 1.2.1, 1.2.2 |
| ACT-01 Convocatoria, elección y acta de conformación COPASST / designación de Vigía | convocatoria, candidatos, votación, acta, periodo 2 años, funciones (Res. 2013 art. 11) | Res. 2013/1986; D.1072 art. 2.2.4.6.2 |
| ACT-02 Acta de reunión COPASST | agenda estándar: verificación de compromisos, inspecciones, AT/EL del mes, capacitaciones, propuestas | Res. 2013/1986 (mensual) |
| ACT-04 Conformación y reglamento del CCL + procedimiento de quejas | elección, integrantes, reuniones mensuales, procedimiento ≤ 65 días, confidencialidad, exclusión de acoso sexual | Res. 3461/2025 |
| PRC-06 Protocolo de prevención y atención del acoso sexual | definiciones, canal, debido proceso, medidas | Ley 2365/2024 |
| FOR-01 Encuesta de perfil sociodemográfico + informe de condiciones de salud | variables mínimas (edad, sexo, escolaridad, estado civil, personas a cargo, antigüedad, cargo, hábitos, morbilidad sentida); informe con tablas | D.1072 art. 2.2.4.6.12 num. 4, 2.2.4.6.16 num. 7 |
| PRG-02 Programa de medicina preventiva y del trabajo (PyP) | objetivos, actividades según diagnóstico, exámenes, PVE, estilos de vida, indicadores | D.1072 art. 2.2.4.6.8 num. 8; Res. 0312 ítem 3.1.2 |
| DOC-07 Profesiograma | por cargo: peligros, exámenes de ingreso/periódico/retiro, periodicidad, énfasis | Res. 1843/2025 |
| PRC-07 Procedimiento de evaluaciones médicas ocupacionales | tipos, periodicidad (≤ 3 años), flujo, concepto de aptitud, custodia, confidencialidad, prohibiciones (embarazo/VIH), costo a cargo del empleador | Res. 1843/2025 |
| FOR-02 Seguimiento a restricciones y recomendaciones médicas | tabla trabajador → recomendación → fecha → acciones → seguimiento | Res. 0312 ítem 3.1.6 |
| PRC-08 Reporte de AT y EL | definición de AT (Ley 1562 art. 3), flujo FURAT/FUREL en 2 días hábiles, responsables | D.1072; Res. 0312 ítem 3.2.1 |
| PRC-09 Investigación de incidentes, AT y EL + formato | equipo (jefe inmediato, COPASST/Vigía, responsable SG-SST), plazo 15 días para graves/mortales, metodología de causas, lecciones aprendidas | Res. 1401/2007; D.1072 art. 2.2.4.6.32 |
| PRC-10 Metodología de identificación de peligros | GTC 45 con escalas, participación, actualización anual y por cambios | D.1072 art. 2.2.4.6.15; Res. 0312 ítem 4.1.1 |
| MTZ-02 Matriz de peligros | columnas GTC 45 (exporta de H5) | GTC 45 |
| PRG-07 Programa de mantenimiento + hoja de vida de equipos | inventario, periodicidad, responsables | Res. 0312 ítem 4.2.5; Res. 2400/1979 |
| MTZ-04 Matriz de EPP + formato de entrega | por cargo: EPP, norma técnica, reposición; formato de entrega con firma | Res. 0312 ítem 4.2.6; Res. 2400/1979 arts. 176-201; Ley 9/1979 |
| PLN-04 Plan de prevención, preparación y respuesta ante emergencias | 13 puntos del art. 2.2.4.6.25: amenazas, recursos, vulnerabilidad, riesgo, procedimientos operativos normalizados, plan de evacuación (planos/rutas), capacitación, simulacro anual, brigada, inspección de equipos, ayuda mutua | D.1072 art. 2.2.4.6.25; Decreto 2157/2017 |
| ACT-05 Conformación de brigada | integrantes, funciones, capacitación, dotación | D.1072 art. 2.2.4.6.25 num. 11 |
| ACT-06 Acta de revisión por la alta dirección | 24 puntos del art. 2.2.4.6.31 como agenda; conclusiones; acciones | D.1072 art. 2.2.4.6.31 |
| FOR-06 Acciones correctivas, preventivas y de mejora | fuente, causa raíz, acción, responsable, fecha, verificación de eficacia | D.1072 arts. 2.2.4.6.33, .34 |
| PRG-03 Programa de salud mental y prevención de SPA | sensibilización, prevención, intervención, articulación con ARL/EPS, registros anuales | Decreto 728/2025; Ley 2460/2025 |

Plantillas adicionales del nivel 60 (fase 2): DOC-08, FOR-03, PRC-02 a PRC-05, PRG-04/05/06/08/09/10, MTZ-03, PLN-03, DOC-10, DOC-11.

## Anexo B · Reglas de aplicabilidad (formato)

```json
{
  "id": "nivel-21",
  "si": { "trabajadores": { "min": 11, "max": 50 }, "clase_riesgo": { "in": [1, 2, 3] } },
  "entonces": { "nivel": 21 },
  "norma_ref": "Res. 0312/2019 art. 9"
}
{
  "id": "alturas",
  "si": { "disparador": "alturas" },
  "entonces": { "documentos": ["PRG-08", "FOR-PERMISO-ALTURAS"], "normas": ["RES-4272-2021"], "capacitaciones": ["Trabajo seguro en alturas"] },
  "norma_ref": "Res. 4272/2021"
}
```

El motor evalúa todas las reglas y acumula efectos; cada conclusión guarda `norma_ref` para mostrarla en la UI.

## Anexo C · Contratos de IA

`sugerirTareasYPeligros({ cargo, funciones_texto, sector, biblioteca_resumen })` → schema:
```ts
{ tareas: [{ nombre, proceso, zona, rutinaria: boolean, alto_riesgo: 'alturas'|'confinado'|'electrico'|'izaje'|'caliente'|null,
  de_biblioteca: boolean, tarea_tipo_id?: string,
  peligros: [{ clasificacion: 'Biologico'|'Fisico'|'Quimico'|'Psicosocial'|'Biomecanico'|'Condiciones de seguridad'|'Fenomenos naturales',
    descripcion, efectos_posibles, nd: 0|2|6|10, ne: 1|2|3|4, nc: 10|25|60|100,
    controles_existentes: { fuente, medio, individuo }, medidas: { eliminacion, sustitucion, ingenieria, administrativos, epp },
    de_biblioteca: boolean, peligro_id?: string }] }] }
```
Instrucciones del prompt: usar exclusivamente la clasificación y escalas de la GTC 45; preferir ítems de la biblioteca; no inventar normas; cuando cite una norma, elegirla del catálogo `norma` recibido en contexto.

`redactarSeccion({ plantilla_codigo, seccion, contexto_empresa, norma_base })` → Markdown. Instrucciones: tono formal, tercera persona, citar solo las normas del contexto, no inventar cifras, usar los datos de la empresa tal como vienen.
