---
codigo: PLN-04
nombre: Plan de prevención, preparación y respuesta ante emergencias
tipo: PLN
nivelMin: 7
carpeta: 5. Gestión de amenazas
estandares: ["5.1.1","5.1.2"]
normas: ["DEC-1072-2015","DEC-2157-2017","RES-0312-2019"]
---
## Objetivo

Establecer las medidas para prevenir, prepararse y responder ante situaciones de emergencia que puedan afectar a los trabajadores, contratistas, visitantes, bienes y el entorno de **{{empresa.razonSocial}}**, en todos sus centros de trabajo y turnos (Decreto 1072 de 2015, art. 2.2.4.6.25; Decreto 2157 de 2017).

## Información general

| Campo | |
|---|---|
| Razón social | {{empresa.razonSocial}} |
| Actividad | {{empresa.actividad}} |
| Número de trabajadores | {{empresa.trabajadores}} |
| Horario | {{default empresa.horario "__________"}} |
| Turnos | {{default empresa.turnos "__________"}} |
{{#each sedes}}
| Sede | {{nombre}} — {{direccion}}, {{ciudad}} |
{{/each}}

## Identificación de amenazas

| Amenaza | Tipo | Origen | Calificación | Descripción |
|---|---|---|---|---|
{{#each amenazas}}
| {{amenaza}} | {{tipo}} | {{origen}} | {{calificacion}} | {{celda descripcion}} |
{{/each}}

Calificación: Posible (nunca ha sucedido, pero puede suceder), Probable (ya ha ocurrido en el lugar o en condiciones similares), Inminente (evidente, detectable).

## Análisis de vulnerabilidad

Se evalúa la vulnerabilidad en tres elementos, con preguntas de respuesta Sí (1), Parcial (0,5) o No (0):

**Personas:** gestión organizacional (plan de emergencias, brigada, comités), capacitación y entrenamiento, dotación (EPP de emergencia, botiquín).
**Recursos:** materiales (extintores, camilla, señalización), edificaciones (rutas, salidas, iluminación de emergencia), equipos (alarma, comunicaciones).
**Sistemas y procesos:** servicios públicos, sistemas alternos, recuperación.

| Elemento | Aspecto | Calificación |
|---|---|---|
| Personas | Organización | |
| Personas | Capacitación | |
| Personas | Dotación | |
| Recursos | Materiales | |
| Recursos | Edificación | |
| Recursos | Equipos | |
| Sistemas | Servicios | |
| Sistemas | Alternos | |
| Sistemas | Recuperación | |

Interpretación por elemento: 0 a 1 = vulnerabilidad alta; 1,1 a 2 = media; 2,1 a 3 = baja. El nivel de riesgo resulta de combinar la amenaza con la vulnerabilidad de personas, recursos y sistemas (método de colores).

## Recursos disponibles

| Recurso | Cantidad | Ubicación |
|---|---|---|
| Extintores | | |
| Botiquín | | |
| Camilla | | |
| Señalización de evacuación | | |
| Alarma | | |

Redes de apoyo externas: Bomberos (119), Policía (123), Cruz Roja (132), Defensa Civil (144), línea de emergencias de la ARL {{empresa.arl}}.

## Procedimientos operativos normalizados (PON)

**Evacuación:** al sonar la alarma, suspender actividades, desconectar equipos si es seguro, seguir las rutas señalizadas sin correr, no usar ascensores, dirigirse al punto de encuentro (__________) y reportarse con el brigadista.

**Sismo:** durante el movimiento, protegerse junto a estructuras firmes, alejarse de ventanas y objetos que puedan caer; al terminar, evacuar según la orden del jefe de brigada.

**Incendio:** dar la alarma, intentar controlar el conato solo si se está capacitado y es seguro, cerrar puertas, evacuar agachado si hay humo.

**Atención de lesionados:** la brigada presta primeros auxilios y activa la red de la ARL o los servicios de emergencia.

{{#if dis.quimicos}}**Derrame de sustancias químicas:** aislar el área, usar el kit de derrames, consultar la ficha de datos de seguridad.
{{/if}}{{#if dis.atencionPublico}}**Atraco o situación de orden público:** no oponer resistencia, seguir las indicaciones, observar detalles, activar la alarma cuando sea seguro y reportar a la Policía.
{{/if}}

## Brigada, capacitación y simulacros

- La brigada se conforma, capacita y dota según el ACT-05.
- Todos los trabajadores son informados, capacitados y entrenados en el plan de emergencias.
- Se realiza como mínimo **un (1) simulacro al año** con la participación de todos los trabajadores (art. 2.2.4.6.25 numeral 10), y se documenta en el formato FOR-05.
- Los equipos de emergencia (extintores, botiquín, alarma, señalización) se inspeccionan periódicamente.

## Planos y rutas de evacuación

Se anexan los planos de cada sede con rutas de evacuación, salidas, ubicación de extintores, botiquín y punto de encuentro.

## Ayuda mutua y continuidad

La empresa se articula con los planes de emergencia del edificio o la zona y con el Sistema Nacional de Gestión del Riesgo de Desastres (Ley 1523 de 2012).

## Aprobación

Fecha: {{fecha}}

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal
