export { cn } from "cn"

/** Fecha local (zona del navegador o servidor) en formato AAAA-MM-DD, con desplazamiento opcional en días. No usar toISOString para "hoy": en Colombia después de las 7 p. m. da el día siguiente. */
export function hoyLocal(dias = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
