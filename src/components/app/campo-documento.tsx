"use client";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { TIPOS_DOC } from "@/lib/documento-identidad";

/** Tipo y número de documento de identidad en una sola línea (C.C., C.E., pasaporte, PPT, PEP, T.I.). */
export function CampoDocumento({ id, tipo, numero, onTipo, onNumero, disabled }: {
  id?: string; tipo?: string | null; numero?: string | null; onTipo: (v: string) => void; onNumero: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div className="flex gap-1.5">
      <NativeSelect className="w-32 shrink-0" aria-label="Tipo de documento" value={tipo || "CC"} disabled={disabled} onChange={(e) => onTipo(e.target.value)}>
        {TIPOS_DOC.map((t) => <NativeSelectOption key={t.valor} value={t.valor}>{t.abrev}</NativeSelectOption>)}
      </NativeSelect>
      <Input id={id} className="min-w-0 flex-1" value={numero ?? ""} disabled={disabled} placeholder="Número" onChange={(e) => onNumero(e.target.value)} />
    </div>
  );
}
