import { db } from "@/lib/db";
import { Page, PageHeader, Stat } from "@/components/app/ui";
import { BibliotecaEditor } from "@/components/biblioteca/editor";

export const dynamic = "force-dynamic";

export default async function Biblioteca() {
  const [peligros, sectores, tareas] = await Promise.all([
    db.peligroCatalogo.findMany({ orderBy: [{ clasificacion: "asc" }, { descripcion: "asc" }], include: { _count: { select: { tareas: true, evaluados: true } } } }),
    db.sectorTipo.findMany({ orderBy: { nombre: "asc" }, include: { cargos: { orderBy: { nombre: "asc" }, include: { tareas: { include: { tareaTipo: { select: { nombre: true } } } } } }, procesos: true } }),
    db.tareaTipo.count(),
  ]);
  return (
    <Page>
      <PageHeader title="Biblioteca de peligros" description="Conocimiento reutilizable para todas las empresas: sectores, cargos tipo, tareas tipo y peligros (clasificación y escalas GTC 45). Los valores son sugeridos y se ajustan en cada empresa. Lo que guarde desde una matriz queda aquí para el siguiente cliente." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Peligros" value={peligros.length} hint={`${peligros.filter((p) => p.validado).length} validados por usted`} />
        <Stat label="Tareas tipo" value={tareas} />
        <Stat label="Cargos tipo" value={sectores.reduce((s, x) => s + x.cargos.length, 0)} />
        <Stat label="Sectores" value={sectores.length} />
      </div>
      <BibliotecaEditor
        peligros={peligros.map((p) => ({ id: p.id, clasificacion: p.clasificacion, sub: p.subclasificacion ?? "", descripcion: p.descripcion, efectos: p.efectosPosibles, nd: p.ndDefault, ne: p.neDefault, nc: p.ncDefault, ingenieria: p.medidaIngenieria ?? "", administrativa: p.medidaAdministrativa ?? "", epp: p.eppSugerido, examenes: p.examenesSugeridos, capacitaciones: p.capacitacionesSugeridas, normas: p.normas, pve: p.pveAsociado ?? "", validado: p.validado, usos: p._count.evaluados, enTareas: p._count.tareas }))}
        sectores={sectores.map((s) => ({ id: s.id, nombre: s.nombre, descripcion: s.descripcion ?? "", ciius: s.ciius, procesos: s.procesos.map((p) => p.nombre), cargos: s.cargos.map((c) => ({ nombre: c.nombre, tareas: c.tareas.map((t) => t.tareaTipo.nombre) })) }))}
      />
    </Page>
  );
}
