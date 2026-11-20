-- DropIndex
DROP INDEX "catalogo_item_tipo_nombre_empresa_id_key";

-- AlterTable
ALTER TABLE "cargo_tipo" ADD COLUMN     "consultora_id" TEXT;

-- AlterTable
ALTER TABLE "catalogo_item" ADD COLUMN     "consultora_id" TEXT;

-- AlterTable
ALTER TABLE "consultora" ADD COLUMN     "activa" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "peligro_catalogo" ADD COLUMN     "consultora_id" TEXT;

-- AlterTable
ALTER TABLE "recordatorio" ADD COLUMN     "consultora_id" TEXT;

-- AlterTable
ALTER TABLE "tarea_tipo" ADD COLUMN     "consultora_id" TEXT;

-- AlterTable
ALTER TABLE "usuario" ALTER COLUMN "consultora_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "plantilla_consultora" (
    "id" TEXT NOT NULL,
    "consultora_id" TEXT NOT NULL,
    "plantilla_id" TEXT NOT NULL,
    "contenido_md" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "vigente_desde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "base_version" INTEGER NOT NULL,

    CONSTRAINT "plantilla_consultora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plantilla_consultora_consultora_id_plantilla_id_key" ON "plantilla_consultora"("consultora_id", "plantilla_id");

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_item_tipo_nombre_empresa_id_consultora_id_key" ON "catalogo_item"("tipo", "nombre", "empresa_id", "consultora_id");

-- AddForeignKey
ALTER TABLE "cargo_tipo" ADD CONSTRAINT "cargo_tipo_consultora_id_fkey" FOREIGN KEY ("consultora_id") REFERENCES "consultora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea_tipo" ADD CONSTRAINT "tarea_tipo_consultora_id_fkey" FOREIGN KEY ("consultora_id") REFERENCES "consultora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peligro_catalogo" ADD CONSTRAINT "peligro_catalogo_consultora_id_fkey" FOREIGN KEY ("consultora_id") REFERENCES "consultora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantilla_consultora" ADD CONSTRAINT "plantilla_consultora_consultora_id_fkey" FOREIGN KEY ("consultora_id") REFERENCES "consultora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantilla_consultora" ADD CONSTRAINT "plantilla_consultora_plantilla_id_fkey" FOREIGN KEY ("plantilla_id") REFERENCES "plantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorio" ADD CONSTRAINT "recordatorio_consultora_id_fkey" FOREIGN KEY ("consultora_id") REFERENCES "consultora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogo_item" ADD CONSTRAINT "catalogo_item_consultora_id_fkey" FOREIGN KEY ("consultora_id") REFERENCES "consultora"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Datos existentes: pertenecen a la consultora original (la más antigua).
UPDATE "recordatorio" SET "consultora_id" = (SELECT "id" FROM "consultora" ORDER BY "creado_en" ASC LIMIT 1) WHERE "empresa_id" IS NULL AND "consultora_id" IS NULL;

-- Las plantillas que la consultora original editó pasan a ser su versión propia; la base vuelve a ser la de PROCESST
-- (el despliegue la sincroniza con el texto oficial).
INSERT INTO "plantilla_consultora" ("id", "consultora_id", "plantilla_id", "contenido_md", "version", "vigente_desde", "base_version")
SELECT 'pc_' || p."id", c."id", p."id", p."contenido_md", p."version", p."vigente_desde", p."version"
FROM "plantilla" p CROSS JOIN (SELECT "id" FROM "consultora" ORDER BY "creado_en" ASC LIMIT 1) c
WHERE p."editada_por_usuario" = true;
UPDATE "plantilla" SET "editada_por_usuario" = false WHERE "editada_por_usuario" = true;
