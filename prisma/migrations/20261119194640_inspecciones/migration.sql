-- AlterTable
ALTER TABLE "accion" ADD COLUMN     "inspeccion_id" TEXT;

-- AlterTable
ALTER TABLE "evidencia" ADD COLUMN     "inspeccion_id" TEXT;

-- CreateTable
CREATE TABLE "inspeccion" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "lista" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "lugar" TEXT,
    "responsable" TEXT,
    "participantes" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspeccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inspeccion_empresa_id_fecha_idx" ON "inspeccion"("empresa_id", "fecha");

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_inspeccion_id_fkey" FOREIGN KEY ("inspeccion_id") REFERENCES "inspeccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accion" ADD CONSTRAINT "accion_inspeccion_id_fkey" FOREIGN KEY ("inspeccion_id") REFERENCES "inspeccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspeccion" ADD CONSTRAINT "inspeccion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
