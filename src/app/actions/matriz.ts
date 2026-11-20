"use server";
import { cargarEmpresa, filasMatriz } from "@/lib/generador/contexto";
import { resumenFilas } from "@/lib/matriz/versiones";
import { actualizarDocumentos } from "@/lib/generador/documentos";
import { requiereUsuario } from "@/lib/auth/sesion";
import { alcanceBiblioteca, requiereBibliotecaVisible, requiereEmpresa, requiereRegistro } from "@/lib/auth/acceso";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { aplicarCargoTipo, agregarTareaTipo, agregarPeligroCatalogo, prepararEstructura } from "@/lib/matriz/instanciar";
import { sugerirTareasYPeligros, type Sugerencia } from "@/lib/ia";
import { leerSeguimiento, type Seguimiento } from "@/lib/matriz/seguimiento";

const rv = (id: string) => revalidatePath(`/empresas/${id}`, "layout");

/** Guarda un cargo de la empresa (con sus tareas) como cargo tipo de la biblioteca de la empresa o general. */
export async function guardarCargoEnBiblioteca(empresaId: string, cargoId: string, alcance: "empresa" | "general" = "empresa") {
  const u = await requiereEmpresa(empresaId);
  await requiereRegistro("cargo", cargoId, empresaId);
  const c = await db.cargo.findUniqueOrThrow({ where: { id: cargoId }, include: { tareas: { include: { tarea: true } }, empresa: { select: { sectorTipoId: true } } } });
  const sinTipo = c.tareas.filter((x) => !x.tarea.tareaTipoId);
  for (const x of sinTipo) await guardarTareaEnBiblioteca(empresaId, x.tareaId, alcance);
  const tareas = await db.tarea.findMany({ where: { id: { in: c.tareas.map((x) => x.tareaId) } }, select: { tareaTipoId: true } });
  const ct = await db.cargoTipo.create({ data: {
    empresaId: alcance === "empresa" ? empresaId : null, consultoraId: alcance === "empresa" ? null : u.consultoraId, sectorTipoId: c.empresa.sectorTipoId, nombre: c.nombre, descripcion: c.descripcionFunciones, validado: true,
    tareas: { create: [...new Set(tareas.map((t) => t.tareaTipoId).filter(Boolean) as string[])].map((tareaTipoId) => ({ tareaTipoId })) },
  } });
  await db.cargo.update({ where: { id: cargoId }, data: { cargoTipoId: ct.id } });
  rv(empresaId);
}

export async function agregarCargo(empresaId: string, d: { nombre: string; nPersonas: number; cargoTipoId?: string; funciones?: string }) {
  await requiereEmpresa(empresaId);
  if (d.cargoTipoId) await requiereBibliotecaVisible("cargoTipo", d.cargoTipoId);
  const c = await db.cargo.create({ data: { empresaId, nombre: d.nombre.trim(), nPersonas: Math.max(1, Number(d.nPersonas) || 1), descripcionFunciones: d.funciones || null } });
  if (d.cargoTipoId) await aplicarCargoTipo(empresaId, c.id, d.cargoTipoId, "aprobado");
  rv(empresaId);
  return c.id;
}

export async function actualizarCargo(empresaId: string, cargoId: string, d: { nombre?: string; nPersonas?: number; descripcionFunciones?: string; zonaId?: string | null; area?: string; periodicidadMeses?: number | null; periodicidadMotivo?: string | null }) {
  await requiereEmpresa(empresaId);
  if (d.zonaId) await requiereRegistro("zona", d.zonaId, empresaId);
  // Periodicidad de las evaluaciones periódicas (Res. 1843/2025 art. 15): entero positivo o vacío.
  const periodicidadMeses = d.periodicidadMeses === undefined ? undefined : Number(d.periodicidadMeses) > 0 ? Math.round(Number(d.periodicidadMeses)) : null;
  const periodicidadMotivo = d.periodicidadMotivo === undefined ? undefined : d.periodicidadMotivo?.trim() || null;
  await db.cargo.update({ where: { id: cargoId, empresaId }, data: { ...d, periodicidadMeses, periodicidadMotivo, nPersonas: d.nPersonas != null ? Math.max(1, Number(d.nPersonas)) : undefined } });
  rv(empresaId);
}

export async function eliminarCargo(empresaId: string, cargoId: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("cargo", cargoId, empresaId);
  const tareas = await db.cargoTarea.findMany({ where: { cargoId } });
  await db.cargo.delete({ where: { id: cargoId } });
  // Tareas que quedan sin cargos se eliminan (con sus peligros)
  for (const t of tareas) if ((await db.cargoTarea.count({ where: { tareaId: t.tareaId } })) === 0) await db.tarea.delete({ where: { id: t.tareaId } });
  rv(empresaId);
}

export async function aplicarTipo(empresaId: string, cargoId: string, cargoTipoId: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("cargo", cargoId, empresaId);
  await requiereBibliotecaVisible("cargoTipo", cargoTipoId);
  await aplicarCargoTipo(empresaId, cargoId, cargoTipoId, "aprobado");
  rv(empresaId);
}

export async function agregarTareaDeBiblioteca(empresaId: string, cargoId: string, tareaTipoId: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("cargo", cargoId, empresaId);
  await requiereBibliotecaVisible("tareaTipo", tareaTipoId);
  await agregarTareaTipo(empresaId, cargoId, tareaTipoId, "aprobado");
  rv(empresaId);
}

export async function agregarTareaManual(empresaId: string, cargoId: string, d: { nombre: string; procesoId?: string; zonaId?: string; rutinaria?: boolean; altoRiesgo?: string | null }) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("cargo", cargoId, empresaId);
  if (d.procesoId) await requiereRegistro("proceso", d.procesoId, empresaId);
  if (d.zonaId) await requiereRegistro("zona", d.zonaId, empresaId);
  // Sin proceso elegido: el proceso más usado por las demás tareas de este cargo (no el primero de la lista).
  let procesoId = d.procesoId || null;
  if (!procesoId) {
    const delCargo = await db.tarea.findMany({ where: { empresaId, cargos: { some: { cargoId } }, procesoId: { not: null } }, select: { procesoId: true } });
    const cuenta = new Map<string, number>();
    for (const t of delCargo) cuenta.set(t.procesoId!, (cuenta.get(t.procesoId!) ?? 0) + 1);
    procesoId = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }
  await db.tarea.create({ data: { empresaId, nombre: d.nombre, procesoId, zonaId: d.zonaId || null, rutinaria: d.rutinaria ?? true, altoRiesgo: d.altoRiesgo || null, fuente: "manual", cargos: { create: { cargoId } } } });
  rv(empresaId);
}

export async function actualizarTarea(empresaId: string, tareaId: string, d: { nombre?: string; procesoId?: string | null; zonaId?: string | null; rutinaria?: boolean; altoRiesgo?: string | null; actividad?: string }) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("tarea", tareaId, empresaId);
  if (d.procesoId) await requiereRegistro("proceso", d.procesoId, empresaId);
  if (d.zonaId) await requiereRegistro("zona", d.zonaId, empresaId);
  await db.tarea.update({ where: { id: tareaId }, data: d });
  rv(empresaId);
}

export async function quitarTarea(empresaId: string, cargoId: string, tareaId: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("cargo", cargoId, empresaId);
  await requiereRegistro("tarea", tareaId, empresaId);
  await db.cargoTarea.delete({ where: { cargoId_tareaId: { cargoId, tareaId } } });
  if ((await db.cargoTarea.count({ where: { tareaId } })) === 0) await db.tarea.delete({ where: { id: tareaId } });
  rv(empresaId);
}

export async function vincularTarea(empresaId: string, cargoId: string, tareaId: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("cargo", cargoId, empresaId);
  await requiereRegistro("tarea", tareaId, empresaId);
  await db.cargoTarea.upsert({ where: { cargoId_tareaId: { cargoId, tareaId } }, update: {}, create: { cargoId, tareaId } });
  rv(empresaId);
}

export async function actualizarPeligro(empresaId: string, id: string, d: Record<string, string | number | boolean | null>) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("peligroEvaluado", id, empresaId);
  const permitidos = ["descripcion", "clasificacion", "efectosPosibles", "controlesFuente", "controlesMedio", "controlesIndividuo", "nd", "ne", "nc", "peorConsecuencia", "requisitoLegal", "medidaEliminacion", "medidaSustitucion", "medidaIngenieria", "medidaAdministrativa", "medidaEpp", "estado"];
  const data: Record<string, unknown> = {};
  for (const k of permitidos) if (k in d) data[k] = ["nd", "ne", "nc"].includes(k) ? Number(d[k]) : d[k];
  await db.peligroEvaluado.update({ where: { id }, data });
  rv(empresaId);
}

/** Responsable, fecha, estado y verificación de las medidas de un peligro (Res. 0312/2019 est. 4.2.1 y 4.2.2). */
export async function actualizarSeguimiento(empresaId: string, id: string, cambios: Seguimiento) {
  await requiereEmpresa(empresaId);
  const p = await db.peligroEvaluado.findFirstOrThrow({ where: { id, empresaId }, select: { seguimiento: true } });
  const actual = leerSeguimiento(p.seguimiento) as Record<string, string>;
  for (const [k, v] of Object.entries(cambios)) actual[k] = v ?? "";
  await db.peligroEvaluado.update({ where: { id }, data: { seguimiento: leerSeguimiento(actual) } });
  rv(empresaId);
}

export async function eliminarPeligro(empresaId: string, id: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("peligroEvaluado", id, empresaId);
  await db.peligroEvaluado.delete({ where: { id } });
  rv(empresaId);
}

export async function aprobarTodos(empresaId: string) {
  await requiereEmpresa(empresaId);
  await db.peligroEvaluado.updateMany({ where: { empresaId, estado: "sugerido" }, data: { estado: "aprobado" } });
  await db.tarea.updateMany({ where: { empresaId, estado: "sugerido" }, data: { estado: "aprobado" } });
  rv(empresaId);
}

export async function agregarPeligro(empresaId: string, origen: "tarea" | "zona" | "cargo", refId: string, peligroId: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro(origen, refId, empresaId);
  await requiereBibliotecaVisible("peligroCatalogo", peligroId);
  await agregarPeligroCatalogo(empresaId, origen, refId, peligroId, "aprobado", "manual");
  rv(empresaId);
}

export async function agregarZona(empresaId: string, nombre: string, zonaTipoId?: string) {
  await requiereEmpresa(empresaId);
  const z = await db.zona.create({ data: { empresaId, nombre, zonaTipoId: zonaTipoId || null } });
  if (zonaTipoId) {
    const zt = await db.zonaTipo.findUniqueOrThrow({ where: { id: zonaTipoId }, include: { peligros: true } });
    for (const p of zt.peligros) await agregarPeligroCatalogo(empresaId, "zona", z.id, p.peligroId, "aprobado", "biblioteca");
  }
  rv(empresaId);
}

export async function eliminarZona(empresaId: string, zonaId: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("zona", zonaId, empresaId);
  await db.tarea.updateMany({ where: { zonaId }, data: { zonaId: null } });
  await db.cargo.updateMany({ where: { zonaId }, data: { zonaId: null } });
  await db.zona.delete({ where: { id: zonaId } });
  rv(empresaId);
}

export async function agregarProceso(empresaId: string, nombre: string) {
  await requiereEmpresa(empresaId);
  const n = await db.proceso.count({ where: { empresaId } });
  await db.proceso.create({ data: { empresaId, nombre, orden: n } });
  rv(empresaId);
}

export async function eliminarProceso(empresaId: string, procesoId: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("proceso", procesoId, empresaId);
  await db.tarea.updateMany({ where: { procesoId }, data: { procesoId: null } });
  await db.proceso.delete({ where: { id: procesoId } });
  rv(empresaId);
}

/** Agrega zonas (con sus peligros como sugeridos, para revisión) y procesos típicos del sector que falten. */
export async function completarDesdeSector(empresaId: string) {
  await requiereEmpresa(empresaId);
  const antes = await db.peligroEvaluado.count({ where: { empresaId } });
  const [zonasAntes, procesosAntes] = await Promise.all([db.zona.count({ where: { empresaId } }), db.proceso.count({ where: { empresaId } })]);
  await prepararEstructura(empresaId, "sugerido");
  const [despues, zonas, procesos] = await Promise.all([db.peligroEvaluado.count({ where: { empresaId } }), db.zona.count({ where: { empresaId } }), db.proceso.count({ where: { empresaId } })]);
  rv(empresaId);
  return { zonas: zonas - zonasAntes, procesos: procesos - procesosAntes, peligros: despues - antes };
}

export async function sugerirConIA(empresaId: string, cargoId: string, funciones: string) {
  await requiereEmpresa(empresaId);
  await requiereRegistro("cargo", cargoId, empresaId);
  await db.cargo.update({ where: { id: cargoId }, data: { descripcionFunciones: funciones } });
  try {
    return await sugerirTareasYPeligros(empresaId, cargoId, funciones);
  } catch (e) {
    console.error("sugerirConIA:", e);
    return { error: "No fue posible generar la sugerencia. Agregue tareas desde la biblioteca o intente de nuevo." };
  }
}

/** Guarda la sugerencia elegida como tareas/peligros en estado "sugerido" para revisión. */
export async function aplicarSugerencia(empresaId: string, cargoId: string, s: Sugerencia, fuente: "ia" | "biblioteca") {
  await requiereEmpresa(empresaId);
  const u = await requiereRegistro("cargo", cargoId, empresaId);
  const procesos = await db.proceso.findMany({ where: { empresaId } });
  const zonas = await db.zona.findMany({ where: { empresaId } });
  const buscar = <T extends { nombre: string }>(xs: T[], nombre: string) => xs.find((x) => x.nombre.toLowerCase() === nombre.toLowerCase());
  for (const t of s.tareas) {
    if (t.tareaTipoId && (await db.tareaTipo.findFirst({ where: { id: t.tareaTipoId, ...alcanceBiblioteca(u.consultoraId, empresaId) } }))) {
      await agregarTareaTipo(empresaId, cargoId, t.tareaTipoId, "sugerido");
      continue;
    }
    let proceso = buscar(procesos, t.proceso);
    if (!proceso && t.proceso) { proceso = await db.proceso.create({ data: { empresaId, nombre: t.proceso, orden: procesos.length } }); procesos.push(proceso); }
    let zona = buscar(zonas, t.zona);
    if (!zona && t.zona) { zona = await db.zona.create({ data: { empresaId, nombre: t.zona } }); zonas.push(zona); }
    const tarea = await db.tarea.create({ data: { empresaId, nombre: t.nombre, actividad: t.actividad, procesoId: proceso?.id, zonaId: zona?.id, rutinaria: t.rutinaria, altoRiesgo: t.altoRiesgo, estado: "sugerido", fuente, cargos: { create: { cargoId } } } });
    for (const p of t.peligros) {
      const cat = p.peligroId ? await db.peligroCatalogo.findFirst({ where: { id: p.peligroId, ...alcanceBiblioteca(u.consultoraId, empresaId) } }) : null;
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
export async function guardarPeligroEnBiblioteca(empresaId: string, peligroEvaluadoId: string, alcance: "empresa" | "general" = "empresa") {
  const u = await requiereEmpresa(empresaId);
  await requiereRegistro("peligroEvaluado", peligroEvaluadoId, empresaId);
  const p = await db.peligroEvaluado.findUniqueOrThrow({ where: { id: peligroEvaluadoId }, include: { tarea: true } });
  const cat = await db.peligroCatalogo.create({ data: {
    clasificacion: p.clasificacion, descripcion: p.descripcion, efectosPosibles: p.efectosPosibles ?? "", ndDefault: p.nd, neDefault: p.ne, ncDefault: p.nc,
    controlesFuente: p.controlesFuente, controlesMedio: p.controlesMedio, controlesIndividuo: p.controlesIndividuo,
    medidaEliminacion: p.medidaEliminacion, medidaSustitucion: p.medidaSustitucion, medidaIngenieria: p.medidaIngenieria, medidaAdministrativa: p.medidaAdministrativa, medidaEpp: p.medidaEpp,
    requisitoLegalEspecifico: p.requisitoLegal, validado: true, empresaId: alcance === "empresa" ? empresaId : null, consultoraId: alcance === "empresa" ? null : u.consultoraId,
  } });
  await db.peligroEvaluado.update({ where: { id: p.id }, data: { peligroId: cat.id } });
  if (p.tarea?.tareaTipoId) await db.tareaTipoPeligro.create({ data: { tareaTipoId: p.tarea.tareaTipoId, peligroId: cat.id } }).catch(() => null);
  rv(empresaId);
}

/** Guarda una tarea nueva (con sus peligros) como tarea tipo de la biblioteca. */
export async function guardarTareaEnBiblioteca(empresaId: string, tareaId: string, alcance: "empresa" | "general" = "empresa") {
  const u = await requiereEmpresa(empresaId);
  await requiereRegistro("tarea", tareaId, empresaId);
  const scope = alcance === "empresa" ? empresaId : null, consultoraId = alcance === "empresa" ? null : u.consultoraId;
  const t = await db.tarea.findUniqueOrThrow({ where: { id: tareaId }, include: { peligros: true, zona: { include: { zonaTipo: true } } } });
  const tt = await db.tareaTipo.create({ data: { empresaId: scope, consultoraId, nombre: t.nombre, actividad: t.actividad, rutinaria: t.rutinaria, altoRiesgo: t.altoRiesgo, validado: true, zonasPreferidas: t.zona?.zonaTipo ? [t.zona.zonaTipo.nombre] : [] } });
  for (const p of t.peligros) {
    let pid = p.peligroId;
    if (!pid) {
      const cat = await db.peligroCatalogo.create({ data: { empresaId: scope, consultoraId, clasificacion: p.clasificacion, descripcion: p.descripcion, efectosPosibles: p.efectosPosibles ?? "", ndDefault: p.nd, neDefault: p.ne, ncDefault: p.nc, medidaIngenieria: p.medidaIngenieria, medidaAdministrativa: p.medidaAdministrativa, medidaEpp: p.medidaEpp, validado: true } });
      pid = cat.id;
      await db.peligroEvaluado.update({ where: { id: p.id }, data: { peligroId: pid } });
    }
    await db.tareaTipoPeligro.create({ data: { tareaTipoId: tt.id, peligroId: pid, nd: p.nd, ne: p.ne, nc: p.nc } }).catch(() => null);
  }
  await db.tarea.update({ where: { id: tareaId }, data: { tareaTipoId: tt.id } });
  rv(empresaId);
}

/**
 * Cierra una versión: guarda la matriz completa (filas con nombres de procesos, zonas, tareas y cargos),
 * quién la cerró y un resumen. El MTZ-02 se actualiza y sube de versión.
 */
export async function cerrarVersionMatriz(empresaId: string, motivo: string) {
  const u = await requiereEmpresa(empresaId);
  if (!motivo.trim()) return { error: "Escriba el motivo de la versión." };
  const pendientes = await db.peligroEvaluado.count({ where: { empresaId, estado: "sugerido" } });
  const n = await db.matrizVersion.count({ where: { empresaId } });
  const e = await cargarEmpresa(empresaId);
  const filas = filasMatriz(e);
  const nombre = (await db.usuario.findUnique({ where: { id: u.id }, select: { nombre: true } }))?.nombre ?? null;
  const v = await db.matrizVersion.create({ data: { empresaId, numero: n + 1, motivo: motivo.trim(), cerradoPor: nombre, snapshot: { filas } as object, resumen: resumenFilas(filas) as object } });
  await db.peligroEvaluado.updateMany({ where: { empresaId }, data: { matrizVersionId: v.id } });
  await recalcularEmpresa(empresaId);
  await actualizarDocumentos(empresaId, ["MTZ-02", "MTZ-01", "PRC-10"]);
  rv(empresaId);
  return { ok: true as const, numero: v.numero, pendientes };
}
