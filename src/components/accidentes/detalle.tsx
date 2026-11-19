"use client";
import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, FileDown, CheckCircle2, Download, Lock, LockOpen, Pencil, Plus, Save, Sparkles, Trash2, Upload, Users, X, CalendarPlus, ShieldPlus, Wand2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Selector } from "@/components/app/selector";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ayuda } from "@/components/app/ayuda";
import { NormaRef } from "@/components/app/ui";
import { Confirmar, Pedir } from "@/components/app/confirmar";
import { Buscador, type OpcionBuscador } from "@/components/app/buscador";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { SubirArchivo, ListaArchivos, type ArchivoUI } from "@/components/app/adjuntos";
import { EventoForm, type CargoOpcion } from "@/components/accidentes/evento-form";
import { Semaforo } from "@/components/accidentes/lista";
import { TIPOS_EVENTO, GRAVEDAD, JERARQUIA, ROLES_EQUIPO, type Analisis, type Integrante } from "@/lib/eventos";
import type { PlazoUI } from "@/lib/eventos-ui";
import * as A from "@/app/actions/eventos";
import type { SugerenciaInvestigacion } from "@/lib/ia/investigacion";
import type { CatalogoAccidentes } from "@/lib/catalogo-accidentes";
import { Combo } from "@/components/app/combo";

type Accion = { id: string; hallazgo: string; causa: string; tipo: string; jerarquia: string; descripcion: string; responsable: string; fechaLimite: string; estado: string; fechaCierre: string; eficacia: string; enPlan: string };
type Ev = {
  id: string; tipo: string; gravedad: string; datos: A.DatosEvento;
  reporte: { fechaReporte: string; furatNumero: string; reporteMinisterio: string; invRemitidaArl: string };
  inv: { estado: string; inicio: string; cierre: string; equipo: Integrante[]; analisis: Analisis; lecciones: string; peligroId: string };
  acciones: Accion[]; archivos: ArchivoUI[]; plazos: PlazoUI[];
};
type Res = { error?: string } | { ok: true };
const fechaLarga = (f: string) => (f ? new Date(f + "T12:00:00Z").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "");
const hoy = () => new Date().toISOString().slice(0, 10);

function Paso({ n, titulo, descripcion, estado, children, accion, normas }: { n: number; titulo: string; descripcion?: ReactNode; estado?: ReactNode; children: ReactNode; accion?: ReactNode; normas?: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">{n}</span>{titulo}{estado}
        </CardTitle>
        {descripcion && <CardDescription className="flex flex-wrap items-center gap-1.5">{descripcion}{normas?.map((x) => <NormaRef key={x}>{x}</NormaRef>)}</CardDescription>}
        {accion && <CardAction className="flex flex-wrap gap-2">{accion}</CardAction>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

/** Lista editable de textos (causas, porqués). */
function ListaTexto({ items, onChange, placeholder, numerada, sugeridos }: { items: string[]; onChange: (v: string[]) => void; placeholder: string; numerada?: boolean; sugeridos?: string[] }) {
  const xs = items.length ? items : [""];
  const nuevos = (sugeridos ?? []).filter((s) => !items.includes(s));
  return (
    <div className="space-y-1.5">
      {xs.map((t, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {numerada && <span className="w-5 text-right text-xs text-muted-foreground">{i + 1}.</span>}
          <Input value={t} placeholder={placeholder} onChange={(e) => onChange(xs.map((x, j) => (j === i ? e.target.value : x)))} />
          <Button size="icon-sm" variant="ghost" aria-label="Quitar" onClick={() => onChange(xs.filter((_, j) => j !== i))}><X /></Button>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-1.5">
        <Button size="xs" variant="ghost" onClick={() => onChange([...xs, ""])}><Plus /> Agregar</Button>
        {nuevos.map((s) => <Button key={s} size="xs" variant="outline" className="h-auto max-w-full whitespace-normal py-1 text-left font-normal" tooltip="Sugerencia: pulse para agregarla" onClick={() => onChange([...items.filter(Boolean), s])}><Sparkles className="text-violet-600" /> {s}</Button>)}
      </div>
    </div>
  );
}

export function EventoDetalle({ empresaId, ev, cargos, peligros, peligrosEnMatriz, equipoSugerido, responsable, iaActiva, cat, lugares, personas, avisoMatriz }: {
  empresaId: string; ev: Ev; cargos: CargoOpcion[]; peligros: OpcionBuscador[]; peligrosEnMatriz: string[]; equipoSugerido: Integrante[]; responsable: string; iaActiva: boolean; cat: CatalogoAccidentes; lugares: string[]; personas: string[]; avisoMatriz: "obligatorio" | "recomendado" | null;
}) {
  const router = useRouter();
  const [pend, start] = useTransition();
  const run = (fn: () => Promise<Res>, ok: string, despues?: () => void) => start(async () => {
    const r = await fn();
    if ("error" in r && r.error) toast.error(r.error); else { toast.success(ok); despues?.(); router.refresh(); }
  });
  const t = TIPOS_EVENTO[ev.tipo];
  const grave = ev.tipo === "AT" && ev.gravedad !== "leve";
  const cerrada = ev.inv.estado === "cerrada";

  // 1. Registro
  const [datos, setDatos] = useState(ev.datos);
  const cambioDatos = JSON.stringify(datos) !== JSON.stringify(ev.datos);
  // 2. Reporte
  const [rep, setRep] = useState(ev.reporte);
  // 3. Investigación
  const [equipo, setEquipo] = useState<Integrante[]>(ev.inv.equipo.length ? ev.inv.equipo : []);
  const [an, setAn] = useState<Analisis>(ev.inv.analisis);
  const [lecciones, setLecciones] = useState(ev.inv.lecciones);
  const [peligroId, setPeligroId] = useState(ev.inv.peligroId);
  const [sug, setSug] = useState<{ fuente: string; s: SugerenciaInvestigacion } | null>(null);
  const [sugiriendo, startSug] = useTransition();
  // 4. Acciones
  const en30 = () => new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const vacia = () => ({ id: "", hallazgo: "", causa: "", tipo: "correctiva", jerarquia: "administrativo", descripcion: "", responsable, fechaLimite: en30() });
  const [acc, setAcc] = useState<ReturnType<typeof vacia> | null>(null);

  const guardarInv = (msg = "Investigación guardada") => run(() => A.guardarInvestigacion(empresaId, ev.id, { equipo, analisis: an, lecciones, peligroId: peligroId || null }), msg);
  const sugerir = () => startSug(async () => {
    try {
      const r = await A.sugerirAnalisis(empresaId, ev.id);
      setSug({ fuente: r.fuente, s: r.sugerencia });
      if (r.sugerencia.peligro?.id && !peligroId) setPeligroId(r.sugerencia.peligro.id);
      if (!an.porques?.filter(Boolean).length && r.sugerencia.porques.length) setAn((x) => ({ ...x, porques: r.sugerencia.porques }));
      if (!lecciones && r.sugerencia.lecciones) setLecciones(r.sugerencia.lecciones);
      toast.success(r.fuente === "ia" ? "La IA propuso causas y medidas: revíselas y agregue las que apliquen." : "Se propusieron causas y medidas a partir de la matriz del cargo y la forma del evento: revíselas.");
    } catch (e) { toast.error(e instanceof Error ? e.message : "No se pudo sugerir."); }
  });
  const peligroNoEnMatriz = peligroId && !peligrosEnMatriz.includes(peligroId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <Link href={`/empresas/${empresaId}/accidentes`} className={buttonVariants({ variant: "ghost", size: "sm" })}><ArrowLeft /> Accidentes e incidentes</Link>
        <div className="flex-1" />
        {t.investiga && <BotonDescarga href={`/api/empresas/${empresaId}/eventos/${ev.id}/informe`} variant="outline" tooltip="Informe de investigación (FOR-07) en Word con todo lo registrado, listo para firmar por el equipo investigador"><Download /> Informe FOR-07</BotonDescarga>}
        <Confirmar trigger={<Button variant="ghost" aria-label="Eliminar evento"><Trash2 /></Button>} titulo="Eliminar evento" descripcion="Se elimina el registro del evento y deja de contar en los indicadores. Las acciones y los archivos asociados se conservan sin el vínculo. Si fue un error de registro, elimínelo; si el evento ocurrió, no lo elimine: la norma exige conservar el registro." accion="Eliminar" destructivo
          onConfirm={() => start(async () => { await A.eliminarEventoCompleto(empresaId, ev.id); toast.success("Evento eliminado"); router.push(`/empresas/${empresaId}/accidentes`); })} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">{t.t}{ev.tipo !== "AUSENTISMO" && ev.datos.trabajadorNombre ? ` — ${ev.datos.trabajadorNombre}` : ""}</h2>
        {ev.tipo === "AT" && <Badge variant={grave ? "destructive" : "outline"}>{GRAVEDAD[ev.gravedad].t}</Badge>}
        <span className="text-sm text-muted-foreground">{fechaLarga(ev.datos.fecha)}{ev.datos.hora ? `, ${ev.datos.hora}` : ""}{ev.datos.cargo ? ` · ${ev.datos.cargo}` : ""}</span>
        <div className="flex flex-wrap gap-1">{ev.plazos.map((p) => <Semaforo key={p.clave} p={p} />)}</div>
      </div>

      {avisoMatriz && (
        <Alert variant={avisoMatriz === "obligatorio" ? "destructive" : "default"}>
          <AlertTitle>{avisoMatriz === "obligatorio" ? "Accidente mortal: actualice la matriz de peligros" : "Accidente grave: revise la matriz de peligros"}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            {avisoMatriz === "obligatorio" ? "La matriz debe actualizarse y cerrarse una nueva versión después de este evento." : "Revise la valoración y los controles del peligro relacionado y cierre una nueva versión de la matriz."}
            <NormaRef>Decreto 1072/2015 art. 2.2.4.6.15</NormaRef><NormaRef>Res. 0312/2019 estándar 4.1.2</NormaRef>
            <Link href={`/empresas/${empresaId}/matriz`} className={buttonVariants({ size: "sm", variant: "outline" })}>Ir a Cargos y matriz</Link>
          </AlertDescription>
        </Alert>
      )}

      <Paso n={1} titulo="Registro del evento" descripcion="Los datos que pide el FURAT y la investigación. Sin diagnósticos médicos (dato sensible)." normas={["Ley 1581/2012"]}
        accion={cambioDatos && <Button size="sm" disabled={pend} onClick={() => run(() => A.actualizarEvento(empresaId, ev.id, datos), "Registro actualizado")}><Save /> Guardar registro</Button>}>
        <EventoForm d={datos} set={setDatos} cargos={cargos} cat={cat} lugares={lugares} />
        {cambioDatos && <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setDatos(ev.datos)}>Descartar</Button><Button disabled={pend} onClick={() => run(() => A.actualizarEvento(empresaId, ev.id, datos), "Registro actualizado")}>{pend ? <Spinner /> : <Save />} Guardar registro</Button></div>}
      </Paso>

      {(t.reporta || grave) && (
        <Paso n={2} titulo={ev.tipo === "EL" ? "Reporte FUREL" : "Reporte a la ARL y autoridades"} descripcion="Dentro de los dos días hábiles siguientes. Guarde la fecha de radicado y suba el soporte." normas={["Decreto Ley 1295/1994 art. 62"]}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field><FieldLabel htmlFor="r-f" className="flex items-center gap-1">Fecha de radicado {ev.tipo === "EL" ? "FUREL" : "FURAT"} <Ayuda k="evFurat" /></FieldLabel><Input id="r-f" type="date" value={rep.fechaReporte} onChange={(e) => setRep({ ...rep, fechaReporte: e.target.value })} /></Field>
            <Field><FieldLabel htmlFor="r-n">Número de radicado</FieldLabel><Input id="r-n" value={rep.furatNumero} onChange={(e) => setRep({ ...rep, furatNumero: e.target.value })} /></Field>
            {grave && <Field><FieldLabel htmlFor="r-m">Aviso al Ministerio del Trabajo</FieldLabel><Input id="r-m" type="date" value={rep.reporteMinisterio} onChange={(e) => setRep({ ...rep, reporteMinisterio: e.target.value })} /><FieldDescription>Accidente {GRAVEDAD[ev.gravedad].t.toLowerCase()} (ver PRC-08).</FieldDescription></Field>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button disabled={pend} onClick={() => run(() => A.guardarReporte(empresaId, ev.id, rep), "Reporte guardado")}><Save /> Guardar reporte</Button>
            <SubirArchivo empresaId={empresaId} ctx={{ tipo: "EVIDENCIA", eventoId: ev.id, estandarCodigo: "3.2.1" }} titulo={`Subir ${ev.tipo === "EL" ? "FUREL" : "FURAT"} radicado`} descripcionInicial={`${ev.tipo === "EL" ? "FUREL" : "FURAT"} radicado`} ayuda="El PDF o la captura del formulario radicado en la ARL. Queda como soporte del estándar 3.2.1." />
          </div>
        </Paso>
      )}

      {t.investiga && (
        <Paso n={(t.reporta || grave) ? 3 : 2} titulo="Investigación"
          estado={<Badge variant={cerrada ? "default" : "outline"}>{cerrada ? `Cerrada el ${fechaLarga(ev.inv.cierre)}` : ev.inv.estado === "en_curso" ? "En curso" : "Sin iniciar"}</Badge>}
          descripcion="Dentro de los quince días siguientes al evento, con el equipo investigador. Identifique causas inmediatas y básicas y defina medidas." normas={["Res. 1401/2007", "Decreto 1072/2015 art. 2.2.4.6.32"]}
          accion={<Button size="sm" variant="outline" disabled={sugiriendo || cerrada} onClick={sugerir} tooltip={iaActiva ? "La IA analiza el relato y la matriz de peligros del cargo y propone causas y medidas; usted decide qué usar" : "Propone causas típicas según la forma del evento y medidas tomadas de la matriz de peligros del cargo"}>{sugiriendo ? <Spinner /> : <Sparkles />} {iaActiva ? "Sugerir con IA" : "Sugerir causas y medidas"}</Button>}>
          {sug && <Alert><Wand2 /><AlertTitle>Sugerencias {sug.fuente === "ia" ? "de la IA" : "de la biblioteca"}</AlertTitle><AlertDescription>Aparecen como botones morados debajo de cada lista y como medidas propuestas en el paso de acciones. Nada se guarda hasta que usted lo agregue y pulse Guardar.</AlertDescription></Alert>}

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium"><Users className="size-4" /> Equipo investigador <Ayuda k="evEquipo" /></div>
            {equipo.length === 0 ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                Aún no hay equipo.
                <Button size="sm" variant="outline" disabled={cerrada} onClick={() => setEquipo(equipoSugerido)}><Wand2 /> Proponer equipo</Button>
                <span className="text-xs">Toma al responsable del SG-SST ({responsable || "sin registrar"}) y al COPASST o Vigía registrados.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {equipo.map((m, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_14rem_auto] items-center gap-1.5">
                    <Input value={m.nombre} placeholder="Nombre" disabled={cerrada} onChange={(e) => setEquipo(equipo.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} />
                    <Input value={m.cargo ?? ""} placeholder="Cargo" disabled={cerrada} onChange={(e) => setEquipo(equipo.map((x, j) => (j === i ? { ...x, cargo: e.target.value } : x)))} />
                    <Selector value={m.rol} disabled={cerrada} onChange={(v) => setEquipo(equipo.map((x, j) => (j === i ? { ...x, rol: v } : x)))} opciones={Object.entries(ROLES_EQUIPO).map(([k, r]) => ({ valor: k, etiqueta: r }))} />
                    <Button size="icon-sm" variant="ghost" aria-label="Quitar del equipo" disabled={cerrada} onClick={() => setEquipo(equipo.filter((_, j) => j !== i))}><X /></Button>
                  </div>
                ))}
                {!cerrada && <Button size="xs" variant="ghost" onClick={() => setEquipo([...equipo, { nombre: "", cargo: "", rol: "otro" }])}><Plus /> Agregar integrante</Button>}
                {grave && !equipo.some((x) => x.rol === "profesional") && <p className="text-xs text-amber-700">Accidente {GRAVEDAD[ev.gravedad].t.toLowerCase()}: incluya un profesional con licencia en SST (Res. 1401/2007).</p>}
              </div>
            )}
          </div>

          <fieldset disabled={cerrada} className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2 lg:col-span-2">
              <div className="flex items-center gap-1 text-sm font-medium">Análisis de los porqués <Ayuda k="evPorques" /></div>
              <ListaTexto numerada items={an.porques ?? []} onChange={(v) => setAn({ ...an, porques: v })} placeholder="Ej: ¿Por qué se cortó? Porque la cuchilla no tenía guarda" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">Causas inmediatas: actos subestándar <Ayuda k="evInmediatas" /></div>
              <ListaTexto items={an.actos ?? []} onChange={(v) => setAn({ ...an, actos: v })} placeholder="Lo que hizo o dejó de hacer la persona" sugeridos={sug?.s.actos} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">Causas inmediatas: condiciones subestándar <Ayuda k="evInmediatas" /></div>
              <ListaTexto items={an.condiciones ?? []} onChange={(v) => setAn({ ...an, condiciones: v })} placeholder="Estado del lugar, equipo o ambiente" sugeridos={sug?.s.condiciones} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">Causas básicas: factores personales <Ayuda k="evBasicas" /></div>
              <ListaTexto items={an.personales ?? []} onChange={(v) => setAn({ ...an, personales: v })} placeholder="Capacidad, conocimiento, motivación, fatiga…" sugeridos={sug?.s.personales} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">Causas básicas: factores del trabajo <Ayuda k="evBasicas" /></div>
              <ListaTexto items={an.trabajo ?? []} onChange={(v) => setAn({ ...an, trabajo: v })} placeholder="Supervisión, procedimientos, mantenimiento, compras…" sugeridos={sug?.s.trabajo} />
            </div>
            <Field className="lg:col-span-2"><FieldLabel htmlFor="i-c">Conclusión</FieldLabel><Textarea id="i-c" rows={2} value={an.conclusion ?? ""} onChange={(e) => setAn({ ...an, conclusion: e.target.value })} /></Field>
          </fieldset>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium">Peligro relacionado (matriz GTC 45) <Ayuda k="evPeligro" /></div>
              <Buscador opciones={peligros} value={peligroId} onSelect={setPeligroId} placeholder="Buscar peligro…" textoBoton={peligros.find((p) => p.valor === peligroId)?.etiqueta ?? "Seleccionar peligro"} className="w-full justify-start" ancho="w-[34rem]" />
              {peligroId && (peligroNoEnMatriz
                ? <div className="flex flex-wrap items-center gap-2 text-xs text-amber-700">Este peligro no está en la matriz del cargo.
                    <Button size="xs" variant="outline" disabled={pend || !datos.cargoId} onClick={() => start(async () => { await A.guardarInvestigacion(empresaId, ev.id, { equipo, analisis: an, lecciones, peligroId }); const r = await A.agregarPeligroDelEvento(empresaId, ev.id); if ("error" in r && r.error) toast.error(r.error); else { toast.success("Peligro agregado a la matriz como sugerido; valórelo en Cargos y matriz"); router.refresh(); } })}><ShieldPlus /> Agregar a la matriz</Button></div>
                : <p className="text-xs text-muted-foreground">Ya está en la matriz del cargo: revise su valoración y sus controles en <Link className="underline" href={`/empresas/${empresaId}/matriz`}>Cargos y matriz</Link>.</p>)}
            </div>
            <Field><FieldLabel htmlFor="i-l" className="flex items-center gap-1">Lecciones aprendidas <Ayuda k="evLecciones" /></FieldLabel><Textarea id="i-l" rows={3} disabled={cerrada} value={lecciones} onChange={(e) => setLecciones(e.target.value)} /></Field>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t pt-4">
            {!cerrada && <Button disabled={pend} onClick={() => guardarInv()}>{pend ? <Spinner /> : <Save />} Guardar investigación</Button>}
            {!cerrada && <Pedir trigger={<Button variant="outline"><Lock /> Cerrar investigación</Button>} titulo="Cerrar investigación" descripcion="Se verifica que haya equipo, causas inmediatas y básicas, y al menos una medida. Escriba la fecha de cierre (AAAA-MM-DD)." label="Fecha de cierre" inicial={hoy()} accion="Cerrar"
              onConfirm={(f) => start(async () => { await A.guardarInvestigacion(empresaId, ev.id, { equipo, analisis: an, lecciones, peligroId: peligroId || null }); const r = await A.cerrarInvestigacion(empresaId, ev.id, f); if ("error" in r && r.error) toast.error(r.error); else { toast.success("Investigación cerrada. Descargue el informe FOR-07 para firmarlo."); router.refresh(); } })} />}
            {cerrada && <Button variant="outline" disabled={pend} onClick={() => run(() => A.reabrirInvestigacion(empresaId, ev.id), "Investigación reabierta")}><LockOpen /> Reabrir</Button>}
          </div>
        </Paso>
      )}

      {t.investiga && (
        <Paso n={(t.reporta || grave) ? 4 : 3} titulo="Medidas de control y acciones" descripcion="Cada medida con responsable y fecha, según la jerarquía de controles. Se registran en FOR-06 y se pueden llevar al plan anual." normas={["Decreto 1072/2015 arts. 2.2.4.6.24 y 2.2.4.6.33"]}
          accion={<Button size="sm" onClick={() => setAcc({ ...vacia(), hallazgo: datos.mecanismo ? `${datos.mecanismo} — ${datos.cargo ?? ""}` : "Hallazgo de la investigación" })}><Plus /> Agregar acción</Button>}>
          {sug && sug.s.acciones.length > 0 && (
            <div className="space-y-1.5 rounded-lg border border-violet-200 bg-violet-50/50 p-3">
              <div className="text-sm font-medium">Medidas propuestas</div>
              {sug.s.acciones.map((a, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline">{JERARQUIA[a.jerarquia]}</Badge><span className="flex-1">{a.descripcion}</span>
                  <Button size="xs" variant="outline" onClick={() => setAcc({ ...vacia(), hallazgo: datos.mecanismo ? `${datos.mecanismo}${datos.cargo ? ` — ${datos.cargo}` : ""}` : "Hallazgo de la investigación", causa: [...(an.trabajo ?? []), ...(an.personales ?? [])][0] ?? "", tipo: a.tipo, jerarquia: a.jerarquia, descripcion: a.descripcion })}><Plus /> Usar</Button>
                </div>
              ))}
            </div>
          )}
          {ev.acciones.length === 0 ? <p className="text-sm text-muted-foreground">Sin acciones. Para cerrar la investigación se necesita al menos una.</p> : (
            <Table className="[&_td]:align-top [&_td]:whitespace-normal">
              <TableHeader><TableRow><TableHead>Medida</TableHead><TableHead>Jerarquía</TableHead><TableHead>Responsable</TableHead><TableHead>Fecha límite</TableHead><TableHead>Estado</TableHead><TableHead className="w-40" /></TableRow></TableHeader>
              <TableBody>
                {ev.acciones.map((a) => {
                  const vencida = a.estado === "abierta" && a.fechaLimite && a.fechaLimite < hoy();
                  return (
                    <TableRow key={a.id}>
                      <TableCell><div>{a.descripcion}</div><div className="text-xs text-muted-foreground">{a.tipo}{a.causa ? ` · causa: ${a.causa}` : ""}</div>{a.eficacia && <div className="mt-1 text-xs text-emerald-700">Eficacia: {a.eficacia}</div>}</TableCell>
                      <TableCell>{JERARQUIA[a.jerarquia] ?? "—"}</TableCell>
                      <TableCell>{a.responsable || "—"}</TableCell>
                      <TableCell className={vencida ? "text-destructive" : ""}>{a.fechaLimite ? fechaLarga(a.fechaLimite) : "—"}{vencida && <div className="text-xs">Vencida</div>}</TableCell>
                      <TableCell><Badge variant={a.estado === "cerrada" ? "default" : "outline"}>{a.estado === "cerrada" ? `Cerrada ${fechaLarga(a.fechaCierre)}` : "Abierta"}</Badge>{a.enPlan && <div className="mt-1 text-xs text-muted-foreground">En plan anual ({a.enPlan})</div>}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-0.5">
                          {a.estado === "abierta" && <Pedir trigger={<Button size="icon-sm" variant="ghost" aria-label="Cerrar acción y verificar eficacia" />} titulo="Cerrar acción" descripcion="Describa cómo verificó que la acción funcionó: inspección, medición, seguimiento sin repetición del evento." label="Verificación de eficacia" accion="Cerrar acción" onConfirm={(v) => run(() => A.cerrarAccion(empresaId, a.id, { fechaCierre: hoy(), eficacia: v }), "Acción cerrada")}><CheckCircle2 /></Pedir>}
                          {!a.enPlan && a.estado === "abierta" && <Button size="icon-sm" variant="ghost" aria-label="Llevar al plan anual de trabajo" disabled={pend} onClick={() => run(() => A.enviarAccionAlPlan(empresaId, a.id), "Acción agregada al plan anual")}><CalendarPlus /></Button>}
                          <Button size="icon-sm" variant="ghost" aria-label="Editar acción" onClick={() => setAcc({ id: a.id, hallazgo: a.hallazgo, causa: a.causa, tipo: a.tipo, jerarquia: a.jerarquia, descripcion: a.descripcion, responsable: a.responsable, fechaLimite: a.fechaLimite })}><Pencil /></Button>
                          <Confirmar trigger={<Button size="icon-sm" variant="ghost" aria-label="Eliminar acción" />} titulo="Eliminar acción" descripcion="Se quita del registro FOR-06." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarAccion(empresaId, a.id), "Acción eliminada")}><Trash2 /></Confirmar>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Paso>
      )}

      <Paso n={t.investiga ? ((t.reporta || grave) ? 5 : 4) : (t.reporta || grave) ? 3 : 2} titulo="Informe y soportes" descripcion="Descargue el informe, hágalo firmar por el equipo investigador y súbalo. Todo queda en Evidencias, en el estándar que corresponde." normas={["Res. 0312/2019 estándares 3.2.1 y 3.2.2"]}
        accion={t.investiga && <><BotonDescarga href={`/api/empresas/${empresaId}/eventos/${ev.id}/informe`} size="sm" tooltip="Informe de investigación (FOR-07) en Word"><Download /> FOR-07 Word</BotonDescarga><BotonDescarga href={`/api/empresas/${empresaId}/eventos/${ev.id}/informe?formato=pdf`} size="sm" variant="outline" texto="Generando PDF…" tooltip="Informe de investigación (FOR-07) en PDF"><FileDown /> PDF</BotonDescarga></>}>
        {grave && cerrada && (
          <div className="flex flex-wrap items-end gap-2">
            <Field className="w-56"><FieldLabel htmlFor="r-a">Fecha de remisión del informe a la ARL</FieldLabel><Input id="r-a" type="date" value={rep.invRemitidaArl} onChange={(e) => setRep({ ...rep, invRemitidaArl: e.target.value })} /></Field>
            <Button variant="outline" disabled={pend} onClick={() => run(() => A.guardarReporte(empresaId, ev.id, rep), "Remisión guardada")}><Check /> Guardar</Button>
            <span className="pb-2 text-xs text-muted-foreground">Accidente {GRAVEDAD[ev.gravedad].t.toLowerCase()}: dentro de los 15 días siguientes al evento.</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {t.investiga && <SubirArchivo empresaId={empresaId} ctx={{ tipo: "EVIDENCIA", eventoId: ev.id, estandarCodigo: "3.2.2" }} titulo="Subir informe firmado" trigger={<Button><Upload /> Subir informe firmado</Button>} descripcionInicial="FOR-07 Informe de investigación firmado" ayuda="El informe FOR-07 firmado por el equipo investigador. Soporte del estándar 3.2.2." />}
          <SubirArchivo empresaId={empresaId} ctx={{ tipo: "EVIDENCIA", eventoId: ev.id, estandarCodigo: t.investiga ? "3.2.2" : "3.2.3" }} titulo="Subir otro soporte" descripcionInicial="" ayuda="Fotos del sitio, declaraciones de testigos, incapacidad, socialización de la lección aprendida…" />
        </div>
        <ListaArchivos empresaId={empresaId} archivos={ev.archivos} vacio="Sin soportes todavía." />
      </Paso>

      <Dialog open={!!acc} onOpenChange={(o) => !o && setAcc(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{acc?.id ? "Editar acción" : "Nueva acción"}</DialogTitle><DialogDescription>Se registra en el formato de acciones correctivas, preventivas y de mejora (FOR-06).</DialogDescription></DialogHeader>
          {acc && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2"><FieldLabel htmlFor="a-d">Medida</FieldLabel><Textarea id="a-d" rows={2} value={acc.descripcion} onChange={(e) => setAcc({ ...acc, descripcion: e.target.value })} /></Field>
              <Field className="sm:col-span-2"><FieldLabel htmlFor="a-h">Hallazgo</FieldLabel><Input id="a-h" value={acc.hallazgo} onChange={(e) => setAcc({ ...acc, hallazgo: e.target.value })} /></Field>
              <Field className="sm:col-span-2"><FieldLabel htmlFor="a-c">Causa que ataca</FieldLabel><Combo id="a-c" value={acc.causa} onChange={(v) => setAcc({ ...acc, causa: v })} grupos={(() => {
                const forma = cat.formas.find((f) => f.nombre === datos.mecanismo);
                const propias = [...(an.personales ?? []), ...(an.trabajo ?? []), ...(an.actos ?? []), ...(an.condiciones ?? [])].filter(Boolean);
                const tipicas = forma ? [...forma.personales, ...forma.trabajo, ...forma.actos, ...forma.condiciones].filter((c) => !propias.includes(c)) : [];
                return [
                  { titulo: "Causas de esta investigación", opciones: propias.map((c) => ({ valor: c })) },
                  { titulo: forma ? `Típicas de “${forma.nombre}” (Biblioteca)` : "Elija la forma del evento en el registro para ver causas típicas", opciones: tipicas.map((c) => ({ valor: c })) },
                ];
              })()} /></Field>
              <Field><FieldLabel htmlFor="a-t">Tipo</FieldLabel><Selector id="a-t" value={acc.tipo} onChange={(v) => setAcc({ ...acc, tipo: v })} opciones={[{ valor: "correctiva", etiqueta: "Correctiva" }, { valor: "preventiva", etiqueta: "Preventiva" }, { valor: "mejora", etiqueta: "De mejora" }]} /></Field>
              <Field><FieldLabel htmlFor="a-j" className="flex items-center gap-1">Jerarquía <Ayuda k="evJerarquia" /></FieldLabel><Selector id="a-j" value={acc.jerarquia} onChange={(v) => setAcc({ ...acc, jerarquia: v })} opciones={Object.entries(JERARQUIA).map(([k, v]) => ({ valor: k, etiqueta: v }))} /></Field>
              <Field><FieldLabel htmlFor="a-r">Responsable</FieldLabel><Combo id="a-r" value={acc.responsable} onChange={(v) => setAcc({ ...acc, responsable: v })} grupos={[{ titulo: "Personas registradas", opciones: personas.map((p) => ({ valor: p })) }]} /></Field>
              <Field><FieldLabel htmlFor="a-f">Fecha límite</FieldLabel><Input id="a-f" type="date" value={acc.fechaLimite} onChange={(e) => setAcc({ ...acc, fechaLimite: e.target.value })} /></Field>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcc(null)}>Cancelar</Button>
            <Button disabled={pend || !acc?.descripcion.trim()} onClick={() => acc && run(() => A.guardarAccion(empresaId, { ...acc, id: acc.id || undefined, eventoId: ev.id }), acc.id ? "Acción actualizada" : "Acción agregada", () => setAcc(null))}>{pend ? <Spinner /> : <Save />} Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
