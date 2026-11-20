// Después de sembrar (catálogo, normas, reglas y plantillas nuevas), pone al día a las empresas existentes:
// 1. Recalcula el resultado de reglas (normas y documentos que les aplican).
// 2. Genera los documentos que ahora aplican y regenera los existentes con la plantilla vigente
//    (las ediciones manuales por sección se conservan; si cambió lo generado, la sección queda "para revisar").
// 3. Recalcula el puntaje guardado de las autoevaluaciones (Res. 0312/2019 art. 27).
// Uso: npx tsx scripts/actualizar-empresas.ts  (lo llama scripts/sembrar-produccion.ts en cada despliegue)
import { db } from "../src/lib/db";
import { recalcularEmpresa } from "../src/lib/empresa";
import { generarDocumentos } from "../src/lib/generador/documentos";
import { calificar } from "../src/lib/evaluacion";
import { calcularComposicion, calidadDe, composicionGuardada } from "../src/lib/comites";

/**
 * Comités creados antes de separar calidad y cargo: deriva la calidad (principal o suplente) del rol antiguo,
 * de modo que un presidente o secretario cuente como principal. Y congela la composición de los que no la tienen
 * con el número actual de trabajadores (Res. 3461/2025 art. 5 par. 1; Res. 2013/1986 art. 2); la consultora
 * puede corregir en Comités los trabajadores que había al conformarlos.
 */
async function migrarComites(empresaId: string, trabajadores: number) {
  const comites = await db.comite.findMany({ where: { empresaId }, include: { miembros: { where: { calidad: null } } } });
  for (const c of comites) {
    if (c.tipo !== "BRIGADA")
      for (const m of c.miembros) {
        const calidad = calidadDe(m.rol, null);
        if (calidad) await db.comiteMiembro.update({ where: { id: m.id }, data: { calidad } });
      }
    const datos = (c.datos ?? {}) as Record<string, unknown>;
    if (composicionGuardada(datos)) continue;
    const comp = calcularComposicion(c.tipo, trabajadores, c.periodoInicio?.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10), c.sede);
    if (comp) await db.comite.update({ where: { id: c.id }, data: { datos: { ...datos, composicion: { ...comp, origen: "actualizacion" } } } });
  }
}

export async function actualizarEmpresas() {
  const empresas = await db.empresa.findMany({ select: { id: true, razonSocial: true, etapa: true } });
  for (const e of empresas) {
    try {
      const rr = await recalcularEmpresa(e.id);
      await migrarComites(e.id, rr.trabajadores);
      // En etapa de diagnóstico la empresa todavía no tiene documentos (se crean al iniciar el SG-SST).
      const docs = e.etapa === "activa" ? await generarDocumentos(e.id) : [];
      const evs = await db.evaluacion.findMany({ where: { empresaId: e.id }, include: { items: { include: { estandar: true } } } });
      for (const ev of evs) {
        const cal = calificar(ev.items.map((i) => ({ codigo: i.estandar.codigo, puntaje: i.estandar.puntaje, estado: i.estado })), ev.nivel);
        if (ev.puntajeAjustado !== cal.puntajeAjustado || ev.valoracion !== cal.valoracion)
          await db.evaluacion.update({ where: { id: ev.id }, data: { puntajeBruto: cal.puntajeBruto, puntajeAjustado: cal.puntajeAjustado, ...(ev.cerrada ? { valoracion: cal.valoracion } : {}) } });
      }
      console.log(`[empresas] ${e.razonSocial}: ${docs.length} documento(s), ${docs.reduce((s, d) => s + d.revisar, 0)} sección(es) para revisar, ${evs.length} evaluación(es)`);
    } catch (err) {
      console.error(`[empresas] ${e.razonSocial}: ${err instanceof Error ? err.message : err}`);
    }
  }
}

if (process.argv[1]?.endsWith("actualizar-empresas.ts")) {
  actualizarEmpresas().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
}
