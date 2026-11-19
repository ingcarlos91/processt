-- CreateTable
CREATE TABLE "proceso_tipo_tarea" (
    "proceso_tipo_id" TEXT NOT NULL,
    "tarea_tipo_id" TEXT NOT NULL,

    CONSTRAINT "proceso_tipo_tarea_pkey" PRIMARY KEY ("proceso_tipo_id","tarea_tipo_id")
);

-- AddForeignKey
ALTER TABLE "proceso_tipo_tarea" ADD CONSTRAINT "proceso_tipo_tarea_proceso_tipo_id_fkey" FOREIGN KEY ("proceso_tipo_id") REFERENCES "proceso_tipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proceso_tipo_tarea" ADD CONSTRAINT "proceso_tipo_tarea_tarea_tipo_id_fkey" FOREIGN KEY ("tarea_tipo_id") REFERENCES "tarea_tipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
