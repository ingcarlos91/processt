import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { estandares } from "./estandares";
import { normas } from "./normas";
import { reglas } from "./reglas";
import { ciiu } from "./ciiu";
import { peligros } from "./biblioteca/peligros";
import { zonas, tareas, cargos, sectores } from "./biblioteca/estructura";
import { parsePlantilla } from "../../src/lib/generador/plantilla";

const db = new PrismaClient();

async function main() {
  // Estándares
  for (const [i, e] of estandares.entries()) {
    await db.estandar.upsert({ where: { codigo: e.codigo }, update: { ...e, orden: i }, create: { ...e, orden: i } });
  }
  const total = estandares.reduce((s, e) => s + e.puntaje, 0);
  console.log(`Estándares: ${estandares.length} (suma ${total}), aplica7=${estandares.filter((e) => e.aplica7).length}, aplica21=${estandares.filter((e) => e.aplica21).length}`);

  // Normas
  for (const n of normas) {
    const data = {
      tipo: n.tipo, numero: n.numero, anio: n.anio, entidad: n.entidad, nombre: n.nombre, tema: n.tema, resumen: n.resumen,
      articulosClave: n.articulosClave, urlOficial: n.urlOficial, condicionAplicabilidad: n.condicion as object,
      derogadaPor: n.derogadaPor, vigente: n.vigente ?? true, evidenciaCumplimiento: n.evidenciaCumplimiento,
    };
    await db.norma.upsert({ where: { codigo: n.codigo }, update: data, create: { codigo: n.codigo, ...data } });
  }
  console.log(`Normas: ${normas.length}`);

  // Reglas
  for (const r of reglas) {
    const data = { nombre: r.nombre, condicion: r.condicion as object, efecto: r.efecto as object, normaRef: r.normaRef, prioridad: r.prioridad };
    await db.reglaAplicabilidad.upsert({ where: { codigo: r.codigo }, update: data, create: { codigo: r.codigo, ...data } });
  }
  console.log(`Reglas: ${reglas.length}`);

  // CIIU
  for (const [codigo, descripcion, claseRiesgo] of ciiu) {
    await db.ciiuClaseRiesgo.upsert({ where: { codigo }, update: { descripcion, claseRiesgo }, create: { codigo, descripcion, claseRiesgo } });
  }
  console.log(`CIIU: ${ciiu.length}`);

  // Plantillas
  const dir = join(__dirname, "plantillas");
  const archivos = readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
  for (const f of archivos) {
    const { meta, cuerpo } = parsePlantilla(readFileSync(join(dir, f), "utf8"));
    const data = {
      nombre: meta.nombre, tipo: meta.tipo, nivelMin: meta.nivelMin, condicion: (meta.condicion ?? undefined) as object | undefined,
      estandares: meta.estandares ?? [], normas: meta.normas ?? [], contenidoMd: cuerpo, carpeta: meta.carpeta, descripcion: meta.descripcion,
    };
    const prev = await db.plantilla.findUnique({ where: { codigo: meta.codigo } });
    if (!prev) await db.plantilla.create({ data: { codigo: meta.codigo, ...data } });
    else if (prev.contenidoMd !== cuerpo || prev.nombre !== meta.nombre)
      await db.plantilla.update({ where: { codigo: meta.codigo }, data: { ...data, version: prev.version + 1, vigenteDesde: new Date() } });
    else await db.plantilla.update({ where: { codigo: meta.codigo }, data });
  }
  console.log(`Plantillas: ${archivos.length}`);

  // Biblioteca: solo se siembra si está vacía (para no pisar lo validado por la consultora)
  if ((await db.peligroCatalogo.count()) === 0) {
    const pid: Record<string, string> = {};
    for (const [k, p] of Object.entries(peligros)) {
      const r = await db.peligroCatalogo.create({ data: {
        clasificacion: p.clasificacion, subclasificacion: p.sub, descripcion: p.descripcion, efectosPosibles: p.efectos,
        ndDefault: p.nd, neDefault: p.ne, ncDefault: p.nc, controlesFuente: p.fuente, controlesMedio: p.medio, controlesIndividuo: p.individuo,
        medidaEliminacion: p.eliminacion, medidaSustitucion: p.sustitucion, medidaIngenieria: p.ingenieria, medidaAdministrativa: p.administrativa, medidaEpp: p.epp,
        eppSugerido: p.eppLista ?? [], examenesSugeridos: p.examenes ?? [], capacitacionesSugeridas: p.capacitaciones ?? [], normas: p.normas ?? [],
        pveAsociado: p.pve, requisitoLegalEspecifico: p.requisitoLegal ?? false,
      } });
      pid[k] = r.id;
    }
    const zid: Record<string, string> = {};
    for (const [k, z] of Object.entries(zonas)) {
      const r = await db.zonaTipo.create({ data: { nombre: z.nombre, descripcion: z.descripcion, peligros: { create: z.peligros.map((p) => ({ peligroId: req(pid, p) })) } } });
      zid[k] = r.id;
    }
    const tid: Record<string, string> = {};
    for (const [k, t] of Object.entries(tareas)) {
      const r = await db.tareaTipo.create({ data: {
        nombre: t.nombre, actividad: t.actividad, rutinaria: t.rutinaria ?? true, altoRiesgo: t.altoRiesgo,
        peligros: { create: t.peligros.map((x) => (typeof x === "string" ? { peligroId: req(pid, x) } : { peligroId: req(pid, x.p), nd: x.nd, ne: x.ne, nc: x.nc })) },
      } });
      tid[k] = r.id;
    }
    for (const s of sectores) {
      const sector = await db.sectorTipo.create({ data: { nombre: s.nombre, ciius: s.ciius, descripcion: s.descripcion, zonas: { create: s.zonas.map((z) => ({ zonaTipoId: req(zid, z) })) } } });
      for (const p of s.procesos) await db.procesoTipo.create({ data: { nombre: p.nombre, descripcion: p.descripcion, sectorTipoId: sector.id, tareasTipo: { create: p.tareas.map((t) => ({ tareaTipoId: req(tid, t) })) } } });
      for (const c of s.cargos) {
        const ct = cargos[c];
        if (!ct) throw new Error(`Cargo tipo no existe: ${c}`);
        await db.cargoTipo.create({ data: {
          nombre: ct.nombre, descripcion: ct.descripcion, sectorTipoId: sector.id,
          tareas: { create: ct.tareas.map((t) => ({ tareaTipoId: req(tid, t) })) },
          peligros: { create: (ct.peligros ?? []).map((p) => ({ peligroId: req(pid, p) })) },
        } });
      }
    }
    // Vincular procesos tipo con tareas tipo (tarea_tipo.proceso_tipo_id se deja nulo: una tarea puede servir a varios procesos;
    // la relación proceso→tareas se guarda en el JSON de sectores y se aplica al instanciar).
    console.log(`Biblioteca: ${Object.keys(peligros).length} peligros, ${Object.keys(zonas).length} zonas, ${Object.keys(tareas).length} tareas, ${sectores.length} sectores`);
  } else console.log("Biblioteca ya existente: no se modifica.");

  // Consultora por defecto
  if ((await db.consultora.count()) === 0) {
    await db.consultora.create({ data: { nombre: "Mi consultora SST", profesional: "Nombre de la profesional", licenciaSst: "" } });
    console.log("Consultora por defecto creada.");
  }
}

function req(m: Record<string, string>, k: string) {
  if (!m[k]) throw new Error(`Referencia no encontrada en biblioteca: ${k}`);
  return m[k];
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
