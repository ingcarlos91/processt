"use client";
import { useRef, useState, useTransition, type ReactElement, type ReactNode } from "react";
import { toast } from "sonner";
import { Download, Eye, FileText, Image as ImageIcon, Paperclip, Upload, Archive, RotateCcw, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Pedir } from "@/components/app/confirmar";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { subirArchivo, retirarArchivo, restaurarArchivo } from "@/app/actions/archivos";
import { cn } from "@/lib/utils";

export type ArchivoUI = { id: string; tipo: string; descripcion: string; nombreArchivo: string | null; mime: string | null; tamano: number | null; fecha: string; subidoPor: string | null; activo: boolean; documentoVersion?: number | null };
export type ContextoAdjunto = { tipo: "DOCUMENTO_FIRMADO" | "EVIDENCIA" | "ACTA"; documentoId?: string; actividadId?: string; comiteId?: string; eventoId?: string; inspeccionId?: string; auditoriaId?: string; diagnosticoId?: string; estandarCodigo?: string };

const ACEPTA = "application/pdf,image/jpeg,image/png,image/webp,image/heic,.docx,.xlsx";
const tam = (n: number | null) => (n == null ? "" : n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);
const fechaCorta = (f: string) => new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
function Icono({ mime }: { mime: string | null }) {
  if (mime?.startsWith("image/")) return <ImageIcon />;
  if (mime?.includes("sheet")) return <FileSpreadsheet />;
  return <FileText />;
}

/** Botón y diálogo para subir un archivo con descripción y fecha. */
export function SubirArchivo({ empresaId, ctx, trigger, titulo = "Subir archivo", ayuda, descripcionInicial = "" }: { empresaId: string; ctx: ContextoAdjunto; trigger?: ReactNode; titulo?: string; ayuda?: string; descripcionInicial?: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [desc, setDesc] = useState(descripcionInicial);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [pend, start] = useTransition();
  const ref = useRef<HTMLInputElement>(null);
  const enviar = () => start(async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("archivo", file); fd.append("tipo", ctx.tipo); fd.append("descripcion", desc); fd.append("fecha", fecha);
    for (const k of ["documentoId", "actividadId", "comiteId", "eventoId", "inspeccionId", "auditoriaId", "diagnosticoId", "estandarCodigo"] as const) if (ctx[k]) fd.append(k, ctx[k]!);
    const r = await subirArchivo(empresaId, fd);
    if ("error" in r) toast.error(r.error);
    else { toast.success(ctx.tipo === "DOCUMENTO_FIRMADO" ? "Documento firmado guardado" : ctx.actividadId ? "Evidencia guardada; actividad marcada como ejecutada" : "Archivo guardado"); setOpen(false); setFile(null); }
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={(trigger ?? <Button size="sm" variant="outline"><Upload /> {titulo}</Button>) as ReactElement} />
      <DialogContent>
        <DialogHeader><DialogTitle>{titulo}</DialogTitle>{ayuda && <DialogDescription>{ayuda}</DialogDescription>}</DialogHeader>
        <Field>
          <FieldLabel>Archivo</FieldLabel>
          <input ref={ref} type="file" accept={ACEPTA} className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button variant="outline" className={cn("justify-start font-normal", !file && "text-muted-foreground")} onClick={() => ref.current?.click()}><Paperclip /> {file ? `${file.name} · ${tam(file.size)}` : "Elegir archivo…"}</Button>
          <FieldDescription>PDF, foto (JPG, PNG), Word o Excel. Máximo 10 MB. Desde el celular puede tomar la foto directamente.</FieldDescription>
        </Field>
        <Field><FieldLabel htmlFor="adj-d">Descripción</FieldLabel><Input id="adj-d" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ej: Lista de asistencia capacitación en alturas" /></Field>
        <Field><FieldLabel htmlFor="adj-f">Fecha del hecho</FieldLabel><Input id="adj-f" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /><FieldDescription>Fecha de la firma, la capacitación o la reunión (no la de hoy, si es distinta).</FieldDescription></Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          <Button disabled={!file || pend} onClick={enviar}>{pend ? <Spinner /> : <Upload />} Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Lista de archivos con ver, descargar y retirar (sin borrar). */
export function ListaArchivos({ empresaId, archivos, vacio = "Sin archivos.", compacta }: { empresaId: string; archivos: ArchivoUI[]; vacio?: string; compacta?: boolean }) {
  const [verRetirados, setVerRetirados] = useState(false);
  const [, start] = useTransition();
  const activos = archivos.filter((a) => a.activo);
  const retirados = archivos.filter((a) => !a.activo);
  const lista = verRetirados ? archivos : activos;
  return (
    <div className="space-y-1">
      {lista.length === 0 && <p className="text-xs text-muted-foreground">{vacio}</p>}
      <ItemGroup className="gap-1">
        {lista.map((a) => (
          <Item key={a.id} size="sm" variant="outline" className={cn("py-1.5", !a.activo && "opacity-50")}>
            <ItemMedia variant="icon"><Icono mime={a.mime} /></ItemMedia>
            <ItemContent>
              <ItemTitle className="text-xs">{a.descripcion}{a.tipo === "DOCUMENTO_FIRMADO" && a.documentoVersion && <Badge variant="secondary" className="ml-1 text-[10px]">firmado v{a.documentoVersion}</Badge>}{!a.activo && <Badge variant="outline" className="ml-1 text-[10px]">retirado</Badge>}</ItemTitle>
              {!compacta && <ItemDescription className="text-[11px]">{fechaCorta(a.fecha)} · {a.nombreArchivo} · {tam(a.tamano)}{a.subidoPor ? ` · subió ${a.subidoPor}` : ""}</ItemDescription>}
            </ItemContent>
            <ItemActions className="gap-0">
              <Button size="icon-xs" variant="ghost" aria-label="Ver" render={<a href={`/api/archivos/${a.id}`} target="_blank" rel="noreferrer" />}><Eye /></Button>
              <BotonDescarga size="icon-xs" variant="ghost" aria-label="Descargar" href={`/api/archivos/${a.id}?descargar`}><Download /></BotonDescarga>
              {a.activo
                ? <Pedir trigger={<Button size="icon-xs" variant="ghost" aria-label="Retirar" />} titulo="Retirar archivo" descripcion="El archivo no se borra: queda en el historial, porque la norma exige conservar los registros del SG-SST." label="Motivo (por ejemplo: subido por error, reemplazado)" accion="Retirar" onConfirm={(m) => start(async () => { await retirarArchivo(empresaId, a.id, m); toast.success("Archivo retirado (queda en el historial)"); })}><Archive /></Pedir>
                : <Button size="icon-xs" variant="ghost" aria-label="Restaurar" onClick={() => start(async () => { await restaurarArchivo(empresaId, a.id); toast.success("Archivo restaurado"); })}><RotateCcw /></Button>}
            </ItemActions>
          </Item>
        ))}
      </ItemGroup>
      {retirados.length > 0 && <Button size="xs" variant="link" className="px-0" onClick={() => setVerRetirados(!verRetirados)}>{verRetirados ? "Ocultar retirados" : `Ver ${retirados.length} retirado(s)`}</Button>}
    </div>
  );
}

