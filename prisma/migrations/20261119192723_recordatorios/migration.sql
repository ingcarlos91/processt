-- CreateTable
CREATE TABLE "recordatorio" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "titulo" TEXT NOT NULL,
    "notas" TEXT,
    "hecho" BOOLEAN NOT NULL DEFAULT false,
    "hecho_en" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recordatorio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "recordatorio_fecha_idx" ON "recordatorio"("fecha");

-- AddForeignKey
ALTER TABLE "recordatorio" ADD CONSTRAINT "recordatorio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
