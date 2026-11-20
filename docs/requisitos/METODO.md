# Verificación normativa de artefactos — instrucciones comunes

Proyecto: /Users/carlosandres/processt — herramienta de una consultora de SST en Colombia que genera el SG-SST de empresas cliente (Decreto 1072/2015 cap. 6, Res. 0312/2019). Lee primero /Users/carlosandres/processt/CLAUDE.md.

## Objetivo
Para cada artefacto asignado, comprobar contra el TEXTO OFICIAL de la norma que el documento contiene todo lo que la norma exige (contenido mínimo, campos, plazos, responsables, firmas, periodicidades) y que lo que afirma tiene sustento normativo exacto.

## Dónde está cada cosa
- Plantillas: prisma/seed/plantillas/<CODIGO>.md (frontmatter con `normas` y `estandares`; cuerpo en Markdown + Handlebars). Algunas secciones las llena el código: busca el código de la plantilla en src/lib/generador/ y src/lib/ para ver qué datos inyecta (grep del código, p. ej. "FOR-07").
- Catálogo de normas (único permitido para citar): prisma/seed/normas.ts (campo `codigo`, `articulosClave`, `url`).
- Estándares Res. 0312: prisma/seed/estandares.ts.
- Auditoría normativa previa: docs/09-analisis-normativo.md (sección 7 = URLs oficiales; sección 5 = decisiones pendientes). No repitas lo ya resuelto allí; úsalo como contexto.

## Reglas estrictas
1. Fuente: texto oficial (Gestor Normativo de Función Pública, SISJUR Alcaldía de Bogotá, SUIN-Juriscol, normogramas de MinTIC/Cancillería/Colpensiones, MinTrabajo). Usa las URL de docs/09 §7 o del catálogo. Si no logras leer el texto oficial de un artículo, márcalo `confianza: "baja"` y dilo; NUNCA reconstruyas un requisito de memoria como si fuera verificado.
2. Cada requisito debe llevar norma + artículo/numeral exacto. Los umbrales y plazos salen del artículo exacto (ej.: trabajo en alturas > 2,0 m, Res. 4272/2021 art. 3).
3. Normas que reemplazan a otras: Res. 1843/2025 (no 2346/2007), Res. 3461/2025 (no 652/2012), Decreto 728/2025 y Ley 2460/2025 (salud mental). Señala cualquier cita a normas derogadas.
4. Si un requisito exige una norma que NO está en el catálogo, repórtalo en `normasFaltantesCatalogo` con su URL oficial; no la inventes.
5. Señala también lo contrario: afirmaciones de la plantilla presentadas como obligación legal sin sustento (ej.: vacunación como obligación general), artículos mal citados, plazos o cifras equivocados.
6. Datos de salud: solo conceptos de aptitud, nunca diagnósticos (Ley 1581/2012). Señala cualquier campo que pida diagnósticos.
7. NO edites ningún archivo del proyecto. Solo lectura. Escribe tu resultado únicamente en el archivo JSON indicado.
8. No copies textos largos de las normas: parafrasea; como máximo una cita textual corta (< 15 palabras) por requisito.

## Formato de salida (un archivo JSON por frente, en esta carpeta)
{
  "frente": "<nombre>",
  "artefactos": [
    {
      "codigo": "POL-01",
      "nombre": "...",
      "normasCitadas": ["..."],
      "requisitos": [
        { "id": "POL-01-R1", "requisito": "qué exige la norma (parafraseado)", "norma": "DEC-1072-2015", "articulo": "art. 2.2.4.6.6 num. 1", "fuente": "URL leída", "seccionQueLoCubre": "## Título de la sección o null", "estado": "cumple|parcial|falta", "detalle": "qué falta o qué está mal", "confianza": "alta|media|baja" }
      ],
      "citasIncorrectas": [ { "texto": "lo que dice la plantilla", "problema": "...", "correccion": "..." } ],
      "sinSustento": [ { "texto": "...", "problema": "..." } ]
    }
  ],
  "normasFaltantesCatalogo": [ { "norma": "...", "url": "...", "porque": "..." } ],
  "estandaresSinArtefacto": [ { "estandar": "1.1.7", "propuesta": "qué artefacto lo debería soportar" } ],
  "notas": "limitaciones, textos que no se pudieron leer, etc."
}

Al terminar, responde con un resumen breve: cuántos requisitos revisados, cuántos `falta`/`parcial`, las 5 brechas más graves y la ruta del JSON.
