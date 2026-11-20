import { usuarioActual } from "@/lib/auth/sesion";
import { alcanceBiblioteca } from "@/lib/auth/acceso";
import { db } from "@/lib/db";
import { cargarEntidades } from "@/lib/entidades";
import { profesionalDe } from "@/lib/profesional";
import { Page, PageHeader } from "@/components/app/ui";
import { IntakeWizard } from "@/components/empresa/intake-wizard";

export const dynamic = "force-dynamic";

export default async function NuevaEmpresa() {
  const [sectores, cargosTipo, ciius] = await Promise.all([
    db.sectorTipo.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true, ciius: true } }),
    db.cargoTipo.findMany({ where: alcanceBiblioteca((await usuarioActual()).consultoraId), orderBy: { nombre: "asc" }, select: { id: true, nombre: true, sectorTipoId: true } }),
    db.ciiuClaseRiesgo.findMany({ orderBy: { codigo: "asc" }, select: { codigo: true, descripcion: true, claseRiesgo: true } }),
  ]);
  return (
    <Page>
      <PageHeader title="Nueva empresa" description="Responda el cuestionario paso a paso. Al crear la empresa quedan definidos su nivel de estándares, comités, normas aplicables y la matriz de peligros inicial." />
      <IntakeWizard sectores={sectores} cargosTipo={cargosTipo} ciius={ciius} profesional={profesionalDe(await db.consultora.findUniqueOrThrow({ where: { id: (await usuarioActual()).consultoraId } }))} entidades={await cargarEntidades((await usuarioActual()).consultoraId)} />
    </Page>
  );
}
