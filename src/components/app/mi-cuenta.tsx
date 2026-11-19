"use client";
import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Isotipo } from "@/components/app/isotipo";
import { actualizarMiPerfil, cambiarMiPassword } from "@/app/actions/usuarios";

type Yo = { nombre: string; email: string; rol: string; ultimoAcceso: string | null; creadoEn: string };
const fecha = (f: string | null) => (f ? new Date(f).toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" }) : "—");

/** Bloque de ajustes: título y explicación a la izquierda, formulario a la derecha. */
function Bloque({ titulo, descripcion, children, pie }: { titulo: string; descripcion: string; children: ReactNode; pie: ReactNode }) {
  return (
    <div className="grid gap-x-10 gap-y-4 md:grid-cols-[260px_1fr]">
      <div>
        <h2 className="font-medium">{titulo}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
      </div>
      <Card className="py-0">
        <CardContent className="py-5">{children}</CardContent>
        <div className="flex items-center justify-end gap-2 rounded-b-xl border-t bg-muted/40 px-6 py-3">{pie}</div>
      </Card>
    </div>
  );
}

function Clave({ id, value, onChange, autoComplete, invalido }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; invalido?: boolean }) {
  const [ver, setVer] = useState(false);
  return (
    <InputGroup>
      <InputGroupInput id={id} type={ver ? "text" : "password"} autoComplete={autoComplete} value={value} aria-invalid={invalido} onChange={(e) => onChange(e.target.value)} />
      <InputGroupAddon align="inline-end"><InputGroupButton size="icon-xs" aria-label={ver ? "Ocultar" : "Mostrar"} onClick={() => setVer(!ver)}>{ver ? <EyeOff /> : <Eye />}</InputGroupButton></InputGroupAddon>
    </InputGroup>
  );
}

export function MiCuenta({ yo }: { yo: Yo }) {
  const [d, setD] = useState({ nombre: yo.nombre, email: yo.email });
  const [c, setC] = useState({ actual: "", nueva: "", repetir: "" });
  const [pendP, startP] = useTransition();
  const [pendC, startC] = useTransition();
  const cambioPerfil = d.nombre !== yo.nombre || d.email !== yo.email;
  const reglas = [{ ok: c.nueva.length >= 8, t: "8 caracteres o más" }, { ok: /[a-zA-Z]/.test(c.nueva), t: "Letras" }, { ok: /\d/.test(c.nueva), t: "Números" }];
  const claveOk = reglas.every((r) => r.ok) && c.nueva === c.repetir && !!c.actual;

  return (
    <div className="max-w-5xl space-y-8">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-5">
          <div className="flex size-16 items-center justify-center rounded-2xl border bg-white p-2.5 shadow-xs"><Isotipo className="size-full" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-semibold">{yo.nombre}</h2><Badge variant={yo.rol === "admin" ? "default" : "outline"}>{yo.rol === "admin" ? "Administrador" : "Consultor"}</Badge></div>
            <p className="text-sm text-muted-foreground">{yo.email}</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            <span className="text-muted-foreground">Último acceso</span><span className="text-muted-foreground">Usuario desde</span>
            <span>{fecha(yo.ultimoAcceso)}</span><span>{fecha(yo.creadoEn)}</span>
          </div>
        </CardContent>
      </Card>

      <Bloque titulo="Datos personales" descripcion="Su nombre aparece en el menú y en los archivos que sube. El correo es el usuario con el que inicia sesión."
        pie={<>
          {cambioPerfil && <Button variant="ghost" onClick={() => setD({ nombre: yo.nombre, email: yo.email })}>Descartar</Button>}
          <Button disabled={pendP || !cambioPerfil} onClick={() => startP(async () => { const r = await actualizarMiPerfil(d); if ("error" in r) toast.error(r.error); else toast.success("Datos actualizados"); })}>{pendP && <Spinner />} Guardar cambios</Button>
        </>}>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field><FieldLabel htmlFor="mn">Nombre completo</FieldLabel><Input id="mn" placeholder="Nombres y apellidos" value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} /></Field>
          <Field><FieldLabel htmlFor="me">Correo</FieldLabel><Input id="me" placeholder="nombre@empresa.com" type="email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} /></Field>
        </FieldGroup>
      </Bloque>

      <Separator />

      <Bloque titulo="Contraseña" descripcion="Al cambiarla se cierran sus sesiones en otros equipos; en este sigue conectado."
        pie={<Button disabled={pendC || !claveOk} onClick={() => startC(async () => { const r = await cambiarMiPassword(c.actual, c.nueva); if ("error" in r) toast.error(r.error); else { toast.success("Contraseña actualizada"); setC({ actual: "", nueva: "", repetir: "" }); } })}>{pendC ? <Spinner /> : <ShieldCheck />} Cambiar contraseña</Button>}>
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]"><FieldLabel htmlFor="pa">Contraseña actual</FieldLabel><Clave id="pa" autoComplete="current-password" value={c.actual} onChange={(v) => setC({ ...c, actual: v })} /></Field>
          <Field>
            <FieldLabel htmlFor="pn">Nueva contraseña</FieldLabel>
            <Clave id="pn" autoComplete="new-password" value={c.nueva} onChange={(v) => setC({ ...c, nueva: v })} />
            <div className="flex flex-wrap gap-1.5">{reglas.map((r) => <Badge key={r.t} variant={r.ok ? "secondary" : "outline"} className={r.ok ? "text-emerald-700" : "text-muted-foreground"}>{r.ok ? "✓" : "·"} {r.t}</Badge>)}</div>
          </Field>
          <Field>
            <FieldLabel htmlFor="pr">Repetir nueva contraseña</FieldLabel>
            <Clave id="pr" autoComplete="new-password" value={c.repetir} invalido={!!c.repetir && c.repetir !== c.nueva} onChange={(v) => setC({ ...c, repetir: v })} />
            {c.repetir && c.repetir !== c.nueva && <FieldDescription className="text-destructive">No coincide con la nueva contraseña.</FieldDescription>}
          </Field>
        </FieldGroup>
      </Bloque>
    </div>
  );
}
