"use client";
import type { ReactElement } from "react";
import { BookmarkPlus, Building2, Globe } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

/** Menú para guardar algo en la biblioteca de la empresa o en la general. */
export function GuardarEnBiblioteca({ trigger, onGuardar, que }: { trigger: ReactElement; onGuardar: (alcance: "empresa" | "general") => void; que: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger}><BookmarkPlus /></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Guardar {que} en…</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onGuardar("empresa")}><Building2 /> <div><div>Biblioteca de esta empresa</div><div className="text-xs text-muted-foreground">Solo se reutiliza aquí</div></div></DropdownMenuItem>
          <DropdownMenuItem onClick={() => onGuardar("general")}><Globe /> <div><div>Biblioteca general</div><div className="text-xs text-muted-foreground">Disponible para todas las empresas</div></div></DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
