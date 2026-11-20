import type { Consultora } from "@prisma/client";

/** Datos de la profesional de la consultora en el formato del responsable del SG-SST. */
export function profesionalDe(c: Consultora) {
  return {
    nombre: c.profesional ?? "", tipoDoc: c.tipoDoc, cedula: c.cedula ?? "", cargo: c.cargo ?? "Asesor(a) externo(a) en SST", perfil: c.perfil ?? "",
    licencia: c.licenciaSst ?? "", licenciaFecha: c.licenciaFecha?.toISOString().slice(0, 10) ?? "", curso50h: c.curso50h, curso50hFecha: c.curso50hFecha ?? "", curso20hFecha: c.curso20hFecha ?? "",
  };
}
