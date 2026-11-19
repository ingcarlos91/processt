import { db } from "@/lib/db";
import { fechasPlaneador } from "@/lib/planeador";
import { Planeador } from "@/components/planeador/planeador";
import { Bitacora } from "@/components/planeador/bitacora";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function PlaneadorEmpresa({ params }: PageProps<"/empresas/[id]/planeador">) {
  const { id } = await params;
  const hoy = new Date();
  const [fechas, e] = await Promise.all([
    fechasPlaneador({ empresaId: id, desde: new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - 3, 1)), hasta: new Date(Date.UTC(hoy.getUTCFullYear() + 1, 11, 31)) }),
    db.empresa.findUniqueOrThrow({ where: { id }, select: { contratoHorasMes: true, contratoValorMes: true, representanteLegal: true, responsableSst: true, visitas: { orderBy: { fecha: "desc" } }, comites: { select: { miembros: { select: { nombre: true } } } }, trabajadores: { where: { activo: true }, select: { nombres: true } } } }),
  ]);
  const personas = [...new Set([e.representanteLegal, (e.responsableSst as { nombre?: string } | null)?.nombre, ...e.comites.flatMap((c) => c.miembros.map((m) => m.nombre)), ...e.trabajadores.map((t) => t.nombres)].filter(Boolean) as string[])];
  return (
    <Tabs defaultValue="fechas">
      <TabsList><TabsTrigger value="fechas">Fechas y vencimientos</TabsTrigger><TabsTrigger value="visitas">Bitácora de visitas ({e.visitas.length})</TabsTrigger></TabsList>
      <TabsContent value="fechas" className="mt-4"><Planeador fechas={fechas} empresas={[]} empresaId={id} icsHref={`/api/planeador.ics?empresa=${id}`} /></TabsContent>
      <TabsContent value="visitas" className="mt-4">
        <Bitacora empresaId={id} horasMes={e.contratoHorasMes} valorMes={e.contratoValorMes} personas={personas}
          visitas={e.visitas.map((v) => ({ id: v.id, fecha: v.fecha.toISOString().slice(0, 10), horas: v.horas, modalidad: v.modalidad, atendio: v.atendio ?? "", actividades: v.actividades, compromisos: v.compromisos ?? "" }))} />
      </TabsContent>
    </Tabs>
  );
}
