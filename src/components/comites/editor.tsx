"use client";
import { hoyLocal } from "@/lib/utils";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, FileText, Pencil, X } from "lucide-react";
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
import { SubirArchivo, ListaArchivos, type ArchivoUI } from "@/components/app/adjuntos";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import * as A from "@/app/actions/sgsst";
import { Buscador } from "@/components/app/buscador";

type Miembro = { id: string; nombre: string; tipoDoc: string; cedula: string; cargo: string; rol: string; representa: string };
type Comite = { id: string; tipo: string; inicio: string; fin: string; normaRef: string; datos: Record<string, unknown>; actas: ArchivoUI[]; miembros: Miembro[] };

const INFO: Record<string, { nombre: string; doc: string; desc: string }> = {
  COPASST: { nombre: "Comité Paritario de SST (COPASST)", doc: "ACT-01", desc: "Paritario, periodo de 2 años, reunión mensual, 4 horas semanales para sus funciones." },
  VIGIA: { nombre: "Vigía de SST", doc: "ACT-01", desc: "Para empresas de menos de 10 trabajadores; periodo de 2 años." },
  CCL: { nombre: "Comité de Convivencia Laboral", doc: "ACT-04", desc: "Reunión mensual; procedimiento preventivo de máximo 65 días; uno por centro de trabajo." },
  BRIGADA: { nombre: "Brigada de emergencias", doc: "ACT-05", desc: "Conformada, capacitada y dotada; incluye primeros auxilios." },
};
const ROLES = [["presidente", "Presidente"], ["secretario", "Secretario"], ["principal", "Principal"], ["suplente", "Suplente"], ["vigia", "Vigía"], ["jefe_brigada", "Jefe de brigada"], ["brigadista", "Brigadista"]];

type TrabajadorOpcion = { nombre: string; tipoDoc: string; documento: string; cargo: string };

export function ComitesEditor({ empresaId, requeridos, comites, composicion, refs, porques, trabajadores = [] }: { empresaId: string; requeridos: string[]; comites: Comite[]; composicion: string; trabajadores?: TrabajadorOpcion[]; refs: Record<string, string>; porques: Record<string, string> }) {
  const [, start] = useTransition();
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { await fn(); if (ok) toast.success(ok); });
  const [editando, setEditando] = useState<{ id: string; nombre: string; tipoDoc: string; cedula: string; cargo: string } | null>(null);
  const hoy = hoyLocal();
  return (
    <div className="grid gap-6">
      {requeridos.map((tipo) => {
        const c = comites.find((x) => x.tipo === tipo);
        const info = INFO[tipo];
        const vence = c?.fin ? Math.round((new Date(c.fin).getTime() - new Date(hoy).getTime()) / 864e5) : null;
        return (
          <Card key={tipo}>
            <CardHeader>
              <CardTitle className="flex items-center gap-1">{info.nombre}<Porque titulo={`¿Por qué ${info.nombre}?`} normas={[refs[tipo === "VIGIA" ? "COPASST" : tipo] ?? c?.normaRef]}>{porques[tipo === "VIGIA" ? "COPASST" : tipo] ?? info.desc}</Porque></CardTitle>
              <CardDescription>{info.desc} {tipo === "COPASST" && `Composición: ${composicion}.`}</CardDescription>
              <CardAction className="flex flex-col items-end gap-1"><NormaRef>{refs[tipo === "VIGIA" ? "COPASST" : tipo] ?? c?.normaRef}</NormaRef><Link href={`/empresas/${empresaId}/documentos/${info.doc}`} className={buttonVariants({ size: "xs", variant: "ghost" })}><FileText /> {info.doc}</Link></CardAction>
            </CardHeader>
            <CardContent>
              {!c ? (
                <EstadoVacio ilustracion="comites" compacto titulo={<>No registrado</>} descripcion={<>Registre la fecha de conformación para controlar el periodo.</>}><NuevoComite onCrear={(f) => run(() => A.crearComite(empresaId, tipo, f), "Comité registrado")} /></EstadoVacio>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">Desde {c.inicio}</Badge>
                    {c.fin && <Badge variant={vence !== null && vence < 60 ? "destructive" : "outline"}>Hasta {c.fin}{vence !== null && vence < 60 ? ` · vence en ${vence} días` : ""}</Badge>}
                    <div className="flex-1" />
                    <Confirmar trigger={<Button size="xs" variant="ghost" />} titulo={`Eliminar ${info.nombre}`} destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarComite(empresaId, c.id))}><Trash2 /> Eliminar</Confirmar>
                  </div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Cargo</TableHead><TableHead>Rol</TableHead>{tipo !== "BRIGADA" && <TableHead>Representa</TableHead>}<TableHead className="w-20" /></TableRow></TableHeader>
                    <TableBody>
                      {c.miembros.map((m) => (
                        <TableRow key={m.id}>
                          {editando?.id === m.id ? (
                            <>
                              <TableCell className="space-y-1.5"><Input value={editando.nombre} placeholder="Nombres y apellidos" onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} /><CampoDocumento tipo={editando.tipoDoc} numero={editando.cedula} onTipo={(v) => setEditando({ ...editando, tipoDoc: v })} onNumero={(v) => setEditando({ ...editando, cedula: v })} /></TableCell>
                              <TableCell><Input value={editando.cargo} placeholder="Ej.: Auxiliar de bodega" onChange={(e) => setEditando({ ...editando, cargo: e.target.value })} /></TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell>{m.nombre}<div className={m.cedula ? "text-xs text-muted-foreground" : "text-xs text-amber-700"}>{m.cedula ? `${abrevDoc(m.tipoDoc)} ${m.cedula}` : "Sin documento"}</div></TableCell>
                              <TableCell>{m.cargo}</TableCell>
                            </>
                          )}
                          <TableCell>{ROLES.find((r) => r[0] === m.rol)?.[1] ?? m.rol}</TableCell>
                          {tipo !== "BRIGADA" && <TableCell>{m.representa === "empleador" ? "Empleador" : m.representa === "trabajadores" ? "Trabajadores" : "—"}</TableCell>}
                          <TableCell>
                            <div className="flex justify-end gap-0.5">
                              {editando?.id === m.id
                                ? <><Button size="xs" onClick={() => { run(() => A.actualizarMiembro(empresaId, m.id, editando), "Integrante actualizado"); setEditando(null); }}>Guardar</Button><Button size="icon-xs" variant="ghost" aria-label="Cancelar" onClick={() => setEditando(null)}><X /></Button></>
                                : <Button size="icon-xs" variant="ghost" aria-label="Editar integrante" onClick={() => setEditando({ id: m.id, nombre: m.nombre, tipoDoc: m.tipoDoc, cedula: m.cedula, cargo: m.cargo })}><Pencil /></Button>}
                              <Button size="icon-xs" variant="ghost" aria-label="Quitar" onClick={() => run(() => A.eliminarMiembro(empresaId, m.id))}><Trash2 /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!c.miembros.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sin integrantes</TableCell></TableRow>}
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
            {c && <CardFooter className="border-t flex-col items-stretch gap-4"><NuevoMiembro tipo={tipo} trabajadores={trabajadores} onAgregar={(m) => run(() => A.agregarMiembro(empresaId, c.id, m), "Integrante agregado")} />{tipo === "COPASST" && <DatosEleccion inicial={c.datos} onGuardar={(d) => run(() => A.guardarDatosComite(empresaId, c.id, d), "Datos de la elección guardados")} />}</CardFooter>}
          </Card>
        );
      })}
    </div>
  );
}

function NuevoComite({ onCrear }: { onCrear: (fecha: string) => void }) {
  const [f, setF] = useState(hoyLocal());
  return <div className="flex gap-2"><Input type="date" value={f} onChange={(e) => setF(e.target.value)} /><Button onClick={() => onCrear(f)}><Plus /> Registrar</Button></div>;
}

function NuevoMiembro({ tipo, trabajadores = [], onAgregar }: { tipo: string; trabajadores?: TrabajadorOpcion[]; onAgregar: (m: { nombre: string; tipoDoc?: string; cedula?: string; cargo?: string; rol: string; representa?: string }) => void }) {
  const [m, setM] = useState({ nombre: "", tipoDoc: "CC", cedula: "", cargo: "", rol: tipo === "BRIGADA" ? "brigadista" : tipo === "VIGIA" ? "vigia" : "principal", representa: tipo === "BRIGADA" ? "" : "trabajadores" });
  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-2 w-full items-end">
      {trabajadores.length > 0 && (
        <Field className="col-span-2 md:col-span-7">
          <FieldLabel className="text-xs">Elegir de los trabajadores registrados</FieldLabel>
          <Buscador className="w-full md:w-96" placeholder="Buscar por nombre, documento o cargo…" textoBoton="Buscar trabajador" ancho="w-[32rem]"
            opciones={trabajadores.map((t) => ({ valor: t.documento || t.nombre, etiqueta: t.nombre, detalle: [t.documento, t.cargo].filter(Boolean).join(" · ") }))}
            onSelect={(v) => { const t = trabajadores.find((x) => (x.documento || x.nombre) === v); if (t) setM({ ...m, nombre: t.nombre, tipoDoc: t.tipoDoc || "CC", cedula: t.documento, cargo: t.cargo }); }} />
        </Field>
      )}
      <Field className="md:col-span-2"><FieldLabel className="text-xs">Nombre</FieldLabel><Input value={m.nombre} placeholder="Nombres y apellidos" onChange={(e) => setM({ ...m, nombre: e.target.value })} /></Field>
      <Field className="col-span-2 md:col-span-2"><FieldLabel className="text-xs gap-1">Documento <Ayuda k="documentoIdentidad" /></FieldLabel><CampoDocumento tipo={m.tipoDoc} numero={m.cedula} onTipo={(v) => setM({ ...m, tipoDoc: v })} onNumero={(v) => setM({ ...m, cedula: v })} /></Field>
      <Field><FieldLabel className="text-xs">Cargo</FieldLabel><Input value={m.cargo} placeholder="Ej.: Auxiliar de bodega" onChange={(e) => setM({ ...m, cargo: e.target.value })} /></Field>
      <Field><FieldLabel className="text-xs gap-1">Rol <Ayuda k="rolComite" /></FieldLabel><NativeSelect className="w-full" value={m.rol} onChange={(e) => setM({ ...m, rol: e.target.value })}>{ROLES.map(([v, l]) => <NativeSelectOption key={v} value={v}>{l}</NativeSelectOption>)}</NativeSelect></Field>
      {tipo !== "BRIGADA" ? (
        <Field><FieldLabel className="text-xs gap-1">Representa <Ayuda k="representa" /></FieldLabel><NativeSelect className="w-full" value={m.representa} onChange={(e) => setM({ ...m, representa: e.target.value })}><NativeSelectOption value="trabajadores">Trabajadores</NativeSelectOption><NativeSelectOption value="empleador">Empleador</NativeSelectOption></NativeSelect></Field>
      ) : <div />}
      <Button className="md:col-span-7 w-fit" size="sm" disabled={!m.nombre} onClick={() => { onAgregar(m); setM({ ...m, nombre: "", cedula: "", cargo: "" }); }}><Plus /> Agregar integrante</Button>
    </div>
  );
}

type Eleccion = { inscripcionDesde?: string; inscripcionHasta?: string; fechaVotacion?: string; lugar?: string; horario?: string; resultados?: { candidato: string; votos: string }[]; blanco?: string; nulos?: string; votantes?: string; jurados?: string };

/** Datos de la convocatoria y votación del COPASST (Res. 2013/1986). Se usan en el ACT-01. */
function DatosEleccion({ inicial, onGuardar }: { inicial: Record<string, unknown>; onGuardar: (d: Eleccion) => void }) {
  const [d, setD] = useState<Eleccion>({ resultados: [], ...(inicial as Eleccion) });
  const res = d.resultados ?? [];
  return (
    <Collapsible>
      <CollapsibleTrigger render={<Button variant="outline" size="sm" className="w-fit" />}>Datos de la elección (convocatoria y votación)</CollapsibleTrigger>
      <CollapsibleContent className="pt-3 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Field><FieldLabel className="text-xs">Inscripción desde</FieldLabel><Input type="date" value={d.inscripcionDesde ?? ""} onChange={(e) => setD({ ...d, inscripcionDesde: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Inscripción hasta</FieldLabel><Input type="date" value={d.inscripcionHasta ?? ""} onChange={(e) => setD({ ...d, inscripcionHasta: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Fecha de votación</FieldLabel><Input type="date" value={d.fechaVotacion ?? ""} onChange={(e) => setD({ ...d, fechaVotacion: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Lugar</FieldLabel><Input value={d.lugar ?? ""} onChange={(e) => setD({ ...d, lugar: e.target.value })} placeholder="Sala de juntas" /></Field>
          <Field><FieldLabel className="text-xs">Horario</FieldLabel><Input value={d.horario ?? ""} onChange={(e) => setD({ ...d, horario: e.target.value })} placeholder="8:00 a 12:00" /></Field>
        </div>
        <Field>
          <FieldLabel className="text-xs">Resultados por candidato</FieldLabel>
          {res.map((r, i) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="Candidato" value={r.candidato} onChange={(e) => setD({ ...d, resultados: res.map((x, j) => (j === i ? { ...x, candidato: e.target.value } : x)) })} />
              <Input className="w-28" type="number" placeholder="Votos" value={r.votos} onChange={(e) => setD({ ...d, resultados: res.map((x, j) => (j === i ? { ...x, votos: e.target.value } : x)) })} />
              <Button variant="ghost" size="icon" aria-label="Quitar" onClick={() => setD({ ...d, resultados: res.filter((_, j) => j !== i) })}><Trash2 /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-fit" onClick={() => setD({ ...d, resultados: [...res, { candidato: "", votos: "" }] })}><Plus /> Agregar candidato</Button>
        </Field>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Field><FieldLabel className="text-xs">Votos en blanco</FieldLabel><Input type="number" placeholder="Ej.: 2" value={d.blanco ?? ""} onChange={(e) => setD({ ...d, blanco: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Votos nulos</FieldLabel><Input type="number" placeholder="Ej.: 1" value={d.nulos ?? ""} onChange={(e) => setD({ ...d, nulos: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Total de votantes</FieldLabel><Input type="number" placeholder="Ej.: 25" value={d.votantes ?? ""} onChange={(e) => setD({ ...d, votantes: e.target.value })} /></Field>
          <Field><FieldLabel className="text-xs">Jurados de votación</FieldLabel><Input value={d.jurados ?? ""} onChange={(e) => setD({ ...d, jurados: e.target.value })} placeholder="Nombres" /></Field>
        </div>
        <Button size="sm" className="w-fit" onClick={() => onGuardar(d)}>Guardar datos de la elección</Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
