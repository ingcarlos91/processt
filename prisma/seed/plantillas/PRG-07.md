---
codigo: PRG-07
nombre: Programa de mantenimiento preventivo y correctivo
tipo: PRG
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.5"]
normas: ["DEC-1072-2015","RES-0312-2019","RES-2400-1979","RES-4272-2021","LEY-1503-2011","RES-40595-2022"]
---
## Objetivo

Garantizar el mantenimiento periódico de instalaciones, equipos, máquinas y herramientas de **{{empresa.razonSocial}}**, de acuerdo con los manuales de uso de los fabricantes, las fichas técnicas, los informes de inspecciones y los reportes de condiciones inseguras (Decreto 1072 de 2015, art. 2.2.4.6.24 parágrafo 2{{#if (gte empresa.nivel 21)}}; Resolución 0312 de 2019, estándar 4.2.5{{/if}}).

{{#if (eq empresa.nivel 7)}}Para una empresa de 7 estándares, este programa es la versión simplificada: el mantenimiento según los informes de inspección y los manuales del fabricante es obligación del Decreto 1072 para todo empleador.{{/if}}

## Inventario y cronograma

Las frecuencias se toman del manual del fabricante; a falta de él, la empresa las define según el uso.

| Equipo / instalación | Ubicación | Tipo de mantenimiento | Frecuencia | Responsable (interno / proveedor) | Próxima fecha |
|---|---|---|---|---|---|
{{#if op.equipos.length}}
{{#each op.equipos}}
| {{celda equipo}} | {{celda ubicacion}} | {{tipo}} | {{frecuencia}} | {{celda responsable}} | {{proxima}} |
{{/each}}
{{else}}
| Instalaciones eléctricas | | Preventivo | Anual | Personal calificado | |
| Extintores (recarga) | | Preventivo | Según el fabricante y la norma técnica (usualmente anual) | Proveedor | |
| Equipos de cómputo | | Preventivo | Semestral | | |
| Aire acondicionado / ventilación | | Preventivo | Semestral | | |
{{#if dis.maquinaria}}| Máquinas de producción (completar inventario) | | Preventivo | Según fabricante | | |
{{/if}}{{#if (or dis.conduccion empresa.vehiculos)}}| Vehículos (completar inventario) | | Preventivo | Según fabricante y kilometraje | | |
{{/if}}{{#if dis.izaje}}| Montacargas / equipos de izaje (completar inventario) | | Preventivo y certificación | Según fabricante | | |
{{/if}}{{#if dis.alturas}}| Escaleras, andamios y elevadores de personas (completar inventario) | | Preventivo según fabricante, registrado en la hoja de vida | Según fabricante | Fabricante o persona avalada | |
{{/if}}{{/if}}

{{#if pesv.aplica}}El mantenimiento de vehículos hace parte del PESV e incluye los vehículos de los trabajadores puestos al servicio de la empresa (Ley 1503 de 2011, art. 12 numeral 4; Resolución 40595 de 2022, paso 17).{{/if}}

## Mantenimiento correctivo

Todo reporte de condición insegura, hallazgo de inspección (PRG-06) o falla genera una orden de mantenimiento correctivo:

| Fecha del reporte | Origen (inspección / reporte / falla) | Equipo o instalación | Daño | Acción | Responsable | Fecha de cierre |
|---|---|---|---|---|---|---|
| | | | | | | |

Mientras no se corrija, el equipo con daño que represente peligro se retira de servicio y se señaliza.

## Hoja de vida de equipos

| Campo | Información |
|---|---|
| Equipo | |
| Marca / modelo / serie | |
| Ubicación | |
| Fecha de fabricación y de adquisición | |
| Vida útil según el fabricante | |
| Manual del fabricante y ficha técnica disponibles | ☐ Sí ☐ No |
| Certificación del fabricante (cuando aplique) | |

| Fecha | Tipo (preventivo / correctivo / inspección) | Descripción | Realizó | Próximo |
|---|---|---|---|---|
| | | | | |

{{#if dis.alturas}}Para escaleras, andamios y elevadores de personas la hoja de vida registra como mínimo marca, serial, fecha de fabricación, vida útil, historial de uso, registros de inspección y de mantenimiento, ficha técnica, certificación del fabricante y observaciones; el mantenimiento sigue las especificaciones del fabricante (Resolución 4272 de 2021, art. 16 numerales 10 y 11).{{/if}}
