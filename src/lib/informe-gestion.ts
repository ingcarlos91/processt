// Informe de gestión del SG-SST para la gerencia del cliente: lo que la consultora hizo en el periodo, en qué punto va
// el sistema, qué sigue y qué le toca a la empresa. Periodo: mes, trimestre, semestre, año o desde el inicio del SG-SST.
import { db } from "@/lib/db";
import { calcularMensuales, calcularAnuales } from "@/lib/indicadores";
import { estadoDocumento } from "@/lib/estado-documento";
import { fechasPlaneador } from "@/lib/planeador";
import { docTexto } from "@/lib/documento-identidad";
import { comparativoDiagnostico } from "@/lib/diagnostico";
import { rutaEmpresa } from "@/lib/ruta";
import { TIPOS_EXAMEN } from "@/lib/examenes";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const c = (t: unknown) => String(t ?? "").replace(/\|/g, "/").replace(/\n/g, " ").trim();
const f2 = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("es-CO", { maximumFractionDigits: 2 }));
const fecha = (d: Date) => d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
/** Barra de avance en texto (se ve igual en Word y en PDF). */
const barra = (pct: number) => { const n = Math.round(Math.max(0, Math.min(100, pct)) / 10); return `${"█".repeat(n)}${"░".repeat(10 - n)} ${Math.round(pct)} %`; };
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export type Periodo = { clave: string; desde: Date; hasta: Date; etiqueta: string; corto: string };

/**
 * Periodo del informe a partir de `p`: "mes:2026-11", "trim:2026-4", "sem:2026-2", "anio:2026" o "inicio".
 * "inicio" va desde que se montó el SG-SST hasta hoy.
 */
export function periodoDe(p: string, inicioSgsst: Date | null, hoy = new Date()): Periodo {
  const [tipo, v = ""] = p.split(":");
  const [a, n] = v.split("-").map(Number);
  const anio = a || hoy.getFullYear();
  const rango = (m1: number, m2: number) => ({ desde: new Date(Date.UTC(anio, m1 - 1, 1)), hasta: new Date(Date.UTC(anio, m2, 0, 23, 59, 59)) });
  if (tipo === "trim") { const t = Math.min(4, Math.max(1, n || 1)); return { clave: p, ...rango(t * 3 - 2, t * 3), etiqueta: `${["primer", "segundo", "tercer", "cuarto"][t - 1]} trimestre de ${anio} (${MESES[t * 3 - 3]} a ${MESES[t * 3 - 1]})`, corto: `T${t}-${anio}` }; }
  if (tipo === "sem") { const s = n === 2 ? 2 : 1; return { clave: p, ...rango(s === 1 ? 1 : 7, s === 1 ? 6 : 12), etiqueta: `${s === 1 ? "primer" : "segundo"} semestre de ${anio} (${s === 1 ? "enero a junio" : "julio a diciembre"})`, corto: `S${s}-${anio}` }; }
  if (tipo === "anio") return { clave: p, ...rango(1, 12), etiqueta: `año ${anio}`, corto: String(anio) };
  if (tipo === "inicio") {
    const desde = inicioSgsst ?? new Date(Date.UTC(hoy.getFullYear(), 0, 1));
    return { clave: p, desde, hasta: hoy, etiqueta: `desde el inicio del SG-SST (${fecha(desde)}) hasta ${fecha(hoy)}`, corto: "acumulado" };
  }
  const m = Math.min(12, Math.max(1, n || hoy.getMonth() + 1));
  return { clave: `mes:${anio}-${m}`, ...rango(m, m), etiqueta: `${MESES[m - 1]} de ${anio}`, corto: `${anio}-${String(m).padStart(2, "0")}` };
}

/** Meses (año, mes) que toca el periodo, para el plan y los indicadores. */
function mesesDe(p: Periodo) {
  const out: { anio: number; mes: number }[] = [];
  const d = new Date(Date.UTC(p.desde.getUTCFullYear(), p.desde.getUTCMonth(), 1));
  while (d <= p.hasta && out.length < 60) { out.push({ anio: d.getUTCFullYear(), mes: d.getUTCMonth() + 1 }); d.setUTCMonth(d.getUTCMonth() + 1); }
  return out;
}

const NOMBRE_COMITE: Record<string, string> = { COPASST: "COPASST", VIGIA: "Vigía de SST", CCL: "Comité de Convivencia Laboral", BRIGADA: "Brigada de emergencias" };
const TIPO_EV: Record<string, string> = { AT: "Accidente de trabajo", INCIDENTE: "Incidente", EL: "Enfermedad laboral", AUSENTISMO: "Ausentismo" };

/** Observaciones guardadas para un periodo (para precargar el campo antes de descargar). */
export async function observacionesInforme(empresaId: string) {
  const e = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { datosComplementarios: true } });
  return (((e.datosComplementarios ?? {}) as { observacionesInforme?: Record<string, string> }).observacionesInforme ?? {});
}

export async function informeGestion(empresaId: string, p: string) {
  const base = await db.empresa.findUniqueOrThrow({ where: { id: empresaId }, select: { fechaInicioSgsst: true } });
  const per = periodoDe(p, base.fechaInicioSgsst);
  const en = (d?: Date | null) => !!d && d >= per.desde && d <= per.hasta;
  const meses = mesesDe(per);
  const anios = [...new Set(meses.map((x) => x.anio))];
  const e = await db.empresa.findUniqueOrThrow({
    where: { id: empresaId },
    include: {
      consultora: true,
      evaluaciones: { orderBy: { fecha: "desc" } },
      actividades: { where: { anio: { in: anios } }, include: { evidencias: { where: { activo: true } } }, orderBy: [{ anio: "asc" }, { mes: "asc" }, { nombre: "asc" }] },
      eventos: { orderBy: { fecha: "asc" } },
      acciones: { orderBy: { fecha: "asc" } },
      documentos: { include: { secciones: { select: { requiereRevision: true } }, archivos: { where: { activo: true, tipo: "DOCUMENTO_FIRMADO" }, orderBy: { subidoEn: "desc" } } }, orderBy: { codigo: "asc" } },
      comites: { include: { archivos: { where: { activo: true } }, miembros: { select: { id: true } } } },
      trabajadoresMes: true,
      visitas: { orderBy: { fecha: "asc" } },
      capacitaciones: { orderBy: { fecha: "asc" }, include: { _count: { select: { asistentes: true } } } },
      inspecciones: { orderBy: { fecha: "asc" } },
      matrizVersiones: { orderBy: { fecha: "asc" }, select: { numero: true, motivo: true, fecha: true } },
      auditorias: { select: { anio: true, estado: true, fechaCierre: true } },
      diagnosticos: { select: { estado: true, cerradoEn: true, puntaje: true, valoracion: true } },
      trabajadores: { where: { activo: true }, select: { id: true, examenes: { select: { fecha: true, tipo: true } }, entregasEpp: { select: { fecha: true, cantidad: true } } } },
    },
  });
  const r = (e.responsableSst ?? {}) as { nombre?: string; tipoDoc?: string; cedula?: string };
  const obsConsultora = (((e.datosComplementarios ?? {}) as { observacionesInforme?: Record<string, string> }).observacionesInforme ?? {})[per.clave] ?? "";
  const consultora = e.consultora?.profesional || r.nombre || "la consultora";
  const [comparativo, ruta] = await Promise.all([comparativoDiagnostico(empresaId), rutaEmpresa(empresaId)]);
  // Estado actual: la última autoevaluación anual cerrada; si no hay, la evaluación inicial (mismo criterio del comparativo).
  const ev = [...e.evaluaciones].sort((x, y) => (y.cerrada ? 1 : 0) - (x.cerrada ? 1 : 0) || (x.tipo === "inicial" ? 1 : 0) - (y.tipo === "inicial" ? 1 : 0) || y.fecha.getTime() - x.fecha.getTime())[0];
  const puntaje = ev ? (ev.nivel === 60 ? ev.puntajeBruto : ev.puntajeAjustado) : null;

  // ── Plan anual en el periodo ──
  const delPeriodo = e.actividades.filter((a) => meses.some((m) => m.anio === a.anio && m.mes === a.mes) && a.estado !== "CANCELADA");
  const ejecutadas = delPeriodo.filter((a) => a.estado === "EJECUTADA");
  const hoy = new Date();
  const vencidas = e.actividades.filter((a) => a.estado === "PENDIENTE" && (a.anio < hoy.getFullYear() || (a.anio === hoy.getFullYear() && a.mes < hoy.getMonth() + 1)) && new Date(Date.UTC(a.anio, a.mes, 0)) <= per.hasta);

  // ── Logros del periodo (con fecha) ──
  const firmadosPer = e.documentos.flatMap((d) => d.archivos.filter((a) => en(a.subidoEn)).map((a) => ({ d, a })));
  const comitesPer = e.comites.filter((cm) => en(cm.periodoInicio));
  const actasPer = e.comites.flatMap((cm) => cm.archivos.filter((a) => en(a.fecha)).map((a) => ({ cm, a })));
  const capsPer = e.capacitaciones.filter((x) => en(x.fecha));
  const inspPer = e.inspecciones.filter((x) => en(x.fecha));
  const cumplInsp = (items: unknown) => { const it = (Array.isArray(items) ? items : []) as { resultado?: string }[]; const ap = it.filter((i) => i.resultado && i.resultado !== "na"); return ap.length ? pct(ap.filter((i) => i.resultado === "cumple").length, ap.length) : null; };
  const examenesPer = e.trabajadores.flatMap((t) => t.examenes.filter((x) => en(x.fecha)));
  const eppPer = e.trabajadores.flatMap((t) => t.entregasEpp.filter((x) => en(x.fecha)));
  const versionesPer = e.matrizVersiones.filter((v) => en(v.fecha));
  const eventosPer = e.eventos.filter((x) => en(x.fecha));
  const invCerradas = e.eventos.filter((x) => x.invEstado === "cerrada" && en(x.invCierre));
  const accCerradas = e.acciones.filter((a) => a.estado === "cerrada" && en(a.fechaCierre));
  const evalsPer = e.evaluaciones.filter((x) => x.cerrada && en(x.fecha));
  const audsPer = e.auditorias.filter((a) => a.estado === "cerrada" && en(a.fechaCierre));
  const diagsPer = e.diagnosticos.filter((d) => d.estado === "cerrado" && en(d.cerradoEn));
  const inicioEnPeriodo = en(e.fechaInicioSgsst);

  // ── Trabajo de la consultora ──
  const visitasPer = e.visitas.filter((v) => en(v.fecha));
  const horas = visitasPer.reduce((s, v) => s + v.horas, 0);
  const horasPactadas = e.contratoHorasMes ? Math.round(e.contratoHorasMes * meses.length * 10) / 10 : null;

  // ── Acciones y documentos (estado a la fecha) ──
  const abiertas = e.acciones.filter((a) => a.estado === "abierta");
  const accVencidas = abiertas.filter((a) => a.fechaLimite && a.fechaLimite < hoy);
  const estados = e.documentos.map((d) => ({ d, est: estadoDocumento({ estado: d.estado, version: d.version, firmadoVersion: d.archivos[0]?.documentoVersion, revisar: d.secciones.some((s) => s.requiereRevision) }) }));
  const nEst = (k: string) => estados.filter((x) => x.est === k).length;
  const porFirmar = estados.filter((x) => x.est === "aprobado" || x.est === "volver_a_firmar");

  // ── Qué sigue: próximos 60 días ──
  const proximas = (await fechasPlaneador({ consultoraId: e.consultoraId, empresaId, desde: hoy, hasta: new Date(hoy.getTime() + 60 * 864e5) })).filter((x) => x.estado !== "hecho" && x.estado !== "vencido");

  // ── Compromisos que dependen de la empresa ──
  const sinExamen = e.trabajadores.filter((t) => !t.examenes.length).length;
  const sinEpp = e.trabajadores.filter((t) => !t.entregasEpp.length).length;
  const pasoDatos = ruta.pasos.find((x) => x.clave === "datos");
  const compromisos: string[] = [];
  if (porFirmar.length) compromisos.push(`Firmar ${porFirmar.length} documento(s) aprobados por la consultora (representante legal y responsable del SG-SST).`);
  if (pasoDatos && pasoDatos.estado !== "hecho" && pasoDatos.falta.length) compromisos.push(`Entregar la información pendiente: ${pasoDatos.falta.slice(0, 3).join("; ")}.`);
  if (sinExamen) compromisos.push(`Programar las evaluaciones médicas ocupacionales de ${sinExamen} trabajador(es) (Res. 1843/2025).`);
  if (sinEpp && e.trabajadores.length) compromisos.push(`Entregar y registrar los elementos de protección personal de ${sinEpp} trabajador(es) (Decreto 1072/2015 art. 2.2.4.6.24).`);
  // Acciones a cargo de la empresa: las que no tiene la consultora ni el responsable del SG-SST.
  const norm = (t?: string | null) => (t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const deConsultora = new Set([norm(r.nombre), norm(e.consultora?.profesional)].filter(Boolean));
  const accEmpresa = abiertas.filter((a) => a.responsable && !deConsultora.has(norm(a.responsable)) && !/consult|sg-sst|responsable del sg/i.test(a.responsable));
  if (accEmpresa.length) compromisos.push(`Ejecutar ${accEmpresa.length} acción(es) correctiva(s) o preventiva(s) a cargo de la empresa.`);
  if (e.contratoHorasMes == null) { /* sin contrato registrado */ }

  // ── Estado general y mensajes clave ──
  const pctPlan = pct(ejecutadas.length, delPeriodo.length);
  const critico = ev?.valoracion === "CRÍTICO" || accVencidas.length > 3 || vencidas.length > 5;
  const atencion = !critico && (ev?.valoracion === "MODERADAMENTE ACEPTABLE" || vencidas.length > 0 || accVencidas.length > 0 || (delPeriodo.length > 0 && pctPlan < 80));
  const estadoGeneral = critico ? "Requiere acción prioritaria" : atencion ? "En avance, con puntos por atender" : "Al día";
  const mensajes: string[] = [];
  if (ruta.actual) mensajes.push(ruta.actual.estado === "actual" ? `La implementación va en el paso ${ruta.actual.n} de ${ruta.pasos.length} (${ruta.actual.titulo}), con ${ruta.pct} % de avance.` : "La implementación del SG-SST está completa; el sistema está en operación.");
  if (comparativo?.actual) { const d = comparativo.actual.puntaje - comparativo.base.puntaje; mensajes.push(`El cumplimiento de estándares mínimos pasó de ${comparativo.base.puntaje} % en el diagnóstico a ${comparativo.actual.puntaje} % (${d >= 0 ? "+" : ""}${Math.round(d)} puntos).`); }
  else if (puntaje != null) mensajes.push(`El cumplimiento de estándares mínimos es ${puntaje} % (${(ev?.valoracion ?? "").toLowerCase()}).`);
  if (delPeriodo.length) mensajes.push(`Se ejecutaron ${ejecutadas.length} de ${delPeriodo.length} actividades del plan programadas en el periodo (${pctPlan} %).`);
  const logrosN = firmadosPer.length + comitesPer.length + capsPer.length + inspPer.length + versionesPer.length + invCerradas.length + accCerradas.length;
  if (logrosN) mensajes.push(`En el periodo se cerraron ${logrosN} entregables: ${[firmadosPer.length && `${firmadosPer.length} documento(s) firmado(s)`, capsPer.length && `${capsPer.length} capacitación(es)`, inspPer.length && `${inspPer.length} inspección(es)`, comitesPer.length && `${comitesPer.length} comité(s) conformado(s)`, accCerradas.length && `${accCerradas.length} acción(es) cerrada(s)`].filter(Boolean).join(", ")}.`);
  if (eventosPer.filter((x) => x.tipo === "AT").length) mensajes.push(`Se presentaron ${eventosPer.filter((x) => x.tipo === "AT").length} accidente(s) de trabajo en el periodo; su reporte e investigación se detallan más adelante.`);
  else mensajes.push("No se registraron accidentes de trabajo en el periodo.");

  // ── Indicadores por mes del periodo ──
  const baseTrab = e.nTrabajadoresPlanta + e.nEnMision + e.nContratistas + e.nAprendices;
  const filasInd = meses.slice(-12).map(({ anio, mes }) => ({ anio, mes, m: calcularMensuales(e.eventos, e.trabajadoresMes, anio, baseTrab)[mes - 1] }));
  const anuales = calcularAnuales(e.eventos, e.trabajadoresMes, per.hasta.getUTCFullYear(), baseTrab);

  const tabla = (cab: string[], filas: (string | number)[][], vacio: string) => filas.length ? `| ${cab.join(" | ")} |\n|${cab.map(() => "---").join("|")}|\n${filas.map((f) => `| ${f.map(c).join(" | ")} |`).join("\n")}` : vacio;

  const md = `## Datos del informe

| Campo | Información |
|---|---|
| Empresa | ${c(e.razonSocial)} — NIT ${c(e.digitoVerificacion ? `${e.nit}-${e.digitoVerificacion}` : e.nit)} |
| Periodo | ${c(per.etiqueta)} |
| Nivel de estándares | ${e.nivelEstandares} estándares mínimos (Res. 0312/2019) |
| Elaboró | ${c(consultora)}${e.consultora?.nombre ? ` — ${c(e.consultora.nombre)}` : ""} |
| Fecha de elaboración | ${fecha(hoy)} |

## Resumen ejecutivo

**Estado general: ${estadoGeneral}.**

${mensajes.map((m) => `- ${m}`).join("\n")}

| Indicador | Resultado |
|---|---|
| Avance de la implementación | ${barra(ruta.pct)} — ${ruta.actual?.estado === "actual" ? `paso ${ruta.actual.n} de ${ruta.pasos.length}: ${c(ruta.actual.titulo)}` : "en operación"} |
| Estándares mínimos | ${puntaje != null ? `${puntaje} % — ${c(ev?.valoracion ?? "en curso")}` : "Sin autoevaluación"}${comparativo ? ` (diagnóstico: ${comparativo.base.puntaje} %)` : ""} |
| Plan anual en el periodo | ${delPeriodo.length ? `${barra(pctPlan)} (${ejecutadas.length} de ${delPeriodo.length})` : "Sin actividades programadas en el periodo"} |
| Documentos firmados | ${e.documentos.length ? `${barra(pct(nEst("firmado"), e.documentos.length))} (${nEst("firmado")} de ${e.documentos.length})` : "—"} |
| Accidentes de trabajo en el periodo | ${eventosPer.filter((x) => x.tipo === "AT").length} |
| Acciones abiertas / vencidas | ${abiertas.length} / ${accVencidas.length} |
| Acompañamiento de la consultora | ${visitasPer.length} visita(s), ${horas.toLocaleString("es-CO")} horas${horasPactadas ? ` de ${horasPactadas} pactadas` : ""} |

## En qué punto vamos

La implementación sigue el orden del Decreto 1072 de 2015 (cap. 6) y la Resolución 0312 de 2019. Cada paso se da por cumplido con los registros del sistema.

${tabla(["Paso", "Estado", "Detalle"], ruta.pasos.map((x) => [`${x.n}. ${x.titulo}`, x.estado === "hecho" ? "Cumplido" : x.estado === "actual" ? "En curso" : x.estado === "continuo" ? "En operación" : x.estado === "bloqueado" ? "Por iniciar" : "Pendiente", x.estado === "hecho" ? (x.avance ? `${x.avance.total} de ${x.avance.total}` : "—") : [x.avance ? `${x.avance.hechos} de ${x.avance.total}` : "", ...x.falta.slice(0, 2)].filter(Boolean).join("; ") || "—"]), "")}
${comparativo?.actual ? `
### Cumplimiento por ciclo PHVA

${tabla(["Ciclo", "Diagnóstico", "Actual", "Variación"], (["PLANEAR", "HACER", "VERIFICAR", "ACTUAR"] as const).map((k) => { const a = comparativo.base.porCiclo?.[k]?.pct ?? null; const b = comparativo.actual!.porCiclo?.[k]?.pct ?? null; return [k.charAt(0) + k.slice(1).toLowerCase(), a == null ? "—" : `${a} %`, b == null ? "—" : `${b} %`, a == null || b == null ? "—" : `${b - a >= 0 ? "+" : ""}${Math.round(b - a)} puntos`]; }), "")}
` : ""}
## Logros del periodo

${[
  inicioEnPeriodo && `- **Inicio del SG-SST** el ${fecha(e.fechaInicioSgsst!)}.`,
  ...diagsPer.map((d) => `- **Diagnóstico de estándares mínimos** cerrado el ${fecha(d.cerradoEn!)}: ${d.puntaje ?? "—"} % (${c(d.valoracion).toLowerCase()}).`),
  ...evalsPer.map((x) => `- **${x.tipo === "inicial" ? "Evaluación inicial" : `Autoevaluación ${x.anio}`}** del ${fecha(x.fecha)}: ${x.nivel === 60 ? x.puntajeBruto : x.puntajeAjustado} % (${c(x.valoracion).toLowerCase()}).`),
  ...audsPer.map((a) => `- **Auditoría interna ${a.anio}** cerrada el ${fecha(a.fechaCierre!)}.`),
  ...versionesPer.map((v) => `- **Matriz de peligros, versión ${v.numero}** (${c(v.motivo)}) cerrada el ${fecha(v.fecha)}.`),
  ...comitesPer.map((cm) => `- **${NOMBRE_COMITE[cm.tipo] ?? cm.tipo}** conformado el ${fecha(cm.periodoInicio!)} con ${cm.miembros.length} integrante(s).`),
].filter(Boolean).join("\n") || "Sin hitos de implementación en el periodo."}

### Documentos firmados

${tabla(["Fecha", "Documento"], firmadosPer.map((x) => [fecha(x.a.subidoEn), `${x.d.codigo} ${x.d.nombre}`]), "Ningún documento firmado en el periodo.")}

### Capacitaciones realizadas

${tabla(["Fecha", "Tema", "Horas", "Asistentes"], capsPer.map((x) => [fecha(x.fecha), x.tema, f2(x.horas), x._count.asistentes]), "Ninguna capacitación registrada en el periodo.")}

### Inspecciones

${tabla(["Fecha", "Lista", "Cumplimiento"], inspPer.map((x) => { const p = cumplInsp(x.items); return [fecha(x.fecha), x.lista, p == null ? "—" : `${p} %`]; }), "Ninguna inspección registrada en el periodo.")}

### Salud y protección de los trabajadores

- Evaluaciones médicas registradas: ${examenesPer.length}${examenesPer.length ? ` (${Object.entries(examenesPer.reduce((acc, x) => { acc[x.tipo] = (acc[x.tipo] ?? 0) + 1; return acc; }, {} as Record<string, number>)).map(([k, n]) => `${n} ${(TIPOS_EXAMEN[k] ?? k).toLowerCase()}`).join(", ")})` : ""}.
- Entregas de elementos de protección personal: ${eppPer.length} (${eppPer.reduce((s, x) => s + x.cantidad, 0)} unidades).
- Actas de comités subidas: ${actasPer.length}.

### Investigaciones y acciones cerradas

${tabla(["Fecha", "Qué se cerró", "Detalle"], [
  ...invCerradas.map((x) => [fecha(x.invCierre!), `Investigación de ${(TIPO_EV[x.tipo] ?? x.tipo).toLowerCase()}`, `${fecha(x.fecha)}${x.cargo ? ` · ${x.cargo}` : ""}`]),
  ...accCerradas.map((a) => [fecha(a.fechaCierre!), `Acción ${a.tipo}`, `${a.descripcion}${a.eficacia ? ` — eficacia: ${a.eficacia}` : ""}`]),
], "Ninguna investigación ni acción cerrada en el periodo.")}

## Trabajo de la consultora

${visitasPer.length ? `${visitasPer.length} visita(s) y ${horas.toLocaleString("es-CO")} horas de asesoría${horasPactadas ? ` de ${horasPactadas} pactadas para el periodo (${pct(horas, horasPactadas)} %)` : ""}.

${tabla(["Fecha", "Horas", "Modalidad", "Actividades", "Compromisos"], visitasPer.map((v) => [fecha(v.fecha), v.horas, v.modalidad === "virtual" ? "Virtual" : "Presencial", c(v.actividades).replace(/ {2,}/g, " "), v.compromisos ?? ""]), "")}` : "No se registraron visitas en el periodo."}

## Plan anual de trabajo en el periodo

${tabla(["Mes", "Actividad", "Estándar", "Estado", "Evidencias"], delPeriodo.slice(0, 80).map((a) => [`${MESES[a.mes - 1]} ${a.anio}`, a.nombre, a.estandarCodigo ?? "", a.estado === "EJECUTADA" ? `Ejecutada${a.fechaEjecucion ? ` (${fecha(a.fechaEjecucion)})` : ""}` : "Pendiente", a.evidencias.length || "—"]), "Sin actividades programadas en el periodo.")}${delPeriodo.length > 80 ? `\n\n(Se muestran 80 de ${delPeriodo.length} actividades; el detalle completo está en el plan anual PLN-01.)` : ""}
${vencidas.length ? `
### Actividades vencidas

${tabla(["Mes", "Actividad", "Responsable"], vencidas.slice(0, 30).map((a) => [`${MESES[a.mes - 1]} ${a.anio}`, a.nombre, a.responsable ?? ""]), "")}
` : ""}
## Accidentalidad e indicadores

${tabla(["Mes", "Trabajadores", "Accidentes", "Frecuencia (por 100 trabajadores)", "Severidad (por 100 trabajadores)", "Ausentismo (%)"], filasInd.map(({ anio, mes, m }) => [`${MESES[mes - 1]} ${anio}`, m.trabajadores || "Sin registrar", m.accidentes, f2(m.frecuencia), f2(m.severidad), f2(m.ausentismo)]), "")}

Proporción de accidentes mortales del año: ${f2(anuales.mortalidad)}${anuales.mortalidad == null ? " (sin accidentes de trabajo)" : " %"}. Indicadores de la Resolución 0312 de 2019, art. 30.

${eventosPer.length ? tabla(["Fecha", "Evento", "Cargo", "Días", "Reporte ARL", "Investigación"], eventosPer.map((x) => [fecha(x.fecha), TIPO_EV[x.tipo] ?? x.tipo, x.cargo ?? "", x.diasIncapacidad, x.fechaReporte ? fecha(x.fechaReporte) : x.reportadoArl ? "Reportado" : "Pendiente", x.invEstado === "cerrada" ? "Cerrada" : x.invEstado === "no_aplica" ? "No aplica" : "En curso"]), "") : "Sin eventos registrados en el periodo."}

## Acciones correctivas, preventivas y de mejora abiertas

${tabla(["Acción", "Responsable", "Fecha límite", "Estado"], abiertas.slice(0, 30).map((a) => [a.descripcion, a.responsable ?? "", a.fechaLimite ? fecha(a.fechaLimite) : "—", a.fechaLimite && a.fechaLimite < hoy ? "Vencida" : "En curso"]), "No hay acciones abiertas.")}

## Qué sigue

${ruta.actual ? `**Siguiente paso de la implementación: ${c(ruta.actual.titulo)}.** ${c(ruta.actual.que)}${ruta.actual.falta.length ? ` Falta: ${ruta.actual.falta.slice(0, 3).map(c).join("; ")}.` : ""}` : "La implementación está completa; se continúa con la operación del sistema según el plan anual."}

### Próximos 60 días

${tabla(["Fecha", "Qué", "Fundamento"], proximas.slice(0, 25).map((x) => [x.mesCompleto ? `${MESES[Number(x.fecha.slice(5, 7)) - 1]} (en el mes)` : fecha(new Date(x.fecha)), x.titulo, x.normaRef ?? ""]), "Sin fechas programadas en los próximos 60 días.")}

### Compromisos de la empresa

${compromisos.length ? compromisos.map((x, i) => `${i + 1}. ${x}`).join("\n") : "No hay compromisos pendientes a cargo de la empresa."}

## Observaciones de la consultora

${obsConsultora ? obsConsultora.split(/\n+/).map((l) => c(l)).filter(Boolean).join("\n\n") : "______________________________________________________________________________\n\n______________________________________________________________________________"}

______________________________________
**${c(consultora)}** — ${c(e.consultora?.cargo || "Consultora en SST")}${e.consultora?.licenciaSst ? `, licencia SST ${c(e.consultora.licenciaSst)}` : ""} — ${docTexto(e.consultora?.tipoDoc, e.consultora?.cedula)}

______________________________________
**${c(e.representanteLegal || "Representante legal")}** — Recibido, representante legal — ${docTexto(e.representanteTipoDoc, e.representanteCedula)}
`;
  return { md, titulo: `Informe de gestión del SG-SST — ${per.etiqueta}`, empresa: e, periodo: per };
}
