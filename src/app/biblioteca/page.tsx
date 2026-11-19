import { db } from "@/lib/db";
import { iaDisponible } from "@/lib/ia";
import { Page, PageHeader, Stat } from "@/components/app/ui";
import { BibliotecaEditor } from "@/components/biblioteca/editor";
import { TareasTab } from "@/components/biblioteca/tareas-tab";
import { SectoresTab } from "@/components/biblioteca/sectores-tab";
import { CatalogosTab } from "@/components/biblioteca/catalogos-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function Biblioteca() {
  const [peligros, sectores, tareas, zonas, catalogo] = await Promise.all([
    db.peligroCatalogo.findMany({ where: { empresaId: null }, orderBy: [{ clasificacion: "asc" }, { descripcion: "asc" }], include: { _count: { select: { tareas: true, evaluados: true } } } }),
    db.sectorTipo.findMany({ orderBy: { nombre: "asc" }, include: { cargos: { where: { empresaId: null }, orderBy: { nombre: "asc" }, include: { tareas: { select: { tareaTipoId: true } }, _count: { select: { cargos: true } } } }, procesos: { orderBy: { nombre: "asc" } }, zonas: { select: { zonaTipoId: true } }, _count: { select: { empresas: true } } } }),
    db.tareaTipo.findMany({ where: { empresaId: null }, orderBy: { nombre: "asc" }, include: { peligros: { select: { peligroId: true } }, _count: { select: { tareas: true, cargos: true } } } }),
    db.zonaTipo.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    db.catalogoItem.findMany({ where: { empresaId: null }, orderBy: [{ tipo: "asc" }, { nombre: "asc" }] }),
  ]);
  const cuenta = (t: string) => catalogo.filter((c) => c.tipo === t).length;
  const peligrosLite = peligros.map((p) => ({ id: p.id, clasificacion: p.clasificacion, descripcion: p.descripcion }));
  const catalogoLite = catalogo.map((c) => ({ tipo: c.tipo, nombre: c.nombre }));
  return (
    <Page>
      <PageHeader title="Biblioteca general" description="Sirve para todas las empresas. Lo propio de un cliente se maneja en la pestaña “Biblioteca propia” de esa empresa y se puede publicar aquí. Todo lo que el sistema precarga en las empresas: sectores, cargos tipo, tareas tipo, peligros (GTC 45), exámenes médicos, EPP y capacitaciones. Puede crear, editar y validar cada elemento. Lo marcado “sin validar” viene de la semilla o de la IA y espera su revisión." />
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Stat label="Sectores" value={sectores.length} />
        <Stat label="Cargos tipo" value={sectores.reduce((s, x) => s + x.cargos.length, 0)} />
        <Stat label="Tareas tipo" value={tareas.length} hint={`${tareas.filter((t) => t.validado).length} validadas`} />
        <Stat label="Peligros" value={peligros.length} hint={`${peligros.filter((p) => p.validado).length} validados`} />
        <Stat label="Exámenes" value={cuenta("EXAMEN")} />
        <Stat label="EPP · Capacitaciones" value={`${cuenta("EPP")} · ${cuenta("CAPACITACION")}`} />
      </div>
      <Tabs defaultValue="sectores">
        <TabsList>
          <TabsTrigger value="sectores">Sectores y cargos</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="peligros">Peligros</TabsTrigger>
          <TabsTrigger value="catalogos">Exámenes, EPP y capacitaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="sectores" className="mt-4">
          <SectoresTab
            iaActiva={iaDisponible()}
            zonas={zonas}
            tareas={tareas.map((t) => ({ id: t.id, nombre: t.nombre }))}
            sectores={sectores.map((s) => ({ id: s.id, nombre: s.nombre, descripcion: s.descripcion ?? "", ciius: s.ciius, validado: s.validado, empresas: s._count.empresas, procesos: s.procesos.map((p) => p.nombre), zonaIds: s.zonas.map((z) => z.zonaTipoId), cargos: s.cargos.map((c) => ({ id: c.id, nombre: c.nombre, descripcion: c.descripcion ?? "", validado: c.validado, usos: c._count.cargos, tareaIds: c.tareas.map((t) => t.tareaTipoId) })) }))}
          />
        </TabsContent>
        <TabsContent value="tareas" className="mt-4">
          <TareasTab zonas={zonas} peligros={peligrosLite} tareas={tareas.map((t) => ({ id: t.id, nombre: t.nombre, actividad: t.actividad ?? "", rutinaria: t.rutinaria, altoRiesgo: t.altoRiesgo, zonasPreferidas: t.zonasPreferidas, validado: t.validado, peligroIds: t.peligros.map((p) => p.peligroId), usos: t._count.tareas, enCargos: t._count.cargos }))} />
        </TabsContent>
        <TabsContent value="peligros" className="mt-4">
          <BibliotecaEditor
            catalogo={catalogoLite}
            peligros={peligros.map((p) => ({ id: p.id, clasificacion: p.clasificacion, sub: p.subclasificacion ?? "", descripcion: p.descripcion, efectos: p.efectosPosibles, nd: p.ndDefault, ne: p.neDefault, nc: p.ncDefault, ingenieria: p.medidaIngenieria ?? "", administrativa: p.medidaAdministrativa ?? "", epp: p.eppSugerido, examenes: p.examenesSugeridos, capacitaciones: p.capacitacionesSugeridas, normas: p.normas, pve: p.pveAsociado ?? "", validado: p.validado, usos: p._count.evaluados, enTareas: p._count.tareas }))}
          />
        </TabsContent>
        <TabsContent value="catalogos" className="mt-4">
          <CatalogosTab items={catalogo.map((c) => ({ id: c.id, tipo: c.tipo, nombre: c.nombre, descripcion: c.descripcion ?? "", detalle: (c.detalle ?? {}) as Record<string, unknown>, normas: c.normas, validado: c.validado }))} />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
