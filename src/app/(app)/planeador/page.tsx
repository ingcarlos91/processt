import { db } from "@/lib/db";
import { fechasPlaneador } from "@/lib/planeador";
import { Page, PageHeader } from "@/components/app/ui";
import { Planeador } from "@/components/planeador/planeador";

export const dynamic = "force-dynamic";

export default async function PlaneadorGeneral() {
  const hoy = new Date();
  const [fechas, empresas] = await Promise.all([
    fechasPlaneador({ desde: new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - 3, 1)), hasta: new Date(Date.UTC(hoy.getUTCFullYear() + 1, 11, 31)) }),
    db.empresa.findMany({ orderBy: { razonSocial: "asc" }, select: { id: true, razonSocial: true } }),
  ]);
  return (
    <Page>
      <PageHeader title="Planeador" description="Todas las fechas de todas sus empresas en un solo lugar: plan anual, comités, plazos de accidentes, acciones, actualización de la matriz, autoevaluación, curso del responsable y sus propios recordatorios. Cada fecha cita la norma que la origina." />
      <Planeador fechas={fechas} empresas={empresas.map((e) => ({ id: e.id, nombre: e.razonSocial }))} icsHref="/api/planeador.ics" />
    </Page>
  );
}
