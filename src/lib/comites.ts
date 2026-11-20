// Conformación de comités: calidad de los integrantes, composición exigida (congelada al conformar) y validación.
// Puro (sin base de datos): lo usan el editor de comités, las acciones, el contexto de plantillas y los scripts.
import { composicionCopasst } from "@/lib/reglas/motor";
import { composicionCcl } from "@/lib/reglas/condicion";

export type Calidad = "principal" | "suplente";

/** Calidad (principal o suplente) separada del cargo en el comité. Si no se registró, se deriva del rol antiguo. */
export function calidadDe(rol: string, calidad?: string | null): Calidad | null {
  if (calidad === "principal" || calidad === "suplente") return calidad;
  if (rol === "brigadista" || rol === "jefe_brigada") return null;
  return rol.startsWith("suplente") ? "suplente" : "principal";
}

/** Cargo dentro del comité (presidente o secretario), independiente de la calidad. */
export const cargoComiteDe = (rol: string) => (rol === "presidente" || rol === "secretario" ? rol : "");

/** Texto del rol para documentos y tablas: calidad y, si lo tiene, el cargo en el comité. */
export function rolTextoComite(tipo: string, rol: string, calidad?: string | null) {
  if (tipo === "BRIGADA") return rol === "jefe_brigada" ? "Jefe de brigada" : rol === "brigadista" ? "Brigadista" : rol;
  const cal = calidadDe(rol, calidad);
  if (tipo === "VIGIA") return cal === "suplente" ? "Suplente del Vigía" : "Vigía";
  const base = cal === "suplente" ? "Suplente" : "Principal";
  const cargo = cargoComiteDe(rol);
  return cargo ? `${base} · ${cargo === "presidente" ? "Presidente" : "Secretario"}` : base;
}

/**
 * Composición exigida, guardada en `comite.datos.composicion` al conformar el comité.
 * CCL: no se ajusta si cambia el número de trabajadores durante el periodo (Res. 3461/2025 art. 5 par. 1).
 * COPASST: el número de representantes se fija con los trabajadores al momento de conformarlo (Res. 2013/1986 art. 2).
 */
export type Composicion = { tipo: string; trabajadores: number; porParte: number; suplentes: boolean; texto: string; tramo?: string; norma: string; fecha: string; sede?: string; origen?: "conformacion" | "actualizacion" };

export function calcularComposicion(tipo: string, trabajadores: number, fecha: string, sede?: string | null): Composicion | null {
  if (tipo === "CCL") {
    const c = composicionCcl(trabajadores);
    return { tipo, trabajadores, porParte: c.porParte, suplentes: c.suplentes, texto: c.texto, tramo: c.tramo, norma: "Res. 3461/2025 arts. 3 y 5 par. 1", fecha, ...(sede ? { sede } : {}) };
  }
  if (tipo === "COPASST" || tipo === "VIGIA") {
    const c = composicionCopasst(trabajadores);
    return { tipo, trabajadores, porParte: c.porParte, suplentes: c.tipo === "COPASST", texto: c.texto, norma: c.tipo === "VIGIA" ? "Decreto Ley 1295/1994 art. 35 par." : "Res. 2013/1986 art. 2", fecha };
  }
  return null;
}

/** Composición congelada del comité, si existe y tiene la forma esperada. */
export function composicionGuardada(datos: unknown): Composicion | null {
  const c = (datos as { composicion?: Composicion } | null)?.composicion;
  return c && typeof c.porParte === "number" && typeof c.trabajadores === "number" ? c : null;
}

export type Aviso = { nivel: "error" | "aviso" | "ok"; texto: string; norma: string };
type MiembroV = { rol: string; calidad?: string | null; representa?: string | null };

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

/** Compara lo registrado con la composición exigida: número de principales y suplentes, paridad y cargos. */
export function validarConformacion(tipo: string, comp: Composicion | null, miembros: MiembroV[]): Aviso[] {
  if (tipo === "BRIGADA" || !comp) return [];
  const av: Aviso[] = [];
  const m = miembros.map((x) => ({ ...x, cal: calidadDe(x.rol, x.calidad), rep: x.representa ?? "" }));
  if (tipo === "VIGIA") {
    const norma = "Decreto Ley 1295/1994 art. 35 par.";
    const p = m.filter((x) => x.cal === "principal").length;
    if (p === 0) av.push({ nivel: "error", texto: "Falta registrar al Vigía de SST.", norma });
    else if (p > 1) av.push({ nivel: "error", texto: `Hay ${p} vigías registrados como principales; la empresa tiene un solo Vigía (los demás pueden registrarse como suplentes).`, norma });
    else av.push({ nivel: "ok", texto: "Vigía registrado. Designar un suplente es buena práctica, no exigencia legal.", norma });
    return av;
  }
  const norma = tipo === "CCL" ? "Res. 3461/2025 art. 3" : "Res. 2013/1986 art. 2";
  const n = comp.porParte;
  const cuenta = (rep: string, cal: Calidad) => m.filter((x) => x.rep === rep && x.cal === cal).length;
  const pe = cuenta("empleador", "principal"), pt = cuenta("trabajadores", "principal");
  const se = cuenta("empleador", "suplente"), st = cuenta("trabajadores", "suplente");
  const sinRep = m.filter((x) => x.rep !== "empleador" && x.rep !== "trabajadores").length;
  if (sinRep) av.push({ nivel: "error", texto: `${plural(sinRep, "integrante no indica", "integrantes no indican")} a quién representa (empleador o trabajadores); sin ese dato no se puede verificar la paridad.`, norma });
  for (const [parte, p] of [["empleador", pe], ["trabajadores", pt]] as const) {
    if (p < n) av.push({ nivel: "error", texto: `Faltan principales del ${parte === "empleador" ? "empleador" : "lado de los trabajadores"}: hay ${p} y se exigen ${n}.`, norma });
    else if (p > n && tipo === "COPASST") av.push({ nivel: "aviso", texto: `Hay ${p} principales ${parte === "empleador" ? "del empleador" : "de los trabajadores"}; para ${comp.trabajadores} trabajadores la norma fija ${n} por cada parte.`, norma });
  }
  if (pe !== pt) av.push({ nivel: "error", texto: `El comité no es paritario: ${plural(pe, "principal", "principales")} del empleador y ${plural(pt, "principal", "principales")} de los trabajadores.${tipo === "CCL" ? " Se pueden designar más integrantes, pero en igual número por cada parte." : ""}`, norma });
  if (comp.suplentes) {
    for (const [parte, s, p] of [["empleador", se, pe], ["trabajadores", st, pt]] as const) {
      const exig = Math.max(n, p);
      if (s < exig) av.push({ nivel: "error", texto: `Faltan suplentes ${parte === "empleador" ? "del empleador" : "de los trabajadores"}: hay ${s} y cada principal debe tener el suyo (${exig}).`, norma });
    }
  }
  const pres = m.filter((x) => x.rol === "presidente"), sec = m.filter((x) => x.rol === "secretario");
  if (tipo === "COPASST") {
    if (pres.length !== 1) av.push({ nivel: "aviso", texto: pres.length ? "Hay más de un presidente." : "Falta designar al presidente.", norma: "Res. 2013/1986 art. 9" });
    else if (pres[0].rep !== "empleador") av.push({ nivel: "error", texto: "El presidente del COPASST lo designa el empleador entre sus representantes; quien figura como presidente no representa al empleador.", norma: "Res. 2013/1986 art. 9" });
    if (sec.length !== 1) av.push({ nivel: "aviso", texto: sec.length ? "Hay más de un secretario." : "Falta elegir al secretario (lo elige el comité entre la totalidad de sus miembros).", norma: "Res. 2013/1986 art. 9" });
  } else {
    if (pres.length !== 1) av.push({ nivel: "aviso", texto: pres.length ? "Hay más de un presidente." : "Falta elegir al presidente (de mutuo acuerdo entre los integrantes).", norma: "Res. 3461/2025 art. 7" });
    if (sec.length !== 1) av.push({ nivel: "aviso", texto: sec.length ? "Hay más de un secretario." : "Falta elegir al secretario (de mutuo acuerdo entre los integrantes).", norma: "Res. 3461/2025 art. 8" });
  }
  if (!av.some((a) => a.nivel === "error")) av.unshift({ nivel: "ok", texto: `La conformación cumple la composición exigida: ${comp.texto}.`, norma });
  return av;
}
