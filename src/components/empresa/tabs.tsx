"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  ["", "Resumen"], ["/datos", "Datos"], ["/matriz", "Cargos y matriz"], ["/trabajadores", "Trabajadores"], ["/biblioteca", "Biblioteca"], ["/evaluacion", "Evaluación"],
  ["/documentos", "Documentos"], ["/evidencias", "Evidencias"], ["/accidentes", "Accidentes"], ["/inspecciones", "Inspecciones"], ["/auditoria", "Auditoría"], ["/plan", "Plan anual"], ["/planeador", "Planeador"], ["/comites", "Comités"], ["/indicadores", "Indicadores"],
] as const;

export function EmpresaTabs({ id, conDiagnostico }: { id: string; conDiagnostico?: boolean }) {
  const p = usePathname();
  const base = `/empresas/${id}`;
  const todas = conDiagnostico ? [...TABS, ["/diagnostico", "Diagnóstico"] as const] : [...TABS];
  const activo = [...todas].reverse().find(([h]) => (h === "" ? p === base : p.startsWith(base + h)))?.[0] ?? "";
  return (
    <Tabs value={activo} className="relative -mx-4 md:mx-0">
      {/* Móvil: una sola fila con desplazamiento horizontal y degradado en el borde; escritorio: varias filas con espaciado uniforme */}
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent md:hidden" />
      <TabsList variant="line" className="h-auto w-full max-w-full !justify-start gap-x-1 gap-y-1 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-1.5 md:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] group-data-horizontal/tabs:h-auto md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {(conDiagnostico ? [TABS[0], ["/diagnostico", "Diagnóstico"] as const, ...TABS.slice(1)] : TABS).map(([h, label]) => (
          <TabsTrigger key={h} value={h} className="flex-none scroll-mx-4 px-2.5" render={<Link href={base + h} />} nativeButton={false}>{label}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
