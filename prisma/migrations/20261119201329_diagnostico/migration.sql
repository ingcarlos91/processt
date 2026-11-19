-- AlterTable
ALTER TABLE "empresa" ADD COLUMN     "etapa" TEXT NOT NULL DEFAULT 'activa';

-- AlterTable
ALTER TABLE "evidencia" ADD COLUMN     "diagnostico_id" TEXT;

-- CreateTable
CREATE TABLE "diagnostico" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivel" INTEGER NOT NULL,
    "items" JSONB NOT NULL DEFAULT '[]',
    "puntaje" DOUBLE PRECISION,
    "valoracion" TEXT,
    "por_ciclo" JSONB,
    "conclusiones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'borrador',
    "cerrado_en" TIMESTAMP(3),
    "evaluacion_id" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_diagnostico_id_fkey" FOREIGN KEY ("diagnostico_id") REFERENCES "diagnostico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostico" ADD CONSTRAINT "diagnostico_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
