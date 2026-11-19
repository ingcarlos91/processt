import { generateText, Output } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { MODELO, iaDisponible } from "@/lib/ia";
import { cargarEmpresa, filasMatriz } from "@/lib/generador/contexto";
import { cargarCatalogoAccidentes } from "@/lib/catalogo-accidentes";

const schema = z.object({
  porques: z.array(z.string()).describe("Cadena de 3 a 5 '¿por qué?' desde el hecho hasta la causa raíz"),
  actos: z.array(z.string()).describe("Causas inmediatas: actos subestándar del trabajador"),
  condiciones: z.array(z.string()).describe("Causas inmediatas: condiciones subestándar del ambiente, equipo o lugar"),
  personales: z.array(z.string()).describe("Causas básicas: factores personales (capacidad, conocimiento, motivación, fatiga…)"),
  trabajo: z.array(z.string()).describe("Causas básicas: factores del trabajo (supervisión, ingeniería, compras, mantenimiento, estándares…)"),
  peligroMatrizId: z.string().nullable().describe("id de la fila de la matriz de peligros relacionada, si alguna coincide"),
  acciones: z.array(z.object({
    descripcion: z.string(),
    jerarquia: z.enum(["eliminacion", "sustitucion", "ingenieria", "administrativo", "epp"]),
    tipo: z.enum(["correctiva", "preventiva", "mejora"]),
  })).describe("Medidas de control siguiendo la jerarquía de controles; preferir las de la matriz"),
  lecciones: z.string().describe("Lección aprendida para divulgar a los trabajadores, en una o dos frases"),
});
export type SugerenciaInvestigacion = z.infer<typeof schema> & { peligro?: { id: string | null; descripcion: string; clasificacion: string; enMatriz: boolean } | null };

const palabras = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9ñ]+/).filter((w) => w.length > 3);

export async function sugerirInvestigacion(eventoId: string): Promise<{ fuente: "ia" | "biblioteca"; sugerencia: SugerenciaInvestigacion }> {
  const ev = await db.evento.findUniqueOrThrow({ where: { id: eventoId } });
  const e = await cargarEmpresa(ev.empresaId);
  const filas = filasMatriz(e);
  const delCargo = filas.filter((f) => !ev.cargo || f.cargos.includes(ev.cargo));
  const relato = [ev.descripcion, ev.versionTrabajador && `Versión del trabajador: ${ev.versionTrabajador}`, ev.versionTestigos && `Versión de los testigos: ${ev.versionTestigos}`, ev.sitioExacto && `Sitio exacto: ${ev.sitioExacto}`, ev.tarea, ev.mecanismo, ev.agente, ev.lesion, ev.parteCuerpo].filter(Boolean).join(". ");
  // Biblioteca global (Biblioteca → Accidentes): causas, medidas y palabras clave por forma del evento.
  const forma = (await cargarCatalogoAccidentes()).formas.find((f) => f.nombre === ev.mecanismo);

  if (iaDisponible()) {
    try {
      const { output } = await generateText({
        model: MODELO,
        output: Output.object({ schema }),
        system: "Eres profesional en Seguridad y Salud en el Trabajo en Colombia. Analizas incidentes y accidentes según la Resolución 1401 de 2007 (causas inmediatas y básicas) y propones controles con la jerarquía del Decreto 1072 de 2015 art. 2.2.4.6.24. No inventes hechos que no estén en el relato; si falta información, formula la causa como hipótesis a verificar. Nunca incluyas diagnósticos médicos. Responde en español de Colombia.",
        prompt: JSON.stringify({
          evento: { tipo: ev.tipo, gravedad: ev.gravedad, relato, cargo: ev.cargo, lugar: ev.lugar },
          guiaDeLaBiblioteca: forma ? { forma: forma.nombre, causasTipicas: { actos: forma.actos, condiciones: forma.condiciones, personales: forma.personales, trabajo: forma.trabajo }, medidasTipicas: forma.medidas } : null,
          matrizDelCargo: delCargo.slice(0, 40).map((f) => ({ id: f.id, peligro: f.descripcion, clasificacion: f.clasificacion, tarea: f.tarea, nivel: f.nivelRiesgo, controles: { ingenieria: f.ingenieria, administrativa: f.administrativa, epp: f.epp } })),
        }),
      });
      const fila = output.peligroMatrizId ? filas.find((f) => f.id === output.peligroMatrizId) : null;
      return { fuente: "ia", sugerencia: { ...output, peligro: fila ? { id: fila.catalogo?.id ?? null, descripcion: fila.descripcion, clasificacion: fila.clasificacion, enMatriz: true } : null } };
    } catch { /* si la IA falla, se usa la sugerencia por reglas */ }
  }

  // Sin IA: la forma del evento orienta la clasificación y las palabras clave del peligro;
  // se busca primero en la matriz del cargo y, si no está, en toda la biblioteca (puede faltar en la matriz).
  const pista = forma && forma.clasificaciones.length ? { clasif: forma.clasificaciones, claves: forma.claves, medidas: forma.medidas } : null;
  const pr = new Set(palabras(`${relato} ${pista?.claves.join(" ") ?? ""}`));
  const puntaje = (texto: string, clasificacion: string) => {
    if (pista && !pista.clasif.includes(clasificacion)) return 0;
    const ws = palabras(texto);
    return ws.filter((w) => pr.has(w)).length + (pista ? ws.filter((w) => pista.claves.some((k) => w.startsWith(k))).length * 2 : 0);
  };
  const enMatriz = delCargo.map((f) => ({ f, s: puntaje(`${f.descripcion} ${f.tarea}`, f.clasificacionClave) })).sort((x, y) => y.s - x.s)[0];
  const catalogo = await db.peligroCatalogo.findMany({ where: { OR: [{ empresaId: null }, { empresaId: ev.empresaId }] } });
  const enCatalogo = catalogo.map((c) => ({ c, s: puntaje(`${c.descripcion} ${c.subclasificacion ?? ""}`, c.clasificacion) })).sort((x, y) => y.s - x.s)[0];
  const usarMatriz = enMatriz && enMatriz.s >= 2 && enMatriz.s >= (enCatalogo?.s ?? 0) - 1;
  const fuenteMedidas = usarMatriz
    ? { ingenieria: enMatriz.f.ingenieria, administrativa: enMatriz.f.administrativa, epp: enMatriz.f.epp }
    : enCatalogo && enCatalogo.s >= 2 ? { ingenieria: enCatalogo.c.medidaIngenieria ?? "", administrativa: enCatalogo.c.medidaAdministrativa ?? "", epp: enCatalogo.c.medidaEpp ?? "" } : null;
  const peligro = usarMatriz
    ? { id: enMatriz.f.catalogo?.id ?? null, descripcion: enMatriz.f.descripcion, clasificacion: enMatriz.f.clasificacion, enMatriz: true }
    : enCatalogo && enCatalogo.s >= 2 ? { id: enCatalogo.c.id, descripcion: enCatalogo.c.descripcion, clasificacion: enCatalogo.c.clasificacion, enMatriz: false } : null;
  const guia = forma ?? { actos: [], condiciones: [], personales: [], trabajo: [] };
  const acciones: SugerenciaInvestigacion["acciones"] = [];
  if (fuenteMedidas?.ingenieria) acciones.push({ descripcion: fuenteMedidas.ingenieria, jerarquia: "ingenieria", tipo: "correctiva" });
  if (fuenteMedidas?.administrativa) acciones.push({ descripcion: fuenteMedidas.administrativa, jerarquia: "administrativo", tipo: "correctiva" });
  if (fuenteMedidas?.epp) acciones.push({ descripcion: fuenteMedidas.epp, jerarquia: "epp", tipo: "preventiva" });
  if (!fuenteMedidas) for (const m of pista?.medidas ?? []) acciones.push(m);
  acciones.push({ descripcion: `Socializar la lección aprendida del evento con los trabajadores del cargo ${ev.cargo ?? "afectado"}`, jerarquia: "administrativo", tipo: "preventiva" });
  return {
    fuente: "biblioteca",
    sugerencia: {
      porques: [],
      actos: guia.actos ?? [], condiciones: guia.condiciones ?? [], personales: guia.personales ?? [], trabajo: guia.trabajo ?? [],
      peligroMatrizId: usarMatriz ? enMatriz.f.id : null,
      peligro,
      acciones,
      lecciones: forma?.leccion || (ev.mecanismo ? `Un evento por "${ev.mecanismo.toLowerCase()}" se puede prevenir aplicando los controles definidos para el cargo. Reporte cualquier condición insegura.` : ""),
    },
  };
}
