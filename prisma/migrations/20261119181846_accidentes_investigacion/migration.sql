-- AlterTable
ALTER TABLE "evento" ADD COLUMN     "agente" TEXT,
ADD COLUMN     "analisis" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "antiguedad" TEXT,
ADD COLUMN     "cargo_id" TEXT,
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "equipo" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "furat_numero" TEXT,
ADD COLUMN     "gravedad" TEXT NOT NULL DEFAULT 'leve',
ADD COLUMN     "hora" TEXT,
ADD COLUMN     "inv_cierre" TIMESTAMP(3),
ADD COLUMN     "inv_estado" TEXT NOT NULL DEFAULT 'pendiente',
ADD COLUMN     "inv_inicio" TIMESTAMP(3),
ADD COLUMN     "inv_remitida_arl" TIMESTAMP(3),
ADD COLUMN     "lecciones" TEXT,
ADD COLUMN     "lesion" TEXT,
ADD COLUMN     "lugar" TEXT,
ADD COLUMN     "mecanismo" TEXT,
ADD COLUMN     "parte_cuerpo" TEXT,
ADD COLUMN     "peligro_id" TEXT,
ADD COLUMN     "reporte_ministerio" TIMESTAMP(3),
ADD COLUMN     "tarea" TEXT,
ADD COLUMN     "testigos" TEXT,
ADD COLUMN     "trabajador_cedula" TEXT,
ADD COLUMN     "trabajador_nombre" TEXT,
ADD COLUMN     "vinculacion" TEXT;

-- AlterTable
ALTER TABLE "evidencia" ADD COLUMN     "evento_id" TEXT;

-- CreateTable
CREATE TABLE "accion" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "evento_id" TEXT,
    "origen" TEXT NOT NULL DEFAULT 'investigacion',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hallazgo" TEXT NOT NULL,
    "causa" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'correctiva',
    "jerarquia" TEXT,
    "descripcion" TEXT NOT NULL,
    "responsable" TEXT,
    "fecha_limite" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'abierta',
    "fecha_cierre" TIMESTAMP(3),
    "eficacia" TEXT,
    "actividad_id" TEXT,

    CONSTRAINT "accion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evento_empresa_id_fecha_idx" ON "evento"("empresa_id", "fecha");

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento" ADD CONSTRAINT "evento_peligro_id_fkey" FOREIGN KEY ("peligro_id") REFERENCES "peligro_catalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accion" ADD CONSTRAINT "accion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accion" ADD CONSTRAINT "accion_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "evento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accion" ADD CONSTRAINT "accion_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
