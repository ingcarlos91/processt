"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building2, BookOpen, FileText, Scale, Settings, Plus } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar";

const nav = [
  { href: "/", label: "Empresas", icon: Building2 },
  { href: "/biblioteca", label: "Biblioteca de peligros", icon: BookOpen },
  { href: "/plantillas", label: "Plantillas", icon: FileText },
  { href: "/normas", label: "Normas y estándares", icon: Scale },
];

export function AppSidebar({ empresas, consultora }: { empresas: { id: string; razonSocial: string }[]; consultora: { nombre: string; profesional: string | null } }) {
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
            <SidebarMenuButton size="lg" tooltip="Mi consultora" isActive={p.startsWith("/configuracion")} render={<Link href="/configuracion" />}>
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><Settings className="size-4" /></div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{consultora.profesional || "Mi consultora"}</span>
                <span className="truncate text-xs opacity-70">{consultora.nombre}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
