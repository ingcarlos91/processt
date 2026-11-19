// Entidades del sistema de seguridad social y listas de datos personales. Editables en Biblioteca → Entidades.
// Semilla sin validar: la consultora confirma que las entidades siguen vigentes.
export const ARL = ["ARL SURA", "Positiva Compañía de Seguros", "Colmena Seguros", "Seguros Bolívar", "AXA Colpatria", "Seguros de Vida Alfa", "La Equidad Seguros", "Liberty / HDI Seguros"];
export const EPS = ["Nueva EPS", "EPS SURA", "EPS Sanitas", "Salud Total", "Compensar", "Famisanar", "Coosalud", "Mutual Ser", "Servicio Occidental de Salud (SOS)", "Aliansalud", "Emssanar", "Asmet Salud", "Savia Salud", "Capresoca", "Comfenalco Valle", "Cajacopi Atlántico", "Capital Salud", "Pijaos Salud", "Anas Wayuu", "Dusakawi", "Mallamas", "Comfachocó", "Comfaoriente", "Familiar de Colombia"];
export const AFP = ["Colpensiones (régimen de prima media)", "Porvenir", "Protección", "Colfondos", "Skandia"];
export const ESCOLARIDAD = ["Ninguna", "Primaria", "Bachillerato", "Técnico", "Tecnólogo", "Profesional", "Especialización", "Maestría", "Doctorado"];

export function itemsEntidades() {
  const m = (tipo: string, xs: string[]) => xs.map((nombre, i) => ({ tipo, nombre, descripcion: "", detalle: { orden: i }, normas: [] as string[] }));
  return [...m("ARL", ARL), ...m("EPS", EPS), ...m("AFP", AFP), ...m("ESCOLARIDAD", ESCOLARIDAD)];
}
