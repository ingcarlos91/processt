import { consultoraActual } from "@/lib/db";
import { iaDisponible, MODELO } from "@/lib/ia";
import { Page, PageHeader } from "@/components/app/ui";
import { ConsultoraForm } from "@/components/biblioteca/consultora-form";

export const dynamic = "force-dynamic";

export default async function Configuracion() {
  const c = await consultoraActual();
  return (
    <Page>
      <PageHeader title="Mi consultora" description="Estos datos firman los documentos como “Elaboró” y aparecen en la evaluación inicial y la matriz de peligros." />
      <ConsultoraForm inicial={{ nombre: c.nombre, nit: c.nit ?? "", profesional: c.profesional ?? "", cedula: c.cedula ?? "", licenciaSst: c.licenciaSst ?? "", telefono: c.telefono ?? "", correo: c.correo ?? "" }} ia={{ activa: iaDisponible(), modelo: MODELO }} />
    </Page>
  );
}
