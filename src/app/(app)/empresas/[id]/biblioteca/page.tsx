import { usuarioActual } from "@/lib/auth/sesion";
import { alcanceBiblioteca } from "@/lib/auth/acceso";
import { db } from "@/lib/db";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Library } from "lucide-react";
import { TareasTab } from "@/components/biblioteca/tareas-tab";
import { BibliotecaEditor } from "@/components/biblioteca/editor";
import { CatalogosTab } from "@/components/biblioteca/catalogos-tab";
import { CargosPropios } from "@/components/biblioteca/cargos-propios";

export const dynamic = "force-dynamic";

export default async function BibliotecaPropia({ params }: PageProps<"/empresas/[id]/biblioteca">) {
  const { id } = await params;
  const alcance = alcanceBiblioteca((await usuarioActual()).consultoraId, id);
  const [e, peligros, tareas, cargos, zonas, catalogo] = await Promise.all([
    db.empresa.findUniqueOrThrow({ where: { id }, select: { razonSocial: true, sectorTipoId: true } }),
    db.peligroCatalogo.findMany({ where: alcance, orderBy: [{ clasificacion: "asc" }, { descripcion: "asc" }], include: { _count: { select: { tareas: true, evaluados: true } } } }),
    db.tareaTipo.findMany({ where: alcance, orderBy: { nombre: "asc" }, include: { peligros: { select: { peligroId: true } }, _count: { select: { tareas: true, cargos: true } } } }),
    db.cargoTipo.findMany({ where: { empresaId: id }, orderBy: { nombre: "asc" }, include: { tareas: { select: { tareaTipoId: true } } } }),
    db.zonaTipo.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
    db.catalogoItem.findMany({ where: alcance, orderBy: [{ tipo: "asc" }, { nombre: "asc" }] }),
  ]);
  const propios = { peligros: peligros.filter((p) => p.empresaId === id), tareas: tareas.filter((t) => t.empresaId === id), catalogo: catalogo.filter((c) => c.empresaId === id) };
  return (
    <>
      <Alert>
        <Library />
        <AlertTitle>Biblioteca propia de {e.razonSocial}</AlertTitle>
        <AlertDescription>Lo que cree aquí solo aparece en esta empresa: en sus selectores de cargos, tareas y peligros, y en sus documentos. No cambia la biblioteca general ni las demás empresas. Si algo sirve para todos, use “Publicar en general”.</AlertDescription>
      </Alert>
      <Tabs defaultValue="cargos">
        <TabsList>
          <TabsTrigger value="cargos">Cargos tipo ({cargos.length})</TabsTrigger>
          <TabsTrigger value="tareas">Tareas ({propios.tareas.length})</TabsTrigger>
          <TabsTrigger value="peligros">Peligros ({propios.peligros.length})</TabsTrigger>
          <TabsTrigger value="catalogos">Exámenes, EPP y capacitaciones ({propios.catalogo.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="cargos" className="mt-4">
          <CargosPropios empresaId={id} sectorTipoId={e.sectorTipoId} cargos={cargos.map((c) => ({ id: c.id, nombre: c.nombre, descripcion: c.descripcion ?? "", tareaIds: c.tareas.map((t) => t.tareaTipoId) }))} tareas={tareas.map((t) => ({ id: t.id, nombre: t.nombre, propia: t.empresaId === id }))} />
        </TabsContent>
        <TabsContent value="tareas" className="mt-4">
          <TareasTab empresaId={id} zonas={zonas}
            peligros={peligros.map((p) => ({ id: p.id, clasificacion: p.clasificacion, descripcion: p.descripcion, propio: p.empresaId === id }))}
            tareas={propios.tareas.map((t) => ({ id: t.id, nombre: t.nombre, actividad: t.actividad ?? "", rutinaria: t.rutinaria, altoRiesgo: t.altoRiesgo, zonasPreferidas: t.zonasPreferidas, validado: t.validado, peligroIds: t.peligros.map((p) => p.peligroId), usos: t._count.tareas, enCargos: t._count.cargos }))} />
        </TabsContent>
        <TabsContent value="peligros" className="mt-4">
          <BibliotecaEditor empresaId={id} catalogo={catalogo.map((c) => ({ tipo: c.tipo, nombre: c.nombre }))}
            peligros={propios.peligros.map((p) => ({ id: p.id, clasificacion: p.clasificacion, sub: p.subclasificacion ?? "", descripcion: p.descripcion, efectos: p.efectosPosibles, nd: p.ndDefault, ne: p.neDefault, nc: p.ncDefault, ingenieria: p.medidaIngenieria ?? "", administrativa: p.medidaAdministrativa ?? "", epp: p.eppSugerido, examenes: p.examenesSugeridos, capacitaciones: p.capacitacionesSugeridas, normas: p.normas, pve: p.pveAsociado ?? "", validado: p.validado, usos: p._count.evaluados, enTareas: p._count.tareas }))} />
        </TabsContent>
        <TabsContent value="catalogos" className="mt-4">
          <CatalogosTab empresaId={id} items={propios.catalogo.map((c) => ({ id: c.id, tipo: c.tipo, nombre: c.nombre, descripcion: c.descripcion ?? "", detalle: (c.detalle ?? {}) as Record<string, unknown>, normas: c.normas, validado: c.validado }))} />
        </TabsContent>
      </Tabs>
    </>
  );
}
