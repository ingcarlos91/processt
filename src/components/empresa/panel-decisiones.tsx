"use client";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { ChevronDown } from "lucide-react";
import type { GrupoDecisiones } from "@/lib/reglas/decisiones";

export function PanelDecisiones({ grupos, empresa }: { grupos: GrupoDecisiones[]; empresa: string }) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" />}><Lightbulb /> ¿Por qué? Decisiones</SheetTrigger>
      <SheetContent className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Decisiones tomadas para {empresa}</SheetTitle>
          <SheetDescription>Todo lo que el sistema concluyó, explicado en palabras sencillas y con la norma que lo respalda. Si un dato de la empresa cambia, estas decisiones se recalculan.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] px-4 pb-6">
          <div className="space-y-3">
            {grupos.map((g, gi) => (
              <Collapsible key={g.id} defaultOpen={gi === 0} className="rounded-xl border">
                <CollapsibleTrigger className="group flex w-full items-center gap-2 px-4 py-3 text-left">
                  <div className="flex-1"><div className="font-medium">{g.titulo}</div><div className="text-xs text-muted-foreground">{g.resumen}</div></div>
                  <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[panel-open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="border-t px-2 py-2">
                  <ItemGroup className="gap-1">
                    {g.items.map((d, i) => (
                      <Item key={i} size="sm">
                        <ItemContent>
                          <ItemTitle>{d.que}</ItemTitle>
                          <ItemDescription className="line-clamp-none text-foreground/75">{d.porque}</ItemDescription>
                          {d.pasos && <ol className="list-decimal pl-5 text-xs text-muted-foreground">{d.pasos.map((p, j) => <li key={j}>{p}</li>)}</ol>}
                          {d.normas && d.normas.filter(Boolean).length > 0 && <div className="flex flex-wrap gap-1 pt-1">{d.normas.filter(Boolean).map((n) => <Badge key={n} variant="secondary" className="font-normal text-[11px]">{n}</Badge>)}</div>}
                        </ItemContent>
                      </Item>
                    ))}
                  </ItemGroup>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
