# 09 · Análisis normativo del SG-SST (auditoría del 19 de noviembre de 2026)

> Para quién es: la consultora en SST, que debe **validar** este análisis antes de que los textos lleguen a los documentos de los clientes. Está escrito para leerse sin conocer el código; la única sección técnica es la 6 (cambios pendientes en el sistema).
>
> Qué contiene: cómo se hizo la auditoría, los hallazgos que más cambian lo que el sistema concluye, la tabla norma por norma (las 65 entradas del catálogo final, 61 vigentes y 4 derogadas), las normas que se agregaron o se descartaron, los puntos que requieren decisión de la consultora, lo que falta por implementar y las fuentes.

---

## 1. Objetivo y método

### 1.1 Objetivo

Confirmar, contra el texto oficial, cada norma que el sistema cita o usa para decidir qué le aplica a una empresa, y corregir tres cosas:

1. **Umbrales y condiciones de aplicabilidad** (a quién obliga cada norma y desde qué número de trabajadores, vehículos, conductores, etc.).
2. **Qué exige exactamente** cada norma (documento, registro, periodicidad, plazo) y con qué artículo.
3. **Vigencia**: normas derogadas que el sistema seguía citando y normas nuevas (2024-2026) que faltaban.

### 1.2 Textos consultados y fecha de corte

- **Fecha de corte: 19 de noviembre de 2026.** Se consideraron normas expedidas hasta esa fecha, incluidas las de 2026 (Decreto 223, Decreto 1040, Res. 610, Circulares 027 y 034, Decreto 1036).
- Se trabajó con **compilaciones oficiales**: Régimen Legal de Bogotá (alcaldiabogota.gov.co/sisjur), normogramas de MinTIC, Cancillería, Colpensiones e INVIMA, Gestor Normativo de Función Pública y SUIN-Juriscol. Solo dos normas quedaron con fuente secundaria (safetya.co) por no encontrarse compilación oficial al cierre: Decreto 1347/2021 (con sus resoluciones 5492/2024, 1890/2025 y 3687/2025) y Res. 908/2025. Están marcadas con confianza media en la tabla.
- La auditoría se dividió en cinco investigaciones: (A) normas estructurales, (B) comités, psicosocial, salud mental y datos, (C) salud, accidentes, alto riesgo, aprendices y reforma laboral, (D) PESV, alturas, confinados, SGA, Decreto 2157 y disparadores sin norma, (E) normas faltantes y derogadas.
- Cuando un informe marcó un dato como **no verificado** o con **confianza media**, aquí se dice expresamente (columna "Confianza" de la tabla y sección 5).

### 1.3 Cómo decide el sistema qué le aplica a una empresa

Cada norma, regla y plantilla tiene una **condición de aplicabilidad**. El motor la evalúa con los datos de la empresa y, cuando una norma aplica, explica por qué ("tiene 12 vehículos, la regla aplica con más de 10"). Los datos que el motor usa son:

| Dato de la empresa | De dónde sale | Para qué se usa |
|---|---|---|
| Trabajadores | Planta + en misión (los contratistas y aprendices se registran aparte; ver sección 5, punto 1) | Nivel de estándares (7/21/60), COPASST o Vigía, Reglamento de Higiene, cuota de aprendices |
| Clase de riesgo (I a V) | Sugerida por el CIIU con la tabla del Decreto 768/2022; se confirma con el certificado de la ARL | Nivel de estándares (riesgo IV-V siempre 60) |
| Vehículos | Dato de la pestaña Datos (propios, arrendados, leasing o vinculados) | PESV: aplica con **más de 10** (11 o más) |
| **Conductores (nuevo)** | Dato de la pestaña Datos: personas que conducen al servicio de la empresa, sin importar el contrato | PESV: aplica con **2 o más** conductores |
| **Empresa de transporte (nuevo, `esTransporte`)** | Se deduce del CIIU (división 49, transporte terrestre) | Nivel del PESV: las empresas de transporte tienen umbrales más exigentes (misionalidad 1) |
| **Contratistas (nuevo como condición)** | Dato de la pestaña Datos | Obligaciones del contratante con contratistas por prestación de servicios de más de un mes |
| Aprendices y practicantes | Dato de la pestaña Datos | Afiliación a ARL desde la fase lectiva, inducción y EPP |
| **Mujeres (nuevo)** | Se cuenta de los trabajadores activos registrados con sexo F | Sala de lactancia (más de 50 trabajadoras) |
| **Sedes (nuevo)** | Se cuenta de las sedes registradas | Comité de Convivencia por centro de trabajo (todavía sin regla que lo use; ver sección 6) |
| UPA | Casilla en Datos | Tres obligaciones de la Res. 0312 art. 7 |
| Nivel de estándares | Calculado | Plantillas que solo aplican desde 21 o 60 |
| Disparadores (peligros especiales) | Cuestionario de Datos → Peligros especiales, o detectados en la matriz aprobada | Normas y programas por peligro |

Las condiciones admiten combinaciones ("todos" / "alguno"). La del PESV, por ejemplo, es "alguno: vehículos ≥ 11 **o** conductores ≥ 2".

**Disparadores nuevos** en el cuestionario (antes no existían y el sistema no podía distinguir estos casos):

| Disparador | Qué activa |
|---|---|
| Genera residuos de atención en salud o afines (salud, veterinaria, estética, tatuajes, funerarias, laboratorios) | Decreto 780/2016 arts. 2.8.10.x y Res. 591/2024 (PGIRASA) |
| Trabajo en casa (habilitación temporal) | Ley 2088/2021, separado del teletrabajo permanente |
| Actividad industrial / Transporte o almacenamiento de carga / Aglomeraciones de público / Servicios públicos / Obra civil mayor o edificación categoría IV | Decreto 2157/2017 (PGRDEPP), que antes se citaba a toda empresa |
| Sustancias peligrosas en cantidades iguales o superiores a los umbrales de accidentes mayores | Decreto 1347/2021 y sus resoluciones |

Además, el motor ahora calcula el **nivel del PESV** (básico, estándar o avanzado según la Tabla 1 de la Res. 40595/2022) y la **composición del Comité de Convivencia** por tramos (Res. 3461/2025 art. 3), y valida al responsable del SG-SST con la experiencia exigida por la Res. 0312 (1 año para técnico, 2 para tecnólogo), su rol (quien diseña frente a quien solo ejecuta) y la vigencia de 3 años del curso de 50 horas.

---

## 2. Hallazgos de mayor impacto (resumen ejecutivo)

1. **PESV: el umbral estaba mal.** La obligación es para flota **superior a 10 vehículos (11 o más)** **o** para quien **contrate o administre conductores** (la Res. 40595/2022 fija el nivel básico desde **2 conductores**). El sistema decía "10 o más vehículos o conductores" y no tenía campo de conductores. Ahora hay campo de conductores, condición "11 vehículos o 2 conductores" y cálculo del nivel (básico / estándar / avanzado) distinguiendo empresas de transporte (misionalidad 1) de las demás (misionalidad 2). Fuente: Ley 1503/2011 art. 12 (mod. Decreto Ley 2106/2019 art. 110); Decreto 1079/2015 art. 2.3.2.3.2; Res. 40595/2022 Tabla 1.
2. **Trabajo en alturas es desde 2,0 m, no 1,5 m.** La Res. 4272/2021 art. 3 define trabajo en alturas como riesgo de caída **mayor a 2,0 metros**. El sistema decía "1,5 m o más" en el catálogo, el cuestionario y docs/01. Corregido en catálogo, cuestionario, regla, plantilla PRG-08 y biblioteca de peligros.
3. **El Decreto 2157/2017 no obliga a toda empresa.** Solo a servicios públicos, obras civiles mayores, actividades industriales, transporte y almacenamiento de carga, construcciones de categoría IV y aglomeraciones de público (Decreto 1081/2015 art. 2.3.1.5.1.2.2). El sistema lo citaba en el plan de emergencias de todas las empresas. El plan de emergencias de todo empleador se fundamenta en el Decreto 1072 art. 2.2.4.6.25 y los estándares 5.1.1/5.1.2. Ahora hay cinco disparadores para activar el PGRDEPP solo cuando corresponde.
4. **La Res. 1075/1992 está derogada** (Res. 1843/2025 art. 36). El sistema la citaba como base de la política de alcohol, tabaco y SPA. Las campañas de prevención de farmacodependencia, alcoholismo y tabaquismo son hoy obligación del **art. 25 de la Res. 1843/2025** (y art. 5 lit. g), complementadas por la Ley 1335/2009 (espacios libres de humo).
5. **El Decreto 1607/2002 está derogado** por el Decreto 768/2022 (art. 9), que adopta la tabla CIIU Rev. 4 A.C. y permite clase de riesgo distinta por centro de trabajo (art. 4). El catálogo tiene ahora el 768/2022 y marca el 1607 como derogado.
6. **Comité de Convivencia Laboral: todo empleador, por tramos, y con nulidad parcial.** La Res. 3461/2025 no tiene umbral de tamaño (art. 2). Composición (art. 3): menos de 5 trabajadores, 1 y 1 sin suplentes; de 5 a 20, 1 y 1 con suplentes; más de 20, 2 y 2 con suplentes. Un comité central y uno por cada centro de trabajo. El impedimento de quejosos y víctimas es del **año anterior**. El Consejo de Estado anuló del art. 2 las expresiones "contratantes", "contratistas" e "independientes" (sentencia del 1 de octubre de 2026; el informe la reporta con confianza media). Las dudas de docs/01 sobre un umbral de 10 trabajadores quedan resueltas: no existe.
7. **La batería de riesgo psicosocial es para todo empleador**, sin umbral (Res. 2764/2022 art. 2; Res. 2646/2008). El sistema solo la presupuestaba y la ponía en el plan anual desde 21 estándares. Corregido (PRG-04 desde 7 estándares, presupuesto y plan anual para todos). Periodicidad: anual si el riesgo es alto o muy alto, cada 2 años si es medio o bajo (siempre con intervención). El empleador no conserva copias de los instrumentos (art. 5).
8. **Res. 1843/2025: seis tipos de examen y plazos nuevos.** Pre-ingreso, periódicas programadas y por cambio de ocupación, **egreso dentro de los 5 días hábiles** siguientes al retiro (con constancia de la notificación), retorno laboral tras ausencia no médica de 90 días o más, post-incapacidad de 30 días o más, y de seguimiento (arts. 8-14). La periodicidad la fija la empresa con justificación técnica, máximo 3 años (art. 15). La norma habla de **"perfil de cargo"** (art. 3 lit. m), que elabora el empleador y entrega al prestador con la matriz de peligros (art. 16); el sistema usaba "profesiograma". El empleador debe **adaptar el puesto en máximo 20 días hábiles** cuando hay restricciones (art. 5 lit. f) y evitar el concepto "no apto" (art. 19). Exigible en plenitud desde el 6 de noviembre de 2025.
9. **Las enfermedades laborales también se reportan al Ministerio.** El Decreto 1072 art. 2.2.4.1.7 obliga a reportar a la Dirección Territorial, en 2 días hábiles, los AT graves y mortales **y las enfermedades laborales diagnosticadas**. El sistema solo generaba ese plazo para AT graves y mortales. Corregido en el semáforo de plazos y en el procedimiento PRC-08. Se catalogó la Res. 156/2005 (FURAT/FUREL).
10. **Perfil del responsable: experiencia, rol y actualización.** La Res. 0312/2019 exige, además de licencia y curso de 50 horas, **1 año de experiencia** al técnico que diseña un sistema de 7 estándares (art. 3) y **2 años** al tecnólogo que diseña uno de 21 (art. 9); quien solo tiene el curso de 50 horas puede administrar y ejecutar el sistema, pero no diseñarlo (art. 4). En empresas de 10 o menos trabajadores con riesgo I-III el ejecutor interno no necesita licencia (Res. 4927/2016 art. 14). El certificado de 50 horas se actualiza con un **curso de 20 horas cada 3 años** (Res. 4927 art. 16; Circular 047/2025). El motor ya valida todo esto, pero el formulario aún no pide experiencia, rol ni fecha del curso de 20 horas (sección 6).
11. **Normas nuevas 2025-2026 que faltaban y ahora están en el catálogo:** Ley 2466/2025 (reforma laboral: jornada nocturna desde las 7:00 p. m., no despido por razones de salud mental, trabajo libre de violencia y acoso, aprendizaje, teletrabajo); Decreto 1040/2026 (política y protocolo frente al acoso, la violencia basada en género y la discriminación, para todo empleador, con formación anual); Ley 2191/2022 (política de desconexión laboral); Decreto 223/2026 (aprendices con ARL desde la fase lectiva, confirmado); Res. 908/2025 (licencias en SST); Res. 610/2026 (salas de lactancia, deroga la Res. 2423/2018); Circular 034/2026 (reporte anual de autogestión del PESV antes del 31 de enero); Circular 047/2025 (curso de 20 horas); Ley 2101/2021 (jornada de 42 horas desde el 15 de julio de 2026).
12. **Citas corregidas en reglas:** el Vigía se fundamenta en el Decreto Ley 1295/1994 art. 35 par. (la regla citaba un numeral inexistente del Decreto 1072); el periodo de 2 años y las 4 horas semanales del COPASST son del Decreto Ley 1295/1994 art. 63, no del art. 7 de la Res. 2013/1986; la Res. 1016/1989 perdió exigibilidad el 1 de junio de 2017 y no debe citarse como fundamento; la Ley 2460/2025 **no** prohíbe el despido de trabajadores con trastorno mental (su obligación real es el parágrafo que añade al art. 9 de la Ley 1616/2013).

---

## 3. Tabla norma por norma (catálogo final: 65 entradas)

Convenciones: "Sistema decía" = lo que el catálogo o las reglas afirmaban antes de la auditoría. "Confianza": alta = texto oficial leído y contrastado; media = dato tomado de un informe que lo marcó como no verificado, con fuente secundaria o en litigio. Las URL completas están en la sección 7; aquí se abrevia (SISJUR n = alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=n).

### 3.1 Estructurales

| Código | Norma | Vigencia | A quién aplica (umbral y artículo) | Qué exige (documento / registro / periodicidad) | Sistema decía | Cambio aplicado | Confianza | Fuente |
|---|---|---|---|---|---|---|---|---|
| LEY-9-1979 | Ley 9 de 1979, Código Sanitario Nacional, Título III | Vigente | Todo lugar de trabajo (arts. 80-85) | Programa permanente de medicina, higiene y seguridad; registro y notificación de AT y EL; capacitación; EPP sin costo (arts. 84, 111, 122-124) | "Arts. 80-154", sin obligaciones concretas | Artículos acotados y resumen con obligaciones | Alta | SISJUR 1177 |
| CST-1950 | Código Sustantivo del Trabajo arts. 348-352 | Vigente (art. 349 mod. Ley 962/2005 art. 55) | 10 o más trabajadores **permanentes** (art. 349); establecimientos nuevos: 3 meses | Reglamento de Higiene y Seguridad Industrial con el contenido del art. 350, fijado en dos lugares visibles (art. 351); ya no requiere aprobación del Ministerio | 10 o más permanentes; arts. 348-351; no mencionaba el plazo ni la Ley 962 | Plazo de 3 meses, Ley 962/2005 y art. 352 en catálogo y regla | Alta | Sin URL en el catálogo |
| RES-2400-1979 | Estatuto de Seguridad Industrial | Vigente; derogada parcialmente en calderas (Res. 1857/2024) y desplazada en alturas por la Res. 4272/2021 | Todo establecimiento de trabajo | Locales, sanitarios, iluminación, ruido, electricidad (121-152), EPP (176-201), incendios (1 extintor por 200 m², art. 221), máquinas (266-295), cargas (388-397: 50/20 kg al hombro art. 390; 25/12,5 kg compacta art. 392; restricciones médicas art. 393), izaje (398-447) | Rangos incompletos ("2, 3, 17-21, 79-86, 170-201, 205-234"); cargas "388-392" | Rangos completos; disparadores maquinaria, cargas, caliente e izaje con artículos | Alta | SISJUR 53565 |
| DL-1295-1994 | Decreto Ley 1295 de 1994 | Vigente | Todo empleador | Afiliación y cotización (art. 4); obligaciones (21); clases de riesgo (26, 64); **Vigía en menos de 10 trabajadores (art. 35 par.)**; prevención (56); estadísticas (61); reporte AT/EL en 2 días hábiles (62); **COPASST: periodo 2 años y 4 h semanales (art. 63)**; sanciones (91) | Arts. 4, 21, 56, 62, 91; el Vigía se citaba a "Decreto 1072 art. 2.2.4.6.2 num. 9" (no existe) | Artículos ampliados; regla VIGIA y composición de comités citan arts. 35 par. y 63 | Alta | SISJUR 2629 |
| LEY-1562-2012 | Ley 1562 de 2012 | Vigente | Todo empleador; afiliación de contratistas con contrato formal de más de 1 mes, estudiantes e independientes de alto riesgo (art. 2) | Definiciones de AT y EL; SG-SST; multas hasta 500 SMMLV graduadas por tamaño (Decreto 1072 arts. 2.2.4.11.x), 20 a 1.000 si AT mortal (art. 13), hasta 1.000 por omitir reportes (art. 30) | "1 a 500 SMMLV; hasta 1.000 por AT mortal"; sin art. 2 | Sanciones precisadas; art. 2 sustenta la regla de contratistas | Alta | SISJUR 48365 |
| DEC-1072-2015 | Decreto 1072 de 2015, Libro 2 Parte 2 Título 4 Capítulo 6 | Vigente, sin cambios 2024-2026 | Todo empleador y contratante (art. 2.2.4.6.1) | Rendición de cuentas anual (.8); capacitación revisada cada año e inducción previa (.11); 16 documentos (.12); conservación 20 años (.13); matriz al menos anual (.15); plan anual firmado (.17); indicadores (.19-.22); EPP sin costo (.24 par. 1); emergencias con simulacro anual y brigada (.25); contratistas (.28); auditoría anual (.29); revisión por la dirección anual (.31); investigación (.32); curso 50 h (.35); contratar no traslada la responsabilidad (.42) | "Arts. 2.2.4.6.1 a .42" sin periodicidades | Periodicidades y artículos explícitos; evidencias | Alta | Colpensiones pr009 |
| RES-0312-2019 | Estándares Mínimos | Vigente (no ha sido reemplazada) | Todo empleador; 7 estándares: 10 o menos trabajadores y riesgo I-III (art. 3); 21: 11 a 50 y riesgo I-III (art. 9); 60: más de 50 o riesgo IV-V (arts. 8, 15, 16); UPA (art. 7); independientes voluntarios no obligados (art. 2 par. 2) | Perfil de quien **diseña**: técnico con licencia, 1 año de experiencia y curso 50 h, o tecnólogo/profesional (arts. 3-4); tecnólogo con 2 años o profesional (arts. 9-10); profesional o posgrado (16-17); quien solo tiene 50 h ejecuta pero no diseña (art. 4); todos los centros y turnos (art. 20); contar a todos los que laboran (art. 23); autoevaluación cada diciembre (26); "no aplica" puntúa máximo en menos de 50 riesgo I-III (27); crítico menos de 60, moderado 60-85, aceptable más de 85, informe de avance en julio (28); indicadores (30); alto riesgo (31); PESV (32) | "Arts. 3, 9, 16, 25-28, 30"; el motor no validaba experiencia ni distinguía diseñador de ejecutor | Motor valida experiencia (1 y 2 años), rol y licencia; artículos clave completos | Alta | normograma MinTIC |
| CIR-027-2026 | Circular 027 de 2026 (MinTrabajo, 26-feb-2026) | Vigente para la vigencia 2025; la circular es anual | Todo empleador obligado a la autoevaluación | Registro de autoevaluación 2025 y plan de mejoramiento hasta el 31 de julio de 2026; copia a la ARL; informe de avance en julio; deja sin efecto la Circular 009/2025 | Igual, sin numerales ni URL oficial | Numerales 1-3, remisión a Res. 0312 arts. 26-28 y URL oficial | Alta | normograma MinTIC |
| DEC-0768-2022 | Decreto 768 de 2022 | Vigente (efectivo aprox. noviembre de 2022) | Todo empleador afiliado al SGRL | Tabla CIIU Rev. 4 A.C. y clase de riesgo; clase por centro de trabajo cuando difieren (art. 4); actividad no incluida se clasifica por la más afín (art. 5); deroga el Decreto 1607/2002 (art. 9) | No existía; se citaba el Decreto 1607/2002 | Creado; las explicaciones de clase de riesgo lo citan | Alta | SISJUR 123517 |
| DEC-1607-2002 | Decreto 1607 de 2002 | **Derogado** por el Decreto 768/2022 art. 9 | — | — | Vigente, "art. 2" | Marcado derogado (derogadaPor DEC-0768-2022) | Alta | Función Pública i=5536 |
| DEC-1477-2014 | Tabla de Enfermedades Laborales | Vigente; modificado por el Decreto 676/2020 (COVID-19) y el Decreto 1036/2026 (dermatofitosis del pie) | Referencia para todo empleador | Tabla de doble entrada; criterios para enfermedades no listadas (arts. 2-3) | "Anexo técnico" | Modificaciones y arts. 1-4 | Media (el Decreto 1036/2026 lo cita el informe A sin URL) | SISJUR 58849 |
| RES-1016-1989 | Programas de Salud Ocupacional | **Sin exigibilidad desde el 1 de junio de 2017** (Decreto 1072 art. 2.2.4.6.37 par. 3) | — | Referencia histórica | "Subsiste en lo no contrario al Decreto 1072" | Reetiquetada como referencia histórica; no citar como fundamento | Alta | SISJUR 5412 |
| RES-4927-2016 | Curso virtual de 50 horas | Vigente (+ Circular 047/2025) | Responsables del SG-SST, COPASST, CCL y brigadas (art. 2) | Curso gratuito de la ARL (art. 3); en 10 o menos trabajadores con riesgo I-III el ejecutor interno no requiere licencia pero sí el curso (art. 14); la responsabilidad no se traslada (art. 15); **actualización de 20 horas cada 3 años (art. 16)** | "Arts. 1-7"; sin control de los 3 años | Motor avisa cuando el certificado supera 3 años y aplica la excepción del art. 14 | Alta | SISJUR 91300 |
| CIR-047-2025 | Circular 047 de 2025 | Vigente | Responsables con curso de 50 h de más de 3 años | Requisitos, módulos y registro del curso de actualización de 20 horas | No existía | Creada | Media (URL del normograma por confirmar) | normograma MinTIC |
| GTC-45-2012 | Guía Técnica Colombiana 45 | Guía no vinculante | Referencia metodológica | Identificación de peligros y valoración de riesgos (ND, NE, NP, NC, NR); la actualización anual viene del Decreto 1072 art. 2.2.4.6.15 | Igual | Se aclara que no es ley y de dónde sale la periodicidad | Alta | ICONTEC (documento de pago) |
| LEY-2466-2025 | Reforma laboral | Vigente desde el 25 de junio de 2025; jornada nocturna desde el 25 de diciembre de 2025 | Todo empleador | Nocturno 7:00 p. m. a 6:00 a. m. (art. 10); evaluación de cargos coherente con el SG-SST (art. 9); ajustes razonables y cuota de discapacidad (15); no discriminación y no despido por razones de salud incluida la mental (16-17, Sentencia C-081/2026); trabajo libre de violencia y acoso (18); aprendizaje (21); plataformas (24-30); teletrabajo híbrido y transnacional (52-54); permisos remunerados que no son incapacidad (57) | No existía | Creada; disparador de trabajo nocturno con la franja horaria; reglas de aprendices, teletrabajo y acoso la citan | Alta | SISJUR 181933 |
| LEY-2101-2021 | Jornada de 42 horas | Vigente; 42 horas desde el 15 de julio de 2026 (art. 3) | Todo empleador | Jornada máxima semanal; incide en turnos y riesgo psicosocial | No existía | Creada; la regla de trabajo nocturno la cita | Media (fecha de cierre de la gradualidad por confirmar, sección 5) | Función Pública i=166506 |
| LEY-776-2002 | Prestaciones del SGRL | Vigente | Todo empleador | Reincorporar al terminar la incapacidad temporal (art. 4); reubicar sin desmejora en incapacidad permanente parcial (art. 8) | No existía | Creada | Alta | Función Pública i=16752 |
| LEY-1581-2012 | Protección de datos personales (+ Decreto 1377/2013) | Vigente | Todo responsable del tratamiento | Datos de salud sensibles (art. 5); autorización previa, expresa e informada (6 lit. a, 9); advertir que responder sobre datos sensibles es facultativo y la finalidad (12; Decreto 1377 arts. 5-8); política y aviso de privacidad (17 lit. k; Decreto 1377 art. 13) | "Arts. 5, 6" | Artículos completos; FOR-01 pendiente de ajuste | Alta | SISJUR 49981 |
| LEY-1335-2009 | Ambientes libres de humo | Vigente | Todo empleador | Prohibido fumar en áreas cerradas de trabajo (art. 19) y vehículos de trabajo (21); avisos y medidas (20) | No existía | Creada; base de la política de tabaco junto con la Res. 1843 art. 25 | Alta | SISJUR 36878 |

### 3.2 Reporte e investigación de accidentes y enfermedades

| Código | Norma | Vigencia | A quién aplica | Qué exige | Sistema decía | Cambio aplicado | Confianza | Fuente |
|---|---|---|---|---|---|---|---|---|
| RES-0156-2005 | Formatos FURAT y FUREL | Vigente (art. 3 mod. Res. 2851/2015) | Todo empleador | Reporte a ARL y EPS en 2 días hábiles; AT graves y mortales **y enfermedades laborales diagnosticadas** también a la Dirección Territorial del Ministerio (Decreto 1072 art. 2.2.4.1.7, Decreto 472/2015 art. 14) | No existía; el plazo al Ministerio solo salía para AT graves/mortales y citaba "Decreto 1072" sin artículo | Creada; el semáforo de plazos y PRC-08 agregan la EL al Ministerio y citan artículos | Alta | Cancillería 0156_2005 |
| RES-1401-2007 | Investigación de incidentes y AT | Vigente | Todo empleador | Investigar todos los incidentes y AT en 15 días (art. 4 num. 2); equipo: jefe inmediato, COPASST o Vigía y encargado del SG-SST; en graves o mortales se suma profesional con licencia y personal de diseño de normas, procesos o mantenimiento (art. 7); AT grave (art. 3); remisión a la ARL en 15 días (art. 14); mortal con formato de la ARL | Arts. 4, 7, 14 | Equipo detallado; plazos citan art. 4 num. 2 y art. 14 | Alta | SISJUR 53497 |

### 3.3 Comités

| Código | Norma | Vigencia | A quién aplica | Qué exige | Sistema decía | Cambio aplicado | Confianza | Fuente |
|---|---|---|---|---|---|---|---|---|
| RES-2013-1986 | COPASST | Vigente | 10 o más trabajadores (art. 1) | Paritario: 10-49 un representante por parte; 50-499 dos; 500-999 tres; 1.000 o más cuatro (art. 2); reunión mensual (art. 7); funciones (art. 11). El periodo de 2 años y las 4 horas semanales son del Decreto Ley 1295/1994 art. 63 | Atribuía el periodo de 2 años y las 4 horas a la Res. 2013 (art. 7) | Cita corregida en catálogo, regla, ACT-01 y DOC-04 | Alta | Cancillería r2013_86 |
| RES-3461-2025 | Comité de Convivencia Laboral | Vigente desde el 1 de septiembre de 2025; deroga las Res. 652 y 1356/2012 (art. 16); el Consejo de Estado anuló del art. 2 las expresiones "contratantes", "contratistas" e "independientes" (1-oct-2026) | **Todo empleador, sin umbral (art. 2)** | Composición por tramos (art. 3): menos de 5 trabajadores 1 y 1 sin suplentes; 5 a 20, 1 y 1 con suplentes; más de 20, 2 y 2 con suplentes; comité central y uno por centro de trabajo; periodo 2 años (5); reglamento con acuerdo de confidencialidad (4); quejas: recepción 5 días, examen 5 (ampliable a 10, máximo 15), escucha 5, diálogo y plan 5 (ampliable a 10, máximo 15), recomendaciones 5-10, remisión 15, total máximo 65 días; seguimiento mensual; informes trimestrales y anual (6); reunión mensual con quórum mitad más uno (9); extraordinaria por queja (10); capacitación a directivos, mandos y miembros (12); impedimento de quejosos y víctimas en el **año anterior**; no conoce acoso sexual | "Verificar texto oficial"; docs/01 dudaba de un umbral de 10; ACT-04 usaba 6 meses de impedimento (según informe B) | Resumen completo; regla CCL con tramos; función de composición | Alta (la nulidad parcial: media) | SISJUR 190589 |
| RES-0652-2012 | Comité de Convivencia (anterior) | **Derogada** con la Res. 1356/2012 por la Res. 3461/2025 art. 16 | — | — | Derogada | Sin cambio de fondo | Alta | — |

### 3.4 Psicosocial, acoso y salud mental

| Código | Norma | Vigencia | A quién aplica | Qué exige | Sistema decía | Cambio aplicado | Confianza | Fuente |
|---|---|---|---|---|---|---|---|---|
| LEY-1010-2006 | Acoso laboral | Vigente; caducidad de 3 años (art. 18, Ley 2209/2022) | Todo empleador | Mecanismos de prevención y procedimiento interno confidencial, conciliatorio y efectivo en el reglamento (art. 9 num. 1); campaña de acción colectiva ante acoso sexual (art. 9 num. 10, Ley 2365/2024) | "Arts. 2, 7, 9" | Arts. 1, 2, 7, 9 (nums. 1 y 10), 14, 18 | Alta | SISJUR 18843 |
| LEY-2365-2024 | Acoso sexual en el ámbito laboral | Vigente desde el 20 de junio de 2024; Decreto 405/2025 reglamenta la multa | Todo empleador y contratante | Política en reglamento, contratos y protocolos con rutas (art. 11); informar a la víctima que puede acudir a la Fiscalía y remitir la queja si lo pide (11 nums. 4-5); publicación semestral anonimizada de quejas y sanciones y remisión al SIVIGE (11 num. 7); superior jerárquico implicado: Inspección de Trabajo (par. 3); medidas de protección en máximo 5 días hábiles y atención psicológica por la ARL (13); despido en los 6 meses siguientes sin efecto (14); queja por cualquier medio (15); campaña (16). **No exige una "persona designada"** | "Arts. 5-12", "procedimiento propio distinto del CCL" | Obligaciones y artículos concretos; regla ACOSO-VIOLENCIA | Alta | SISJUR 157481 |
| DEC-1040-2026 | Protección frente al acoso, la violencia basada en género y la discriminación (Capítulo 8, Título 1, Parte 2, Libro 2 del Decreto 1072) | Expedido el 5 de agosto de 2026 (DO 53.580); rige sin transición (el catálogo registra el 6 de agosto; ver sección 5) | **Todo empleador, sin umbral** | Política participativa articulada con el SG-SST y el CCL; protocolo con ruta, canales confidenciales, medidas de protección en máximo 5 días hábiles y registro estadístico; socialización; **formación anual**; mención en reglamento interno y contratos; ineficacia del despido por 6 meses | No existía | Creada; regla ACOSO-VIOLENCIA produce POL-03 y PRC-06 | Alta | Cancillería decreto_1040_2026 |
| LEY-2191-2022 | Desconexión laboral | Vigente desde el 6 de enero de 2022 | Todo empleador | Política de desconexión de reglamentación interna: cómo se garantiza, lineamientos de uso de tecnologías y procedimiento de quejas (art. 5); su inobservancia puede constituir acoso laboral | No existía | Creada; regla DESCONEXION (todavía sin plantilla) | Alta | Función Pública i=177586 |
| RES-2646-2008 | Factores de riesgo psicosocial | Vigente | Todo empleador | Identificar, evaluar, prevenir, intervenir y monitorear (arts. 5-9) con instrumentos validados (10), reserva y consentimiento (11), **actualización anual (12)**, medidas contra el acoso (14), PVE si el riesgo es alto (16); psicólogo con posgrado en salud ocupacional y licencia (art. 3 lit. p) | "Arts. 5-13" | Artículos ampliados; perfil del psicólogo en la regla | Alta | SISJUR 31607 |
| RES-2764-2022 | Batería de riesgo psicosocial | Vigente; deroga la Res. 2404/2019 (art. 10) | **Todo empleador, sin umbral (art. 2)** | Evaluación anual si el riesgo es alto o muy alto, cada 2 años si es medio o bajo, siempre con intervención (art. 3); virtual solo con la herramienta del Ministerio (4 par.); custodia en el psicólogo o la IPS, el empleador no conserva copias (5); protocolos de intervención (7) | "Arts. 2-4"; PRG-04 solo desde 21 estándares; presupuesto solo desde 21 | PRG-04 desde 7 estándares; presupuesto y plan anual para todos; regla detallada | Alta | SISJUR 127124 |
| LEY-1616-2013 | Ley de Salud Mental | Vigente (mod. Ley 2460/2025) | ARL y empresas afiliadas | Las ARL garantizan que sus afiliadas incluyan en el SG-SST el monitoreo permanente de factores psicosociales (art. 9) | "El empleador debe promover la salud mental" | Precisión: la carga es de la ARL con sus afiliadas | Alta | SISJUR 51292 |
| LEY-2460-2025 | Modifica la Ley 1616 | Vigente desde el 18 de junio de 2025 | Todo empleador | Parágrafo nuevo del art. 9 de la Ley 1616: armonizar con la ARL la prevención de riesgos psicosociales, ambiente libre de acoso, medidas de bienestar y salud mental durante la jornada con prelación a mujeres víctimas de violencia y personas con discapacidad; **sin plazo** y **sin prohibición de despido** | "Art. 9 (verificar)"; docs/01 afirmaba que prohíbe el despido sin autorización | Resumen acotado al parágrafo; se retira la afirmación del despido | Alta | SISJUR 180887 |
| DEC-1072-2015-CAP13 | Decreto 728 de 2025 (Capítulo 13 del Título 4) | Vigente desde el 26 de junio de 2025, sin transición | Todo empleador (art. 2.2.4.13.2) | Programa de prevención de SPA en 7 pasos con la ARL (.3); plan de intervención en salud mental basado en la batería (.4); monitoreo permanente (.6); **información anual** desagregada por actividad, número de trabajadores, ocupación, sexo y edad a disposición de los inspectores (.10); sanciones (.11). No menciona literalmente política, matriz, plan anual ni SVE | "Integradas al SG-SST (matriz, plan anual y vigilancia epidemiológica)" | Resumen ajustado al texto; regla SALUD-MENTAL | Alta | normograma MinTIC |
| RES-1075-1992 | Prevención de farmacodependencia, alcoholismo y tabaquismo | **Derogada** por la Res. 1843/2025 art. 36 (6-may-2025) | — | Su contenido pasó al art. 25 y al art. 5 lit. g de la Res. 1843/2025 | Vigente; citada por la regla SALUD-MENTAL, POL-02, PRG-03 y el plan anual | Marcada derogada; reglas y plan anual citan la Res. 1843 art. 25 | Alta | — |

### 3.5 Salud en el trabajo

| Código | Norma | Vigencia | A quién aplica | Qué exige | Sistema decía | Cambio aplicado | Confianza | Fuente |
|---|---|---|---|---|---|---|---|---|
| RES-1843-2025 | Evaluaciones médicas ocupacionales | Vigente desde el 6 de mayo de 2025; exigible en plenitud desde el 6 de noviembre de 2025 (art. 35); deroga las Res. 2346/2007, 1918/2009, 1075/1992 y 4050/1994 (art. 36) | Todo empleador | Seis tipos (art. 8): pre-ingreso (9), periódicas programadas y por cambio de ocupación (10), **egreso en 5 días hábiles con constancia de notificación (11)**, retorno tras ausencia no médica de 90 días o más (12), **post-incapacidad de 30 días o más (13)**, seguimiento (14); periodicidad definida por la empresa con justificación técnica, máximo 3 años (15); **perfil de cargo** (3 lit. m) elaborado por el empleador y entregado con la matriz de peligros (16); costo 100 % del empleador, la ARL no puede pagar (5-a, 6, 26 par. 2); concepto comunicado por escrito a cada trabajador (5-i); **adaptar el puesto en máximo 20 días hábiles (5-f)**; PVE (5-e); campañas de farmacodependencia, alcohol y tabaco (5-g, 25); pausas activas (5-h); evitar "no apto" (19); prohibido exigir embarazo, VIH y VDRL (21); historia clínica 20 años en el prestador, sin copia en la empresa (30) | "Ingreso, periódicas, retiro"; "profesiograma"; artículos "verificar texto oficial" | Resumen completo con artículos; plan anual y reglas la citan para campañas | Alta | Cancillería 1843_2025 |
| RES-2346-2007 | Evaluaciones médicas (anterior) | **Derogada** (Res. 1843/2025 art. 36) | — | — | Derogada | Nota de derogatorias conjuntas | Alta | — |
| RES-8321-1983 | Protección y conservación de la audición | Vigente (Capítulo V); el límite de 85 dB(A) proviene de la Res. 2844/2007 | Disparador ruido | Mediciones (47); correctivos y jerarquía de controles (48, 51); programa de conservación auditiva (49-50); audiometrías de ingreso, control a los 90 días, seguimiento máximo cada 2 años y retiro (53) | "Arts. 41-48" | Arts. 41-55, audiometrías y límite actual; regla RUIDO | Alta | Colpensiones r8321_83 |
| RES-2844-2007 | Guías de Atención Integral (GATI-SO) | Vigente | Disparadores ruido, cargas o químicos | Guías de referencia obligatoria: hipoacusia por ruido (85 dB(A), tasa de 3 dB), desórdenes musculoesqueléticos, dolor lumbar, hombro doloroso, neumoconiosis | No existía | Creada (criterio: citar la 2844 y **no** la Res. 1792/1990, ver sección 4) | Alta | Colpensiones 2844_2007 |
| RES-2674-2013 | Manipulación de alimentos | Vigente (art. 37 mod. Res. 3168/2015) | Disparador manipulación de alimentos | Reconocimiento médico con certificado de aptitud al menos una vez al año y cuando haya razón clínica o epidemiológica, con laboratorios a criterio médico (art. 11); capacitación continua de mínimo 10 horas anuales (12-13); prácticas higiénicas y dotación (14) | El disparador existía sin norma en el catálogo | Creada; regla ALIMENTOS | Alta | SISJUR 54030 |
| LEY-1823-2017 | Salas Amigas de la Familia Lactante (+ Res. 610/2026) | Vigente; la Res. 610 del 13 de abril de 2026 deroga la Res. 2423/2018 | Empresas privadas con capital de 1.500 SMMLV o más, o con capital menor pero **más de 50 empleadas** (en el motor: 51 trabajadoras) | Sala de lactancia en la sede principal y en sedes con más de 50 empleadas; inscripción previa ante la secretaría de salud (Res. 610 art. 7) | No existía | Creada; regla SALA-LACTANCIA; conteo de trabajadoras | Media (el criterio de capital no está modelado) | SUIN-Juriscol 30030244 |

### 3.6 Vinculaciones especiales

| Código | Norma | Vigencia | A quién aplica | Qué exige | Sistema decía | Cambio aplicado | Confianza | Fuente |
|---|---|---|---|---|---|---|---|---|
| DEC-1072-2015-CONTRATISTAS | Decreto 1072, Título 4 Capítulo 2 Sección 2 (Decreto 723/2013, mod. Decreto 676/2020) | Vigente | Contratantes con contratistas por prestación de servicios de más de 1 mes | Afiliación por el contratante (2.2.4.2.2.5); en clases IV y V el contratante paga (Ley 1562 art. 2 lit. a); verificar afiliación y pago, inducción, inclusión en el SG-SST, EPP (2.2.4.2.2.13); exámenes periódicos (2.2.4.2.2.18) | Solo una advertencia genérica con el art. 2.2.4.6.28 | Creada; regla CONTRATISTAS (desde 1 contratista) | Media (el informe E deja la numeración del artículo de exámenes "por verificar") | Cancillería pr007 |
| DEC-0223-2026 | Prácticas laborales y contrato de aprendizaje (subroga el Capítulo 3 del Título 6) | Vigente desde el 6 de marzo de 2026 (DO 53.419 del 5 de marzo) | Empresas con aprendices o practicantes; cuota con 15 o más trabajadores | ARL desde la fase lectiva al 100 % por la empresa según su clase de riesgo (2.2.6.3.3.6-7); practicantes con afiliación, EPP e inducción (2.2.6.3.1.10, 2.2.6.3.2.9); aprendices pueden integrar COPASST y CCL (2.2.6.3.3.24); cuota (2.2.6.3.3.47) | "Verificar texto oficial" | Confirmado; reglas APRENDICES y CUOTA-APRENDICES | Alta | SISJUR 192494 |
| DEC-2090-2003 | Actividades de alto riesgo (pensión especial) | Vigente con litigio: prórroga del Decreto 2655/2014 hasta el 31-dic-2024; Decreto 1435/2025 (prórroga excepcional) con el inciso 1 y el par. 1 del art. 1 **suspendidos** por el Consejo de Estado (auto del 21-oct-2026); la Ley 2381/2024 no lo regula | Disparador alto riesgo para pensión | Siete actividades (art. 2); 10 puntos adicionales a cargo del empleador (art. 5); definir por escrito los cargos e identificar a los expuestos (Res. 0312 art. 31) | "Arts. 2, 5", sin nota de litigio | Nota de litigio; regla con Res. 0312 art. 31; el cuestionario enumera las 7 actividades | Media (suspensión reportada con confianza media) | normograma MinTIC |

### 3.7 Teletrabajo y trabajo en casa

| Código | Norma | Vigencia | A quién aplica | Qué exige | Sistema decía | Cambio aplicado | Confianza | Fuente |
|---|---|---|---|---|---|---|---|---|
| LEY-1221-2008 | Teletrabajo (mod. Ley 2466/2025 arts. 52-55) | Vigente | Disparador teletrabajo | Incluir el puesto del teletrabajador en el SG-SST (art. 6 num. 9); informar la vinculación al inspector (art. 7); cinco modalidades | El disparador mezclaba teletrabajo y trabajo en casa, sin norma en el catálogo | Creada; regla TELETRABAJO | Alta | SISJUR 31431 |
| DEC-1227-2022 | Reglamentación del teletrabajo (Decreto 1072 arts. 2.2.1.5.1-.25) | Vigente | Disparador teletrabajo | Formulario de la ARL por teletrabajador, informar modalidad, jornada y lugar, incluir en la matriz, equipos, desconexión, capacitación previa en ergonomía, salud mental y seguridad digital (2.2.1.5.8); política interna (2.2.1.5.18); visita solo si se determina necesaria (2.2.1.5.15); registro ante el Ministerio (2.2.1.5.23) | No existía | Creada | Alta | SISJUR 125523 |
| LEY-2088-2021 | Trabajo en casa | Vigente | Disparador trabajo en casa (nuevo) | Habilitación temporal hasta 3 meses prorrogables (art. 7); informar a la ARL la dirección (9); cobertura (11); desconexión (6) | Mezclada con teletrabajo | Creada; disparador separado; regla TRABAJO-EN-CASA | Alta | Función Pública i=162970 |
| LEY-2121-2021 | Trabajo remoto (Decreto 555/2022) | Vigente | Disparador teletrabajo | Verificación virtual del lugar con la ARL (art. 4 lit. c); exámenes de ingreso, periódicos y egreso (8); herramientas (10); desconexión (17); copia del contrato y formulario a la ARL (20) | No existía | Creada | Alta | SISJUR 115620 |

### 3.8 Seguridad vial

| Código | Norma | Vigencia | A quién aplica | Qué exige | Sistema decía | Cambio aplicado | Confianza | Fuente |
|---|---|---|---|---|---|---|---|---|
| LEY-1503-2011 | Seguridad vial, PESV | Vigente (art. 12 mod. Decreto Ley 2106/2019 art. 110; art. 12A por Ley 2050/2020) | Flota **superior a 10 vehículos (11 o más)** automotores o no automotores, **o** quien contrate o administre conductores | PESV según misionalidad y tamaño, articulado al SG-SST, sin aval previo | "10 o más vehículos o conductores" (condición vehículos ≥ 10) | Condición "11 vehículos o 2 conductores"; campo de conductores; nivel del PESV | Alta | SISJUR 45453 |
| LEY-2050-2020 | Verificación y sanciones del PESV | Vigente | Obligados al PESV | Verificación por Supertransporte, organismos de tránsito o MinTrabajo según el tipo de organización (art. 1); programa pedagógico del art. 12A (2); sanciones: empresas de transporte por la Ley 336/1996, las demás por la Ley 1562 art. 13 (6) | No existía | Creada | Alta | SISJUR 95565 |
| DEC-1252-2021 | Reglamentación del PESV (Decreto 1079/2015 arts. 2.3.2.3.1-.4) | Vigente | Obligados al PESV | Obligados, diseño por misionalidad y tamaño, articulación al SG-SST; en leasing o renting la obligación es del arrendatario (art. 2.3.2.3.2 par. 3) | No existía | Creada | Alta | SISJUR 117692 |
| RES-40595-2022 | Metodología del PESV | Vigente (compilada en la Res. 20223040045295/2022) | Obligados al PESV | Niveles (Tabla 1): empresas de transporte, básico 11-19 vehículos o 2-19 conductores, estándar 20-50, avanzado más de 50; las demás, básico 11-49 vehículos o 2-49 conductores, estándar 50-100, avanzado más de 100; si cae en dos niveles aplica el más alto; 18/22/24 pasos; empresas nuevas: 1 año desde la constitución (art. 3) | "Anexo" | Niveles en el motor (empresa de transporte por CIIU 49); advertencia con el nivel | Alta | normograma MinTIC |
| CIR-034-2026 | Reporte anual de autogestión del PESV | Vigente | Obligados al PESV que no son empresas de transporte (misionalidad 2) | Reporte anual al MinTrabajo de los indicadores de autogestión (Tabla 10 de la Res. 40595), corte 31 de diciembre, plazo 31 de enero escalonado por NIT (el de 2025 tuvo plazo excepcional hasta el 30 de mayo de 2026) | No existía | Creada; la advertencia del PESV la cita | Alta | SISJUR 192890 |

### 3.9 Tareas de alto riesgo y peligros específicos

| Código | Norma | Vigencia | A quién aplica | Qué exige | Sistema decía | Cambio aplicado | Confianza | Fuente |
|---|---|---|---|---|---|---|---|---|
| RES-4272-2021 | Trabajo seguro en alturas | Vigente desde el 8 de agosto de 2022; deroga las Res. 1409/2012, 1903/2013, 3368/2014, 1178/2017 y 1248/2020 (art. 68) | Disparador alturas: riesgo de caída **mayor a 2,0 m (art. 3)** | Programa de prevención y protección contra caídas (4-5); permiso con lista de chequeo (15); hoja de vida de equipos de acceso con inspección anual (16); plan de rescate (26); capacitación: jefe de área 8 h, trabajador autorizado 32 h, coordinador 80 h, entrenador 130 h; reentrenamiento de mínimo 8 h al ingreso, por cambios o fallas (27); inspección de EPP al menos anual (61 lit. g); aptitud médica según Res. 1843/2025 | "1,5 m o más"; "arts. 3-30"; capacitación "según nivel" | 2,0 m en catálogo, cuestionario, regla, PRG-08 y biblioteca; capacitaciones por rol | Alta (el reentrenamiento: media, ver sección 5) | Cancillería 4272_2021 |
| RES-0491-2020 | Espacios confinados | Vigente desde el 1 de agosto de 2021 (Res. 2605/2020) | Disparador confinados | Programa (7); roles administrador, supervisor, vigía y entrante (10); inventario (14); permiso (17); mediciones (21); rescate (27); capacitación administrador 8 h, entrante 16 h, supervisor 20 h, vigía 8 h; **actualización cada 3 años** a cargo del empleador (29-30) | "Arts. 4-20" | Artículos, horas y actualización trienal (no anual) | Alta | SISJUR 90906 |
| RES-2605-2020 | Modifica la Res. 0491/2020 | Vigente | Disparador confinados | Vigencia 1-ago-2021 (art. 4); límite de hidrocarburos 5 mg/m³ (art. 1); actualización de la formación cada 3 años, no exigible como requisito de contratación (art. 3) | No existía | Creada | Alta | SISJUR 103207 |
| DEC-1496-2018 | SGA de productos químicos | Vigente; transición vencida | Disparador químicos: todo uso con al menos un peligro SGA, **incluidos los de aseo** (art. 2); excluye farmacéuticos, aditivos alimentarios y cosméticos en uso final (art. 2 par. 2) | Clasificación, etiquetado y FDS conforme al SGA | "Arts. 1-9" | Alcance precisado; arts. 2, 14, 17, 18 | Alta | normograma MinTIC |
| RES-0773-2021 | Implementación del SGA en los lugares de trabajo | Vigente; transición vencida en abril de 2023 (sustancias) y abril de 2024 (mezclas) | Disparador químicos | Inventario, FDS en español al ingreso (16), acceso permanente, señalización, **capacitación al menos una vez al año** (21.7), **revisión de etiquetas y FDS cada 5 años** (18) | "Arts. 3-9" | Artículos y periodicidades; regla QUIMICOS | Alta | SISJUR 188855 |
| RES-5018-2019 | SST en procesos con energía eléctrica | Vigente; deroga la Res. 1348/2009; transición de la Res. 2550/2020 vencida | Disparador eléctrico: sector eléctrico y toda actividad con peligro eléctrico (art. 2) | Procedimientos y permisos, cinco reglas de oro, EPP dieléctricos, competencias, distancias de seguridad | El disparador citaba "Res. 2400/1979; RETIE" sin norma de SST | Creada; regla ELECTRICO | Alta | SISJUR 88299 |
| RES-40117-2024 | RETIE | Vigente desde el 3 de abril de 2024; modificada por las Res. 40304/2025 y 40284/2026 | Disparador eléctrico | Instalaciones diseñadas, construidas, inspeccionadas y mantenidas conforme al reglamento por personal con matrícula; dictamen de inspección | No existía | Creada | Alta | SISJUR 154095 |
| DEC-0780-2016 | Residuos de atención en salud y otras actividades (arts. 2.8.10.1-.18, Decreto 351/2014) | Vigente | Disparador residuos de salud (nuevo): salud, laboratorios, veterinaria, plantas de beneficio, funerarias, estética, tatuajes, lavanderías hospitalarias (2.8.10.2) | Plan de gestión integral, capacitación, EPP, plan de contingencia (2.8.10.6) | El riesgo biológico citaba "Decreto 1072" de forma genérica; una "Res. 2254" que no existe | Creada; disparador y regla RESIDUOS-SALUD | Alta | Cancillería decreto_0351_2014 |
| RES-0591-2024 | Manual PGIRASA | Vigente; deroga la Res. 1164/2002; transición vencida aprox. octubre de 2025 | Disparador residuos de salud | Manual del PGIRASA: segregación, bioseguridad, capacitación, EPP, articulación con el SG-SST | No existía | Creada | Alta | INVIMA |
| DEC-1347-2021 | Accidentes mayores (Capítulo 12 del Título 4) | Vigente; desarrollado por las Res. 5492/2024, 1890/2025 y 3687/2025 | Disparador instalación clasificada (nuevo) | Sistema de gestión de accidentes mayores articulado al SG-SST, registro de incidentes, reporte de accidentes mayores en 24 horas, informe de seguridad | No existía | Creada; regla ACCIDENTES-MAYORES (sin documento) | Media (fuente secundaria) | safetya.co |
| DEC-2157-2017 | PGRDEPP | Vigente | **Solo** entidades del art. 2.3.1.5.1.2.2 del Decreto 1081/2015: servicios públicos, obras civiles mayores, actividades industriales, transporte y almacenamiento de carga, construcciones de categoría IV, aglomeraciones de público y las que señale la UNGRD | Plan con conocimiento y reducción del riesgo, manejo del desastre (plan de emergencia y contingencia), plan de inversiones, revisión anual, entrega al consejo territorial | Aplicaba a **toda** empresa (PLN-04, ACT-05, peligros de incendio/sismo/inundación, catálogo de extintores) | Condición con cinco disparadores nuevos; regla PGRDEPP; el plan de emergencias general se funda en el Decreto 1072 art. 2.2.4.6.25 | Alta | normograma MinTIC |
| RES-0908-2025 | Licencias en SST | Vigente desde el 16 de septiembre de 2025; deroga la Res. 754/2021 | Prestadores de servicios de SST (la consultora y el responsable que diseña) | Licencia vigente para quien diseña y firma (Res. 0312 arts. 4, 10, 17) | "Verificar" | Confirmada | Media (fuente secundaria) | safetya.co |

---

## 4. Normas agregadas y normas descartadas

### 4.1 Agregadas al catálogo (27) y por qué

| Norma | Motivo |
|---|---|
| Decreto 768/2022 | Reemplaza al Decreto 1607/2002 (derogado) como base de la clase de riesgo. |
| Circular 047/2025 | Curso de actualización de 20 horas que el motor ahora controla. |
| Ley 2466/2025 | Reforma laboral con obligaciones directas en el SG-SST (nocturno, salud mental, violencia y acoso, aprendices, teletrabajo). |
| Ley 2101/2021 | Jornada de 42 horas; afecta turnos y riesgo psicosocial. |
| Ley 776/2002 | Reincorporación y reubicación tras AT/EL, que las plantillas de reintegro deben citar. |
| Ley 1335/2009 | Base legal real de la prohibición de fumar en el trabajo (la Res. 1075/1992 está derogada). |
| Res. 156/2005 | Formatos FURAT/FUREL y plazo de 2 días hábiles; antes solo se citaba el Decreto Ley 1295. |
| Decreto 1040/2026 | Nueva obligación para todo empleador: política y protocolo frente al acoso, la violencia de género y la discriminación. |
| Ley 2191/2022 | Política de desconexión laboral, obligatoria y ausente del sistema. |
| Res. 2844/2007 | Fija el criterio vigente de ruido (85 dB(A), 3 dB) y las GATI de DME, lumbar y hombro. |
| Res. 2674/2013 | El disparador de manipulación de alimentos existía sin norma. |
| Ley 1823/2017 (+ Res. 610/2026) | Sala de lactancia con más de 50 trabajadoras. |
| Decreto 1072 Sección de contratistas (Decreto 723/2013) | Obligaciones del contratante con contratistas por prestación de servicios. |
| Ley 1221/2008, Decreto 1227/2022, Ley 2088/2021, Ley 2121/2021 | El disparador de teletrabajo existía sin ninguna norma detrás; ahora se separan teletrabajo permanente y trabajo en casa temporal. |
| Ley 2050/2020, Decreto 1252/2021, Circular 034/2026 | Completan el bloque del PESV: verificación, obligados y reporte anual. |
| Res. 2605/2020 | Modifica la Res. 0491 (vigencia y actualización trienal). |
| Res. 5018/2019 y Res. 40117/2024 (RETIE) | El disparador eléctrico citaba el RETIE sin número y no citaba la norma de SST del sector. |
| Decreto 780/2016 (arts. 2.8.10.x) y Res. 591/2024 | Subdisparador de residuos de atención en salud; el riesgo biológico no tenía norma general. |
| Decreto 1347/2021 | Instalaciones clasificadas (accidentes mayores). |

### 4.2 Descartadas y por qué (informe E, sección E)

| Norma | Por qué no se cataloga |
|---|---|
| Res. 2404/2019 | Derogada por la Res. 2764/2022 art. 10. |
| Res. 1409/2012 y afines (1903/2013, 3368/2014, 1178/2017, 1248/2020) | Derogadas por la Res. 4272/2021 art. 68. |
| Res. 1111/2017 | Sustituida por la Res. 0312/2019. |
| Res. 4502/2012 | Licencias en SST; sustituida (hoy Res. 908/2025). |
| **Res. 1792/1990** | El informe C propuso catalogarla (límite de 85 dB(A), art. 1); el informe E indica que la Res. 2844/2007 la derogó tácitamente. **Criterio adoptado: no catalogarla y citar la Res. 2844/2007**, que contiene el criterio vigente (85 dB(A) y tasa de intercambio de 3 dB). |
| Res. 2423/2018 | Derogada por la Res. 610/2026. |
| Circulares anteriores (p. ej. 009/2025) | Sin efecto por la Circular 027/2026; cada año la reemplaza la siguiente. |
| Res. 3100/2019 | Habilitación de prestadores de salud; no es obligación del empleador. |
| Ley 2114/2021, Ley 1752/2015 | Sin obligación documental en SST. |
| Resoluciones internas del MinTrabajo; Res. 196/2026; Decreto 993/2026; Decreto 729/2025; Ley 2593/2026; Decretos 658-661/2026 | Descartadas por el informe E por no generar obligaciones de SST al empleador dentro del alcance del sistema (no se verificó el contenido de cada una). |
| Ley 2381/2024 (reforma pensional) | No regula las actividades de alto riesgo del Decreto 2090; su vigencia quedó para el 1 de abril de 2027 (Sentencia C-264/2026). |
| Normas de calor de otros países | Fuera del ordenamiento colombiano (la Circular 012/2024 sobre calor es orientativa). |
| "Decreto 0312/2026" | No es una norma de SST; no confundir con la Res. 0312/2019. |

Normas de confianza baja que el informe E menciona y que **no** se catalogaron por ser orientativas o de alcance muy específico: Ley 2528/2025 (Convenio 190 OIT), Circular 076/2025 (acoso sexual, orientativa), Ley 55/1993 (Convenio 170), Res. 1013/2008 (otras GATI), Decreto 676/2020, Decreto 1563/2016 (independientes voluntarios), Circular 012/2024 (calor), Circular 096/2026 (simulacro de sismo del 10-ago-2026), Decreto 720/2026 (medidas preventivas de inspectores), Decreto 991/2026 (plataformas), Decreto 660/2026 (periodistas), Ley 1252/2008 y Decreto 1076/2015 Título 6 (RESPEL, modificado por el Decreto 766/2026). Pueden agregarse si la consultora las considera necesarias para algún cliente.

---

## 5. Puntos que la consultora debe validar o decidir

1. **Conteo de contratistas en los umbrales de 10 y 50 trabajadores.** La Res. 0312 art. 23 y el Decreto 1072 art. 2.2.4.6.1 cubren a contratistas, cooperados y trabajadores en misión. Hoy el motor suma **planta + en misión** para el nivel de estándares, el COPASST y el Reglamento de Higiene; los contratistas se registran aparte y activan sus propias obligaciones. Decidir si los contratistas (y los aprendices) deben sumarse al umbral y, en ese caso, con qué criterio (por ejemplo, solo los que laboran en las instalaciones).
2. **Suplente del Vigía.** Ninguna norma exige suplente para el Vigía de SST (Decreto Ley 1295/1994 art. 35 par.; Res. 2013/1986). El sistema ahora lo presenta como buena práctica. Confirmar si se mantiene en las actas.
3. **Comité de Convivencia en empresas de 1 a 4 trabajadores.** La Res. 3461/2025 art. 3 prevé composición de 1 y 1 sin suplentes para menos de 5 trabajadores; el sistema lo exige a todos. Validar cómo se conforma en empresas con 1 o 2 trabajadores (en la práctica, el empleador y el único trabajador).
4. **Reentrenamiento en alturas.** El informe D lee el art. 27 num. 4 de la Res. 4272/2021 como reentrenamiento por eventos (ingreso, cambios, fallas) con mínimo 8 horas, y marca con confianza media la versión que habla de 18 meses. **El texto exacto del numeral no fue verificado.** El sistema no programa reentrenamiento anual; confirmar la periodicidad que la consultora aplicará.
5. **Decreto 1435/2025 (alto riesgo para pensión).** El Consejo de Estado suspendió provisionalmente el inciso 1 y el par. 1 del art. 1 (auto del 21 de octubre de 2026, confianza media). Para vinculaciones posteriores al 31 de diciembre de 2024 el régimen está en litigio. Decidir qué decir en las plantillas mientras se resuelve.
6. **Decreto 223/2026.** Se confirmó su existencia y contenido (DO 53.419). Validar en los clientes con aprendices que la cotización a la ARL desde la fase lectiva se esté haciendo con la clase de riesgo de la empresa.
7. **Nulidad parcial de la Res. 3461/2025.** La sentencia del Consejo de Estado del 1 de octubre de 2026 (confianza media) retira del ámbito a contratantes, contratistas e independientes. Confirmar la sentencia y decidir si los contratistas siguen participando en el CCL como invitados.
8. **Jornada de 42 horas.** La fecha de cierre de la gradualidad (15 de julio de 2026, Ley 2101/2021 art. 3) se tomó del informe E con confianza media. Confirmarla antes de usarla en el reglamento interno.
9. **Vacunación.** No existe un mandato general de vacunación para trabajadores con riesgo biológico; la vacunación es un **control de la matriz** (Decreto 1072 art. 2.2.4.6.24), salvo normas sectoriales. Las plantillas no deben presentarla como obligación legal general.
10. **"Decreto 0312/2026".** Mencionado en alguna fuente secundaria; **no es una norma de SST**. No usar.
11. **Fecha de vigencia del Decreto 1040/2026.** El informe E lo fecha el 5 de agosto de 2026 (DO 53.580) y el catálogo dice que rige desde el 6 de agosto. Confirmar la fecha de publicación; en todo caso no tiene transición.
12. **Sala de lactancia por capital.** La Ley 1823/2017 también obliga a empresas con capital de 1.500 SMMLV o más aunque tengan menos de 50 empleadas; el sistema solo evalúa el número de trabajadoras. Decidir si se agrega el dato de capital o una casilla manual.
13. **Impedimento en el CCL.** El informe B señalaba que ACT-04 hablaba de 6 meses; el texto vigente de la Res. 3461 es el **año anterior** y la plantilla ya lo dice así. Confirmar que las actas ya emitidas a clientes se actualicen en la próxima elección.

---

## 6. Cambios pendientes de implementar en el sistema

Lo que los informes recomendaron y **todavía no** está en el código al cierre de este documento. Se revisó el estado real del árbol de trabajo (catálogo, reglas, condiciones, motor, plazos de eventos, esquema, plantillas, biblioteca y pantallas). Ya están hechos y por eso **no** se listan: umbral y nivel del PESV en PRG-09; 2,0 m en PRG-08, biblioteca de peligros y catálogos; enfermedad laboral al Ministerio en PRC-08; retiro del Decreto 2157 de ACT-05 y PLN-04 (con sección condicional del PGRDEPP); Decreto Ley 1295 art. 63 en ACT-01 y DOC-04; Decreto 1040/2026 y Ley 2466 en POL-03 y PRC-06; composición por tramos e impedimento del año anterior en ACT-04; Decreto 768/2022 en el tablero, la ayuda y las explicaciones; Res. 1843 art. 25 en POL-02, PRG-03 y el plan anual; batería desde 7 estándares.

### 6.1 Formulario de Datos (pestaña de la empresa)

- **Responsable del SG-SST:** el motor ya lee `experienciaAnios`, `rol` (diseñador / ejecutor) y `curso20hFecha`, pero el formulario (`src/components/empresa/intake-wizard.tsx`) solo pide perfil, licencia, fecha de licencia, curso de 50 h y su fecha. Sin los tres campos nuevos la validación de experiencia (Res. 0312 arts. 3 y 9), la excepción de licencia del ejecutor (Res. 4927 art. 14) y el aviso de actualización de 20 h solo funcionan a medias (hoy el aviso se calcula únicamente con la fecha del curso de 50 h).
- **Empresa de transporte:** `esTransporte` se deduce solo del CIIU (división 49). Falta una casilla manual para empresas de transporte con otro CIIU principal y para flotas vinculadas.
- **Capital (SMMLV)** o casilla "obligada a sala de lactancia por capital" (Ley 1823/2017), porque hoy solo se evalúa el número de trabajadoras.
- Los disparadores nuevos ya aparecen en el cuestionario porque lee `DISPARADORES`, pero el campo `grupo: "especial"` todavía no se usa para separarlos visualmente de los peligros comunes.

### 6.2 Plantillas y textos

- **Política de desconexión laboral (Ley 2191/2022 art. 5):** la regla DESCONEXION solo emite un mensaje. No existe plantilla (ni en `prisma/seed/plantillas` ni en los complementarios). Crear la política con los tres contenidos del art. 5 o un capítulo del reglamento interno.
- **Teletrabajo:** la regla TELETRABAJO tampoco produce documento. Faltan la política de teletrabajo (Decreto 1072 art. 2.2.1.5.18) y el formato de autoevaluación del puesto remoto.
- **"Profesiograma" → "perfil de cargo"** (Res. 1843/2025 art. 3 lit. m): sigue apareciendo en DOC-07, PRC-07, PRG-02 y en `src/lib` (complementarios, manual, ayuda, decisiones, planeador, contexto del generador, plan anual). Al cambiarlo, incorporar los seis tipos de examen, la comunicación escrita del concepto, la adaptación del puesto en 20 días hábiles y la regla de no usar "no apto".
- **FOR-01 (datos del trabajador):** la autorización de datos no advierte que responder sobre datos sensibles es facultativo, cuáles son y con qué finalidad (Ley 1581 art. 12; Decreto 1377 arts. 5-8).
- **Biblioteca de peligros (`peligros-2.ts`):** diez peligros (incendio, explosión, sismo, inundación y afines) siguen citando `DEC-2157-2017` en sus normas; deben citar el Decreto 1072 art. 2.2.4.6.25 y dejar el 2157 solo cuando la empresa tenga alguno de los cinco disparadores del PGRDEPP.
- **PGRDEPP y accidentes mayores:** las reglas PGRDEPP y ACCIDENTES-MAYORES solo emiten mensaje. Decidir si el sistema genera un documento base del PGRDEPP (conocimiento, reducción, manejo del desastre, inversiones) o solo lo señala; igual para el sistema de gestión de accidentes mayores.
- **docs/02-estandares-minimos.md**, nota del art. 30: cita el Decreto 1607/2002 para la clase de riesgo; debe decir Decreto 768/2022.

### 6.3 Tareas automáticas (planeador)

Hoy el planeador genera exámenes periódicos, actualización del curso de 20 h, comités, plan anual, acciones, matriz, autoevaluación, EPP e inspecciones. No genera:

- **Examen de egreso** dentro de los 5 días hábiles siguientes al retiro de un trabajador, con constancia de la notificación (Res. 1843 art. 11).
- **Examen post-incapacidad** cuando una incapacidad llega a 30 días (art. 13) y **de retorno** tras ausencia no médica de 90 días (art. 12).
- **Adaptación del puesto** en 20 días hábiles cuando un concepto trae restricciones (art. 5 lit. f).
- **Reporte anual de autogestión del PESV** antes del 31 de enero (Circular 034/2026).
- **Publicación semestral anonimizada** de quejas de acoso sexual y remisión al SIVIGE (Ley 2365 art. 11 num. 7).
- **Información anual** del programa de salud mental y SPA desagregada (Decreto 728/2025, art. 2.2.4.13.10).
- **Formación anual** en prevención del acoso, la violencia y la discriminación (Decreto 1040/2026); **capacitación anual** en SGA (Res. 0773 art. 21.7) y **revisión quinquenal** de etiquetas y FDS (art. 18); **actualización trienal** de espacios confinados (Res. 0491 arts. 29-30).
- **Audiometrías** de control a los 90 días y periódicas máximo cada 2 años cuando hay ruido (Res. 8321 art. 53).

### 6.4 Motor y reglas

- **Comité de Convivencia por centro de trabajo:** el motor ya conoce el número de sedes (`sedes`) y existe la condición `sedesMin`, pero ninguna regla la usa; agregar la conclusión "un CCL por cada centro de trabajo" cuando hay más de una sede (Res. 3461 art. 3).
- **Conteo de contratistas en los umbrales** (sección 5, punto 1): implementar la decisión que tome la consultora en `contarTrabajadores` (hoy planta + en misión).
- **Reentrenamiento en alturas:** una vez la consultora confirme la periodicidad (sección 5, punto 4), reflejarla en el catálogo de capacitaciones y el planeador.

---

## 7. Fuentes consultadas (textos oficiales)

Compilaciones usadas: Régimen Legal de Bogotá (SISJUR), normogramas de MinTIC, Cancillería, Colpensiones e INVIMA, Gestor Normativo de Función Pública, SUIN-Juriscol. Donde el catálogo no registra URL se indica.

**Estructurales**
- Ley 9/1979: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=1177
- Res. 2400/1979: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=53565
- Decreto Ley 1295/1994: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=2629
- Ley 1562/2012: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=48365
- Decreto 1072/2015 cap. 6: https://normativa.colpensiones.gov.co/colpensiones/docs/decreto_1072_2015_pr009.htm
- Decreto 1072/2015 sección de contratistas: https://www.cancilleria.gov.co/sites/default/files/Normograma/docs/decreto_1072_2015_pr007.htm
- Res. 0312/2019: https://normograma.mintic.gov.co/mintic/compilacion/docs/resolucion_mtra_0312_2019.htm
- Circular 027/2026: https://normograma.mintic.gov.co/mintic/compilacion/docs/circular_mintra_0027_2026.htm
- Decreto 768/2022: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=123517
- Decreto 1607/2002 (derogado): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=5536
- Decreto 1477/2014: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=58849
- Res. 1016/1989 (histórica): https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=5412
- Res. 4927/2016: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=91300
- Circular 047/2025: https://normograma.mintic.gov.co/mintic/compilacion/docs/circular_mintra_0047_2025.htm (por confirmar)
- Ley 2466/2025: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=181933
- Ley 2101/2021: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=166506
- Ley 776/2002: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=16752
- Ley 1581/2012: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=49981 ; Decreto 1377/2013: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=53646
- Ley 1335/2009: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=36878
- Código Sustantivo del Trabajo y GTC 45: sin URL en el catálogo.

**Accidentes y comités**
- Res. 156/2005: https://cancilleria.gov.co/normograma/compilacion/docs/resolucion_minproteccion_0156_2005.htm
- Res. 1401/2007: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=53497
- Res. 2013/1986: https://cancilleria.gov.co/normograma/compilacion/docs/resolucion_minsalud_r2013_86.htm
- Res. 3461/2025: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=190589

**Psicosocial, acoso y salud mental**
- Ley 1010/2006: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=18843
- Ley 2365/2024: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=157481
- Decreto 1040/2026: https://www.cancilleria.gov.co/normograma/compilacion/docs/decreto_1040_2026.htm
- Ley 2191/2022: https://www.funcionpublica.gov.co/eva/gestornormativo/norma_pdf.php?i=177586
- Res. 2646/2008: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=31607
- Res. 2764/2022: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=127124
- Ley 1616/2013: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=51292
- Ley 2460/2025: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=180887
- Decreto 728/2025: https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_0728_2025.htm

**Salud en el trabajo y vinculaciones especiales**
- Res. 1843/2025: https://cancilleria.gov.co/normograma/compilacion/docs/resolucion_mtra_1843_2025.htm
- Res. 8321/1983: https://normativa.colpensiones.gov.co/colpens/compilacion/docs/resolucion_minsalud_r8321_83.htm
- Res. 2844/2007: https://normativa.colpensiones.gov.co/colpens/compilacion/docs/resolucion_minproteccion_2844_2007.htm
- Res. 2674/2013: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=54030
- Ley 1823/2017: https://www.suin-juriscol.gov.co/viewDocument.asp?ruta=Leyes/30030244
- Decreto 223/2026: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=192494
- Decreto 2090/2003: https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_2090_2003.htm

**Teletrabajo**
- Ley 1221/2008: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=31431
- Decreto 1227/2022: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=125523
- Ley 2088/2021: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=162970
- Ley 2121/2021: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=115620

**Seguridad vial**
- Ley 1503/2011: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=45453
- Ley 2050/2020: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=95565
- Decreto 1252/2021: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=117692
- Res. 40595/2022: https://normograma.mintic.gov.co/mintic/compilacion/docs/resolucion_mintransporte_40595_2022.htm
- Circular 034/2026: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=192890

**Tareas de alto riesgo y peligros específicos**
- Res. 4272/2021: https://cancilleria.gov.co/normograma/compilacion/docs/resolucion_mtra_4272_2021.htm
- Res. 0491/2020: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=90906
- Res. 2605/2020: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=103207
- Decreto 1496/2018: https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_1496_2018.htm
- Res. 0773/2021: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=188855
- Res. 5018/2019: https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=88299
- Res. 40117/2024 (RETIE): https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=154095
- Decreto 780/2016 arts. 2.8.10.x (texto del Decreto 351/2014): https://cancilleria.gov.co/normograma/compilacion/docs/decreto_0351_2014.htm
- Res. 591/2024: https://normograma.invima.gov.co/normograma/compilacion/docs/resolucion_minsaludps_0591_2024.htm
- Decreto 2157/2017: https://normograma.mintic.gov.co/mintic/compilacion/docs/decreto_2157_2017.htm
- Decreto 1347/2021 y Res. 5492/2024 (fuente secundaria): https://safetya.co/normatividad/resolucion-5492-de-2024/
- Res. 908/2025 (fuente secundaria): https://safetya.co/normatividad/resolucion-908-de-2025/
