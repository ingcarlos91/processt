---
codigo: MTZ-03
nombre: Inventario de sustancias químicas y gestión del riesgo químico (SGA)
tipo: MTZ
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.1.3","4.2.3"]
normas: ["DEC-1496-2018","RES-0773-2021","DEC-1072-2015","RES-0312-2019"]
condicion: {"disparador":"quimicos"}
---
## Objetivo

Identificar las sustancias químicas usadas o almacenadas en **{{empresa.razonSocial}}**, clasificarlas según el Sistema Globalmente Armonizado (SGA) y definir las medidas de control, incluidas las sustancias carcinógenas o con toxicidad aguda (Decreto 1496 de 2018; Resolución 0773 de 2021, art. 21; Resolución 0312 de 2019, estándar 4.1.3). Aplica a todo producto químico con pictograma de peligro del SGA, incluidos los productos de aseo y desinfección. Los plazos de transición del SGA vencieron en abril de 2023 (sustancias puras) y abril de 2024 (mezclas), por lo que la clasificación y el etiquetado son plenamente exigibles.

## Inventario

| N.º | Producto | Uso | Área | Cantidad almacenada | Pictogramas SGA | Palabra de advertencia | ¿Carcinógeno o toxicidad aguda? | FDS disponible | EPP requerido |
|---|---|---|---|---|---|---|---|---|---|
{{#if op.quimicos.length}}
{{#each op.quimicos}}
| {{inc @index}} | {{celda producto}} | {{celda uso}} | {{celda area}} | {{cantidad}} | {{celda pictogramas}} | {{advertencia}} | {{carcinogeno}} | {{fds}} | {{celda epp}} |
{{/each}}
{{else}}
| 1 | | | | | | | | | |
| 2 | | | | | | | | | |
{{/if}}

## Medidas (Resolución 0773 de 2021, art. 21)

1. Mantener el inventario de productos químicos actualizado, con sus peligros clasificados según el SGA.
2. Exigir al proveedor, al ingreso de cada producto, la etiqueta y la ficha de datos de seguridad (FDS) **en español** (art. 16), y mantener las FDS accesibles de forma permanente a los trabajadores.
3. Etiquetar todos los recipientes, incluidos los envases de trasvase, con los elementos del SGA.
4. Revisar las etiquetas y las FDS **al menos cada cinco (5) años**, o antes si cambia la información del proveedor (art. 18).
5. Almacenar según la matriz de compatibilidad y señalizar las áreas.
6. Capacitar a los trabajadores **al menos una vez al año** en etiquetas, pictogramas, FDS y actuación en emergencias con productos químicos (art. 21 num. 7), con registro.
7. Disponer de kit de derrames, duchas y lavaojos donde se requiera, y articular las emergencias químicas con el plan de emergencias (PLN-04).
