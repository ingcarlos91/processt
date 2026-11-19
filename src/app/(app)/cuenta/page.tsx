import { usuarioActual } from "@/lib/auth/sesion";
import { Page, PageHeader } from "@/components/app/ui";
import { CambiarPassword } from "@/components/app/cambiar-password";

export const dynamic = "force-dynamic";

export default async function Cuenta() {
  const u = await usuarioActual();
  return (
    <Page>
      <PageHeader title="Mi cuenta" description={`Usuario con el que inicia sesión en PROCESST: ${u.nombre} (${u.email}).`} />
      <CambiarPassword />
    </Page>
  );
}
