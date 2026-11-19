import { usuarioActual } from "@/lib/auth/sesion";
import { Page, PageHeader } from "@/components/app/ui";
import { CambiarPassword } from "@/components/app/cambiar-password";
import { MiPerfil } from "@/components/app/mi-perfil";

export const dynamic = "force-dynamic";

export default async function Cuenta() {
  const u = await usuarioActual();
  return (
    <Page>
      <PageHeader title="Mi cuenta" description="Su usuario para entrar a PROCESST. Al cambiar la contraseña se cierran sus sesiones en otros equipos." />
      <div className="flex flex-wrap items-start gap-6">
        <MiPerfil inicial={{ nombre: u.nombre, email: u.email }} rol={u.rol} />
        <CambiarPassword />
      </div>
    </Page>
  );
}
