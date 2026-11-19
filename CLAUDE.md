# processt — SG-SST para una consultora en Colombia

Herramienta interna para una consultora de Seguridad y Salud en el Trabajo: registra empresas cliente y genera y gestiona su SG-SST completo (Decreto 1072/2015 cap. 6, Resolución 0312/2019).

## Lee primero
- `docs/08-plan-ejecucion.md` — el plan por hitos. Ejecuta en orden H0 → H8.
- `docs/01` a `docs/03` — base normativa, 60 estándares, inventario de documentos.
- `docs/05` y `docs/07` — diseño de módulos y modelo de la matriz de peligros (GTC 45).
- `docs/avance.md` — qué quedó hecho (crear y actualizar al cerrar cada hito).

## Reglas de trabajo
- Fase actual: **que funcione**. No escribir pruebas automatizadas todavía. Verificar manualmente con el "criterio de funciona" de cada hito.
- Todo lo que el sistema concluya o genere debe citar la norma que lo define (campo `norma_ref` en reglas, `normas` en plantillas). No inventar normas ni artículos: usar solo el catálogo `norma` sembrado desde `docs/01`.
- Normas que reemplazan a otras y que las plantillas deben citar correctamente: Res. 1843/2025 (exámenes médicos, no la 2346/2007), Res. 3461/2025 (Comité de Convivencia, no la 652/2012), Decreto 728/2025 y Ley 2460/2025 (salud mental).
- El sistema genera la mayoría del contenido; todo es editable; las ediciones manuales por sección se conservan al regenerar.
- IA (AI SDK 7 vía AI Gateway) solo propone con salida estructurada; nada pasa a estado aprobado sin acción de la consultora.
- Idioma: UI, datos de dominio, nombres de tablas y campos en español sin tildes. Código técnico (variables internas, utilidades) puede ser en inglés.
- Stack: Next.js App Router + TypeScript + Tailwind + shadcn/ui, Prisma + Neon (Postgres), Clerk, Vercel Blob, Handlebars + remark, `docx`, Playwright para PDF. Runtime Node.js, sin edge.
- Datos de salud de trabajadores son dato sensible (Ley 1581/2012): guardar solo conceptos de aptitud, nunca diagnósticos.
- Al cerrar un hito: commit, deploy preview, actualizar `docs/avance.md`.
