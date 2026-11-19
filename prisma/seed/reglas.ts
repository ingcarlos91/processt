// Reglas de aplicabilidad. Cada conclusión cita su norma (normaRef).
import type { Condicion } from "../../src/lib/reglas/condicion";

export type Efecto = {
  nivel?: 7 | 21 | 60;
  comites?: ("VIGIA" | "COPASST" | "CCL" | "BRIGADA")[];
  documentos?: string[];
  capacitaciones?: string[];
  mensaje?: string;
};
export type ReglaSeed = { codigo: string; nombre: string; condicion: Condicion; efecto: Efecto; normaRef: string; prioridad: number };

export const reglas: ReglaSeed[] = [
  // ── Nivel de estándares (Res. 0312/2019) ──
  { codigo: "NIVEL-7", nombre: "Empresa de 10 o menos trabajadores, riesgo I, II o III", prioridad: 100,
    condicion: { trabajadoresMax: 10, claseRiesgoIn: [1, 2, 3] }, efecto: { nivel: 7, mensaje: "Aplican 7 estándares mínimos." }, normaRef: "Res. 0312/2019 art. 3" },
  { codigo: "NIVEL-21", nombre: "Empresa de 11 a 50 trabajadores, riesgo I, II o III", prioridad: 100,
    condicion: { trabajadoresMin: 11, trabajadoresMax: 50, claseRiesgoIn: [1, 2, 3] }, efecto: { nivel: 21, mensaje: "Aplican 21 estándares mínimos." }, normaRef: "Res. 0312/2019 art. 9" },
  { codigo: "NIVEL-60-TAMANO", nombre: "Empresa de más de 50 trabajadores", prioridad: 100,
    condicion: { trabajadoresMin: 51 }, efecto: { nivel: 60, mensaje: "Aplican los 60 estándares mínimos." }, normaRef: "Res. 0312/2019 art. 16" },
  { codigo: "NIVEL-60-RIESGO", nombre: "Empresa de 50 o menos trabajadores con riesgo IV o V", prioridad: 100,
    condicion: { trabajadoresMax: 50, claseRiesgoIn: [4, 5] }, efecto: { nivel: 60, mensaje: "Por clase de riesgo IV o V aplican los 60 estándares (arts. 8 y 15)." }, normaRef: "Res. 0312/2019 arts. 8, 15, 16" },
  { codigo: "UPA-7", nombre: "Unidad de producción agropecuaria de 10 o menos trabajadores permanentes, riesgo I-III", prioridad: 90,
    condicion: { esUpa: true, trabajadoresMax: 10, claseRiesgoIn: [1, 2, 3] }, efecto: { mensaje: "UPA: aplican las 3 obligaciones del art. 7 (identificar peligros, prevenir AT/EL, proteger a quienes trabajan). Se gestiona como nivel 7." }, normaRef: "Res. 0312/2019 art. 7" },

  // ── Comités ──
  { codigo: "VIGIA", nombre: "Vigía de SST (menos de 10 trabajadores)", prioridad: 50,
    condicion: { trabajadoresMax: 9 }, efecto: { comites: ["VIGIA"], mensaje: "Designar Vigía de SST (periodo 2 años)." }, normaRef: "Decreto 1072/2015 art. 2.2.4.6.2 num. 9; Res. 2013/1986" },
  { codigo: "COPASST", nombre: "COPASST (10 o más trabajadores)", prioridad: 50,
    condicion: { trabajadoresMin: 10 }, efecto: { comites: ["COPASST"], mensaje: "Conformar COPASST paritario, periodo 2 años, reunión mensual." }, normaRef: "Res. 2013/1986 arts. 1, 2, 7" },
  { codigo: "CCL", nombre: "Comité de Convivencia Laboral", prioridad: 50,
    condicion: { siempre: true }, efecto: { comites: ["CCL"], mensaje: "Conformar Comité de Convivencia Laboral; reunión mensual; procedimiento preventivo máx. 65 días." }, normaRef: "Res. 3461/2025; Ley 1010/2006" },
  { codigo: "BRIGADA", nombre: "Brigada de emergencias", prioridad: 50,
    condicion: { siempre: true }, efecto: { comites: ["BRIGADA"], mensaje: "Conformar, capacitar y dotar la brigada de emergencias." }, normaRef: "Decreto 1072/2015 art. 2.2.4.6.25 num. 11" },

  // ── Documentos y programas por disparador / tamaño ──
  { codigo: "REGLAMENTO-HSI", nombre: "Reglamento de Higiene y Seguridad Industrial", prioridad: 40,
    condicion: { trabajadoresMin: 10 }, efecto: { documentos: ["DOC-06"], mensaje: "Elaborar y publicar el Reglamento de Higiene y Seguridad Industrial." }, normaRef: "CST arts. 349-351" },
  { codigo: "ALTURAS", nombre: "Trabajo en alturas", prioridad: 40,
    condicion: { disparador: "alturas" }, efecto: { documentos: ["PRG-08"], capacitaciones: ["Trabajo seguro en alturas (certificación según nivel)", "Uso de sistemas de protección contra caídas"], mensaje: "Programa de prevención y protección contra caídas, coordinador de alturas, permisos de trabajo, plan de rescate." }, normaRef: "Res. 4272/2021" },
  { codigo: "CONFINADOS", nombre: "Espacios confinados", prioridad: 40,
    condicion: { disparador: "confinados" }, efecto: { documentos: ["PRG-11"], capacitaciones: ["Trabajo seguro en espacios confinados"], mensaje: "Programa de gestión para trabajo en espacios confinados, inventario, permisos y rescate." }, normaRef: "Res. 0491/2020" },
  { codigo: "QUIMICOS", nombre: "Riesgo químico", prioridad: 40,
    condicion: { disparador: "quimicos" }, efecto: { documentos: ["MTZ-03"], capacitaciones: ["Manejo seguro de sustancias químicas y SGA"], mensaje: "Inventario de sustancias químicas, FDS, etiquetado SGA, matriz de compatibilidad." }, normaRef: "Decreto 1496/2018; Res. 0773/2021" },
  { codigo: "PESV", nombre: "Plan Estratégico de Seguridad Vial", prioridad: 40,
    condicion: { vehiculosMin: 10 }, efecto: { documentos: ["PRG-09"], capacitaciones: ["Seguridad vial y manejo defensivo"], mensaje: "Adoptar el PESV (10 o más vehículos o conductores)." }, normaRef: "Ley 1503/2011 art. 12; Res. 40595/2022" },
  { codigo: "RUIDO", nombre: "Ruido", prioridad: 40,
    condicion: { disparador: "ruido" }, efecto: { capacitaciones: ["Conservación auditiva y uso de protectores"], mensaje: "Mediciones de ruido (sonometría/dosimetría) y PVE auditivo." }, normaRef: "Res. 8321/1983; Res. 2400/1979" },
  { codigo: "PSICOSOCIAL-BATERIA", nombre: "Evaluación de riesgo psicosocial con batería", prioridad: 40,
    condicion: { siempre: true }, efecto: { documentos: ["PRG-04"], mensaje: "Aplicar batería de riesgo psicosocial (anual si riesgo alto, cada 2 años si medio/bajo) por psicólogo con licencia en SST." }, normaRef: "Res. 2646/2008; Res. 2764/2022" },
  { codigo: "SALUD-MENTAL", nombre: "Programa de salud mental y prevención de SPA", prioridad: 40,
    condicion: { siempre: true }, efecto: { documentos: ["PRG-03", "POL-02"], capacitaciones: ["Promoción de la salud mental y prevención del consumo de SPA"], mensaje: "Integrar acciones de salud mental y prevención de SPA en matriz de peligros, plan anual y vigilancia epidemiológica." }, normaRef: "Decreto 728/2025; Ley 2460/2025; Res. 1075/1992" },
  { codigo: "ACOSO-SEXUAL", nombre: "Protocolo de acoso sexual", prioridad: 40,
    condicion: { siempre: true }, efecto: { documentos: ["PRC-06"], mensaje: "Protocolo de prevención y atención del acoso sexual, separado del Comité de Convivencia." }, normaRef: "Ley 2365/2024" },
  { codigo: "TRABAJO-NOCTURNO", nombre: "Trabajo nocturno o por turnos", prioridad: 40,
    condicion: { disparador: "trabajoNocturno" }, efecto: { capacitaciones: ["Higiene del sueño y manejo de turnos"], mensaje: "Incluir la jornada nocturna o por turnos como factor de riesgo psicosocial en la matriz y en la evaluación con la batería." }, normaRef: "Res. 2646/2008 art. 6; Res. 2764/2022" },
  { codigo: "ALTO-RIESGO-PENSION", nombre: "Cotización especial de pensión", prioridad: 30,
    condicion: { disparador: "altoRiesgoPension" }, efecto: { mensaje: "Verificar cotización especial de pensión para trabajadores en actividades de alto riesgo." }, normaRef: "Decreto 2090/2003" },
  { codigo: "APRENDICES", nombre: "Aprendices y practicantes", prioridad: 30,
    condicion: { aprendicesMin: 1 }, efecto: { mensaje: "Verificar afiliación a ARL de aprendices y practicantes e incluirlos en inducción y capacitación." }, normaRef: "Decreto 1072/2015 art. 2.2.4.6.11" },
];
