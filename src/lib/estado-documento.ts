// Estado de un documento según lo que realmente ha pasado con él (no solo el campo guardado).
export type EstadoDoc = "sin_generar" | "por_revisar" | "borrador" | "aprobado" | "firmado" | "volver_a_firmar";

export const ESTADOS_DOC: Record<EstadoDoc, { t: string; que: string; siguiente: string; clase: string; punto: string }> = {
  sin_generar: { t: "Sin generar", que: "El documento aplica a la empresa pero aún no se ha redactado.", siguiente: "Pulse “Generar / actualizar todos los documentos”.", clase: "border-dashed text-muted-foreground", punto: "bg-muted-foreground/40" },
  por_revisar: { t: "Por revisar", que: "Los datos de la empresa cambiaron después de que usted editó alguna sección.", siguiente: "Abra el documento y decida en cada sección marcada si conserva su versión o restaura la generada.", clase: "border-amber-300 bg-amber-50 text-amber-800", punto: "bg-amber-500" },
  borrador: { t: "Borrador", que: "Redactado por el sistema con los datos de la empresa; la consultora aún no lo ha revisado.", siguiente: "Revíselo, ajuste lo necesario y márquelo como aprobado.", clase: "border-slate-300 bg-slate-50 text-slate-700", punto: "bg-slate-400" },
  aprobado: { t: "Aprobado", que: "La consultora lo revisó y está listo.", siguiente: "Descárguelo, hágalo firmar y suba el firmado.", clase: "border-sky-300 bg-sky-50 text-sky-800", punto: "bg-sky-500" },
  firmado: { t: "Firmado", que: "Hay una versión firmada de la versión vigente del documento.", siguiente: "Ninguno: está vigente y en el expediente.", clase: "border-emerald-300 bg-emerald-50 text-emerald-800", punto: "bg-emerald-500" },
  volver_a_firmar: { t: "Volver a firmar", que: "El documento cambió después de la última firma: el firmado corresponde a una versión anterior.", siguiente: "Revise los cambios, descárguelo, hágalo firmar de nuevo y súbalo.", clase: "border-orange-300 bg-orange-50 text-orange-800", punto: "bg-orange-500" },
};

export function estadoDocumento(d: { estado: string; version: number; firmadoVersion?: number | null; revisar?: boolean } | null): EstadoDoc {
  if (!d) return "sin_generar";
  if (d.firmadoVersion) return d.firmadoVersion < d.version ? "volver_a_firmar" : "firmado";
  if (d.revisar) return "por_revisar";
  return d.estado === "APROBADO" ? "aprobado" : d.estado === "FIRMADO" ? "firmado" : "borrador";
}
