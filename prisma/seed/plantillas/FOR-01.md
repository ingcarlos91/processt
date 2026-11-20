---
codigo: FOR-01
nombre: Encuesta de perfil sociodemográfico y condiciones de salud percibidas
tipo: FOR
nivelMin: 7
carpeta: 3. Gestión de la salud
estandares: ["3.1.1"]
normas: ["DEC-1072-2015","RES-0312-2019","LEY-1581-2012","DEC-1377-2013","RES-1843-2025"]
---
## Instrucciones

Esta encuesta permite elaborar la descripción sociodemográfica de los trabajadores de **{{empresa.razonSocial}}** y la caracterización de sus condiciones de salud percibidas, que hacen parte de la evaluación inicial y del informe de condiciones de salud del SG-SST (Decreto 1072 de 2015, arts. 2.2.4.6.12 numeral 4 y 2.2.4.6.16 numeral 7; Resolución 0312 de 2019, estándar 3.1.1).

- **Es anónima.** No escriba su nombre ni su documento. Solo se pide el cargo y el área para agrupar los resultados.
- **Es voluntaria.** Puede dejar en blanco cualquier pregunta, sin ninguna consecuencia laboral.
- **No pide diagnósticos.** Solo pregunta por molestias o síntomas que usted percibe y por sus hábitos. Los diagnósticos médicos hacen parte de la historia clínica ocupacional, que custodia el prestador de salud y que la empresa no puede conocer (Resolución 1843 de 2025, arts. 30 y 31).
- Los resultados se usan solo de forma agregada (por grupos, nunca por persona) para planear actividades de promoción y prevención.

## Aviso de privacidad y autorización

**Aviso de dato sensible (Ley 1581 de 2012, arts. 5, 6 y 12; Decreto 1377 de 2013, art. 6):** las preguntas de las secciones "Hábitos y estilos de vida" y "Condiciones de salud percibidas" recogen **datos sensibles** (relativos a la salud). Por tratarse de datos sensibles, **usted no está obligado a responderlas ni a autorizar su tratamiento**.

- **Responsable del tratamiento:** {{empresa.razonSocial}}, NIT {{empresa.nit}}, {{default empresa.direccion "dirección: __________"}}, {{default empresa.ciudad ""}}; teléfono {{default empresa.telefono "__________"}}; correo {{default empresa.correo "__________"}}.
- **Finalidad única:** elaborar la descripción sociodemográfica y la caracterización de condiciones de salud del SG-SST, de forma agregada y confidencial. La información no se entrega a terceros ni se usa para decisiones individuales sobre el vínculo laboral.
- **Derechos:** conocer, actualizar, rectificar y suprimir sus datos, y revocar esta autorización, escribiendo o llamando a los datos de contacto anteriores.
- La empresa conserva prueba de esta autorización (Ley 1581 de 2012, art. 12 parágrafo).

☐ Autorizo el tratamiento de los datos de esta encuesta con la finalidad descrita.   ☐ No autorizo (en ese caso no diligencie las secciones de datos sensibles).

## Datos generales

| Pregunta | Respuesta |
|---|---|
| Cargo | |
| Área / sede | |
| Edad | ☐ < 18 ☐ 18-27 ☐ 28-37 ☐ 38-47 ☐ ≥ 48 |
| Sexo | ☐ F ☐ M ☐ Otro ☐ Prefiero no responder |
| Estado civil | ☐ Soltero ☐ Casado ☐ Unión libre ☐ Separado ☐ Viudo |
| Escolaridad | ☐ Primaria ☐ Bachiller ☐ Técnico/tecnólogo ☐ Universitario ☐ Posgrado |
| Personas a cargo | ☐ 0 ☐ 1-2 ☐ 3-4 ☐ ≥ 5 |
| Estrato | ☐ 1 ☐ 2 ☐ 3 ☐ 4 ☐ 5-6 |
| Tipo de vivienda | ☐ Propia ☐ Arrendada ☐ Familiar |
| Antigüedad en la empresa | ☐ < 1 año ☐ 1-5 ☐ 5-10 ☐ > 10 |
| Antigüedad en el cargo | ☐ < 1 año ☐ 1-5 ☐ 5-10 ☐ > 10 |
| Tipo de contrato | ☐ Indefinido ☐ Fijo ☐ Obra o labor ☐ Prestación de servicios ☐ Aprendiz |
| Medio de transporte | ☐ Público ☐ Moto ☐ Carro ☐ Bicicleta ☐ A pie |
| Uso del tiempo libre | ☐ Otro trabajo ☐ Labores domésticas ☐ Recreación ☐ Estudio |

## Hábitos y estilos de vida

Dato sensible: respuesta voluntaria.

| Pregunta | Respuesta |
|---|---|
| ¿Fuma o vapea? | ☐ Sí ☐ No ☐ Lo dejé |
| ¿Consume bebidas alcohólicas? | ☐ No ☐ Ocasional ☐ Semanal ☐ Diario |
| ¿Practica actividad física (≥ 150 min/semana)? | ☐ Sí ☐ No |
| ¿Duerme entre 7 y 8 horas? | ☐ Sí ☐ No |

## Condiciones de salud percibidas (últimos 6 meses)

Dato sensible: respuesta voluntaria. Marque solo las molestias que usted ha sentido; no escriba diagnósticos ni enfermedades.

☐ Dolor o molestia en la espalda baja ☐ Dolor o molestia en cuello u hombros ☐ Dolor en manos o muñecas ☐ Dolor de cabeza frecuente
☐ Cansancio o ardor en los ojos ☐ Sensación de oír menos o zumbido en los oídos ☐ Tos o dificultad para respirar ☐ Irritación o picazón en la piel
☐ Sensación de estrés, ansiedad o tristeza persistente ☐ Dificultad para dormir ☐ Cansancio al final de la jornada ☐ Ninguna

¿Cree que alguna de estas molestias está relacionada con su trabajo? ☐ Sí ☐ No ☐ No sé

¿Qué condición de su puesto de trabajo cree que le genera molestias? (opcional): ______________________________

Si alguna molestia es persistente, consulte con su EPS. Puede pedir orientación al responsable del SG-SST sin dar detalles médicos.

## Firma

No firme ni escriba su nombre en la encuesta: es anónima. La autorización de tratamiento de datos se marca en la sección "Aviso de privacidad y autorización" y la empresa la conserva como prueba.

Fecha de diligenciamiento: __________

## Resultados consolidados

{{#if nomina.perfil.hay}}
Consolidado de {{nomina.total}} trabajadores activos registrados en PROCESST (Decreto 1072 de 2015, art. 2.2.4.6.16 numeral 7; Resolución 0312 de 2019, estándar 3.1.1). Los resultados de las secciones de hábitos y condiciones de salud percibidas se tabulan por separado, de forma agregada, a partir de las encuestas anónimas.

| Sexo | N.º | % |
|---|---|---|
{{#each nomina.perfil.sexo}}
| {{nombre}} | {{n}} | {{pct}} |
{{/each}}

| Edad | N.º | % |
|---|---|---|
{{#each nomina.perfil.edad}}
| {{nombre}} | {{n}} | {{pct}} |
{{/each}}

| Escolaridad | N.º | % |
|---|---|---|
{{#each nomina.perfil.escolaridad}}
| {{celda nombre}} | {{n}} | {{pct}} |
{{/each}}

| Vinculación | N.º | % |
|---|---|---|
{{#each nomina.perfil.vinculacion}}
| {{nombre}} | {{n}} | {{pct}} |
{{/each}}

| Antigüedad | N.º | % |
|---|---|---|
{{#each nomina.perfil.antiguedad}}
| {{nombre}} | {{n}} | {{pct}} |
{{/each}}

| Cargo | N.º | % |
|---|---|---|
{{#each nomina.perfil.cargos}}
| {{celda nombre}} | {{n}} | {{pct}} |
{{/each}}

| Estado civil (de las encuestas) | N.º | % |
|---|---|---|
| Soltero | | |
| Casado o unión libre | | |
| Separado o viudo | | |
{{else}}
Registre los trabajadores en PROCESST para obtener el consolidado del perfil sociodemográfico. Mientras tanto, tabule aquí las encuestas: edad, sexo, escolaridad, estado civil, cargo y antigüedad (Resolución 0312 de 2019, estándar 3.1.1).
{{/if}}
