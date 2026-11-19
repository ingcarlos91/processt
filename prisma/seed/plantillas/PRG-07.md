---
codigo: PRG-07
nombre: Programa de mantenimiento preventivo y correctivo
tipo: PRG
nivelMin: 21
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.5"]
normas: ["RES-2400-1979","RES-0312-2019"]
---
## Objetivo

Garantizar el mantenimiento periódico de instalaciones, equipos, máquinas y herramientas de **{{empresa.razonSocial}}**, de acuerdo con los manuales de uso y los informes de inspecciones (Resolución 0312 de 2019, estándar 4.2.5).

## Inventario y cronograma

| Equipo / instalación | Ubicación | Tipo de mantenimiento | Frecuencia | Responsable (interno / proveedor) | Próxima fecha |
|---|---|---|---|---|---|
{{#if op.equipos.length}}
{{#each op.equipos}}
| {{celda equipo}} | {{celda ubicacion}} | {{tipo}} | {{frecuencia}} | {{celda responsable}} | {{proxima}} |
{{/each}}
{{else}}
| Instalaciones eléctricas | | Preventivo | Anual | | |
| Extintores (recarga) | | Preventivo | Anual | Proveedor certificado | |
| Equipos de cómputo | | Preventivo | Semestral | | |
| Aire acondicionado / ventilación | | Preventivo | Semestral | | |
{{/if}}
{{#if dis.maquinaria}}| Máquinas de producción (completar inventario) | | Preventivo | Según fabricante | | |
{{/if}}{{#if dis.conduccion}}| Vehículos (completar inventario) | | Preventivo | Según kilometraje | | |
{{/if}}{{#if dis.izaje}}| Montacargas / equipos de izaje (completar inventario) | | Preventivo y certificación | Según fabricante | | |
{{/if}}

## Hoja de vida de equipos

| Campo | |
|---|---|
| Equipo | |
| Marca / modelo / serie | |
| Ubicación | |
| Fecha de adquisición | |
| Manual del fabricante disponible | ☐ Sí ☐ No |

| Fecha | Tipo de mantenimiento | Descripción | Realizó | Próximo |
|---|---|---|---|---|
| | | | | |
