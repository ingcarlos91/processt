import { db } from "@/lib/db";
import { sesionActual } from "@/lib/auth/sesion";
import { PageHeader } from "@/components/app/ui";
import { MiCuenta } from "@/components/app/mi-cuenta";

export const dynamic = "force-dynamic";

export default async function CuentaAdmin() {
  const { id } = await sesionActual();
  const u = await db.usuario.findUniqueOrThrow({ where: { id } });
  return (
    <>
      <PageHeader title="Mi cuenta" description="Su usuario de super administrador." />
      <MiCuenta yo={{ nombre: u.nombre, email: u.email, rol: u.rol, ultimoAcceso: u.ultimoAcceso?.toISOString() ?? null, creadoEn: u.creadoEn.toISOString() }} />
    </>
  );
}
