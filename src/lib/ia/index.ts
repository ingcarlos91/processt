import { generateText, Output } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";

export const MODELO = process.env.IA_MODELO ?? "anthropic/claude-sonnet-5-5";
export const iaDisponible = () => !!(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

const CLASIF = ["Biologico", "Fisico", "Quimico", "Psicosocial", "Biomecanico", "Condiciones de seguridad", "Fenomenos naturales"] as const;

const schema = z.object({
  tareas: z.array(z.object({
    nombre: z.string().describe("Nombre de la tarea, verbo en infinitivo o sustantivo de acción"),
    tareaTipoId: z.string().nullable().describe("id de la tarea de la biblioteca si coincide; null si es nueva"),
    proceso: z.string().describe("Proceso de la empresa al que pertenece (usar uno de los existentes si aplica)"),
    zona: z.string().describe("Zona o lugar donde se ejecuta (usar una de las existentes si aplica)"),
    actividad: z.string(),
    rutinaria: z.boolean(),
    altoRiesgo: z.enum(["alturas", "confinado", "electrico", "izaje", "caliente"]).nullable(),
    peligros: z.array(z.object({
      peligroId: z.string().nullable().describe("id del peligro del catálogo si coincide; null si es nuevo"),
      clasificacion: z.enum(CLASIF),
      descripcion: z.string(),
      efectos: z.string(),
      nd: z.union([z.literal(0), z.literal(2), z.literal(6), z.literal(10)]),
      ne: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
      nc: z.union([z.literal(10), z.literal(25), z.literal(60), z.literal(100)]),
      medidaIngenieria: z.string().nullable(),
      medidaAdministrativa: z.string().nullable(),
      medidaEpp: z.string().nullable(),
    })),
  })),
});
export type Sugerencia = z.infer<typeof schema>;

export async function sugerirTareasYPeligros(empresaId: string, cargoId: string, funciones: string): Promise<{ fuente: "ia" | "biblioteca"; sugerencia: Sugerencia }> {
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, include: { procesos: true, zonas: true, sectorTipo: true } });
  const cargo = await db.cargo.findUniqueOrThrow({ where: { id: cargoId } });
  const tareasTipo = await db.tareaTipo.findMany({ include: { peligros: { include: { peligro: true } } } });
  const catalogo = await db.peligroCatalogo.findMany();

  if (!iaDisponible()) return { fuente: "biblioteca", sugerencia: porPalabrasClave(funciones, tareasTipo, e.procesos[0]?.nombre ?? "", e.zonas[0]?.nombre ?? "") };

  const { output } = await generateText({
    model: MODELO,
    output: Output.object({ schema }),
    system: [
      "Eres un profesional especialista en Seguridad y Salud en el Trabajo en Colombia.",
      "Identificas peligros y valoras riesgos exclusivamente con la metodología de la GTC 45 (2012): clasificación de peligros del Anexo A, escalas ND (0,2,6,10), NE (1-4), NC (10,25,60,100).",
      "Siempre prefieres tareas y peligros de la biblioteca recibida; usa su id cuando coincidan. Solo propones nuevos cuando nada de la biblioteca aplica.",
      "No inventes normas ni artículos. No incluyas peligros de lugar (sismo, incendio, locativo general) porque se gestionan por zona.",
      "Responde en español de Colombia.",
    ].join(" "),
    prompt: [
      `Empresa: ${e.razonSocial}. Actividad (CIIU ${e.ciiu}): ${e.descripcionActividad}. Sector: ${e.sectorTipo?.nombre ?? "no definido"}.`,
      `Procesos existentes: ${e.procesos.map((p) => p.nombre).join("; ") || "ninguno"}.`,
      `Zonas existentes: ${e.zonas.map((z) => z.nombre).join("; ") || "ninguna"}.`,
      `Cargo: ${cargo.nombre} (${cargo.nPersonas} personas).`,
      `Funciones descritas por la consultora: ${funciones}`,
      "",
      "Biblioteca de tareas (id | nombre | actividad):",
      ...tareasTipo.map((t) => `${t.id} | ${t.nombre} | ${t.actividad ?? ""}`),
      "",
      "Catálogo de peligros (id | clasificación | descripción):",
      ...catalogo.map((p) => `${p.id} | ${p.clasificacion} | ${p.descripcion}`),
      "",
      "Devuelve las tareas que realiza este cargo y, para cada una, sus peligros con valoración GTC 45 sugerida.",
    ].join("\n"),
  });
  return { fuente: "ia", sugerencia: output };
}

function norm(s: string) { return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }

/** Respaldo sin IA: busca tareas de la biblioteca cuyas palabras aparezcan en las funciones. */
function porPalabrasClave(
  funciones: string,
  tareasTipo: { id: string; nombre: string; actividad: string | null; rutinaria: boolean; altoRiesgo: string | null; peligros: { nd: number | null; ne: number | null; nc: number | null; peligro: { id: string; clasificacion: string; descripcion: string; efectosPosibles: string; ndDefault: number; neDefault: number; ncDefault: number; medidaIngenieria: string | null; medidaAdministrativa: string | null; medidaEpp: string | null } }[] }[],
  proceso: string, zona: string,
): Sugerencia {
  const f = norm(funciones);
  const stop = new Set(["para", "con", "del", "los", "las", "una", "por", "que", "otros", "segun", "entre"]);
  const elegidas = tareasTipo
    .map((t) => {
      const palabras = norm(t.nombre).split(/[^a-z]+/).filter((w) => w.length > 4 && !stop.has(w));
      const raices = palabras.map((w) => w.slice(0, Math.max(5, w.length - 3)));
      const s = raices.filter((r) => f.includes(r)).length;
      return { t, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map((x) => x.t);
  return {
    tareas: elegidas.map((t) => ({
      nombre: t.nombre, tareaTipoId: t.id, proceso, zona, actividad: t.actividad ?? "", rutinaria: t.rutinaria,
      altoRiesgo: (t.altoRiesgo as Sugerencia["tareas"][number]["altoRiesgo"]) ?? null,
      peligros: t.peligros.map((tp) => ({
        peligroId: tp.peligro.id, clasificacion: tp.peligro.clasificacion as (typeof CLASIF)[number], descripcion: tp.peligro.descripcion, efectos: tp.peligro.efectosPosibles,
        nd: (tp.nd ?? tp.peligro.ndDefault) as 0 | 2 | 6 | 10, ne: (tp.ne ?? tp.peligro.neDefault) as 1 | 2 | 3 | 4, nc: (tp.nc ?? tp.peligro.ncDefault) as 10 | 25 | 60 | 100,
        medidaIngenieria: tp.peligro.medidaIngenieria, medidaAdministrativa: tp.peligro.medidaAdministrativa, medidaEpp: tp.peligro.medidaEpp,
      })),
    })),
  };
}
