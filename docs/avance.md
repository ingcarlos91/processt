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
npm run dev                 # http://localhost:3000
```

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
| UI | ✅ | 100 % shadcn (base-nova): sidebar-07, Card, Table, Field, NativeSelect, Dialog, Empty, Alert. Marca PROCESST. Fuente BW Modelica declarada (faltan los archivos). |

## Agregado después

- Explicaciones “¿Por qué?”: ícono ⓘ en cada decisión y panel lateral con todas las decisiones de la empresa.
- Peligros especiales detectados desde la matriz (no solo desde el cuestionario), con alerta.
- Datos de la profesional en “Mi consultora”: se precargan como responsable del SG-SST y firman como “Elaboró”.
- Logo por empresa (PNG/JPG, 2 MB) en el encabezado de Word y Excel; se guarda en `uploads/logos/` (fuera de git).

## Pendiente

- Archivos de la fuente BW Modelica en `public/fonts/bw-modelica/`.
- PDF directo (hoy: Word; PDF desde Word o imprimir).
- Correos de recordatorio, autenticación y despliegue (Vercel + Neon + Clerk).
- Validar con la consultora: textos de plantillas, valores ND/NE/NC de la biblioteca, umbral del CCL en la Res. 3461/2025.
- Calidad: pruebas automatizadas (fase siguiente).
