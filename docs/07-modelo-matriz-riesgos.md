# 07 · Modelo de la matriz de peligros y riesgos (GTC 45) — biblioteca + instancia por empresa

## 1. Qué exige la norma y qué dice la GTC 45

- Decreto 1072 art. 2.2.4.6.15: metodología sistemática, con alcance sobre todos los procesos y actividades rutinarias y no rutinarias, internas o externas, máquinas, equipos y todos los centros de trabajo y trabajadores. Actualización anual y ante cambios.
- Res. 0312 ítem 4.1.1 (metodología documentada), 4.1.2 (identificación con participación de todos los niveles), 4.1.3 (carcinógenos), 4.1.4 (mediciones).
- GTC 45 (metodología de referencia). Columnas de la matriz oficial:

```
Proceso | Zona/Lugar | Actividad | Tarea | Rutinaria (sí/no)
Peligro: descripción | clasificación (Biológico, Físico, Químico, Psicosocial, Biomecánico, Condiciones de seguridad, Fenómenos naturales)
Efectos posibles
Controles existentes: fuente | medio | individuo
Evaluación: ND | NE | NP = ND×NE | interpretación NP | NC | NR = NP×NC | interpretación NR
Valoración: aceptabilidad
Criterios: n.º expuestos | peor consecuencia | ¿requisito legal específico?
Medidas de intervención: eliminación | sustitución | controles de ingeniería | controles administrativos y señalización | EPP
```

Escalas GTC 45 (el software las calcula):

| Variable | Valores |
|---|---|
| ND (deficiencia) | Muy alto 10 · Alto 6 · Medio 2 · Bajo 0 (no se valora) |
| NE (exposición) | Continua 4 · Frecuente 3 · Ocasional 2 · Esporádica 1 |
| NP = ND×NE | Muy alto 24-40 · Alto 10-20 · Medio 6-8 · Bajo 2-4 |
| NC (consecuencia) | Mortal/catastrófico 100 · Muy grave 60 · Grave 25 · Leve 10 |
| NR = NP×NC | I: 4000-600 (no aceptable) · II: 500-150 (no aceptable o aceptable con control específico) · III: 120-40 (mejorable) · IV: 20 (aceptable) |

Observación clave: **ND y NE dependen de la empresa** (controles existentes, horas de exposición). Por eso la biblioteca solo sugiere y la consultora valida por cliente.

## 2. Dos capas: biblioteca (conocimiento) e instancia (empresa)

### Capa A · Biblioteca (compartida entre todos los clientes; la alimenta la consultora + IA)

```
SectorTipo        (ciiu[], nombre)                       → procesos tipo, cargos tipo, zonas tipo
ProcesoTipo       (nombre, sector_tipo_id)
ZonaTipo          (nombre: oficina, bodega, cocina, obra, taller, vehículo…) → peligros de lugar
CargoTipo         (nombre, sector_tipo_id?, descripcion)  → tareas tipo, peligros de cargo
TareaTipo         (nombre, proceso_tipo_id?, rutinaria_default, alto_riesgo: alturas|confinado|electrico|izaje|caliente|ninguno)
PeligroCatalogo   (clasificacion GTC45, descripcion, efectos_posibles, nd_default, ne_default, nc_default,
                   controles_sugeridos {fuente, medio, individuo}, medidas_sugeridas {eliminacion, sustitucion, ingenieria, administrativos, epp},
                   epp_sugerido[], examenes_sugeridos[] (profesiograma), capacitaciones_sugeridas[], normas[], pve_asociado?, requisito_legal_especifico?)
TareaTipo_Peligro (tarea_tipo_id, peligro_id, nd_default, ne_default, nc_default)   ← peligros por tarea
ZonaTipo_Peligro  (zona_tipo_id, peligro_id, …)                                     ← peligros de lugar (locativo, sismo, incendio, público)
CargoTipo_Peligro (cargo_tipo_id, peligro_id, …)                                    ← peligros organizacionales (psicosocial, jornada)
CargoTipo_Tarea   (cargo_tipo_id, tarea_tipo_id)
```

### Capa B · Instancia por empresa (lo que se evalúa y firma)

```
Sede → Zona (zona_tipo_id?, nombre)
Proceso (proceso_tipo_id?, nombre)
Cargo (cargo_tipo_id?, nombre, n_personas, zona_id, descripcion_funciones)
Tarea (tarea_tipo_id?, proceso_id, zona_id, nombre, rutinaria)
Cargo_Tarea (cargo_id, tarea_id)                       ← muchos a muchos
PeligroEvaluado (origen: tarea_id | zona_id | cargo_id, peligro_id, descripcion_ajustada,
                 controles_existentes {fuente, medio, individuo}, nd, ne, nc, [np, nr, aceptabilidad calculados],
                 expuestos [calculado], peor_consecuencia, requisito_legal, medidas_intervencion {…},
                 estado: sugerido|aprobado, fuente: biblioteca|ia|manual)
```

`expuestos` se calcula: para peligro de tarea = suma de `n_personas` de los cargos que la ejecutan; de zona = personas ubicadas en la zona; de cargo = `n_personas` del cargo.

## 3. Flujo de trabajo para la consultora

1. Alta de empresa con CIIU → el sistema propone el **paquete del sector**: procesos, zonas, cargos tipo y tareas tipo.
2. Ella ajusta la lista de cargos reales y el número de personas por cargo. Para cada cargo escribe (o pega) las funciones en texto libre.
3. **La IA propone** tareas (priorizando la biblioteca), las asigna a procesos/zonas y trae sus peligros con valores por defecto. Marca lo que no está en biblioteca como "nuevo".
4. Ella revisa en una tabla: aprueba, elimina, cambia ND/NE/NC y controles existentes. Lo aprobado como "nuevo" se **guarda en la biblioteca** para el próximo cliente.
5. El sistema genera: matriz GTC 45 (XLSX + DOCX), y en cascada:
   - Profesiograma por cargo (unión de `examenes_sugeridos` de sus peligros) → Res. 1843/2025.
   - Matriz de EPP por cargo.
   - Temas del programa de capacitación (por peligro y por tarea de alto riesgo).
   - Procedimientos seguros que se activan (tareas con `alto_riesgo`).
   - Normas de la matriz legal (por peligro).
   - PVE a instanciar (peligros con NR I-II y `pve_asociado`).
   - Priorización para el plan anual (NR I y II primero).
6. Actualización anual o por gestión del cambio: se reabre la matriz, se guarda versión nueva, los documentos derivados se regeneran.

## 4. Contenido inicial de la biblioteca (semilla)

Para el MVP, sembrar con 6 sectores donde ella tenga clientes (p. ej. oficinas/servicios, comercio, restaurantes, construcción pequeña, manufactura ligera, transporte) y ~40 cargos tipo. La semilla la puede redactar la IA a partir de la GTC 45 y de las matrices reales de ella, pero **cada entrada queda marcada como "no validada" hasta que ella la apruebe**. Así la biblioteca nace con su criterio y no con texto genérico.

## 5. Dónde podría fallar

- Si la biblioteca fija NR por tarea, todas las matrices salen idénticas → inspección lo detecta. Por eso ND/NE/NC son por defecto y editables.
- Si solo hay peligros por tarea, faltan locativo, sismo, psicosocial → por eso hay tres orígenes.
- Si la matriz no muestra proceso/zona/actividad/tarea, no coincide con el formato que esperan ARL y Ministerio → por eso la tarea lleva proceso y zona aunque se capture desde el cargo.
