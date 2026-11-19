"use server";
import { revalidatePath } from "next/cache";
import { generateText, Output } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { iaDisponible, MODELO } from "@/lib/ia";

const rv = () => revalidatePath("/biblioteca", "layout");
const CLASIF = ["Biologico", "Fisico", "Quimico", "Psicosocial", "Biomecanico", "Condiciones de seguridad", "Fenomenos naturales"] as const;

// ───────── Peligros ─────────
export async function crearPeligro(d: { clasificacion: string; descripcion: string; efectosPosibles: string; ndDefault: number; neDefault: number; ncDefault: number }) {
  if (!d.descripcion.trim()) return { error: "La descripción es obligatoria." };
  if (await db.peligroCatalogo.findFirst({ where: { descripcion: d.descripcion.trim() } })) return { error: "Ya existe un peligro con esa descripción." };
  const p = await db.peligroCatalogo.create({ data: { ...d, descripcion: d.descripcion.trim(), validado: true } });
  rv();
  return { id: p.id };
}

export async function eliminarPeligroCatalogo(id: string) {
  const usos = await db.peligroEvaluado.count({ where: { peligroId: id } });
  if (usos) return { error: `No se puede eliminar: se usa en ${usos} matrices. Puede editarlo en su lugar.` };
  await db.peligroCatalogo.delete({ where: { id } });
  rv();
  return { ok: true };
}

// ───────── Tareas tipo ─────────
export async function crearTareaTipo(d: { nombre: string; actividad?: string; rutinaria?: boolean; altoRiesgo?: string | null; zonasPreferidas?: string[]; peligroIds?: string[] }) {
  if (!d.nombre.trim()) return { error: "El nombre es obligatorio." };
  if (await db.tareaTipo.findFirst({ where: { nombre: d.nombre.trim() } })) return { error: "Ya existe una tarea con ese nombre." };
  const t = await db.tareaTipo.create({ data: {
    nombre: d.nombre.trim(), actividad: d.actividad, rutinaria: d.rutinaria ?? true, altoRiesgo: d.altoRiesgo || null, zonasPreferidas: d.zonasPreferidas ?? [], validado: true,
    peligros: { create: (d.peligroIds ?? []).map((peligroId) => ({ peligroId })) },
  } });
  rv();
  return { id: t.id };
}

export async function actualizarTareaTipo(id: string, d: { nombre?: string; actividad?: string; rutinaria?: boolean; altoRiesgo?: string | null; zonasPreferidas?: string[]; validado?: boolean }) {
  await db.tareaTipo.update({ where: { id }, data: d });
  rv();
}

export async function vincularPeligroTarea(tareaTipoId: string, peligroId: string, quitar = false) {
  if (quitar) await db.tareaTipoPeligro.delete({ where: { tareaTipoId_peligroId: { tareaTipoId, peligroId } } });
  else await db.tareaTipoPeligro.upsert({ where: { tareaTipoId_peligroId: { tareaTipoId, peligroId } }, update: {}, create: { tareaTipoId, peligroId } });
  rv();
}

export async function eliminarTareaTipo(id: string) {
  const usos = await db.tarea.count({ where: { tareaTipoId: id } });
  if (usos) return { error: `No se puede eliminar: la usan ${usos} empresas.` };
  await db.tareaTipo.delete({ where: { id } });
  rv();
  return { ok: true };
}

// ───────── Cargos tipo y sectores ─────────
export async function crearCargoTipo(d: { nombre: string; descripcion?: string; sectorTipoId?: string | null; tareaIds?: string[] }) {
  if (!d.nombre.trim()) return { error: "El nombre es obligatorio." };
  const c = await db.cargoTipo.create({ data: { nombre: d.nombre.trim(), descripcion: d.descripcion, sectorTipoId: d.sectorTipoId || null, validado: true, tareas: { create: (d.tareaIds ?? []).map((tareaTipoId) => ({ tareaTipoId })) } } });
  rv();
  return { id: c.id };
}

export async function vincularTareaCargo(cargoTipoId: string, tareaTipoId: string, quitar = false) {
  if (quitar) await db.cargoTipoTarea.delete({ where: { cargoTipoId_tareaTipoId: { cargoTipoId, tareaTipoId } } });
  else await db.cargoTipoTarea.upsert({ where: { cargoTipoId_tareaTipoId: { cargoTipoId, tareaTipoId } }, update: {}, create: { cargoTipoId, tareaTipoId } });
  rv();
}

export async function eliminarCargoTipo(id: string) {
  await db.cargo.updateMany({ where: { cargoTipoId: id }, data: { cargoTipoId: null } });
  await db.cargoTipo.delete({ where: { id } });
  rv();
}

export async function crearSector(d: { nombre: string; descripcion?: string; ciius: string[] }) {
  if (!d.nombre.trim()) return { error: "El nombre es obligatorio." };
  const s = await db.sectorTipo.create({ data: { nombre: d.nombre.trim(), descripcion: d.descripcion, ciius: d.ciius, validado: true } });
  rv();
  return { id: s.id };
}

export async function agregarProcesoSector(sectorTipoId: string, nombre: string) {
  await db.procesoTipo.create({ data: { sectorTipoId, nombre, validado: true } });
  rv();
}

export async function vincularZonaSector(sectorTipoId: string, zonaTipoId: string, quitar = false) {
  if (quitar) await db.sectorZonaTipo.delete({ where: { sectorTipoId_zonaTipoId: { sectorTipoId, zonaTipoId } } });
  else await db.sectorZonaTipo.upsert({ where: { sectorTipoId_zonaTipoId: { sectorTipoId, zonaTipoId } }, update: {}, create: { sectorTipoId, zonaTipoId } });
  rv();
}

// ───────── Catálogos (exámenes, EPP, capacitaciones) ─────────
export async function guardarCatalogoItem(d: { id?: string; tipo: string; nombre: string; descripcion?: string; detalle?: Record<string, unknown>; normas?: string[]; validado?: boolean }) {
  if (!d.nombre.trim()) return { error: "El nombre es obligatorio." };
  const data = { tipo: d.tipo, nombre: d.nombre.trim(), descripcion: d.descripcion, detalle: (d.detalle ?? {}) as object, normas: d.normas ?? [], validado: d.validado ?? true };
  if (d.id) await db.catalogoItem.update({ where: { id: d.id }, data });
  else if (await db.catalogoItem.findUnique({ where: { tipo_nombre: { tipo: d.tipo, nombre: data.nombre } } })) return { error: "Ya existe con ese nombre." };
  else await db.catalogoItem.create({ data });
  rv();
  return { ok: true };
}

export async function eliminarCatalogoItem(id: string) {
  await db.catalogoItem.delete({ where: { id } });
  rv();
}

// ───────── Ampliar con IA ─────────
const esquemaAmpliacion = z.object({
  cargos: z.array(z.object({
    nombre: z.string(), descripcion: z.string(),
    tareas: z.array(z.object({
      nombre: z.string(), tareaTipoId: z.string().nullable().describe("id de una tarea existente de la biblioteca si coincide; null si es nueva"),
      actividad: z.string(), rutinaria: z.boolean(), altoRiesgo: z.enum(["alturas", "confinado", "electrico", "izaje", "caliente"]).nullable(),
      peligros: z.array(z.object({
        peligroId: z.string().nullable().describe("id de un peligro existente si coincide; null si es nuevo"),
        clasificacion: z.enum(CLASIF), descripcion: z.string(), efectos: z.string(),
        nd: z.union([z.literal(2), z.literal(6), z.literal(10)]), ne: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]), nc: z.union([z.literal(10), z.literal(25), z.literal(60), z.literal(100)]),
        medidaIngenieria: z.string().nullable(), medidaAdministrativa: z.string().nullable(),
        epp: z.array(z.string()), examenes: z.array(z.string()), capacitaciones: z.array(z.string()),
      })),
    })),
  })),
});

/** La IA propone cargos, tareas y peligros nuevos para un sector y los guarda en la biblioteca sin validar. */
export async function ampliarSectorConIA(sectorTipoId: string, instrucciones: string, cantidad = 8) {
  if (!iaDisponible()) return { error: "La IA no está configurada: agregue AI_GATEWAY_API_KEY en el archivo .env y reinicie." };
  const sector = await db.sectorTipo.findUniqueOrThrow({ where: { id: sectorTipoId }, include: { cargos: true, procesos: true } });
  const [tareas, peligros, catalogo] = await Promise.all([
    db.tareaTipo.findMany({ select: { id: true, nombre: true } }),
    db.peligroCatalogo.findMany({ select: { id: true, clasificacion: true, descripcion: true } }),
    db.catalogoItem.findMany({ select: { tipo: true, nombre: true } }),
  ]);
  try {
    const { output } = await generateText({
      model: MODELO,
      output: Output.object({ schema: esquemaAmpliacion }),
      system: "Eres especialista en Seguridad y Salud en el Trabajo en Colombia. Usas solo la clasificación y escalas de la GTC 45. Reutilizas tareas y peligros existentes (por id) siempre que coincidan. Para EPP, exámenes y capacitaciones usas preferiblemente los nombres exactos del catálogo. No inventas normas. Respondes en español de Colombia.",
      prompt: [
        `Sector: ${sector.nombre}. ${sector.descripcion ?? ""} CIIU: ${sector.ciius.join(", ")}.`,
        `Cargos que ya existen (no los repitas): ${sector.cargos.map((c) => c.nombre).join("; ") || "ninguno"}.`,
        `Procesos: ${sector.procesos.map((p) => p.nombre).join("; ")}.`,
        `Propón ${cantidad} cargos adicionales típicos de este sector en Colombia, con sus tareas y los peligros de cada tarea. ${instrucciones}`,
        "", "Tareas existentes (id | nombre):", ...tareas.map((t) => `${t.id} | ${t.nombre}`),
        "", "Peligros existentes (id | clasificación | descripción):", ...peligros.map((p) => `${p.id} | ${p.clasificacion} | ${p.descripcion}`),
        "", "Catálogo (tipo | nombre):", ...catalogo.map((c) => `${c.tipo} | ${c.nombre}`),
      ].join("\n"),
    });
    const r = await guardarAmpliacion(sectorTipoId, output);
    rv();
    return r;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

async function guardarAmpliacion(sectorTipoId: string, s: z.infer<typeof esquemaAmpliacion>) {
  const conteo = { cargos: 0, tareas: 0, peligros: 0 };
  for (const c of s.cargos) {
    if (await db.cargoTipo.findFirst({ where: { nombre: c.nombre, sectorTipoId } })) continue;
    const cargo = await db.cargoTipo.create({ data: { nombre: c.nombre, descripcion: c.descripcion, sectorTipoId, validado: false } });
    conteo.cargos++;
    for (const t of c.tareas) {
      let tareaId = t.tareaTipoId && (await db.tareaTipo.findUnique({ where: { id: t.tareaTipoId } }))?.id;
      if (!tareaId) tareaId = (await db.tareaTipo.findFirst({ where: { nombre: t.nombre } }))?.id;
      if (!tareaId) {
        tareaId = (await db.tareaTipo.create({ data: { nombre: t.nombre, actividad: t.actividad, rutinaria: t.rutinaria, altoRiesgo: t.altoRiesgo, validado: false } })).id;
        conteo.tareas++;
        for (const p of t.peligros) {
          let peligroId = p.peligroId && (await db.peligroCatalogo.findUnique({ where: { id: p.peligroId } }))?.id;
          if (!peligroId) peligroId = (await db.peligroCatalogo.findFirst({ where: { descripcion: p.descripcion } }))?.id;
          if (!peligroId) {
            peligroId = (await db.peligroCatalogo.create({ data: {
              clasificacion: p.clasificacion, descripcion: p.descripcion, efectosPosibles: p.efectos, ndDefault: p.nd, neDefault: p.ne, ncDefault: p.nc,
              medidaIngenieria: p.medidaIngenieria, medidaAdministrativa: p.medidaAdministrativa, eppSugerido: p.epp, examenesSugeridos: p.examenes, capacitacionesSugeridas: p.capacitaciones, validado: false,
            } })).id;
            conteo.peligros++;
          }
          await db.tareaTipoPeligro.upsert({ where: { tareaTipoId_peligroId: { tareaTipoId: tareaId, peligroId } }, update: {}, create: { tareaTipoId: tareaId, peligroId, nd: p.nd, ne: p.ne, nc: p.nc } });
        }
      }
      await db.cargoTipoTarea.upsert({ where: { cargoTipoId_tareaTipoId: { cargoTipoId: cargo.id, tareaTipoId: tareaId } }, update: {}, create: { cargoTipoId: cargo.id, tareaTipoId: tareaId } });
    }
  }
  return { ok: true, ...conteo };
}
