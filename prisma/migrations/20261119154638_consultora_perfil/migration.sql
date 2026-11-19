-- AlterTable
ALTER TABLE "consultora" ADD COLUMN     "cargo" TEXT,
ADD COLUMN     "curso_50h" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "curso_50h_fecha" TEXT,
ADD COLUMN     "perfil" TEXT;
