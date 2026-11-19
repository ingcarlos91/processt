---
codigo: MTZ-04
nombre: Matriz de elementos de protección personal y registro de entrega
tipo: MTZ
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.6"]
normas: ["RES-2400-1979","LEY-9-1979","DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Definir los elementos de protección personal (EPP) requeridos por cargo en **{{empresa.razonSocial}}**, según los peligros identificados, y registrar su entrega, reposición y capacitación en su uso (Resolución 2400 de 1979, arts. 176 a 201; Resolución 0312 de 2019, estándar 4.2.6). Los EPP son el último nivel de la jerarquía de controles y se suministran sin costo para el trabajador.

## Matriz de EPP por cargo

| Cargo | N.º personas | EPP requeridos |
|---|---|---|
{{#each cargos}}
| {{nombre}} | {{nPersonas}} | {{#if epp.length}}{{join epp "; "}}{{else}}No requiere EPP específico según la matriz de peligros{{/if}} |
{{/each}}

## Criterios

- Los EPP deben cumplir las normas técnicas aplicables y ser adecuados al peligro.
- Reposición: por desgaste, daño, pérdida de eficacia o según la vida útil indicada por el fabricante.
- El trabajador es capacitado en su uso, mantenimiento y almacenamiento.
- Se verifica que los contratistas suministren y usen los EPP requeridos.
- El registro de entrega se conserva veinte (20) años (Decreto 1072 de 2015, art. 2.2.4.6.13).

## Registro de entrega de EPP

| Fecha | Trabajador | Cédula | Cargo | EPP entregado | Cantidad | Tipo (dotación / reposición) | Capacitado en uso (S/N) | Firma |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |
