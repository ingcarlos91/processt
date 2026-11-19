---
codigo: ACT-02
nombre: Acta de reunión del COPASST / Vigía (formato)
tipo: ACT
nivelMin: 21
carpeta: 1. Recursos
estandares: ["1.1.6"]
normas: ["RES-2013-1986"]
---
## Datos de la reunión

| Campo | |
|---|---|
| Acta N.º | |
| Fecha | |
| Hora inicio / fin | |
| Lugar | |
| Tipo | Ordinaria ☐ Extraordinaria ☐ |

## Asistentes

| Nombre | Rol | Asistió | Firma |
|---|---|---|---|
{{#if integrantes.copasst.hayMiembros}}
{{#each integrantes.copasst.miembros}}
| {{nombre}} | {{rolTexto}} {{representa}} | ☐ | |
{{/each}}
{{else}}
| | Presidente | ☐ | |
| | Secretario | ☐ | |
| | | ☐ | |
{{/if}}
| {{responsable.nombre}} | Responsable del SG-SST (invitado) | ☐ | |

## Orden del día

1. Verificación del quórum.
2. Lectura y seguimiento de compromisos del acta anterior.
3. Accidentes de trabajo, incidentes y enfermedades laborales del mes y sus investigaciones.
4. Resultados de inspecciones realizadas.
5. Avance del plan anual de trabajo y del programa de capacitación.
6. Sugerencias y reportes de los trabajadores.
7. Propuestas de medidas preventivas.
8. Compromisos y varios.

## Desarrollo

(Registrar lo tratado en cada punto)

{{#if accidentalidad.pendientes.length}}
**Punto 3 — Eventos con investigación pendiente o en curso**

| Fecha | Tipo | Cargo | Investigación |
|---|---|---|---|
{{#each accidentalidad.pendientes}}
| {{fecha}} | {{tipo}} | {{celda cargo}} | {{investigacion}} |
{{/each}}
{{/if}}

## Compromisos

| N.º | Compromiso | Responsable | Fecha |
|---|---|---|---|
| | | | |

## Firmas

______________________ {{integrantes.copasst.presidente}} (Presidente)  ______________________ {{integrantes.copasst.secretario}} (Secretario)
