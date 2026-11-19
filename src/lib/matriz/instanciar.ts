import { db } from "@/lib/db";

type PeligroBase = {
  id: string; clasificacion: string; descripcion: string; efectosPosibles: string; ndDefault: number; neDefault: number; ncDefault: number;
  controlesFuente: string | null; controlesMedio: string | null; controlesIndividuo: string | null;
  medidaEliminacion: string | null; medidaSustitucion: string | null; medidaIngenieria: string | null; medidaAdministrativa: string | null; medidaEpp: string | null;
  requisitoLegalEspecifico: boolean;
};

function datosPeligro(p: PeligroBase, o?: { nd?: number | null; ne?: number | null; nc?: number | null }) {
  return {
    peligroId: p.id, clasificacion: p.clasificacion, descripcion: p.descripcion, efectosPosibles: p.efectosPosibles,
    controlesFuente: p.controlesFuente, controlesMedio: p.controlesMedio, controlesIndividuo: p.controlesIndividuo,
    nd: o?.nd ?? p.ndDefault, ne: o?.ne ?? p.neDefault, nc: o?.nc ?? p.ncDefault, requisitoLegal: p.requisitoLegalEspecifico,
    medidaEliminacion: p.medidaEliminacion, medidaSustitucion: p.medidaSustitucion, medidaIngenieria: p.medidaIngenieria,
    medidaAdministrativa: p.medidaAdministrativa, medidaEpp: p.medidaEpp,
  };
}

/** Crea zonas y procesos de la empresa a partir de su sector tipo (sin duplicar por nombre). */
export async function prepararEstructura(empresaId: string, estado: "sugerido" | "aprobado" = "sugerido") {
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, include: { zonas: true, procesos: true, sedes: true } });
  if (!e.sectorTipoId) return;
  const sector = await db.sectorTipo.findUniqueOrThrow({
    where: { id: e.sectorTipoId },
    include: { zonas: { include: { zonaTipo: { include: { peligros: { include: { peligro: true } } } } } }, procesos: true },
  });
  const sede = e.sedes.find((s) => s.principal) ?? e.sedes[0];
  for (const z of sector.zonas) {
    if (e.zonas.some((x) => x.zonaTipoId === z.zonaTipoId || x.nombre === z.zonaTipo.nombre)) continue;
    const zona = await db.zona.create({ data: { empresaId, nombre: z.zonaTipo.nombre, zonaTipoId: z.zonaTipoId, sedeId: sede?.id } });
    for (const zp of z.zonaTipo.peligros)
      await db.peligroEvaluado.create({ data: { empresaId, origen: "zona", zonaId: zona.id, estado, fuente: "biblioteca", ...datosPeligro(zp.peligro, zp) } });
  }
  for (const [i, p] of sector.procesos.entries()) {
    if (e.procesos.some((x) => x.procesoTipoId === p.id || x.nombre === p.nombre)) continue;
    await db.proceso.create({ data: { empresaId, nombre: p.nombre, descripcion: p.descripcion, procesoTipoId: p.id, orden: i } });
  }
}

/** Asigna a un cargo de la empresa las tareas (y sus peligros) de un cargo tipo de la biblioteca. */
export async function aplicarCargoTipo(empresaId: string, cargoId: string, cargoTipoId: string, estado: "sugerido" | "aprobado" = "sugerido") {
  await prepararEstructura(empresaId, estado);
  const cargo = await db.cargo.findUniqueOrThrow({ where: { id: cargoId } });
  const ct = await db.cargoTipo.findUniqueOrThrow({
    where: { id: cargoTipoId },
    include: { tareas: { include: { tareaTipo: { include: { peligros: { include: { peligro: true } }, procesosTipo: true } } } }, peligros: { include: { peligro: true } } },
  });
  await db.cargo.update({ where: { id: cargoId }, data: { cargoTipoId, descripcionFunciones: cargo.descripcionFunciones ?? ct.descripcion } });
  for (const t of ct.tareas) await agregarTareaTipo(empresaId, cargoId, t.tareaTipoId, estado);
  const yaCargo = await db.peligroEvaluado.findMany({ where: { cargoId, origen: "cargo" } });
  for (const cp of ct.peligros) {
    if (yaCargo.some((x) => x.peligroId === cp.peligroId)) continue;
    await db.peligroEvaluado.create({ data: { empresaId, origen: "cargo", cargoId, estado, fuente: "biblioteca", ...datosPeligro(cp.peligro, cp) } });
  }
}

/** Agrega una tarea tipo a un cargo. Si la empresa ya tiene esa tarea (por otro cargo), solo la vincula. */
export async function agregarTareaTipo(empresaId: string, cargoId: string, tareaTipoId: string, estado: "sugerido" | "aprobado" = "sugerido") {
  const existente = await db.tarea.findFirst({ where: { empresaId, tareaTipoId } });
  if (existente) {
    await db.cargoTarea.upsert({ where: { cargoId_tareaId: { cargoId, tareaId: existente.id } }, update: {}, create: { cargoId, tareaId: existente.id } });
    return existente;
  }
  const tt = await db.tareaTipo.findUniqueOrThrow({ where: { id: tareaTipoId }, include: { peligros: { include: { peligro: true } }, procesosTipo: true } });
  const procesos = await db.proceso.findMany({ where: { empresaId } });
  const proceso = procesos.find((p) => p.procesoTipoId && tt.procesosTipo.some((x) => x.procesoTipoId === p.procesoTipoId)) ?? procesos.find((p) => /producci|operaci|servicio al cliente|cocina|obra/i.test(p.nombre)) ?? procesos[0];
  const cargo = await db.cargo.findUniqueOrThrow({ where: { id: cargoId } });
  const zonas = await db.zona.findMany({ where: { empresaId }, include: { zonaTipo: true } });
  const preferida = tt.zonasPreferidas.map((n) => zonas.find((z) => z.zonaTipo?.nombre === n || z.nombre === n)).find(Boolean);
  const zona = preferida || (cargo.zonaId && zonas.find((z) => z.id === cargo.zonaId)) || zonas[0];
  const tarea = await db.tarea.create({
    data: {
      empresaId, tareaTipoId, procesoId: proceso?.id, zonaId: zona?.id, actividad: tt.actividad, nombre: tt.nombre, rutinaria: tt.rutinaria,
      altoRiesgo: tt.altoRiesgo, estado, fuente: "biblioteca", cargos: { create: { cargoId } },
    },
  });
  for (const tp of tt.peligros)
    await db.peligroEvaluado.create({ data: { empresaId, origen: "tarea", tareaId: tarea.id, estado, fuente: "biblioteca", ...datosPeligro(tp.peligro, tp) } });
  return tarea;
}

/** Agrega un peligro del catálogo a una tarea, zona o cargo. */
export async function agregarPeligroCatalogo(empresaId: string, origen: "tarea" | "zona" | "cargo", refId: string, peligroId: string, estado: "sugerido" | "aprobado" = "aprobado", fuente = "manual") {
  const p = await db.peligroCatalogo.findUniqueOrThrow({ where: { id: peligroId } });
  return db.peligroEvaluado.create({
    data: { empresaId, origen, estado, fuente, tareaId: origen === "tarea" ? refId : null, zonaId: origen === "zona" ? refId : null, cargoId: origen === "cargo" ? refId : null, ...datosPeligro(p) },
  });
}

/** Sugiere un cargo tipo por similitud de nombre (dentro del sector y luego en toda la biblioteca). */
export async function sugerirCargoTipo(nombre: string, sectorTipoId?: string | null, empresaId?: string | null) {
  const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\(.*?\)/g, "");
  const palabras = norm(nombre).split(/[^a-z]+/).filter((w) => w.length > 3);
  const tipos = await db.cargoTipo.findMany({ where: { OR: [{ empresaId: null }, ...(empresaId ? [{ empresaId }] : [])] }, orderBy: { nombre: "asc" } });
  const puntuar = (t: { nombre: string; sectorTipoId: string | null }) => {
    const n = norm(t.nombre);
    let s = palabras.filter((w) => n.includes(w)).length * 10;
    if (sectorTipoId && t.sectorTipoId === sectorTipoId) s += 3;
    if (empresaId && (t as { empresaId?: string | null }).empresaId === empresaId) s += 5;
    return s;
  };
  const mejor = tipos.map((t) => ({ t, s: puntuar(t) })).filter((x) => x.s >= 10).sort((a, b) => b.s - a.s)[0];
  return mejor?.t ?? null;
}
