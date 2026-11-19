"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ManualAyuda } from "@/components/app/manual-ayuda";

const ETIQUETAS: Record<string, string> = {
  empresas: "Empresas", nueva: "Nueva empresa", datos: "Datos", matriz: "Cargos y matriz", evaluacion: "Evaluación", documentos: "Documentos",
  plan: "Plan anual", comites: "Comités", indicadores: "Indicadores", biblioteca: "Biblioteca", plantillas: "Plantillas", normas: "Normas", configuracion: "Mi consultora", cuenta: "Mi cuenta", usuarios: "Usuarios", evidencias: "Evidencias", accidentes: "Accidentes e incidentes", planeador: "Planeador", trabajadores: "Trabajadores", inspecciones: "Inspecciones", auditoria: "Auditoría interna", diagnostico: "Diagnóstico", versiones: "Versiones",
};

export function SiteHeader({ empresas }: { empresas: { id: string; razonSocial: string }[] }) {
  const segs = usePathname().split("/").filter(Boolean);
  const migas: { href: string; label: string }[] = [{ href: "/", label: "Inicio" }];
  segs.forEach((s, i) => {
    const href = "/" + segs.slice(0, i + 1).join("/");
    const emp = empresas.find((e) => e.id === s);
    if (s === "empresas") return;
    migas.push({ href, label: emp?.razonSocial ?? ETIQUETAS[s] ?? (s.length > 20 ? "Detalle" : s) });
  });
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur print:hidden">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
        <Breadcrumb>
          <BreadcrumbList>
            {migas.map((m, i) => (
              <Fragment key={m.href}>
                {i > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                <BreadcrumbItem className={i < migas.length - 1 ? "hidden md:block" : ""}>
                  {i === migas.length - 1 ? <BreadcrumbPage>{m.label}</BreadcrumbPage> : <BreadcrumbLink render={<Link href={m.href} />}>{m.label}</BreadcrumbLink>}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto px-4"><ManualAyuda /></div>
    </header>
  );
}
