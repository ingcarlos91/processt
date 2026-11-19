"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Users, FileText } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { NormaRef } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import { Porque } from "@/components/app/porque";
import { Ayuda } from "@/components/app/ayuda";
import * as A from "@/app/actions/sgsst";

type Miembro = { id: string; nombre: string; cedula: string; cargo: string; rol: string; representa: string };
type Comite = { id: string; tipo: string; inicio: string; fin: string; normaRef: string; miembros: Miembro[] };

const INFO: Record<string, { nombre: string; doc: string; desc: string }> = {
  COPASST: { nombre: "Comité Paritario de SST (COPASST)", doc: "ACT-01", desc: "Paritario, periodo de 2 años, reunión mensual, 4 horas semanales para sus funciones." },
  VIGIA: { nombre: "Vigía de SST", doc: "ACT-01", desc: "Para empresas de menos de 10 trabajadores; periodo de 2 años." },
  CCL: { nombre: "Comité de Convivencia Laboral", doc: "ACT-04", desc: "Reunión mensual; procedimiento preventivo de máximo 65 días; uno por centro de trabajo." },
  BRIGADA: { nombre: "Brigada de emergencias", doc: "ACT-05", desc: "Conformada, capacitada y dotada; incluye primeros auxilios." },
};
const ROLES = [["presidente", "Presidente"], ["secretario", "Secretario"], ["principal", "Principal"], ["suplente", "Suplente"], ["vigia", "Vigía"], ["jefe_brigada", "Jefe de brigada"], ["brigadista", "Brigadista"]];

export function ComitesEditor({ empresaId, requeridos, comites, composicion, refs, porques }: { empresaId: string; requeridos: string[]; comites: Comite[]; composicion: string; refs: Record<string, string>; porques: Record<string, string> }) {
  const [pend, start] = useTransition();
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { await fn(); if (ok) toast.success(ok); });
  const hoy = new Date().toISOString().slice(0, 10);
  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
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
                <Empty className="p-6">
                  <EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>No registrado</EmptyTitle><EmptyDescription>Registre la fecha de conformación para controlar el periodo.</EmptyDescription></EmptyHeader>
                  <EmptyContent><NuevoComite onCrear={(f) => run(() => A.crearComite(empresaId, tipo, f), "Comité registrado")} /></EmptyContent>
                </Empty>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">Desde {c.inicio}</Badge>
                    {c.fin && <Badge variant={vence !== null && vence < 60 ? "destructive" : "outline"}>Hasta {c.fin}{vence !== null && vence < 60 ? ` · vence en ${vence} días` : ""}</Badge>}
                    <div className="flex-1" />
                    <Confirmar trigger={<Button size="xs" variant="ghost" />} titulo={`Eliminar ${info.nombre}`} destructivo accion="Eliminar" onConfirm={() => run(() => A.eliminarComite(empresaId, c.id))}><Trash2 /> Eliminar</Confirmar>
                  </div>
                  <Table>
                    <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Cargo</TableHead><TableHead>Rol</TableHead><TableHead>Representa</TableHead><TableHead /></TableRow></TableHeader>
                    <TableBody>
                      {c.miembros.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell>{m.nombre}<div className="text-xs text-muted-foreground">{m.cedula}</div></TableCell>
                          <TableCell>{m.cargo}</TableCell>
                          <TableCell>{ROLES.find((r) => r[0] === m.rol)?.[1] ?? m.rol}</TableCell>
                          <TableCell>{m.representa}</TableCell>
                          <TableCell><Button size="icon-xs" variant="ghost" aria-label="Quitar" onClick={() => run(() => A.eliminarMiembro(empresaId, m.id))}><Trash2 /></Button></TableCell>
                        </TableRow>
                      ))}
                      {!c.miembros.length && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Sin integrantes</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
            {c && <CardFooter className="border-t"><NuevoMiembro tipo={tipo} onAgregar={(m) => run(() => A.agregarMiembro(empresaId, c.id, m), "Integrante agregado")} /></CardFooter>}
          </Card>
        );
      })}
    </div>
  );
}

function NuevoComite({ onCrear }: { onCrear: (fecha: string) => void }) {
  const [f, setF] = useState(new Date().toISOString().slice(0, 10));
  return <div className="flex gap-2"><Input type="date" value={f} onChange={(e) => setF(e.target.value)} /><Button onClick={() => onCrear(f)}><Plus /> Registrar</Button></div>;
}

function NuevoMiembro({ tipo, onAgregar }: { tipo: string; onAgregar: (m: { nombre: string; cedula?: string; cargo?: string; rol: string; representa?: string }) => void }) {
  const [m, setM] = useState({ nombre: "", cedula: "", cargo: "", rol: tipo === "BRIGADA" ? "brigadista" : tipo === "VIGIA" ? "vigia" : "principal", representa: tipo === "BRIGADA" ? "" : "trabajadores" });
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 w-full items-end">
      <Field className="md:col-span-2"><FieldLabel className="text-xs">Nombre</FieldLabel><Input value={m.nombre} onChange={(e) => setM({ ...m, nombre: e.target.value })} /></Field>
      <Field><FieldLabel className="text-xs">Cédula</FieldLabel><Input value={m.cedula} onChange={(e) => setM({ ...m, cedula: e.target.value })} /></Field>
      <Field><FieldLabel className="text-xs">Cargo</FieldLabel><Input value={m.cargo} onChange={(e) => setM({ ...m, cargo: e.target.value })} /></Field>
      <Field><FieldLabel className="text-xs gap-1">Rol <Ayuda k="rolComite" /></FieldLabel><NativeSelect className="w-full" value={m.rol} onChange={(e) => setM({ ...m, rol: e.target.value })}>{ROLES.map(([v, l]) => <NativeSelectOption key={v} value={v}>{l}</NativeSelectOption>)}</NativeSelect></Field>
      {tipo !== "BRIGADA" ? (
        <Field><FieldLabel className="text-xs gap-1">Representa <Ayuda k="representa" /></FieldLabel><NativeSelect className="w-full" value={m.representa} onChange={(e) => setM({ ...m, representa: e.target.value })}><NativeSelectOption value="trabajadores">Trabajadores</NativeSelectOption><NativeSelectOption value="empleador">Empleador</NativeSelectOption></NativeSelect></Field>
      ) : <div />}
      <Button className="md:col-span-6 w-fit" size="sm" disabled={!m.nombre} onClick={() => { onAgregar(m); setM({ ...m, nombre: "", cedula: "", cargo: "" }); }}><Plus /> Agregar integrante</Button>
    </div>
  );
}
