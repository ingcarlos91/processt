"use client";
import { hoyLocal } from "@/lib/utils";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, SearchCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel } from "@/components/ui/field";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pedir } from "@/components/app/confirmar";
import { actualizarCausaAccion, cerrarAccion } from "@/app/actions/eventos";

export type AccionUI = { id: string; descripcion: string; estado: string; responsable: string; fechaLimite: string; causa?: string; hallazgo?: string };
const fecha = (iso: string) => (iso ? new Date(iso + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "");

/** Acción de FOR-06 con su causa raíz y cierre con verificación de eficacia (Decreto 1072/2015 art. 2.2.4.6.33). */
export function FilaAccion({ empresaId, a, conHallazgo }: { empresaId: string; a: AccionUI; conHallazgo?: boolean }) {
  const router = useRouter();
  const [pend, start] = useTransition();
  const [abierto, setAbierto] = useState(false);
  const [cierre, setCierre] = useState(() => hoyLocal());
  const [eficacia, setEficacia] = useState("");
  const abierta = a.estado !== "cerrada";
  return (
    <div className="flex flex-wrap items-start gap-2 rounded-md border p-2 text-sm">
      <Badge variant={abierta ? "outline" : "default"}>{abierta ? "Abierta" : "Cerrada"}</Badge>
      <div className="min-w-0 flex-1">
        <div>{a.descripcion}</div>
        <div className="text-xs text-muted-foreground">{[conHallazgo ? a.hallazgo : "", a.responsable, a.fechaLimite ? `límite ${fecha(a.fechaLimite)}` : ""].filter(Boolean).join(" · ")}</div>
        <div className="text-xs">{a.causa ? <><span className="text-muted-foreground">Causa raíz:</span> {a.causa}</> : <span className="text-amber-700">Sin causa raíz</span>}</div>
      </div>
      {abierta && (
        <div className="flex gap-1">
          <Pedir trigger={<Button size="xs" variant="outline" disabled={pend} />} titulo="Causa raíz" descripcion="Por qué ocurrió el hallazgo: la causa de fondo que la acción debe eliminar." label="Causa raíz" placeholder="Describa la causa de fondo del hallazgo" inicial={a.causa ?? ""} accion="Guardar"
            onConfirm={(v) => start(async () => { const r = await actualizarCausaAccion(empresaId, a.id, v); if ("error" in r) toast.error(r.error); else { toast.success("Causa raíz guardada"); router.refresh(); } })}><SearchCheck /> Causa</Pedir>
          <Dialog open={abierto} onOpenChange={setAbierto}>
            <DialogTrigger render={<Button size="xs" variant="outline" disabled={pend} />}><CheckCircle2 /> Cerrar</DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cerrar acción</DialogTitle><DialogDescription>Registre cuándo se cerró y cómo se verificó que la acción fue eficaz.</DialogDescription></DialogHeader>
              <Field><FieldLabel htmlFor={`c-${a.id}`}>Fecha de cierre</FieldLabel><Input id={`c-${a.id}`} type="date" className="w-48" value={cierre} onChange={(e) => setCierre(e.target.value)} /></Field>
              <Field><FieldLabel htmlFor={`e-${a.id}`}>Verificación de eficacia</FieldLabel><Textarea id={`e-${a.id}`} rows={3} value={eficacia} placeholder="Ej.: inspección de seguimiento del 10/12 sin hallazgos repetidos." onChange={(e) => setEficacia(e.target.value)} /></Field>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
                <Button disabled={!eficacia.trim() || pend} onClick={() => start(async () => { const r = await cerrarAccion(empresaId, a.id, { fechaCierre: cierre, eficacia }); if (r && "error" in r && r.error) toast.error(r.error); else { setAbierto(false); toast.success("Acción cerrada"); router.refresh(); } })}>Cerrar acción</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
