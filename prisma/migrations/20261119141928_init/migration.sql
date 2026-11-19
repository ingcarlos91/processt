-- CreateTable
CREATE TABLE "consultora" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nit" TEXT,
    "licencia_sst" TEXT,
    "licencia_fecha" TIMESTAMP(3),
    "profesional" TEXT,
    "cedula" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "firma_url" TEXT,
    "logo_url" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresa" (
    "id" TEXT NOT NULL,
    "consultora_id" TEXT NOT NULL,
    "razon_social" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "digito_verificacion" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "departamento" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "representante_legal" TEXT,
    "representante_cedula" TEXT,
    "ciiu" TEXT,
    "descripcion_actividad" TEXT,
    "clase_riesgo" INTEGER NOT NULL DEFAULT 1,
    "clase_riesgo_justificacion" TEXT,
    "arl" TEXT,
    "eps_principal" TEXT,
    "n_trabajadores_planta" INTEGER NOT NULL DEFAULT 0,
    "n_contratistas" INTEGER NOT NULL DEFAULT 0,
    "n_aprendices" INTEGER NOT NULL DEFAULT 0,
    "n_en_mision" INTEGER NOT NULL DEFAULT 0,
    "n_vehiculos" INTEGER NOT NULL DEFAULT 0,
    "horario" TEXT,
    "turnos" TEXT,
    "nivel_estandares" INTEGER NOT NULL DEFAULT 7,
    "es_upa" BOOLEAN NOT NULL DEFAULT false,
    "disparadores" JSONB NOT NULL DEFAULT '{}',
    "estado_actual" JSONB NOT NULL DEFAULT '{}',
    "responsable_sst" JSONB,
    "logo_url" TEXT,
    "fecha_inicio_sgsst" TIMESTAMP(3),
    "sector_tipo_id" TEXT,
    "resultado_reglas" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sede" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT,
    "clase_riesgo" INTEGER,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sede_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zona" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "sede_id" TEXT,
    "zona_tipo_id" TEXT,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "zona_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proceso" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "proceso_tipo_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "proceso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "cargo_tipo_id" TEXT,
    "sede_id" TEXT,
    "zona_id" TEXT,
    "nombre" TEXT NOT NULL,
    "area" TEXT,
    "n_personas" INTEGER NOT NULL DEFAULT 1,
    "descripcion_funciones" TEXT,

    CONSTRAINT "cargo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarea" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "tarea_tipo_id" TEXT,
    "proceso_id" TEXT,
    "zona_id" TEXT,
    "actividad" TEXT,
    "nombre" TEXT NOT NULL,
    "rutinaria" BOOLEAN NOT NULL DEFAULT true,
    "alto_riesgo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'aprobado',
    "fuente" TEXT NOT NULL DEFAULT 'manual',

    CONSTRAINT "tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_tarea" (
    "cargo_id" TEXT NOT NULL,
    "tarea_id" TEXT NOT NULL,

    CONSTRAINT "cargo_tarea_pkey" PRIMARY KEY ("cargo_id","tarea_id")
);

-- CreateTable
CREATE TABLE "sector_tipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciius" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "descripcion" TEXT,
    "validado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sector_tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proceso_tipo" (
    "id" TEXT NOT NULL,
    "sector_tipo_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "validado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "proceso_tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zona_tipo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "validado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "zona_tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sector_zona_tipo" (
    "sector_tipo_id" TEXT NOT NULL,
    "zona_tipo_id" TEXT NOT NULL,

    CONSTRAINT "sector_zona_tipo_pkey" PRIMARY KEY ("sector_tipo_id","zona_tipo_id")
);

-- CreateTable
CREATE TABLE "cargo_tipo" (
    "id" TEXT NOT NULL,
    "sector_tipo_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "validado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cargo_tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarea_tipo" (
    "id" TEXT NOT NULL,
    "proceso_tipo_id" TEXT,
    "nombre" TEXT NOT NULL,
    "actividad" TEXT,
    "rutinaria" BOOLEAN NOT NULL DEFAULT true,
    "alto_riesgo" TEXT,
    "validado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tarea_tipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_tipo_tarea" (
    "cargo_tipo_id" TEXT NOT NULL,
    "tarea_tipo_id" TEXT NOT NULL,

    CONSTRAINT "cargo_tipo_tarea_pkey" PRIMARY KEY ("cargo_tipo_id","tarea_tipo_id")
);

-- CreateTable
CREATE TABLE "peligro_catalogo" (
    "id" TEXT NOT NULL,
    "clasificacion" TEXT NOT NULL,
    "subclasificacion" TEXT,
    "descripcion" TEXT NOT NULL,
    "efectos_posibles" TEXT NOT NULL,
    "nd_default" INTEGER NOT NULL DEFAULT 2,
    "ne_default" INTEGER NOT NULL DEFAULT 2,
    "nc_default" INTEGER NOT NULL DEFAULT 10,
    "controles_fuente" TEXT,
    "controles_medio" TEXT,
    "controles_individuo" TEXT,
    "medida_eliminacion" TEXT,
    "medida_sustitucion" TEXT,
    "medida_ingenieria" TEXT,
    "medida_administrativa" TEXT,
    "medida_epp" TEXT,
    "epp_sugerido" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "examenes_sugeridos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "capacitaciones_sugeridas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "normas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pve_asociado" TEXT,
    "requisito_legal_especifico" BOOLEAN NOT NULL DEFAULT false,
    "validado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "peligro_catalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarea_tipo_peligro" (
    "tarea_tipo_id" TEXT NOT NULL,
    "peligro_id" TEXT NOT NULL,
    "nd" INTEGER,
    "ne" INTEGER,
    "nc" INTEGER,

    CONSTRAINT "tarea_tipo_peligro_pkey" PRIMARY KEY ("tarea_tipo_id","peligro_id")
);

-- CreateTable
CREATE TABLE "zona_tipo_peligro" (
    "zona_tipo_id" TEXT NOT NULL,
    "peligro_id" TEXT NOT NULL,
    "nd" INTEGER,
    "ne" INTEGER,
    "nc" INTEGER,

    CONSTRAINT "zona_tipo_peligro_pkey" PRIMARY KEY ("zona_tipo_id","peligro_id")
);

-- CreateTable
CREATE TABLE "cargo_tipo_peligro" (
    "cargo_tipo_id" TEXT NOT NULL,
    "peligro_id" TEXT NOT NULL,
    "nd" INTEGER,
    "ne" INTEGER,
    "nc" INTEGER,

    CONSTRAINT "cargo_tipo_peligro_pkey" PRIMARY KEY ("cargo_tipo_id","peligro_id")
);

-- CreateTable
CREATE TABLE "matriz_version" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot" JSONB,

    CONSTRAINT "matriz_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peligro_evaluado" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "matriz_version_id" TEXT,
    "origen" TEXT NOT NULL,
    "tarea_id" TEXT,
    "zona_id" TEXT,
    "cargo_id" TEXT,
    "peligro_id" TEXT,
    "clasificacion" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "efectos_posibles" TEXT,
    "controles_fuente" TEXT,
    "controles_medio" TEXT,
    "controles_individuo" TEXT,
    "nd" INTEGER NOT NULL DEFAULT 2,
    "ne" INTEGER NOT NULL DEFAULT 2,
    "nc" INTEGER NOT NULL DEFAULT 10,
    "peor_consecuencia" TEXT,
    "requisito_legal" BOOLEAN NOT NULL DEFAULT false,
    "medida_eliminacion" TEXT,
    "medida_sustitucion" TEXT,
    "medida_ingenieria" TEXT,
    "medida_administrativa" TEXT,
    "medida_epp" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'aprobado',
    "fuente" TEXT NOT NULL DEFAULT 'manual',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "peligro_evaluado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estandar" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "ciclo" TEXT NOT NULL,
    "grupo" TEXT NOT NULL,
    "subgrupo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "puntaje" DOUBLE PRECISION NOT NULL,
    "aplica_7" BOOLEAN NOT NULL DEFAULT false,
    "aplica_21" BOOLEAN NOT NULL DEFAULT false,
    "modo_verificacion" TEXT,
    "actividad_sugerida" TEXT,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "estandar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "norma" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "entidad" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tema" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "articulos_clave" TEXT,
    "url_oficial" TEXT,
    "condicion_aplicabilidad" JSONB NOT NULL DEFAULT '{"siempre":true}',
    "vigente_desde" TIMESTAMP(3),
    "derogada_por" TEXT,
    "vigente" BOOLEAN NOT NULL DEFAULT true,
    "evidencia_cumplimiento" TEXT,

    CONSTRAINT "norma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regla_aplicabilidad" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "condicion" JSONB NOT NULL,
    "efecto" JSONB NOT NULL,
    "norma_ref" TEXT NOT NULL,
    "prioridad" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "regla_aplicabilidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ciiu_clase_riesgo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "clase_riesgo" INTEGER NOT NULL,
    "fuente" TEXT NOT NULL DEFAULT 'Decreto 1607/2002',

    CONSTRAINT "ciiu_clase_riesgo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluacion" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivel" INTEGER NOT NULL,
    "puntaje_bruto" DOUBLE PRECISION,
    "puntaje_ajustado" DOUBLE PRECISION,
    "valoracion" TEXT,
    "cerrada" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,

    CONSTRAINT "evaluacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluacion_item" (
    "id" TEXT NOT NULL,
    "evaluacion_id" TEXT NOT NULL,
    "estandar_id" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "justificacion" TEXT,
    "observacion" TEXT,
    "evidencia_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "evaluacion_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_mejoramiento_item" (
    "id" TEXT NOT NULL,
    "evaluacion_id" TEXT NOT NULL,
    "estandar_codigo" TEXT NOT NULL,
    "actividad" TEXT NOT NULL,
    "responsable" TEXT,
    "fecha_limite" TIMESTAMP(3),
    "recursos" TEXT,
    "soporte" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "avance" TEXT,

    CONSTRAINT "plan_mejoramiento_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantilla" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nivel_min" INTEGER NOT NULL DEFAULT 7,
    "condicion" JSONB,
    "estandares" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "normas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "descripcion" TEXT,
    "contenido_md" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "vigente_desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "carpeta" TEXT,

    CONSTRAINT "plantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documento" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "plantilla_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "estado" TEXT NOT NULL DEFAULT 'BORRADOR',
    "fecha_emision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivo_pdf_url" TEXT,
    "archivo_docx_url" TEXT,

    CONSTRAINT "documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documento_seccion" (
    "id" TEXT NOT NULL,
    "documento_id" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "contenido_generado" TEXT NOT NULL,
    "contenido_editado" TEXT,
    "requiere_revision" BOOLEAN NOT NULL DEFAULT false,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documento_seccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividad_plan" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "estandar_codigo" TEXT,
    "norma_ref" TEXT,
    "responsable" TEXT,
    "recursos" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'nivel',
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "fecha_ejecucion" TIMESTAMP(3),

    CONSTRAINT "actividad_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencia" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "actividad_id" TEXT,
    "estandar_codigo" TEXT,
    "descripcion" TEXT NOT NULL,
    "archivo_url" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evento" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,
    "cargo" TEXT,
    "dias_incapacidad" INTEGER NOT NULL DEFAULT 0,
    "dias_cargados" INTEGER NOT NULL DEFAULT 0,
    "mortal" BOOLEAN NOT NULL DEFAULT false,
    "caso_nuevo" BOOLEAN NOT NULL DEFAULT true,
    "origen_ausencia" TEXT,
    "reportado_arl" BOOLEAN NOT NULL DEFAULT false,
    "fecha_reporte" TIMESTAMP(3),
    "investigado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trabajadores_mes" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "mes" INTEGER NOT NULL,
    "n_trabajadores" INTEGER NOT NULL,
    "dias_programados" INTEGER,

    CONSTRAINT "trabajadores_mes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comite" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "periodo_inicio" TIMESTAMP(3),
    "periodo_fin" TIMESTAMP(3),
    "norma_ref" TEXT,

    CONSTRAINT "comite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comite_miembro" (
    "id" TEXT NOT NULL,
    "comite_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cedula" TEXT,
    "cargo" TEXT,
    "rol" TEXT NOT NULL,
    "representa" TEXT,

    CONSTRAINT "comite_miembro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acta" (
    "id" TEXT NOT NULL,
    "comite_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'ordinaria',
    "contenido_md" TEXT NOT NULL,
    "compromisos" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "acta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zona_tipo_nombre_key" ON "zona_tipo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estandar_codigo_key" ON "estandar"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "norma_codigo_key" ON "norma"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "regla_aplicabilidad_codigo_key" ON "regla_aplicabilidad"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ciiu_clase_riesgo_codigo_key" ON "ciiu_clase_riesgo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "evaluacion_item_evaluacion_id_estandar_id_key" ON "evaluacion_item"("evaluacion_id", "estandar_id");

-- CreateIndex
CREATE UNIQUE INDEX "plantilla_codigo_key" ON "plantilla"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "documento_empresa_id_codigo_key" ON "documento"("empresa_id", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "trabajadores_mes_empresa_id_anio_mes_key" ON "trabajadores_mes"("empresa_id", "anio", "mes");

-- AddForeignKey
ALTER TABLE "empresa" ADD CONSTRAINT "empresa_consultora_id_fkey" FOREIGN KEY ("consultora_id") REFERENCES "consultora"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empresa" ADD CONSTRAINT "empresa_sector_tipo_id_fkey" FOREIGN KEY ("sector_tipo_id") REFERENCES "sector_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sede" ADD CONSTRAINT "sede_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona" ADD CONSTRAINT "zona_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona" ADD CONSTRAINT "zona_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona" ADD CONSTRAINT "zona_zona_tipo_id_fkey" FOREIGN KEY ("zona_tipo_id") REFERENCES "zona_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proceso" ADD CONSTRAINT "proceso_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proceso" ADD CONSTRAINT "proceso_proceso_tipo_id_fkey" FOREIGN KEY ("proceso_tipo_id") REFERENCES "proceso_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_cargo_tipo_id_fkey" FOREIGN KEY ("cargo_tipo_id") REFERENCES "cargo_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sede"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_zona_id_fkey" FOREIGN KEY ("zona_id") REFERENCES "zona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea" ADD CONSTRAINT "tarea_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea" ADD CONSTRAINT "tarea_tarea_tipo_id_fkey" FOREIGN KEY ("tarea_tipo_id") REFERENCES "tarea_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea" ADD CONSTRAINT "tarea_proceso_id_fkey" FOREIGN KEY ("proceso_id") REFERENCES "proceso"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea" ADD CONSTRAINT "tarea_zona_id_fkey" FOREIGN KEY ("zona_id") REFERENCES "zona"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_tarea" ADD CONSTRAINT "cargo_tarea_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_tarea" ADD CONSTRAINT "cargo_tarea_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proceso_tipo" ADD CONSTRAINT "proceso_tipo_sector_tipo_id_fkey" FOREIGN KEY ("sector_tipo_id") REFERENCES "sector_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sector_zona_tipo" ADD CONSTRAINT "sector_zona_tipo_sector_tipo_id_fkey" FOREIGN KEY ("sector_tipo_id") REFERENCES "sector_tipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sector_zona_tipo" ADD CONSTRAINT "sector_zona_tipo_zona_tipo_id_fkey" FOREIGN KEY ("zona_tipo_id") REFERENCES "zona_tipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_tipo" ADD CONSTRAINT "cargo_tipo_sector_tipo_id_fkey" FOREIGN KEY ("sector_tipo_id") REFERENCES "sector_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea_tipo" ADD CONSTRAINT "tarea_tipo_proceso_tipo_id_fkey" FOREIGN KEY ("proceso_tipo_id") REFERENCES "proceso_tipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_tipo_tarea" ADD CONSTRAINT "cargo_tipo_tarea_cargo_tipo_id_fkey" FOREIGN KEY ("cargo_tipo_id") REFERENCES "cargo_tipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_tipo_tarea" ADD CONSTRAINT "cargo_tipo_tarea_tarea_tipo_id_fkey" FOREIGN KEY ("tarea_tipo_id") REFERENCES "tarea_tipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea_tipo_peligro" ADD CONSTRAINT "tarea_tipo_peligro_tarea_tipo_id_fkey" FOREIGN KEY ("tarea_tipo_id") REFERENCES "tarea_tipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea_tipo_peligro" ADD CONSTRAINT "tarea_tipo_peligro_peligro_id_fkey" FOREIGN KEY ("peligro_id") REFERENCES "peligro_catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona_tipo_peligro" ADD CONSTRAINT "zona_tipo_peligro_zona_tipo_id_fkey" FOREIGN KEY ("zona_tipo_id") REFERENCES "zona_tipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zona_tipo_peligro" ADD CONSTRAINT "zona_tipo_peligro_peligro_id_fkey" FOREIGN KEY ("peligro_id") REFERENCES "peligro_catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_tipo_peligro" ADD CONSTRAINT "cargo_tipo_peligro_cargo_tipo_id_fkey" FOREIGN KEY ("cargo_tipo_id") REFERENCES "cargo_tipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_tipo_peligro" ADD CONSTRAINT "cargo_tipo_peligro_peligro_id_fkey" FOREIGN KEY ("peligro_id") REFERENCES "peligro_catalogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriz_version" ADD CONSTRAINT "matriz_version_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peligro_evaluado" ADD CONSTRAINT "peligro_evaluado_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peligro_evaluado" ADD CONSTRAINT "peligro_evaluado_matriz_version_id_fkey" FOREIGN KEY ("matriz_version_id") REFERENCES "matriz_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peligro_evaluado" ADD CONSTRAINT "peligro_evaluado_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tarea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peligro_evaluado" ADD CONSTRAINT "peligro_evaluado_zona_id_fkey" FOREIGN KEY ("zona_id") REFERENCES "zona"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peligro_evaluado" ADD CONSTRAINT "peligro_evaluado_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peligro_evaluado" ADD CONSTRAINT "peligro_evaluado_peligro_id_fkey" FOREIGN KEY ("peligro_id") REFERENCES "peligro_catalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion" ADD CONSTRAINT "evaluacion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_item" ADD CONSTRAINT "evaluacion_item_evaluacion_id_fkey" FOREIGN KEY ("evaluacion_id") REFERENCES "evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_item" ADD CONSTRAINT "evaluacion_item_estandar_id_fkey" FOREIGN KEY ("estandar_id") REFERENCES "estandar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_mejoramiento_item" ADD CONSTRAINT "plan_mejoramiento_item_evaluacion_id_fkey" FOREIGN KEY ("evaluacion_id") REFERENCES "evaluacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento" ADD CONSTRAINT "documento_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "plantilla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documento_seccion" ADD CONSTRAINT "documento_seccion_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad_plan" ADD CONSTRAINT "actividad_plan_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trabajadores_mes" ADD CONSTRAINT "trabajadores_mes_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comite" ADD CONSTRAINT "comite_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comite_miembro" ADD CONSTRAINT "comite_miembro_comite_id_fkey" FOREIGN KEY ("comite_id") REFERENCES "comite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acta" ADD CONSTRAINT "acta_comite_id_fkey" FOREIGN KEY ("comite_id") REFERENCES "comite"("id") ON DELETE CASCADE ON UPDATE CASCADE;
