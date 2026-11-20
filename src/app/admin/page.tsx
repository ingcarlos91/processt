import { db } from "@/lib/db";
import { PageHeader, Stat } from "@/components/app/ui";
import { ConsultorasAdmin } from "@/components/admin/consultoras";

export const dynamic = "force-dynamic";

/** Consultoras, sus usuarios y totales. No se consultan datos de empresas ni de trabajadores (solo conteos). */
export default async function Admin() {
  const consultoras = await db.consultora.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true, nombre: true, nit: true, activa: true, creadoEn: true, iaTopeMensualUsd: true,
      _count: { select: { empresas: true } },
      usuarios: { orderBy: [{ rol: "asc" }, { nombre: "asc" }], select: { id: true, nombre: true, email: true, rol: true, activo: true, ultimoAcceso: true } },
    },
  });
  const usuarios = consultoras.flatMap((c) => c.usuarios);
  const hoy = new Date();
  const ia = await db.usoIa.groupBy({ by: ["consultoraId"], where: { creadoEn: { gte: new Date(hoy.getFullYear(), hoy.getMonth(), 1) } }, _sum: { costoUsd: true }, _count: { _all: true } });
  const iaDe = new Map(ia.map((x) => [x.consultoraId, { usd: x._sum.costoUsd ?? 0, usos: x._count._all }]));
  const iaTotal = ia.reduce((s, x) => s + (x._sum.costoUsd ?? 0), 0);
  const hace30 = new Date(new Date().getTime() - 30 * 864e5);
  return (
    <>
      <PageHeader title="Consultoras" description="Cree consultoras con su administrador, active o desactive su acceso y gestione sus usuarios. Cada consultora trabaja aislada: solo ve sus empresas, su biblioteca y sus plantillas." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Stat label="Consultoras" value={consultoras.length} hint={`${consultoras.filter((c) => c.activa).length} activas`} />
        <Stat label="Empresas cliente" value={consultoras.reduce((s, c) => s + c._count.empresas, 0)} />
        <Stat label="Usuarios" value={usuarios.length} hint={`${usuarios.filter((u) => u.activo).length} activos`} />
        <Stat label="IA este mes (todas)" value={`USD ${iaTotal.toFixed(2)}`} hint={`${ia.reduce((s, x) => s + x._count._all, 0)} uso(s)`} />
        <Stat label="Entraron en los últimos 30 días" value={usuarios.filter((u) => u.ultimoAcceso && u.ultimoAcceso > hace30).length} />
      </div>
      <ConsultorasAdmin consultoras={consultoras.map((c) => ({
        id: c.id, nombre: c.nombre, nit: c.nit ?? "", activa: c.activa, creadoEn: c.creadoEn.toISOString(), empresas: c._count.empresas, iaUsd: iaDe.get(c.id)?.usd ?? 0, iaUsos: iaDe.get(c.id)?.usos ?? 0, iaTope: c.iaTopeMensualUsd,
        usuarios: c.usuarios.map((u) => ({ ...u, ultimoAcceso: u.ultimoAcceso?.toISOString() ?? null })),
      }))} />
    </>
  );
}
