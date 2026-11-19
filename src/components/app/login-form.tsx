"use client";
import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { iniciarSesion, type EstadoLogin } from "@/app/actions/auth";

export function LoginForm({ desde }: { desde: string }) {
  const [estado, accion, pend] = useActionState<EstadoLogin, FormData>(iniciarSesion, undefined);
  return (
    <form action={accion} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold">Ingresar</h1>
          <p className="text-muted-foreground text-sm">Escriba su correo y contraseña para entrar a PROCESST.</p>
        </div>
        {estado?.error && <Alert variant="destructive"><AlertDescription>{estado.error}</AlertDescription></Alert>}
        <input type="hidden" name="desde" value={desde} />
        <Field>
          <FieldLabel htmlFor="email">Correo</FieldLabel>
          <Input id="email" placeholder="nombre@empresa.com" name="email" type="email" autoComplete="username" required defaultValue={estado?.email} />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input id="password" placeholder="Su contraseña" name="password" type="password" autoComplete="current-password" required />
          <FieldDescription>¿Olvidó la contraseña? El administrador puede restablecerla.</FieldDescription>
        </Field>
        <Button type="submit" disabled={pend}>{pend ? <Spinner /> : <LogIn />} Ingresar</Button>
      </FieldGroup>
    </form>
  );
}
