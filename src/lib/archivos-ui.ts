import type { ArchivoUI } from "@/components/app/adjuntos";

/** Convierte un registro de evidencia al formato que usa la interfaz. */
export const aArchivoUI = (a: { id: string; tipo: string; descripcion: string; nombreArchivo: string | null; mime: string | null; tamano: number | null; fecha: Date; subidoPor: string | null; activo: boolean; documentoVersion?: number | null }): ArchivoUI =>
  ({ id: a.id, tipo: a.tipo, descripcion: a.descripcion, nombreArchivo: a.nombreArchivo, mime: a.mime, tamano: a.tamano, fecha: a.fecha.toISOString(), subidoPor: a.subidoPor, activo: a.activo, documentoVersion: a.documentoVersion ?? null });
