import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { composicionCopasst } from "@/lib/reglas/motor";
import { calcularComposicion, calidadDe, cargoComiteDe, composicionGuardada } from "@/lib/comites";
import { ComitesEditor } from "@/components/comites/editor";
import { aArchivoUI } from "@/lib/archivos-ui";
import { hoyLocal } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Comites({ params }: PageProps<"/empresas/[id]/comites">) {
  const { id } = await params;
  const rr = await recalcularEmpresa(id);
  const comites = await db.comite.findMany({ where: { empresaId: id }, include: { miembros: { orderBy: { nombre: "asc" } }, archivos: { orderBy: { fecha: "desc" } } }, orderBy: [{ tipo: "asc" }, { periodoInicio: "asc" }] });
  const trabajadores = await db.trabajador.findMany({ where: { empresaId: id, activo: true }, orderBy: { nombres: "asc" }, select: { nombres: true, tipoDoc: true, documento: true, cargo: { select: { nombre: true, sede: { select: { nombre: true } } } } } });
  const sedes = await db.sede.findMany({ where: { empresaId: id }, orderBy: [{ principal: "desc" }, { nombre: "asc" }], select: { nombre: true, principal: true } });
  const ORDEN = ["COPASST", "VIGIA", "CCL", "BRIGADA"];
  const cop = composicionCopasst(rr.trabajadores);
  const requeridos = rr.comites.map((c) => (c === "COPASST" && cop.tipo === "VIGIA" ? "VIGIA" : c)).sort((a, b) => ORDEN.indexOf(a) - ORDEN.indexOf(b));
  const hoy = hoyLocal();
  return (
    <ComitesEditor
      empresaId={id}
      requeridos={requeridos}
      trabajadoresEmpresa={rr.trabajadores}
      trabajadores={trabajadores.map((t) => ({ nombre: t.nombres, tipoDoc: t.tipoDoc ?? "CC", documento: t.documento ?? "", cargo: t.cargo?.nombre ?? "" }))}
      sedes={sedes.map((s) => ({ nombre: s.nombre, principal: s.principal, trabajadores: trabajadores.filter((t) => t.cargo?.sede?.nombre === s.nombre).length }))}
      composicionNueva={Object.fromEntries(requeridos.map((t) => [t, calcularComposicion(t, rr.trabajadores, hoy)]))}
      refs={Object.fromEntries(rr.conclusiones.filter((c) => c.tipo === "comite").map((c) => [c.valor, c.normaRef]))}
      porques={Object.fromEntries(rr.conclusiones.filter((c) => c.tipo === "comite").map((c) => [c.valor, `${c.porque}${c.valor === "COPASST" ? ` ${cop.texto}.` : ""}`]))}
      comites={comites.map((c) => ({
        id: c.id, tipo: c.tipo, sede: c.sede ?? "",
        inicio: c.periodoInicio?.toISOString().slice(0, 10) ?? "", fin: c.periodoFin?.toISOString().slice(0, 10) ?? "", normaRef: c.normaRef ?? "",
        datos: (c.datos ?? {}) as Record<string, unknown>,
        // Composición congelada al conformar; si no existe (comités antiguos), la calculada con los trabajadores actuales.
        composicion: composicionGuardada(c.datos) ?? calcularComposicion(c.tipo, rr.trabajadores, c.periodoInicio?.toISOString().slice(0, 10) ?? hoy, c.sede),
        congelada: !!composicionGuardada(c.datos),
        actas: c.archivos.map(aArchivoUI),
        miembros: c.miembros.map((m) => ({ id: m.id, nombre: m.nombre, tipoDoc: m.tipoDoc, cedula: m.cedula ?? "", cargo: m.cargo ?? "", rol: m.rol, calidad: c.tipo === "BRIGADA" ? "" : calidadDe(m.rol, m.calidad) ?? "", cargoComite: cargoComiteDe(m.rol), representa: m.representa ?? "" })),
      }))}
    />
  );
}
