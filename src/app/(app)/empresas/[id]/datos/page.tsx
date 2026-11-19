import { db, consultoraActual } from "@/lib/db";
import { profesionalDe } from "@/lib/profesional";
import { IntakeWizard } from "@/components/empresa/intake-wizard";
import type { IntakeData } from "@/app/actions/empresas";
import { BotonEliminarEmpresa } from "@/components/empresa/eliminar";
import { ComplementariosForm } from "@/components/empresa/complementarios-form";
import { camposAplicables, faltantes, type Complementarios } from "@/lib/complementarios";
import { construirContexto } from "@/lib/generador/contexto";

export const dynamic = "force-dynamic";

export default async function Datos({ params }: PageProps<"/empresas/[id]/datos">) {
  const { id } = await params;
  const [e, sectores, cargosTipo, ciius] = await Promise.all([
    db.empresa.findUniqueOrThrow({ where: { id }, include: { sedes: true, cargos: true } }),
    db.sectorTipo.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true, ciius: true } }),
    db.cargoTipo.findMany({ where: { OR: [{ empresaId: null }, { empresaId: id }] }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true, sectorTipoId: true } }),
    db.ciiuClaseRiesgo.findMany({ orderBy: { codigo: "asc" }, select: { codigo: true, descripcion: true, claseRiesgo: true } }),
  ]);
  const inicial: IntakeData = {
    razonSocial: e.razonSocial, nit: e.nit, digitoVerificacion: e.digitoVerificacion ?? "", direccion: e.direccion ?? "", ciudad: e.ciudad ?? "", departamento: e.departamento ?? "",
    telefono: e.telefono ?? "", correo: e.correo ?? "", representanteLegal: e.representanteLegal ?? "", representanteTipoDoc: e.representanteTipoDoc, representanteCedula: e.representanteCedula ?? "",
    ciiu: e.ciiu ?? "", descripcionActividad: e.descripcionActividad ?? "", claseRiesgo: e.claseRiesgo, claseRiesgoJustificacion: e.claseRiesgoJustificacion ?? "",
    arl: e.arl ?? "", epsPrincipal: e.epsPrincipal ?? "", sectorTipoId: e.sectorTipoId, esUpa: e.esUpa,
    nTrabajadoresPlanta: e.nTrabajadoresPlanta, nContratistas: e.nContratistas, nAprendices: e.nAprendices, nEnMision: e.nEnMision, nVehiculos: e.nVehiculos,
    horario: e.horario ?? "", turnos: e.turnos ?? "", sedes: e.sedes.map((s) => ({ nombre: s.nombre, direccion: s.direccion ?? "", ciudad: s.ciudad ?? "" })),
    cargos: [], disparadores: (e.disparadores ?? {}) as Record<string, boolean>, estadoActual: (e.estadoActual ?? {}) as Record<string, boolean>,
    responsableSst: (e.responsableSst ?? {}) as IntakeData["responsableSst"],
  };
  return (
    <>
      <p className="text-sm text-muted-foreground max-w-4xl">Edite los datos de la empresa. Los cargos se gestionan en la pestaña “Cargos y matriz de peligros”. Al guardar se recalculan el nivel de estándares, comités y normas; luego regenere los documentos.</p>
      <IntakeWizard sectores={sectores} cargosTipo={cargosTipo} ciius={ciius} profesional={profesionalDe(await consultoraActual())} inicial={inicial} empresaId={id} tieneLogo={!!e.logoUrl} />
      {await (async () => {
        const ctx = await construirContexto(id);
        const secciones = camposAplicables(ctx.dis).map((sec) => ({ ...sec, campos: sec.campos.map((c) => (c.k === "presupuesto" ? { ...c, filasSugeridas: ctx.presupuesto.map((r) => ({ rubro: r.rubro })) } : c)) }));
        const datos = (e.datosComplementarios ?? {}) as Complementarios;
        const falta = faltantes(datos, ctx.dis, ctx._reglas.documentos.map((d) => d.codigo)).map((f) => f.k);
        return <ComplementariosForm empresaId={id} secciones={secciones} inicial={datos} faltan={falta} />;
      })()}
      <BotonEliminarEmpresa id={id} nombre={e.razonSocial} />
    </>
  );
}
