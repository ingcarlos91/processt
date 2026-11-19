"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { aplicarCargoTipo, agregarTareaTipo, agregarPeligroCatalogo, prepararEstructura } from "@/lib/matriz/instanciar";
import { sugerirTareasYPeligros, type Sugerencia } from "@/lib/ia";

const rv = (id: string) => revalidatePath(`/empresas/${id}`, "layout");

export async function agregarCargo(empresaId: string, d: { nombre: string; nPersonas: number; cargoTipoId?: string; funciones?: string }) {
  const c = await db.cargo.create({ data: { empresaId, nombre: d.nombre.trim(), nPersonas: Math.max(1, Number(d.nPersonas) || 1), descripcionFunciones: d.funciones || null } });
  if (d.cargoTipoId) await aplicarCargoTipo(empresaId, c.id, d.cargoTipoId, "aprobado");
  rv(empresaId);
  return c.id;
}

export async function actualizarCargo(empresaId: string, cargoId: string, d: { nombre?: string; nPersonas?: number; descripcionFunciones?: string; zonaId?: string | null; area?: string }) {
  await db.cargo.update({ where: { id: cargoId }, data: { ...d, nPersonas: d.nPersonas != null ? Math.max(1, Number(d.nPersonas)) : undefined } });
  rv(empresaId);
}

export async function eliminarCargo(empresaId: string, cargoId: string) {
  const tareas = await db.cargoTarea.findMany({ where: { cargoId } });
  await db.cargo.delete({ where: { id: cargoId } });
  // Tareas que quedan sin cargos se eliminan (con sus peligros)
  for (const t of tareas) if ((await db.cargoTarea.count({ where: { tareaId: t.tareaId } })) === 0) await db.tarea.delete({ where: { id: t.tareaId } });
  rv(empresaId);
}

export async function aplicarTipo(empresaId: string, cargoId: string, cargoTipoId: string) {
  await aplicarCargoTipo(empresaId, cargoId, cargoTipoId, "aprobado");
  rv(empresaId);
}

export async function agregarTareaDeBiblioteca(empresaId: string, cargoId: string, tareaTipoId: string) {
  await agregarTareaTipo(empresaId, cargoId, tareaTipoId, "aprobado");
  rv(empresaId);
}

export async function agregarTareaManual(empresaId: string, cargoId: string, d: { nombre: string; procesoId?: string; zonaId?: string; rutinaria?: boolean; altoRiesgo?: string | null }) {
  await db.tarea.create({ data: { empresaId, nombre: d.nombre, procesoId: d.procesoId || null, zonaId: d.zonaId || null, rutinaria: d.rutinaria ?? true, altoRiesgo: d.altoRiesgo || null, fuente: "manual", cargos: { create: { cargoId } } } });
  rv(empresaId);
}

export async function actualizarTarea(empresaId: string, tareaId: string, d: { nombre?: string; procesoId?: string | null; zonaId?: string | null; rutinaria?: boolean; altoRiesgo?: string | null; actividad?: string }) {
  await db.tarea.update({ where: { id: tareaId }, data: d });
  rv(empresaId);
}

export async function quitarTarea(empresaId: string, cargoId: string, tareaId: string) {
  await db.cargoTarea.delete({ where: { cargoId_tareaId: { cargoId, tareaId } } });
  if ((await db.cargoTarea.count({ where: { tareaId } })) === 0) await db.tarea.delete({ where: { id: tareaId } });
  rv(empresaId);
}

export async function vincularTarea(empresaId: string, cargoId: string, tareaId: string) {
  await db.cargoTarea.upsert({ where: { cargoId_tareaId: { cargoId, tareaId } }, update: {}, create: { cargoId, tareaId } });
  rv(empresaId);
}

export async function actualizarPeligro(empresaId: string, id: string, d: Record<string, string | number | boolean | null>) {
  const permitidos = ["descripcion", "clasificacion", "efectosPosibles", "controlesFuente", "controlesMedio", "controlesIndividuo", "nd", "ne", "nc", "peorConsecuencia", "requisitoLegal", "medidaEliminacion", "medidaSustitucion", "medidaIngenieria", "medidaAdministrativa", "medidaEpp", "estado"];
  const data: Record<string, unknown> = {};
  for (const k of permitidos) if (k in d) data[k] = ["nd", "ne", "nc"].includes(k) ? Number(d[k]) : d[k];
  await db.peligroEvaluado.update({ where: { id }, data });
  rv(empresaId);
}

export async function eliminarPeligro(empresaId: string, id: string) {
  await db.peligroEvaluado.delete({ where: { id } });
  rv(empresaId);
}

export async function aprobarTodos(empresaId: string) {
  await db.peligroEvaluado.updateMany({ where: { empresaId, estado: "sugerido" }, data: { estado: "aprobado" } });
  await db.tarea.updateMany({ where: { empresaId, estado: "sugerido" }, data: { estado: "aprobado" } });
  rv(empresaId);
}

export async function agregarPeligro(empresaId: string, origen: "tarea" | "zona" | "cargo", refId: string, peligroId: string) {
  await agregarPeligroCatalogo(empresaId, origen, refId, peligroId, "aprobado", "manual");
  rv(empresaId);
}

export async function agregarZona(empresaId: string, nombre: string, zonaTipoId?: string) {
  const z = await db.zona.create({ data: { empresaId, nombre, zonaTipoId: zonaTipoId || null } });
  if (zonaTipoId) {
    const zt = await db.zonaTipo.findUniqueOrThrow({ where: { id: zonaTipoId }, include: { peligros: true } });
    for (const p of zt.peligros) await agregarPeligroCatalogo(empresaId, "zona", z.id, p.peligroId, "aprobado", "biblioteca");
  }
  rv(empresaId);
}

export async function eliminarZona(empresaId: string, zonaId: string) {
  await db.tarea.updateMany({ where: { zonaId }, data: { zonaId: null } });
  await db.cargo.updateMany({ where: { zonaId }, data: { zonaId: null } });
  await db.zona.delete({ where: { id: zonaId } });
  rv(empresaId);
}

export async function agregarProceso(empresaId: string, nombre: string) {
  const n = await db.proceso.count({ where: { empresaId } });
  await db.proceso.create({ data: { empresaId, nombre, orden: n } });
  rv(empresaId);
}

export async function eliminarProceso(empresaId: string, procesoId: string) {
  await db.tarea.updateMany({ where: { procesoId }, data: { procesoId: null } });
  await db.proceso.delete({ where: { id: procesoId } });
  rv(empresaId);
}

export async function completarDesdeSector(empresaId: string) {
  await prepararEstructura(empresaId, "aprobado");
  rv(empresaId);
}

export async function sugerirConIA(empresaId: string, cargoId: string, funciones: string) {
  await db.cargo.update({ where: { id: cargoId }, data: { descripcionFunciones: funciones } });
  try {
    return await sugerirTareasYPeligros(empresaId, cargoId, funciones);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

/** Guarda la sugerencia elegida como tareas/peligros en estado "sugerido" para revisión. */
export async function aplicarSugerencia(empresaId: string, cargoId: string, s: Sugerencia, fuente: "ia" | "biblioteca") {
  const procesos = await db.proceso.findMany({ where: { empresaId } });
  const zonas = await db.zona.findMany({ where: { empresaId } });
  const buscar = <T extends { nombre: string }>(xs: T[], nombre: string) => xs.find((x) => x.nombre.toLowerCase() === nombre.toLowerCase());
  for (const t of s.tareas) {
    if (t.tareaTipoId && (await db.tareaTipo.findUnique({ where: { id: t.tareaTipoId } }))) {
      await agregarTareaTipo(empresaId, cargoId, t.tareaTipoId, "sugerido");
      continue;
    }
    let proceso = buscar(procesos, t.proceso);
    if (!proceso && t.proceso) { proceso = await db.proceso.create({ data: { empresaId, nombre: t.proceso, orden: procesos.length } }); procesos.push(proceso); }
    let zona = buscar(zonas, t.zona);
    if (!zona && t.zona) { zona = await db.zona.create({ data: { empresaId, nombre: t.zona } }); zonas.push(zona); }
    const tarea = await db.tarea.create({ data: { empresaId, nombre: t.nombre, actividad: t.actividad, procesoId: proceso?.id, zonaId: zona?.id, rutinaria: t.rutinaria, altoRiesgo: t.altoRiesgo, estado: "sugerido", fuente, cargos: { create: { cargoId } } } });
    for (const p of t.peligros) {
      const cat = p.peligroId ? await db.peligroCatalogo.findUnique({ where: { id: p.peligroId } }) : null;
      await db.peligroEvaluado.create({ data: {
        empresaId, origen: "tarea", tareaId: tarea.id, peligroId: cat?.id, estado: "sugerido", fuente,
        clasificacion: p.clasificacion, descripcion: p.descripcion, efectosPosibles: p.efectos, nd: p.nd, ne: p.ne, nc: p.nc,
        medidaIngenieria: p.medidaIngenieria ?? cat?.medidaIngenieria, medidaAdministrativa: p.medidaAdministrativa ?? cat?.medidaAdministrativa, medidaEpp: p.medidaEpp ?? cat?.medidaEpp,
        controlesFuente: cat?.controlesFuente, controlesMedio: cat?.controlesMedio, controlesIndividuo: cat?.controlesIndividuo, requisitoLegal: cat?.requisitoLegalEspecifico ?? false,
      } });
    }
  }
  rv(empresaId);
}

/** Guarda un peligro evaluado (nuevo) en la biblioteca para reutilizarlo. */
export async function guardarPeligroEnBiblioteca(empresaId: string, peligroEvaluadoId: string) {
  const p = await db.peligroEvaluado.findUniqueOrThrow({ where: { id: peligroEvaluadoId }, include: { tarea: true } });
  const cat = await db.peligroCatalogo.create({ data: {
    clasificacion: p.clasificacion, descripcion: p.descripcion, efectosPosibles: p.efectosPosibles ?? "", ndDefault: p.nd, neDefault: p.ne, ncDefault: p.nc,
    controlesFuente: p.controlesFuente, controlesMedio: p.controlesMedio, controlesIndividuo: p.controlesIndividuo,
    medidaEliminacion: p.medidaEliminacion, medidaSustitucion: p.medidaSustitucion, medidaIngenieria: p.medidaIngenieria, medidaAdministrativa: p.medidaAdministrativa, medidaEpp: p.medidaEpp,
    requisitoLegalEspecifico: p.requisitoLegal, validado: true,
  } });
  await db.peligroEvaluado.update({ where: { id: p.id }, data: { peligroId: cat.id } });
  if (p.tarea?.tareaTipoId) await db.tareaTipoPeligro.create({ data: { tareaTipoId: p.tarea.tareaTipoId, peligroId: cat.id } }).catch(() => null);
  rv(empresaId);
}

/** Guarda una tarea nueva (con sus peligros) como tarea tipo de la biblioteca. */
export async function guardarTareaEnBiblioteca(empresaId: string, tareaId: string) {
  const t = await db.tarea.findUniqueOrThrow({ where: { id: tareaId }, include: { peligros: true, zona: { include: { zonaTipo: true } } } });
  const tt = await db.tareaTipo.create({ data: { nombre: t.nombre, actividad: t.actividad, rutinaria: t.rutinaria, altoRiesgo: t.altoRiesgo, validado: true, zonasPreferidas: t.zona?.zonaTipo ? [t.zona.zonaTipo.nombre] : [] } });
  for (const p of t.peligros) {
    let pid = p.peligroId;
    if (!pid) {
      const cat = await db.peligroCatalogo.create({ data: { clasificacion: p.clasificacion, descripcion: p.descripcion, efectosPosibles: p.efectosPosibles ?? "", ndDefault: p.nd, neDefault: p.ne, ncDefault: p.nc, medidaIngenieria: p.medidaIngenieria, medidaAdministrativa: p.medidaAdministrativa, medidaEpp: p.medidaEpp, validado: true } });
      pid = cat.id;
      await db.peligroEvaluado.update({ where: { id: p.id }, data: { peligroId: pid } });
    }
    await db.tareaTipoPeligro.create({ data: { tareaTipoId: tt.id, peligroId: pid, nd: p.nd, ne: p.ne, nc: p.nc } }).catch(() => null);
  }
  await db.tarea.update({ where: { id: tareaId }, data: { tareaTipoId: tt.id } });
  rv(empresaId);
}

export async function cerrarVersionMatriz(empresaId: string, motivo: string) {
  const n = await db.matrizVersion.count({ where: { empresaId } });
  const peligros = await db.peligroEvaluado.findMany({ where: { empresaId } });
  const v = await db.matrizVersion.create({ data: { empresaId, numero: n + 1, motivo, snapshot: peligros as object } });
  await db.peligroEvaluado.updateMany({ where: { empresaId }, data: { matrizVersionId: v.id } });
  await recalcularEmpresa(empresaId);
  rv(empresaId);
}
