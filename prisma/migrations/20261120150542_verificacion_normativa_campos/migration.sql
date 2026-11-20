-- AlterTable
ALTER TABLE "accion" ADD COLUMN     "dirigida_a" TEXT;

-- AlterTable
ALTER TABLE "auditoria" ADD COLUMN     "comunicado_a" TEXT,
ADD COLUMN     "comunicado_fecha" TIMESTAMP(3),
ADD COLUMN     "independiente" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "cargo" ADD COLUMN     "periodicidad_meses" INTEGER,
ADD COLUMN     "periodicidad_motivo" TEXT;

-- AlterTable
ALTER TABLE "comite" ADD COLUMN     "sede" TEXT;

-- AlterTable
ALTER TABLE "comite_miembro" ADD COLUMN     "calidad" TEXT;

-- AlterTable
ALTER TABLE "evento" ADD COLUMN     "afp" TEXT,
ADD COLUMN     "eps" TEXT,
ADD COLUMN     "expuestos" TEXT,
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3),
ADD COLUMN     "sede" TEXT,
ADD COLUMN     "sexo" TEXT;

-- AlterTable
ALTER TABLE "examen_medico" ADD COLUMN     "adaptacion_fecha" TIMESTAMP(3),
ADD COLUMN     "restriccion_hasta" TIMESTAMP(3),
ADD COLUMN     "restriccion_permanente" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "peligro_evaluado" ADD COLUMN     "seguimiento" JSONB NOT NULL DEFAULT '{}';
