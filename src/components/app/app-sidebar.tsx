"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building2, CalendarDays, BookOpen, FileText, Scale, Settings, Plus, LogOut, Users, ChevronsUpDown, KeyRound } from "lucide-react";
import { Isotipo } from "@/components/app/isotipo";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { salir } from "@/app/actions/auth";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarSeparator, useSidebar,
} from "@/components/ui/sidebar";

const nav = [
  { href: "/", label: "Empresas", icon: Building2 },
  { href: "/planeador", label: "Planeador", icon: CalendarDays },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { href: "/plantillas", label: "Plantillas", icon: FileText },
  { href: "/normas", label: "Normas y estándares", icon: Scale },
];

const admin = [
  { href: "/configuracion", label: "Mi consultora", icon: Settings, soloAdmin: false },
  { href: "/usuarios", label: "Usuarios", icon: Users, soloAdmin: true },
  { href: "/cuenta", label: "Mi cuenta", icon: KeyRound, soloAdmin: false },
];

/** Texto truncado con tooltip solo cuando es largo (nombres de empresa, usuario). */
function Truncado({ texto, className, umbral = 22 }: { texto: string; className?: string; umbral?: number }) {
  const span = <span className={className ?? "truncate"}>{texto}</span>;
  if (texto.length <= umbral) return span;
  return (
    <Tooltip>
      <TooltipTrigger render={span} />
      <TooltipContent side="right" collisionPadding={8}>{texto}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar({ empresas, consultora, usuario }: { empresas: { id: string; razonSocial: string }[]; consultora: { nombre: string; profesional: string | null }; usuario: { nombre: string; email: string; rol: string } }) {
  const p = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const activo = (href: string) => (href === "/" ? p === "/" : p.startsWith(href));
  const cerrar = () => { if (isMobile) setOpenMobile(false); };
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-3 py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" onClick={cerrar} aria-label="Ir al tablero" />} tooltip="PROCESST — tablero" className="gap-2.5 px-1.5 data-[slot=sidebar-menu-button]:p-1.5 hover:bg-transparent">
              <Image src="/brand/icono.png" alt="" width={28} height={26} className="h-auto shrink-0" />
              <Image src="/brand/logo-sm-blanco.png" alt="PROCESST" width={120} height={18} className="h-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-1">
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wider text-[11px]">SG-SST</SidebarGroupLabel>
          <SidebarMenu>
            {nav.map((n) => (
              <SidebarMenuItem key={n.href}>
                <SidebarMenuButton tooltip={n.label} isActive={activo(n.href) && !(n.href === "/" && p.startsWith("/empresas"))} render={<Link href={n.href} onClick={cerrar} />}>
                  <n.icon /> <span className="truncate">{n.label}</span>
                </SidebarMenuButton>
                {n.href === "/" && (
                  <SidebarMenuSub className="mr-0 gap-0.5">
                    {empresas.map((e) => (
                      <SidebarMenuSubItem key={e.id}>
                        <SidebarMenuSubButton isActive={p.startsWith(`/empresas/${e.id}`)} render={<Link href={`/empresas/${e.id}`} onClick={cerrar} />} className="text-sidebar-foreground/85 data-active:font-medium">
                          <Truncado texto={e.razonSocial} />
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                    <SidebarMenuSubItem className="mt-1">
                      <SidebarMenuSubButton isActive={p === "/empresas/nueva"} render={<Link href="/empresas/nueva" onClick={cerrar} />} className="border border-dashed border-sidebar-border text-sidebar-foreground/80 hover:border-sidebar-ring/60 hover:text-sidebar-accent-foreground data-active:border-solid">
                        <Plus /> <span className="truncate">Nueva empresa</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="mx-3 group-data-[collapsible=icon]:mx-2" />
        <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wider text-[11px]">Administración</SidebarGroupLabel>
          <SidebarMenu>
            {admin.filter((n) => !n.soloAdmin || usuario.rol === "admin").map((n) => (
              <SidebarMenuItem key={n.href}>
                <SidebarMenuButton tooltip={n.label} isActive={activo(n.href)} render={<Link href={n.href} onClick={cerrar} />}><n.icon /> <span className="truncate">{n.label}</span></SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger render={<SidebarMenuButton size="lg" tooltip={`${usuario.nombre} · ${consultora.nombre}`} className="data-popup-open:bg-sidebar-accent" />}>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white p-1"><Isotipo className="size-full" /></span>
                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{usuario.nombre}</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{consultora.nombre}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" sideOffset={6} collisionPadding={12} className="w-(--anchor-width) min-w-60">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="py-2"><div className="truncate font-medium text-foreground">{usuario.nombre}</div><div className="truncate text-xs font-normal text-muted-foreground">{usuario.email}</div></DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/cuenta" onClick={cerrar} />}><KeyRound /> Mi cuenta y contraseña</DropdownMenuItem>
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
