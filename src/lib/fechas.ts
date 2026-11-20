// Cálculo de fechas con días hábiles de Colombia (sin sábados, domingos ni festivos).
const claveDia = (d: Date) => d.toISOString().slice(0, 10);
const festivosCache = new Map<number, Set<string>>();
/** Festivos de Colombia del año: fijos, trasladables al lunes siguiente y los que dependen de la Pascua. */
export function festivosColombia(anio: number): Set<string> {
  const ya = festivosCache.get(anio);
  if (ya) return ya;
  const f = (m: number, d: number) => new Date(Date.UTC(anio, m - 1, d));
  const lunes = (x: Date) => { const r = new Date(x); while (r.getUTCDay() !== 1) r.setUTCDate(r.getUTCDate() + 1); return r; };
  const mas = (x: Date, n: number) => { const r = new Date(x); r.setUTCDate(r.getUTCDate() + n); return r; };
  // Domingo de Pascua (algoritmo anónimo gregoriano).
  const a = anio % 19, b = Math.floor(anio / 100), c = anio % 100, d = Math.floor(b / 4), e = b % 4, g = Math.floor((8 * b + 13) / 25);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 19 * l) / 433);
  const mes = Math.floor((h + l - 7 * m + 90) / 25), dia = (h + l - 7 * m + 33 * mes + 19) % 32;
  const pascua = f(mes, dia);
  const fechas = [
    f(1, 1), f(5, 1), f(7, 20), f(8, 7), f(12, 8), f(12, 25),
    ...[f(1, 6), f(3, 19), f(6, 29), f(8, 15), f(10, 12), f(11, 1), f(11, 11)].map(lunes),
    mas(pascua, -3), mas(pascua, -2), lunes(mas(pascua, 39)), lunes(mas(pascua, 60)), lunes(mas(pascua, 68)),
  ];
  const s = new Set(fechas.map(claveDia));
  festivosCache.set(anio, s);
  return s;
}

/** Suma días hábiles: de lunes a viernes, sin contar los festivos de Colombia. */
export function sumarHabiles(d: Date, n: number) {
  const r = new Date(d);
  let k = 0;
  while (k < n) {
    r.setUTCDate(r.getUTCDate() + 1);
    const w = r.getUTCDay();
    if (w !== 0 && w !== 6 && !festivosColombia(r.getUTCFullYear()).has(claveDia(r))) k++;
  }
  return r;
}
