# 04 · El problema: cómo trabaja hoy una consultora SST y dónde se va el tiempo

## 1. El cliente típico

Pymes colombianas de 1 a 50 trabajadores (nivel 7 o 21 de la Res. 0312) y algunas medianas (nivel 60). Sectores frecuentes: comercio, oficinas/servicios, restaurantes, construcción pequeña, manufactura ligera, transporte, salud (IPS pequeñas), educación. La mayoría llega porque:

- La ARL o un cliente grande les exigió el SG-SST (contratistas deben acreditar SG-SST ante el contratante, D.1072 art. 2.2.4.6.28).
- Tuvieron visita del Ministerio o un accidente.
- Deben registrar la autoevaluación anual.

## 2. Flujo de trabajo actual de la consultora (ciclo de vida por cliente)

```
 [0] Comercial         [1] Diagnóstico          [2] Diseño               [3] Implementación     [4] Verificación/Actuar   [5] Año siguiente
 cotización  ───────▶  visita + evaluación ───▶ ~30-60 documentos ───▶  capacitar, inspeccionar, ──▶ indicadores, auditoría, ──▶ autoevaluación dic,
 propuesta             inicial (Tabla de        (política, matriz,       exámenes, comités,          revisión alta dirección,     plan de mejoramiento,
                       Valores) → puntaje       plan anual, etc.)        simulacro, EPP…             acciones correctivas         registro en FRL, plan anual
```

Tiempo típico hoy (estimación; **validar con la esposa**): diagnóstico 1-2 días; diseño documental de un nivel 21 entre 2 y 4 semanas de trabajo (copiar/pegar de clientes anteriores, buscar y reemplazar nombres, rehacer matrices en Excel, armar carpeta en Drive); implementación 6-12 meses con visitas mensuales.

## 3. Dónde se va el tiempo (hipótesis a validar)

| Dolor | Causa | Qué lo resuelve |
|---|---|---|
| Rehacer los mismos documentos por cada cliente | No hay plantillas parametrizadas; se parte de la carpeta del cliente anterior | Plantillas con variables + generación masiva |
| Errores de "copiar/pegar" (queda el nombre de otra empresa, NIT equivocado, fecha vieja) | Edición manual en Word | Datos maestros del cliente, inyectados en todo |
| Decidir qué le aplica a cada empresa | Reglas en la cabeza de la consultora | Motor de reglas: tamaño + riesgo + sector + peligros → lista de ítems y documentos |
| La matriz de peligros toma días | Se hace desde cero en Excel por proceso/tarea | Biblioteca de peligros por sector y cargo; la consultora ajusta, no escribe |
| Numeración, versionado y control de documentos | Manual | Listado maestro automático, versiones, códigos |
| Olvidar obligaciones periódicas (reunión COPASST, simulacro, exámenes, autoevaluación, registro en julio) | Calendario en la cabeza o en Excel | Calendario por cliente con alertas |
| Evidencias dispersas (fotos, actas, listas de asistencia en WhatsApp) | No hay repositorio | Carpeta de evidencias ligada a cada ítem del estándar |
| Calcular indicadores y autoevaluación | Excel manual | Registro de eventos → indicadores automáticos; checklist → puntaje y plan de mejoramiento |
| Actualizar cuando cambia la norma (p. ej. Res. 1843/2025 reemplazó la 2346/2007) | Hay que abrir cada documento de cada cliente | Plantillas centralizadas: se corrige una vez y se regenera |
| Demostrar valor al cliente | Entrega carpeta y el cliente no entiende | Tablero de cumplimiento por cliente (% de avance, próximas tareas) |

## 4. Quiénes usan el sistema

| Rol | Necesita |
|---|---|
| **Consultora (admin)** | Crear empresas, llenar el intake, generar documentos, ajustar textos, cargar evidencias, ver todos sus clientes, calendario global, facturar/cotizar. |
| **Empresa cliente (representante legal / responsable interno)** | Ver su tablero, firmar/aprobar documentos, cargar evidencias (listas de asistencia, fotos), recibir alertas. Acceso de solo lectura al resto. |
| **Trabajadores** (opcional, fase 2) | Diligenciar encuesta sociodemográfica, autorreporte de condiciones, inducción virtual, firma de entrega de EPP. |
| **Auditor / ARL / Ministerio** (opcional) | Enlace de solo lectura al expediente ordenado por estándar. |

## 5. Preguntas para validar con la esposa antes de construir

1. ¿Qué documentos entrega exactamente hoy a un cliente de nivel 7, 21 y 60? (Pedirle una carpeta real anonimizada; eso se convierte en las plantillas base.)
2. ¿Cuánto cobra por diseño y cuánto por acompañamiento mensual? ¿Cuántos clientes activos tiene? (Define si el software se vende como herramienta interna o también a otras consultoras.)
3. ¿Hace ella el registro en la plataforma del Fondo de Riesgos Laborales por el cliente?
4. ¿Qué formato espera el cliente/ARL: Word, PDF, Excel? ¿Se firman a mano o digitalmente?
5. ¿Cómo hace hoy la matriz de peligros? ¿Usa GTC 45 estrictamente? ¿Tiene listados de peligros por sector?
6. ¿Qué formatos usa la ARL de sus clientes (Sura, Positiva, Colmena, Axa, Bolívar)? Las ARL dan plantillas; conviene parecerse a ellas.
7. ¿Qué parte del trabajo es "de campo" (visita, capacitación) y no se puede automatizar? Eso define el límite del software.
8. ¿Qué ha pasado en visitas del Ministerio: qué piden primero? (Prioriza qué debe quedar impecable.)
9. ¿Qué software ha probado (SafetYA, Sistegra, ISOTools, Buk, Verifty) y por qué no lo usa? (Diferenciación: los existentes son para la empresa, no para la consultora multi-cliente, y no generan los documentos.)

## 6. Propuesta de valor en una frase

"Creas la empresa, respondes un cuestionario de 20 minutos y el sistema entrega el SG-SST completo, numerado y personalizado para el nivel que le aplica; después te acompaña todo el año con calendario, evidencias, indicadores y la autoevaluación lista para registrar."
