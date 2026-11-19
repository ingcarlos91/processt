"use client";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { BookOpenText, ChevronLeft, ListChecks, MousePointerClick, Lightbulb, Search, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MANUAL, seccionDeRuta, buscarManual, type SeccionManual } from "@/lib/manual";
import { cn } from "@/lib/utils";

function Bloque({ icono, titulo, children }: { icono: React.ReactNode; titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2.5">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{icono}{titulo}</h3>
      {children}
    </section>
  );
}

function Contenido({ s, abrir }: { s: SeccionManual; abrir: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed">{s.resumen}</p>
      <Bloque icono={<MousePointerClick className="size-3.5" />} titulo="Qué incluye esta pantalla">
        <div className="space-y-2.5">
          {s.partes.map((p) => (
            <div key={p.titulo} className="rounded-lg border bg-card p-3.5">
              <div className="text-sm font-medium">{p.titulo}</div>
              <p className="mt-1 text-sm text-muted-foreground">{p.que}</p>
              {p.botones && (
                <ul className="mt-2.5 space-y-2 border-t pt-2.5">
                  {p.botones.map((b) => (
                    <li key={b.nombre} className="text-sm">
                      <Badge variant="secondary" className="mb-0.5 mr-1.5 font-medium">{b.nombre}</Badge>
                      <span className="text-muted-foreground">{b.hace}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Bloque>
      {s.pasos && (
        <Bloque icono={<ListChecks className="size-3.5" />} titulo="Paso a paso recomendado">
          <ol className="space-y-2">
            {s.pasos.map((p, i) => (
              <li key={p} className="flex gap-2.5 text-sm"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] text-primary-foreground">{i + 1}</span><span>{p}</span></li>
            ))}
          </ol>
        </Bloque>
      )}
      {s.consejos && (
        <Bloque icono={<Lightbulb className="size-3.5" />} titulo="Consejos">
          <ul className="space-y-1.5 rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-sm">{s.consejos.map((c) => <li key={c}>• {c}</li>)}</ul>
        </Bloque>
      )}
      {s.normas && (
        <Bloque icono={<Scale className="size-3.5" />} titulo="Normas que respaldan esta sección">
          <div className="flex flex-wrap gap-1.5">{s.normas.map((n) => <Badge key={n} variant="outline" className="border-sky-200 bg-sky-50 text-sky-800">{n}</Badge>)}</div>
        </Bloque>
      )}
      {s.relacionadas && (
        <Bloque icono={<BookOpenText className="size-3.5" />} titulo="Secciones relacionadas">
          <div className="flex flex-wrap gap-1.5">
            {s.relacionadas.map((id) => { const r = MANUAL.find((x) => x.id === id); return r ? <Button key={id} size="xs" variant="outline" onClick={() => abrir(id)}>{r.titulo}</Button> : null; })}
          </div>
        </Bloque>
      )}
    </div>
  );
}

/** Manual de ayuda por sección: se abre en un panel lateral con la ayuda de la pantalla actual. */
export function ManualAyuda() {
  const pathname = usePathname();
  const actual = seccionDeRuta(pathname);
  const [open, setOpen] = useState(false);
  const [elegida, setElegida] = useState<string | null>(null);
  const [indice, setIndice] = useState(false);
  const [q, setQ] = useState("");
  const s = MANUAL.find((x) => x.id === elegida) ?? actual;
  const resultados = useMemo(() => buscarManual(q), [q]);
  const abrir = (id: string) => { setElegida(id); setQ(""); setIndice(false); };

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (o) { setElegida(null); setQ(""); setIndice(false); } }}>
      <SheetTrigger render={<Button variant="ghost" size="sm" tooltip="Manual de esta sección: qué incluye, qué hace cada botón y el paso a paso" tooltipLado="bottom" />}><BookOpenText /> Ayuda</SheetTrigger>
      <SheetContent className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader className="border-b">
          <SheetTitle className="flex items-center gap-2"><BookOpenText className="size-4" /> Manual — {indice ? "Todas las secciones" : s.titulo}</SheetTitle>
          <SheetDescription>{s.id === actual.id && !indice ? "Ayuda de la pantalla en la que está." : "Consultando otra sección del manual."}</SheetDescription>
          <InputGroup className="mt-2">
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupInput placeholder="Buscar en el manual: botón, tarjeta, tema…" value={q} onChange={(e) => setQ(e.target.value)} />
          </InputGroup>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(elegida || indice) && <Button size="xs" variant="ghost" onClick={() => { setElegida(null); setIndice(false); }}><ChevronLeft /> Volver a esta pantalla</Button>}
            {!indice && <Button size="xs" variant="ghost" onClick={() => setIndice(true)}>Ver todas las secciones</Button>}
          </div>
        </SheetHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-5">
            {q.trim() ? (
              resultados.length === 0 ? <p className="text-sm text-muted-foreground">Sin resultados para “{q}”.</p> : (
                <ul className="space-y-2">
                  {resultados.map((r, i) => (
                    <li key={i}>
                      <button type="button" onClick={() => abrir(r.seccion.id)} className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50">
                        <div className="text-sm font-medium">{r.titulo}</div>
                        <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{r.texto}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            ) : indice ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {MANUAL.map((x) => (
                  <li key={x.id}>
                    <button type="button" onClick={() => abrir(x.id)} className={cn("h-full w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50", x.id === actual.id && "border-primary/40 bg-primary/5")}>
                      <div className="text-sm font-medium">{x.titulo}</div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{x.resumen}</div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <Contenido s={s} abrir={abrir} />}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
