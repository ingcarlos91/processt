---
codigo: MTZ-04
nombre: Matriz de elementos de protección personal y registro de entrega
tipo: MTZ
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.6","4.2.2"]
normas: ["RES-2400-1979","LEY-9-1979","DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Definir los elementos de protección personal (EPP) requeridos por cargo en **{{empresa.razonSocial}}**, según los peligros identificados, y registrar su entrega, reposición y capacitación en su uso (Resolución 2400 de 1979, arts. 176 a 201; Resolución 0312 de 2019, estándar 4.2.6). Los EPP son el último nivel de la jerarquía de controles y solo complementan las demás medidas. El empleador los entrega sin costo para el trabajador, garantiza su uso correcto y asegura su mantenimiento o reemplazo según su vida útil (Decreto 1072 de 2015, art. 2.2.4.6.24, num. 5 y parágrafo 1).

## Matriz de EPP por cargo

| Cargo | N.º personas | EPP requeridos |
|---|---|---|
{{#each cargos}}
| {{nombre}} | {{nPersonas}} | {{#if epp.length}}{{join epp "; "}}{{else}}No requiere EPP específico según la matriz de peligros{{/if}} |
{{/each}}

## Criterios

- Cada EPP se selecciona según el peligro que controla, identificado en la matriz de peligros (MTZ-02), y debe ser adecuado al riesgo, seguro y eficiente (Resolución 2400 de 1979, art. 176).
- Los EPP cumplen las normas técnicas aplicables y deben proteger contra el riesgo específico, ser cómodos, no limitar los movimientos, ser durables, fáciles de limpiar y desinfectar, y llevar la marca del fabricante (Resolución 2400 de 1979, art. 178).
- Reposición: por desgaste, daño o pérdida de eficacia, o al cumplir la vida útil indicada por el fabricante (Decreto 1072 de 2015, art. 2.2.4.6.24, parágrafo 1).
- El trabajador es capacitado en su uso, mantenimiento y almacenamiento; quien usa protección respiratoria recibe instrucción sobre su uso, cuidado, limitaciones y procedimientos de emergencia, y la guarda protegida y limpia (Resolución 2400 de 1979, arts. 184 y 185).
- El trabajador está obligado a usar y mantener los EPP que la empresa le suministre (Resolución 2400 de 1979, art. 3, literal b).
- Se verifica que los contratistas suministren y usen los EPP requeridos.
- El registro del suministro de EPP se conserva veinte (20) años (Decreto 1072 de 2015, art. 2.2.4.6.13, num. 5).

## Verificación del uso

El uso correcto y el estado de los EPP se verifican en las inspecciones de EPP (PRG-06) y en la verificación de la aplicación de las medidas de control de la matriz de peligros (MTZ-02), como evidencia de que los trabajadores aplican los controles (Resolución 0312 de 2019, estándar 4.2.2). Los incumplimientos generan una acción en el FOR-06.

## Registro de entrega de EPP

Con su firma, el trabajador declara que recibió los elementos, que fue capacitado en su uso y que se compromete a usarlos y mantenerlos (Resolución 2400 de 1979, art. 3, literal b).

{{#if nomina.hayEntregas}}Entregas registradas en PROCESST; cada trabajador firma al recibir.{{else}}Una fila por cargo con sus EPP; complete fecha, trabajador y firma en cada entrega.{{/if}}

| Fecha | Trabajador | Documento | Cargo | EPP entregado | Cantidad | Tipo (dotación / reposición) | Capacitado en uso (S/N) | Próxima reposición | Firma |
|---|---|---|---|---|---|---|---|---|---|
{{#if nomina.hayEntregas}}
{{#each nomina.entregas}}
| {{fecha}} | {{celda trabajador}} | {{doc}} | {{celda cargo}} | {{celda elemento}} | {{cantidad}} | {{tipo}} | {{capacitado}} | {{proxima}} | |
{{/each}}
{{else}}
{{#each cargos}}
{{#if epp.length}}
| | | | {{nombre}} | {{join epp "; "}} | | | | | |
{{/if}}
{{/each}}
{{/if}}
| | | | | | | | | | |
