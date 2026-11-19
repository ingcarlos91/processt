import { db } from "@/lib/db";
import { Page, PageHeader } from "@/components/app/ui";
import { IntakeWizard } from "@/components/empresa/intake-wizard";

export const dynamic = "force-dynamic";

export default async function NuevaEmpresa() {
  const [sectores, cargosTipo, ciius] = await Promise.all([
    db.sectorTipo.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true, ciius: true } }),
    db.cargoTipo.findMany({ where: { empresaId: null }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true, sectorTipoId: true } }),
    db.ciiuClaseRiesgo.findMany({ orderBy: { codigo: "asc" }, select: { codigo: true, descripcion: true, claseRiesgo: true } }),
  ]);
  return (
    <Page>
      <PageHeader title="Nueva empresa" description="Responda el cuestionario. Al crear, el sistema determina el nivel de estándares, los comités, las normas aplicables y precarga la matriz de peligros por cargo." />
      <IntakeWizard sectores={sectores} cargosTipo={cargosTipo} ciius={ciius} />
    </Page>
  );
}
