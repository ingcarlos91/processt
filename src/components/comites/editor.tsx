"use client";
import { hoyLocal } from "@/lib/utils";
import Link from "next/link";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Pencil, X, CalendarDays, CircleCheck, CircleAlert, TriangleAlert } from "lucide-react";
import { CampoDocumento } from "@/components/app/campo-documento";
import { abrevDoc } from "@/lib/documento-identidad";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { Field, FieldLabel } from "@/components/ui/field";
import { NormaRef } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import { Porque } from "@/components/app/porque";
import { Ayuda } from "@/components/app/ayuda";
import { Tip } from "@/components/app/tip";
import { SubirArchivo, ListaArchivos, type ArchivoUI } from "@/components/app/adjuntos";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import * as A from "@/app/actions/sgsst";
import { Buscador } from "@/components/app/buscador";
import { validarConformacion, type Composicion } from "@/lib/comites";
import { AvisoTareas, type TareaAviso } from "@/components/plazos/aviso-tareas";
import { toastTareas } from "@/components/plazos/toast-tareas";
import { avisoPlazo, deInput } from "@/lib/plazos";

type Miembro = { id: string; nombre: string; tipoDoc: string; cedula: string; cargo: string; rol: string; calidad: string; cargoComite: string; representa: string };
type Comite = { id: string; tipo: string; sede: string; inicio: string; fin: string; normaRef: string; datos: Record<string, unknown>; composicion: Composicion | null; congelada: boolean; actas: ArchivoUI[]; miembros: Miembro[] };
type TrabajadorOpcion = { nombre: string; tipoDoc: string; documento: string; cargo: string };
type SedeOpcion = { nombre: string; principal: boolean; trabajadores: number };

const INFO: Record<string, { nombre: string; doc: string; desc: string }> = {
  COPASST: { nombre: "Comité Paritario de SST (COPASST)", doc: "ACT-01", desc: "Paritario, periodo de 2 años, reunión mensual, 4 horas semanales para sus funciones." },
  VIGIA: { nombre: "Vigía de SST", doc: "ACT-01", desc: "Para empresas de menos de 10 trabajadores; cumple las mismas funciones del comité. La empresa adopta un periodo de 2 años." },
  CCL: { nombre: "Comité de Convivencia Laboral", doc: "ACT-04", desc: "Reunión mensual; procedimiento preventivo de máximo 65 días; un comité de nivel central y uno por cada centro de trabajo." },
  BRIGADA: { nombre: "Brigada de emergencias", doc: "ACT-05", desc: "Conformada, capacitada y dotada; incluye primeros auxilios." },
};
const ROLES_BRIGADA = [["jefe_brigada", "Jefe de brigada"], ["brigadista", "Brigadista"]];
const CARGO_TXT: Record<string, string> = { presidente: "Presidente", secretario: "Secretario" };
const calidadTxt = (tipo: string, c: string) => (tipo === "VIGIA" ? (c === "suplente" ? "Suplente del Vigía" : "Vigía") : c === "suplente" ? "Suplente" : c === "principal" ? "Principal" : "—");
/** El rol guardado es el cargo en el comité (presidente o secretario) o, si no tiene, la calidad. */
const rolDe = (tipo: string, m: { rol: string; calidad: string; cargoComite: string }) => (tipo === "BRIGADA" ? m.rol : tipo === "VIGIA" ? "vigia" : m.cargoComite || m.calidad || "principal");

/** Lo que se programa al registrar el comité: fin del periodo (no la brigada) y, en COPASST y CCL, la reunión mensual. */
const tareasComite = (tipo: string, inicio: string): TareaAviso[] => [
  ...(tipo !== "BRIGADA" && inicio ? [{ ...avisoPlazo("comite_periodo", deInput(inicio)), tarea: "Fin del periodo del comité: conformar el nuevo" }] : []),
  ...(tipo === "COPASST" || tipo === "CCL" ? [{ ...avisoPlazo("comite_reunion"), tarea: "Reunión mensual del comité (en el plan anual)" }] : []),
];

export function ComitesEditor({ empresaId, requeridos, comites, composicionNueva, refs, porques, trabajadores = [], sedes = [], trabajadoresEmpresa }: { empresaId: string; requeridos: string[]; comites: Comite[]; composicionNueva: Record<string, Composicion | null>; trabajadores?: TrabajadorOpcion[]; sedes?: SedeOpcion[]; trabajadoresEmpresa: number; refs: Record<string, string>; porques: Record<string, string> }) {
  const [, start] = useTransition();
  const run = (fn: () => Promise<unknown>, ok?: string, tareas?: TareaAviso[]) => start(async () => { try { await fn(); if (ok) { if (tareas?.length) toastTareas(ok, tareas); else toast.success(ok); } } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo guardar."); } });
  const tarjeta = (tipo: string, c: Comite | undefined, sede?: string) => (
    <TarjetaComite key={c?.id ?? `${tipo}-${sede ?? ""}`} tipo={tipo} c={c} sede={sede} empresaId={empresaId} run={run} trabajadores={trabajadores}
      composicionNueva={composicionNueva[tipo] ?? null} refNorma={refs[tipo === "VIGIA" ? "COPASST" : tipo]} porque={porques[tipo === "VIGIA" ? "COPASST" : tipo]} />
  );
  return (
    <div className="grid gap-6">
      {requeridos.map((tipo) => {
        if (tipo !== "CCL") return tarjeta(tipo, comites.find((x) => x.tipo === tipo));
        // CCL: uno de nivel central (sin sede) y uno por cada centro de trabajo (Res. 3461/2025 art. 3).
        const ccls = comites.filter((x) => x.tipo === "CCL");
        const central = ccls.find((x) => !x.sede);
        const porSede = ccls.filter((x) => x.sede);
        const libres = sedes.filter((s) => !porSede.some((x) => x.sede === s.nombre));
        return (
          <div key="CCL" className="grid gap-6">
            {tarjeta("CCL", central)}
            {porSede.map((c) => tarjeta("CCL", c, c.sede))}
            {sedes.length > 1 && libres.length > 0 && <NuevoCclSede sedes={libres} trabajadoresEmpresa={trabajadoresEmpresa} onCrear={(f, sede, n) => run(() => A.crearComite(empresaId, "CCL", f, { sede, trabajadores: n }), `Comité de Convivencia de ${sede} registrado`, tareasComite("CCL", f))} />}
          </div>
        );
      })}
    </div>
  );
}

function TarjetaComite({ tipo, c, sede, empresaId, run, trabajadores, composicionNueva, refNorma, porque }: { tipo: string; c?: Comite; sede?: string; empresaId: string; run: (fn: () => Promise<unknown>, ok?: string, tareas?: TareaAviso[]) => void; trabajadores: TrabajadorOpcion[]; composicionNueva: Composicion | null; refNorma?: string; porque?: string }) {
  const [editando, setEditando] = useState<Miembro | null>(null);
  const [periodo, setPeriodo] = useState<{ inicio: string; fin: string; trabajadores: string } | null>(null);
  const hoy = hoyLocal();
  const info = INFO[tipo];
  const titulo = sede ? `${info.nombre} · ${sede}` : info.nombre;
  const vence = c?.fin ? Math.round((new Date(c.fin).getTime() - new Date(hoy).getTime()) / 864e5) : null;
  const paritario = tipo === "COPASST" || tipo === "CCL";
  const avisos = c ? validarConformacion(tipo, c.composicion, c.miembros) : [];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">{titulo}<Porque titulo={`¿Por qué ${info.nombre}?`} normas={[refNorma ?? c?.normaRef]}>{porque ?? info.desc}</Porque></CardTitle>
        <CardDescription>{info.desc}</CardDescription>
        <CardAction className="flex flex-col items-end gap-1"><NormaRef>{refNorma ?? c?.normaRef}</NormaRef>{!sede && <Link href={`/empresas/${empresaId}/documentos/${info.doc}`} className={buttonVariants({ size: "xs", variant: "ghost" })}><FileText /> {info.doc}</Link>}</CardAction>
      </CardHeader>
      <CardContent>
        {!c ? (
          <EstadoVacio ilustracion="comites" compacto titulo={<>No registrado</>} descripcion={<>Registre la fecha de conformación para controlar el periodo.{composicionNueva && <> Al registrarlo se fija la composición con los trabajadores de hoy ({composicionNueva.trabajadores}): {composicionNueva.texto}.</>}</>}>
            <NuevoComite tipo={tipo} onCrear={(f) => run(() => A.crearComite(empresaId, tipo, f), "Comité registrado", tareasComite(tipo, f))} />
          </EstadoVacio>
        ) : (
          <div className="space-y-3">
            {periodo ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end rounded-lg border p-3">
                <Field><FieldLabel className="text-xs">Fecha de conformación</FieldLabel><Input type="date" placeholder="AAAA-MM-DD" value={periodo.inicio} onChange={(e) => setPeriodo({ ...periodo, inicio: e.target.value })} /></Field>
                {tipo !== "BRIGADA" && <Field><FieldLabel className="text-xs">Vence el</FieldLabel><Input type="date" placeholder="AAAA-MM-DD" value={periodo.fin} onChange={(e) => setPeriodo({ ...periodo, fin: e.target.value })} /></Field>}
                {c.composicion && <Field><FieldLabel className="text-xs">Trabajadores al conformarlo</FieldLabel><Input type="number" min={1} placeholder="Ej.: 18" value={periodo.trabajadores} onChange={(e) => setPeriodo({ ...periodo, trabajadores: e.target.value })} /></Field>}
                <div className="flex gap-1">
                  <Button size="sm" title="Guardar las fechas del periodo" disabled={!periodo.inicio || (!!periodo.fin && periodo.fin < periodo.inicio)} onClick={() => { run(() => A.actualizarPeriodoComite(empresaId, c.id, periodo.inicio, periodo.fin, Number(periodo.trabajadores) || undefined), "Periodo actualizado"); setPeriodo(null); }}>Guardar</Button>
                  <Button size="sm" variant="ghost" title="Cancelar sin guardar" onClick={() => setPeriodo(null)}>Cancelar</Button>
                </div>
                {!!periodo.fin && periodo.fin < periodo.inicio && <p className="md:col-span-4 text-xs text-destructive">La fecha de vencimiento no puede ser anterior a la de conformación.</p>}
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="outline">Desde {c.inicio}</Badge>
                {c.fin && <Badge variant={vence !== null && vence < 60 ? "destructive" : "outline"}>Hasta {c.fin}{vence !== null && vence < 60 ? ` · vence en ${vence} días` : ""}</Badge>}
                <Tip texto="Corregir la fecha de conformación, el vencimiento del periodo o los trabajadores que había al conformarlo."><Button size="xs" variant="ghost" onClick={() => setPeriodo({ inicio: c.inicio, fin: c.fin, trabajadores: String(c.composicion?.trabajadores ?? "") })}><CalendarDays /> Editar periodo</Button></Tip>
                <div className="flex-1" />
                <Confirmar trigger={<Button size="xs" variant="ghost" title="Eliminar el comité y sus integrantes" />} titulo={`Eliminar ${titulo}`} destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarComite(empresaId, c.id))}><Trash2 /> Eliminar</Confirmar>
              </div>
            )}
            {c.composicion && <ComposicionCaja tipo={tipo} comp={c.composicion} congelada={c.congelada} avisos={avisos} />}
            <Table>
              <TableHeader><TableRow>
                <TableHead>Nombre</TableHead><TableHead>Cargo en la empresa</TableHead>
                {tipo === "BRIGADA" ? <TableHead>Rol</TableHead> : <TableHead>Calidad</TableHead>}
                {paritario && <TableHead>Cargo en el comité</TableHead>}
                {paritario && <TableHead>Representa</TableHead>}
                <TableHead className="w-20" />
              </TableRow></TableHeader>
              <TableBody>
                {c.miembros.map((m) => {
                  const ed = editando?.id === m.id ? editando : null;
                  return (
                    <TableRow key={m.id}>
                      {ed ? (
                        <>
                          <TableCell className="space-y-1.5"><Input value={ed.nombre} placeholder="Nombres y apellidos" onChange={(e) => setEditando({ ...ed, nombre: e.target.value })} /><CampoDocumento tipo={ed.tipoDoc} numero={ed.cedula} onTipo={(v) => setEditando({ ...ed, tipoDoc: v })} onNumero={(v) => setEditando({ ...ed, cedula: v })} /></TableCell>
                          <TableCell><Input value={ed.cargo} placeholder="Ej.: Auxiliar de bodega" onChange={(e) => setEditando({ ...ed, cargo: e.target.value })} /></TableCell>
                          <TableCell><SelectorCalidad tipo={tipo} m={ed} onChange={(v) => setEditando({ ...ed, ...v })} /></TableCell>
                          {paritario && <TableCell><SelectorCargo m={ed} onChange={(v) => setEditando({ ...ed, cargoComite: v })} /></TableCell>}
                          {paritario && <TableCell><SelectorRepresenta m={ed} onChange={(v) => setEditando({ ...ed, representa: v })} /></TableCell>}
                        </>
                      ) : (
                        <>
                          <TableCell>{m.nombre}<div className={m.cedula ? "text-xs text-muted-foreground" : "text-xs text-amber-700"}>{m.cedula ? `${abrevDoc(m.tipoDoc)} ${m.cedula}` : "Sin documento"}</div></TableCell>
                          <TableCell>{m.cargo}</TableCell>
                          <TableCell>{tipo === "BRIGADA" ? ROLES_BRIGADA.find((r) => r[0] === m.rol)?.[1] ?? m.rol : calidadTxt(tipo, m.calidad)}</TableCell>
                          {paritario && <TableCell>{CARGO_TXT[m.cargoComite] ?? "—"}</TableCell>}
                          {paritario && <TableCell className={m.representa ? "" : "text-amber-700"}>{m.representa === "empleador" ? "Empleador" : m.representa === "trabajadores" ? "Trabajadores" : "Sin indicar"}</TableCell>}
                        </>
                      )}
                      <TableCell>
                        <div className="flex justify-end gap-0.5">
                          {ed
                            ? <><Button size="xs" title="Guardar los cambios del integrante" onClick={() => { run(() => A.actualizarMiembro(empresaId, m.id, { ...ed, rol: rolDe(tipo, ed) }), "Integrante actualizado"); setEditando(null); }}>Guardar</Button><Tip texto="Cancelar sin guardar"><Button size="icon-xs" variant="ghost" aria-label="Cancelar" onClick={() => setEditando(null)}><X /></Button></Tip></>
                            : <Tip texto="Editar nombre, documento, calidad, cargo en el comité o a quién representa"><Button size="icon-xs" variant="ghost" aria-label="Editar integrante" onClick={() => setEditando(m)}><Pencil /></Button></Tip>}
                          <Tip texto="Quitar al integrante del comité"><Button size="icon-xs" variant="ghost" aria-label="Quitar" onClick={() => run(() => A.eliminarMiembro(empresaId, m.id))}><Trash2 /></Button></Tip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!c.miembros.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Sin integrantes</TableCell></TableRow>}
              </TableBody>
            </Table>
            <div className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Actas y documentos firmados</div>
                <SubirArchivo empresaId={empresaId} ctx={{ tipo: "ACTA", comiteId: c.id }} titulo="Subir acta firmada" ayuda={tipo === "BRIGADA" ? "Acta de conformación, registros de capacitación o informes de simulacro firmados." : "Acta de conformación, de elección o de cada reunión, firmada. La norma pide reunión mensual."} />
              </div>
              <ListaArchivos empresaId={empresaId} archivos={c.actas} vacio="Sin actas subidas." />
            </div>
          </div>
        )}
      </CardContent>
      {c && (
        <CardFooter className="border-t flex-col items-stretch gap-4">
          <NuevoMiembro tipo={tipo} trabajadores={trabajadores} onAgregar={(m) => run(() => A.agregarMiembro(empresaId, c.id, { ...m, rol: rolDe(tipo, m) }), "Integrante agregado")} />
          {paritario && <DatosEleccion tipo={tipo} inicial={c.datos} onGuardar={(d) => run(() => A.guardarDatosComite(empresaId, c.id, d), "Datos de la elección guardados")} />}
        </CardFooter>
      )}
    </Card>
  );
}

/** Composición exigida (congelada al conformar) y resultado de comparar lo registrado con ella. */
function ComposicionCaja({ tipo, comp, congelada, avisos }: { tipo: string; comp: Composicion; congelada: boolean; avisos: ReturnType<typeof validarConformacion> }) {
  const icono: Record<string, ReactNode> = { ok: <CircleCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />, aviso: <TriangleAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />, error: <CircleAlert className="size-4 text-destructive shrink-0 mt-0.5" /> };
  const fija = tipo === "CCL" ? "Si el número de trabajadores cambia durante el periodo, la conformación no se ajusta hasta que este termine (Res. 3461/2025 art. 5 par. 1)." : tipo === "COPASST" ? "El número de representantes se fija con los trabajadores al momento de conformarlo (Res. 2013/1986 art. 2) y se mantiene durante el periodo." : "";
  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
      <div>
        <span className="font-medium">Composición exigida:</span> {comp.texto}
        {tipo !== "VIGIA" && <> — calculada con {comp.trabajadores} trabajadores{comp.tramo ? ` (${comp.tramo})` : ""}.</>} <NormaRef>{comp.norma}</NormaRef>
      </div>
      {fija && <p className="text-xs text-muted-foreground">{fija}</p>}
      {!congelada && <p className="text-xs text-amber-700">Este comité se registró sin composición fija: se muestra la calculada con los trabajadores de hoy. Use «Editar periodo» para fijar los que había al conformarlo.</p>}
      {comp.origen === "actualizacion" && <p className="text-xs text-amber-700">La composición se fijó al actualizar el sistema con los trabajadores de ese día. Si al conformar el comité había otro número, corríjalo en «Editar periodo».</p>}
      {avisos.length > 0 && (
        <ul className="space-y-1">
          {avisos.map((a, i) => <li key={i} className="flex gap-1.5 text-xs">{icono[a.nivel]}<span>{a.texto} <span className="text-muted-foreground">({a.norma})</span></span></li>)}
        </ul>
      )}
    </div>
  );
}

function SelectorCalidad({ tipo, m, onChange }: { tipo: string; m: { rol: string; calidad: string }; onChange: (v: { rol?: string; calidad?: string }) => void }) {
  if (tipo === "BRIGADA") return <NativeSelect className="w-full" value={m.rol} onChange={(e) => onChange({ rol: e.target.value })}>{ROLES_BRIGADA.map(([v, l]) => <NativeSelectOption key={v} value={v}>{l}</NativeSelectOption>)}</NativeSelect>;
  return (
    <NativeSelect className="w-full" value={m.calidad || "principal"} onChange={(e) => onChange({ calidad: e.target.value })}>
      <NativeSelectOption value="principal">{tipo === "VIGIA" ? "Vigía" : "Principal"}</NativeSelectOption>
      <NativeSelectOption value="suplente">{tipo === "VIGIA" ? "Suplente del Vigía (buena práctica)" : "Suplente"}</NativeSelectOption>
    </NativeSelect>
  );
}
function SelectorCargo({ m, onChange }: { m: { cargoComite: string }; onChange: (v: string) => void }) {
  return (
    <NativeSelect className="w-full" value={m.cargoComite} onChange={(e) => onChange(e.target.value)}>
      <NativeSelectOption value="">Ninguno</NativeSelectOption>
      <NativeSelectOption value="presidente">Presidente</NativeSelectOption>
      <NativeSelectOption value="secretario">Secretario</NativeSelectOption>
    </NativeSelect>
  );
}
function SelectorRepresenta({ m, onChange }: { m: { representa: string }; onChange: (v: string) => void }) {
  return (
    <NativeSelect className="w-full" value={m.representa} onChange={(e) => onChange(e.target.value)}>
      <NativeSelectOption value="">Seleccione…</NativeSelectOption>
      <NativeSelectOption value="trabajadores">Trabajadores</NativeSelectOption>
      <NativeSelectOption value="empleador">Empleador</NativeSelectOption>
    </NativeSelect>
  );
}

function NuevoComite({ tipo, onCrear }: { tipo: string; onCrear: (fecha: string) => void }) {
  const [f, setF] = useState(hoyLocal());
  return (
    <div className="space-y-3">
      <div className="flex gap-2"><Input type="date" placeholder="AAAA-MM-DD" value={f} onChange={(e) => setF(e.target.value)} /><Button title="Registrar el comité con esta fecha de conformación" disabled={!f} onClick={() => onCrear(f)}><Plus /> Registrar</Button></div>
      <AvisoTareas className="text-left" tareas={tareasComite(tipo, f)} />
    </div>
  );
}

/** CCL adicional por centro de trabajo (Res. 3461/2025 art. 3). Su composición se calcula con los trabajadores de la sede. */
function NuevoCclSede({ sedes, trabajadoresEmpresa, onCrear }: { sedes: SedeOpcion[]; trabajadoresEmpresa: number; onCrear: (fecha: string, sede: string, trabajadores: number) => void }) {
  const [d, setD] = useState({ sede: sedes[0]?.nombre ?? "", fecha: hoyLocal(), n: String(sedes[0]?.trabajadores || "") });
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Comité de Convivencia de otro centro de trabajo</CardTitle>
        <CardDescription>La empresa tiene varias sedes: además del comité de nivel central, se conforma uno por cada centro de trabajo, con la composición que corresponda a sus trabajadores. <NormaRef>Res. 3461/2025 art. 3</NormaRef></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <Field><FieldLabel className="text-xs">Sede</FieldLabel><NativeSelect className="w-full" value={d.sede} onChange={(e) => { const s = sedes.find((x) => x.nombre === e.target.value); setD({ ...d, sede: e.target.value, n: String(s?.trabajadores || "") }); }}>{sedes.map((s) => <NativeSelectOption key={s.nombre} value={s.nombre}>{s.nombre}</NativeSelectOption>)}</NativeSelect></Field>
          <Field><FieldLabel className="text-xs">Fecha de conformación</FieldLabel><Input type="date" placeholder="AAAA-MM-DD" value={d.fecha} onChange={(e) => setD({ ...d, fecha: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Trabajadores de la sede</FieldLabel><Input type="number" min={1} placeholder={`Ej.: ${Math.max(1, Math.round(trabajadoresEmpresa / 2))}`} value={d.n} onChange={(e) => setD({ ...d, n: e.target.value })} /></Field>
          <Button className="w-fit" title="Registrar el comité de convivencia de esta sede" disabled={!d.sede || !d.fecha || !(Number(d.n) > 0)} onClick={() => onCrear(d.fecha, d.sede, Number(d.n))}><Plus /> Registrar comité de la sede</Button>
        </div>
        <AvisoTareas className="mt-3" tareas={tareasComite("CCL", d.fecha)} />
        <p className="mt-2 text-xs text-muted-foreground">El número de trabajadores se precarga con los registrados en cargos de la sede; corríjalo si no están todos registrados. Los documentos (ACT-04) se generan para el comité de nivel central.</p>
      </CardContent>
    </Card>
  );
}

type NuevoM = { nombre: string; tipoDoc: string; cedula: string; cargo: string; rol: string; calidad: string; cargoComite: string; representa: string };
function NuevoMiembro({ tipo, trabajadores = [], onAgregar }: { tipo: string; trabajadores?: TrabajadorOpcion[]; onAgregar: (m: NuevoM) => void }) {
  const paritario = tipo === "COPASST" || tipo === "CCL";
  const [m, setM] = useState<NuevoM>({ nombre: "", tipoDoc: "CC", cedula: "", cargo: "", rol: tipo === "BRIGADA" ? "brigadista" : tipo === "VIGIA" ? "vigia" : "principal", calidad: tipo === "BRIGADA" ? "" : "principal", cargoComite: "", representa: paritario ? "trabajadores" : "" });
  return (
    <div className="grid grid-cols-2 md:grid-cols-8 gap-2 w-full items-end">
      {trabajadores.length > 0 && (
        <Field className="col-span-2 md:col-span-8">
          <FieldLabel className="text-xs">Elegir de los trabajadores registrados</FieldLabel>
          <Buscador className="w-full md:w-96" placeholder="Buscar por nombre, documento o cargo…" textoBoton="Buscar trabajador" ancho="w-[32rem]"
            opciones={trabajadores.map((t) => ({ valor: t.documento || t.nombre, etiqueta: t.nombre, detalle: [t.documento, t.cargo].filter(Boolean).join(" · ") }))}
            onSelect={(v) => { const t = trabajadores.find((x) => (x.documento || x.nombre) === v); if (t) setM({ ...m, nombre: t.nombre, tipoDoc: t.tipoDoc || "CC", cedula: t.documento, cargo: t.cargo }); }} />
        </Field>
      )}
      <Field className="md:col-span-2"><FieldLabel className="text-xs">Nombre</FieldLabel><Input value={m.nombre} placeholder="Nombres y apellidos" onChange={(e) => setM({ ...m, nombre: e.target.value })} /></Field>
      <Field className="col-span-2 md:col-span-2"><FieldLabel className="text-xs gap-1">Documento <Ayuda k="documentoIdentidad" /></FieldLabel><CampoDocumento tipo={m.tipoDoc} numero={m.cedula} onTipo={(v) => setM({ ...m, tipoDoc: v })} onNumero={(v) => setM({ ...m, cedula: v })} /></Field>
      <Field><FieldLabel className="text-xs">Cargo en la empresa</FieldLabel><Input value={m.cargo} placeholder="Ej.: Auxiliar de bodega" onChange={(e) => setM({ ...m, cargo: e.target.value })} /></Field>
      <Field><FieldLabel className="text-xs gap-1">{tipo === "BRIGADA" ? "Rol" : "Calidad"} <Ayuda k="rolComite" /></FieldLabel><SelectorCalidad tipo={tipo} m={m} onChange={(v) => setM({ ...m, ...v })} /></Field>
      {paritario ? (
        <>
          <Field><FieldLabel className="text-xs">Cargo en el comité</FieldLabel><SelectorCargo m={m} onChange={(v) => setM({ ...m, cargoComite: v })} /></Field>
          <Field><FieldLabel className="text-xs gap-1">Representa <Ayuda k="representa" /></FieldLabel><SelectorRepresenta m={m} onChange={(v) => setM({ ...m, representa: v })} /></Field>
        </>
      ) : <div className="md:col-span-2" />}
      <Button className="md:col-span-8 w-fit" size="sm" title="Agregar esta persona al comité" disabled={!m.nombre || (paritario && !m.representa)} onClick={() => { onAgregar(m); setM({ ...m, nombre: "", cedula: "", cargo: "", cargoComite: "" }); }}><Plus /> Agregar integrante</Button>
    </div>
  );
}

type Eleccion = { fechaConvocatoria?: string; inscripcionDesde?: string; inscripcionHasta?: string; fechaVotacion?: string; lugar?: string; horario?: string; resultados?: { candidato: string; votos: string }[]; blanco?: string; nulos?: string; votantes?: string; jurados?: string };
const CAMPOS_ELECCION: (keyof Eleccion)[] = ["fechaConvocatoria", "inscripcionDesde", "inscripcionHasta", "fechaVotacion", "lugar", "horario", "resultados", "blanco", "nulos", "votantes", "jurados"];

/** Convocatoria y votación de los representantes de los trabajadores: COPASST (Res. 2013/1986 art. 5) y CCL (Res. 3461/2025 art. 3, votación secreta con escrutinio público). Se usan en ACT-01 y ACT-04. */
function DatosEleccion({ tipo, inicial, onGuardar }: { tipo: string; inicial: Record<string, unknown>; onGuardar: (d: Eleccion) => void }) {
  const [d, setD] = useState<Eleccion>(() => ({ resultados: [], ...Object.fromEntries(CAMPOS_ELECCION.filter((k) => k in inicial).map((k) => [k, inicial[k]])) }));
  const res = d.resultados ?? [];
  const ccl = tipo === "CCL";
  return (
    <Collapsible>
      <CollapsibleTrigger render={<Button variant="outline" size="sm" className="w-fit" title="Registrar convocatoria, votación y resultados" />}>Datos de la elección (convocatoria y votación{ccl ? " secreta" : ""})</CollapsibleTrigger>
      <CollapsibleContent className="pt-3 space-y-3">
        <p className="text-xs text-muted-foreground">{ccl ? "Los trabajadores eligen a sus representantes por votación secreta con escrutinio público; el empleador designa directamente a los suyos. " : "Los trabajadores eligen a sus representantes por votación libre; el empleador designa directamente a los suyos. "}<NormaRef>{ccl ? "Res. 3461/2025 art. 3" : "Res. 2013/1986 art. 5"}</NormaRef></p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Field><FieldLabel className="text-xs">Fecha de la convocatoria</FieldLabel><Input type="date" placeholder="AAAA-MM-DD" value={d.fechaConvocatoria ?? ""} onChange={(e) => setD({ ...d, fechaConvocatoria: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Inscripción desde</FieldLabel><Input type="date" placeholder="AAAA-MM-DD" value={d.inscripcionDesde ?? ""} onChange={(e) => setD({ ...d, inscripcionDesde: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Inscripción hasta</FieldLabel><Input type="date" placeholder="AAAA-MM-DD" value={d.inscripcionHasta ?? ""} onChange={(e) => setD({ ...d, inscripcionHasta: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Fecha de votación</FieldLabel><Input type="date" placeholder="AAAA-MM-DD" value={d.fechaVotacion ?? ""} onChange={(e) => setD({ ...d, fechaVotacion: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Lugar</FieldLabel><Input value={d.lugar ?? ""} onChange={(e) => setD({ ...d, lugar: e.target.value })} placeholder="Sala de juntas" /></Field>
          <Field><FieldLabel className="text-xs">Horario</FieldLabel><Input value={d.horario ?? ""} onChange={(e) => setD({ ...d, horario: e.target.value })} placeholder="8:00 a 12:00" /></Field>
        </div>
        {!!d.fechaConvocatoria && !!d.fechaVotacion && d.fechaVotacion < d.fechaConvocatoria && <p className="text-xs text-destructive">La votación no puede ser anterior a la convocatoria.</p>}
        <Field>
          <FieldLabel className="text-xs">Resultados por candidato{ccl ? " (escrutinio público)" : ""}</FieldLabel>
          {res.map((r, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="Candidato" value={r.candidato} onChange={(e) => setD({ ...d, resultados: res.map((x, j) => (j === i ? { ...x, candidato: e.target.value } : x)) })} />
              <Input className="w-28" type="number" placeholder="Votos" value={r.votos} onChange={(e) => setD({ ...d, resultados: res.map((x, j) => (j === i ? { ...x, votos: e.target.value } : x)) })} />
              <Tip texto="Quitar este candidato"><Button variant="ghost" size="icon" aria-label="Quitar" onClick={() => setD({ ...d, resultados: res.filter((_, j) => j !== i) })}><Trash2 /></Button></Tip>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-fit" title="Agregar un candidato a los resultados" onClick={() => setD({ ...d, resultados: [...res, { candidato: "", votos: "" }] })}><Plus /> Agregar candidato</Button>
        </Field>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Field><FieldLabel className="text-xs">Votos en blanco</FieldLabel><Input type="number" placeholder="Ej.: 2" value={d.blanco ?? ""} onChange={(e) => setD({ ...d, blanco: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Votos nulos</FieldLabel><Input type="number" placeholder="Ej.: 1" value={d.nulos ?? ""} onChange={(e) => setD({ ...d, nulos: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Total de votantes</FieldLabel><Input type="number" placeholder="Ej.: 25" value={d.votantes ?? ""} onChange={(e) => setD({ ...d, votantes: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Jurados de votación</FieldLabel><Input value={d.jurados ?? ""} onChange={(e) => setD({ ...d, jurados: e.target.value })} placeholder="Nombres" /></Field>
        </div>
        <Button size="sm" className="w-fit" title="Guardar los datos de la elección; los documentos se actualizan" onClick={() => onGuardar(d)}>Guardar datos de la elección</Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
