/**
 * Filtro de lo que ve una consultora en la biblioteca: la base PROCESST (consultoraId y empresaId en null), lo suyo y,
 * si se indica, lo de una de sus empresas. Función pura (sin dependencias de servidor) para poder importarla en
 * módulos que también usan componentes del navegador.
 */
export function alcanceBiblioteca(consultoraId: string, empresaId?: string | null) {
  return { OR: [{ consultoraId: null, empresaId: null }, { consultoraId, empresaId: null }, ...(empresaId ? [{ empresaId }] : [])] };
}
