"use client";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { eliminarEmpresa } from "@/app/actions/empresas";

export function BotonEliminarEmpresa({ id, nombre }: { id: string; nombre: string }) {
  const [txt, setTxt] = useState("");
  const [pend, start] = useTransition();
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" className="w-fit" />}><Trash2 /> Eliminar empresa</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar {nombre}</DialogTitle>
          <DialogDescription>Se eliminarán la empresa y todo su SG-SST: matriz, evaluaciones, documentos y plan. No se puede deshacer.</DialogDescription>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="conf">Escriba el nombre de la empresa para confirmar</FieldLabel>
          <Input id="conf" value={txt} onChange={(e) => setTxt(e.target.value)} />
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button variant="destructive" disabled={txt !== nombre || pend} onClick={() => start(() => eliminarEmpresa(id))}>Eliminar definitivamente</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
