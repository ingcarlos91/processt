import { db } from "@/lib/db";
import { construirContexto } from "@/lib/generador/contexto";
import { composicionCopasst, contexto as contextoReglas } from "./motor";
import { explicarCondiciones } from "./condiciones-ui";
import { disparadoresDesdeMatriz } from "./matriz-disparadores";
import type { Condicion } from "./condicion";
import { explicarConteo, explicarNivel, explicarClaseRiesgo } from "./explicar";

export type Decision = { que: string; porque: string; normas?: string[]; pasos?: string[] };
export type GrupoDecisiones = { id: string; titulo: string; resumen: string; items: Decision[] };

const COMITE: Record<string, string> = { COPASST: "COPASST", VIGIA: "Vigía de SST", CCL: "Comité de Convivencia Laboral", BRIGADA: "Brigada de emergencias" };

/** Reúne todas las decisiones que el sistema tomó para una empresa, explicadas para cualquier persona. */
export async function construirDecisiones(empresaId: string): Promise<GrupoDecisiones[]> {
  const ctx = await construirContexto(empresaId);
  const rr = ctx._reglas;
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, include: { sectorTipo: true, actividades: { select: { origen: true, anio: true } } } });
  const sug = e.ciiu ? (await db.ciiuClaseRiesgo.findUnique({ where: { codigo: e.ciiu } }))?.claseRiesgo : null;
  const cop = composicionCopasst(rr.trabajadores);
  const resp = (e.responsableSst ?? {}) as { perfil?: string; licencia?: string; curso50h?: boolean };
  const grupos: GrupoDecisiones[] = [];

  grupos.push({
    id: "clasificacion", titulo: "1. Tamaño, riesgo y estándares", resumen: `${rr.trabajadores} trabajadores · riesgo ${ctx.empresa.claseRiesgoRomano} · ${rr.nivel} estándares`,
    items: [
      { que: `Se cuentan ${rr.trabajadores} trabajadores`, porque: explicarConteo(e) },
      { que: `Clase de riesgo ${ctx.empresa.claseRiesgoRomano}`, porque: explicarClaseRiesgo(e, sug), normas: ["Decreto 768/2022 (deroga el Decreto 1607/2002)"] },
      { que: `Aplican ${rr.nivel} estándares mínimos`, porque: explicarNivel(rr.nivel, rr.trabajadores, e.claseRiesgo) + ` Por eso la evaluación tiene ${rr.estandares.length} ítems.`, normas: [rr.nivelNormaRef] },
      {
        que: `Perfil exigido para quien diseña el SG-SST`,
        porque: `Para nivel ${rr.nivel} la norma exige ${rr.nivel === 7 ? "como mínimo un técnico en SST" : rr.nivel === 21 ? "como mínimo un tecnólogo en SST" : "un profesional en SST o con posgrado en SST"}, con licencia vigente y el curso virtual de 50 horas. Registrado: ${resp.perfil ?? "sin registrar"}, licencia ${resp.licencia ? "sí" : "no"}, curso de 50 horas ${resp.curso50h ? "sí" : "no"}.${rr.advertencias.length ? " Advertencias: " + rr.advertencias.join(" ") : ""}`,
        normas: ["Res. 0312/2019 arts. 4, 10 y 17", "Decreto 1072/2015 art. 2.2.4.6.35"],
      },
    ],
  });

  grupos.push({
    id: "comites", titulo: "2. Comités", resumen: rr.comites.map((c) => (c === "COPASST" && cop.tipo === "VIGIA" ? "Vigía" : COMITE[c])).join(", "),
    items: rr.conclusiones.filter((c) => c.tipo === "comite").map((c) => ({
      que: c.valor === "COPASST" && cop.tipo === "VIGIA" ? "Vigía de SST" : COMITE[c.valor] ?? c.valor,
      porque: `${c.porque} ${c.valor === "COPASST" ? `Composición según el número de trabajadores: ${cop.texto}.` : ""}`.trim(),
      normas: [c.normaRef],
    })),
  });

  grupos.push({
    id: "normas", titulo: "3. Normas que le aplican", resumen: `${ctx.normas.length} normas en la matriz legal`,
    items: ctx.normas.map((n) => {
      const r = rr.normas.find((x) => x.codigo === n.codigo);
      return { que: `${n.tipo} ${n.numero} de ${n.anio}: ${n.nombre}`, porque: r?.porque ?? "Porque un peligro identificado en la matriz de esta empresa está regulado por esta norma (se agrega automáticamente desde el catálogo de peligros).", normas: n.articulosClave ? [n.articulosClave] : [] };
    }),
  });

  grupos.push({
    id: "documentos", titulo: "4. Documentos que se generan", resumen: `${rr.documentos.length} documentos`,
    items: rr.documentos.map((d) => ({ que: `${d.codigo} · ${d.nombre}`, porque: d.porque, normas: d.normas })),
  });

  const f = ctx.matriz.filas;
  const porOrigen = (o: string) => f.filter((x) => x.origen === o).length;
  grupos.push({
    id: "matriz", titulo: "5. Matriz de peligros", resumen: `${f.length} peligros · ${ctx.matriz.prioritarios.length} prioritarios (I y II)`,
    items: [
      { que: "De dónde salen los peligros", porque: `Cada cargo tiene tareas y cada tarea trae sus peligros desde la biblioteca${e.sectorTipo ? ` del sector “${e.sectorTipo.nombre}”` : ""}. Además, cada zona (cocina, bodega, oficina…) trae los peligros del lugar, como sismo o incendio, y algunos cargos traen peligros propios, como la carga mental. En esta empresa: ${porOrigen("tarea")} por tarea, ${porOrigen("zona")} por zona y ${porOrigen("cargo")} por cargo.`, normas: ["Decreto 1072/2015 art. 2.2.4.6.15", "GTC 45"] },
      { que: "Cómo se calcula el nivel de cada riesgo", porque: "Con la GTC 45: deficiencia (qué tan buenos son los controles) × exposición (qué tan seguido) da la probabilidad; probabilidad × consecuencia (qué tan grave) da el nivel de riesgo, de I (crítico) a IV (aceptable). Los valores vienen sugeridos de la biblioteca y la consultora los ajusta según lo que ve en la empresa.", normas: ["GTC 45 numeral 3"] },
      { que: "Cuántas personas están expuestas", porque: "Para un peligro de una tarea se suman las personas de todos los cargos que hacen esa tarea. Para un peligro de una zona, las de los cargos que trabajan en esa zona. Para un peligro de un cargo, las personas de ese cargo.", normas: ["GTC 45"] },
      { que: "Qué riesgos son prioritarios", porque: `Los de nivel I y II (“no aceptables”). En esta empresa son ${ctx.matriz.prioritarios.length}. Pasan al plan anual como actividades de intervención y, si tienen un programa de vigilancia asociado, generan un PVE.`, normas: ["Res. 0312/2019 est. 4.2.1", "Decreto 1072/2015 art. 2.2.4.6.24"] },
      ...ctx.matriz.prioritarios.slice(0, 8).map((p) => ({ que: `${p.nivelRiesgo} · ${p.descripcion}`, porque: `En “${p.tarea}” (${p.cargos.join(", ") || "todos"}). ND ${p.nd} × NE ${p.ne} × NC ${p.nc} = NR ${p.nr}.`, normas: ["GTC 45"] })),
    ],
  });

  grupos.push({
    id: "derivados", titulo: "6. Lo que se deriva de la matriz", resumen: "Profesiograma, EPP, capacitaciones y PVE",
    items: [
      { que: "Exámenes médicos por cargo (profesiograma)", porque: "Cada peligro del catálogo trae los exámenes que lo vigilan (por ejemplo, ruido → audiometría; alturas → evaluación con énfasis en alturas). El profesiograma de un cargo junta los exámenes de todos sus peligros. El médico de la IPS lo valida.", normas: ["Res. 1843/2025", "Res. 0312/2019 est. 3.1.3"] },
      { que: "Elementos de protección personal por cargo", porque: "Igual que los exámenes: cada peligro trae sus EPP sugeridos y la matriz de EPP de un cargo junta los de sus peligros. Son el último recurso de la jerarquía de controles.", normas: ["Res. 2400/1979", "Res. 0312/2019 est. 4.2.6"] },
      { que: `${ctx.capacitaciones.length} temas de capacitación`, porque: "Hay temas obligatorios para todos (inducción, emergencias, acoso laboral, salud mental) y temas que salen de los peligros de cada cargo y de las reglas activadas (por ejemplo, alturas o químicos).", normas: ["Decreto 1072/2015 art. 2.2.4.6.11"] },
      { que: `${ctx.pve.length} programas de vigilancia epidemiológica`, porque: ctx.pve.length ? `Se crean cuando hay peligros prioritarios o moderados de un mismo tipo: ${ctx.pve.map((p) => p.nombre).join(", ")}.` : "No hay peligros prioritarios con programa de vigilancia asociado.", normas: ["Decreto 1072/2015 art. 2.2.4.6.12 num. 13"] },
    ],
  });

  const acts = e.actividades.filter((a) => a.anio === ctx.anio);
  const cuenta = (o: string) => acts.filter((a) => a.origen === o).length;
  grupos.push({
    id: "plan", titulo: "7. Plan anual", resumen: acts.length ? `${acts.length} actividades para ${ctx.anio}` : `Sin generar (año ${ctx.anio})`,
    items: [
      { que: `El plan es para ${ctx.anio}`, porque: "La norma pide formular en diciembre el plan del año siguiente, que se ejecuta de enero a diciembre. Por eso, en noviembre y diciembre el sistema planea el año siguiente.", normas: ["Res. 0312/2019 art. 26"] },
      { que: "De dónde salen las actividades", porque: `Mínimas del nivel de estándares (${cuenta("nivel")}), reuniones de comités (${cuenta("comite")}), intervención de riesgos y capacitaciones de la matriz (${cuenta("matriz")}), plan de mejoramiento de la evaluación (${cuenta("mejoramiento")}) y agregadas a mano (${cuenta("manual")}). Cada actividad muestra su norma.`, normas: ["Decreto 1072/2015 art. 2.2.4.6.17"] },
      { que: "Fechas fijas del Ministerio", porque: "En diciembre: autoevaluación de estándares y plan de mejoramiento. En julio: informe de avance y registro en la aplicación del Fondo de Riesgos Laborales, con copia a la ARL.", normas: ["Res. 0312/2019 art. 28", "Circular 027/2026"] },
    ],
  });

  const ev = ctx.evaluacion as { existe: boolean; puntaje?: number; valoracion?: string; accion?: string };
  grupos.push({
    id: "evaluacion", titulo: "8. Evaluación de estándares", resumen: ev.existe ? `${ev.puntaje}% · ${ev.valoracion}` : "Sin evaluar",
    items: [
      { que: "Cómo se califica", porque: `Cada ítem vale unos puntos. “Cumple” suma todos sus puntos, “No cumple” suma cero y “No aplica” (con justificación) suma todos sus puntos. ${rr.nivel === 60 ? "Para 60 estándares el total es sobre 100." : `Para ${rr.nivel} estándares el puntaje se expresa como porcentaje de los puntos de los ${rr.estandares.length} ítems que aplican.`}`, normas: ["Res. 0312/2019 art. 27"] },
      { que: "Qué significa el resultado", porque: "Menos de 60 %: crítico (plan de mejoramiento inmediato y reporte a la ARL a los 3 meses). Entre 60 % y 85 %: moderadamente aceptable (reporte a los 6 meses). Más de 85 %: aceptable (mantener y mejorar)." + (ev.existe ? ` Resultado actual: ${ev.puntaje}% → ${ev.valoracion}.` : ""), normas: ["Res. 0312/2019 art. 28"] },
    ],
  });

  // 9. Qué dato dispara cada regla y cada norma condicionada (trazabilidad para la consultora)
  const [nSedes, ts, reglasDb, normasDb] = await Promise.all([
    db.sede.count({ where: { empresaId } }),
    db.trabajador.findMany({ where: { empresaId, activo: true }, select: { sexo: true, conduce: true, vinculacion: true } }),
    db.reglaAplicabilidad.findMany({ where: { activa: true }, orderBy: { prioridad: "desc" } }),
    db.norma.findMany({ where: { vigente: true }, orderBy: [{ anio: "asc" }] }),
  ]);
  const ctxR = contextoReglas({
    ...e, nSedes: Math.max(1, nSedes), nMujeres: ts.filter((t) => t.sexo === "F").length,
    nConductores: Math.max(e.nConductores ?? 0, ts.filter((t) => t.conduce).length),
    nContratistas: Math.max(e.nContratistas ?? 0, ts.filter((t) => t.vinculacion === "contratista").length),
    nAprendices: Math.max(e.nAprendices ?? 0, ts.filter((t) => t.vinculacion === "aprendiz").length),
    disparadoresMatriz: await disparadoresDesdeMatriz(empresaId),
  }, rr.nivel);
  const base = `/empresas/${empresaId}`;
  const condicionadas = explicarCondiciones([
    ...reglasDb.map((r) => ({ codigo: r.codigo, nombre: r.nombre, tipo: "regla" as const, condicion: r.condicion as Condicion, normaRef: r.normaRef })),
    ...normasDb.filter((n) => { const c = n.condicionAplicabilidad as Condicion | null; return c && !c.siempre && Object.keys(c).length > 0; }).map((n) => ({ codigo: n.codigo, nombre: n.nombre, tipo: "norma" as const, condicion: n.condicionAplicabilidad as Condicion, normaRef: `${n.tipo === "Resolucion" ? "Res." : n.tipo} ${n.numero}/${n.anio}` })),
  ], ctxR, base);
  // Solo las condiciones que aplican a esta empresa, con el dato que las disparó y dónde se registra.
  const activas = condicionadas.filter((c) => c.aplica);
  grupos.push({
    id: "condiciones", titulo: "9. Qué dato dispara cada condición", resumen: `${activas.length} condiciones activas · conductores ${ctxR.conductores}, vehículos ${ctxR.vehiculos}, contratistas ${ctxR.contratistas}, aprendices ${ctxR.aprendices}, trabajadoras ${ctxR.mujeres}, sedes ${ctxR.sedes}`,
    items: activas.map((c) => ({
      que: `${c.nombre}${c.tipo === "norma" ? " (norma)" : ""}`,
      porque: `Aplica porque ${c.condicion === "todas las empresas" ? "rige para todas las empresas" : `la condición es: ${c.condicion}`}.${c.valores ? ` Dato de la empresa: ${c.valores}.` : ""}`,
      normas: [c.normaRef],
      pasos: c.campos.map((x) => `${x.campo}: se registra en ${x.donde}`),
    })),
  });

  return grupos;
}
