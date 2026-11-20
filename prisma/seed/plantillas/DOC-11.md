---
codigo: DOC-11
nombre: Informe de rendición de cuentas en SST
tipo: DOC
nivelMin: 7
carpeta: 2. Gestión integral del SG-SST
estandares: ["2.6.1"]
normas: ["DEC-1072-2015","RES-0312-2019"]
---
## Objetivo

Documentar la rendición de cuentas anual de quienes tienen responsabilidades asignadas en el SG-SST de **{{empresa.razonSocial}}** sobre su desempeño (Decreto 1072 de 2015, art. 2.2.4.6.8 numeral 3). La rendición puede hacerse por medios escritos, electrónicos, verbales u otros, pero siempre queda documentada{{#if (gte empresa.nivel 60)}}, e incluye a todos los niveles de la empresa (Resolución 0312 de 2019, estándar 2.6.1){{/if}}.

## Quiénes rinden cuentas

| Nivel o rol (según DOC-02) | Persona | Fecha | Medio (informe escrito, reunión con acta, correo, otro) |
|---|---|---|---|
| Alta dirección (Representante Legal) | {{empresa.representanteLegal}} | | |
| Responsable del SG-SST | {{responsable.nombre}} | | |
| Jefes de área y supervisores | | | |
| {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}} | {{#if integrantes.copasst.hayMiembros}}{{integrantes.copasst.presidente}}{{/if}} | | |
{{#if comites.ccl.aplica}}| Comité de Convivencia Laboral | | | |
{{/if}}| Brigada de emergencias | | | |
| Trabajadores (representados en la reunión general o en el comité) | | | |

## Datos

| Campo | Información |
|---|---|
| Periodo | {{anio}} |
| Quien rinde cuentas | |
| Cargo o rol | |
| Fecha | |
| Medio | ☐ Informe escrito ☐ Reunión con acta ☐ Medio electrónico ☐ Otro: ______ |

## Responsabilidades asignadas y cumplimiento

| Responsabilidad | Actividades realizadas | Resultado | Evidencia |
|---|---|---|---|
| | | | |

## Indicadores de su competencia

| Indicador | Meta | Resultado | Análisis |
|---|---|---|---|
| | | | |

## Dificultades y acciones de mejora

| Dificultad | Acción de mejora | Responsable | Fecha |
|---|---|---|---|
| | | | |

## Firmas

______________________ Quien rinde cuentas   ______________________ Recibe (Representante Legal)

El responsable del SG-SST consolida los informes y los presenta a la alta dirección y al {{#if comites.copasst.esVigia}}Vigía de SST{{else}}COPASST{{/if}}.
