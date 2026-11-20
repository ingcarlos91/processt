import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { sesionActual } from "@/lib/auth/sesion";
import { salir } from "@/app/actions/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/** Área del super administrador: solo consultoras y sus usuarios (sin acceso a las empresas cliente). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await sesionActual();
  if (u.rol !== "superadmin") redirect("/");
  return (
    <div className="flex min-h-svh flex-col bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Image src="/brand/logo-sm.png" alt="PROCESST" width={120} height={18} className="h-auto" priority />
          </Link>
          <Badge variant="secondary">Super administrador</Badge>
          <div className="flex-1" />
          <Link href="/admin/cuenta" className={buttonVariants({ variant: "ghost", size: "sm" })}><UserRound /> {u.nombre}</Link>
          <form action={salir}><Button variant="ghost" size="sm" type="submit"><LogOut /> Salir</Button></form>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:px-6">{children}</main>
    </div>
  );
}
