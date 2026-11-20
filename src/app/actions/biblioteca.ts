"use server";
import { requiereSesion, requiereUsuario } from "@/lib/auth/sesion";
import { alcanceBiblioteca, bibliotecaPropia, requiereBibliotecaVisible, requiereEmpresa } from "@/lib/auth/acceso";
import { revalidatePath } from "next/cache";
import { generateText, Output } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { iaDisponible, MODELO } from "@/lib/ia";

const rv = (empresaId?: string | null) => { revalidatePath("/biblioteca", "layout"); if (empresaId) revalidatePath(`/empresas/${empresaId}`, "layout"); };
const CLASIF = ["Biologico", "Fisico", "Quimico", "Psicosocial", "Biomecanico", "Condiciones de seguridad", "Fenomenos naturales"] as const;

/**
 * Nivel donde se crea un elemento nuevo: la biblioteca de una empresa (si se indica y es de la consultora) o la
 * biblioteca propia de la consultora. La base PROCESST no se modifica desde aquí.
 */
async function nivelNuevo(empresaId?: string | null) {
  const u = empresaId ? await requiereEmpresa(empresaId) : await requiereUsuario();
  return { u, data: empresaId ? { empresaId, consultoraId: null } : { empresaId: null, consultoraId: u.consultoraId } };
}
/** Para no repetir nombres: lo que ya ve la consultora en ese nivel (base, suyo y de la empresa). */
const visible = (consultoraId: string, empresaId?: string | null) => alcanceBiblioteca(consultoraId, empresaId);

// ───────── Peligros ─────────
export async function crearPeligro(d: { clasificacion: string; descripcion: string; efectosPosibles: string; ndDefault: number; neDefault: number; ncDefault: number; empresaId?: string | null }) {
  const { u, data } = await nivelNuevo(d.empresaId);
  if (!d.descripcion.trim()) return { error: "La descripción es obligatoria." };
  if (await db.peligroCatalogo.findFirst({ where: { descripcion: d.descripcion.trim(), ...visible(u.consultoraId, d.empresaId) } })) return { error: "Ya existe un peligro con esa descripción." };
  const p = await db.peligroCatalogo.create({ data: { ...d, ...data, descripcion: d.descripcion.trim(), validado: true } });
  rv(d.empresaId);
  return { id: p.id };
}

export async function eliminarPeligroCatalogo(id: string) {
  const v = await bibliotecaPropia("peligroCatalogo", id);
  if ("error" in v) return v;
  const { empresaId } = v;
  const usos = await db.peligroEvaluado.count({ where: { peligroId: id } });
  if (usos) return { error: `No se puede eliminar: se usa en ${usos} matrices. Puede editarlo en su lugar.` };
  await db.peligroCatalogo.delete({ where: { id } });
  rv(empresaId);
  return { ok: true };
}

// ───────── Tareas tipo ─────────
export async function crearTareaTipo(d: { nombre: string; actividad?: string; rutinaria?: boolean; altoRiesgo?: string | null; zonasPreferidas?: string[]; peligroIds?: string[]; empresaId?: string | null }) {
  const { u, data } = await nivelNuevo(d.empresaId);
  if (!d.nombre.trim()) return { error: "El nombre es obligatorio." };
  for (const pid of d.peligroIds ?? []) await requiereBibliotecaVisible("peligroCatalogo", pid);
  if (await db.tareaTipo.findFirst({ where: { nombre: d.nombre.trim(), ...visible(u.consultoraId, d.empresaId) } })) return { error: "Ya existe una tarea con ese nombre." };
  const t = await db.tareaTipo.create({ data: {
    ...data, nombre: d.nombre.trim(), actividad: d.actividad, rutinaria: d.rutinaria ?? true, altoRiesgo: d.altoRiesgo || null, zonasPreferidas: d.zonasPreferidas ?? [], validado: true,
    peligros: { create: (d.peligroIds ?? []).map((peligroId) => ({ peligroId })) },
  } });
  rv(d.empresaId);
  return { id: t.id };
}

export async function actualizarTareaTipo(id: string, d: { nombre?: string; actividad?: string; rutinaria?: boolean; altoRiesgo?: string | null; zonasPreferidas?: string[]; validado?: boolean }) {
  const v = await bibliotecaPropia("tareaTipo", id);
  if ("error" in v) return v;
  const { empresaId } = v;
  await db.tareaTipo.update({ where: { id }, data: d });
  rv(empresaId);
}

export async function vincularPeligroTarea(tareaTipoId: string, peligroId: string, quitar = false) {
  const v = await bibliotecaPropia("tareaTipo", tareaTipoId);
  if ("error" in v) return v;
  const { empresaId } = v;
  await requiereBibliotecaVisible("peligroCatalogo", peligroId);
  if (quitar) await db.tareaTipoPeligro.delete({ where: { tareaTipoId_peligroId: { tareaTipoId, peligroId } } });
  else await db.tareaTipoPeligro.upsert({ where: { tareaTipoId_peligroId: { tareaTipoId, peligroId } }, update: {}, create: { tareaTipoId, peligroId } });
  rv(empresaId);
}

export async function eliminarTareaTipo(id: string) {
  const v = await bibliotecaPropia("tareaTipo", id);
  if ("error" in v) return v;
  const { empresaId } = v;
  const usos = await db.tarea.count({ where: { tareaTipoId: id } });
  if (usos) return { error: `No se puede eliminar: la usan ${usos} empresas.` };
  await db.tareaTipo.delete({ where: { id } });
  rv(empresaId);
  return { ok: true };
}

// ───────── Cargos tipo y sectores ─────────
export async function crearCargoTipo(d: { nombre: string; descripcion?: string; sectorTipoId?: string | null; tareaIds?: string[]; empresaId?: string | null }) {
  const { data } = await nivelNuevo(d.empresaId);
  if (!d.nombre.trim()) return { error: "El nombre es obligatorio." };
  for (const tid of d.tareaIds ?? []) await requiereBibliotecaVisible("tareaTipo", tid);
  const c = await db.cargoTipo.create({ data: { ...data, nombre: d.nombre.trim(), descripcion: d.descripcion, sectorTipoId: d.sectorTipoId || null, validado: true, tareas: { create: (d.tareaIds ?? []).map((tareaTipoId) => ({ tareaTipoId })) } } });
  rv(d.empresaId);
  return { id: c.id };
}

export async function vincularTareaCargo(cargoTipoId: string, tareaTipoId: string, quitar = false) {
  const v = await bibliotecaPropia("cargoTipo", cargoTipoId);
  if ("error" in v) return v;
  const { empresaId } = v;
  await requiereBibliotecaVisible("tareaTipo", tareaTipoId);
  if (quitar) await db.cargoTipoTarea.delete({ where: { cargoTipoId_tareaTipoId: { cargoTipoId, tareaTipoId } } });
  else await db.cargoTipoTarea.upsert({ where: { cargoTipoId_tareaTipoId: { cargoTipoId, tareaTipoId } }, update: {}, create: { cargoTipoId, tareaTipoId } });
  rv(empresaId);
}

export async function eliminarCargoTipo(id: string) {
  const v = await bibliotecaPropia("cargoTipo", id);
  if ("error" in v) return v;
  const { empresaId } = v;
  await db.cargo.updateMany({ where: { cargoTipoId: id }, data: { cargoTipoId: null } });
  await db.cargoTipo.delete({ where: { id } });
  rv(empresaId);
}

// Los sectores (con sus procesos y zonas) son de la base común: solo el super administrador los modifica.
async function soloSuperadmin() {
  const u = await requiereSesion();
  return u.rol === "superadmin" ? null : { error: "Los sectores son de la base común de PROCESST: sus procesos y zonas solo los cambia el administrador de PROCESST. Puede crear cargos, tareas y peligros propios." };
}
export async function crearSector(d: { nombre: string; descripcion?: string; ciius: string[] }) {
  const no = await soloSuperadmin(); if (no) return no;
  if (!d.nombre.trim()) return { error: "El nombre es obligatorio." };
  const s = await db.sectorTipo.create({ data: { nombre: d.nombre.trim(), descripcion: d.descripcion, ciius: d.ciius, validado: true } });
  rv();
  return { id: s.id };
}

export async function agregarProcesoSector(sectorTipoId: string, nombre: string) {
  const no = await soloSuperadmin(); if (no) return no;
  await db.procesoTipo.create({ data: { sectorTipoId, nombre, validado: true } });
  rv();
}

export async function vincularZonaSector(sectorTipoId: string, zonaTipoId: string, quitar = false) {
  const no = await soloSuperadmin(); if (no) return no;
  if (quitar) await db.sectorZonaTipo.delete({ where: { sectorTipoId_zonaTipoId: { sectorTipoId, zonaTipoId } } });
  else await db.sectorZonaTipo.upsert({ where: { sectorTipoId_zonaTipoId: { sectorTipoId, zonaTipoId } }, update: {}, create: { sectorTipoId, zonaTipoId } });
  rv();
}

// ───────── Catálogos (exámenes, EPP, capacitaciones) ─────────
export async function guardarCatalogoItem(d: { id?: string; tipo: string; nombre: string; descripcion?: string; detalle?: Record<string, unknown>; normas?: string[]; validado?: boolean; empresaId?: string | null }) {
  if (!d.nombre.trim()) return { error: "El nombre es obligatorio." };
  const campos = { tipo: d.tipo, nombre: d.nombre.trim(), descripcion: d.descripcion, detalle: (d.detalle ?? {}) as object, normas: d.normas ?? [], validado: d.validado ?? true };
  if (d.id) {
    const v = await bibliotecaPropia("catalogoItem", d.id);
    if ("error" in v) return v;
    const { empresaId } = v;
    await db.catalogoItem.update({ where: { id: d.id }, data: campos });
    rv(empresaId);
    return { ok: true };
  }
  const { u, data } = await nivelNuevo(d.empresaId);
  if (await db.catalogoItem.findFirst({ where: { tipo: d.tipo, nombre: campos.nombre, ...visible(u.consultoraId, d.empresaId) } })) return { error: "Ya existe con ese nombre." };
  await db.catalogoItem.create({ data: { ...campos, ...data } });
  rv(d.empresaId);
  return { ok: true };
}

export async function eliminarCatalogoItem(id: string) {
  const v = await bibliotecaPropia("catalogoItem", id);
  if ("error" in v) return v;
  const { empresaId } = v;
  await db.catalogoItem.delete({ where: { id } });
  rv(empresaId);
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
  const u = await requiereUsuario();
  if (!iaDisponible()) return { error: "La IA no está configurada: agregue AI_GATEWAY_API_KEY en el archivo .env y reinicie." };
  const sector = await db.sectorTipo.findUniqueOrThrow({ where: { id: sectorTipoId }, include: { cargos: { where: alcanceBiblioteca(u.consultoraId) }, procesos: true } });
  const [tareas, peligros, catalogo] = await Promise.all([
    db.tareaTipo.findMany({ where: alcanceBiblioteca(u.consultoraId), select: { id: true, nombre: true } }),
    db.peligroCatalogo.findMany({ where: alcanceBiblioteca(u.consultoraId), select: { id: true, clasificacion: true, descripcion: true } }),
    db.catalogoItem.findMany({ where: alcanceBiblioteca(u.consultoraId), select: { tipo: true, nombre: true } }),
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
    const r = await guardarAmpliacion(sectorTipoId, output, u.consultoraId);
    rv();
    return r;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

/** Pasa un elemento de la biblioteca de una empresa a la biblioteca de la consultora (queda para todas sus empresas). */
export async function publicarEnGeneral(tipo: "peligro" | "tarea" | "cargo" | "catalogo", id: string) {
  const modelo = ({ peligro: "peligroCatalogo", tarea: "tareaTipo", cargo: "cargoTipo", catalogo: "catalogoItem" } as const)[tipo];
  const v = await bibliotecaPropia(modelo, id);
  if ("error" in v) return v;
  const { consultoraId, empresaId } = v;
  if (!empresaId) return { error: "Ya está en la biblioteca de la consultora." };
  const general = alcanceBiblioteca(consultoraId);
  const aConsultora = { empresaId: null, consultoraId };
  if (tipo === "peligro") {
    const p = await db.peligroCatalogo.findUniqueOrThrow({ where: { id } });
    if (await db.peligroCatalogo.findFirst({ where: { descripcion: p.descripcion, ...general } })) return { error: "Ya existe un peligro general con esa descripción." };
    await db.peligroCatalogo.update({ where: { id }, data: aConsultora });
  } else if (tipo === "tarea") {
    const t = await db.tareaTipo.findUniqueOrThrow({ where: { id }, include: { peligros: { include: { peligro: true } } } });
    if (await db.tareaTipo.findFirst({ where: { nombre: t.nombre, ...general } })) return { error: "Ya existe una tarea general con ese nombre." };
    if (t.peligros.some((x) => x.peligro.empresaId)) return { error: "Primero publique los peligros propios de esta tarea." };
    await db.tareaTipo.update({ where: { id }, data: aConsultora });
  } else if (tipo === "cargo") {
    const c = await db.cargoTipo.findUniqueOrThrow({ where: { id }, include: { tareas: { include: { tareaTipo: true } } } });
    if (c.tareas.some((x) => x.tareaTipo.empresaId)) return { error: "Primero publique las tareas propias de este cargo." };
    await db.cargoTipo.update({ where: { id }, data: aConsultora });
  } else {
    const i = await db.catalogoItem.findUniqueOrThrow({ where: { id } });
    if (await db.catalogoItem.findFirst({ where: { tipo: i.tipo, nombre: i.nombre, ...general } })) return { error: "Ya existe en el catálogo general." };
    await db.catalogoItem.update({ where: { id }, data: aConsultora });
  }
  rv(empresaId);
  return { ok: true };
}

async function guardarAmpliacion(sectorTipoId: string, s: z.infer<typeof esquemaAmpliacion>, consultoraId: string) {
  const vis = alcanceBiblioteca(consultoraId);
  const conteo = { cargos: 0, tareas: 0, peligros: 0 };
  for (const c of s.cargos) {
    if (await db.cargoTipo.findFirst({ where: { nombre: c.nombre, sectorTipoId, ...vis } })) continue;
    const cargo = await db.cargoTipo.create({ data: { consultoraId, nombre: c.nombre, descripcion: c.descripcion, sectorTipoId, validado: false } });
    conteo.cargos++;
    for (const t of c.tareas) {
      let tareaId = t.tareaTipoId && (await db.tareaTipo.findFirst({ where: { id: t.tareaTipoId, ...vis } }))?.id;
      if (!tareaId) tareaId = (await db.tareaTipo.findFirst({ where: { nombre: t.nombre, ...vis } }))?.id;
      if (!tareaId) {
        tareaId = (await db.tareaTipo.create({ data: { consultoraId, nombre: t.nombre, actividad: t.actividad, rutinaria: t.rutinaria, altoRiesgo: t.altoRiesgo, validado: false } })).id;
        conteo.tareas++;
        for (const p of t.peligros) {
          let peligroId = p.peligroId && (await db.peligroCatalogo.findFirst({ where: { id: p.peligroId, ...vis } }))?.id;
          if (!peligroId) peligroId = (await db.peligroCatalogo.findFirst({ where: { descripcion: p.descripcion, ...vis } }))?.id;
          if (!peligroId) {
            peligroId = (await db.peligroCatalogo.create({ data: {
              consultoraId, clasificacion: p.clasificacion, descripcion: p.descripcion, efectosPosibles: p.efectos, ndDefault: p.nd, neDefault: p.ne, ncDefault: p.nc,
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
