"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { guardarConsultora } from "@/app/actions/empresas";

type D = { nombre: string; nit: string; profesional: string; cedula: string; licenciaSst: string; telefono: string; correo: string };

export function ConsultoraForm({ inicial, ia }: { inicial: D; ia: { activa: boolean; modelo: string } }) {
  const [d, setD] = useState(inicial);
  const [pend, start] = useTransition();
  const campos: [keyof D, string, string?][] = [["nombre", "Nombre de la consultora"], ["nit", "NIT"], ["profesional", "Profesional que firma"], ["cedula", "Cédula"], ["licenciaSst", "Licencia en SST", "Resolución y fecha (Res. 908/2025: licencia digital)"], ["telefono", "Teléfono"], ["correo", "Correo"]];
  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start max-w-5xl">
      <Card>
        <CardHeader><CardTitle>Datos</CardTitle></CardHeader>
        <CardContent>
          <FieldGroup className="grid md:grid-cols-2 gap-4">
            {campos.map(([k, l, h]) => (
              <Field key={k}><FieldLabel htmlFor={k}>{l}</FieldLabel><Input id={k} value={d[k]} onChange={(e) => setD({ ...d, [k]: e.target.value })} />{h && <FieldDescription>{h}</FieldDescription>}</Field>
            ))}
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t"><Button disabled={pend} onClick={() => start(async () => { await guardarConsultora(d); toast.success("Datos guardados"); })}><Save /> Guardar</Button></CardFooter>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="size-4" /> Asistente de IA</CardTitle><CardDescription>Sugiere tareas y peligros por cargo según la GTC 45, priorizando la biblioteca.</CardDescription></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {ia.activa ? <Badge>Activo · {ia.modelo}</Badge> : <Badge variant="outline">No configurado</Badge>}
          {!ia.activa && <p className="text-muted-foreground text-xs">Sin IA, “Sugerir tareas y peligros” busca por palabras clave en la biblioteca. Para activarla, agregue AI_GATEWAY_API_KEY al archivo .env y reinicie.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
