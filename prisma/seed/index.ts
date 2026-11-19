import { PrismaClient } from "@prisma/client";
import { sincronizarPlantillas } from "./sincronizar-plantillas";
import { estandares } from "./estandares";
import { normas } from "./normas";
import { reglas } from "./reglas";
import { ciiu } from "./ciiu";
import { peligros } from "./biblioteca/peligros";
import { zonas, tareas, cargos, sectores, zonasTarea } from "./biblioteca/estructura";
import { peligrosAmpliacion } from "./biblioteca/peligros-ampliacion";
import { zonasAmp, tareasAmp, cargosAmp, sectoresAmp } from "./biblioteca/estructura-ampliacion";
import { itemsCatalogo } from "./biblioteca/catalogos";

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

  const pl = await sincronizarPlantillas(db);
  console.log(`Plantillas: ${pl.total} (${pl.actualizadas} actualizadas, ${pl.respetadas} editadas por la consultora sin tocar)`);

  await sembrarBiblioteca();

  // Consultora por defecto
  if ((await db.consultora.count()) === 0) {
    await db.consultora.create({ data: { nombre: "Mi consultora SST", profesional: "Nombre de la profesional", licenciaSst: "" } });
    console.log("Consultora por defecto creada.");
  }
}

/** Siembra aditiva: crea lo que falta (por nombre) y nunca modifica ni borra lo existente. */
async function sembrarBiblioteca() {
  const conteo = { peligros: 0, zonas: 0, tareas: 0, sectores: 0, procesos: 0, cargos: 0, catalogo: 0 };
  const todosPeligros = { ...peligros, ...peligrosAmpliacion };
  const pid: Record<string, string> = {};
  for (const [k, p] of Object.entries(todosPeligros)) {
    const prev = await db.peligroCatalogo.findFirst({ where: { descripcion: p.descripcion, empresaId: null } });
    if (prev) { pid[k] = prev.id; continue; }
    const r = await db.peligroCatalogo.create({ data: {
      clasificacion: p.clasificacion, subclasificacion: p.sub, descripcion: p.descripcion, efectosPosibles: p.efectos,
      ndDefault: p.nd, neDefault: p.ne, ncDefault: p.nc, controlesFuente: p.fuente, controlesMedio: p.medio, controlesIndividuo: p.individuo,
      medidaEliminacion: p.eliminacion, medidaSustitucion: p.sustitucion, medidaIngenieria: p.ingenieria, medidaAdministrativa: p.administrativa, medidaEpp: p.epp,
      eppSugerido: p.eppLista ?? [], examenesSugeridos: p.examenes ?? [], capacitacionesSugeridas: p.capacitaciones ?? [], normas: p.normas ?? [],
      pveAsociado: p.pve, requisitoLegalEspecifico: p.requisitoLegal ?? false,
    } });
    pid[k] = r.id; conteo.peligros++;
  }

  const todasZonas = { ...zonas, ...zonasAmp };
  const zid: Record<string, string> = {};
  for (const [k, z] of Object.entries(todasZonas)) {
    let zt = await db.zonaTipo.findUnique({ where: { nombre: z.nombre } });
    if (!zt) { zt = await db.zonaTipo.create({ data: { nombre: z.nombre, descripcion: z.descripcion } }); conteo.zonas++; }
    zid[k] = zt.id;
    for (const p of z.peligros) await db.zonaTipoPeligro.upsert({ where: { zonaTipoId_peligroId: { zonaTipoId: zt.id, peligroId: req(pid, p) } }, update: {}, create: { zonaTipoId: zt.id, peligroId: req(pid, p) } });
  }

  const zonasDeTarea: Record<string, string[]> = { ...zonasTarea, ...Object.fromEntries(Object.entries(tareasAmp).map(([k, t]) => [k, t.zonas])) };
  const todasTareas = { ...tareas, ...tareasAmp };
  const tid: Record<string, string> = {};
  for (const [k, t] of Object.entries(todasTareas)) {
    let tt = await db.tareaTipo.findFirst({ where: { nombre: t.nombre, empresaId: null } });
    if (!tt) {
      tt = await db.tareaTipo.create({ data: { nombre: t.nombre, actividad: t.actividad, rutinaria: t.rutinaria ?? true, altoRiesgo: t.altoRiesgo, zonasPreferidas: (zonasDeTarea[k] ?? []).map((z) => todasZonas[z].nombre) } });
      conteo.tareas++;
    } else if (!tt.zonasPreferidas.length && zonasDeTarea[k]) {
      await db.tareaTipo.update({ where: { id: tt.id }, data: { zonasPreferidas: zonasDeTarea[k].map((z) => todasZonas[z].nombre) } });
    }
    tid[k] = tt.id;
    for (const x of t.peligros) {
      const [p, o] = typeof x === "string" ? [x, {}] : [x.p, x];
      await db.tareaTipoPeligro.upsert({ where: { tareaTipoId_peligroId: { tareaTipoId: tt.id, peligroId: req(pid, p) } }, update: {}, create: { tareaTipoId: tt.id, peligroId: req(pid, p), nd: (o as { nd?: number }).nd, ne: (o as { ne?: number }).ne, nc: (o as { nc?: number }).nc } });
    }
  }

  const todosCargos = { ...cargos, ...cargosAmp };
  for (const s of [...sectores, ...sectoresAmp]) {
    let sector = await db.sectorTipo.findFirst({ where: { nombre: s.nombre } });
    if (!sector) { sector = await db.sectorTipo.create({ data: { nombre: s.nombre, ciius: s.ciius, descripcion: s.descripcion } }); conteo.sectores++; }
    for (const z of s.zonas) await db.sectorZonaTipo.upsert({ where: { sectorTipoId_zonaTipoId: { sectorTipoId: sector.id, zonaTipoId: req(zid, z) } }, update: {}, create: { sectorTipoId: sector.id, zonaTipoId: req(zid, z) } });
    for (const p of s.procesos) {
      let pt = await db.procesoTipo.findFirst({ where: { nombre: p.nombre, sectorTipoId: sector.id } });
      if (!pt) { pt = await db.procesoTipo.create({ data: { nombre: p.nombre, descripcion: p.descripcion, sectorTipoId: sector.id } }); conteo.procesos++; }
      for (const t of p.tareas) await db.procesoTipoTarea.upsert({ where: { procesoTipoId_tareaTipoId: { procesoTipoId: pt.id, tareaTipoId: req(tid, t) } }, update: {}, create: { procesoTipoId: pt.id, tareaTipoId: req(tid, t) } });
    }
    for (const c of s.cargos) {
      const ct = todosCargos[c];
      if (!ct) throw new Error(`Cargo tipo no existe: ${c}`);
      let cargo = await db.cargoTipo.findFirst({ where: { nombre: ct.nombre, sectorTipoId: sector.id, empresaId: null } });
      if (!cargo) { cargo = await db.cargoTipo.create({ data: { nombre: ct.nombre, descripcion: ct.descripcion, sectorTipoId: sector.id } }); conteo.cargos++; }
      for (const t of ct.tareas) await db.cargoTipoTarea.upsert({ where: { cargoTipoId_tareaTipoId: { cargoTipoId: cargo.id, tareaTipoId: req(tid, t) } }, update: {}, create: { cargoTipoId: cargo.id, tareaTipoId: req(tid, t) } });
      for (const p of ct.peligros ?? []) await db.cargoTipoPeligro.upsert({ where: { cargoTipoId_peligroId: { cargoTipoId: cargo.id, peligroId: req(pid, p) } }, update: {}, create: { cargoTipoId: cargo.id, peligroId: req(pid, p) } });
    }
  }

  // Catálogos (exámenes, EPP, capacitaciones) + cualquier texto usado en peligros que aún no esté en el catálogo
  const items: { tipo: string; nombre: string; descripcion: string; detalle: Record<string, unknown>; normas: string[] }[] = itemsCatalogo();
  const todos = await db.peligroCatalogo.findMany({ where: { empresaId: null }, select: { eppSugerido: true, examenesSugeridos: true, capacitacionesSugeridas: true } });
  const extra = (tipo: string, xs: string[]) => xs.filter((n) => !items.some((i) => i.tipo === tipo && i.nombre === n)).map((nombre) => ({ tipo, nombre, descripcion: "", detalle: {}, normas: [] as string[] }));
  items.push(...extra("EXAMEN", [...new Set(todos.flatMap((p) => p.examenesSugeridos))]), ...extra("EPP", [...new Set(todos.flatMap((p) => p.eppSugerido))]), ...extra("CAPACITACION", [...new Set(todos.flatMap((p) => p.capacitacionesSugeridas))]));
  for (const it of items) {
    const prev = await db.catalogoItem.findFirst({ where: { tipo: it.tipo, nombre: it.nombre, empresaId: null } });
    if (!prev) { await db.catalogoItem.create({ data: { ...it, detalle: it.detalle as object } }); conteo.catalogo++; }
  }
  const total = { peligros: await db.peligroCatalogo.count(), tareas: await db.tareaTipo.count(), cargos: await db.cargoTipo.count(), sectores: await db.sectorTipo.count(), zonas: await db.zonaTipo.count(), catalogo: await db.catalogoItem.count() };
  console.log("Biblioteca — nuevos:", conteo, "· totales:", total);
}

function req(m: Record<string, string>, k: string) {
  if (!m[k]) throw new Error(`Referencia no encontrada en biblioteca: ${k}`);
  return m[k];
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
