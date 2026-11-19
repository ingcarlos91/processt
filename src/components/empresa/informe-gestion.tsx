"use client";
import { useState } from "react";
import { FileBarChart } from "lucide-react";
import { Selector } from "@/components/app/selector";
import { BotonDescarga } from "@/components/app/boton-descarga";

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

/** Elegir el mes y descargar el informe de gestión del SG-SST en Word. */
export function BotonInformeGestion({ empresaId }: { empresaId: string }) {
  const [valor, setValor] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}`; });
  const opciones = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 12 + i); return { valor: `${d.getFullYear()}-${d.getMonth() + 1}`, etiqueta: `${MESES[d.getMonth()]} ${d.getFullYear()}` }; }).reverse();
  const [anio, mes] = valor.split("-");
  return (
    <div className="flex items-center gap-1.5">
      <Selector className="w-40" value={valor} onChange={setValor} opciones={opciones} />
      <BotonDescarga href={`/api/empresas/${empresaId}/informe-gestion?anio=${anio}&mes=${mes}`} texto="Armando el informe…" tooltip="Informe mensual para el cliente: avance del plan, estándares, accidentalidad, acciones, documentos, comités, lo que viene y recomendaciones. En Word, con logo y firmas."><FileBarChart /> Informe de gestión</BotonDescarga>
    </div>
  );
}
