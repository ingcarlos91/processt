import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { plazosUI } from "@/lib/eventos-ui";
import { aArchivoUI } from "@/lib/archivos-ui";
import { iaDisponible } from "@/lib/ia";
import { EventoDetalle } from "@/components/accidentes/detalle";
import { cargarCatalogoAccidentes } from "@/lib/catalogo-accidentes";
import type { Analisis, Integrante } from "@/lib/eventos";

export const dynamic = "force-dynamic";
const iso = (d?: Date | null) => d?.toISOString().slice(0, 10) ?? "";

export default async function Evento({ params }: PageProps<"/empresas/[id]/accidentes/[eventoId]">) {
  const { id, eventoId } = await params;
  const ev = await db.evento.findUnique({ where: { id: eventoId }, include: { acciones: { orderBy: { fecha: "asc" }, include: { actividad: { select: { anio: true, mes: true } } } }, archivos: { orderBy: { subidoEn: "desc" } } } });
  if (!ev || ev.empresaId !== id) notFound();
  const [empresa, cargos, peligros, enMatriz, comites, consultora, cat, sedes, zonas] = await Promise.all([
    db.empresa.findUniqueOrThrow({ where: { id }, select: { responsableSst: true, representanteLegal: true } }),
    db.cargo.findMany({ where: { empresaId: id }, orderBy: { nombre: "asc" }, include: { tareas: { include: { tarea: { select: { nombre: true } } } } } }),
    db.peligroCatalogo.findMany({ where: { OR: [{ empresaId: null }, { empresaId: id }] }, select: { id: true, descripcion: true, clasificacion: true, subclasificacion: true }, orderBy: { descripcion: "asc" } }),
    ev.cargoId ? db.peligroEvaluado.findMany({ where: { empresaId: id, peligroId: { not: null }, OR: [{ cargoId: ev.cargoId }, { tarea: { cargos: { some: { cargoId: ev.cargoId } } } }] }, select: { peligroId: true } }) : Promise.resolve([]),
    db.comite.findMany({ where: { empresaId: id, tipo: { in: ["COPASST", "VIGIA"] } }, include: { miembros: true } }),
    db.consultora.findFirst(),
    cargarCatalogoAccidentes(),
    db.sede.findMany({ where: { empresaId: id }, select: { nombre: true } }),
    db.zona.findMany({ where: { empresaId: id }, select: { nombre: true } }),
  ]);
  const resp = (empresa.responsableSst ?? {}) as { nombre?: string; cargo?: string };
  // Accidente mortal: la matriz debe actualizarse; grave: se recomienda (Decreto 1072/2015 art. 2.2.4.6.15; Res. 0312/2019 estándar 4.1.2).
  const ultimaVersion = ev.tipo === "AT" && ev.gravedad !== "leve" ? await db.matrizVersion.findFirst({ where: { empresaId: id }, orderBy: { numero: "desc" } }) : null;
  const avisoMatriz = ev.tipo === "AT" && ev.gravedad !== "leve" && (!ultimaVersion || ultimaVersion.fecha < ev.fecha) ? (ev.gravedad === "mortal" ? "obligatorio" : "recomendado") : null;
  const miembros = comites.flatMap((c) => c.miembros.map((m) => ({ nombre: m.nombre, cargo: m.cargo ?? "", rol: "copasst" as const })));
  const sugeridos: Integrante[] = [
    { nombre: "", cargo: "", rol: "jefe" },
    ...(miembros.length ? [miembros[0]] : [{ nombre: "", cargo: "", rol: "copasst" }]),
    { nombre: resp.nombre ?? "", cargo: resp.cargo ?? "Responsable del SG-SST", rol: "responsable" },
    ...(ev.gravedad !== "leve" ? [{ nombre: consultora?.profesional ?? "", cargo: "Profesional con licencia en SST", rol: "profesional" }] : []),
  ];
  const idsMatriz = new Set(enMatriz.map((p) => p.peligroId));
  return (
    <EventoDetalle
      empresaId={id} iaActiva={iaDisponible()}
      ev={{
        id: ev.id, tipo: ev.tipo, gravedad: ev.gravedad,
        datos: {
          tipo: ev.tipo, gravedad: ev.gravedad, fecha: iso(ev.fecha), hora: ev.hora ?? "", lugar: ev.lugar ?? "", descripcion: ev.descripcion ?? "",
          trabajadorNombre: ev.trabajadorNombre ?? "", trabajadorCedula: ev.trabajadorCedula ?? "", vinculacion: ev.vinculacion ?? "", antiguedad: ev.antiguedad ?? "",
          cargoId: ev.cargoId ?? "", cargo: ev.cargo ?? "", tarea: ev.tarea ?? "", mecanismo: ev.mecanismo ?? "", agente: ev.agente ?? "", lesion: ev.lesion ?? "",
          parteCuerpo: ev.parteCuerpo ?? "", testigos: ev.testigos ?? "", diasIncapacidad: ev.diasIncapacidad, diasCargados: ev.diasCargados, casoNuevo: ev.casoNuevo,
        },
        reporte: { fechaReporte: iso(ev.fechaReporte), furatNumero: ev.furatNumero ?? "", reporteMinisterio: iso(ev.reporteMinisterio), invRemitidaArl: iso(ev.invRemitidaArl) },
        inv: { estado: ev.invEstado, inicio: iso(ev.invInicio), cierre: iso(ev.invCierre), equipo: (ev.equipo as Integrante[]) ?? [], analisis: (ev.analisis ?? {}) as Analisis, lecciones: ev.lecciones ?? "", peligroId: ev.peligroId ?? "" },
        acciones: ev.acciones.map((a) => ({ id: a.id, hallazgo: a.hallazgo, causa: a.causa ?? "", tipo: a.tipo, jerarquia: a.jerarquia ?? "", descripcion: a.descripcion, responsable: a.responsable ?? "", fechaLimite: iso(a.fechaLimite), estado: a.estado, fechaCierre: iso(a.fechaCierre), eficacia: a.eficacia ?? "", enPlan: a.actividad ? `${a.actividad.mes}/${a.actividad.anio}` : "" })),
        archivos: ev.archivos.map(aArchivoUI),
        plazos: plazosUI(ev),
      }}
      cargos={cargos.map((c) => ({ id: c.id, nombre: c.nombre, tareas: c.tareas.map((t) => t.tarea.nombre) }))}
      peligros={peligros.map((p) => ({ valor: p.id, etiqueta: p.descripcion, detalle: [p.clasificacion, p.subclasificacion].filter(Boolean).join(" · "), grupo: idsMatriz.has(p.id) ? "En la matriz de este cargo" : p.clasificacion, relevancia: idsMatriz.has(p.id) ? "propio" : "otro" }))}
      peligrosEnMatriz={[...idsMatriz].filter(Boolean) as string[]}
      equipoSugerido={sugeridos}
      responsable={resp.nombre ?? ""}
      avisoMatriz={avisoMatriz}
      cat={cat} lugares={[...new Set([...zonas, ...sedes].map((x) => x.nombre))]}
      personas={[...new Set([resp.nombre, empresa.representanteLegal, ...miembros.map((m) => m.nombre)].filter(Boolean) as string[])]}
    />
  );
}
