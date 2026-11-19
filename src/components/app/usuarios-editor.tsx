"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Section } from "@/components/app/ui";
import { Pedir } from "@/components/app/confirmar";
import * as A from "@/app/actions/usuarios";

type U = { id: string; nombre: string; email: string; rol: string; activo: boolean; ultimoAcceso: string | null };
const ROLES: Record<string, string> = { admin: "Administrador", consultor: "Consultor" };

export function UsuariosEditor({ usuarios, yoId }: { usuarios: U[]; yoId: string }) {
  const [pend, start] = useTransition();
  const [n, setN] = useState({ nombre: "", email: "", password: "", rol: "consultor" });
  const run = (fn: () => Promise<{ error?: string } | { ok: boolean }>, ok: string) => start(async () => { const r = await fn(); if ("error" in r && r.error) toast.error(r.error); else toast.success(ok); });
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      <Section contentClassName="px-0">
        <Table>
          <TableHeader><TableRow><TableHead className="pl-6">Nombre</TableHead><TableHead>Correo</TableHead><TableHead>Rol</TableHead><TableHead>Último acceso</TableHead><TableHead>Activo</TableHead><TableHead className="pr-6" /></TableRow></TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="pl-6 font-medium">{u.nombre}{u.id === yoId && <Badge variant="secondary" className="ml-2">usted</Badge>}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant="outline">{ROLES[u.rol] ?? u.rol}</Badge></TableCell>
                <TableCell className="text-xs text-muted-foreground">{u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString("es-CO") : "Nunca"}</TableCell>
                <TableCell><Switch checked={u.activo} disabled={u.id === yoId} onCheckedChange={(v) => run(() => A.cambiarEstadoUsuario(u.id, v), v ? "Usuario activado" : "Usuario desactivado")} aria-label="Activo" /></TableCell>
                <TableCell className="pr-6 text-right">
                  <Pedir trigger={<Button size="sm" variant="outline" />} titulo={`Nueva contraseña para ${u.nombre}`} descripcion="Mínimo 8 caracteres, con letras y números. Entréguela a la persona por un medio seguro." label="Nueva contraseña" onConfirm={(p) => run(() => A.restablecerPassword(u.id, p), "Contraseña restablecida")}><KeyRound /> Restablecer contraseña</Pedir>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
      <Card>
        <CardHeader><CardTitle>Nuevo usuario</CardTitle><CardDescription>La persona podrá cambiar su contraseña después de entrar.</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <Field><FieldLabel htmlFor="nu-n">Nombre</FieldLabel><Input id="nu-n" value={n.nombre} onChange={(e) => setN({ ...n, nombre: e.target.value })} /></Field>
          <Field><FieldLabel htmlFor="nu-e">Correo</FieldLabel><Input id="nu-e" type="email" value={n.email} onChange={(e) => setN({ ...n, email: e.target.value })} /></Field>
          <Field><FieldLabel htmlFor="nu-p">Contraseña inicial</FieldLabel><Input id="nu-p" type="password" autoComplete="new-password" value={n.password} onChange={(e) => setN({ ...n, password: e.target.value })} /><FieldDescription>Mínimo 8 caracteres, con letras y números.</FieldDescription></Field>
          <Field><FieldLabel htmlFor="nu-r">Rol</FieldLabel><NativeSelect id="nu-r" className="w-full" value={n.rol} onChange={(e) => setN({ ...n, rol: e.target.value })}>{Object.entries(ROLES).map(([k, v]) => <NativeSelectOption key={k} value={k}>{v}</NativeSelectOption>)}</NativeSelect></Field>
        </CardContent>
        <CardFooter><Button disabled={pend || !n.nombre || !n.email || !n.password} onClick={() => run(async () => { const r = await A.crearUsuario(n); if ("ok" in r) setN({ nombre: "", email: "", password: "", rol: "consultor" }); return r; }, "Usuario creado")}><Plus /> Crear usuario</Button></CardFooter>
      </Card>
    </div>
  );
}
