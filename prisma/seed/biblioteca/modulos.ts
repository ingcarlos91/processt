// Módulos adicionales de la biblioteca. Cada módulo aporta peligros, zonas, tareas, cargos y sectores
// con la misma forma que estructura.ts / peligros.ts; la semilla y el validador los recorren en orden.
// Para agregar un módulo: crear el archivo en esta carpeta y registrarlo aquí.
import type { PeligroSeed } from "./peligros";
import { peligros2 } from "./peligros-2";
import { peligros3 } from "./peligros-3";
import * as industria from "./estructura-industria-energia";
import * as servicios from "./estructura-servicios-comercio";
import * as salud from "./estructura-salud-social";
import * as construccion from "./estructura-construccion-transporte";
import * as agro from "./estructura-agro-alimentos-turismo";

export type TP = string | { p: string; nd?: number; ne?: number; nc?: number };
export type ZonaSeed = { nombre: string; descripcion: string; peligros: string[] };
export type TareaSeed = { nombre: string; actividad: string; rutinaria?: boolean; altoRiesgo?: string; peligros: TP[]; zonas: string[] };
export type CargoSeed = { nombre: string; descripcion: string; tareas: string[]; peligros?: string[] };
export type SectorSeed = { nombre: string; ciius: string[]; descripcion: string; zonas: string[]; procesos: { nombre: string; descripcion: string; tareas: string[] }[]; cargos: string[] };
export type ModuloBiblioteca = {
  nombre: string;
  peligros?: Record<string, PeligroSeed>;
  zonas?: Record<string, ZonaSeed>;
  tareas?: Record<string, TareaSeed>;
  cargos?: Record<string, CargoSeed>;
  sectores?: SectorSeed[];
};

export const modulosBiblioteca: ModuloBiblioteca[] = [
  { nombre: "peligros-2.ts", peligros: peligros2 },
  { nombre: "peligros-3.ts", peligros: peligros3 },
  { nombre: "estructura-industria-energia.ts", ...industria },
  { nombre: "estructura-servicios-comercio.ts", ...servicios },
  { nombre: "estructura-salud-social.ts", ...salud },
  { nombre: "estructura-construccion-transporte.ts", ...construccion },
  { nombre: "estructura-agro-alimentos-turismo.ts", ...agro },
];
