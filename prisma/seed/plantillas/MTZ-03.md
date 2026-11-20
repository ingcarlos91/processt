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

Identificar las sustancias químicas usadas o almacenadas en **{{empresa.razonSocial}}**, clasificarlas según el Sistema Globalmente Armonizado (SGA) y definir las medidas de control (Decreto 1496 de 2018; Resolución 0773 de 2021, art. 21). La implementación del SGA hace parte del SG-SST como medida de control del riesgo químico (Resolución 0773 de 2021, art. 21 num. 1). Las sustancias carcinógenas o con toxicidad aguda se identifican y se priorizan (Decreto 1072 de 2015, art. 2.2.4.6.15, parágrafo 2; Resolución 0312 de 2019, estándar 4.1.3). Aplica a todo producto químico con al menos una característica de peligro según el SGA, incluidos los productos de aseo y desinfección; se excluyen los productos farmacéuticos, los aditivos alimentarios y los cosméticos (Decreto 1496 de 2018, art. 2). Los plazos de transición del SGA vencieron en abril de 2023 (sustancias puras) y abril de 2024 (mezclas), por lo que la clasificación y el etiquetado son plenamente exigibles.

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

## Sustancias carcinógenas y de toxicidad aguda

Se revisan las materias primas, insumos, productos, subproductos y desechos contra los carcinógenos del grupo 1 de la IARC y contra las sustancias de las categorías 1 y 2 del SGA (carcinogenicidad y toxicidad aguda). Las identificadas se marcan en el inventario, se priorizan en la matriz de peligros (MTZ-02) y se almacenan en un área destinada a ellas, con las acciones de prevención e intervención correspondientes (Resolución 0312 de 2019, estándar 4.1.3).

## Medidas (Resolución 0773 de 2021, art. 21)

1. Mantener el inventario de productos químicos actualizado, con sus peligros clasificados según el SGA (num. 2).
2. Comunicar los peligros de los productos a los trabajadores y contratistas potencialmente expuestos (num. 3).
3. Exigir, al ingreso de cada producto, la etiqueta **en español** (art. 7) y la ficha de datos de seguridad (FDS) **en español** (art. 16), conforme a la resolución (num. 4). Tener las FDS de todos los productos y garantizar que se puedan consultar en cualquier momento (num. 9).
4. Señalizar los productos indicando sus peligros y las medidas generales de seguridad (num. 5), y reemplazar la etiqueta cuando no sea visible o legible (num. 6).
5. Etiquetar los recipientes de trasvase igual que el envase original. Está prohibido trasvasar productos químicos a envases de alimentos o con forma o etiquetado de alimentos, y usar envases de químicos para guardar alimentos (Decreto 1496 de 2018, art. 7, parágrafo 1).
6. Revisar la información de las etiquetas y las FDS **al menos cada cinco (5) años**, y actualizarlas antes si se agregan o sustituyen productos o hay información nueva sobre sus peligros (art. 18).
7. Capacitar y entrenar a los trabajadores **y contratistas**, **al menos una vez al año**, en etiquetas, pictogramas, FDS, SGA, peligros, medidas preventivas y procedimientos de emergencia con productos químicos, con registro (num. 7).
8. Disponer de elementos para atender emergencias con productos peligrosos (kit de derrames, duchas y lavaojos donde se requieran) y articular las emergencias químicas con el plan de emergencias (PLN-04) (num. 8).
9. Evaluar la exposición de los trabajadores a los productos químicos, con mediciones cuando se requieran, y aplicar los controles operativos (Decreto 1496 de 2018, art. 17).
10. Conservar los documentos que exige la resolución (inventario, FDS, registros de capacitación) y entregarlos cuando la autoridad los solicite (num. 10).
11. Como buena práctica, almacenar según la compatibilidad química indicada en la sección 7 de cada FDS y señalizar las áreas de almacenamiento.
