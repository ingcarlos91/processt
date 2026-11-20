import { empresaVisible } from "@/lib/auth/acceso";
import { rutaEmpresa } from "@/lib/ruta";
import { AvisoPasoRuta } from "@/components/empresa/ruta";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EmpresaTabs } from "@/components/empresa/tabs";
import { Badge } from "@/components/ui/badge";
import { PanelDecisiones } from "@/components/empresa/panel-decisiones";
import { construirDecisiones } from "@/lib/reglas/decisiones";
import { Porque } from "@/components/app/porque";

export default async function EmpresaLayout({ children, params }: LayoutProps<"/empresas/[id]">) {
  const { id } = await params;
  await empresaVisible(id);
  const e = await db.empresa.findUnique({ where: { id }, select: { etapa: true, _count: { select: { diagnosticos: true } }, logoUrl: true, razonSocial: true, nit: true, digitoVerificacion: true, nivelEstandares: true, claseRiesgo: true, ciudad: true, nTrabajadoresPlanta: true, nEnMision: true } });
  if (!e) notFound();
  const [decisiones, ruta] = await Promise.all([construirDecisiones(id), rutaEmpresa(id)]);
  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b bg-background px-4 pt-3 md:px-6 md:pt-4 print:hidden">
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo servido por la API local */}
            {e.logoUrl && <img src={`/api/empresas/${id}/logo`} alt="" className="h-8 max-w-28 shrink-0 object-contain md:h-9 md:max-w-32" />}
            <h1 className="min-w-0 text-lg font-semibold leading-tight tracking-tight text-balance md:text-xl" title={e.razonSocial}>{e.razonSocial}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1.5 text-xs">
            <Badge variant="outline">NIT {e.nit}{e.digitoVerificacion ? `-${e.digitoVerificacion}` : ""}</Badge>
            <span className="inline-flex items-center gap-0.5"><Badge>{e.nivelEstandares} estándares</Badge><Porque titulo="Estándares mínimos" normas={decisiones[0].items[2].normas}>{decisiones[0].items[2].porque}</Porque></span>
            <span className="inline-flex items-center gap-0.5"><Badge variant="outline">Riesgo {["", "I", "II", "III", "IV", "V"][e.claseRiesgo]}</Badge><Porque titulo="Clase de riesgo" normas={decisiones[0].items[1].normas}>{decisiones[0].items[1].porque}</Porque></span>
            <span className="inline-flex items-center gap-0.5"><Badge variant="outline">{e.nTrabajadoresPlanta + e.nEnMision} trabajadores</Badge><Porque titulo="Cómo se cuentan los trabajadores">{decisiones[0].items[0].porque}</Porque></span>
            {e.ciudad && <Badge variant="outline">{e.ciudad}</Badge>}
          </div>
          <div className="md:ml-auto"><PanelDecisiones grupos={decisiones} empresa={e.razonSocial} /></div>
        </div>
        <div className="mt-2 md:mt-3">
          <EmpresaTabs id={id} conDiagnostico={e.etapa === "diagnostico" || e._count.diagnosticos > 0} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6"><AvisoPasoRuta ruta={ruta} empresaId={id} empresa={e.razonSocial} />{children}</div>
    </div>
  );
}
