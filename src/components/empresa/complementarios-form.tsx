"use client";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ayuda } from "@/components/app/ayuda";
import { guardarComplementarios } from "@/app/actions/sgsst";
import type { CampoComplementario, Complementarios, Persona, Seccion } from "@/lib/complementarios";

export function ComplementariosForm({ empresaId, secciones, inicial, faltan }: { empresaId: string; secciones: Seccion[]; inicial: Complementarios; faltan: string[] }) {
  const [d, setD] = useState<Complementarios>(() => {
    const x = { ...inicial };
    for (const s of secciones) for (const c of s.campos) if (c.tipo === "tabla" && !Array.isArray(x[c.k])) x[c.k] = (c.filasSugeridas ?? []).map((f) => ({ ...f }));
    return x;
  });
  const [pend, start] = useTransition();
  const set = (k: string, v: Complementarios[string]) => setD((x) => ({ ...x, [k]: v }));
  const guardar = () => start(async () => { await guardarComplementarios(empresaId, d); toast.success("Datos guardados. Regenere los documentos para verlos."); });

  return (
    <div id="complementarios" className="space-y-4 scroll-mt-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Datos para los documentos</h2>
          <p className="text-sm text-muted-foreground">Lo que los documentos necesitan y el sistema no puede deducir. Se llena una vez; al regenerar, los documentos salen completos.</p>
        </div>
        <Button disabled={pend} onClick={guardar}><Save /> Guardar datos</Button>
      </div>
      {secciones.map((s) => (
        <Card key={s.id}>
          <CardHeader><CardTitle>{s.titulo}</CardTitle><CardDescription>{s.descripcion}</CardDescription></CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-5">
            {s.campos.map((c) => <CampoUI key={c.k} c={c} v={d[c.k]} set={(v) => set(c.k, v)} falta={faltan.includes(c.k)} />)}
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end"><Button disabled={pend} onClick={guardar}><Save /> Guardar datos</Button></div>
    </div>
  );
}

function Etiqueta({ c, falta }: { c: CampoComplementario; falta: boolean }) {
  return (
    <FieldLabel className="gap-1 flex-wrap">
      {c.etiqueta}
      <Ayuda ayuda={{ titulo: c.etiqueta, que: c.que, donde: c.donde, ejemplo: c.ejemplo, para: `Se usa en: ${c.usadoEn.join(", ")}.`, normas: c.normas }} />
      {falta && <Badge variant="destructive" className="text-[10px]">falta</Badge>}
      <span className="text-[11px] font-normal text-muted-foreground">· {c.usadoEn.join(", ")}</span>
    </FieldLabel>
  );
}

function CampoUI({ c, v, set, falta }: { c: CampoComplementario; v: Complementarios[string]; set: (v: Complementarios[string]) => void; falta: boolean }) {
  if (c.tipo === "persona") {
    const p = (v ?? {}) as Persona;
    const up = (k: keyof Persona, x: string) => set({ ...p, [k]: x });
    return (
      <Field className="md:col-span-1">
        <Etiqueta c={c} falta={falta} />
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Nombre" value={p.nombre ?? ""} onChange={(e) => up("nombre", e.target.value)} />
          <Input placeholder="Cargo" value={p.cargo ?? ""} onChange={(e) => up("cargo", e.target.value)} />
          <Input placeholder="Cédula / licencia" value={p.cedula ?? ""} onChange={(e) => up("cedula", e.target.value)} />
          <Input placeholder="Correo o teléfono" value={p.correo ?? ""} onChange={(e) => up("correo", e.target.value)} />
        </div>
      </Field>
    );
  }
  if (c.tipo === "tabla") {
    const filas = (Array.isArray(v) ? v : []) as Record<string, string>[];
    const cols = c.columnas ?? [];
    const upd = (i: number, k: string, x: string) => set(filas.map((f, j) => (j === i ? { ...f, [k]: x } : f)));
    return (
      <Field className="md:col-span-2">
        <Etiqueta c={c} falta={falta} />
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader><TableRow>{cols.map((col) => <TableHead key={col.k}>{col.etiqueta}</TableHead>)}<TableHead className="w-8" /></TableRow></TableHeader>
            <TableBody>
              {filas.map((f, i) => (
                <TableRow key={i}>
                  {cols.map((col) => (
                    <TableCell key={col.k} className="p-1">
                      {col.tipo === "select"
                        ? <NativeSelect size="sm" className="w-full" value={f[col.k] ?? ""} onChange={(e) => upd(i, col.k, e.target.value)}><NativeSelectOption value="">—</NativeSelectOption>{col.opciones?.map((o) => <NativeSelectOption key={o} value={o}>{o}</NativeSelectOption>)}</NativeSelect>
                        : <Input className="h-7" type={col.tipo ?? "text"} value={f[col.k] ?? ""} onChange={(e) => upd(i, col.k, e.target.value)} />}
                    </TableCell>
                  ))}
                  <TableCell className="p-1"><Button variant="ghost" size="icon-xs" aria-label="Quitar fila" onClick={() => set(filas.filter((_, j) => j !== i))}><Trash2 /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button variant="outline" size="sm" className="w-fit" onClick={() => set([...filas, {}])}><Plus /> Agregar fila</Button>
      </Field>
    );
  }
  return (
    <Field>
      <Etiqueta c={c} falta={falta} />
      {c.tipo === "textarea"
        ? <Textarea value={String(v ?? "")} onChange={(e) => set(e.target.value)} placeholder={c.ejemplo} />
        : <Input type={c.tipo} value={String(v ?? "")} onChange={(e) => set(e.target.value)} placeholder={c.ejemplo} />}
      {c.donde && <FieldDescription>Dónde encontrarlo: {c.donde}</FieldDescription>}
    </Field>
  );
}
