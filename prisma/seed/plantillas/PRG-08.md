---
codigo: PRG-08
nombre: Programa de prevención y protección contra caídas en trabajo en alturas
tipo: PRG
nivelMin: 7
carpeta: 4. Gestión de peligros y riesgos
estandares: ["4.2.3"]
normas: ["RES-4272-2021","RES-1843-2025","DEC-1072-2015","RES-0312-2019","GTC-45-2012","RES-40117-2024"]
condicion: {"disparador":"alturas"}
---
## Objetivo

Prevenir las caídas en los trabajos en alturas realizados por trabajadores y contratistas de **{{empresa.razonSocial}}**, eliminando el trabajo en alturas cuando sea posible o controlando cada riesgo de caída con la jerarquía de controles del Decreto 1072 de 2015, art. 2.2.4.6.24 (Resolución 4272 de 2021, arts. 4 y 5 literal a; Resolución 0312 de 2019, estándar 4.2.3).

## Alcance

Toda actividad o desplazamiento en la que exista el riesgo de caída a una altura **mayor a 2,0 metros**, medida desde los pies del trabajador hasta el plano horizontal inferior más cercano (Resolución 4272 de 2021, art. 3), realizada por trabajadores propios, en misión o contratistas, en todas las sedes de la empresa.

## Marco conceptual y legal

- **Trabajo en alturas, trabajador autorizado, coordinador de trabajo en alturas, medidas de prevención y de protección:** según las definiciones del art. 3 de la Resolución 4272 de 2021.
- **Normas:** Resolución 4272 de 2021 (trabajo seguro en alturas); Decreto 1072 de 2015, capítulo 6 (SG-SST) y art. 2.2.4.6.24 (jerarquía de controles); Resolución 1843 de 2025 (evaluaciones médicas ocupacionales); Resolución 0312 de 2019 (estándares mínimos).

## Roles y responsabilidades

Roles que exige la Resolución 4272 de 2021 (art. 5 literal d, art. 6 Tabla 1 y art. 61 literal c); no implican crear cargos nuevos:

| Rol | Responsabilidad | Perfil | Designado |
|---|---|---|---|
| Administrador del programa | Diseñar, administrar y asegurar el programa | Profesional, especialista o magíster en SST con licencia vigente, curso de coordinador de alturas y curso de 50 o 20 horas en SST | |
| Persona calificada | Calcular, diseñar, evaluar y autorizar puntos de anclaje y estructuras de protección contra caídas | Profesional con el perfil de ingeniería que remite el art. 6 de la Resolución 4272 de 2021 | |
| Coordinador de trabajo en alturas | Identificar peligros en el sitio y aplicar medidas correctivas inmediatas; revisar y firmar cada permiso | Curso de coordinador y curso de 50 o 20 horas en SST | {{op.coordinadorAlturas.nombre}} |
| Trabajador autorizado | Realizar las tareas en alturas cumpliendo las medidas del programa | Curso de trabajador autorizado con reentrenamiento vigente | |
| Ayudante de seguridad | Mantener las condiciones de seguridad en el sitio y controlar las áreas de caída de objetos o personas | Curso de trabajador autorizado con reentrenamiento vigente | |
| Brigada de rescate en alturas | Ejecutar el plan de rescate | Personal capacitado para el rescate (art. 26) | |

## Tareas y cargos expuestos

Inventario de las actividades en alturas, con su ubicación y su clasificación en rutinarias o no rutinarias (art. 4 y art. 5 literal i):

{{#each altoRiesgo}}
{{#if (eq tipo "alturas")}}
- **Tareas:** {{tareas}}
- **Cargos:** {{cargos}}
{{/if}}
{{/each}}

| Tarea | Ubicación | Altura aproximada | Rutinaria / no rutinaria | Sistema de acceso |
|---|---|---|---|---|
| | | | | |

## Identificación de peligros y evaluación de riesgos

Los peligros de cada tarea en alturas y los demás peligros asociados (eléctrico, caída de objetos, condiciones climáticas) se identifican y valoran en la matriz de peligros de la empresa (GTC 45), y antes de cada tarea con un análisis de trabajo seguro (ATS o ARO) anexo al permiso (art. 5 literales g y h; art. 8; art. 15).

**Eliminación y controles de ingeniería:** para cada tarea se documenta si es viable eliminar el trabajo en alturas (por ejemplo, trabajar desde el piso o prefabricar a nivel) o aplicar sistemas de ingeniería, y por qué se eligieron los controles aplicados (art. 12).

| Tarea | ¿Se puede eliminar? | Control de ingeniería | Control administrativo | Protección personal |
|---|---|---|---|---|
| | | | | |

## Procedimientos de trabajo

La empresa documenta y divulga, antes de iniciar labores, los procedimientos de cada tarea en alturas y el procedimiento de permisos de trabajo (art. 5 literal j; art. 15; art. 61 literal f). Los procedimientos se revisan cuando cambian las condiciones de trabajo o después de un incidente.

## Medidas de prevención

1. **Capacitación por rol (art. 10, Tabla 2; contenidos en el art. 27):** jefe de área, 8 horas; trabajador autorizado, 32 horas; coordinador de trabajo en alturas, 80 horas; entrenador, 130 horas. La imparte un proveedor autorizado por el Ministerio del Trabajo y **no tiene costo para el trabajador** (art. 61 literales d, e y p).
2. **Reentrenamiento (art. 27 numeral 4):** mínimo 8 horas (20 % teoría, 80 % práctica), presencial y a cargo del empleador:
   - al **ingresar** a la empresa y cuando cambien la actividad, los procedimientos, las técnicas, la tecnología de los equipos o las actividades del trabajador (literal a);
   - como **actualización**, para el trabajador autorizado que lleva **18 meses** en la misma empresa sin cambiar de actividad (literal b).
   La empresa reporta a su ARL el nombre, documento, fecha del reentrenamiento y oferente.
3. Designación del coordinador de trabajo en alturas: **{{op.coordinadorAlturas.nombre}}**.
4. **Permiso de trabajo** con lista de chequeo antes de cada tarea, revisado y firmado por el coordinador en cada evento (art. 15).
5. **Medidas colectivas (art. 13):** delimitación del área con elementos amarillo y negro visibles de día y de noche; línea de advertencia a mínimo 1,80 m del borde, supervisada por un ayudante de seguridad; señalización en español (y en el idioma de los trabajadores extranjeros); barandas de mínimo 1 m de alto, que no se usan como anclaje; control de acceso y cubrimiento de huecos.
6. **Aptitud médica:** evaluación médica ocupacional con concepto de aptitud para trabajo en alturas (Resolución 1843 de 2025, art. 2 literal f; Resolución 4272 de 2021, art. 61 literal a). La empresa define la periodicidad, máximo cada 3 años y justificada técnicamente, teniendo en cuenta la vigencia del certificado de aptitud para alturas (Resolución 1843 de 2025, art. 15 y parágrafo 1). Solo se registra el concepto de aptitud, nunca diagnósticos.
7. **Restricción:** los menores de edad y las mujeres embarazadas, en cualquier momento de la gestación, no realizan trabajo en alturas (art. 61 literal j).
8. **Contratistas:** la empresa verifica que sus contratistas cumplan la Resolución 4272 de 2021 y supervisa la aplicación de los procedimientos (art. 61 literal k).

## Sistemas de acceso

Andamios, escaleras, elevadores de personas y demás medios de acceso (art. 16):

- **Certificados** según el estándar aplicable, con manual y ficha técnica en español (num. 1).
- Inspeccionados conforme al Decreto 1072 de 2015 y al fabricante (num. 2); los **elevadores de personas, al menos una vez al año** por una persona avalada por el fabricante o calificada (num. 3).
- Con no conformidades, se retiran de servicio (num. 4).
- **Hoja de vida** de cada equipo con marca, serial, fecha de fabricación, vida útil, historial de uso, inspecciones, mantenimientos, ficha técnica y certificación (num. 10), y mantenimiento según el fabricante (num. 11; PRG-07).
- Distancia segura a líneas energizadas según el RETIE, Resolución 40117 de 2024 (num. 12).

## Medidas de protección

- Sistemas de restricción, posicionamiento y detención de caídas: arnés de cuerpo completo, eslingas con absorbedor, líneas de vida y puntos de anclaje certificados, seleccionados según la tarea.
- Inspección preuso de los equipos de protección contra caídas por el trabajador, e inspección **al menos una vez al año o con la periodicidad del fabricante**, con registro de las revisiones y del mantenimiento (art. 61 literales g y h).
- Compatibilidad de los componentes del sistema, avalada por el coordinador o, en caso de duda, por una persona calificada (art. 61 literal o).
- Retiro de servicio de todo equipo con daño o que haya detenido una caída.

## Plan de emergencias y rescate (art. 26)

El plan de emergencias de la empresa (PLN-04) incluye un capítulo escrito de trabajo en alturas que se practica y verifica (art. 26; art. 61 literal i):

- Plan de rescate escrito y específico para cada tarea, con **equipos de rescate certificados** y brigadistas o personal capacitado para el rescate.
- Botiquín y elementos para inmovilizar y atender heridas y hemorragias.
- Una **persona de apoyo** disponible mientras se trabaja en alturas, que reporta de inmediato y activa el plan de emergencias.
- Práctica mediante simulacros (FOR-05).

## Cronograma e indicadores

| Actividad | Responsable | Mes |
|---|---|---|
| Capacitación y reentrenamientos programados | Administrador del programa | |
| Inspección anual de equipos de protección contra caídas | Coordinador de alturas | |
| Simulacro de rescate en alturas | Brigada | |
| Revisión del programa | Administrador del programa | |

Indicadores de gestión del programa (art. 5 literal o), alineados con el Decreto 1072 de 2015:

- Trabajadores en alturas con certificado y reentrenamiento vigentes / trabajadores que hacen tareas en alturas × 100.
- Permisos de trabajo diligenciados y cerrados correctamente / tareas en alturas ejecutadas × 100.
- Equipos de protección contra caídas inspeccionados en el año / equipos en uso × 100.
- Incidentes y accidentes por caídas de altura en el periodo.

## Permiso de trabajo en alturas

Contenido mínimo según la Resolución 4272 de 2021, art. 15:

| Campo | Información |
|---|---|
| Nombre(s) del (los) trabajador(es) | |
| 1. Tipo de trabajo | |
| 2. Altura aproximada | |
| 3. Fecha y hora de inicio y de terminación | |
| 4. Afiliación vigente a la seguridad social (verificada) | ☐ Sí |
| 5. Requisitos del trabajador (concepto de aptitud vigente) | ☐ Apto |
| 6. Descripción y procedimiento de la tarea | |
| 7. Medidas de prevención contra caídas | |
| 8. Equipos y sistema de acceso | |
| 9. Verificación de los puntos de anclaje por cada trabajador | |
| 10. Sistemas de restricción, posicionamiento o detención de caídas | |
| 11. Elementos de protección personal | |
| 12. Herramientas | |
| 13. Constancia de capacitación o certificado de competencia | |
| 14. Observaciones | |
| 15. Nombres, firmas y documentos de identidad de los trabajadores | |
| 16. Nombre y firma de quien autoriza | |
| 17. Nombre y firma del responsable de activar el plan de emergencias | |
| 18. Nombre y firma del coordinador de trabajo en alturas (si es distinto de quien autoriza) | |
| Ayudante de seguridad designado | |
| Distancia segura a líneas o equipos energizados y elementos dieléctricos | |
| Análisis de trabajo seguro (ATS / ARO) anexo | ☐ Sí |
| Revalidación (cambio de turno, coordinador, trabajadores o condiciones) | |
| Cancelación, suspensión o cierre del permiso | |
