-- AlterTable
ALTER TABLE "accion" ADD COLUMN     "auditoriaId" TEXT;

-- AlterTable
ALTER TABLE "evidencia" ADD COLUMN     "auditoria_id" TEXT;

-- CreateTable
CREATE TABLE "auditoria" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_cierre" TIMESTAMP(3),
    "auditor" TEXT NOT NULL,
    "auditor_perfil" TEXT,
    "participantes" TEXT,
    "alcance" TEXT,
    "metodologia" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "conclusiones" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'en_curso',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "auditoria_empresa_id_anio_idx" ON "auditoria"("empresa_id", "anio");

-- AddForeignKey
ALTER TABLE "evidencia" ADD CONSTRAINT "evidencia_auditoria_id_fkey" FOREIGN KEY ("auditoria_id") REFERENCES "auditoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accion" ADD CONSTRAINT "accion_auditoriaId_fkey" FOREIGN KEY ("auditoriaId") REFERENCES "auditoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
