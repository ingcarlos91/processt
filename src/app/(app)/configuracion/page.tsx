import { consultoraActual } from "@/lib/db";
import { iaDisponible, MODELO } from "@/lib/ia";
import { Page, PageHeader } from "@/components/app/ui";
import { ConsultoraForm } from "@/components/biblioteca/consultora-form";

export const dynamic = "force-dynamic";

export default async function Configuracion() {
  const c = await consultoraActual();
  return (
    <Page>
      <PageHeader title="Mi consultora" description="Sus datos como consultora y profesional que firma. Se usan como responsable del SG-SST al crear cada empresa y en los documentos que genera." />
      <ConsultoraForm
        inicial={{ nombre: c.nombre, nit: c.nit ?? "", profesional: c.profesional ?? "", tipoDoc: c.tipoDoc, cedula: c.cedula ?? "", cargo: c.cargo ?? "", perfil: c.perfil ?? "", licenciaSst: c.licenciaSst ?? "", licenciaFecha: c.licenciaFecha?.toISOString().slice(0, 10) ?? "", curso50h: c.curso50h, curso50hFecha: c.curso50hFecha ?? "", curso20hFecha: c.curso20hFecha ?? "", telefono: c.telefono ?? "", correo: c.correo ?? "" }}
        ia={{ activa: iaDisponible(), modelo: MODELO }}
      />
    </Page>
  );
}
