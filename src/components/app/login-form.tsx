"use client";
import { useActionState } from "react";
import { LogIn, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Isotipo } from "@/components/app/isotipo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { iniciarSesion, type EstadoLogin } from "@/app/actions/auth";

export function LoginForm({ desde }: { desde: string }) {
  const [estado, accion, pend] = useActionState<EstadoLogin, FormData>(iniciarSesion, undefined);
  return (
    <Card className="w-full shadow-sm [--card-spacing:--spacing(6)]">
      <CardHeader className="gap-1.5">
        <CardTitle className="text-xl font-semibold tracking-tight">Ingresar</CardTitle>
        <CardDescription>Escriba su correo y contraseña para entrar a PROCESST.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={accion} className="flex flex-col gap-6">
          <FieldGroup className="gap-5">
            {estado?.error && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
                <AlertCircle />
                <AlertTitle>No fue posible ingresar</AlertTitle>
                <AlertDescription className="break-words">{estado.error}</AlertDescription>
              </Alert>
            )}
            <input type="hidden" name="desde" value={desde} />
            <Field>
              <FieldLabel htmlFor="email">Correo</FieldLabel>
              <Input id="email" placeholder="nombre@empresa.com" name="email" type="email" autoComplete="username" inputMode="email" required defaultValue={estado?.email} aria-invalid={!!estado?.error || undefined} />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <Input id="password" placeholder="Su contraseña" name="password" type="password" autoComplete="current-password" required aria-invalid={!!estado?.error || undefined} />
            </Field>
            <Field>
              <Button type="submit" size="lg" disabled={pend} className="w-full" aria-busy={pend}>
                {pend ? <Isotipo girando blanco className="size-4" /> : <LogIn />} {pend ? "Verificando…" : "Ingresar"}
              </Button>
              <FieldDescription className="text-center text-xs">¿Olvidó la contraseña? El administrador puede restablecerla.</FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
