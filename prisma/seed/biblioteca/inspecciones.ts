// Listas de chequeo de inspección (Res. 0312/2019 estándar 4.2.4). Editables en Biblioteca → Inspecciones.
// frecuenciaDias: periodicidad sugerida; el planeador avisa la próxima inspección.
export const listas: { nombre: string; descripcion: string; frecuenciaDias: number; items: string[]; normas?: string[] }[] = [
  { nombre: "Inspección locativa", descripcion: "Pisos, escaleras, techos, paredes, iluminación, ventilación y áreas de circulación.", frecuenciaDias: 90, items: [
    "Pisos sin huecos, desniveles ni superficies resbalosas", "Escaleras con pasamanos y cintas antideslizantes", "Áreas de circulación despejadas y demarcadas", "Iluminación suficiente en puestos y pasillos",
    "Techos y paredes sin grietas, humedad ni riesgo de caída de objetos", "Ventilación adecuada", "Puertas y salidas de emergencia libres y señalizadas", "Rutas de evacuación señalizadas y despejadas",
    "Baños y zonas de descanso limpios y en buen estado", "Estanterías ancladas y con carga dentro de su capacidad" ] },
  { nombre: "Inspección de extintores", descripcion: "Estado, ubicación y vigencia de la recarga de cada extintor.", frecuenciaDias: 30, items: [
    "Extintor en su sitio, señalizado y sin obstáculos", "Manómetro en zona verde (presión adecuada)", "Pasador de seguridad y sello en su lugar", "Manguera y boquilla sin daños ni obstrucciones",
    "Cilindro sin golpes, corrosión ni fugas", "Etiqueta legible con tipo de agente y fecha de recarga vigente", "Altura de instalación adecuada (fácil alcance)", "Tipo de extintor acorde con el riesgo del área" ] },
  { nombre: "Inspección de botiquín", descripcion: "Contenido, estado y vencimiento de los elementos de primeros auxilios.", frecuenciaDias: 30, items: [
    "Botiquín ubicado, señalizado y accesible", "Elementos completos según el listado", "Elementos dentro de su fecha de vencimiento", "Elementos limpios y en buen estado", "Listado de contenido y teléfonos de emergencia visibles", "Registro de uso diligenciado" ] },
  { nombre: "Inspección de elementos de protección personal", descripcion: "Uso, estado y reposición de los EPP por los trabajadores.", frecuenciaDias: 90, items: [
    "Los trabajadores usan los EPP definidos para su cargo", "Los EPP están en buen estado (sin roturas ni desgaste)", "Los EPP son de la talla adecuada", "Los EPP se almacenan limpios y en un lugar adecuado",
    "Existe registro de entrega firmado", "Los trabajadores conocen el uso y mantenimiento de sus EPP" ] },
  { nombre: "Inspección de herramientas manuales y eléctricas", descripcion: "Estado de mangos, filos, guardas y cables.", frecuenciaDias: 90, items: [
    "Mangos firmes, sin astillas ni fisuras", "Filos y puntas en buen estado y protegidos cuando no se usan", "Herramientas eléctricas con guardas en su lugar", "Cables y enchufes sin empalmes ni daños",
    "Herramientas almacenadas ordenadamente", "Se usa la herramienta adecuada para cada tarea" ] },
  { nombre: "Inspección de vehículos", descripcion: "Revisión preoperacional del vehículo (llantas, luces, frenos, documentos).", frecuenciaDias: 30, items: [
    "Documentos vigentes (licencia, SOAT, revisión técnico-mecánica)", "Llantas con labrado y presión adecuados, incluida la de repuesto", "Luces delanteras, traseras, direccionales y de freno funcionando",
    "Frenos y freno de mano funcionando", "Cinturones de seguridad en buen estado", "Equipo de carretera y botiquín completos", "Espejos y limpiaparabrisas en buen estado", "Sin fugas de aceite, combustible o refrigerante" ] },
  { nombre: "Inspección de instalaciones eléctricas", descripcion: "Tableros, tomas, cables e iluminación.", frecuenciaDias: 180, items: [
    "Tableros con tapa, señalizados y sin obstáculos", "Circuitos identificados en los tableros", "Tomas e interruptores en buen estado y fijos", "Sin cables expuestos, empalmes improvisados ni sobrecarga de multitomas",
    "Polo a tierra en tomas y equipos que lo requieren", "Señalización de riesgo eléctrico donde aplica" ] },
  { nombre: "Inspección de orden y aseo", descripcion: "Clasificación, orden, limpieza y manejo de residuos en los puestos de trabajo.", frecuenciaDias: 30, items: [
    "Puestos de trabajo sin elementos innecesarios", "Materiales y herramientas en su lugar", "Pisos y superficies limpios", "Residuos separados en recipientes identificados", "Pasillos y salidas libres de objetos" ] },
  { nombre: "Inspección de bioseguridad y residuos", descripcion: "Para servicios de salud, odontología, laboratorios, estética, tatuaje y veterinaria: cortopunzantes, lavado de instrumental, EPP, residuos y atención de la exposición a riesgo biológico.", frecuenciaDias: 30, normas: ["RES-0312-2019", "DEC-0780-2016", "RES-0591-2024"], items: [
    "Guardián para cortopunzantes en cada punto de uso, rotulado, rígido y con menos de 3/4 de su capacidad", "No se reencapsulan agujas ni se manipulan cortopunzantes con la mano",
    "Lavado de instrumental con guantes gruesos (de caucho o nitrilo) y cepillo de mango largo", "Uso de EPP según el procedimiento: guantes, tapabocas o respirador, gafas o careta y bata",
    "Lavamanos con jabón, toallas desechables y protocolo de higiene de manos visible", "Superficies y equipos limpiados y desinfectados según el protocolo",
    "Residuos separados en recipientes y bolsas del color de la Tabla 6 de la Res. 0591/2024, rotulados", "Almacenamiento central de residuos señalizado, con acceso restringido y registro de entrega al gestor",
    "Protocolo de atención de la exposición a riesgo biológico conocido por el personal (lavado, reporte inmediato, valoración médica)", "Los controles de la matriz para el riesgo biológico están vigentes (sin registrar datos de salud de personas)",
    "Derrames de fluidos atendidos con kit y procedimiento definido" ] },
];

export function itemsInspeccion() {
  return listas.map((l, i) => ({ tipo: "LISTA_INSPECCION", nombre: l.nombre, descripcion: l.descripcion, detalle: { orden: i, frecuenciaDias: l.frecuenciaDias, items: l.items }, normas: l.normas ?? ["RES-0312-2019"] }));
}
