// Datos complementarios que piden los documentos. Una sola definición alimenta el formulario,
// la ayuda de cada campo, la lista de datos faltantes y el contexto de las plantillas.

export type ColumnaTabla = { k: string; etiqueta: string; tipo?: "text" | "number" | "date" | "select"; opciones?: string[]; opcional?: boolean };
export type CampoComplementario = {
  k: string; etiqueta: string; tipo: "text" | "number" | "date" | "textarea" | "tabla" | "persona";
  que: string; donde?: string; ejemplo?: string; usadoEn: string[]; normas?: string[];
  columnas?: ColumnaTabla[]; filasSugeridas?: Record<string, string>[];
  /** Solo se pide si aplica (por disparador o nivel). */
  siDisparador?: string; siNivelMin?: number;
};
export type Seccion = { id: string; titulo: string; descripcion: string; campos: CampoComplementario[] };

export const SECCIONES: Seccion[] = [
  {
    id: "contactos", titulo: "Contactos y líneas de atención", descripcion: "Teléfonos y personas que aparecen en los procedimientos de reporte y en las políticas.",
    campos: [
      { k: "arlLinea", etiqueta: "Línea de atención de la ARL", tipo: "text", que: "Número de la línea de emergencias y reporte de accidentes de la ARL.", donde: "Carné o certificado de afiliación a la ARL, o su página web.", ejemplo: "01 8000 51 1414", usadoEn: ["PRC-08", "PLN-04"], normas: ["Decreto 1072/2015 art. 2.2.4.6.25"] },
      { k: "telefonoSst", etiqueta: "Teléfono del responsable del SG-SST", tipo: "text", que: "Teléfono para reportar accidentes, incidentes y condiciones inseguras.", ejemplo: "300 123 4567", usadoEn: ["PRC-08", "PRC-02"] },
      { k: "correoQuejas", etiqueta: "Correo para quejas de acoso laboral", tipo: "text", que: "Buzón confidencial del Comité de Convivencia Laboral.", ejemplo: "convivencia@empresa.com", usadoEn: ["POL-03", "ACT-04"], normas: ["Res. 3461/2025"] },
      { k: "acosoSexual", etiqueta: "Persona que recibe denuncias de acoso sexual", tipo: "persona", que: "Persona designada por la gerencia, distinta del Comité de Convivencia, para recibir denuncias de acoso sexual con confidencialidad.", usadoEn: ["PRC-06"], normas: ["Ley 2365/2024"] },
      { k: "ips", etiqueta: "IPS que realiza las evaluaciones médicas", tipo: "text", que: "Institución de salud con licencia en SST que hace los exámenes de ingreso, periódicos y de retiro.", donde: "Contrato o cotización con la IPS.", ejemplo: "IPS Salud Ocupacional del Cauca S.A.S.", usadoEn: ["DOC-07", "PRC-07", "PRG-02"], normas: ["Res. 1843/2025"] },
      { k: "medicoIps", etiqueta: "Médico de la IPS que revisa el perfil de cargo (profesiograma)", tipo: "persona", que: "Médico especialista en SST o medicina del trabajo del prestador que recibe el perfil de cargo y recomienda los énfasis de las evaluaciones.", usadoEn: ["DOC-07"], normas: ["Res. 1843/2025 arts. 5-d y 16"] },
    ],
  },
  {
    id: "emergencias", titulo: "Emergencias", descripcion: "Lo que pide el plan de prevención, preparación y respuesta ante emergencias.",
    campos: [
      { k: "puntoEncuentro", etiqueta: "Punto de encuentro", tipo: "text", que: "Lugar seguro y señalizado donde se reúne el personal después de evacuar.", ejemplo: "Parqueadero frontal, junto a la portería", usadoEn: ["PLN-04", "FOR-05"], normas: ["Decreto 1072/2015 art. 2.2.4.6.25 num. 8"] },
      { k: "alarma", etiqueta: "Sistema de alarma", tipo: "text", que: "Cómo se avisa una emergencia.", ejemplo: "Sirena eléctrica en recepción y pito del jefe de brigada", usadoEn: ["PLN-04"] },
      {
        k: "recursosEmergencia", etiqueta: "Recursos para emergencias", tipo: "tabla", que: "Equipos disponibles para atender emergencias, con cantidad y ubicación.", usadoEn: ["PLN-04", "PRG-06"], normas: ["Decreto 1072/2015 art. 2.2.4.6.25 num. 2 y 12"],
        columnas: [{ k: "recurso", etiqueta: "Recurso" }, { k: "cantidad", etiqueta: "Cantidad", tipo: "number" }, { k: "ubicacion", etiqueta: "Ubicación" }, { k: "vence", etiqueta: "Vencimiento / recarga", tipo: "date", opcional: true }],
        filasSugeridas: [{ recurso: "Extintor multipropósito ABC" }, { recurso: "Extintor de CO2 (equipos eléctricos)" }, { recurso: "Botiquín" }, { recurso: "Camilla con inmovilizadores" }, { recurso: "Señalización de evacuación" }, { recurso: "Luces de emergencia" }],
      },
    ],
  },
  {
    id: "alto_riesgo", titulo: "Tareas de alto riesgo", descripcion: "Solo si la empresa tiene trabajo en alturas, espacios confinados o productos químicos.",
    campos: [
      { k: "coordinadorAlturas", etiqueta: "Coordinador de trabajo en alturas", tipo: "persona", que: "Persona con certificado de coordinador que autoriza los permisos de trabajo en alturas.", usadoEn: ["PRG-08"], normas: ["Res. 4272/2021"], siDisparador: "alturas" },
      {
        k: "espaciosConfinados", etiqueta: "Inventario de espacios confinados", tipo: "tabla", que: "Tanques, pozos, cámaras o silos donde una persona puede entrar pero no está diseñado para permanecer.", usadoEn: ["PRG-11"], normas: ["Res. 0491/2020"], siDisparador: "confinados",
        columnas: [{ k: "espacio", etiqueta: "Espacio" }, { k: "ubicacion", etiqueta: "Ubicación" }, { k: "peligros", etiqueta: "Peligros" }, { k: "acceso", etiqueta: "Acceso" }, { k: "senalizado", etiqueta: "Señalizado", tipo: "select", opciones: ["Sí", "No"] }],
      },
      {
        k: "quimicos", etiqueta: "Inventario de sustancias químicas", tipo: "tabla", que: "Productos químicos que se usan o almacenan, con su clasificación SGA.", donde: "Etiquetas y fichas de datos de seguridad (FDS) de cada producto.", usadoEn: ["MTZ-03"], normas: ["Decreto 1496/2018", "Res. 0773/2021"], siDisparador: "quimicos",
        columnas: [{ k: "producto", etiqueta: "Producto" }, { k: "uso", etiqueta: "Uso" }, { k: "area", etiqueta: "Área" }, { k: "cantidad", etiqueta: "Cantidad almacenada" }, { k: "pictogramas", etiqueta: "Pictogramas SGA" }, { k: "advertencia", etiqueta: "Palabra de advertencia", tipo: "select", opciones: ["Peligro", "Atención", "Ninguna"] }, { k: "carcinogeno", etiqueta: "¿Carcinógeno o tóxico agudo?", tipo: "select", opciones: ["No", "Sí"] }, { k: "fds", etiqueta: "FDS disponible", tipo: "select", opciones: ["Sí", "No"] }, { k: "epp", etiqueta: "EPP requerido" }],
      },
    ],
  },
  {
    id: "recursos", titulo: "Presupuesto y mantenimiento", descripcion: "Valores del presupuesto del SG-SST e inventario de equipos para el programa de mantenimiento.",
    campos: [
      { k: "presupuesto", etiqueta: "Valores del presupuesto (por rubro)", tipo: "tabla", que: "Cuánto se asigna a cada rubro del SG-SST en el año.", usadoEn: ["DOC-04"], normas: ["Decreto 1072/2015 art. 2.2.4.6.8 num. 4", "Res. 0312/2019 est. 1.1.3"],
        columnas: [{ k: "rubro", etiqueta: "Rubro" }, { k: "valor", etiqueta: "Valor ($)", tipo: "number" }] },
      { k: "equipos", etiqueta: "Equipos e instalaciones a mantener", tipo: "tabla", que: "Equipos, máquinas e instalaciones con su mantenimiento.", usadoEn: ["PRG-07"], normas: ["Res. 0312/2019 est. 4.2.5"],
        columnas: [{ k: "equipo", etiqueta: "Equipo / instalación" }, { k: "ubicacion", etiqueta: "Ubicación" }, { k: "tipo", etiqueta: "Tipo", tipo: "select", opciones: ["Preventivo", "Correctivo", "Preventivo y certificación"] }, { k: "frecuencia", etiqueta: "Frecuencia" }, { k: "responsable", etiqueta: "Responsable" }, { k: "proxima", etiqueta: "Próxima fecha", tipo: "date" }],
        filasSugeridas: [{ equipo: "Instalaciones eléctricas", tipo: "Preventivo", frecuencia: "Anual" }, { equipo: "Extintores (recarga)", tipo: "Preventivo", frecuencia: "Anual", responsable: "Proveedor certificado" }, { equipo: "Equipos de cómputo", tipo: "Preventivo", frecuencia: "Semestral" }, { equipo: "Aire acondicionado / ventilación", tipo: "Preventivo", frecuencia: "Semestral" }] },
    ],
  },
];

export type Persona = { nombre?: string; cargo?: string; cedula?: string; correo?: string; telefono?: string };
export type Complementarios = Record<string, string | Persona | Record<string, string>[] | undefined>;

/** Campos que aplican a la empresa según sus disparadores. */
export function camposAplicables(dis: Record<string, boolean>) {
  return SECCIONES.map((s) => ({ ...s, campos: s.campos.filter((c) => !c.siDisparador || dis[c.siDisparador]) })).filter((s) => s.campos.length);
}

function vacio(v: unknown) {
  if (v == null || v === "") return true;
  if (Array.isArray(v)) return !v.some((f) => Object.values(f ?? {}).some((x) => String(x ?? "").trim()));
  if (typeof v === "object") return !String((v as Persona).nombre ?? "").trim();
  return false;
}

/** Datos complementarios que faltan, con los documentos que los necesitan. */
export function faltantes(datos: Complementarios, dis: Record<string, boolean>, documentosAplicables: string[]) {
  return camposAplicables(dis).flatMap((s) => s.campos)
    .filter((c) => vacio(datos[c.k]) && c.usadoEn.some((d) => documentosAplicables.includes(d)))
    .map((c) => ({ k: c.k, etiqueta: c.etiqueta, documentos: c.usadoEn.filter((d) => documentosAplicables.includes(d)) }));
}
