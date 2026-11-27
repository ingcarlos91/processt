-- CreateTable
CREATE TABLE "conocimiento" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "fuente" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "norma_codigo" TEXT,
    "articulo" TEXT,
    "href" TEXT,
    "url_oficial" TEXT,
    "literal" BOOLEAN NOT NULL DEFAULT false,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conocimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conocimiento_clave_key" ON "conocimiento"("clave");

-- CreateIndex
CREATE INDEX "conocimiento_fuente_idx" ON "conocimiento"("fuente");

-- Búsqueda de texto en español sin tildes para el asistente (src/lib/conocimiento.ts).
CREATE EXTENSION IF NOT EXISTS unaccent;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_ts_config WHERE cfgname = 'es_sin_tildes') THEN
    CREATE TEXT SEARCH CONFIGURATION es_sin_tildes (COPY = spanish);
    ALTER TEXT SEARCH CONFIGURATION es_sin_tildes ALTER MAPPING FOR hword, hword_part, word WITH unaccent, spanish_stem;
  END IF;
END $$;
