import { db } from "@/lib/db";
import { plazosUI } from "@/lib/eventos-ui";
import { EventosLista } from "@/components/accidentes/lista";

export const dynamic = "force-dynamic";

export default async function Accidentes({ params, searchParams }: PageProps<"/empresas/[id]/accidentes">) {
  const { id } = await params;
  const sp = await searchParams;
  const anio = Number(sp.anio) || new Date().getUTCFullYear();
  const [eventos, cargos, acciones] = await Promise.all([
    db.evento.findMany({ where: { empresaId: id }, orderBy: { fecha: "desc" }, include: { _count: { select: { acciones: true, archivos: true } } } }),
    db.cargo.findMany({ where: { empresaId: id }, orderBy: { nombre: "asc" }, include: { tareas: { include: { tarea: { select: { nombre: true } } } } } }),
    db.accion.findMany({ where: { empresaId: id }, select: { estado: true, fechaLimite: true } }),
  ]);
  const hoy = new Date();
  const lista = eventos.map((e) => ({
    id: e.id, tipo: e.tipo, gravedad: e.gravedad, fecha: e.fecha.toISOString(), trabajador: e.trabajadorNombre ?? "", cargo: e.cargo ?? "",
    descripcion: e.descripcion ?? "", dias: e.diasIncapacidad + e.diasCargados, invEstado: e.invEstado, acciones: e._count.acciones, archivos: e._count.archivos,
    plazos: plazosUI(e, hoy),
  }));
  const anios = [...new Set([anio, hoy.getUTCFullYear(), ...eventos.map((e) => e.fecha.getUTCFullYear())])].sort((a, b) => b - a);
  return (
    <EventosLista empresaId={id} anio={anio} anios={anios} eventos={lista}
      cargos={cargos.map((c) => ({ id: c.id, nombre: c.nombre, tareas: c.tareas.map((t) => t.tarea.nombre) }))}
      acciones={{ abiertas: acciones.filter((a) => a.estado === "abierta").length, vencidas: acciones.filter((a) => a.estado === "abierta" && a.fechaLimite && a.fechaLimite < hoy).length }} />
  );
}
