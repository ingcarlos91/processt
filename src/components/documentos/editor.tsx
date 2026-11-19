"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowLeft, Download, PenLine, RefreshCw, RotateCcw, Check, Save } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { NormaRef } from "@/components/app/ui";
import * as A from "@/app/actions/sgsst";

type Sec = { id: string; titulo: string; generado: string; editado: string | null; revisar: boolean; html: string };

export function DocumentoEditor({ empresaId, doc, normas, secciones }: {
  empresaId: string; doc: { id: string; codigo: string; nombre: string; version: number; estado: string; generadoEn: string; estandares: string[] }; normas: string[]; secciones: Sec[];
}) {
  const [pend, start] = useTransition();
  const run = (fn: () => Promise<unknown>, ok?: string) => start(async () => { await fn(); if (ok) toast.success(ok); });
  return (
    <div className="space-y-4 max-w-5xl">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/empresas/${empresaId}/documentos`} className={buttonVariants({ variant: "ghost", size: "sm" })}><ArrowLeft /> Documentos</Link>
        <div className="flex-1" />
        <NativeSelect value={doc.estado} onChange={(e) => run(() => A.cambiarEstadoDocumento(empresaId, doc.id, e.target.value as "BORRADOR"), "Estado actualizado")}>
          <NativeSelectOption value="BORRADOR">Borrador</NativeSelectOption><NativeSelectOption value="APROBADO">Aprobado</NativeSelectOption><NativeSelectOption value="FIRMADO">Firmado</NativeSelectOption>
        </NativeSelect>
        <Button variant="outline" disabled={pend} onClick={() => run(() => A.regenerarDocumento(empresaId, doc.codigo), "Documento regenerado con los datos actuales")}><RefreshCw /> Regenerar</Button>
        <a href={`/api/empresas/${empresaId}/documentos/${doc.codigo}`} className={buttonVariants()}><Download /> Word</a>
      </div>
      <Card>
        <CardHeader>
          <CardDescription className="font-mono">{doc.codigo} · versión {doc.version} · generado {new Date(doc.generadoEn).toLocaleString("es-CO")}</CardDescription>
          <CardTitle className="text-xl">{doc.nombre}</CardTitle>
          <div className="flex flex-wrap gap-1 pt-1">{doc.estandares.map((e) => <Badge key={e} variant="outline">Estándar {e}</Badge>)}{normas.map((n) => <NormaRef key={n}>{n}</NormaRef>)}</div>
        </CardHeader>
      </Card>
      {secciones.map((s) => <Seccion key={s.id} s={s} empresaId={empresaId} run={run} pend={pend} />)}
    </div>
  );
}

function Seccion({ s, empresaId, run, pend }: { s: Sec; empresaId: string; run: (fn: () => Promise<unknown>, ok?: string) => void; pend: boolean }) {
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState(s.editado ?? s.generado);
  return (
    <Card>
      {s.titulo && (
        <CardHeader>
          <CardTitle>{s.titulo}</CardTitle>
          {s.editado && <CardDescription><Badge variant="secondary">Editado manualmente</Badge></CardDescription>}
          <CardAction className="flex gap-1">
            {!editando && <Button size="sm" variant="ghost" onClick={() => { setTexto(s.editado ?? s.generado); setEditando(true); }}><PenLine /> Editar</Button>}
            {s.editado && !editando && <Button size="sm" variant="ghost" disabled={pend} onClick={() => run(() => A.restaurarSeccion(empresaId, s.id), "Se restauró el texto generado")}><RotateCcw /> Restaurar generado</Button>}
          </CardAction>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {s.revisar && (
          <Alert variant="destructive">
            <AlertTitle>El texto generado cambió</AlertTitle>
            <AlertDescription>Los datos de la empresa cambiaron después de su edición. Compare y decida si conserva su versión o restaura la generada.</AlertDescription>
            <AlertAction><Button size="xs" variant="outline" onClick={() => run(() => A.marcarRevisada(empresaId, s.id), "Marcada como revisada")}><Check /> Conservar mi versión</Button></AlertAction>
          </Alert>
        )}
        {editando ? (
          <div className="space-y-2">
            <Textarea className="font-mono text-xs min-h-64" value={texto} onChange={(e) => setTexto(e.target.value)} />
            <div className="flex gap-2">
              <Button size="sm" disabled={pend} onClick={() => { run(() => A.guardarSeccion(empresaId, s.id, texto), "Sección guardada"); setEditando(false); }}><Save /> Guardar</Button>
              <Button size="sm" variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
            </div>
            <p className="text-xs text-muted-foreground">Formato Markdown: **negrita**, listas con “-” o “1.”, tablas con “|”.</p>
          </div>
        ) : (
          <div className="prose-doc" dangerouslySetInnerHTML={{ __html: s.html }} />
        )}
      </CardContent>
    </Card>
  );
}
