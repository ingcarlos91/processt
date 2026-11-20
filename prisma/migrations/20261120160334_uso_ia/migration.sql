-- AlterTable
ALTER TABLE "consultora" ADD COLUMN     "ia_tope_mensual_usd" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "uso_ia" (
    "id" TEXT NOT NULL,
    "consultora_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "tarea" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "tokens_entrada" INTEGER NOT NULL DEFAULT 0,
    "tokens_salida" INTEGER NOT NULL DEFAULT 0,
    "costo_usd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ok" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uso_ia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "uso_ia_consultora_id_creado_en_idx" ON "uso_ia"("consultora_id", "creado_en");

-- AddForeignKey
ALTER TABLE "uso_ia" ADD CONSTRAINT "uso_ia_consultora_id_fkey" FOREIGN KEY ("consultora_id") REFERENCES "consultora"("id") ON DELETE CASCADE ON UPDATE CASCADE;

