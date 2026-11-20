---
codigo: PRG-06
nombre: Programa de inspecciones de seguridad
tipo: PRG
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.4","3.1.8","3.1.9"]
normas: ["DEC-1072-2015","RES-0312-2019","RES-2400-1979","RES-4272-2021","RES-0491-2020","RES-40595-2022"]
---
## Objetivo

Identificar de manera sistemática condiciones y actos inseguros en instalaciones, máquinas, equipos, herramientas y equipos de emergencia de **{{empresa.razonSocial}}**, con la participación del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}}, para corregirlos y alimentar el mantenimiento (Decreto 1072 de 2015, art. 2.2.4.6.24 parágrafo 2 y art. 2.2.4.6.25 numeral 12{{#if (gte empresa.nivel 60)}}; Resolución 0312 de 2019, estándar 4.2.4{{/if}}).

{{#unless (gte empresa.nivel 60)}}Para una empresa de {{empresa.nivel}} estándares, este programa es la versión simplificada: la inspección de los equipos de emergencia y el mantenimiento según los informes de inspección son obligaciones del Decreto 1072 para todo empleador.{{/unless}}

## Cronograma de inspecciones

Las frecuencias las define la empresa dentro del SG-SST (la norma deja la periodicidad al sistema de gestión, art. 2.2.4.6.25 numeral 12).

| Inspección | Frecuencia | Responsable |
|---|---|---|
| Locativa general (pisos, escaleras, iluminación, orden y aseo) | Trimestral | {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}} + responsable SG-SST |
| Extintores | Mensual | Brigada |
| Botiquín y elementos de primeros auxilios | Mensual | Brigada |
| Alarma y sistemas de alerta (prueba de funcionamiento) | Mensual | Brigada |
| Señalización de evacuación e iluminación de emergencia | Trimestral | Brigada |
| Elementos de protección personal | Trimestral | Jefes de área |
| Instalaciones eléctricas | Semestral | Responsable SG-SST |
| Saneamiento básico (agua, baños, residuos) | Trimestral | Responsable SG-SST |
{{#if dis.maquinaria}}| Máquinas y equipos | Mensual | Jefe de producción / mantenimiento |
{{/if}}{{#if dis.alturas}}| Equipos y sistemas de protección contra caídas (Res. 4272/2021 art. 61 lit. g) | Antes de cada uso y al menos una vez al año, o con la periodicidad del fabricante | Coordinador de alturas |
| Sistemas de acceso: escaleras y andamios (Res. 4272/2021 art. 16 num. 2) | Antes de cada uso y según el fabricante | Coordinador de alturas |
| Elevadores de personas (Res. 4272/2021 art. 16 num. 3) | Al menos anual, por persona avalada por el fabricante o calificada | Proveedor |
{{/if}}{{#if dis.confinados}}| Detectores de gases: prueba funcional con gas patrón certificado (Res. 0491/2020 art. 7 num. 14-16) | Antes de cada uso | Supervisor de espacios confinados |
| Equipos de rescate y ventilación para espacios confinados (Res. 0491/2020 art. 27 num. 5) | Antes de cada intervención | Supervisor de espacios confinados |
{{/if}}{{#if dis.quimicos}}| Almacenamiento de sustancias químicas | Mensual | Responsable SG-SST |
{{/if}}{{#if (or dis.conduccion empresa.vehiculos)}}| Vehículos (inspección preoperacional) | Antes de cada uso | Conductor |
{{/if}}| Herramientas manuales | Trimestral | Jefes de área |

{{#if pesv.aplica}}La inspección preoperacional de vehículos hace parte del PESV y sus registros se conservan al menos un año (Resolución 40595 de 2022, paso 16).{{/if}}

## Formato de inspección

| Fecha | Área | Ítem inspeccionado | Condición encontrada | Cumple (S/N) | Acción correctiva | Responsable | Fecha de cierre |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

## Inspecciones realizadas

{{#if hayInspecciones}}
| Fecha | Inspección | Lugar | Responsable | Cumplimiento | Hallazgos | Acciones |
|---|---|---|---|---|---|---|
{{#each inspecciones}}
| {{fecha}} | {{celda lista}} | {{celda lugar}} | {{celda responsable}} | {{cumplimiento}} | {{hallazgos}} | {{acciones}} |
{{/each}}

Las acciones derivadas de los hallazgos se registran en FOR-06.
{{else}}
Las inspecciones se registran en PROCESST con su lista de chequeo, fotos y acciones; aquí se consolidan.
{{/if}}

## Seguimiento

Los hallazgos se registran como acciones correctivas (FOR-06) y se presentan en la reunión del {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}}. Los hallazgos sobre instalaciones, equipos y herramientas generan una orden de mantenimiento en el programa PRG-07 (Decreto 1072 de 2015, art. 2.2.4.6.24 parágrafo 2). Indicador: (inspecciones ejecutadas / programadas) × 100.
