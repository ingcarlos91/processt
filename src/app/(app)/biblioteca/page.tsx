import { usuarioActual } from "@/lib/auth/sesion";
import { alcanceBiblioteca } from "@/lib/auth/acceso";
import { db } from "@/lib/db";
import { iaDisponible } from "@/lib/ia";
import { Page, PageHeader, Stat } from "@/components/app/ui";
import { BibliotecaEditor } from "@/components/biblioteca/editor";
import { TareasTab } from "@/components/biblioteca/tareas-tab";
import { SectoresTab } from "@/components/biblioteca/sectores-tab";
import { CatalogosTab } from "@/components/biblioteca/catalogos-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccidentesTab } from "@/components/biblioteca/accidentes-tab";
import { EntidadesTab } from "@/components/biblioteca/entidades-tab";
import { InspeccionesTab } from "@/components/biblioteca/inspecciones-tab";
import { db as dbEnt } from "@/lib/db";
import { cargarCatalogoAccidentes } from "@/lib/catalogo-accidentes";

export const dynamic = "force-dynamic";

export default async function Biblioteca() {
  const co = (await usuarioActual()).consultoraId;
  const vis = alcanceBiblioteca(co);
  const [peligros, sectores, tareas, zonas, catalogo] = await Promise.all([
    db.peligroCatalogo.findMany({ where: alcanceBiblioteca((await usuarioActual()).consultoraId), orderBy: [{ clasificacion: "asc" }, { descripcion: "asc" }], include: { _count: { select: { tareas: { where: { tareaTipo: vis } }, evaluados: { where: { empresa: { consultoraId: co } } } } } } }),
    db.sectorTipo.findMany({ orderBy: { nombre: "asc" }, include: { cargos: { where: alcanceBiblioteca((await usuarioActual()).consultoraId), orderBy: { nombre: "asc" }, include: { tareas: { select: { tareaTipoId: true } }, _count: { select: { cargos: true } } } }, procesos: { orderBy: { nombre: "asc" } }, zonas: { select: { zonaTipoId: true } }, _count: { select: { empresas: { where: { consultoraId: (await usuarioActual()).consultoraId } } } } } }),
    db.tareaTipo.findMany({ where: alcanceBiblioteca((await usuarioActual()).consultoraId), orderBy: { nombre: "asc" }, include: { peligros: { where: { peligro: vis }, select: { peligroId: true } }, _count: { select: { tareas: { where: { empresa: { consultoraId: co } } }, cargos: { where: { cargoTipo: vis } } } } } }),
    db.zonaTipo.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    db.catalogoItem.findMany({ where: alcanceBiblioteca((await usuarioActual()).consultoraId), orderBy: [{ tipo: "asc" }, { nombre: "asc" }] }),
  ]);
  const cuenta = (t: string) => catalogo.filter((c) => c.tipo === t).length;
  const peligrosLite = peligros.map((p) => ({ id: p.id, clasificacion: p.clasificacion, descripcion: p.descripcion }));
  const catalogoLite = catalogo.map((c) => ({ tipo: c.tipo, nombre: c.nombre }));
  return (
    <Page>
      <PageHeader title="Biblioteca general" description="Sectores, cargos, tareas, peligros, exámenes, EPP, capacitaciones y entidades para todas sus empresas. Incluye la base común de PROCESST (se actualiza con las normas y no se edita aquí) y lo propio de su consultora, que solo ven sus usuarios. Para ajustar algo de la base, cree uno propio." />
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Stat label="Sectores" value={sectores.length} />
        <Stat label="Cargos tipo" value={sectores.reduce((s, x) => s + x.cargos.length, 0)} />
        <Stat label="Tareas tipo" value={tareas.length} hint={`${tareas.filter((t) => t.validado).length} validadas`} porque="Validada quiere decir que usted revisó la tarea y la aprueba para usarla en cualquier empresa. Las que aún no revisa aparecen como “sin validar”." />
        <Stat label="Peligros" value={peligros.length} hint={`${peligros.filter((p) => p.validado).length} validados`} porque="Validado quiere decir que usted revisó el peligro y sus valores y los aprueba para usarlos en cualquier empresa." />
        <Stat label="Exámenes" value={cuenta("EXAMEN")} />
        <Stat label="EPP · Capacitaciones" value={`${cuenta("EPP")} · ${cuenta("CAPACITACION")}`} />
      </div>
      <Tabs defaultValue="sectores">
        <TabsList>
          <TabsTrigger value="sectores">Sectores y cargos</TabsTrigger>
          <TabsTrigger value="tareas">Tareas</TabsTrigger>
          <TabsTrigger value="peligros">Peligros</TabsTrigger>
          <TabsTrigger value="catalogos">Exámenes, EPP y capacitaciones</TabsTrigger>
          <TabsTrigger value="accidentes">Accidentes</TabsTrigger>
          <TabsTrigger value="inspecciones">Inspecciones</TabsTrigger>
          <TabsTrigger value="entidades">Entidades</TabsTrigger>
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
        <TabsContent value="inspecciones" className="mt-4">
          <InspeccionesTab listas={(await dbEnt.catalogoItem.findMany({ where: { tipo: "LISTA_INSPECCION", ...alcanceBiblioteca((await usuarioActual()).consultoraId) } })).map((l) => { const d = (l.detalle ?? {}) as { items?: string[]; frecuenciaDias?: number; orden?: number }; return { id: l.id, nombre: l.nombre, descripcion: l.descripcion ?? "", frecuenciaDias: d.frecuenciaDias ?? 0, items: d.items ?? [], orden: d.orden ?? 99 }; }).sort((a, b) => a.orden - b.orden)} />
        </TabsContent>
        <TabsContent value="entidades" className="mt-4">
          <EntidadesTab items={await (async () => {
            const xs = await dbEnt.catalogoItem.findMany({ where: { ...alcanceBiblioteca((await usuarioActual()).consultoraId), tipo: { in: ["ARL", "EPS", "AFP", "ESCOLARIDAD"] } } });
            const orden = (d: unknown) => Number((d as { orden?: number })?.orden ?? 999);
            const de = (t: string) => xs.filter((x) => x.tipo === t).sort((a, b) => orden(a.detalle) - orden(b.detalle) || a.nombre.localeCompare(b.nombre)).map((x) => ({ id: x.id, nombre: x.nombre, descripcion: x.descripcion ?? "" }));
            return { ARL: de("ARL"), EPS: de("EPS"), AFP: de("AFP"), ESCOLARIDAD: de("ESCOLARIDAD") };
          })()} />
        </TabsContent>
        <TabsContent value="accidentes" className="mt-4">
          <AccidentesTab cat={await cargarCatalogoAccidentes((await usuarioActual()).consultoraId)} />
        </TabsContent>
        <TabsContent value="catalogos" className="mt-4">
          <CatalogosTab items={catalogo.map((c) => ({ id: c.id, tipo: c.tipo, nombre: c.nombre, descripcion: c.descripcion ?? "", detalle: (c.detalle ?? {}) as Record<string, unknown>, normas: c.normas, validado: c.validado }))} />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
