-- AlterTable
ALTER TABLE "empresa" ADD COLUMN     "contrato_horas_mes" DOUBLE PRECISION,
ADD COLUMN     "contrato_valor_mes" INTEGER;

-- CreateTable
CREATE TABLE "visita" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horas" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "modalidad" TEXT NOT NULL DEFAULT 'presencial',
    "atendio" TEXT,
    "actividades" TEXT NOT NULL,
    "compromisos" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visita_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visita_empresa_id_fecha_idx" ON "visita"("empresa_id", "fecha");

-- AddForeignKey
ALTER TABLE "visita" ADD CONSTRAINT "visita_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
