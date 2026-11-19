import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { BotonNuevoDiagnostico } from "@/components/diagnostico/acciones";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

/** Abre el diagnóstico más reciente o invita a crear uno. */
export default async function Diagnosticos({ params }: PageProps<"/empresas/[id]/diagnostico">) {
  const { id } = await params;
  const ultimo = await db.diagnostico.findFirst({ where: { empresaId: id }, orderBy: { creadoEn: "desc" } });
  if (ultimo) redirect(`/empresas/${id}/diagnostico/${ultimo.id}`);
  return (
    <EstadoVacio ilustracion="evaluacion" titulo="Sin diagnóstico inicial" descripcion="Evalúa el estado actual de la empresa frente a los estándares mínimos y genera el informe en PDF. Es opcional y sirve como línea base para medir el avance.">
      <BotonNuevoDiagnostico empresaId={id} />
      <Link href={`/empresas/${id}`} className={buttonVariants({ variant: "ghost" })}>Volver al resumen</Link>
    </EstadoVacio>
  );
}
