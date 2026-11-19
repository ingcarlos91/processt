import { db } from "@/lib/db";
import { usuarioActual } from "@/lib/auth/sesion";
import { Page, PageHeader } from "@/components/app/ui";
import { MiCuenta } from "@/components/app/mi-cuenta";

export const dynamic = "force-dynamic";

export default async function Cuenta() {
  const { id } = await usuarioActual();
  const u = await db.usuario.findUniqueOrThrow({ where: { id } });
  return (
    <Page>
      <PageHeader title="Mi cuenta" description="Su usuario para entrar a PROCESST." />
      <MiCuenta yo={{ nombre: u.nombre, email: u.email, rol: u.rol, ultimoAcceso: u.ultimoAcceso?.toISOString() ?? null, creadoEn: u.creadoEn.toISOString() }} />
    </Page>
  );
}
