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
      <div className="flex min-w-0 flex-1 items-center gap-2 px-3 md:px-4">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator orientation="vertical" className="mr-1 shrink-0 data-vertical:h-4 data-vertical:self-auto md:mr-2" />
        <Breadcrumb className="min-w-0 flex-1">
          <BreadcrumbList className="flex-nowrap">
            {migas.map((m, i) => {
              const ultima = i === migas.length - 1;
              return (
                <Fragment key={m.href}>
                  {i > 0 && <BreadcrumbSeparator className="hidden shrink-0 md:block" />}
                  <BreadcrumbItem className={ultima ? "min-w-0" : "hidden min-w-0 shrink md:inline-flex"}>
                    {ultima
                      ? <BreadcrumbPage className="truncate font-medium" title={m.label}>{m.label}</BreadcrumbPage>
                      : <BreadcrumbLink className="max-w-48 truncate lg:max-w-72" title={m.label} render={<Link href={m.href} />}>{m.label}</BreadcrumbLink>}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="shrink-0 px-3 md:px-4"><ManualAyuda /></div>
    </header>
  );
}
