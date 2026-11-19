"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
  ["", "Resumen"], ["/datos", "Datos"], ["/matriz", "Cargos y matriz"], ["/biblioteca", "Biblioteca propia"], ["/evaluacion", "Evaluación"],
  ["/documentos", "Documentos"], ["/evidencias", "Evidencias"], ["/accidentes", "Accidentes"], ["/plan", "Plan anual"], ["/comites", "Comités"], ["/indicadores", "Indicadores"],
] as const;

export function EmpresaTabs({ id }: { id: string }) {
  const p = usePathname();
  const base = `/empresas/${id}`;
  const activo = [...TABS].reverse().find(([h]) => (h === "" ? p === base : p.startsWith(base + h)))?.[0] ?? "";
  return (
    <Tabs value={activo}>
      <TabsList variant="line" className="overflow-x-auto max-w-full">
        {TABS.map(([h, label]) => (
          <TabsTrigger key={h} value={h} render={<Link href={base + h} />} nativeButton={false}>{label}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
