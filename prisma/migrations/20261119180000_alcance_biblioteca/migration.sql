-- DropIndex
DROP INDEX "catalogo_item_tipo_nombre_key";

-- AlterTable
ALTER TABLE "cargo_tipo" ADD COLUMN     "empresa_id" TEXT;

-- AlterTable
ALTER TABLE "catalogo_item" ADD COLUMN     "empresa_id" TEXT;

-- AlterTable
ALTER TABLE "peligro_catalogo" ADD COLUMN     "empresa_id" TEXT;

-- AlterTable
ALTER TABLE "tarea_tipo" ADD COLUMN     "empresa_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_item_tipo_nombre_empresa_id_key" ON "catalogo_item"("tipo", "nombre", "empresa_id");

-- AddForeignKey
ALTER TABLE "cargo_tipo" ADD CONSTRAINT "cargo_tipo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea_tipo" ADD CONSTRAINT "tarea_tipo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peligro_catalogo" ADD CONSTRAINT "peligro_catalogo_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalogo_item" ADD CONSTRAINT "catalogo_item_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

