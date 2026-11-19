import { generateText, Output } from "ai";
import { z } from "zod";
import { db } from "@/lib/db";
import { MODELO, iaDisponible } from "@/lib/ia";
import { cargarEmpresa, filasMatriz } from "@/lib/generador/contexto";

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

// Causas típicas por forma del accidente (guía para la consultora; se revisan y editan).
const GUIA: Record<string, Partial<Record<"actos" | "condiciones" | "personales" | "trabajo", string[]>>> = {
  "Caída de personas a nivel": { actos: ["Caminar con prisa o sin mirar el piso"], condiciones: ["Piso húmedo, irregular o con obstáculos", "Orden y aseo deficientes"], trabajo: ["Programa de orden y aseo e inspecciones locativas insuficientes"] },
  "Caída de personas a distinto nivel": { actos: ["Trabajo en altura sin sistema de protección contra caídas"], condiciones: ["Escalera o superficie en mal estado o sin barandas"], personales: ["Falta de entrenamiento en trabajo en alturas"], trabajo: ["Permiso de trabajo o procedimiento de alturas no aplicado"] },
  "Caída de objetos": { condiciones: ["Almacenamiento inseguro o estanterías sin anclaje"], trabajo: ["Falta de estándar de almacenamiento"] },
  "Golpe contra objetos": { condiciones: ["Espacios reducidos u objetos que sobresalen"], trabajo: ["Distribución del área de trabajo deficiente"] },
  "Golpe por objetos": { actos: ["Posicionarse en la línea de fuego"], condiciones: ["Materiales sin asegurar"] },
  "Atrapamiento": { actos: ["Intervenir la máquina en movimiento", "Retirar o anular guardas"], condiciones: ["Máquina sin guardas o sin paro de emergencia"], trabajo: ["Falta de procedimiento de bloqueo y etiquetado"] },
  "Corte o pinchazo": { actos: ["Usar herramienta inadecuada o en mal estado", "No usar guantes de protección"], condiciones: ["Herramientas cortantes sin protección"], personales: ["Falta de entrenamiento en uso de herramientas"] },
  "Sobreesfuerzo": { actos: ["Levantar cargas con técnica inadecuada o por encima de la capacidad"], condiciones: ["Ausencia de ayudas mecánicas para manipular cargas"], personales: ["Fatiga o desconocimiento de higiene postural"], trabajo: ["Sin evaluación de manipulación de cargas"] },
  "Contacto con electricidad": { actos: ["Intervenir equipos energizados"], condiciones: ["Cables o tomas en mal estado"], trabajo: ["Mantenimiento eléctrico insuficiente; sin reglas de oro"] },
  "Contacto con sustancias químicas": { actos: ["No usar EPP para químicos"], condiciones: ["Recipientes sin etiquetar o sin ficha de datos de seguridad"], trabajo: ["Comunicación de peligros (SGA) incompleta"] },
  "Proyección de partículas": { actos: ["No usar protección visual"], condiciones: ["Equipo sin pantalla o guarda"] },
  "Accidente de tránsito": { actos: ["Exceso de velocidad o distracción al conducir"], condiciones: ["Vehículo sin mantenimiento"], trabajo: ["Plan de seguridad vial no implementado"] },
};

// Por forma del evento: clasificaciones GTC 45 posibles, raíces de palabras clave y medidas típicas.
const PISTAS: Record<string, { clasif: string[]; claves: string[]; medidas: SugerenciaInvestigacion["acciones"] }> = {
  "Corte o pinchazo": { clasif: ["Condiciones de seguridad", "Biologico"], claves: ["cort", "cuchill", "herramient", "tijer", "filo", "cortopunz", "sierr"], medidas: [{ descripcion: "Instalar o reponer guardas y protecciones en las herramientas y equipos de corte", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Elaborar y socializar el procedimiento seguro de uso de herramientas de corte", jerarquia: "administrativo", tipo: "correctiva" }, { descripcion: "Suministrar y exigir guantes resistentes al corte", jerarquia: "epp", tipo: "preventiva" }] },
  "Atrapamiento": { clasif: ["Condiciones de seguridad"], claves: ["maquin", "movil", "atrapam", "rodill", "banda", "engran"], medidas: [{ descripcion: "Instalar guardas fijas e interbloqueos en partes móviles", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Implementar procedimiento de bloqueo y etiquetado para limpieza y mantenimiento", jerarquia: "administrativo", tipo: "correctiva" }] },
  "Caída de personas a nivel": { clasif: ["Condiciones de seguridad"], claves: ["piso", "superfic", "locativ", "obstacul", "humed", "desniv"], medidas: [{ descripcion: "Corregir superficies irregulares o resbalosas y demarcar áreas de tránsito", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Reforzar el programa de orden y aseo e inspecciones locativas", jerarquia: "administrativo", tipo: "preventiva" }] },
  "Caída de personas a distinto nivel": { clasif: ["Condiciones de seguridad"], claves: ["altur", "escaler", "andami", "techo", "desniv"], medidas: [{ descripcion: "Instalar barandas o sistemas de protección contra caídas", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Aplicar permiso de trabajo y procedimiento de trabajo en alturas", jerarquia: "administrativo", tipo: "correctiva" }] },
  "Caída de objetos": { clasif: ["Condiciones de seguridad"], claves: ["almacen", "estant", "objet", "carg", "apil"], medidas: [{ descripcion: "Anclar estanterías y definir alturas máximas de apilamiento", jerarquia: "ingenieria", tipo: "correctiva" }] },
  "Golpe contra objetos": { clasif: ["Condiciones de seguridad"], claves: ["espaci", "locativ", "objet", "mobili"], medidas: [] },
  "Golpe por objetos": { clasif: ["Condiciones de seguridad"], claves: ["objet", "carg", "herramient", "material"], medidas: [] },
  "Sobreesfuerzo": { clasif: ["Biomecanico"], claves: ["carg", "levant", "manipul", "esfuerz", "postur"], medidas: [{ descripcion: "Proveer ayudas mecánicas para la manipulación de cargas", jerarquia: "ingenieria", tipo: "correctiva" }, { descripcion: "Capacitar en manipulación segura de cargas y pausas activas", jerarquia: "administrativo", tipo: "preventiva" }] },
  "Contacto con electricidad": { clasif: ["Condiciones de seguridad"], claves: ["electr", "energ", "cable", "tension"], medidas: [{ descripcion: "Reparar instalaciones eléctricas y aplicar las reglas de oro antes de intervenir", jerarquia: "ingenieria", tipo: "correctiva" }] },
  "Contacto con sustancias químicas": { clasif: ["Quimico"], claves: ["quimic", "sustanc", "liquid", "vapor", "polv"], medidas: [{ descripcion: "Etiquetar recipientes y disponer de fichas de datos de seguridad (SGA)", jerarquia: "administrativo", tipo: "correctiva" }] },
  "Exposición a temperaturas extremas": { clasif: ["Fisico", "Condiciones de seguridad"], claves: ["temperat", "calor", "frio", "quemad", "caliente"], medidas: [] },
  "Proyección de partículas": { clasif: ["Condiciones de seguridad"], claves: ["particul", "proyecc", "esmeril", "puli"], medidas: [{ descripcion: "Instalar pantallas o guardas y exigir protección visual", jerarquia: "ingenieria", tipo: "correctiva" }] },
  "Mordedura o picadura": { clasif: ["Biologico"], claves: ["animal", "insect", "mordedur", "picadur"], medidas: [] },
  "Accidente de tránsito": { clasif: ["Condiciones de seguridad"], claves: ["transit", "vehicul", "conduc", "vial", "moto"], medidas: [{ descripcion: "Revisar el cumplimiento del plan de seguridad vial para el cargo", jerarquia: "administrativo", tipo: "correctiva" }] },
  "Agresión o violencia": { clasif: ["Psicosocial", "Condiciones de seguridad"], claves: ["public", "atraco", "agresi", "violen", "client"], medidas: [] },
};

const palabras = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9ñ]+/).filter((w) => w.length > 3);

export async function sugerirInvestigacion(eventoId: string): Promise<{ fuente: "ia" | "biblioteca"; sugerencia: SugerenciaInvestigacion }> {
  const ev = await db.evento.findUniqueOrThrow({ where: { id: eventoId } });
  const e = await cargarEmpresa(ev.empresaId);
  const filas = filasMatriz(e);
  const delCargo = filas.filter((f) => !ev.cargo || f.cargos.includes(ev.cargo));
  const relato = [ev.descripcion, ev.tarea, ev.mecanismo, ev.agente, ev.lesion, ev.parteCuerpo].filter(Boolean).join(". ");

  if (iaDisponible()) {
    try {
      const { output } = await generateText({
        model: MODELO,
        output: Output.object({ schema }),
        system: "Eres profesional en Seguridad y Salud en el Trabajo en Colombia. Analizas incidentes y accidentes según la Resolución 1401 de 2007 (causas inmediatas y básicas) y propones controles con la jerarquía del Decreto 1072 de 2015 art. 2.2.4.6.24. No inventes hechos que no estén en el relato; si falta información, formula la causa como hipótesis a verificar. Nunca incluyas diagnósticos médicos. Responde en español de Colombia.",
        prompt: JSON.stringify({
          evento: { tipo: ev.tipo, gravedad: ev.gravedad, relato, cargo: ev.cargo, lugar: ev.lugar },
          matrizDelCargo: delCargo.slice(0, 40).map((f) => ({ id: f.id, peligro: f.descripcion, clasificacion: f.clasificacion, tarea: f.tarea, nivel: f.nivelRiesgo, controles: { ingenieria: f.ingenieria, administrativa: f.administrativa, epp: f.epp } })),
        }),
      });
      const fila = output.peligroMatrizId ? filas.find((f) => f.id === output.peligroMatrizId) : null;
      return { fuente: "ia", sugerencia: { ...output, peligro: fila ? { id: fila.catalogo?.id ?? null, descripcion: fila.descripcion, clasificacion: fila.clasificacion, enMatriz: true } : null } };
    } catch { /* si la IA falla, se usa la sugerencia por reglas */ }
  }

  // Sin IA: la forma del evento orienta la clasificación y las palabras clave del peligro;
  // se busca primero en la matriz del cargo y, si no está, en toda la biblioteca (puede faltar en la matriz).
  const pista = PISTAS[ev.mecanismo ?? ""];
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
  const guia = GUIA[ev.mecanismo ?? ""] ?? {};
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
      lecciones: ev.mecanismo ? `Un evento por "${ev.mecanismo.toLowerCase()}" se puede prevenir aplicando los controles definidos para el cargo. Reporte cualquier condición insegura.` : "",
    },
  };
}
