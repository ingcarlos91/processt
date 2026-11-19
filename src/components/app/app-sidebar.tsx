"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building2, BookOpen, FileText, Scale, Settings, Plus, LogOut, Users, ChevronsUpDown, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { salir } from "@/app/actions/auth";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const nav = [
  { href: "/", label: "Empresas", icon: Building2 },
  { href: "/biblioteca", label: "Biblioteca de peligros", icon: BookOpen },
  { href: "/plantillas", label: "Plantillas", icon: FileText },
  { href: "/normas", label: "Normas y estándares", icon: Scale },
  { href: "/configuracion", label: "Mi consultora", icon: Settings },
];

export function AppSidebar({ empresas, consultora, usuario }: { empresas: { id: string; razonSocial: string }[]; consultora: { nombre: string; profesional: string | null }; usuario: { nombre: string; email: string; rol: string } }) {
  const iniciales = usuario.nombre.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const p = usePathname();
  const activo = (href: string) => (href === "/" ? p === "/" : p.startsWith(href));
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />} className="data-[slot=sidebar-menu-button]:p-1.5">
              <Image src="/brand/icono.png" alt="" width={28} height={26} className="shrink-0" />
              <Image src="/brand/logo-sm-blanco.png" alt="PROCESST" width={120} height={18} className="group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>SG-SST</SidebarGroupLabel>
          <SidebarMenu>
            {nav.map((n) => (
              <SidebarMenuItem key={n.href}>
                <SidebarMenuButton tooltip={n.label} isActive={activo(n.href) && !(n.href === "/" && p.startsWith("/empresas"))} render={<Link href={n.href} />}>
                  <n.icon /> <span>{n.label}</span>
                </SidebarMenuButton>
                {n.href === "/" && empresas.length > 0 && (
                  <SidebarMenuSub>
                    {empresas.map((e) => (
                      <SidebarMenuSubItem key={e.id}>
                        <SidebarMenuSubButton isActive={p.startsWith(`/empresas/${e.id}`)} render={<Link href={`/empresas/${e.id}`} />}><span className="truncate">{e.razonSocial}</span></SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive={p === "/empresas/nueva"} render={<Link href="/empresas/nueva" />}><Plus /> <span>Nueva empresa</span></SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" tooltip={usuario.nombre} className="data-popup-open:bg-sidebar-accent" />}>
                <Avatar className="size-8 rounded-lg"><AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">{iniciales}</AvatarFallback></Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{usuario.nombre}</span>
                  <span className="truncate text-xs opacity-70">{consultora.nombre}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-60">
                <DropdownMenuGroup>
                  <DropdownMenuLabel><div className="font-medium text-foreground">{usuario.nombre}</div><div className="text-xs font-normal text-muted-foreground">{usuario.email}</div></DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/cuenta" />}><KeyRound /> Mi cuenta y contraseña</DropdownMenuItem>
                  {usuario.rol === "admin" && <DropdownMenuItem render={<Link href="/usuarios" />}><Users /> Usuarios</DropdownMenuItem>}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => salir()}><LogOut /> Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
