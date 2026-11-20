import { parametrosPlazos } from "@/lib/plazos-servidor";
import { db } from "@/lib/db";
import { plazosUI } from "@/lib/eventos-ui";
import { EventosLista } from "@/components/accidentes/lista";
import { cargarCatalogoAccidentes } from "@/lib/catalogo-accidentes";

export const dynamic = "force-dynamic";

export default async function Accidentes({ params, searchParams }: PageProps<"/empresas/[id]/accidentes">) {
  const { id } = await params;
  const sp = await searchParams;
  const anio = Number(sp.anio) || new Date().getUTCFullYear();
  const [eventos, cargos, acciones, cat, sedes, zonas] = await Promise.all([
    db.evento.findMany({ where: { empresaId: id }, orderBy: { fecha: "desc" }, include: { _count: { select: { acciones: true, archivos: true } } } }),
    db.cargo.findMany({ where: { empresaId: id }, orderBy: { nombre: "asc" }, include: { tareas: { include: { tarea: { select: { nombre: true } } } }, trabajadores: { where: { activo: true }, orderBy: { nombres: "asc" }, select: { nombres: true, tipoDoc: true, documento: true, vinculacion: true, fechaIngreso: true, sexo: true, fechaNacimiento: true, eps: true, afp: true } }, sede: { select: { nombre: true } } } }),
    db.accion.findMany({ where: { empresaId: id }, select: { estado: true, fechaLimite: true } }),
    cargarCatalogoAccidentes(),
    db.sede.findMany({ where: { empresaId: id }, select: { nombre: true } }),
    db.zona.findMany({ where: { empresaId: id }, select: { nombre: true } }),
  ]);
  const hoy = new Date();
  const parPlazos = await parametrosPlazos();
  const lista = eventos.map((e) => ({
    id: e.id, tipo: e.tipo, gravedad: e.gravedad, fecha: e.fecha.toISOString(), trabajador: e.trabajadorNombre ?? "", cargo: e.cargo ?? "",
    descripcion: e.descripcion ?? "", dias: e.diasIncapacidad + e.diasCargados, invEstado: e.invEstado, acciones: e._count.acciones, archivos: e._count.archivos,
    plazos: plazosUI(e, hoy, parPlazos),
  }));
  const anios = [...new Set([anio, hoy.getUTCFullYear(), ...eventos.map((e) => e.fecha.getUTCFullYear())])].sort((a, b) => b - a);
  return (
    <EventosLista parametros={parPlazos} empresaId={id} anio={anio} anios={anios} eventos={lista} cat={cat} lugares={[...new Set([...zonas, ...sedes].map((x) => x.nombre))]} sedes={sedes.map((x) => x.nombre)}
      cargos={cargos.map((c) => ({ id: c.id, nombre: c.nombre, sede: c.sede?.nombre, tareas: c.tareas.map((t) => t.tarea.nombre), personas: c.trabajadores.map((t) => ({ nombre: t.nombres, tipoDoc: t.tipoDoc, documento: t.documento ?? "", vinculacion: t.vinculacion, ingreso: t.fechaIngreso?.toISOString().slice(0, 10) ?? "", sexo: t.sexo ?? "", nacimiento: t.fechaNacimiento?.toISOString().slice(0, 10) ?? "", eps: t.eps ?? "", afp: t.afp ?? "" })) }))}
      acciones={{ abiertas: acciones.filter((a) => a.estado === "abierta").length, vencidas: acciones.filter((a) => a.estado === "abierta" && a.fechaLimite && a.fechaLimite < hoy).length }} />
  );
}
