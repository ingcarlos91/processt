"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Section } from "@/components/app/ui";
import { Confirmar } from "@/components/app/confirmar";
import { PanelFormulario, SeccionFormulario } from "@/components/app/formulario-largo";
import * as A from "@/app/actions/biblioteca";

type L = { id?: string; nombre: string; descripcion: string; frecuenciaDias: number; items: string };

/** Listas de chequeo de inspección (globales). */
export function InspeccionesTab({ listas }: { listas: { id: string; nombre: string; descripcion: string; frecuenciaDias: number; items: string[] }[] }) {
  const [pend, start] = useTransition();
  const [f, setF] = useState<L | null>(null);
  const guardar = () => f && start(async () => {
    const r = await A.guardarCatalogoItem({ id: f.id, tipo: "LISTA_INSPECCION", nombre: f.nombre, descripcion: f.descripcion, normas: ["RES-0312-2019"], detalle: { orden: f.id ? listas.findIndex((l) => l.id === f.id) : listas.length, frecuenciaDias: Number(f.frecuenciaDias) || 0, items: f.items.split("\n").map((x) => x.trim()).filter(Boolean) } });
    if (r && "error" in r && r.error) toast.error(String(r.error)); else { toast.success("Lista guardada"); setF(null); }
  });
  return (
    <Section title="Listas de chequeo de inspección" description="Se usan en la pestaña Inspecciones de cada empresa. La frecuencia define cuándo el planeador avisa la próxima inspección (Res. 0312/2019 estándar 4.2.4)." contentClassName="space-y-2"
      actions={<Button size="sm" onClick={() => setF({ nombre: "", descripcion: "", frecuenciaDias: 30, items: "" })}><Plus /> Nueva lista</Button>}>
      {listas.map((l) => (
        <div key={l.id} className="flex items-start gap-3 rounded-lg border p-3">
          <div className="flex-1"><div className="font-medium">{l.nombre} <Badge variant="outline" className="ml-1">cada {l.frecuenciaDias} días</Badge></div><div className="text-sm text-muted-foreground">{l.descripcion}</div><div className="mt-1 text-xs text-muted-foreground">{l.items.length} ítems</div></div>
          <Button size="icon-sm" variant="ghost" aria-label="Editar lista" onClick={() => setF({ ...l, items: l.items.join("\n") })}><Pencil /></Button>
          <Confirmar trigger={<Button size="icon-sm" variant="ghost" aria-label="Eliminar lista" />} titulo={`Eliminar «${l.nombre}»`} descripcion="Las inspecciones ya realizadas se conservan." accion="Eliminar" destructivo onConfirm={() => start(async () => { const r = await A.eliminarCatalogoItem(l.id); if (r && "error" in r) toast.error(r.error); else toast.success("Lista eliminada"); })}><Trash2 /></Confirmar>
        </div>
      ))}
      <PanelFormulario open={!!f} onOpenChange={(o) => !o && setF(null)}
        titulo={f?.id ? `Editar «${f.nombre}»` : "Nueva lista de chequeo"}
        descripcion="Cada ítem se redacta como lo que debe cumplirse; al inspeccionar se califica Cumple, No cumple o N. A."
        pie={<><Button variant="outline" onClick={() => setF(null)}>Cancelar</Button><Button disabled={pend || !f?.nombre.trim()} onClick={guardar} tooltip={!f?.nombre.trim() ? "Escriba el nombre de la lista" : undefined}>{pend && <Spinner />} Guardar</Button></>}>
        {f && (
          <>
            <SeccionFormulario titulo="Identificación" descripcion="La frecuencia define cuándo el planeador avisa la próxima inspección (Res. 0312/2019 estándar 4.2.4)." columnas={2}>
              <Field><FieldLabel htmlFor="l-n">Nombre</FieldLabel><Input id="l-n" placeholder="Ej.: Inspección de extintores" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="l-f">Frecuencia (días)</FieldLabel><Input id="l-f" placeholder="Ej.: 30" type="number" min={0} value={f.frecuenciaDias} onChange={(e) => setF({ ...f, frecuenciaDias: Number(e.target.value) })} /><FieldDescription>0 = sin aviso automático.</FieldDescription></Field>
              <Field className="sm:col-span-2"><FieldLabel htmlFor="l-d">Descripción</FieldLabel><Input id="l-d" placeholder="Ej.: Estado, carga y señalización de los extintores" value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} /></Field>
            </SeccionFormulario>
            <SeccionFormulario titulo="Ítems de la lista" descripcion="Un ítem por línea. El orden es el que verá quien inspecciona.">
              <Field>
                <FieldLabel htmlFor="l-i">Ítems</FieldLabel>
                <Textarea id="l-i" rows={14} placeholder={"Un ítem por línea. Ej.:\n¿El extintor tiene la carga vigente?\n¿Está señalizado y sin obstáculos?"} value={f.items} onChange={(e) => setF({ ...f, items: e.target.value })} />
                <FieldDescription>{f.items.split("\n").filter((x) => x.trim()).length} ítems.</FieldDescription>
              </Field>
            </SeccionFormulario>
          </>
        )}
      </PanelFormulario>
    </Section>
  );
}
