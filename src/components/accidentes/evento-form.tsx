"use client";
import { CampoDocumento } from "@/components/app/campo-documento";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Selector } from "@/components/app/selector";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Ayuda } from "@/components/app/ayuda";
import { TIPOS_EVENTO, GRAVEDAD, VINCULACION, TIPO_ACCIDENTE, TURNOS } from "@/lib/eventos";
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

/** Encabezado de sección con la ayuda que explica todos sus campos y el artículo que los exige. */
function Encabezado({ children, k, nota }: { children: React.ReactNode; k: string; nota?: string }) {
  return (
    <div className="space-y-0.5">
      <FieldLegend variant="label" className="flex items-center gap-1">{children}<Ayuda k={k} /></FieldLegend>
      {nota && <FieldDescription>{nota}</FieldDescription>}
    </div>
  );
}

/**
 * Formulario de registro de un evento. Controlado: el padre guarda.
 * Captura las variables del FURAT (Res. 156/2005) que el informe de investigación debe retomar (Res. 1401/2007 arts. 9 y 10),
 * sin diagnósticos médicos (Ley 1581/2012).
 */
export function EventoForm({ d, set, cargos, cat, lugares }: { d: DatosEvento; set: (d: DatosEvento) => void; cargos: CargoOpcion[]; cat: CatalogoAccidentes; lugares: string[] }) {
  const u = <K extends keyof DatosEvento>(k: K, v: DatosEvento[K]) => set({ ...d, [k]: v });
  const cargo = cargos.find((c) => c.id === d.cargoId);
  const tareasOtro = [...new Set(cargos.flatMap((c) => c.tareas))];
  const forma = cat.formas.find((f) => f.nombre === d.mecanismo);
  const lesion = cat.lesiones.find((l) => l.nombre === d.lesion);
  const esAT = d.tipo === "AT", esAus = d.tipo === "AUSENTISMO", esEL = d.tipo === "EL";
  const conSitio = !esAus && !esEL;
  return (
    <FieldGroup className="gap-5">
      <FieldSet>
        <Encabezado k="evInformacion" nota={conSitio ? "Fecha, hora, lugar y sitio exacto, jornada y tiempo laborado: lo que pide el FURAT y el informe de investigación (Res. 1401/2007 art. 9)." : undefined}>Información del evento</Encabezado>
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
          {esAT && (
            <Field>
              <Etiqueta htmlFor="ev-ta2">Tipo de accidente</Etiqueta>
              <Selector id="ev-ta2" value={d.tipoAccidente} onChange={(v) => u("tipoAccidente", v)} placeholder="Según el FURAT" opciones={Object.entries(TIPO_ACCIDENTE).map(([k, t]) => ({ valor: k, etiqueta: t }))} />
            </Field>
          )}
          <Field><Etiqueta htmlFor="ev-f">{esEL ? "Fecha del diagnóstico" : "Fecha"}</Etiqueta><Input id="ev-f" type="date" value={d.fecha} onChange={(e) => u("fecha", e.target.value)} /></Field>
          {!esAus && <Field><Etiqueta htmlFor="ev-h">Hora</Etiqueta><Input id="ev-h" type="time" value={d.hora ?? ""} onChange={(e) => u("hora", e.target.value)} /></Field>}
          {!esAus && <Field><Etiqueta htmlFor="ev-l">Lugar</Etiqueta><Combo id="ev-l" value={d.lugar} onChange={(v) => u("lugar", v)} grupos={[{ titulo: "Sedes y zonas de la empresa", opciones: lugares.map((l) => ({ valor: l })) }]} placeholder="Sede, área o zona" /></Field>}
          {conSitio && <Field className="sm:col-span-2"><Etiqueta htmlFor="ev-se">Sitio exacto</Etiqueta><Input id="ev-se" value={d.sitioExacto ?? ""} placeholder="Ej.: puesto 3 de la línea de corte, junto a la cizalla manual" onChange={(e) => u("sitioExacto", e.target.value)} /></Field>}
          {conSitio && (
            <Field>
              <Etiqueta htmlFor="ev-jh">Jornada habitual</Etiqueta>
              <Selector id="ev-jh" value={d.jornadaHabitual} onChange={(v) => u("jornadaHabitual", v)} placeholder="¿Estaba en su jornada habitual?" opciones={[{ valor: "si", etiqueta: "Sí, en su jornada y labor habitual" }, { valor: "no", etiqueta: "No (horas extra, turno distinto, otra labor)" }]} />
            </Field>
          )}
          {conSitio && <Field><Etiqueta htmlFor="ev-tu">Turno</Etiqueta><Combo id="ev-tu" value={d.turno} onChange={(v) => u("turno", v)} grupos={[{ opciones: TURNOS.map((t) => ({ valor: t })) }]} placeholder="Ej.: Diurno 7:00 a 16:00" /></Field>}
          {conSitio && <Field><Etiqueta htmlFor="ev-tl">Tiempo laborado antes del evento</Etiqueta><Input id="ev-tl" value={d.tiempoLaborado ?? ""} placeholder="Ej.: 3 horas y 20 minutos" onChange={(e) => u("tiempoLaborado", e.target.value)} /></Field>}
        </div>
        {esAT && d.gravedad && d.gravedad !== "leve" && <FieldDescription className="text-amber-700">Accidente {GRAVEDAD[d.gravedad].t.toLowerCase()}: además del FURAT, se avisa al Ministerio del Trabajo; el equipo investigador incluye un profesional con licencia en SST y personal de diseño de normas, procesos o mantenimiento (Res. 1401/2007 art. 7) y el informe se remite a la ARL dentro de los 15 días (art. 14).{d.gravedad === "mortal" ? " En accidentes mortales la investigación se hace obligatoriamente en el formato de la ARL (art. 4 num. 3)." : ""}</FieldDescription>}
      </FieldSet>

      <FieldSet>
        <Encabezado k="evTrabajador" nota={esAus ? undefined : "Identificación del trabajador como la pide el FURAT: nombre, documento, vinculación, cargo y antigüedad en el cargo y en la empresa."}>Persona afectada</Encabezado>
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
          {!esAus && <Field><Etiqueta htmlFor="ev-a">Antigüedad en el cargo</Etiqueta><Input id="ev-a" value={d.antiguedad ?? ""} placeholder="Ej.: 8 meses" onChange={(e) => u("antiguedad", e.target.value)} /></Field>}
          {!esAus && <Field><Etiqueta htmlFor="ev-ae">Antigüedad en la empresa</Etiqueta><Input id="ev-ae" value={d.tiempoEmpresa ?? ""} placeholder="Ej.: 2 años y 3 meses" onChange={(e) => u("tiempoEmpresa", e.target.value)} /></Field>}
          {!esAus && <Field className="sm:col-span-3"><Etiqueta htmlFor="ev-ta">Tarea que realizaba</Etiqueta><Combo id="ev-ta" placeholder="Seleccione o escriba la tarea" value={d.tarea} onChange={(v) => u("tarea", v)} grupos={cargo ? [{ titulo: `Tareas del cargo ${cargo.nombre}`, opciones: cargo.tareas.map((t) => ({ valor: t })) }] : [{ opciones: tareasOtro.map((t) => ({ valor: t })) }]} /></Field>}
        </div>
      </FieldSet>

      {!esAus && (
        <FieldSet>
          <Encabezado k="evDescripcion" nota="Relato completo de los hechos: qué hacía, cuándo, dónde, cómo, por qué y con quién; y la versión del trabajador y de los testigos (Res. 1401/2007 art. 10). Sin diagnósticos médicos.">Qué pasó</Encabezado>
          <Field><Etiqueta htmlFor="ev-d">Descripción</Etiqueta><Textarea id="ev-d" rows={4} value={d.descripcion ?? ""} placeholder="Ej.: A las 10:30, al cortar varilla de 1/2 pulgada con la cizalla manual del puesto 3, la varilla se deslizó y el borde le produjo una herida en la palma de la mano izquierda. No usaba guantes anticorte." onChange={(e) => u("descripcion", e.target.value)} /></Field>
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
            {!esEL && <Field className="sm:col-span-2"><Etiqueta htmlFor="ev-te">Testigos</Etiqueta><Input id="ev-te" value={d.testigos ?? ""} placeholder="Ej.: María López (C.C. 52.000.000), operaria de corte; Pedro Ruiz (C.C. 80.000.000), supervisor" onChange={(e) => u("testigos", e.target.value)} /></Field>}
            {!esEL && <Field><Etiqueta htmlFor="ev-vt">Versión del trabajador</Etiqueta><Textarea id="ev-vt" rows={3} value={d.versionTrabajador ?? ""} placeholder="Ej.: “Estaba cortando la varilla como siempre; se me resbaló y me cortó la mano. Los guantes estaban en el casillero.”" onChange={(e) => u("versionTrabajador", e.target.value)} /></Field>}
            {!esEL && <Field><Etiqueta htmlFor="ev-vts">Versión de los testigos</Etiqueta><Textarea id="ev-vts" rows={3} value={d.versionTestigos ?? ""} placeholder="Ej.: “Vi que la varilla se movió al hacer fuerza; la cizalla no tenía el tope puesto.” — María López" onChange={(e) => u("versionTestigos", e.target.value)} /></Field>}
          </div>
        </FieldSet>
      )}

      {(esAT || esAus || esEL) && (
        <FieldSet>
          <FieldLegend variant="label">Incapacidad</FieldLegend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field><Etiqueta htmlFor="ev-di" k="evDias">Días de incapacidad</Etiqueta><Input id="ev-di" type="number" min={0} placeholder="Ej.: 3" value={d.diasIncapacidad ?? 0} onChange={(e) => u("diasIncapacidad", Number(e.target.value))} /></Field>
            {esAT && <Field><Etiqueta htmlFor="ev-dc" k="evDiasCargados">Días cargados</Etiqueta><Input id="ev-dc" type="number" min={0} placeholder="Ej.: 0" value={d.diasCargados ?? 0} onChange={(e) => u("diasCargados", Number(e.target.value))} /></Field>}
            {esEL && (
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
