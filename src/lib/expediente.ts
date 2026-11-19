import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";

/** Para cada estándar aplicable: documentos que lo respaldan (firmados o no) y evidencias ligadas. */
export async function expedientePorEstandar(empresaId: string) {
  const rr = await recalcularEmpresa(empresaId);
  const [estandares, docs, evs, ev] = await Promise.all([
    db.estandar.findMany({ where: { codigo: { in: rr.estandares } }, orderBy: { orden: "asc" } }),
    db.documento.findMany({ where: { empresaId }, include: { plantilla: { select: { estandares: true } }, archivos: { where: { activo: true }, orderBy: { subidoEn: "desc" } } } }),
    db.evidencia.findMany({ where: { empresaId, activo: true, documentoId: null }, orderBy: { fecha: "desc" } }),
    db.evaluacion.findFirst({ where: { empresaId }, orderBy: { fecha: "desc" }, include: { items: { include: { estandar: { select: { codigo: true } } } } } }),
  ]);
  return estandares.map((s) => {
    const documentos = docs.filter((d) => d.plantilla.estandares.includes(s.codigo)).map((d) => ({ id: d.id, codigo: d.codigo, nombre: d.nombre, version: d.version, firmado: d.archivos[0] ?? null }));
    const evidencias = evs.filter((e) => e.estandarCodigo === s.codigo);
    const estado = ev?.items.find((i) => i.estandar.codigo === s.codigo)?.estado ?? "PENDIENTE";
    const conSoporte = documentos.some((d) => d.firmado) || evidencias.length > 0;
    return { codigo: s.codigo, descripcion: s.descripcion, grupo: s.grupo, modo: s.modoVerificacion ?? "", estado, documentos, evidencias, conSoporte };
  });
}
