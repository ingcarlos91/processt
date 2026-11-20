"use client";
import { useRouter } from "next/navigation";
import { Selector } from "@/components/app/selector";

/** Elige con qué empresa se arma la vista de una plantilla. */
export function SelectorEmpresaVista({ codigo, empresas, actual }: { codigo: string; empresas: { id: string; razonSocial: string }[]; actual: string }) {
  const router = useRouter();
  return (
    <Selector
      value={actual}
      onChange={(v) => router.push(`/plantillas/${codigo}/ver?empresa=${v}`)}
      opciones={empresas.map((e) => ({ valor: e.id, etiqueta: e.razonSocial }))}
    />
  );
}
