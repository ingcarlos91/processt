import { usuarioActual } from "@/lib/auth/sesion";
import { db } from "@/lib/db";
import { fechasPlaneador } from "@/lib/planeador";
import { Page, PageHeader } from "@/components/app/ui";
import { Planeador } from "@/components/planeador/planeador";

export const dynamic = "force-dynamic";

export default async function PlaneadorGeneral() {
  const hoy = new Date();
  const [fechas, empresas] = await Promise.all([
    fechasPlaneador({ consultoraId: (await usuarioActual()).consultoraId, desde: new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth() - 3, 1)), hasta: new Date(Date.UTC(hoy.getUTCFullYear() + 1, 11, 31)) }),
    db.empresa.findMany({ where: { consultoraId: (await usuarioActual()).consultoraId }, orderBy: { razonSocial: "asc" }, select: { id: true, razonSocial: true } }),
  ]);
  return (
    <Page>
      <PageHeader title="Planeador" description="Todas las fechas de sus empresas en un solo lugar: plan anual, comités, plazos legales, acciones y recordatorios. Cada fecha cita la norma que la origina." />
      <Planeador fechas={fechas} empresas={empresas.map((e) => ({ id: e.id, nombre: e.razonSocial }))} icsHref="/api/planeador.ics" />
    </Page>
  );
}
