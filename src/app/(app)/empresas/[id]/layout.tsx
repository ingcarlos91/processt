import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EmpresaTabs } from "@/components/empresa/tabs";
import { Badge } from "@/components/ui/badge";
import { PanelDecisiones } from "@/components/empresa/panel-decisiones";
import { construirDecisiones } from "@/lib/reglas/decisiones";
import { Porque } from "@/components/app/porque";

export default async function EmpresaLayout({ children, params }: LayoutProps<"/empresas/[id]">) {
  const { id } = await params;
  const e = await db.empresa.findUnique({ where: { id }, select: { logoUrl: true, razonSocial: true, nit: true, digitoVerificacion: true, nivelEstandares: true, claseRiesgo: true, ciudad: true, nTrabajadoresPlanta: true, nEnMision: true } });
  if (!e) notFound();
  const decisiones = await construirDecisiones(id);
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-background px-4 md:px-6 pt-4 space-y-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo servido por la API local */}
          {e.logoUrl && <img src={`/api/empresas/${id}/logo`} alt="" className="h-9 max-w-32 object-contain mr-1" />}
          <h1 className="text-xl font-semibold tracking-tight mr-2">{e.razonSocial}</h1>
          <Badge variant="outline">NIT {e.nit}{e.digitoVerificacion ? `-${e.digitoVerificacion}` : ""}</Badge>
          <Badge>{e.nivelEstandares} estándares</Badge><Porque titulo="Estándares mínimos" normas={decisiones[0].items[2].normas}>{decisiones[0].items[2].porque}</Porque>
          <Badge variant="outline">Riesgo {["", "I", "II", "III", "IV", "V"][e.claseRiesgo]}</Badge><Porque titulo="Clase de riesgo" normas={decisiones[0].items[1].normas}>{decisiones[0].items[1].porque}</Porque>
          <Badge variant="outline">{e.nTrabajadoresPlanta + e.nEnMision} trabajadores</Badge><Porque titulo="Cómo se cuentan los trabajadores">{decisiones[0].items[0].porque}</Porque>
          {e.ciudad && <Badge variant="outline">{e.ciudad}</Badge>}
          <div className="flex-1" />
          <PanelDecisiones grupos={decisiones} empresa={e.razonSocial} />
        </div>
        <EmpresaTabs id={id} />
      </div>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</div>
    </div>
  );
}
