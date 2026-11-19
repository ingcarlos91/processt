"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { actualizarMiPerfil } from "@/app/actions/usuarios";

export function MiPerfil({ inicial, rol }: { inicial: { nombre: string; email: string }; rol: string }) {
  const [d, setD] = useState(inicial);
  const [pend, start] = useTransition();
  const cambio = d.nombre !== inicial.nombre || d.email !== inicial.email;
  return (
    <Card className="max-w-md">
      <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="size-4" /> Mis datos</CardTitle><CardDescription>Rol: <Badge variant="outline">{rol === "admin" ? "Administrador" : "Consultor"}</Badge></CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <Field><FieldLabel htmlFor="mn">Nombre</FieldLabel><Input id="mn" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} /></Field>
        <Field><FieldLabel htmlFor="me">Correo</FieldLabel><Input id="me" type="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} /><FieldDescription>Es el usuario con el que inicia sesión.</FieldDescription></Field>
      </CardContent>
      <CardFooter><Button disabled={pend || !cambio} onClick={() => start(async () => { const r = await actualizarMiPerfil(d); if ("error" in r) toast.error(r.error); else toast.success("Datos actualizados"); })}>Guardar</Button></CardFooter>
    </Card>
  );
}
