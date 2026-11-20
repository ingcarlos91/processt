"use client";
import { CampoDocumento } from "@/components/app/campo-documento";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { NormaRef } from "@/components/app/ui";
import { Ayuda } from "@/components/app/ayuda";
import { guardarConsultora, type DatosConsultora } from "@/app/actions/empresas";
import { AvisoTareas, type TareaAviso } from "@/components/plazos/aviso-tareas";
import { toastTareas } from "@/components/plazos/toast-tareas";
import { avisoPlazo, deInput } from "@/lib/plazos";

type D = Required<Omit<DatosConsultora, "curso50h">> & { curso50h: boolean };

export function ConsultoraForm({ inicial, ia }: { inicial: D; ia: { activa: boolean; proveedor: string; basico: string; tecnico: string; gasto: number; usos: number; tope: number | null } }) {
  const [d, setD] = useState(inicial);
  const [pend, start] = useTransition();
  const set = <K extends keyof D>(k: K, v: D[K]) => setD((x) => ({ ...x, [k]: v }));
  // Próxima actualización con el curso de 20 horas: 3 años desde el último certificado (Res. 4927/2016 art. 16).
  const ultimoCurso = [d.curso50hFecha, d.curso20hFecha].filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f ?? "")).sort().pop();
  const tareasCurso: TareaAviso[] = d.curso50h && ultimoCurso ? [{ ...avisoPlazo("curso_20h", deInput(ultimoCurso)), tarea: "Próxima actualización con el curso virtual de 20 horas" }] : [];
  const AY: Partial<Record<keyof D, string>> = { profesional: "respNombre", cargo: "cargoProfesional", licenciaSst: "licencia", licenciaFecha: "licenciaFecha", curso50hFecha: "curso50h", curso20hFecha: "curso20h" };
  const campo = (k: keyof D, l: string, opts?: { tipo?: string; desc?: string; ph?: string }) => (
    <Field><FieldLabel htmlFor={k} className="gap-1">{l}{AY[k] && <Ayuda k={AY[k]} />}</FieldLabel><Input id={k} type={opts?.tipo} placeholder={opts?.ph} value={String(d[k] ?? "")} onChange={(e) => set(k, e.target.value as never)} />{opts?.desc && <FieldDescription>{opts.desc}</FieldDescription>}</Field>
  );
  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start max-w-6xl">
      <Card>
        <CardHeader><CardTitle>Consultora y profesional que firma</CardTitle><CardDescription>Se usan en la designación del responsable (DOC-03), en las firmas “Elaboró” y en la evaluación inicial.</CardDescription></CardHeader>
        <CardContent>
          <FieldGroup className="grid md:grid-cols-2 gap-4">
            {campo("nombre", "Nombre de la consultora", { ph: "Ej.: Gestión Segura S.A.S." })}
            {campo("nit", "NIT de la consultora", { ph: "Ej.: 900123456" })}
            <FieldSeparator className="md:col-span-2">Profesional</FieldSeparator>
            {campo("profesional", "Nombre completo", { ph: "Nombres y apellidos" })}
            <Field><FieldLabel htmlFor="cedula" className="gap-1">Documento de identidad <Ayuda k="documentoIdentidad" /></FieldLabel><CampoDocumento id="cedula" tipo={d.tipoDoc} numero={d.cedula} onTipo={(v) => set("tipoDoc", v)} onNumero={(v) => set("cedula", v)} /></Field>
            {campo("cargo", "Cargo o vínculo con las empresas", { desc: "Por ejemplo: Asesora externa en SST", ph: "Ej.: Asesora externa en SST" })}
            <Field>
              <FieldLabel htmlFor="perfil" className="gap-1">Perfil <Ayuda k="perfil" /></FieldLabel>
              <NativeSelect id="perfil" className="w-full" value={d.perfil} onChange={(e) => set("perfil", e.target.value)}>
                <NativeSelectOption value="">— Seleccione —</NativeSelectOption>
                <NativeSelectOption value="tecnico">Técnico en SST</NativeSelectOption>
                <NativeSelectOption value="tecnologo">Tecnólogo en SST</NativeSelectOption>
                <NativeSelectOption value="profesional">Profesional en SST</NativeSelectOption>
                <NativeSelectOption value="especialista">Profesional con posgrado en SST</NativeSelectOption>
              </NativeSelect>
              <FieldDescription>Define a qué empresas puede diseñarles el SG-SST (Res. 0312/2019 arts. 4, 10 y 17).</FieldDescription>
            </Field>
            {campo("licenciaSst", "Licencia en SST", { desc: "Número de resolución (Res. 908/2025: licencia digital)", ph: "Número de la resolución que otorgó la licencia" })}
            {campo("licenciaFecha", "Fecha de la licencia", { tipo: "date" })}
            <Field orientation="horizontal" className="items-start md:col-span-1">
              <Switch id="c50" className="mt-0.5" checked={d.curso50h} onCheckedChange={(v) => set("curso50h", v)} />
              <div className="flex min-w-0 flex-col gap-1">
                <FieldLabel htmlFor="c50" className="font-normal">Curso virtual de 50 horas aprobado <Ayuda k="curso50h" /></FieldLabel>
                <NormaRef>Decreto 1072/2015 art. 2.2.4.6.35</NormaRef>
              </div>
            </Field>
            {campo("curso50hFecha", "Fecha del curso de 50 horas", { tipo: "date", desc: "Se actualiza cada 3 años con el curso de 20 horas" })}
            {campo("curso20hFecha", "Fecha del último curso de 20 horas", { tipo: "date" })}
            <AvisoTareas className="md:col-span-2" titulo="Fecha que se deriva de estos datos" tareas={tareasCurso} />
            <FieldSeparator className="md:col-span-2">Contacto</FieldSeparator>
            {campo("telefono", "Teléfono", { ph: "Ej.: 300 123 4567" })}
            {campo("correo", "Correo", { tipo: "email", ph: "nombre@empresa.com" })}
          </FieldGroup>
        </CardContent>
        <CardFooter className="border-t"><Button disabled={pend} onClick={() => start(async () => { const r = await guardarConsultora(d); if (r && "error" in r) { toast.error(r.error); return; } if (tareasCurso.length) toastTareas("Datos guardados. Los documentos de todas las empresas se actualizaron.", tareasCurso); else toast.success("Datos guardados. Los documentos de todas las empresas se actualizaron."); })}><Save /> Guardar</Button></CardFooter>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="size-4" /> Asistente de IA</CardTitle><CardDescription>Sugiere tareas y peligros por cargo según la GTC 45, priorizando la biblioteca.</CardDescription></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {ia.activa ? <Badge>Activo · {ia.proveedor}</Badge> : <Badge variant="outline">No configurado</Badge>}
          {ia.activa && (
            <div className="grid gap-1 text-xs text-muted-foreground">
              <p>Redacción y propuestas sencillas: <span className="font-medium text-foreground">{ia.basico}</span>. Matriz de peligros y análisis de accidentes: <span className="font-medium text-foreground">{ia.tecnico}</span>.</p>
              <p>Este mes: {ia.usos} uso(s), USD {ia.gasto.toFixed(2)}{ia.tope != null ? ` de un tope de USD ${ia.tope.toFixed(2)}` : " (sin tope)"}. La IA solo propone: usted revisa y aprueba. No se le envían nombres, documentos ni datos de salud de los trabajadores.</p>
            </div>
          )}
          {!ia.activa && <p className="text-muted-foreground text-xs">Sin IA, “Sugerir tareas y peligros” busca por palabras clave en la biblioteca y el análisis de accidentes usa las guías de la biblioteca.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
