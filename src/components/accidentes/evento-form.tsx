"use client";
import { CampoDocumento } from "@/components/app/campo-documento";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Selector } from "@/components/app/selector";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Ayuda } from "@/components/app/ayuda";
import { TIPOS_EVENTO, GRAVEDAD, VINCULACION } from "@/lib/eventos";
import { Combo, type GrupoCombo } from "@/components/app/combo";
import { Button } from "@/components/ui/button";
import type { CatalogoAccidentes, ItemSimple } from "@/lib/catalogo-accidentes";
import type { DatosEvento } from "@/app/actions/eventos";

export type CargoOpcion = { id: string; nombre: string; tareas: string[] };

/** Opciones de la biblioteca, con las típicas para la forma del evento primero. */
function grupos(items: (ItemSimple | string)[], tipicos: string[] = [], titulo = "Típicas para esta forma de evento"): GrupoCombo[] {
  const xs = items.map((i) => (typeof i === "string" ? { valor: i } : { valor: i.nombre, detalle: i.descripcion || undefined }));
  const t = xs.filter((x) => tipicos.includes(x.valor));
  return t.length ? [{ titulo, opciones: t }, { titulo: "Todas", opciones: xs.filter((x) => !tipicos.includes(x.valor)) }] : [{ opciones: xs }];
}

function Etiqueta({ htmlFor, children, k }: { htmlFor: string; children: React.ReactNode; k?: string }) {
  return <FieldLabel htmlFor={htmlFor} className="flex items-center gap-1">{children}{k && <Ayuda k={k} />}</FieldLabel>;
}

/** Formulario de registro de un evento. Controlado: el padre guarda. */
export function EventoForm({ d, set, cargos, cat, lugares }: { d: DatosEvento; set: (d: DatosEvento) => void; cargos: CargoOpcion[]; cat: CatalogoAccidentes; lugares: string[] }) {
  const u = <K extends keyof DatosEvento>(k: K, v: DatosEvento[K]) => set({ ...d, [k]: v });
  const cargo = cargos.find((c) => c.id === d.cargoId);
  const tareasOtro = [...new Set(cargos.flatMap((c) => c.tareas))];
  const forma = cat.formas.find((f) => f.nombre === d.mecanismo);
  const lesion = cat.lesiones.find((l) => l.nombre === d.lesion);
  const esAT = d.tipo === "AT", esAus = d.tipo === "AUSENTISMO";
  return (
    <FieldGroup className="gap-5">
      <FieldSet>
        <FieldLegend variant="label">El evento</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <Etiqueta htmlFor="ev-t" k="evTipo">Tipo</Etiqueta>
            <Selector id="ev-t" value={d.tipo} onChange={(v) => u("tipo", v)} opciones={Object.entries(TIPOS_EVENTO).map(([k, t]) => ({ valor: k, etiqueta: t.t }))} />
          </Field>
          {esAT && (
            <Field>
              <Etiqueta htmlFor="ev-g" k="evGravedad">Gravedad</Etiqueta>
              <Selector id="ev-g" value={d.gravedad ?? "leve"} onChange={(v) => u("gravedad", v)} opciones={Object.entries(GRAVEDAD).map(([k, g]) => ({ valor: k, etiqueta: g.t }))} />
            </Field>
          )}
          <Field><Etiqueta htmlFor="ev-f">{d.tipo === "EL" ? "Fecha del diagnóstico" : "Fecha"}</Etiqueta><Input id="ev-f" type="date" value={d.fecha} onChange={(e) => u("fecha", e.target.value)} /></Field>
          {!esAus && <Field><Etiqueta htmlFor="ev-h">Hora</Etiqueta><Input id="ev-h" type="time" value={d.hora ?? ""} onChange={(e) => u("hora", e.target.value)} /></Field>}
          {!esAus && <Field className="sm:col-span-2"><Etiqueta htmlFor="ev-l">Lugar</Etiqueta><Combo id="ev-l" value={d.lugar} onChange={(v) => u("lugar", v)} grupos={[{ titulo: "Sedes y zonas de la empresa", opciones: lugares.map((l) => ({ valor: l })) }]} placeholder="Sede, área o sitio exacto" /></Field>}
        </div>
        {esAT && d.gravedad && d.gravedad !== "leve" && <FieldDescription className="text-amber-700">Accidente {GRAVEDAD[d.gravedad].t.toLowerCase()}: además del FURAT, se avisa al Ministerio del Trabajo; el equipo investigador incluye un profesional con licencia en SST y el informe se remite a la ARL.</FieldDescription>}
      </FieldSet>

      <FieldSet>
        <FieldLegend variant="label">Persona afectada</FieldLegend>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field><Etiqueta htmlFor="ev-n">Nombre</Etiqueta><Input id="ev-n" placeholder="Nombres y apellidos" value={d.trabajadorNombre ?? ""} onChange={(e) => u("trabajadorNombre", e.target.value)} /></Field>
          <Field><Etiqueta htmlFor="ev-c" k="documentoIdentidad">Documento</Etiqueta><CampoDocumento id="ev-c" tipo={d.trabajadorTipoDoc} numero={d.trabajadorCedula} onTipo={(v) => u("trabajadorTipoDoc", v)} onNumero={(v) => u("trabajadorCedula", v)} /></Field>
          <Field>
            <Etiqueta htmlFor="ev-v" k="evVinculacion">Vinculación</Etiqueta>
            <Selector id="ev-v" value={d.vinculacion} onChange={(v) => u("vinculacion", v)} opciones={Object.entries(VINCULACION).map(([k, t]) => ({ valor: k, etiqueta: t }))} />
          </Field>
          <Field>
            <Etiqueta htmlFor="ev-cg">Cargo</Etiqueta>
            <Selector id="ev-cg" value={d.cargoId} onChange={(v) => set({ ...d, cargoId: v, cargo: cargos.find((c) => c.id === v)?.nombre ?? "" })} opciones={cargos.map((c) => ({ valor: c.id, etiqueta: c.nombre }))} />
            <FieldDescription>Se usa para revisar su matriz de peligros.</FieldDescription>
          </Field>
          {!esAus && <Field><Etiqueta htmlFor="ev-a">Antigüedad en el cargo</Etiqueta><Input id="ev-a" value={d.antiguedad ?? ""} placeholder="Ej: 8 meses" onChange={(e) => u("antiguedad", e.target.value)} /></Field>}
          {!esAus && <Field><Etiqueta htmlFor="ev-ta">Tarea que realizaba</Etiqueta><Combo id="ev-ta" placeholder="Seleccione o escriba la tarea" value={d.tarea} onChange={(v) => u("tarea", v)} grupos={cargo ? [{ titulo: `Tareas del cargo ${cargo.nombre}`, opciones: cargo.tareas.map((t) => ({ valor: t })) }] : [{ opciones: tareasOtro.map((t) => ({ valor: t })) }]} /></Field>}
        </div>
      </FieldSet>

      {!esAus && (
        <FieldSet>
          <FieldLegend variant="label">Qué pasó</FieldLegend>
          <Field><Etiqueta htmlFor="ev-d">Descripción</Etiqueta><Textarea id="ev-d" rows={4} value={d.descripcion ?? ""} placeholder="Qué hacía, qué pasó, cómo, con qué. Relato del trabajador y de los testigos. Sin diagnósticos médicos." onChange={(e) => u("descripcion", e.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field><Etiqueta htmlFor="ev-m" k="evMecanismo">Forma del evento</Etiqueta><Combo id="ev-m" placeholder="Seleccione o escriba la forma" value={d.mecanismo} onChange={(v) => u("mecanismo", v)} grupos={grupos(cat.formas.map((f) => ({ id: f.id, nombre: f.nombre, descripcion: f.descripcion })))} /></Field>
            <Field><Etiqueta htmlFor="ev-ag" k="evAgente">Agente</Etiqueta><Combo id="ev-ag" placeholder="Seleccione o escriba el agente" value={d.agente} onChange={(v) => u("agente", v)} grupos={grupos(cat.agentes, forma?.agentes)} /></Field>
            {esAT && <Field><Etiqueta htmlFor="ev-le" k="evLesion">Tipo de lesión</Etiqueta><Combo id="ev-le" placeholder="Seleccione o escriba la lesión" value={d.lesion} onChange={(v) => u("lesion", v)} grupos={grupos(cat.lesiones, forma?.lesiones)} /></Field>}
            {esAT && <Field><Etiqueta htmlFor="ev-p" k="evParte">Parte del cuerpo</Etiqueta><Combo id="ev-p" placeholder="Seleccione o escriba la parte del cuerpo" value={d.parteCuerpo} onChange={(v) => u("parteCuerpo", v)} grupos={grupos(cat.partes, forma?.partes, "Típicas para esta forma de evento")} /></Field>}
            {esAT && lesion?.sugiereGrave && d.gravedad === "leve" && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 sm:col-span-2">
                <span className="flex-1">{lesion.descripcion || "Esta lesión puede clasificar el accidente como grave"} (Res. 1401/2007 art. 3).</span>
                <Button type="button" size="xs" variant="outline" onClick={() => u("gravedad", "grave")}>Marcar como grave</Button>
              </div>
            )}
            <Field className="sm:col-span-2"><Etiqueta htmlFor="ev-te">Testigos</Etiqueta><Input id="ev-te" value={d.testigos ?? ""} placeholder="Nombres y cargos" onChange={(e) => u("testigos", e.target.value)} /></Field>
          </div>
        </FieldSet>
      )}

      {(esAT || esAus || d.tipo === "EL") && (
        <FieldSet>
          <FieldLegend variant="label">Incapacidad</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field><Etiqueta htmlFor="ev-di" k="evDias">Días de incapacidad</Etiqueta><Input id="ev-di" type="number" min={0} placeholder="Ej.: 3" value={d.diasIncapacidad ?? 0} onChange={(e) => u("diasIncapacidad", Number(e.target.value))} /></Field>
            {esAT && <Field><Etiqueta htmlFor="ev-dc" k="evDiasCargados">Días cargados</Etiqueta><Input id="ev-dc" type="number" min={0} placeholder="Ej.: 0" value={d.diasCargados ?? 0} onChange={(e) => u("diasCargados", Number(e.target.value))} /></Field>}
            {d.tipo === "EL" && (
              <Field>
                <Etiqueta htmlFor="ev-cn">Caso</Etiqueta>
                <Selector id="ev-cn" value={d.casoNuevo === false ? "antiguo" : "nuevo"} onChange={(v) => u("casoNuevo", v === "nuevo")} opciones={[{ valor: "nuevo", etiqueta: "Nuevo en el periodo" }, { valor: "antiguo", etiqueta: "Antiguo (ya diagnosticado)" }]} />
                <FieldDescription>Prevalencia cuenta todos; incidencia, solo los nuevos.</FieldDescription>
              </Field>
            )}
          </div>
        </FieldSet>
      )}
    </FieldGroup>
  );
}
