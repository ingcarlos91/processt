---
codigo: FOR-07
nombre: Informe de investigación de incidente, accidente de trabajo o enfermedad laboral
tipo: INF
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.2.2"]
normas: ["RES-1401-2007","RES-0156-2005","DEC-1072-2015","RES-0312-2019","LEY-1581-2012","DL-1295-1994"]
descripcion: Se genera uno por cada evento desde la pestaña Accidentes e incidentes. Sigue el contenido mínimo del informe de investigación de la Resolución 1401 de 2007 (arts. 9 a 13).
---
## 1. Identificación del aportante (Res. 1401/2007 art. 9; Res. 156/2005)

| Campo | Información |
|---|---|
| Razón social | {{empresa.razonSocial}} |
| NIT | {{empresa.nit}} |
| Actividad económica (CIIU) | {{empresa.actividad}}{{#if empresa.ciiu}} — {{empresa.ciiu}}{{/if}} |
| Clase de riesgo | {{default empresa.claseRiesgoRomano "______"}} |
| Dirección | {{default empresa.direccion "______"}}, {{empresa.ciudad}}{{#if empresa.departamento}}, {{empresa.departamento}}{{/if}} |
| Teléfono y correo | {{default empresa.telefono "______"}}{{#if empresa.correo}} — {{empresa.correo}}{{/if}} |
| ARL | {{default empresa.arl "______"}} |
| Sede o centro de trabajo donde labora el trabajador | {{default ev.sede "______"}} |
| Representante legal | {{empresa.representanteLegal}} — {{empresa.representanteDoc}} |
| Responsable del SG-SST | {{responsable.nombre}}{{#if responsable.licencia}} — Licencia SST {{responsable.licencia}}{{/if}} |

{{#if ev.esEL}}Enfermedad laboral: se investiga para determinar las causas y las deficiencias del SG-SST que permitieron la exposición (Decreto 1072 de 2015, art. 2.2.4.6.32). El reporte a la ARL y la EPS se hizo en el FUREL (Resolución 156 de 2005).{{else}}{{#if ev.esIncidente}}Incidente de trabajo: suceso con potencial de ser accidente, que se investiga igual que los accidentes (Resolución 1401 de 2007, arts. 3 y 4 num. 2). No requiere FURAT.{{else}}Este informe contiene las variables del Formulario Único de Reporte de Accidente de Trabajo (FURAT, Resolución 156 de 2005) y los datos adicionales que exige la Resolución 1401 de 2007 para el informe de investigación.{{/if}}{{/if}}{{#if ev.esVisitante}} La persona afectada es un visitante, no un trabajador afiliado por la empresa: no se diligencia FURAT ni FUREL (Decreto Ley 1295 de 1994, art. 62); el evento se registra para la estadística interna y se investiga para prevenir que se repita.{{/if}}

## 2. Identificación del trabajador (Res. 1401/2007 art. 9; Res. 156/2005)

| Campo | Información |
|---|---|
| Nombres y apellidos | {{default ev.trabajador "______"}} |
| Documento de identidad | {{default ev.doc "______"}} |
| Fecha de nacimiento y sexo | {{default ev.fechaNacimiento "______"}} — {{default ev.sexo "______"}} |
| EPS y AFP del trabajador | EPS: {{default ev.eps "______"}} — AFP: {{default ev.afp "______"}} |
| Tipo de vinculación | {{default ev.vinculacion "______"}} |
| Cargo u ocupación | {{default ev.cargo "______"}} |
| Antigüedad en el cargo | {{default ev.antiguedad "______"}} |
| Antigüedad en la empresa | {{default ev.tiempoEmpresa "______"}} |
| Jornada o turno habitual | {{default ev.turno "______"}} |
| ¿Estaba en su jornada y labor habitual? | {{default ev.jornadaHabitual "______"}} |
| Tiempo laborado antes del evento | {{default ev.tiempoLaborado "______"}} |

## 3. Información del evento (Res. 1401/2007 art. 9; Res. 156/2005)

| Campo | Información |
|---|---|
| Tipo de evento | {{ev.tipo}}{{#if ev.esAT}} — {{ev.gravedad}} (Res. 1401/2007 art. 3){{/if}} |
{{#if ev.tipoAccidente}}| Tipo de accidente (FURAT) | {{ev.tipoAccidente}} |
{{/if}}| Fecha | {{ev.fecha}} ({{ev.diaSemana}}) |
| Hora | {{default ev.hora "______"}} |
| Lugar (sede, área o zona) | {{default ev.lugar "______"}} |
| Sitio exacto donde ocurrió | {{default ev.sitioExacto "______"}} |
| Tarea o actividad que realizaba | {{default ev.tarea "______"}} |
| Agente del accidente | {{default ev.agente "______"}} |
| Mecanismo o forma del accidente | {{default ev.mecanismo "______"}} |
{{#if ev.esAT}}| Tipo de lesión | {{default ev.lesion "______"}} |
| Parte del cuerpo afectada | {{default ev.parteCuerpo "______"}} |
| Días de incapacidad | {{ev.dias}}{{#if ev.diasCargados}} (más {{ev.diasCargados}} días cargados){{/if}} |
{{/if}}{{#if ev.esEL}}| Días de incapacidad | {{ev.dias}} |
{{/if}}| Testigos (nombre, documento y cargo) | {{default ev.testigos "Ninguno"}} |
{{#if ev.fechaReporte}}| Reporte a la ARL y la EPS (FURAT/FUREL) | {{ev.fechaReporte}}{{#if ev.furat}} — radicado {{ev.furat}}{{/if}} |
{{/if}}{{#if ev.reporteMinisterio}}| Reporte a la Dirección Territorial del Ministerio del Trabajo | {{ev.reporteMinisterio}} |
{{/if}}

Las variables del evento siguen las tablas de códigos del FURAT (Resolución 156 de 2005, anexo técnico) para el tipo de lesión, la parte del cuerpo, el agente y el mecanismo (Resolución 1401 de 2007, art. 9). Se registra únicamente el tipo de lesión y la parte del cuerpo afectada; el diagnóstico médico es dato sensible del trabajador y no hace parte de este informe (Ley 1581 de 2012).

## 4. Descripción del evento (Res. 1401/2007 art. 10)

**Relato de los hechos** (qué actividad realizaba, cuándo, dónde, cómo, por qué y con quién, con base en la inspección del sitio y las entrevistas):

{{default ev.descripcion "______"}}

**Versión del trabajador:** {{default ev.versionTrabajador "No registrada."}}

**Versión de los testigos:** {{default ev.versionTestigos "No registrada."}}

{{#if ev.soportes.length}}**Soportes de la investigación** (fotografías, videos, diagramas, declaraciones y documentos): {{join ev.soportes "; "}}.
{{else}}Los soportes de la investigación (fotografías, videos, diagramas, declaraciones y documentos) se conservan en el expediente del evento.
{{/if}}

## 5. Análisis de causas (Res. 1401/2007 arts. 3 y 11)

{{#if ev.porques.length}}
**Método: análisis de los porqués**, desde el hecho hasta la causa básica.

{{#each ev.porques}}
{{inc @index}}. {{this}}
{{/each}}

{{/if}}
Se relacionan todas las causas encontradas, separando las inmediatas de las básicas o mediatas (art. 11):

| Tipo de causa | Descripción |
|---|---|
| Causas inmediatas — actos subestándar o inseguros | {{#if ev.actos.length}}{{join ev.actos "; "}}{{else}}______{{/if}} |
| Causas inmediatas — condiciones subestándar o inseguras | {{#if ev.condiciones.length}}{{join ev.condiciones "; "}}{{else}}______{{/if}} |
| Causas básicas — factores personales | {{#if ev.personales.length}}{{join ev.personales "; "}}{{else}}______{{/if}} |
| Causas básicas — factores del trabajo | {{#if ev.trabajo.length}}{{join ev.trabajo "; "}}{{else}}______{{/if}} |
{{#if ev.peligro}}| Peligro relacionado (matriz GTC 45) | {{ev.peligro}} |
{{/if}}

{{#if ev.conclusion}}**Conclusión:** {{ev.conclusion}}
{{else}}**Conclusión:** ______
{{/if}}

## 6. Medidas de intervención (Res. 1401/2007 art. 12)

Medidas que la empresa se compromete a adoptar para prevenir eventos similares, cada una con responsable y fecha de ejecución, dirigidas a la fuente, el medio y el trabajador y con relación lógica con las causas básicas (art. 12). Para cada medida se indica qué causa básica ataca y si se dirige a la fuente, al medio o al trabajador. Se definen con la jerarquía de controles (Decreto 1072 de 2015, art. 2.2.4.6.24).

| N.º | Medida | Causa básica que ataca | Dirigida a | Tipo | Jerarquía | Responsable | Fecha de ejecución | Estado |
|---|---|---|---|---|---|---|---|---|
{{#if ev.acciones.length}}
{{#each ev.acciones}}
| {{n}} | {{celda descripcion}} | {{celda causa}} | {{default dirigidaA "______"}} | {{tipo}} | {{jerarquia}} | {{responsable}} | {{fechaLimite}} | {{estado}} |
{{/each}}
{{else}}
| 1 | | | | | | | | |
| 2 | | | | | | | | |
{{/if}}

**Trabajadores potencialmente expuestos:** cargos, áreas, turnos o sedes con exposición al mismo peligro a los que se extienden las medidas (Resolución 0312 de 2019, estándar 3.2.2): {{default ev.expuestos "______"}}

La empresa implementa las medidas, registra su cumplimiento y verifica su efectividad (art. 12); la verificación de la efectividad se registra al cerrar cada acción en el FOR-06. Quedan en el registro de acciones correctivas, preventivas y de mejora (FOR-06) y en el plan anual de trabajo (art. 4 num. 6).

## 7. Lecciones aprendidas

{{default ev.lecciones "______"}}

Las lecciones aprendidas se divulgan a los trabajadores y al {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}}, y los resultados de la investigación alimentan la revisión por la dirección (Decreto 1072 de 2015, art. 2.2.4.6.32).

## 8. Equipo investigador y firmas (Res. 1401/2007 arts. 7 y 13)

Equipo conformado según el art. 7: {{join ev.rolesMinimos ", "}}{{#if ev.esGrave}}, por tratarse de un accidente {{ev.gravedad}}{{/if}}.{{#if ev.esMortal}} {{#if ev.esEL}}Muerte por enfermedad laboral{{else}}Accidente mortal{{/if}}: la investigación se adelanta con el {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} dentro de los 15 días calendario siguientes a la muerte (Decreto 1072 de 2015, art. 2.2.4.1.6){{#if ev.esAT}} y obligatoriamente en el formato suministrado por la ARL (art. 4 num. 3); este informe lo acompaña{{/if}}.{{/if}}

| Nombre | Cargo | Identificación | Rol en la investigación |
|---|---|---|---|
{{#if ev.hayEquipo}}
{{#each ev.equipo}}
| {{nombre}} | {{celda cargo}} | {{documento}} | {{rol}} |
{{/each}}
{{else}}
{{#each ev.rolesMinimos}}
| | | | {{this}} |
{{/each}}
{{/if}}

Firman los investigadores y el representante legal (art. 13):

{{#if ev.hayEquipo}}
{{#each ev.equipo}}

______________________________________
**{{nombre}}** — {{rol}} — {{default documento "Documento: ____________________"}}

{{/each}}
{{else}}
{{#each ev.rolesMinimos}}

______________________________________
**Nombre: ____________________** — {{this}}

{{/each}}
{{/if}}

______________________________________
**{{empresa.representanteLegal}}** — Representante legal — {{empresa.representanteDoc}}

## 9. Datos de la investigación y remisión (Res. 1401/2007 arts. 4, 13 y 14)

| Campo | Información |
|---|---|
| Lugar y dirección donde se realizó la investigación | {{default ev.invLugar "______"}} |
| Fecha de inicio de la investigación | {{default ev.invInicio "______"}} |
| Fechas y horas de las sesiones | {{default ev.invFechas "______ (fecha y hora de cada sesión)"}} |
| Fecha de cierre del informe | {{default ev.invCierre "______"}} |
| Plazo de la investigación (15 días) | Hasta el {{ev.plazoInvestigacion}} — {{#if ev.invCerrada}}{{#if ev.aTiempo}}Cumplido{{else}}No cumplido (cerrada después del plazo){{/if}}{{else}}En curso{{/if}} |
{{#if ev.plazoRemision}}| Remisión del informe a la ARL ({{#if ev.esEL}}muerte por enfermedad laboral{{else}}accidente {{ev.gravedad}}{{/if}}) | {{default ev.remitidaArl "Pendiente"}} — plazo: {{ev.plazoRemision}} |
{{/if}}

{{#if ev.plazoRemision}}Por tratarse de {{#if ev.esEL}}una muerte por enfermedad laboral{{else}}un accidente {{ev.gravedad}}{{/if}}, este informe, firmado por el representante legal, se remite a la ARL dentro de los quince (15) días siguientes a la ocurrencia del evento (art. 14); la ARL emite concepto en quince (15) días hábiles{{#if (and ev.esMortal ev.esAT)}} y, por ser mortal, remite el expediente a la Dirección Territorial del Ministerio del Trabajo{{/if}}.
{{else}}{{#if ev.esVisitante}}El informe se conserva en el expediente del SG-SST; por tratarse de un visitante no se remite a la ARL.{{else}}El informe se conserva en el expediente del SG-SST; los incidentes y accidentes leves no se remiten a la ARL, pero el Ministerio del Trabajo puede solicitarlos en cualquier momento (art. 14).{{/if}}
{{/if}}

La investigación debe realizarse dentro de los quince (15) días siguientes a la ocurrencia del evento (art. 4 num. 2), es decir, hasta el {{ev.plazoInvestigacion}}. {{#if ev.invCerrada}}{{#if ev.aTiempo}}**Plazo cumplido:** la investigación se cerró el {{ev.invCierre}}, dentro de los quince días.{{else}}**Plazo no cumplido:** la investigación se cerró el {{ev.invCierre}}, después de los quince días; se dejan registradas las razones del retraso y se toman medidas para que no se repita.{{/if}}{{else}}La investigación está en curso; al cerrarla se verifica si se cumplió el plazo.{{/if}} Este informe y las pruebas de los correctivos se archivan a disposición del Ministerio del Trabajo (art. 4 num. 10; Decreto 1072 de 2015, art. 2.2.4.6.12 num. 11). Por política de la empresa se conservan por veinte (20) años.
