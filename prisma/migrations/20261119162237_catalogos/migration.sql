-- CreateTable
CREATE TABLE "catalogo_item" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "detalle" JSONB NOT NULL DEFAULT '{}',
    "normas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogo_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalogo_item_tipo_nombre_key" ON "catalogo_item"("tipo", "nombre");
