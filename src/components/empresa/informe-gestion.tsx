"use client";
import { sugerirObservacionesInforme } from "@/app/actions/ia";
import { BotonIA } from "@/components/app/boton-ia";
import { useState } from "react";
import { FileBarChart, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Selector } from "@/components/app/selector";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { guardarObservacionesInforme } from "@/app/actions/empresas";

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

/** Informe de gestión para la gerencia del cliente: periodo, observaciones de la consultora y descarga en PDF o Word. */
export function BotonInformeGestion({ empresaId, observaciones }: { empresaId: string; observaciones: Record<string, string> }) {
  const [tipo, setTipo] = useState("mes");
  const [valor, setValor] = useState(() => opcionesPeriodo("mes")[0].valor);
  const [guardadas, setGuardadas] = useState(observaciones);
  const [texto, setTexto] = useState(observaciones[opcionesPeriodo("mes")[0].valor] ?? "");
  const elegir = (v: string) => { setValor(v); setTexto(guardadas[v] ?? ""); };
  const cambiarTipo = (t: string) => { setTipo(t); elegir(opcionesPeriodo(t)[0].valor); };
  // Guarda las observaciones del periodo antes de armar el archivo (salen impresas en el informe).
  const guardar = async () => { if ((guardadas[valor] ?? "") === texto.trim()) return; await guardarObservacionesInforme(empresaId, valor, texto); setGuardadas({ ...guardadas, [valor]: texto.trim() }); };
  const href = `/api/empresas/${empresaId}/informe-gestion?p=${encodeURIComponent(valor)}`;
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" tooltip="Informe para la gerencia del cliente: resumen ejecutivo, avance, logros del periodo, trabajo de la consultora y qué sigue" />}><FileBarChart /> Informe de gestión</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Informe de gestión</DialogTitle>
          <DialogDescription>Para entregar a la gerencia del cliente: resumen ejecutivo, en qué punto va el SG-SST, logros del periodo, visitas y horas de la consultora, qué sigue y compromisos de la empresa.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
          <Field><FieldLabel>Periodo</FieldLabel><Selector value={tipo} onChange={cambiarTipo} opciones={[{ valor: "mes", etiqueta: "Mensual" }, { valor: "trim", etiqueta: "Trimestral" }, { valor: "sem", etiqueta: "Semestral" }, { valor: "anio", etiqueta: "Anual" }, { valor: "inicio", etiqueta: "Acumulado" }]} /></Field>
          {tipo !== "inicio" ? <Field><FieldLabel>Cuál</FieldLabel><Selector value={valor} onChange={elegir} opciones={opcionesPeriodo(tipo)} /></Field> : <Field><FieldLabel>Cuál</FieldLabel><p className="py-2 text-sm text-muted-foreground">Desde el inicio del SG-SST hasta hoy</p></Field>}
        </div>
        <Field>
          <div className="flex items-center justify-between gap-2">
            <FieldLabel htmlFor="ig-obs">Observaciones de la consultora</FieldLabel>
            <BotonIA accion={() => sugerirObservacionesInforme(empresaId, valor)} onPropuesta={(r) => setTexto(r.texto)} tooltip="La IA redacta un borrador con los datos del periodo; revíselo y ajústelo">Borrador con IA</BotonIA>
          </div>
          <Textarea id="ig-obs" rows={6} className="bg-background" value={texto} onChange={(e) => setTexto(e.target.value)}
            placeholder="Ej.: Se avanzó en la conformación de comités y la inducción del personal. Para el próximo periodo es prioritario firmar la política y programar los exámenes médicos pendientes. Se recomienda a la gerencia asignar el presupuesto del SG-SST." />
          <FieldDescription>Salen impresas en el informe. Se guardan para este periodo; si lo deja vacío, el informe trae líneas para escribirlas a mano.</FieldDescription>
        </Field>
        <DialogFooter>
          <BotonDescarga href={href} antes={guardar} texto="Armando el Word…" tooltip="Word editable">Word</BotonDescarga>
          <BotonDescarga href={`${href}&formato=pdf`} antes={guardar} variant="default" texto="Generando PDF…" tooltip="PDF con membrete de la consultora, para entregar"><FileDown /> Descargar PDF</BotonDescarga>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
