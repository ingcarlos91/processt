"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  ["", "Resumen"], ["/datos", "Datos"], ["/matriz", "Cargos y matriz"], ["/trabajadores", "Trabajadores"], ["/biblioteca", "Biblioteca"], ["/evaluacion", "Evaluación"],
  ["/documentos", "Documentos"], ["/evidencias", "Evidencias"], ["/accidentes", "Accidentes"], ["/inspecciones", "Inspecciones"], ["/auditoria", "Auditoría"], ["/plan", "Plan anual"], ["/planeador", "Planeador"], ["/comites", "Comités"], ["/indicadores", "Indicadores"],
] as const;

export function EmpresaTabs({ id }: { id: string }) {
  const p = usePathname();
  const base = `/empresas/${id}`;
  const activo = [...TABS].reverse().find(([h]) => (h === "" ? p === base : p.startsWith(base + h)))?.[0] ?? "";
  return (
    <Tabs value={activo}>
      <TabsList variant="line" className="h-auto max-w-full flex-wrap !justify-start gap-x-0 gap-y-1 group-data-horizontal/tabs:h-auto">
        {TABS.map(([h, label]) => (
          <TabsTrigger key={h} value={h} className="flex-none" render={<Link href={base + h} />} nativeButton={false}>{label}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
