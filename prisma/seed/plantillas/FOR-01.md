---
codigo: FOR-01
nombre: Encuesta de perfil sociodemográfico y morbilidad sentida
tipo: FOR
nivelMin: 21
carpeta: 3. Gestión de la salud
estandares: ["3.1.1"]
normas: ["DEC-1072-2015","RES-0312-2019","LEY-1581-2012"]
---
## Instrucciones

Esta encuesta permite elaborar la descripción sociodemográfica y el diagnóstico de condiciones de salud de los trabajadores de **{{empresa.razonSocial}}** (Decreto 1072 de 2015, arts. 2.2.4.6.12 numeral 4 y 2.2.4.6.16 numeral 7). La información es confidencial y se usa solo de forma agregada.

**Autorización de tratamiento de datos:** autorizo a {{empresa.razonSocial}} el tratamiento de mis datos personales y sensibles para fines exclusivos del SG-SST, conforme a la Ley 1581 de 2012. Firma: __________________

## Datos generales

| Pregunta | Respuesta |
|---|---|
| Nombre | |
| Cargo | |
| Área / sede | |
| Edad | ☐ < 18 ☐ 18-27 ☐ 28-37 ☐ 38-47 ☐ ≥ 48 |
| Sexo | ☐ F ☐ M ☐ Otro |
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

| Pregunta | Respuesta |
|---|---|
| ¿Fuma? | ☐ Sí ☐ No ☐ Exfumador |
| ¿Consume bebidas alcohólicas? | ☐ No ☐ Ocasional ☐ Semanal ☐ Diario |
| ¿Practica actividad física (≥ 150 min/semana)? | ☐ Sí ☐ No |
| ¿Duerme entre 7 y 8 horas? | ☐ Sí ☐ No |

## Morbilidad sentida (últimos 6 meses)

Marque los síntomas que ha presentado:

☐ Dolor de espalda baja ☐ Dolor de cuello u hombros ☐ Dolor en manos o muñecas ☐ Dolor de cabeza frecuente
☐ Cansancio visual ☐ Disminución de la audición ☐ Tos o dificultad respiratoria ☐ Alergias en piel
☐ Estrés, ansiedad o tristeza persistente ☐ Problemas de sueño ☐ Gastritis ☐ Presión arterial alta
☐ Diabetes ☐ Otro: ______________

¿Ha sido diagnosticado con alguna enfermedad laboral? ☐ Sí ☐ No
¿Ha tenido accidentes de trabajo en el último año? ☐ Sí ☐ No

## Firma del trabajador

Fecha: __________  Firma: __________________

## Resultados consolidados

{{#if nomina.perfil.hay}}
Consolidado de {{nomina.total}} trabajadores activos registrados en PROCESST (Decreto 1072 de 2015, art. 2.2.4.6.16; Resolución 0312 de 2019, estándar 3.1.1).

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
{{else}}
Registre los trabajadores en PROCESST para obtener el consolidado del perfil sociodemográfico.
{{/if}}
