import { PrismaClient } from "@prisma/client";
import { sincronizarPlantillas } from "./sincronizar-plantillas";
import { modulosBiblioteca } from "./biblioteca/modulos";
import { deduplicarPeligros } from "./biblioteca/deduplicar";
import { estandares } from "./estandares";
import { LISTAS_ANTERIORES_2026_11 } from "./biblioteca/inspecciones";
import { normas } from "./normas";
import { reglas } from "./reglas";
import { ciiu } from "./ciiu";
import { peligros } from "./biblioteca/peligros";
import { zonas, tareas, cargos, sectores, zonasTarea } from "./biblioteca/estructura";
import { peligrosAmpliacion } from "./biblioteca/peligros-ampliacion";
import { zonasAmp, tareasAmp, cargosAmp, sectoresAmp } from "./biblioteca/estructura-ampliacion";
import { itemsCatalogo } from "./biblioteca/catalogos";

// Lecciones que la semilla puso en versiones anteriores; si la consultora no las cambió, se actualizan.
// Versiones anteriores de listas de inspección sembradas; si la consultora no las editó, se actualizan.
const LISTAS_SEMBRADAS_ANTES: Record<string, string[][]> = {
  "Inspección de bioseguridad y residuos": [
    ["Guardián para cortopunzantes en cada punto de uso, rotulado, rígido y con menos de 3/4 de su capacidad", "No se reencapsulan agujas ni se manipulan cortopunzantes con la mano", "Lavado de instrumental con guantes gruesos (de caucho o nitrilo) y cepillo de mango largo", "Uso de EPP según el procedimiento: guantes, tapabocas o respirador, gafas o careta y bata", "Lavamanos con jabón, toallas desechables y protocolo de higiene de manos visible", "Superficies y equipos limpiados y desinfectados según el protocolo", "Residuos separados en recipientes con bolsa del color definido en el PGIRASA y rotulados", "Almacenamiento central de residuos señalizado, con acceso restringido y registro de entrega al gestor", "Protocolo de atención de la exposición a riesgo biológico conocido por el personal (lavado, reporte inmediato, valoración médica)", "Trabajadores expuestos con esquema de vacunación registrado (hepatitis B, tétanos)", "Derrames de fluidos atendidos con kit y procedimiento definido"],
  ],
};
const LECCIONES_SEMBRADAS_ANTES = [
  "Use la herramienta adecuada, en buen estado y con guantes anticorte; corte siempre en dirección contraria al cuerpo.",
];

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
      vigenteDesde: n.vigenteDesde ? new Date(`${n.vigenteDesde}T12:00:00Z`) : undefined,
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
  const fus = await deduplicarPeligros(db);
  if (fus) console.log(`Peligros duplicados fusionados: ${fus}`);

  // Consultora por defecto
  if ((await db.consultora.count()) === 0) {
    await db.consultora.create({ data: { nombre: "Mi consultora SST", profesional: "Nombre de la profesional", licenciaSst: "" } });
    console.log("Consultora por defecto creada.");
  }
}

/** Siembra aditiva: crea lo que falta (por nombre) y nunca modifica ni borra lo existente. */
// Descripciones antiguas de peligros de la semilla que cambiaron de texto (para actualizarlos en vez de duplicarlos).
const RENOMBRADOS: Record<string, string[]> = {
  alturas: ["Trabajo en alturas a 1,5 m o más sobre un nivel inferior (escaleras, andamios, techos, plataformas)"],
  escaleras_portatiles: ["Uso de escaleras portátiles para alcanzar productos o hacer tareas menores a 1,5 m"],
  psico_jornada_turnos: ["Jornadas extensas, trabajo por turnos o nocturno"],
};

async function sembrarBiblioteca() {
  const conteo = { peligros: 0, zonas: 0, tareas: 0, sectores: 0, procesos: 0, cargos: 0, catalogo: 0 };
  const todosPeligros = { ...peligros, ...peligrosAmpliacion, ...(Object.assign({}, ...modulosBiblioteca.map((m) => m.peligros ?? {})) as typeof peligros) };
  const pid: Record<string, string> = {};
  for (const [k, p] of Object.entries(todosPeligros)) {
    const prev = await db.peligroCatalogo.findFirst({ where: { empresaId: null, OR: [{ claveSemilla: k }, { descripcion: p.descripcion }, ...(RENOMBRADOS[k] ? [{ descripcion: { in: RENOMBRADOS[k] } }] : [])] } });
    const data = {
      claveSemilla: k,
      clasificacion: p.clasificacion, subclasificacion: p.sub, descripcion: p.descripcion, efectosPosibles: p.efectos,
      ndDefault: p.nd, neDefault: p.ne, ncDefault: p.nc, controlesFuente: p.fuente, controlesMedio: p.medio, controlesIndividuo: p.individuo,
      medidaEliminacion: p.eliminacion, medidaSustitucion: p.sustitucion, medidaIngenieria: p.ingenieria, medidaAdministrativa: p.administrativa, medidaEpp: p.epp,
      eppSugerido: p.eppLista ?? [], examenesSugeridos: p.examenes ?? [], capacitacionesSugeridas: p.capacitaciones ?? [], normas: p.normas ?? [],
      pveAsociado: p.pve, requisitoLegalEspecifico: p.requisitoLegal ?? false,
    };
    if (prev) {
      // Se actualiza con la semilla mientras la consultora no lo haya validado (lo validado es suyo y no se toca).
      if (!prev.validado) await db.peligroCatalogo.update({ where: { id: prev.id }, data });
      else if (!prev.claveSemilla) await db.peligroCatalogo.update({ where: { id: prev.id }, data: { claveSemilla: k } });
      pid[k] = prev.id; continue;
    }
    const r = await db.peligroCatalogo.create({ data });
    pid[k] = r.id; conteo.peligros++;
  }

  const todasZonas = { ...zonas, ...zonasAmp, ...(Object.assign({}, ...modulosBiblioteca.map((m) => m.zonas ?? {})) as typeof zonas) };
  const zid: Record<string, string> = {};
  for (const [k, z] of Object.entries(todasZonas)) {
    let zt = await db.zonaTipo.findUnique({ where: { nombre: z.nombre } });
    if (!zt) { zt = await db.zonaTipo.create({ data: { nombre: z.nombre, descripcion: z.descripcion } }); conteo.zonas++; }
    zid[k] = zt.id;
    for (const p of z.peligros) await db.zonaTipoPeligro.upsert({ where: { zonaTipoId_peligroId: { zonaTipoId: zt.id, peligroId: req(pid, p) } }, update: {}, create: { zonaTipoId: zt.id, peligroId: req(pid, p) } });
  }

  const tareasModulos = Object.assign({}, ...modulosBiblioteca.map((m) => m.tareas ?? {})) as typeof tareasAmp;
  const zonasDeTarea: Record<string, string[]> = { ...zonasTarea, ...Object.fromEntries(Object.entries({ ...tareasAmp, ...tareasModulos }).map(([k, t]) => [k, t.zonas])) };
  const todasTareas = { ...tareas, ...tareasAmp, ...tareasModulos };
  const tid: Record<string, string> = {};
  for (const [k, t] of Object.entries(todasTareas)) {
    let tt = await db.tareaTipo.findFirst({ where: { nombre: t.nombre, empresaId: null } });
    if (!tt) {
      tt = await db.tareaTipo.create({ data: { nombre: t.nombre, actividad: t.actividad, rutinaria: t.rutinaria ?? true, altoRiesgo: t.altoRiesgo, zonasPreferidas: (zonasDeTarea[k] ?? []).map((z) => todasZonas[z].nombre) } });
      conteo.tareas++;
    } else if (!tt.validado) {
      await db.tareaTipo.update({ where: { id: tt.id }, data: { actividad: t.actividad, rutinaria: t.rutinaria ?? true, altoRiesgo: t.altoRiesgo, zonasPreferidas: (zonasDeTarea[k] ?? []).map((z) => todasZonas[z].nombre) } });
    }
    tid[k] = tt.id;
    for (const x of t.peligros) {
      const [p, o] = typeof x === "string" ? [x, {}] : [x.p, x];
      await db.tareaTipoPeligro.upsert({ where: { tareaTipoId_peligroId: { tareaTipoId: tt.id, peligroId: req(pid, p) } }, update: {}, create: { tareaTipoId: tt.id, peligroId: req(pid, p), nd: (o as { nd?: number }).nd, ne: (o as { ne?: number }).ne, nc: (o as { nc?: number }).nc } });
    }
  }

  const todosCargos = { ...cargos, ...cargosAmp, ...(Object.assign({}, ...modulosBiblioteca.map((m) => m.cargos ?? {})) as typeof cargos) };
  for (const s of [...sectores, ...sectoresAmp, ...modulosBiblioteca.flatMap((m) => m.sectores ?? [])]) {
    let sector = await db.sectorTipo.findFirst({ where: { nombre: s.nombre } });
    if (!sector) { sector = await db.sectorTipo.create({ data: { nombre: s.nombre, ciius: s.ciius, descripcion: s.descripcion } }); conteo.sectores++; }
    else if (!sector.validado) sector = await db.sectorTipo.update({ where: { id: sector.id }, data: { ciius: s.ciius, descripcion: s.descripcion } });
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
  const extra = (tipo: string, xs: string[]) => xs.filter((n) => !/^no aplica/i.test(n) && !items.some((i) => i.tipo === tipo && i.nombre === n)).map((nombre) => ({ tipo, nombre, descripcion: "", detalle: {}, normas: [] as string[] }));
  items.push(...extra("EXAMEN", [...new Set(todos.flatMap((p) => p.examenesSugeridos))]), ...extra("EPP", [...new Set(todos.flatMap((p) => p.eppSugerido))]), ...extra("CAPACITACION", [...new Set(todos.flatMap((p) => p.capacitacionesSugeridas))]));
  for (const it of items) {
    const prev = await db.catalogoItem.findFirst({ where: { tipo: it.tipo, nombre: it.nombre, empresaId: null } });
    if (!prev) { await db.catalogoItem.create({ data: { ...it, detalle: it.detalle as object } }); conteo.catalogo++; }
    else if (it.tipo === "LISTA_INSPECCION") {
      // Se reemplazan los ítems solo si la lista sigue igual a una versión sembrada antes (no se pisa lo editado).
      // Si los ítems siguen iguales a la versión actual, solo se actualizan las normas que la sustentan.
      const actuales = JSON.stringify(((prev.detalle ?? {}) as { items?: string[] }).items ?? []);
      const anteriores = [...(LISTAS_SEMBRADAS_ANTES[it.nombre] ?? []), ...(LISTAS_ANTERIORES_2026_11[it.nombre] ? [LISTAS_ANTERIORES_2026_11[it.nombre]] : [])];
      if (actuales === JSON.stringify(it.detalle.items)) {
        if (JSON.stringify(prev.normas) !== JSON.stringify(it.normas)) await db.catalogoItem.update({ where: { id: prev.id }, data: { normas: it.normas } });
      } else if (anteriores.some((v) => JSON.stringify(v) === actuales))
        await db.catalogoItem.update({ where: { id: prev.id }, data: { detalle: it.detalle as object, normas: it.normas, descripcion: it.descripcion } });
    }
    else if (it.tipo === "FORMA_EVENTO") {
      // Solo agrega: causas, medidas y claves nuevas se suman sin quitar lo editado en Biblioteca;
      // la lección se reemplaza solo si sigue siendo un texto sembrado anterior.
      const a = (prev.detalle ?? {}) as Record<string, unknown>, b = it.detalle;
      const det: Record<string, unknown> = { ...a };
      for (const k of ["claves", "clasificaciones", "actos", "condiciones", "personales", "trabajo", "lesiones", "agentes", "partes"]) {
        const xs = Array.isArray(a[k]) ? (a[k] as string[]) : [];
        det[k] = [...xs, ...((b[k] as string[] | undefined) ?? []).filter((x) => !xs.includes(x))];
      }
      const ms = Array.isArray(a.medidas) ? (a.medidas as { descripcion: string }[]) : [];
      det.medidas = [...ms, ...((b.medidas as { descripcion: string }[] | undefined) ?? []).filter((m) => !ms.some((x) => x.descripcion === m.descripcion))];
      if (b.leccion && (!a.leccion || LECCIONES_SEMBRADAS_ANTES.includes(String(a.leccion)))) det.leccion = b.leccion;
      if (JSON.stringify(det) !== JSON.stringify(a)) await db.catalogoItem.update({ where: { id: prev.id }, data: { detalle: det as object } });
    }
  }
  const total = { peligros: await db.peligroCatalogo.count(), tareas: await db.tareaTipo.count(), cargos: await db.cargoTipo.count(), sectores: await db.sectorTipo.count(), zonas: await db.zonaTipo.count(), catalogo: await db.catalogoItem.count() };
  console.log("Biblioteca — nuevos:", conteo, "· totales:", total);
}

function req(m: Record<string, string>, k: string) {
  if (!m[k]) throw new Error(`Referencia no encontrada en biblioteca: ${k}`);
  return m[k];
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
