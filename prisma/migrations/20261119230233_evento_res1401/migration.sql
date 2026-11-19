-- AlterTable
ALTER TABLE "evento" ADD COLUMN     "inv_fechas" TEXT,
ADD COLUMN     "inv_lugar" TEXT,
ADD COLUMN     "jornada_habitual" BOOLEAN,
ADD COLUMN     "sitio_exacto" TEXT,
ADD COLUMN     "tiempo_empresa" TEXT,
ADD COLUMN     "tiempo_laborado" TEXT,
ADD COLUMN     "tipo_accidente" TEXT,
ADD COLUMN     "turno" TEXT,
ADD COLUMN     "version_testigos" TEXT,
ADD COLUMN     "version_trabajador" TEXT;
