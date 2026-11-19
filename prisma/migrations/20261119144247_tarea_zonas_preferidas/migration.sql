-- AlterTable
ALTER TABLE "tarea_tipo" ADD COLUMN     "zonas_preferidas" TEXT[] DEFAULT ARRAY[]::TEXT[];
