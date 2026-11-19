import { fechasPlaneador } from "@/lib/planeador";
import { Planeador } from "@/components/planeador/planeador";

export const dynamic = "force-dynamic";

export default async function PlaneadorEmpresa({ params }: PageProps<"/empresas/[id]/planeador">) {
  const { id } = await params;
  const hoy = new Date();
  const fechas = await fechasPlaneador({ empresaId: id, desde: new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - 3, 1)), hasta: new Date(Date.UTC(hoy.getUTCFullYear() + 1, 11, 31)) });
  return <Planeador fechas={fechas} empresas={[]} empresaId={id} icsHref={`/api/planeador.ics?empresa=${id}`} />;
}
