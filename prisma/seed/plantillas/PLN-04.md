---
codigo: PLN-04
nombre: Plan de prevención, preparación y respuesta ante emergencias
tipo: PLN
nivelMin: 7
carpeta: 5. Gestión de amenazas
estandares: ["5.1.1","5.1.2"]
normas: ["DEC-1072-2015","RES-0312-2019","LEY-1523-2012","RES-4272-2021","RES-0491-2020","DEC-0780-2016","RES-0591-2024","DEC-2157-2017"]
---
## Objetivo

Establecer las medidas para prevenir, prepararse y responder ante situaciones de emergencia que puedan afectar a los trabajadores, contratistas, subcontratistas, proveedores, visitantes, bienes y el entorno de **{{empresa.razonSocial}}**, en todos sus centros de trabajo y turnos (Decreto 1072 de 2015, art. 2.2.4.6.25, numerales 1 a 13; Resolución 0312 de 2019, estándares 5.1.1 y 5.1.2).

## Información general

| Campo | Información |
|---|---|
| Razón social | {{empresa.razonSocial}} |
| Actividad | {{empresa.actividad}} |
| Número de trabajadores | {{empresa.trabajadores}} |
| Contratistas | {{empresa.contratistas}} |
| Horario | {{default empresa.horario "__________"}} |
| Turnos | {{default empresa.turnos "__________"}} |

Población expuesta por centro de trabajo y turno (para valorar el riesgo según el número de expuestos, art. 2.2.4.6.25 numeral 4):

| Sede | Dirección | Trabajadores por turno | Contratistas y visitantes habituales |
|---|---|---|---|
{{#each sedes}}
| {{nombre}} | {{direccion}}, {{ciudad}} | | |
{{/each}}

## Identificación de amenazas

| Amenaza | Tipo | Origen | Calificación | Descripción |
|---|---|---|---|---|
{{#each amenazas}}
| {{amenaza}} | {{tipo}} | {{origen}} | {{calificacion}} | {{celda descripcion}} |
{{/each}}
{{#if dis.alturas}}
| Caída o suspensión de un trabajador en alturas | Tecnológico | Interno | Posible | Tareas con riesgo de caída de más de 2,0 m (Res. 4272/2021, art. 3) |
{{/if}}
{{#if dis.confinados}}
| Atmósfera peligrosa o atrapamiento en espacio confinado | Tecnológico | Interno | Posible | Ingreso a tanques, pozos, cámaras o silos (Res. 0491/2020) |
{{/if}}
{{#if dis.residuosSalud}}
| Derrame o accidente con residuos de atención en salud | Tecnológico | Interno | Posible | Residuos con riesgo biológico o cortopunzantes (Res. 0591/2024) |
{{/if}}

Calificación: Posible (nunca ha sucedido, pero puede suceder), Probable (ya ha ocurrido en el lugar o en condiciones similares), Inminente (evidente, detectable).

## Análisis de vulnerabilidad

La vulnerabilidad se analiza frente a cada amenaza, teniendo en cuenta las medidas de control existentes (art. 2.2.4.6.25 numeral 3). Se evalúan tres elementos, con preguntas de respuesta Sí (1), Parcial (0,5) o No (0):

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

Interpretación por elemento: 0 a 1 = vulnerabilidad alta; 1,1 a 2 = media; 2,1 a 3 = baja. Esta escala y el método de colores son la metodología que adopta la empresa (guía técnica de análisis de riesgo por colores), no una exigencia de la norma.

## Valoración del riesgo por amenaza

El riesgo se valora combinando cada amenaza con la vulnerabilidad de personas, recursos y sistemas, y con el número de trabajadores expuestos y los bienes y servicios de la empresa (art. 2.2.4.6.25 numeral 4).

| Amenaza | Vulnerabilidad personas | Vulnerabilidad recursos | Vulnerabilidad sistemas | Expuestos | Nivel de riesgo (alto / medio / bajo) |
|---|---|---|---|---|---|
{{#each amenazas}}
| {{amenaza}} | | | | | |
{{/each}}
{{#if dis.alturas}}
| Caída o suspensión en alturas | | | | | |
{{/if}}
{{#if dis.confinados}}
| Emergencia en espacio confinado | | | | | |
{{/if}}
{{#if dis.residuosSalud}}
| Derrame de residuos de atención en salud | | | | | |
{{/if}}

Las amenazas con riesgo alto o medio son prioritarias y tienen procedimiento propio en este plan (numeral 5).

## Plan de acción para reducir la vulnerabilidad

Para los aspectos calificados con vulnerabilidad alta o media se definen acciones factibles de reducción, entre ellas la definición de planos de instalaciones y rutas de evacuación (art. 2.2.4.6.25 numeral 8).

| Aspecto vulnerable | Acción | Responsable | Fecha |
|---|---|---|---|
| | | | |

## Recursos disponibles

| Recurso | Cantidad | Ubicación | Vencimiento / recarga |
|---|---|---|---|
{{#if op.recursosEmergencia.length}}
{{#each op.recursosEmergencia}}
| {{celda recurso}} | {{cantidad}} | {{celda ubicacion}} | {{vence}} |
{{/each}}
{{else}}
| Extintores | | | |
| Botiquín | | | |
| Camilla | | | |
| Señalización de evacuación | | | |
| Alarma | | | |
| Iluminación de emergencia | | | |
{{/if}}

- **Alarma:** {{op.alarma}}
- **Punto de encuentro:** {{op.puntoEncuentro}}

Redes de apoyo externas (capacidad de las redes institucionales, art. 2.2.4.6.25 numeral 2): Bomberos (119), Policía (123), Cruz Roja (132), Defensa Civil (144), línea de atención de la ARL {{empresa.arl}}: {{op.arlLinea}}.

## Asignación de recursos

La empresa asigna los recursos necesarios para diseñar e implementar los procedimientos y acciones frente a las amenazas prioritarias (art. 2.2.4.6.25 numeral 7). El rubro se incluye en el presupuesto del SG-SST:

| Rubro | Descripción | Valor |
|---|---|---|
{{#each presupuesto}}
{{#if (eq rubro "Emergencias")}}
| {{rubro}} | {{celda descripcion}} | {{valor}} |
{{/if}}
{{/each}}

## Organización para la emergencia

- **Jefe o coordinador de la emergencia:** decide la evacuación, activa las ayudas externas y coordina con los organismos de socorro.
- **Brigada de emergencias:** primeros auxilios, control de conatos y evacuación (ACT-05).
- **Todos los trabajadores:** dan la alarma, siguen las instrucciones y se reportan en el punto de encuentro.

## Procedimientos operativos normalizados (PON)

Procedimientos para prevenir y controlar las amenazas prioritarias o reducir el efecto de las demás (art. 2.2.4.6.25 numerales 5 y 6):

**Evacuación:** al sonar la alarma, suspender actividades, desconectar equipos si es seguro, seguir las rutas señalizadas sin correr, no usar ascensores, dirigirse al punto de encuentro ({{op.puntoEncuentro}}) y reportarse con el brigadista.

**Sismo:** durante el movimiento, protegerse junto a estructuras firmes, alejarse de ventanas y objetos que puedan caer; al terminar, evacuar según la orden del jefe de brigada.

**Incendio:** dar la alarma, intentar controlar el conato solo si se está capacitado y es seguro, cerrar puertas, evacuar agachado si hay humo.

**Inundación o lluvias fuertes:** desconectar la energía de las zonas afectadas si es seguro, subir equipos y documentos, no transitar por zonas inundadas y evacuar si el agua compromete la estructura o las instalaciones eléctricas.

**Fuga de gas (si la empresa usa gas):** no accionar interruptores ni producir chispas, cerrar la válvula de paso, ventilar, evacuar y llamar a la empresa de gas y a Bomberos.

**Atención de lesionados:** la brigada presta primeros auxilios y activa la red de la ARL o los servicios de emergencia.

{{#if dis.quimicos}}**Derrame de sustancias químicas:** aislar el área, usar el kit de derrames, consultar la ficha de datos de seguridad.
{{/if}}{{#if dis.atencionPublico}}**Atraco o situación de orden público:** no oponer resistencia, seguir las indicaciones, observar detalles, activar la alarma cuando sea seguro y reportar a la Policía.
{{/if}}{{#if (or dis.conduccion empresa.vehiculos)}}**Accidente de tránsito en misión:** asegurar la zona y señalizarla, no mover a los lesionados salvo peligro inminente, llamar al 123, avisar a la empresa y a la ARL, y reportar el evento como accidente de trabajo.{{#if pesv.aplica}} Este procedimiento se desarrolla en el plan de preparación y respuesta ante emergencias viales del PESV (PRG-09).{{/if}}
{{/if}}

{{#if dis.alturas}}
## Capítulo de trabajo en alturas

Por tener tareas con riesgo de caída de más de 2,0 metros, este plan incluye un capítulo escrito de trabajo en alturas que se practica y verifica según las tareas que se ejecutan (Resolución 4272 de 2021, art. 26):

1. **Plan de rescate** escrito para cada tarea, diseñado según el riesgo, con equipos de rescate **certificados** para toda la operación y brigadistas o personal capacitado para el rescate.
2. **Persona de apoyo** disponible mientras se trabaja en alturas, que reporta de inmediato y activa este plan.
3. Para la atención y los primeros auxilios: botiquín, elementos para inmovilizar y atender heridas y hemorragias, y los demás que el empleador considere según el riesgo.
4. El rescate se **practica mediante simulacros** y se registra en el FOR-05; el detalle de cada tarea está en el PRG-08.
5. Los recursos pueden compartirse con otras empresas mediante planes de ayuda mutua (art. 26, parágrafo).
{{/if}}

{{#if dis.confinados}}
## Capítulo de espacios confinados

Por realizar trabajos en espacios confinados, este plan define cómo se atienden las emergencias de esa actividad (Resolución 0491 de 2020, art. 27):

1. **Procedimientos de rescate por escenario**, con el sistema o dispositivo de rescate, los elementos necesarios y el paso a paso (num. 1 y 3).
2. El plan se **practica y verifica formalmente al menos una vez antes** de realizar la actividad (num. 2), con el personal que atenderá la emergencia (num. 4).
3. Operatividad de los sistemas de rescate comprobada antes de la intervención; elementos de rescate certificados y personal formado para usarlos (num. 5 a 7).
4. **Vigía permanente** en la entrada, capaz de activar el plan y apoyar el rescate, con comunicación efectiva y segura con cada entrante (num. 8 a 10; art. 24).
5. El detalle está en el programa PRG-11.
{{/if}}

{{#if dis.residuosSalud}}
## Plan de contingencias para residuos de atención en salud

Por generar residuos de atención en salud y otras actividades, la empresa cuenta con un plan de contingencias para atender los eventos de riesgo en el manejo de residuos, con personal capacitado y entrenado para aplicarlo (Decreto 780 de 2016, art. 2.8.10.6 numeral 4; Resolución 0591 de 2024, manual, numeral 4.1.1.3.3):

1. Escenarios: derrame o ruptura de bolsas y recipientes, accidente con cortopunzantes, falla en la recolección por el gestor externo, interrupción de servicios públicos.
2. Respuesta: aislar el área, usar el kit antiderrames (con EPP, material absorbente, toallas desechables y bolsa), desinfectar y reportar.
3. Se realizan **simulacros** de las contingencias posibles y se registran en el FOR-05.
4. Se lleva un registro de las contingencias ocurridas, con causas, consecuencias, acciones de mejora y seguimiento.
5. Este plan puede integrarse al plan de contingencias de la institución.
{{/if}}

## Brigada, capacitación y simulacros

- La brigada se conforma, capacita, entrena y dota según el ACT-05 (art. 2.2.4.6.25 numeral 11).{{#if integrantes.brigada.hayMiembros}} Integrantes actuales: {{#each integrantes.brigada.miembros}}{{nombre}} ({{rolTexto}}){{#unless @last}}, {{/unless}}{{/each}}.{{/if}}
- Todos los trabajadores son informados, capacitados y entrenados en el plan de emergencias (numeral 9). El plan se **divulga** a todos los trabajadores y contratistas en la inducción y después de cada actualización, con registro de asistencia (Resolución 0312 de 2019, estándar 5.1.1).
- Se realiza como mínimo **un (1) simulacro al año** con la participación de todos los trabajadores (art. 2.2.4.6.25 numeral 10), y se documenta en el formato FOR-05.

## Inspección de los equipos de emergencia

Los equipos para emergencias, incluidos alarmas, sistemas de alerta, señalización e iluminación de emergencia, se inspeccionan con la periodicidad que define el SG-SST para garantizar que estén disponibles y funcionen (art. 2.2.4.6.25 numeral 12):

| Equipo | Periodicidad definida por la empresa | Responsable |
|---|---|---|
| Extintores | Mensual | Brigada |
| Botiquín y camilla | Mensual | Brigada |
| Alarma y sistemas de alerta (prueba de funcionamiento) | Mensual | Brigada |
| Señalización de evacuación e iluminación de emergencia | Trimestral | Brigada |

Los registros se consolidan en el programa de inspecciones (PRG-06).

## Planos y rutas de evacuación

Se anexan los planos de cada sede con las áreas, las salidas y rutas de evacuación, la señalización, la ubicación de extintores, botiquín y alarma, y el punto de encuentro (Resolución 0312 de 2019, estándar 5.1.1; art. 2.2.4.6.25 numeral 8).

## Ayuda mutua y continuidad

La empresa desarrolla programas o planes de ayuda mutua ante amenazas de interés común con las empresas vecinas o la administración del edificio, identifica los recursos de la zona y se articula con los planes que ya existan en ella (art. 2.2.4.6.25 numeral 13). Según la magnitud de las amenazas y la vulnerabilidad, puede articularse con las instancias locales o regionales del Sistema Nacional de Gestión del Riesgo de Desastres (Ley 1523 de 2012; art. 2.2.4.6.25 parágrafo 1).

**Continuidad del negocio:** el plan se integra con las acciones de recuperación de la empresa (art. 2.2.4.6.25 parágrafo 2): respaldo de la información, proveedores o sedes alternas para las operaciones críticas, y criterios para reanudar actividades después de la emergencia una vez se verifiquen las condiciones seguras.

{{#if (or dis.actividadIndustrial dis.almacenamientoCarga dis.aglomeracionesPublico dis.serviciosPublicos dis.obraCivilMayor)}}
## Plan de Gestión del Riesgo de Desastres (Decreto 2157/2017)

Por {{#if dis.actividadIndustrial}}desarrollar actividades industriales{{/if}}{{#if dis.almacenamientoCarga}}{{#if dis.actividadIndustrial}}, {{/if}}transportar o almacenar carga{{/if}}{{#if dis.aglomeracionesPublico}}{{#if (or dis.actividadIndustrial dis.almacenamientoCarga)}}, {{/if}}administrar espacios con aglomeraciones de público{{/if}}{{#if dis.serviciosPublicos}}{{#if (or dis.actividadIndustrial dis.almacenamientoCarga dis.aglomeracionesPublico)}}, {{/if}}prestar servicios públicos{{/if}}{{#if dis.obraCivilMayor}}{{#if (or dis.actividadIndustrial dis.almacenamientoCarga dis.aglomeracionesPublico dis.serviciosPublicos)}}, {{/if}}ejecutar obras civiles mayores o construcciones de categoría IV{{/if}}, **{{empresa.razonSocial}}** está obligada a formular e implementar el Plan de Gestión del Riesgo de Desastres de las Entidades Públicas y Privadas (PGRDEPP) del Decreto 2157 de 2017 (art. 2.3.1.5.1.2.2 que ese decreto incorpora al Decreto 1081 de 2015; Ley 1523 de 2012, art. 42), que complementa y no reemplaza este plan de emergencias:

1. **Conocimiento del riesgo:** identificación y análisis de los escenarios de riesgo que la actividad genera para la empresa, su entorno y terceros.
2. **Reducción del riesgo:** medidas de intervención correctiva y prospectiva, y protección financiera.
3. **Manejo del desastre:** plan de emergencia y contingencia (el presente documento y sus PON), con el plan de inversiones correspondiente.
4. **Revisión y ajuste anual**, o cuando cambien las condiciones, y entrega de la información pertinente al consejo territorial de gestión del riesgo de desastres.
{{/if}}

## Aprobación

Fecha: {{fecha}}

______________________________________
**{{empresa.representanteLegal}}** — Representante Legal — {{empresa.representanteDoc}}
