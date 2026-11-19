-- AlterTable
ALTER TABLE "trabajador" ADD COLUMN     "alto_riesgo_pension" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "conduce" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manipula_alimentos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "modalidad" TEXT NOT NULL DEFAULT 'presencial',
ADD COLUMN     "turno_nocturno" BOOLEAN NOT NULL DEFAULT false;
