import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { usuarioActual } from "@/lib/auth/sesion";
import { Page, PageHeader } from "@/components/app/ui";
import { UsuariosEditor } from "@/components/app/usuarios-editor";

export const dynamic = "force-dynamic";

export default async function Usuarios() {
  const yo = await usuarioActual();
  if (yo.rol !== "admin") redirect("/");
  const usuarios = await db.usuario.findMany({ where: { consultoraId: yo.consultoraId }, orderBy: { nombre: "asc" } });
  return (
    <Page>
      <PageHeader title="Usuarios" description="Personas que pueden entrar a PROCESST. El administrador gestiona usuarios; el consultor trabaja empresas y documentos." />
      <UsuariosEditor yoId={yo.id} usuarios={usuarios.map((u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol, activo: u.activo, ultimoAcceso: u.ultimoAcceso?.toISOString() ?? null }))} />
    </Page>
  );
}
