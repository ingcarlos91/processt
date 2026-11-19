-- CreateTable
CREATE TABLE "trabajador" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "tipo_doc" TEXT NOT NULL DEFAULT 'CC',
    "documento" TEXT,
    "cargo_id" TEXT,
    "vinculacion" TEXT NOT NULL DEFAULT 'planta',
    "fecha_ingreso" TIMESTAMP(3),
    "fecha_retiro" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "sexo" TEXT,
    "fecha_nacimiento" TIMESTAMP(3),
    "escolaridad" TEXT,
    "telefono" TEXT,
    "correo" TEXT,
    "eps" TEXT,
    "afp" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trabajador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examen_medico" (
    "id" TEXT NOT NULL,
    "trabajador_id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "ips" TEXT,
    "concepto" TEXT NOT NULL,
    "restricciones" TEXT,
    "comunicado_trabajador" TIMESTAMP(3),
    "proximo" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "examen_medico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrega_epp" (
    "id" TEXT NOT NULL,
    "trabajador_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "elemento" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "tipo" TEXT NOT NULL DEFAULT 'dotacion',
    "capacitado" BOOLEAN NOT NULL DEFAULT true,
    "proxima_reposicion" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrega_epp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "capacitacion" (
    "id" TEXT NOT NULL,
    "empresa_id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "tema" TEXT NOT NULL,
    "horas" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "facilitador" TEXT,
    "modalidad" TEXT NOT NULL DEFAULT 'presencial',
    "actividad_id" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "capacitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencia_capacitacion" (
    "id" TEXT NOT NULL,
    "capacitacion_id" TEXT NOT NULL,
    "trabajador_id" TEXT NOT NULL,
    "aprobo" BOOLEAN,

    CONSTRAINT "asistencia_capacitacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "trabajador_empresa_id_idx" ON "trabajador"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "asistencia_capacitacion_capacitacion_id_trabajador_id_key" ON "asistencia_capacitacion"("capacitacion_id", "trabajador_id");

-- AddForeignKey
ALTER TABLE "trabajador" ADD CONSTRAINT "trabajador_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trabajador" ADD CONSTRAINT "trabajador_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examen_medico" ADD CONSTRAINT "examen_medico_trabajador_id_fkey" FOREIGN KEY ("trabajador_id") REFERENCES "trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega_epp" ADD CONSTRAINT "entrega_epp_trabajador_id_fkey" FOREIGN KEY ("trabajador_id") REFERENCES "trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitacion" ADD CONSTRAINT "capacitacion_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "capacitacion" ADD CONSTRAINT "capacitacion_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividad_plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia_capacitacion" ADD CONSTRAINT "asistencia_capacitacion_capacitacion_id_fkey" FOREIGN KEY ("capacitacion_id") REFERENCES "capacitacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencia_capacitacion" ADD CONSTRAINT "asistencia_capacitacion_trabajador_id_fkey" FOREIGN KEY ("trabajador_id") REFERENCES "trabajador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
