// Trazabilidad de datos: qué dato falta para que los documentos salgan completos, dónde se llena
// y qué documentos lo usan. Los documentos se calculan leyendo las plantillas (no a mano), así que
// si una plantilla empieza a usar un dato, aparece sola en la lista.
import { db } from "@/lib/db";
import { camposAplicables, type Complementarios, type Persona } from "@/lib/complementarios";

export type Faltante = { id: string; grupo: string; dato: string; detalle?: string; href: string; boton: string; docs: string[] };

const vacio = (v: unknown) => !String(v ?? "").trim();
// Con artículo, para frases como «Integrantes del COPASST» o «Integrantes de la Brigada».
const NOMBRE_COMITE: Record<string, string> = { COPASST: "del COPASST", VIGIA: "del Vigía de SST", CCL: "del Comité de Convivencia Laboral", BRIGADA: "de la Brigada de emergencias" };
const CLAVE_COMITE: Record<string, string> = { COPASST: "copasst", VIGIA: "copasst", CCL: "ccl", BRIGADA: "brigada" };

export async function completitud(empresaId: string) {
  const e = await db.empresa.findUniqueOrThrow({
    where: { id: empresaId },
    include: {
      consultora: true, comites: { include: { miembros: true } },
      trabajadores: { where: { activo: true }, include: { examenes: true } },
      capacitaciones: true, inspecciones: true, acciones: { where: { estado: "abierta" } },
    },
  });
  const aplicables = ((e.resultadoReglas as { documentos?: { codigo: string }[] } | null)?.documentos ?? []).map((d) => d.codigo);
  const plantillas = await db.plantilla.findMany({ where: { codigo: { in: aplicables } }, select: { codigo: true, contenidoMd: true } });
  const usan = (re: RegExp) => plantillas.filter((p) => re.test(p.contenidoMd)).map((p) => p.codigo).sort();
  const B = `/empresas/${empresaId}`;
  const out: Faltante[] = [];
  const add = (f: Omit<Faltante, "docs"> & { re?: RegExp; docs?: string[] }) => {
    const docs = (f.docs ?? (f.re ? usan(f.re) : [])).filter((d) => aplicables.includes(d));
    if (docs.length) out.push({ id: f.id, grupo: f.grupo, dato: f.dato, detalle: f.detalle, href: f.href, boton: f.boton, docs });
  };

  // ── Empresa ──
  const emp = (id: string, dato: string, v: unknown, re: RegExp) => vacio(v) && add({ id, grupo: "Datos de la empresa", dato, href: `${B}/datos`, boton: "Ir a Datos", re });
  emp("rep", "Representante legal", e.representanteLegal, /empresa\.representanteLegal/);
  emp("repdoc", "Documento del representante legal", e.representanteCedula, /empresa\.representante(Doc|Cedula)/);
  emp("arl", "ARL", e.arl, /empresa\.arl\b/);
  emp("eps", "EPS principal", e.epsPrincipal, /empresa\.eps\b/);
  emp("dir", "Dirección", e.direccion, /empresa\.direccion/);
  emp("ciudad", "Ciudad", e.ciudad, /empresa\.ciudad/);
  emp("tel", "Teléfono de la empresa", e.telefono, /empresa\.telefono/);
  emp("correo", "Correo de la empresa", e.correo, /empresa\.correo/);
  emp("ciiu", "Actividad económica (CIIU)", e.ciiu || e.descripcionActividad, /empresa\.(ciiu|actividad)\b/);
  emp("horario", "Horario de trabajo", e.horario, /empresa\.horario/);

  // ── Responsable del SG-SST ──
  const r = (e.responsableSst ?? {}) as Record<string, string>;
  const resp = (id: string, dato: string, v: unknown, re: RegExp) => vacio(v) && add({ id, grupo: "Responsable del SG-SST", dato, href: `${B}/datos`, boton: "Ir a Datos", re });
  resp("rnombre", "Nombre del responsable", r.nombre, /responsable\.nombre/);
  resp("rdoc", "Documento del responsable", r.cedula, /responsable\.(doc|cedula)\b/);
  resp("rlic", "Licencia SST del responsable", r.licencia, /responsable\.licencia\b/);

  // ── Consultora (global) ──
  const c = e.consultora;
  const con = (id: string, dato: string, v: unknown, re: RegExp) => vacio(v) && add({ id, grupo: "Mi consultora (todas las empresas)", dato, href: "/configuracion", boton: "Ir a Mi consultora", re });
  con("cprof", "Nombre de la profesional", c?.profesional, /consultora\.profesional/);
  con("cdoc", "Documento de la profesional", c?.cedula, /consultora\.(doc|cedula)\b/);
  con("clic", "Licencia SST de la profesional", c?.licenciaSst, /consultora\.licencia\b/);

  // ── Datos complementarios ──
  const comp = (e.datosComplementarios ?? {}) as Complementarios;
  for (const s of camposAplicables((e.disparadores ?? {}) as Record<string, boolean>)) for (const f of s.campos) {
    const v = comp[f.k];
    const href = `${B}/datos#complementarios`;
    if (f.tipo === "tabla") {
      const filas = (Array.isArray(v) ? v : []).filter((x) => Object.values(x ?? {}).some((y) => !vacio(y)));
      if (!filas.length) { add({ id: `c-${f.k}`, grupo: s.titulo, dato: f.etiqueta, href, boton: "Completar datos", docs: f.usadoEn }); continue; }
      const cols = (f.columnas ?? []).filter((col) => !col.opcional);
      const incompletas = filas.filter((x) => cols.some((col) => vacio(x[col.k])));
      if (incompletas.length) add({ id: `c-${f.k}-inc`, grupo: s.titulo, dato: f.etiqueta, detalle: `${incompletas.length} fila(s) con columnas vacías (${[...new Set(incompletas.flatMap((x) => cols.filter((col) => vacio(x[col.k])).map((col) => col.etiqueta)))].join(", ")})`, href, boton: "Completar datos", docs: f.usadoEn });
    } else if (f.tipo === "persona") {
      if (vacio((v as Persona | undefined)?.nombre)) add({ id: `c-${f.k}`, grupo: s.titulo, dato: f.etiqueta, href, boton: "Completar datos", docs: f.usadoEn });
    } else if (vacio(v)) add({ id: `c-${f.k}`, grupo: s.titulo, dato: f.etiqueta, href, boton: "Completar datos", docs: f.usadoEn });
  }

  // ── Comités ──
  const rr = (e.resultadoReglas ?? {}) as { comites?: string[] };
  const requeridos = [...new Set([...(rr.comites ?? []), "BRIGADA"])];
  for (const tipo of requeridos) {
    // El CCL de nivel central (sin sede) es el que alimenta los documentos; los de sede se revisan en Comités.
    const candidatos = e.comites.filter((x) => x.tipo === tipo || (tipo === "COPASST" && x.tipo === "VIGIA") || (tipo === "VIGIA" && x.tipo === "COPASST"));
    const com = candidatos.find((x) => !x.sede) ?? candidatos[0];
    const k = CLAVE_COMITE[tipo] ?? tipo.toLowerCase();
    const re = new RegExp(`integrantes\\.${k}\\b`);
    const nombre = NOMBRE_COMITE[com?.tipo ?? tipo] ?? `del ${tipo}`;
    const g = { grupo: "Comités", href: `${B}/comites`, boton: "Ir a Comités" };
    if (!com?.miembros.length) { add({ id: `com-${k}`, ...g, dato: `Integrantes ${nombre}`, re }); continue; }
    if (tipo !== "BRIGADA" && (!com.periodoInicio || !com.periodoFin)) add({ id: `com-${k}-per`, ...g, dato: `Periodo ${nombre}`, detalle: "Fecha de conformación y vencimiento", re: new RegExp(`integrantes\\.${k}\\.(inicio|fin)`) });
    const sinDoc = com.miembros.filter((m) => vacio(m.cedula));
    if (sinDoc.length) add({ id: `com-${k}-doc`, ...g, dato: `Documento de integrantes ${nombre}`, detalle: sinDoc.map((m) => m.nombre).join(", "), re: new RegExp(`integrantes\\.${k}|each (miembros|empleador|trabajadores)`) });
    // Elección por votación de los trabajadores: COPASST (Res. 2013/1986 art. 2) y CCL (Res. 3461/2025 art. 3).
    if ((k === "copasst" && com.tipo === "COPASST") || k === "ccl") {
      const d = (com.datos ?? {}) as Record<string, unknown>;
      const sigla = k === "ccl" ? "Comité de Convivencia Laboral" : "COPASST";
      if (vacio(d.fechaVotacion) || !(Array.isArray(d.resultados) && d.resultados.length)) add({ id: `com-${k}-eleccion`, ...g, dato: `Datos de la elección del ${sigla}`, detalle: "Convocatoria, votación, resultados y escrutinio", re: new RegExp(`integrantes\\.${k}\\.eleccion`) });
    }
  }

  // ── Matriz legal: evaluación de cumplimiento ──
  const normasMtz = await normasMatrizLegal(empresaId);
  const evalLegal = (comp.cumplimientoLegal ?? {}) as unknown as Record<string, { cumple?: string }>;
  const sinEvaluar = normasMtz.filter((n) => vacio(evalLegal[n]?.cumple)).length;
  if (sinEvaluar) add({ id: "legal", grupo: "Matriz legal", dato: "Evaluación de cumplimiento de requisitos legales", detalle: `${sinEvaluar} norma(s) sin evaluar`, href: `${B}/documentos/MTZ-01`, boton: "Evaluar", docs: ["MTZ-01"] });

  // ── Registros ──
  const reg = { grupo: "Registros" };
  if (!e.trabajadores.length) add({ id: "trab", ...reg, dato: "Trabajadores", detalle: "Sin trabajadores registrados: los registros de exámenes, EPP y capacitación salen como formatos en blanco", href: `${B}/trabajadores`, boton: "Ir a Trabajadores", re: /nomina\./ });
  const exSin = e.trabajadores.flatMap((t) => t.examenes).filter((x) => !x.comunicadoTrabajador);
  if (exSin.length) add({ id: "exam", ...reg, dato: "Comunicación del concepto médico", detalle: `${exSin.length} examen(es) sin fecha de comunicación al trabajador`, href: `${B}/trabajadores`, boton: "Ir a Trabajadores", docs: ["FOR-02"] });
  const capSin = e.capacitaciones.filter((x) => vacio(x.facilitador));
  if (capSin.length) add({ id: "cap", ...reg, dato: "Facilitador de capacitaciones", detalle: `${capSin.length} capacitación(es) sin facilitador`, href: `${B}/trabajadores`, boton: "Ir a Trabajadores", docs: ["PRG-01"] });
  const inspSin = e.inspecciones.filter((x) => vacio(x.lugar));
  if (inspSin.length) add({ id: "insp", ...reg, dato: "Lugar de inspecciones", detalle: `${inspSin.length} inspección(es) sin lugar`, href: `${B}/inspecciones`, boton: "Ir a Inspecciones", docs: ["PRG-06"] });
  const accSin = e.acciones.filter((x) => vacio(x.causa));
  if (accSin.length) {
    const a = accSin[0];
    const href = a.eventoId ? `${B}/accidentes/${a.eventoId}` : a.auditoriaId ? `${B}/auditoria/${a.auditoriaId}` : a.inspeccionId ? `${B}/inspecciones` : `${B}/accidentes`;
    add({ id: "acc", ...reg, dato: "Causa raíz de acciones abiertas", detalle: `${accSin.length} acción(es) sin causa`, href, boton: "Ver acción", docs: ["FOR-06"] });
  }

  const porDocumento: Record<string, Faltante[]> = {};
  for (const f of out) for (const d of f.docs) (porDocumento[d] ??= []).push(f);
  const docsCompletos = aplicables.filter((d) => !porDocumento[d]).length;
  return { faltantes: out, porDocumento, aplicables: aplicables.length, docsCompletos, pct: aplicables.length ? Math.round((docsCompletos / aplicables.length) * 100) : 100 };
}

/** Normas de la matriz legal (MTZ-01): las de las reglas más las de los peligros aprobados de la matriz. */
export async function normasMatrizLegal(empresaId: string) {
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { resultadoReglas: true, peligros: { where: { estado: "aprobado" }, select: { peligro: { select: { normas: true } } } } } });
  const set = new Set(((e.resultadoReglas as { normas?: { codigo: string }[] } | null)?.normas ?? []).map((n) => n.codigo));
  for (const p of e.peligros) p.peligro?.normas.forEach((n) => set.add(n));
  const vigentes = await db.norma.findMany({ where: { codigo: { in: [...set] }, vigente: true }, select: { codigo: true } });
  return vigentes.map((n) => n.codigo);
}
