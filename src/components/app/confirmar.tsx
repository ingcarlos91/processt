"use client";
import { useState, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** Diálogo de confirmación estándar. */
export function Confirmar({ trigger, children, titulo, descripcion, accion = "Confirmar", destructivo, onConfirm }: { trigger: ReactElement; children?: ReactNode; titulo: string; descripcion?: ReactNode; accion?: string; destructivo?: boolean; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{titulo}</DialogTitle>{descripcion && <DialogDescription>{descripcion}</DialogDescription>}</DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button variant={destructivo ? "destructive" : "default"} onClick={() => { setOpen(false); onConfirm(); }}>{accion}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Diálogo que pide un texto. */
export function Pedir({ trigger, children, titulo, descripcion, label, inicial = "", accion = "Guardar", tipo = "text", placeholder, onConfirm }: { trigger: ReactElement; children?: ReactNode; titulo: string; descripcion?: ReactNode; label: string; inicial?: string; accion?: string; tipo?: "text" | "date"; placeholder?: string; onConfirm: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState(inicial);
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setV(inicial); }}>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{titulo}</DialogTitle>{descripcion && <DialogDescription>{descripcion}</DialogDescription>}</DialogHeader>
        <Field><FieldLabel htmlFor="pedir">{label}</FieldLabel><Input id="pedir" type={tipo} placeholder={tipo === "date" ? undefined : placeholder} className={tipo === "date" ? "w-48" : undefined} value={v} onChange={(e) => setV(e.target.value)} /></Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button disabled={!v.trim()} onClick={() => { setOpen(false); onConfirm(v.trim()); }}>{accion}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
