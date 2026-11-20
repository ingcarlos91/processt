"use client";
import { useState } from "react";
import { FileBarChart, FileDown } from "lucide-react";
import { Selector } from "@/components/app/selector";
import { BotonDescarga } from "@/components/app/boton-descarga";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/** Opciones de periodo: meses recientes, trimestres, semestres, años y acumulado desde el inicio del SG-SST. */
function opcionesPeriodo(tipo: string) {
  const hoy = new Date(), a = hoy.getFullYear(), m = hoy.getMonth() + 1;
  if (tipo === "mes") return Array.from({ length: 13 }, (_, i) => { const d = new Date(a, m - 1 - i, 1); return { valor: `mes:${d.getFullYear()}-${d.getMonth() + 1}`, etiqueta: `${MESES[d.getMonth()]} ${d.getFullYear()}` }; });
  if (tipo === "trim") return [a, a - 1].flatMap((y) => [4, 3, 2, 1].filter((t) => y < a || t <= Math.ceil(m / 3)).map((t) => ({ valor: `trim:${y}-${t}`, etiqueta: `Trimestre ${t} de ${y}` })));
  if (tipo === "sem") return [a, a - 1].flatMap((y) => [2, 1].filter((s) => y < a || s <= Math.ceil(m / 6)).map((s) => ({ valor: `sem:${y}-${s}`, etiqueta: `Semestre ${s} de ${y}` })));
  if (tipo === "anio") return [a, a - 1, a - 2].map((y) => ({ valor: `anio:${y}`, etiqueta: `Año ${y}` }));
  return [{ valor: "inicio", etiqueta: "Desde el inicio del SG-SST" }];
}

/** Informe de gestión para la gerencia del cliente: elegir el periodo y descargar en PDF o Word. */
export function BotonInformeGestion({ empresaId }: { empresaId: string }) {
  const [tipo, setTipo] = useState("mes");
  const [valor, setValor] = useState(() => opcionesPeriodo("mes")[0].valor);
  const cambiarTipo = (t: string) => { setTipo(t); setValor(opcionesPeriodo(t)[0].valor); };
  const href = `/api/empresas/${empresaId}/informe-gestion?p=${encodeURIComponent(valor)}`;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Selector className="w-32" value={tipo} onChange={cambiarTipo} opciones={[{ valor: "mes", etiqueta: "Mensual" }, { valor: "trim", etiqueta: "Trimestral" }, { valor: "sem", etiqueta: "Semestral" }, { valor: "anio", etiqueta: "Anual" }, { valor: "inicio", etiqueta: "Acumulado" }]} />
      {tipo !== "inicio" && <Selector className="w-44" value={valor} onChange={setValor} opciones={opcionesPeriodo(tipo)} />}
      <BotonDescarga href={`${href}&formato=pdf`} variant="outline" size="icon" aria-label="Informe de gestión en PDF" tooltip="Informe de gestión en PDF, para entregar a la gerencia"><FileDown /></BotonDescarga>
      <BotonDescarga href={href} texto="Armando el informe…" tooltip="Informe de gestión para la gerencia del cliente (Word, editable): resumen ejecutivo, en qué punto va el SG-SST, logros del periodo, trabajo de la consultora, plan, accidentalidad y qué sigue"><FileBarChart /> Informe de gestión</BotonDescarga>
    </div>
  );
}
