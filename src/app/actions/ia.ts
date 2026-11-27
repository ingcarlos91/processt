"use server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requiereEmpresa } from "@/lib/auth/acceso";
import { anonimizar, ErrorIA, generarConIA, personasDe } from "@/lib/ia/motor";
import { informeGestion } from "@/lib/informe-gestion";

// Propuestas de la IA para la consultora (nunca se guardan solas: el formulario las muestra para revisar y editar).

const errorIA = (e: unknown) => ({ error: e instanceof ErrorIA ? e.message : "La IA no respondió. Intente de nuevo." });

const esquemaAccion = z.object({
  causa: z.string().describe("Causa raíz probable del hallazgo, en una frase (por qué ocurre, no qué ocurre)"),
  descripcion: z.string().describe("Acción correctiva concreta y verificable, en una o dos frases, empezando por un verbo en infinitivo"),
  jerarquia: z.enum(["eliminacion", "sustitucion", "ingenieria", "administrativo", "epp"]).describe("Nivel de la jerarquía de controles de la acción"),
});

/** Propone causa raíz y acción correctiva para un hallazgo de inspección o una no conformidad de auditoría (modelo básico). */
export async function sugerirAccionHallazgo(empresaId: string, h: { origen: "inspeccion" | "auditoria"; contexto: string; hallazgo: string; observacion?: string }) {
  const u = await requiereEmpresa(empresaId);
  if (!h.hallazgo.trim()) return { error: "Primero describa el hallazgo." };
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { consultoraId: true, descripcionActividad: true, ciiu: true, nivelEstandares: true } });
  const p = await personasDe(empresaId);
  try {
    const r = await generarConIA({
      consultoraId: e.consultoraId, usuarioId: u.id, tarea: "accion", nivel: "basico", schema: esquemaAccion,
      system: [
        "Eres profesional en Seguridad y Salud en el Trabajo en Colombia y redactas acciones correctivas para el SG-SST (Decreto 1072 de 2015 art. 2.2.4.6.33).",
        "Propones la medida más eficaz posible siguiendo la jerarquía de controles (art. 2.2.4.6.24): primero eliminación, sustitución o ingeniería; administrativas o EPP solo si no hay otra opción razonable.",
        "La acción debe ser concreta, realista para una empresa pequeña y verificable. No inventes normas ni artículos. Responde en español de Colombia.",
      ].join(" "),
      prompt: anonimizar(JSON.stringify({
        empresa: { actividad: e.descripcionActividad, ciiu: e.ciiu, estandares: e.nivelEstandares },
        origen: h.origen === "inspeccion" ? "Inspección de seguridad" : "Auditoría interna del SG-SST",
        contexto: h.contexto, hallazgo: h.hallazgo, observacion: h.observacion ?? "",
      }), p.nombres, p.docs),
    });
    return { ok: true as const, ...r };
  } catch (err) { return errorIA(err); }
}

const esquemaObs = z.object({
  parrafos: z.array(z.string()).describe("De 2 a 4 párrafos cortos: avance logrado, puntos críticos, prioridades del siguiente periodo y recomendación a la gerencia"),
});

/** Borrador de las observaciones de la consultora para el informe de gestión del periodo (modelo básico). */
export async function sugerirObservacionesInforme(empresaId: string, periodo: string) {
  const u = await requiereEmpresa(empresaId);
  const { md, empresa } = await informeGestion(empresaId, periodo);
  // Solo las secciones de resumen (sin tablas de personas) y sin nombres de trabajadores.
  const seccion = (t: string) => { const i = md.indexOf(`## ${t}`); if (i < 0) return ""; const j = md.indexOf("\n## ", i + 3); return md.slice(i, j < 0 ? undefined : j); };
  const base = ["Resumen ejecutivo", "En qué punto vamos", "Qué sigue"].map(seccion).join("\n\n").slice(0, 12000);
  const p = await personasDe(empresaId);
  try {
    const r = await generarConIA({
      consultoraId: empresa.consultoraId, usuarioId: u.id, tarea: "observaciones", nivel: "basico", schema: esquemaObs,
      system: [
        "Eres la consultora en Seguridad y Salud en el Trabajo que presenta su informe de gestión a la gerencia de una empresa cliente en Colombia.",
        "Escribes observaciones claras y profesionales, en primera persona del plural («se avanzó», «recomendamos»), sin tecnicismos innecesarios y sin repetir las tablas.",
        "Destacas lo logrado, lo crítico (estándares, accidentalidad, acciones vencidas) y lo que la gerencia debe decidir o apoyar. No inventes cifras, normas ni hechos que no estén en el informe.",
      ].join(" "),
      prompt: anonimizar(base, p.nombres, p.docs),
    });
    return { ok: true as const, texto: r.parrafos.join("\n\n") };
  } catch (err) { return errorIA(err); }
}
