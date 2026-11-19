import { db } from "@/lib/db";
import { cargarEmpresa, filasMatriz } from "@/lib/generador/contexto";
import { TrabajadoresEditor } from "@/components/trabajadores/editor";

export const dynamic = "force-dynamic";
const iso = (d?: Date | null) => d?.toISOString().slice(0, 10) ?? "";

export default async function Trabajadores({ params }: PageProps<"/empresas/[id]/trabajadores">) {
  const { id } = await params;
  const [ts, caps, catalogo, actividades, e] = await Promise.all([
    db.trabajador.findMany({ where: { empresaId: id }, orderBy: { nombres: "asc" }, include: { cargo: { select: { nombre: true } }, examenes: { orderBy: { fecha: "desc" } }, entregasEpp: { orderBy: { fecha: "desc" } }, asistencias: { select: { capacitacionId: true } } } }),
    db.capacitacion.findMany({ where: { empresaId: id }, orderBy: { fecha: "desc" }, include: { asistentes: { select: { trabajadorId: true } }, actividad: { select: { nombre: true } } } }),
    db.catalogoItem.findMany({ where: { tipo: { in: ["EPP", "CAPACITACION"] }, OR: [{ empresaId: null }, { empresaId: id }] }, select: { tipo: true, nombre: true }, orderBy: { nombre: "asc" } }),
    db.actividadPlan.findMany({ where: { empresaId: id, estado: "PENDIENTE" }, orderBy: [{ anio: "asc" }, { mes: "asc" }], select: { id: true, nombre: true, anio: true, mes: true } }),
    cargarEmpresa(id),
  ]);
  // EPP y capacitaciones sugeridos por cargo, según los peligros de su matriz.
  const filas = filasMatriz(e);
  const sugeridos = Object.fromEntries(e.cargos.map((c) => {
    const cat = filas.filter((f) => f.cargos.includes(c.nombre)).map((f) => f.catalogo).filter(Boolean);
    return [c.id, { epp: [...new Set(cat.flatMap((p) => p!.eppSugerido))], capacitaciones: [...new Set(cat.flatMap((p) => p!.capacitacionesSugeridas))] }];
  }));
  return (
    <TrabajadoresEditor
      empresaId={id}
      cargos={e.cargos.map((c) => ({ id: c.id, nombre: c.nombre, nPersonas: c.nPersonas }))}
      sugeridos={sugeridos}
      catalogoEpp={catalogo.filter((c) => c.tipo === "EPP").map((c) => c.nombre)}
      catalogoCapacitaciones={catalogo.filter((c) => c.tipo === "CAPACITACION").map((c) => c.nombre)}
      actividades={actividades.map((a) => ({ id: a.id, nombre: a.nombre, periodo: `${a.mes}/${a.anio}` }))}
      trabajadores={ts.map((t) => ({
        id: t.id, nombres: t.nombres, tipoDoc: t.tipoDoc, documento: t.documento ?? "", cargoId: t.cargoId ?? "", cargo: t.cargo?.nombre ?? "", vinculacion: t.vinculacion,
        fechaIngreso: iso(t.fechaIngreso), fechaRetiro: iso(t.fechaRetiro), activo: t.activo, sexo: t.sexo ?? "", fechaNacimiento: iso(t.fechaNacimiento), escolaridad: t.escolaridad ?? "",
        telefono: t.telefono ?? "", correo: t.correo ?? "", eps: t.eps ?? "", afp: t.afp ?? "",
        examenes: t.examenes.map((x) => ({ id: x.id, tipo: x.tipo, fecha: iso(x.fecha), ips: x.ips ?? "", concepto: x.concepto, restricciones: x.restricciones ?? "", comunicadoTrabajador: iso(x.comunicadoTrabajador), proximo: iso(x.proximo) })),
        entregas: t.entregasEpp.map((x) => ({ id: x.id, fecha: iso(x.fecha), elemento: x.elemento, cantidad: x.cantidad, tipo: x.tipo, capacitado: x.capacitado, proximaReposicion: iso(x.proximaReposicion) })),
        capacitaciones: t.asistencias.length,
      }))}
      capacitaciones={caps.map((c) => ({ id: c.id, fecha: iso(c.fecha), tema: c.tema, horas: c.horas, facilitador: c.facilitador ?? "", modalidad: c.modalidad, actividadId: c.actividadId ?? "", actividad: c.actividad?.nombre ?? "", asistentes: c.asistentes.map((a) => a.trabajadorId) }))}
    />
  );
}
