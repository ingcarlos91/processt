import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EmpresaTabs } from "@/components/empresa/tabs";
import { Badge } from "@/components/ui/badge";

export default async function EmpresaLayout({ children, params }: LayoutProps<"/empresas/[id]">) {
  const { id } = await params;
  const e = await db.empresa.findUnique({ where: { id }, select: { razonSocial: true, nit: true, digitoVerificacion: true, nivelEstandares: true, claseRiesgo: true, ciudad: true, nTrabajadoresPlanta: true, nEnMision: true } });
  if (!e) notFound();
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-background px-4 md:px-6 pt-4 space-y-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight mr-2">{e.razonSocial}</h1>
          <Badge variant="outline">NIT {e.nit}{e.digitoVerificacion ? `-${e.digitoVerificacion}` : ""}</Badge>
          <Badge>{e.nivelEstandares} estándares</Badge>
          <Badge variant="outline">Riesgo {["", "I", "II", "III", "IV", "V"][e.claseRiesgo]}</Badge>
          <Badge variant="outline">{e.nTrabajadoresPlanta + e.nEnMision} trabajadores</Badge>
          {e.ciudad && <Badge variant="outline">{e.ciudad}</Badge>}
        </div>
        <EmpresaTabs id={id} />
      </div>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
    </div>
  );
}
