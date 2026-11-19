// Crea una empresa de demostración y genera su SG-SST completo. Uso: npx tsx scripts/demo.ts
import { db, consultoraActual } from "../src/lib/db";
import { aplicarCargoTipo, sugerirCargoTipo } from "../src/lib/matriz/instanciar";
import { generarDocumentos } from "../src/lib/generador/documentos";
import { construirContexto } from "../src/lib/generador/contexto";
import { recalcularEmpresa } from "../src/lib/empresa";

async function main() {
  const c = await consultoraActual();
  const sector = await db.sectorTipo.findFirstOrThrow({ where: { nombre: { startsWith: "Restaurantes" } } });
  await db.empresa.deleteMany({ where: { nit: "900123456" } });
  const e = await db.empresa.create({ data: {
    consultoraId: c.id, razonSocial: "Sabores de la Abuela S.A.S.", nit: "900123456", digitoVerificacion: "7", direccion: "Calle 10 # 20-30", ciudad: "Medellín", departamento: "Antioquia",
    telefono: "6045551234", correo: "gerencia@saboresabuela.co", representanteLegal: "María Fernanda Gómez", representanteCedula: "43.123.456",
    ciiu: "5611", descripcionActividad: "Expendio a la mesa de comidas preparadas (restaurante)", claseRiesgo: 2, arl: "ARL SURA", epsPrincipal: "EPS Sura",
    nTrabajadoresPlanta: 15, nContratistas: 1, nVehiculos: 0, horario: "Lunes a domingo 10:00 a 22:00", turnos: "Dos turnos rotativos",
    sectorTipoId: sector.id, disparadores: { manipulacionAlimentos: true, atencionPublico: true, cargas: true, conduccion: true },
    responsableSst: { nombre: "Laura Restrepo", cedula: "1.036.000.111", cargo: "Asesora externa SST", perfil: "profesional", licencia: "Res. 12345 de 2022", licenciaFecha: "2022-03-01", curso50h: true, curso50hFecha: "2023-05-10" },
    sedes: { create: { nombre: "Sede principal", direccion: "Calle 10 # 20-30", ciudad: "Medellín", principal: true } },
  } });
  const cargos: [string, number][] = [["Gerente", 1], ["Chef", 1], ["Auxiliar de cocina", 4], ["Mesero", 5], ["Cajero", 1], ["Steward", 2], ["Domiciliario", 1]];
  for (const [nombre, n] of cargos) {
    const cg = await db.cargo.create({ data: { empresaId: e.id, nombre, nPersonas: n } });
    const t = await sugerirCargoTipo(nombre, sector.id);
    console.log(`  ${nombre} → ${t?.nombre ?? "(sin tipo)"}`);
    if (t) await aplicarCargoTipo(e.id, cg.id, t.id, "aprobado");
  }
  await recalcularEmpresa(e.id);
  const ctx = await construirContexto(e.id);
  console.log(`Nivel ${ctx.empresa.nivel} (${ctx._reglas.nivelNormaRef}); estándares ${ctx._reglas.estandares.length}; comités ${ctx._reglas.comites.join(",")}`);
  console.log(`Matriz: ${ctx.matriz.filas.length} filas, ${ctx.matriz.prioritarios.length} prioritarios; normas ${ctx.normas.length}; documentos ${ctx._reglas.documentos.length}; plan ${ctx.plan.length} actividades`);
  console.log("Advertencias:", ctx._reglas.advertencias);
  const r = await generarDocumentos(e.id);
  console.log(`Documentos generados: ${r.length}: ${r.map((x) => x.codigo).join(", ")}`);
  const secs = await db.documentoSeccion.findMany({ where: { documento: { empresaId: e.id } }, include: { documento: true } });
  const malos = secs.filter((s) => /\{\{|\}\}|undefined|\[object Object\]|NaN/.test(s.contenidoGenerado));
  console.log(`Secciones: ${secs.length}; con marcadores sin resolver: ${malos.length}`);
  for (const m of malos.slice(0, 10)) console.log("  ✗", m.documento.codigo, m.titulo, (m.contenidoGenerado.match(/.{0,60}(\{\{|\}\}|undefined|\[object Object\]|NaN).{0,40}/) ?? [])[0]);
}
main().then(() => db.$disconnect()).catch(async (err) => { console.error(err); await db.$disconnect(); process.exit(1); });
