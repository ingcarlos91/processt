"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { cambiarMiPassword } from "@/app/actions/usuarios";

export function CambiarPassword() {
  const [d, setD] = useState({ actual: "", nueva: "", repetir: "" });
  const [pend, start] = useTransition();
  return (
    <Card className="max-w-md">
      <CardHeader><CardTitle className="flex items-center gap-2"><KeyRound className="size-4" /> Cambiar mi contraseña</CardTitle><CardDescription>Mínimo 8 caracteres, con letras y números.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <Field><FieldLabel htmlFor="pa">Contraseña actual</FieldLabel><Input id="pa" type="password" autoComplete="current-password" value={d.actual} onChange={(e) => setD({ ...d, actual: e.target.value })} /></Field>
        <Field><FieldLabel htmlFor="pn">Nueva contraseña</FieldLabel><Input id="pn" type="password" autoComplete="new-password" value={d.nueva} onChange={(e) => setD({ ...d, nueva: e.target.value })} /></Field>
        <Field><FieldLabel htmlFor="pr">Repetir nueva contraseña</FieldLabel><Input id="pr" type="password" autoComplete="new-password" value={d.repetir} onChange={(e) => setD({ ...d, repetir: e.target.value })} aria-invalid={!!d.repetir && d.repetir !== d.nueva} />{d.repetir && d.repetir !== d.nueva && <FieldDescription className="text-destructive">No coincide.</FieldDescription>}</Field>
      </CardContent>
      <CardFooter><Button disabled={pend || !d.actual || !d.nueva || d.nueva !== d.repetir} onClick={() => start(async () => { const r = await cambiarMiPassword(d.actual, d.nueva); if ("error" in r) toast.error(r.error); else { toast.success("Contraseña actualizada"); setD({ actual: "", nueva: "", repetir: "" }); } })}>Guardar</Button></CardFooter>
    </Card>
  );
}
