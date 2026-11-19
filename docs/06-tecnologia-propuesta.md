# 06 · Tecnología (propuesta preliminar, para discutir)

El paso 2 es construir. Antes de decidir, esto es lo que recomiendo y por qué. Es una propuesta; se decide en conversación.

## Recomendación

| Capa | Opción recomendada | Por qué |
|---|---|---|
| App web | **Next.js (App Router) + TypeScript** | Una sola base de código para UI, API y generación de documentos; despliegue simple en Vercel; buen ecosistema de componentes (shadcn/ui) para formularios largos y tablas tipo hoja de cálculo. |
| Base de datos | **PostgreSQL** (Neon vía Vercel Marketplace) + **Prisma** o Drizzle | Modelo relacional claro (empresa → cargos → peligros → documentos); JSONB para reglas y plantillas; backups. |
| Archivos | **Vercel Blob** (privado) | Evidencias, PDFs, logos. Retención larga. |
| Autenticación | Clerk o Auth.js | Multi-tenant (consultora → clientes), roles. |
| Generación DOCX | **docx-templates** o **docxtemplater** (plantillas .docx con marcadores) | La consultora puede seguir editando plantillas en Word, que es lo que conoce. Alternativa: Markdown/HTML → PDF con Playwright para versiones no editables. |
| PDF | Conversión desde DOCX (LibreOffice en un contenedor o servicio) o HTML → PDF | Para entregar al cliente/Ministerio. |
| Matriz de peligros (UI) | Tabla editable (TanStack Table) con exportación a XLSX (SheetJS/exceljs) | La ARL y el Ministerio están acostumbrados al Excel. |
| Tareas programadas | Cron de Vercel / Workflow | Recordatorios de calendario, cierre mensual de indicadores. |
| Correo/WhatsApp | Resend (correo); WhatsApp Business API en fase 2 | Alertas. |
| IA (fase 3) | AI SDK con modelo Claude vía AI Gateway | Sugerencias de peligros, redacción de secciones. |

## Alternativa más simple para validar rápido

Si queremos probar en 2-3 semanas con la esposa: una app Next.js con un formulario de intake, el motor de reglas en un JSON, y un script que llena 10 plantillas DOCX reales de ella y entrega un ZIP. Sin login, sin portal. Si eso le ahorra días, se construye lo demás.

## Lo que NO conviene

- No empezar con Excel + macros: no escala a multi-cliente ni a calendario/evidencias.
- No empezar por el portal del cliente ni por la app móvil: el valor inicial está en la consultora.
- No meter IA generativa para redactar documentos legales completos: riesgo de inventar normas. Se usa para sugerir, no para decidir.

## Decisiones tomadas (19 nov 2026)

1. **Uso interno**: herramienta para la consultora, no para vender por ahora. Una sola consultora; sin facturación ni marca blanca. Se deja la tabla `Consultora` para no cerrar la puerta, pero sin UI de multi-tenant.
2. **Stack aceptado**: Next.js + PostgreSQL + Vercel Blob + docxtemplater, como se propone arriba.
3. **Principio de generación**: el sistema genera la mayoría del contenido; todo es editable; las ediciones manuales se preservan al regenerar.
4. **IA como copiloto**: sugiere tareas, peligros, controles y redacción de secciones; alimenta la biblioteca (`07-modelo-matriz-riesgos.md`); nunca aprueba sola ni decide aplicabilidad legal.

## Decisiones pendientes

1. ¿Plantillas en Word (docxtemplater) o en Markdown? Word es lo que ella domina; Markdown es más fácil de versionar y de editar en línea. Propuesta: Markdown interno con exportación a DOCX/PDF, y editor en línea; ella no toca Word salvo para plantillas especiales.
2. ¿Qué ARL dominan entre sus clientes? Para calcar el formato de sus plantillas.
3. Hosting: Vercel + Neon (rápido) frente a un VPS. Para uso interno, Vercel + Neon en plan gratuito/hobby basta para empezar.
