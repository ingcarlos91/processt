-- AlterTable
ALTER TABLE "comite_miembro" ADD COLUMN     "tipo_doc" TEXT NOT NULL DEFAULT 'CC';

-- AlterTable
ALTER TABLE "consultora" ADD COLUMN     "tipo_doc" TEXT NOT NULL DEFAULT 'CC';

-- AlterTable
ALTER TABLE "empresa" ADD COLUMN     "representante_tipo_doc" TEXT NOT NULL DEFAULT 'CC';

-- AlterTable
ALTER TABLE "evento" ADD COLUMN     "trabajador_tipo_doc" TEXT;
