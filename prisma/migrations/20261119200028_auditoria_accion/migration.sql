/*
  Warnings:

  - You are about to drop the column `auditoriaId` on the `accion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "accion" DROP CONSTRAINT "accion_auditoriaId_fkey";

-- AlterTable
ALTER TABLE "accion" DROP COLUMN "auditoriaId",
ADD COLUMN     "auditoria_id" TEXT;

-- AddForeignKey
ALTER TABLE "accion" ADD CONSTRAINT "accion_auditoria_id_fkey" FOREIGN KEY ("auditoria_id") REFERENCES "auditoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
