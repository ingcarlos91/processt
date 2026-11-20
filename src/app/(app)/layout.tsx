import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { SiteHeader } from "@/components/app/site-header";
import { db } from "@/lib/db";
import { usuarioActual } from "@/lib/auth/sesion";

/** Zona protegida: exige una sesión válida y verificada contra la base de datos. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await usuarioActual();
  const [empresas, consultora] = await Promise.all([
    db.empresa.findMany({ where: { consultoraId: usuario.consultoraId }, orderBy: { razonSocial: "asc" }, select: { id: true, razonSocial: true } }),
    db.consultora.findUniqueOrThrow({ where: { id: usuario.consultoraId } }),
  ]);
  return (
    <SidebarProvider>
      <AppSidebar empresas={empresas} consultora={{ nombre: consultora.nombre, profesional: consultora.profesional }} usuario={{ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }} />
      <SidebarInset className="bg-muted/30 min-w-0">
        <SiteHeader empresas={empresas} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
