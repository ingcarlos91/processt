---
codigo: PRG-06
nombre: Programa de inspecciones de seguridad
tipo: PRG
nivelMin: 21
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.4","3.1.8","3.1.9"]
normas: ["DEC-1072-2015","RES-0312-2019","RES-2400-1979"]
---
## Objetivo

Identificar de manera sistemática condiciones y actos inseguros en instalaciones, máquinas, equipos y herramientas de **{{empresa.razonSocial}}**, con la participación del {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} (Resolución 0312 de 2019, estándar 4.2.4).

## Cronograma de inspecciones

| Inspección | Frecuencia | Responsable |
|---|---|---|
| Locativa general (pisos, escaleras, iluminación, orden y aseo) | Trimestral | {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}} + responsable SG-SST |
| Extintores | Mensual | Brigada |
| Botiquín y elementos de primeros auxilios | Mensual | Brigada |
| Elementos de protección personal | Trimestral | Jefes de área |
| Instalaciones eléctricas | Semestral | Responsable SG-SST |
| Saneamiento básico (agua, baños, residuos) | Trimestral | Responsable SG-SST |
{{#if dis.maquinaria}}| Máquinas y equipos | Mensual | Jefe de producción / mantenimiento |
{{/if}}{{#if dis.alturas}}| Equipos de protección contra caídas (preuso y periódica) | Preuso y semestral | Coordinador de alturas |
{{/if}}{{#if dis.quimicos}}| Almacenamiento de sustancias químicas | Mensual | Responsable SG-SST |
{{/if}}{{#if dis.conduccion}}| Vehículos (preoperacional) | Diaria | Conductor |
{{/if}}| Herramientas manuales | Trimestral | Jefes de área |

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

Los hallazgos se registran como acciones correctivas (FOR-06) y se presentan en la reunión del {{#if comites.copasst.esVigia}}Vigía{{else}}COPASST{{/if}}. Indicador: (inspecciones ejecutadas / programadas) × 100.
