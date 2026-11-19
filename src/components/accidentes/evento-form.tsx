"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Ayuda } from "@/components/app/ayuda";
import { TIPOS_EVENTO, GRAVEDAD, VINCULACION, MECANISMOS, AGENTES, LESIONES, PARTES_CUERPO } from "@/lib/eventos";
import type { DatosEvento } from "@/app/actions/eventos";

export type CargoOpcion = { id: string; nombre: string; tareas: string[] };

function Lista({ id, value, onChange, opciones, placeholder }: { id: string; value?: string; onChange: (v: string) => void; opciones: string[]; placeholder?: string }) {
  return (
    <>
      <Input id={id} list={`${id}-l`} value={value ?? ""} placeholder={placeholder ?? "Elija o escriba"} onChange={(e) => onChange(e.target.value)} />
      <datalist id={`${id}-l`}>{opciones.map((o) => <option key={o} value={o} />)}</datalist>
    </>
  );
}

function Etiqueta({ htmlFor, children, k }: { htmlFor: string; children: React.ReactNode; k?: string }) {
  return <FieldLabel htmlFor={htmlFor} className="flex items-center gap-1">{children}{k && <Ayuda k={k} />}</FieldLabel>;
}

/** Formulario de registro de un evento. Controlado: el padre guarda. */
export function EventoForm({ d, set, cargos }: { d: DatosEvento; set: (d: DatosEvento) => void; cargos: CargoOpcion[] }) {
  const u = <K extends keyof DatosEvento>(k: K, v: DatosEvento[K]) => set({ ...d, [k]: v });
  const cargo = cargos.find((c) => c.id === d.cargoId);
  const [tareasOtro] = useState(() => [...new Set(cargos.flatMap((c) => c.tareas))]);
  const esAT = d.tipo === "AT", esAus = d.tipo === "AUSENTISMO";
  return (
    <FieldGroup className="gap-5">
      <FieldSet>
        <FieldLegend variant="label">El evento</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <Etiqueta htmlFor="ev-t" k="evTipo">Tipo</Etiqueta>
            <NativeSelect id="ev-t" className="w-full" value={d.tipo} onChange={(e) => u("tipo", e.target.value)}>
              {Object.entries(TIPOS_EVENTO).map(([k, t]) => <NativeSelectOption key={k} value={k}>{t.t}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          {esAT && (
            <Field>
              <Etiqueta htmlFor="ev-g" k="evGravedad">Gravedad</Etiqueta>
              <NativeSelect id="ev-g" className="w-full" value={d.gravedad ?? "leve"} onChange={(e) => u("gravedad", e.target.value)}>
                {Object.entries(GRAVEDAD).map(([k, g]) => <NativeSelectOption key={k} value={k}>{g.t}</NativeSelectOption>)}
              </NativeSelect>
            </Field>
          )}
          <Field><Etiqueta htmlFor="ev-f">{d.tipo === "EL" ? "Fecha del diagnóstico" : "Fecha"}</Etiqueta><Input id="ev-f" type="date" value={d.fecha} onChange={(e) => u("fecha", e.target.value)} /></Field>
          {!esAus && <Field><Etiqueta htmlFor="ev-h">Hora</Etiqueta><Input id="ev-h" type="time" value={d.hora ?? ""} onChange={(e) => u("hora", e.target.value)} /></Field>}
          {!esAus && <Field className="sm:col-span-2"><Etiqueta htmlFor="ev-l">Lugar</Etiqueta><Input id="ev-l" value={d.lugar ?? ""} placeholder="Sede, área o sitio exacto" onChange={(e) => u("lugar", e.target.value)} /></Field>}
        </div>
        {esAT && d.gravedad && d.gravedad !== "leve" && <FieldDescription className="text-amber-700">Accidente {GRAVEDAD[d.gravedad].t.toLowerCase()}: además del FURAT, se avisa al Ministerio del Trabajo; el equipo investigador incluye un profesional con licencia en SST y el informe se remite a la ARL.</FieldDescription>}
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">Persona afectada</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field><Etiqueta htmlFor="ev-n">Nombre</Etiqueta><Input id="ev-n" value={d.trabajadorNombre ?? ""} onChange={(e) => u("trabajadorNombre", e.target.value)} /></Field>
          <Field><Etiqueta htmlFor="ev-c">Cédula</Etiqueta><Input id="ev-c" value={d.trabajadorCedula ?? ""} onChange={(e) => u("trabajadorCedula", e.target.value)} /></Field>
          <Field>
            <Etiqueta htmlFor="ev-v" k="evVinculacion">Vinculación</Etiqueta>
            <NativeSelect id="ev-v" className="w-full" value={d.vinculacion ?? ""} onChange={(e) => u("vinculacion", e.target.value)}>
              <NativeSelectOption value="">Seleccione…</NativeSelectOption>
              {Object.entries(VINCULACION).map(([k, t]) => <NativeSelectOption key={k} value={k}>{t}</NativeSelectOption>)}
            </NativeSelect>
          </Field>
          <Field>
            <Etiqueta htmlFor="ev-cg">Cargo</Etiqueta>
            <NativeSelect id="ev-cg" className="w-full" value={d.cargoId ?? ""} onChange={(e) => set({ ...d, cargoId: e.target.value, cargo: cargos.find((c) => c.id === e.target.value)?.nombre ?? "" })}>
              <NativeSelectOption value="">Seleccione…</NativeSelectOption>
              {cargos.map((c) => <NativeSelectOption key={c.id} value={c.id}>{c.nombre}</NativeSelectOption>)}
            </NativeSelect>
            <FieldDescription>Se usa para revisar su matriz de peligros.</FieldDescription>
          </Field>
          {!esAus && <Field><Etiqueta htmlFor="ev-a">Antigüedad en el cargo</Etiqueta><Input id="ev-a" value={d.antiguedad ?? ""} placeholder="Ej: 8 meses" onChange={(e) => u("antiguedad", e.target.value)} /></Field>}
          {!esAus && <Field><Etiqueta htmlFor="ev-ta">Tarea que realizaba</Etiqueta><Lista id="ev-ta" value={d.tarea} onChange={(v) => u("tarea", v)} opciones={cargo?.tareas ?? tareasOtro} /></Field>}
        </div>
      </FieldSet>

      {!esAus && (
        <FieldSet>
          <FieldLegend variant="label">Qué pasó</FieldLegend>
          <Field><Etiqueta htmlFor="ev-d">Descripción</Etiqueta><Textarea id="ev-d" rows={4} value={d.descripcion ?? ""} placeholder="Qué hacía, qué pasó, cómo, con qué. Relato del trabajador y de los testigos. Sin diagnósticos médicos." onChange={(e) => u("descripcion", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field><Etiqueta htmlFor="ev-m" k="evMecanismo">Forma del evento</Etiqueta><Lista id="ev-m" value={d.mecanismo} onChange={(v) => u("mecanismo", v)} opciones={MECANISMOS} /></Field>
            <Field><Etiqueta htmlFor="ev-ag" k="evAgente">Agente</Etiqueta><Lista id="ev-ag" value={d.agente} onChange={(v) => u("agente", v)} opciones={AGENTES} /></Field>
            {esAT && <Field><Etiqueta htmlFor="ev-le" k="evLesion">Tipo de lesión</Etiqueta><Lista id="ev-le" value={d.lesion} onChange={(v) => u("lesion", v)} opciones={LESIONES} /></Field>}
            {esAT && <Field><Etiqueta htmlFor="ev-p" k="evParte">Parte del cuerpo</Etiqueta><Lista id="ev-p" value={d.parteCuerpo} onChange={(v) => u("parteCuerpo", v)} opciones={PARTES_CUERPO} /></Field>}
            <Field className="sm:col-span-2"><Etiqueta htmlFor="ev-te">Testigos</Etiqueta><Input id="ev-te" value={d.testigos ?? ""} placeholder="Nombres y cargos" onChange={(e) => u("testigos", e.target.value)} /></Field>
          </div>
        </FieldSet>
      )}

      {(esAT || esAus || d.tipo === "EL") && (
        <FieldSet>
          <FieldLegend variant="label">Incapacidad</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field><Etiqueta htmlFor="ev-di" k="evDias">Días de incapacidad</Etiqueta><Input id="ev-di" type="number" min={0} value={d.diasIncapacidad ?? 0} onChange={(e) => u("diasIncapacidad", Number(e.target.value))} /></Field>
            {esAT && <Field><Etiqueta htmlFor="ev-dc" k="evDiasCargados">Días cargados</Etiqueta><Input id="ev-dc" type="number" min={0} value={d.diasCargados ?? 0} onChange={(e) => u("diasCargados", Number(e.target.value))} /></Field>}
            {d.tipo === "EL" && (
              <Field>
                <Etiqueta htmlFor="ev-cn">Caso</Etiqueta>
                <NativeSelect id="ev-cn" className="w-full" value={d.casoNuevo === false ? "antiguo" : "nuevo"} onChange={(e) => u("casoNuevo", e.target.value === "nuevo")}>
                  <NativeSelectOption value="nuevo">Nuevo en el periodo</NativeSelectOption>
                  <NativeSelectOption value="antiguo">Antiguo (ya diagnosticado)</NativeSelectOption>
                </NativeSelect>
                <FieldDescription>Prevalencia cuenta todos; incidencia, solo los nuevos.</FieldDescription>
              </Field>
            )}
          </div>
        </FieldSet>
      )}
    </FieldGroup>
  );
}
