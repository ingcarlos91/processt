import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requiereUsuario, usuarioActual } from "./sesion";

/**
 * Aislamiento entre consultoras: cada consulta o acción sobre una empresa o un registro verifica que pertenezca a la
 * consultora del usuario. Las acciones del servidor se pueden invocar con cualquier id, por eso la verificación es
 * explícita y no depende de la ruta.
 */

const NO_EXISTE = "No encontrado o sin acceso.";

/** Consultora dueña de una empresa (null si no existe). */
async function consultoraDeEmpresa(empresaId: string) {
  if (!empresaId) return null;
  return (await db.empresa.findUnique({ where: { id: empresaId }, select: { consultoraId: true } }))?.consultoraId ?? null;
}

/** Server actions: el usuario debe pertenecer a la consultora de la empresa. */
export async function requiereEmpresa(empresaId: string) {
  const u = await requiereUsuario();
  if ((await consultoraDeEmpresa(empresaId)) !== u.consultoraId) throw new Error(NO_EXISTE);
  return u;
}

/** Páginas y rutas: 404 si la empresa no es de la consultora del usuario. */
export const empresaVisible = cache(async (empresaId: string) => {
  const u = await usuarioActual();
  if ((await consultoraDeEmpresa(empresaId)) !== u.consultoraId) notFound();
  return u;
});

/** Rutas API: true si la empresa es de la consultora del usuario. */
export async function puedeVerEmpresa(empresaId: string, consultoraId: string) {
  return (await consultoraDeEmpresa(empresaId)) === consultoraId;
}

// Modelos con empresaId propio.
const DIRECTOS = [
  "sede", "zona", "proceso", "cargo", "tarea", "matrizVersion", "peligroEvaluado", "evaluacion", "documento", "actividadPlan",
  "evidencia", "evento", "accion", "trabajador", "capacitacion", "inspeccion", "visita", "auditoria", "diagnostico", "trabajadoresMes", "comite",
] as const;
// Modelos hijos: relación con el registro que tiene la empresa.
const HIJOS = {
  evaluacionItem: "evaluacion", planMejoramientoItem: "evaluacion", documentoSeccion: "documento",
  examenMedico: "trabajador", entregaEpp: "trabajador", comiteMiembro: "comite", acta: "comite",
} as const;
export type ModeloEmpresa = (typeof DIRECTOS)[number] | keyof typeof HIJOS;

const CAMPOS = { empresaId: true, empresa: { select: { consultoraId: true } } } as const;
type Dueno = { empresaId: string; empresa: { consultoraId: string } } | null;

/** Empresa y consultora de un registro de empresa. */
async function duenoDe(modelo: ModeloEmpresa, id: string): Promise<Dueno> {
  if (!id) return null;
  // Acceso dinámico al delegado de Prisma: el nombre del modelo viene de las listas cerradas de arriba.
  const delegado = (db as unknown as Record<string, { findUnique: (a: object) => Promise<Record<string, unknown> | null> }>)[modelo];
  if (modelo in HIJOS) {
    const padre = HIJOS[modelo as keyof typeof HIJOS];
    const r = await delegado.findUnique({ where: { id }, select: { [padre]: { select: CAMPOS } } });
    return (r?.[padre] as Dueno) ?? null;
  }
  return (await delegado.findUnique({ where: { id }, select: CAMPOS })) as Dueno;
}

/**
 * Server actions: el registro debe ser de una empresa de la consultora del usuario y, si se indica, de esa empresa.
 * Devuelve el usuario y el empresaId real del registro.
 */
export async function requiereRegistro(modelo: ModeloEmpresa, id: string, empresaId?: string) {
  const u = await requiereUsuario();
  const d = await duenoDe(modelo, id);
  if (!d || d.empresa.consultoraId !== u.consultoraId || (empresaId && d.empresaId !== empresaId)) throw new Error(NO_EXISTE);
  return { ...u, empresaId: d.empresaId };
}

/** Páginas: 404 si el registro no es de esa empresa (la empresa ya se verificó con empresaVisible). */
export async function registroDeEmpresa(modelo: ModeloEmpresa, id: string, empresaId: string) {
  const d = await duenoDe(modelo, id);
  if (!d || d.empresaId !== empresaId) notFound();
}

// ───────── Biblioteca (base PROCESST, consultora, empresa) ─────────

export { alcanceBiblioteca } from "@/lib/alcance-biblioteca";

type ModeloBiblioteca = "peligroCatalogo" | "tareaTipo" | "cargoTipo" | "catalogoItem";

export const ES_BASE = "Es de la base PROCESST (común a todas las consultoras) y no se puede modificar aquí. Cree uno propio con los ajustes que necesite.";

/**
 * Server actions que modifican la biblioteca: solo lo propio de la consultora o de sus empresas. La base PROCESST es de
 * solo lectura para las consultoras. Devuelve { error } (para mostrarlo en pantalla) en lugar de lanzar.
 */
export async function bibliotecaPropia(modelo: ModeloBiblioteca, id: string) {
  const u = await requiereUsuario();
  const delegado = (db as unknown as Record<string, { findUnique: (a: object) => Promise<{ consultoraId: string | null; empresaId: string | null } | null> }>)[modelo];
  const r = await delegado.findUnique({ where: { id }, select: { consultoraId: true, empresaId: true } });
  if (!r) return { error: NO_EXISTE };
  if (!r.consultoraId && !r.empresaId) return { error: ES_BASE };
  if (r.empresaId ? (await consultoraDeEmpresa(r.empresaId)) !== u.consultoraId : r.consultoraId !== u.consultoraId) return { error: NO_EXISTE };
  return { ...u, empresaId: r.empresaId };
}

/** Server actions: un elemento de la biblioteca que la consultora puede usar (base, suyo o de una de sus empresas). */
export async function requiereBibliotecaVisible(modelo: ModeloBiblioteca, id: string) {
  const u = await requiereUsuario();
  const delegado = (db as unknown as Record<string, { findUnique: (a: object) => Promise<{ consultoraId: string | null; empresaId: string | null } | null> }>)[modelo];
  const r = await delegado.findUnique({ where: { id }, select: { consultoraId: true, empresaId: true } });
  if (!r) throw new Error(NO_EXISTE);
  if (r.empresaId ? (await consultoraDeEmpresa(r.empresaId)) !== u.consultoraId : r.consultoraId && r.consultoraId !== u.consultoraId) throw new Error(NO_EXISTE);
  return u;
}
