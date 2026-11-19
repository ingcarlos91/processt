-- AlterTable
ALTER TABLE "evidencia" ADD COLUMN     "activo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "comite_id" TEXT,
ADD COLUMN     "documento_id" TEXT,
ADD COLUMN     "documento_version" INTEGER,
ADD COLUMN     "mime" TEXT,
ADD COLUMN     "motivo_baja" TEXT,
ADD COLUMN     "nombre_archivo" TEXT,
ADD COLUMN     "subido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "subido_por" TEXT,
ADD COLUMN     "tamano" INTEGER,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'EVIDENCIA';

-- CreateIndex
CREATE INDEX "evidencia_empresa_id_estandar_codigo_idx" ON "evidencia"("empresa_id", "estandar_codigo");

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_comite_id_fkey" FOREIGN KEY ("comite_id") REFERENCES "comite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
