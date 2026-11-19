"use client";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ClipboardPaste, GraduationCap, HardHat, Pencil, Plus, Search, Stethoscope, Trash2, UserMinus, UserPlus, UserCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Selector } from "@/components/app/selector";
import { Combo } from "@/components/app/combo";
import { Confirmar, Pedir } from "@/components/app/confirmar";
import { CampoDocumento } from "@/components/app/campo-documento";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { Tip } from "@/components/app/tip";
import { abrevDoc } from "@/lib/documento-identidad";
import * as A from "@/app/actions/trabajadores";
import { cn } from "@/lib/utils";

type Examen = { id: string; tipo: string; fecha: string; ips: string; concepto: string; restricciones: string; comunicadoTrabajador: string; proximo: string };
type Entrega = { id: string; fecha: string; elemento: string; cantidad: number; tipo: string; capacitado: boolean; proximaReposicion: string };
type T = { id: string; nombres: string; tipoDoc: string; documento: string; cargoId: string; cargo: string; vinculacion: string; fechaIngreso: string; fechaRetiro: string; activo: boolean; sexo: string; fechaNacimiento: string; escolaridad: string; telefono: string; correo: string; eps: string; afp: string; examenes: Examen[]; entregas: Entrega[]; capacitaciones: number };
type Cap = { id: string; fecha: string; tema: string; horas: number; facilitador: string; modalidad: string; actividadId: string; actividad: string; asistentes: string[] };
type Res = { error?: string } | { ok: true };

const VINC: Record<string, string> = { planta: "Planta", contratista: "Contratista", aprendiz: "Aprendiz", mision: "En misión" };
const TIPO_EX: Record<string, string> = { ingreso: "Ingreso", periodico: "Periódico", retiro: "Retiro", post_incapacidad: "Post incapacidad", cambio_ocupacion: "Cambio de ocupación" };
const CONCEPTO: Record<string, { t: string; c: string }> = { apto: { t: "Apto", c: "border-emerald-300 bg-emerald-50 text-emerald-700" }, apto_restricciones: { t: "Apto con restricciones", c: "border-amber-300 bg-amber-50 text-amber-800" }, aplazado: { t: "Aplazado", c: "border-slate-300 text-slate-700" }, no_apto: { t: "No apto", c: "border-red-300 bg-red-50 text-red-700" } };
const ESCOLARIDAD = ["Primaria", "Bachillerato", "Técnico", "Tecnólogo", "Profesional", "Posgrado", "Ninguna"];
const hoy = () => new Date().toISOString().slice(0, 10);
const enAnios = (f: string, n: number) => { const d = new Date(f + "T12:00:00Z"); d.setUTCFullYear(d.getUTCFullYear() + n); return d.toISOString().slice(0, 10); };
const fecha = (f: string) => (f ? new Date(f + "T12:00:00Z").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");
const vacioT = (): Omit<T, "id" | "examenes" | "entregas" | "capacitaciones" | "cargo" | "activo" | "fechaRetiro"> & { id?: string } => ({ nombres: "", tipoDoc: "CC", documento: "", cargoId: "", vinculacion: "planta", fechaIngreso: "", sexo: "", fechaNacimiento: "", escolaridad: "", telefono: "", correo: "", eps: "", afp: "" });

export function TrabajadoresEditor({ empresaId, trabajadores, cargos, sugeridos, catalogoEpp, catalogoCapacitaciones, actividades, capacitaciones }: {
  empresaId: string; trabajadores: T[]; cargos: { id: string; nombre: string; nPersonas: number }[]; sugeridos: Record<string, { epp: string[]; capacitaciones: string[] }>;
  catalogoEpp: string[]; catalogoCapacitaciones: string[]; actividades: { id: string; nombre: string; periodo: string }[]; capacitaciones: Cap[];
}) {
  const [pend, start] = useTransition();
  const run = (fn: () => Promise<Res>, ok: string, despues?: () => void) => start(async () => { const r = await fn(); if ("error" in r && r.error) toast.error(r.error); else { toast.success(ok); despues?.(); } });
  const [q, setQ] = useState("");
  const [verRetirados, setVerRetirados] = useState(false);
  const [form, setForm] = useState<ReturnType<typeof vacioT> | null>(null);
  const [importar, setImportar] = useState<string | null>(null);
  const [ficha, setFicha] = useState<string | null>(null);
  const [examen, setExamen] = useState<(Omit<Examen, "id"> & { id?: string; trabajadorId: string }) | null>(null);
  const [entrega, setEntrega] = useState<{ trabajadorIds: string[]; fecha: string; elementos: string[]; cantidad: number; tipo: string; capacitado: boolean; proximaReposicion: string } | null>(null);
  const [cap, setCap] = useState<(Omit<Cap, "id" | "actividad"> & { id?: string }) | null>(null);

  const activos = trabajadores.filter((t) => t.activo);
  const lista = useMemo(() => trabajadores.filter((t) => (verRetirados || t.activo) && (!q || `${t.nombres} ${t.documento} ${t.cargo}`.toLowerCase().includes(q.toLowerCase()))), [trabajadores, q, verRetirados]);
  const tFicha = trabajadores.find((t) => t.id === ficha);
  const ultimoEx = (t: T) => t.examenes[0];
  const vencido = (f: string) => !!f && f < hoy();
  const examenesVencidos = activos.filter((t) => { const x = ultimoEx(t); return !x || vencido(x.proximo); }).length;
  const capacitados = activos.filter((t) => t.capacitaciones > 0).length;
  const nombre = (id: string) => trabajadores.find((t) => t.id === id)?.nombres ?? "";
  const totalCargos = cargos.reduce((s, c) => s + c.nPersonas, 0);

  const abrirExamen = (trabajadorId: string, x?: Examen) => setExamen(x ? { ...x, trabajadorId } : { trabajadorId, tipo: "periodico", fecha: hoy(), ips: "", concepto: "apto", restricciones: "", comunicadoTrabajador: "", proximo: enAnios(hoy(), 1) });
  const abrirEntrega = (ids: string[]) => {
    const t = trabajadores.find((x) => x.id === ids[0]);
    setEntrega({ trabajadorIds: ids, fecha: hoy(), elementos: ids.length === 1 && t?.cargoId ? sugeridos[t.cargoId]?.epp ?? [] : [], cantidad: 1, tipo: "dotacion", capacitado: true, proximaReposicion: "" });
  };

  return (
    <Tabs defaultValue="trabajadores">
      <div className="flex flex-wrap items-center gap-2">
        <TabsList>
          <TabsTrigger value="trabajadores"><Users /> Trabajadores ({activos.length})</TabsTrigger>
          <TabsTrigger value="examenes"><Stethoscope /> Exámenes médicos</TabsTrigger>
          <TabsTrigger value="epp"><HardHat /> Entrega de EPP</TabsTrigger>
          <TabsTrigger value="capacitaciones"><GraduationCap /> Capacitaciones ({capacitaciones.length})</TabsTrigger>
        </TabsList>
        <div className="flex-1" />
        <NormaRef>Ley 1581/2012</NormaRef><NormaRef>Res. 1843/2025</NormaRef><NormaRef>Decreto 1072/2015 art. 2.2.4.6.11</NormaRef>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Trabajadores activos" value={activos.length} hint={totalCargos && totalCargos !== activos.length ? `Los cargos suman ${totalCargos} personas` : "Coincide con los cargos"} tone={totalCargos && totalCargos !== activos.length ? "warn" : undefined} />
        <Stat label="Examen médico vencido o sin examen" value={examenesVencidos} tone={examenesVencidos ? "bad" : "ok"} hint="Res. 1843/2025" />
        <Stat label="Cobertura de capacitación" value={activos.length ? `${Math.round((capacitados / activos.length) * 100)}%` : "—"} hint={`${capacitados} de ${activos.length} con al menos una`} />
        <Stat label="Entregas de EPP registradas" value={trabajadores.reduce((s, t) => s + t.entregas.length, 0)} />
      </div>

      {/* ───── Trabajadores ───── */}
      <TabsContent value="trabajadores" className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <InputGroup className="w-72"><InputGroupAddon><Search /></InputGroupAddon><InputGroupInput placeholder="Buscar por nombre, documento o cargo" value={q} onChange={(e) => setQ(e.target.value)} /></InputGroup>
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={verRetirados} onCheckedChange={(v) => setVerRetirados(!!v)} /> Ver retirados</label>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => setImportar("")} tooltip="Pegue filas copiadas de Excel: nombre, documento, cargo, fecha de ingreso, vinculación"><ClipboardPaste /> Importar desde Excel</Button>
          <Button onClick={() => setForm(vacioT())}><UserPlus /> Agregar trabajador</Button>
        </div>
        {trabajadores.length === 0 ? (
          <EstadoVacio ilustracion="usuarios" titulo="Aún no hay trabajadores registrados" descripcion="Regístrelos uno a uno o pegue el listado desde Excel. Con ellos se llevan los exámenes médicos, la entrega de EPP, las capacitaciones y el perfil sociodemográfico.">
            <Button variant="outline" onClick={() => setImportar("")}><ClipboardPaste /> Importar desde Excel</Button><Button onClick={() => setForm(vacioT())}><UserPlus /> Agregar trabajador</Button>
          </EstadoVacio>
        ) : (
          <Section contentClassName="px-0">
            <Table>
              <TableHeader><TableRow><TableHead className="pl-6">Trabajador</TableHead><TableHead>Cargo</TableHead><TableHead>Vinculación</TableHead><TableHead>Ingreso</TableHead><TableHead>Último examen</TableHead><TableHead>EPP</TableHead><TableHead>Capacitaciones</TableHead><TableHead className="pr-6 w-28" /></TableRow></TableHeader>
              <TableBody>
                {lista.length === 0 && <TableRow><TableCell colSpan={8} className="p-0"><EstadoVacio ilustracion="busqueda" compacto className="rounded-none border-0" titulo="Ningún trabajador coincide" descripcion={q ? `No hay trabajadores que coincidan con “${q}”.` : "Todos los trabajadores están retirados: active “Ver retirados”."} /></TableCell></TableRow>}
                {lista.map((t) => {
                  const x = ultimoEx(t);
                  return (
                    <TableRow key={t.id} className={cn("cursor-pointer", !t.activo && "opacity-50")} onClick={() => setFicha(t.id)}>
                      <TableCell className="pl-6"><div className="font-medium">{t.nombres}</div><div className="text-xs text-muted-foreground">{t.documento ? `${abrevDoc(t.tipoDoc)} ${t.documento}` : "Sin documento"}{!t.activo && " · Retirado"}</div></TableCell>
                      <TableCell>{t.cargo || <span className="text-xs text-amber-700">Sin cargo</span>}</TableCell>
                      <TableCell>{VINC[t.vinculacion]}</TableCell>
                      <TableCell className="text-xs">{fecha(t.fechaIngreso)}</TableCell>
                      <TableCell>{x ? <Tip texto={`${TIPO_EX[x.tipo]} del ${fecha(x.fecha)}${x.proximo ? `; próximo: ${fecha(x.proximo)}` : ""}`}><Badge variant="outline" className={cn(CONCEPTO[x.concepto].c, vencido(x.proximo) && "border-red-400")}>{CONCEPTO[x.concepto].t}{vencido(x.proximo) ? " · vencido" : ""}</Badge></Tip> : <Badge variant="outline" className="text-red-700">Sin examen</Badge>}</TableCell>
                      <TableCell className="text-xs">{t.entregas.length ? `${t.entregas.length} entregas` : "—"}</TableCell>
                      <TableCell className="text-xs">{t.capacitaciones || "—"}</TableCell>
                      <TableCell className="pr-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-0.5">
                          <Button size="icon-sm" variant="ghost" aria-label="Registrar examen médico" onClick={() => abrirExamen(t.id)}><Stethoscope /></Button>
                          <Button size="icon-sm" variant="ghost" aria-label="Registrar entrega de EPP" onClick={() => abrirEntrega([t.id])}><HardHat /></Button>
                          <Button size="icon-sm" variant="ghost" aria-label="Editar datos" onClick={() => setForm({ ...t })}><Pencil /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Section>
        )}
      </TabsContent>

      {/* ───── Exámenes ───── */}
      <TabsContent value="examenes" className="mt-4 space-y-4">
        <p className="text-sm text-muted-foreground">Solo el concepto de aptitud y las recomendaciones de la IPS; nunca diagnósticos (dato sensible, Ley 1581/2012). Alimenta el registro FOR-02 y el planeador avisa el próximo examen.</p>
        {activos.length === 0 ? (
          <EstadoVacio ilustracion="usuarios" titulo="Primero registre los trabajadores" descripcion="Los exámenes médicos ocupacionales se registran por trabajador. Agréguelos o impórtelos desde Excel en la pestaña Trabajadores." />
        ) : !activos.some((t) => t.examenes.length) ? (
          <EstadoVacio ilustracion="evidencias" titulo="Aún no hay exámenes médicos registrados" descripcion="Registre el examen de ingreso, periódico o de retiro de cada trabajador con su concepto de aptitud. El sistema le avisará en el planeador cuándo toca el próximo.">
            <Button onClick={() => abrirExamen(activos[0].id)}><Stethoscope /> Registrar el primero</Button>
          </EstadoVacio>
        ) : null}
        {activos.some((t) => t.examenes.length) && <Section contentClassName="px-0" title="Último examen por trabajador">
          <Table className="[&_td]:whitespace-normal">
            <TableHeader><TableRow><TableHead className="pl-6">Trabajador</TableHead><TableHead>Último</TableHead><TableHead>Concepto</TableHead><TableHead>Restricciones / recomendaciones</TableHead><TableHead>Próximo</TableHead><TableHead className="pr-6 w-32" /></TableRow></TableHeader>
            <TableBody>
              {activos.map((t) => { const x = ultimoEx(t); return (
                <TableRow key={t.id}>
                  <TableCell className="pl-6"><div className="font-medium">{t.nombres}</div><div className="text-xs text-muted-foreground">{t.cargo}</div></TableCell>
                  <TableCell className="text-xs">{x ? `${TIPO_EX[x.tipo]} · ${fecha(x.fecha)}` : "—"}</TableCell>
                  <TableCell>{x ? <Badge variant="outline" className={CONCEPTO[x.concepto].c}>{CONCEPTO[x.concepto].t}</Badge> : <Badge variant="outline" className="text-red-700">Sin examen</Badge>}</TableCell>
                  <TableCell className="max-w-xs text-xs text-muted-foreground">{x?.restricciones || "—"}</TableCell>
                  <TableCell className={cn("text-xs", x && vencido(x.proximo) && "font-medium text-red-600")}>{x?.proximo ? fecha(x.proximo) : "—"}</TableCell>
                  <TableCell className="pr-6"><Button size="sm" variant="outline" onClick={() => abrirExamen(t.id)}><Plus /> Registrar</Button></TableCell>
                </TableRow>
              ); })}
            </TableBody>
          </Table>
        </Section>}
      </TabsContent>

      {/* ───── EPP ───── */}
      <TabsContent value="epp" className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex-1 text-sm text-muted-foreground">Registro de entrega (MTZ-04). Se conserva veinte años (Decreto 1072/2015 art. 2.2.4.6.13). Si indica la próxima reposición, el planeador la avisa.</p>
          <Button disabled={!activos.length} onClick={() => abrirEntrega([])}><HardHat /> Registrar entrega</Button>
        </div>
        {!trabajadores.some((t) => t.entregas.length) ? (
          <EstadoVacio ilustracion="epp" titulo={activos.length ? "Aún no hay entregas de EPP registradas" : "Primero registre los trabajadores"} descripcion={activos.length ? "Registre la entrega de elementos de protección a uno o varios trabajadores; para cada uno se precargan los EPP de su cargo según la matriz de peligros." : "Las entregas de EPP se registran por trabajador. Agréguelos o impórtelos desde Excel en la pestaña Trabajadores."}>
            {activos.length > 0 && <Button onClick={() => abrirEntrega([])}><HardHat /> Registrar la primera entrega</Button>}
          </EstadoVacio>
        ) : <Section contentClassName="px-0">
          <Table>
            <TableHeader><TableRow><TableHead className="pl-6">Fecha</TableHead><TableHead>Trabajador</TableHead><TableHead>Elemento</TableHead><TableHead>Cant.</TableHead><TableHead>Tipo</TableHead><TableHead>Capacitado</TableHead><TableHead>Reposición</TableHead><TableHead className="pr-6 w-12" /></TableRow></TableHeader>
            <TableBody>
              {trabajadores.flatMap((t) => t.entregas.map((x) => ({ t, x }))).sort((a, b) => b.x.fecha.localeCompare(a.x.fecha)).map(({ t, x }) => (
                <TableRow key={x.id}>
                  <TableCell className="pl-6 text-xs">{fecha(x.fecha)}</TableCell><TableCell>{t.nombres}</TableCell><TableCell>{x.elemento}</TableCell><TableCell>{x.cantidad}</TableCell>
                  <TableCell className="text-xs">{x.tipo === "reposicion" ? "Reposición" : "Dotación"}</TableCell><TableCell className="text-xs">{x.capacitado ? "Sí" : "No"}</TableCell>
                  <TableCell className={cn("text-xs", vencido(x.proximaReposicion) && "text-red-600")}>{fecha(x.proximaReposicion)}</TableCell>
                  <TableCell className="pr-6"><Confirmar trigger={<Button size="icon-sm" variant="ghost" aria-label="Eliminar entrega" />} titulo="Eliminar entrega" descripcion="Se quita del registro de entrega." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarEntrega(empresaId, x.id), "Entrega eliminada")}><Trash2 /></Confirmar></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>}
      </TabsContent>

      {/* ───── Capacitaciones ───── */}
      <TabsContent value="capacitaciones" className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="flex-1 text-sm text-muted-foreground">Cada capacitación ejecutada con su asistencia. Si la liga a una actividad del plan anual, la actividad queda ejecutada. Alimenta el programa de capacitación (PRG-01).</p>
          <Button disabled={!activos.length} onClick={() => setCap({ fecha: hoy(), tema: "", horas: 1, facilitador: "", modalidad: "presencial", actividadId: "", asistentes: [] })}><Plus /> Registrar capacitación</Button>
        </div>
        {capacitaciones.length === 0 ? <EstadoVacio ilustracion="evaluacion" titulo={activos.length ? "Aún no hay capacitaciones registradas" : "Primero registre los trabajadores"} descripcion={activos.length ? "Registre cada capacitación con su fecha, tema, horas y asistentes. Si la liga a una actividad del plan anual, la actividad queda ejecutada." : "La asistencia a capacitaciones se registra por trabajador. Agréguelos o impórtelos desde Excel en la pestaña Trabajadores."}>{activos.length > 0 && <Button onClick={() => setCap({ fecha: hoy(), tema: "", horas: 1, facilitador: "", modalidad: "presencial", actividadId: "", asistentes: [] })}><GraduationCap /> Registrar la primera</Button>}</EstadoVacio> : (
          <Section contentClassName="px-0">
            <Table className="[&_td]:whitespace-normal">
              <TableHeader><TableRow><TableHead className="pl-6">Fecha</TableHead><TableHead>Tema</TableHead><TableHead>Horas</TableHead><TableHead>Asistentes</TableHead><TableHead>Actividad del plan</TableHead><TableHead className="pr-6 w-20" /></TableRow></TableHeader>
              <TableBody>
                {capacitaciones.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="pl-6 text-xs">{fecha(c.fecha)}</TableCell>
                    <TableCell><div className="font-medium">{c.tema}</div><div className="text-xs text-muted-foreground">{c.modalidad === "virtual" ? "Virtual" : "Presencial"}{c.facilitador ? ` · ${c.facilitador}` : ""}</div></TableCell>
                    <TableCell>{c.horas}</TableCell>
                    <TableCell><Tip texto={c.asistentes.map(nombre).join(", ") || "Sin asistentes"}><span>{c.asistentes.length} de {activos.length}</span></Tip></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.actividad || "—"}</TableCell>
                    <TableCell className="pr-6"><div className="flex justify-end gap-0.5">
                      <Button size="icon-sm" variant="ghost" aria-label="Editar capacitación" onClick={() => setCap({ ...c })}><Pencil /></Button>
                      <Confirmar trigger={<Button size="icon-sm" variant="ghost" aria-label="Eliminar capacitación" />} titulo="Eliminar capacitación" descripcion="Se elimina la sesión y su asistencia." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarCapacitacion(empresaId, c.id), "Capacitación eliminada")}><Trash2 /></Confirmar>
                    </div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        )}
      </TabsContent>

      {/* ───── Ficha del trabajador ───── */}
      <Sheet open={!!tFicha} onOpenChange={(o) => !o && setFicha(null)}>
        <SheetContent className="w-full overflow-y-auto data-[side=right]:sm:max-w-xl">
          {tFicha && (
            <>
              <SheetHeader className="border-b">
                <SheetTitle>{tFicha.nombres}</SheetTitle>
                <SheetDescription>{tFicha.documento ? `${abrevDoc(tFicha.tipoDoc)} ${tFicha.documento} · ` : ""}{tFicha.cargo || "Sin cargo"} · {VINC[tFicha.vinculacion]}{tFicha.fechaIngreso ? ` · ingreso ${fecha(tFicha.fechaIngreso)}` : ""}</SheetDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setForm({ ...tFicha })}><Pencil /> Editar datos</Button>
                  {tFicha.activo
                    ? <Pedir trigger={<Button size="sm" variant="outline" />} titulo="Retirar trabajador" descripcion="Queda en el historial (sus registros se conservan) y deja de contar como activo. Recuerde el examen de retiro." label="Fecha de retiro (AAAA-MM-DD)" inicial={hoy()} accion="Retirar" onConfirm={(f) => run(() => A.retirarTrabajador(empresaId, tFicha.id, f), "Trabajador retirado")}><UserMinus /> Retirar</Pedir>
                    : <Button size="sm" variant="outline" onClick={() => run(() => A.reactivarTrabajador(empresaId, tFicha.id), "Trabajador reactivado")}><UserCheck /> Reactivar</Button>}
                  <Confirmar trigger={<Button size="sm" variant="ghost" />} titulo="Eliminar trabajador" descripcion="Se borran sus exámenes, entregas y asistencias. Si solo dejó la empresa, mejor use Retirar." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarTrabajador(empresaId, tFicha.id), "Trabajador eliminado", () => setFicha(null))}><Trash2 /> Eliminar</Confirmar>
                </div>
              </SheetHeader>
              <div className="space-y-6 p-5">
                <section className="space-y-2">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Exámenes médicos</h3><Button size="xs" onClick={() => abrirExamen(tFicha.id)}><Plus /> Registrar</Button></div>
                  {tFicha.examenes.length === 0 ? <p className="text-sm text-muted-foreground">Sin exámenes.</p> : tFicha.examenes.map((x) => (
                    <div key={x.id} className="flex items-start gap-2 rounded-lg border p-2.5 text-sm">
                      <div className="flex-1"><div><span className="font-medium">{TIPO_EX[x.tipo]}</span> · {fecha(x.fecha)}{x.ips ? ` · ${x.ips}` : ""}</div><Badge variant="outline" className={cn("mt-1", CONCEPTO[x.concepto].c)}>{CONCEPTO[x.concepto].t}</Badge>{x.restricciones && <div className="mt-1 text-xs text-muted-foreground">{x.restricciones}</div>}{x.proximo && <div className="mt-1 text-xs">Próximo: {fecha(x.proximo)}</div>}</div>
                      <Button size="icon-xs" variant="ghost" aria-label="Editar examen" onClick={() => abrirExamen(tFicha.id, x)}><Pencil /></Button>
                      <Button size="icon-xs" variant="ghost" aria-label="Eliminar examen" onClick={() => run(() => A.eliminarExamen(empresaId, x.id), "Examen eliminado")}><Trash2 /></Button>
                    </div>
                  ))}
                </section>
                <section className="space-y-2">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Entregas de EPP</h3><Button size="xs" onClick={() => abrirEntrega([tFicha.id])}><Plus /> Registrar</Button></div>
                  {tFicha.entregas.length === 0 ? <p className="text-sm text-muted-foreground">Sin entregas.</p> : <ul className="space-y-1 text-sm">{tFicha.entregas.map((x) => <li key={x.id} className="flex gap-2"><span className="w-24 text-xs text-muted-foreground">{fecha(x.fecha)}</span><span className="flex-1">{x.elemento} × {x.cantidad}</span><span className="text-xs text-muted-foreground">{x.tipo === "reposicion" ? "Reposición" : "Dotación"}</span></li>)}</ul>}
                </section>
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Capacitaciones</h3>
                  {capacitaciones.filter((c) => c.asistentes.includes(tFicha.id)).length === 0 ? <p className="text-sm text-muted-foreground">No ha asistido a capacitaciones registradas.</p> : <ul className="space-y-1 text-sm">{capacitaciones.filter((c) => c.asistentes.includes(tFicha.id)).map((c) => <li key={c.id} className="flex gap-2"><span className="w-24 text-xs text-muted-foreground">{fecha(c.fecha)}</span><span className="flex-1">{c.tema}</span><span className="text-xs text-muted-foreground">{c.horas} h</span></li>)}</ul>}
                  {tFicha.cargoId && sugeridos[tFicha.cargoId]?.capacitaciones.length > 0 && <p className="text-xs text-muted-foreground">Sugeridas para su cargo: {sugeridos[tFicha.cargoId].capacitaciones.join(", ")}.</p>}
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ───── Formulario del trabajador ───── */}
      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{form?.id ? "Editar trabajador" : "Agregar trabajador"}</DialogTitle><DialogDescription>Datos mínimos (Ley 1581/2012). Sexo, nacimiento y escolaridad alimentan el perfil sociodemográfico (FOR-01).</DialogDescription></DialogHeader>
          {form && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2"><FieldLabel htmlFor="t-n">Nombre completo</FieldLabel><Input id="t-n" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} /></Field>
              <Field><FieldLabel>Documento</FieldLabel><CampoDocumento tipo={form.tipoDoc} numero={form.documento} onTipo={(v) => setForm({ ...form, tipoDoc: v })} onNumero={(v) => setForm({ ...form, documento: v })} /></Field>
              <Field><FieldLabel>Cargo</FieldLabel><Selector value={form.cargoId} onChange={(v) => setForm({ ...form, cargoId: v })} opciones={cargos.map((c) => ({ valor: c.id, etiqueta: c.nombre }))} /></Field>
              <Field><FieldLabel>Vinculación</FieldLabel><Selector value={form.vinculacion} onChange={(v) => setForm({ ...form, vinculacion: v })} opciones={Object.entries(VINC).map(([k, v]) => ({ valor: k, etiqueta: v }))} /></Field>
              <Field><FieldLabel htmlFor="t-i">Fecha de ingreso</FieldLabel><Input id="t-i" type="date" value={form.fechaIngreso} onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })} /></Field>
              <Field><FieldLabel>Sexo</FieldLabel><Selector value={form.sexo} onChange={(v) => setForm({ ...form, sexo: v })} opciones={[{ valor: "F", etiqueta: "Mujer" }, { valor: "M", etiqueta: "Hombre" }, { valor: "O", etiqueta: "Otro / prefiere no decir" }]} /></Field>
              <Field><FieldLabel htmlFor="t-fn">Fecha de nacimiento</FieldLabel><Input id="t-fn" type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} /></Field>
              <Field><FieldLabel>Escolaridad</FieldLabel><Selector value={form.escolaridad} onChange={(v) => setForm({ ...form, escolaridad: v })} opciones={ESCOLARIDAD.map((x) => ({ valor: x, etiqueta: x }))} /></Field>
              <Field><FieldLabel htmlFor="t-t">Teléfono</FieldLabel><Input id="t-t" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="t-e">EPS</FieldLabel><Input id="t-e" value={form.eps} onChange={(e) => setForm({ ...form, eps: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="t-a">Fondo de pensiones</FieldLabel><Input id="t-a" value={form.afp} onChange={(e) => setForm({ ...form, afp: e.target.value })} /></Field>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setForm(null)}>Cancelar</Button><Button disabled={pend || !form?.nombres.trim()} onClick={() => form && run(() => A.guardarTrabajador(empresaId, form), form.id ? "Trabajador actualizado" : "Trabajador agregado", () => setForm(null))}>{pend && <Spinner />} Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Importar ───── */}
      <Dialog open={importar !== null} onOpenChange={(o) => !o && setImportar(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Importar trabajadores desde Excel</DialogTitle><DialogDescription>Copie las filas en Excel y péguelas aquí. Columnas, en este orden: <b>nombre</b>, <b>documento</b>, <b>cargo</b>, fecha de ingreso (opcional) y vinculación (opcional: planta, contratista, aprendiz, misión). Si el documento ya existe, se actualiza.</DialogDescription></DialogHeader>
          <Textarea rows={10} className="font-mono text-xs" placeholder={"Ana Pérez\t1061234567\tVendedor\t2024-03-01\tplanta\nLuis Gómez\t1062345678\tAuxiliar de bodega"} value={importar ?? ""} onChange={(e) => setImportar(e.target.value)} />
          <FieldDescription>{(importar ?? "").split(/\r?\n/).filter((l) => l.trim()).length} fila(s). Los cargos deben llamarse igual que en Cargos y matriz: {cargos.map((c) => c.nombre).join(", ") || "aún no hay cargos"}.</FieldDescription>
          <DialogFooter><Button variant="outline" onClick={() => setImportar(null)}>Cancelar</Button>
            <Button disabled={pend || !importar?.trim()} onClick={() => start(async () => { const r = await A.importarTrabajadores(empresaId, importar ?? ""); toast.success(`${r.creados} agregados y ${r.actualizados} actualizados${r.sinCargo.length ? `. Cargos no encontrados: ${r.sinCargo.join(", ")}` : ""}`); setImportar(null); })}>{pend && <Spinner />} Importar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Examen ───── */}
      <Dialog open={!!examen} onOpenChange={(o) => !o && setExamen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Examen médico ocupacional — {examen && nombre(examen.trabajadorId)}</DialogTitle><DialogDescription>Registre solo el concepto y las recomendaciones; nunca el diagnóstico.</DialogDescription></DialogHeader>
          {examen && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field><FieldLabel>Tipo</FieldLabel><Selector value={examen.tipo} onChange={(v) => setExamen({ ...examen, tipo: v })} opciones={Object.entries(TIPO_EX).map(([k, v]) => ({ valor: k, etiqueta: v }))} /></Field>
              <Field><FieldLabel htmlFor="x-f">Fecha</FieldLabel><Input id="x-f" type="date" value={examen.fecha} onChange={(e) => setExamen({ ...examen, fecha: e.target.value, proximo: examen.tipo === "retiro" ? "" : enAnios(e.target.value, 1) })} /></Field>
              <Field><FieldLabel>Concepto de aptitud</FieldLabel><Selector value={examen.concepto} onChange={(v) => setExamen({ ...examen, concepto: v })} opciones={Object.entries(CONCEPTO).map(([k, v]) => ({ valor: k, etiqueta: v.t }))} /></Field>
              <Field><FieldLabel htmlFor="x-i">IPS</FieldLabel><Input id="x-i" value={examen.ips} onChange={(e) => setExamen({ ...examen, ips: e.target.value })} /></Field>
              <Field className="sm:col-span-2"><FieldLabel htmlFor="x-r">Restricciones y recomendaciones</FieldLabel><Textarea id="x-r" rows={2} value={examen.restricciones} placeholder="Ej: Evitar levantar más de 12 kg durante 3 meses" onChange={(e) => setExamen({ ...examen, restricciones: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="x-c">Comunicado al trabajador</FieldLabel><Input id="x-c" type="date" value={examen.comunicadoTrabajador} onChange={(e) => setExamen({ ...examen, comunicadoTrabajador: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="x-p">Próximo examen</FieldLabel><Input id="x-p" type="date" value={examen.proximo} onChange={(e) => setExamen({ ...examen, proximo: e.target.value })} /><FieldDescription>Según la periodicidad del profesiograma.</FieldDescription></Field>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setExamen(null)}>Cancelar</Button><Button disabled={pend} onClick={() => examen && run(() => A.guardarExamen(empresaId, examen), "Examen guardado", () => setExamen(null))}>{pend && <Spinner />} Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Entrega de EPP ───── */}
      <Dialog open={!!entrega} onOpenChange={(o) => !o && setEntrega(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>Registrar entrega de EPP</DialogTitle><DialogDescription>Para uno o varios trabajadores a la vez. Para un solo trabajador se precargan los EPP de su cargo según la matriz.</DialogDescription></DialogHeader>
          {entrega && (
            <div className="space-y-4">
              <Field><FieldLabel>Trabajadores ({entrega.trabajadorIds.length})</FieldLabel>
                <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {activos.map((t) => <label key={t.id} className="flex items-center gap-2 text-sm"><Checkbox checked={entrega.trabajadorIds.includes(t.id)} onCheckedChange={(v) => setEntrega({ ...entrega, trabajadorIds: v ? [...entrega.trabajadorIds, t.id] : entrega.trabajadorIds.filter((x) => x !== t.id) })} />{t.nombres} <span className="text-xs text-muted-foreground">{t.cargo}</span></label>)}
                </div>
              </Field>
              <Field><FieldLabel>Elementos</FieldLabel>
                <div className="flex flex-wrap gap-1.5">{entrega.elementos.map((x) => <Badge key={x} variant="secondary" className="gap-1">{x}<button type="button" aria-label={`Quitar ${x}`} onClick={() => setEntrega({ ...entrega, elementos: entrega.elementos.filter((y) => y !== x) })}>×</button></Badge>)}</div>
                <Combo value="" placeholder="Agregar elemento…" onChange={(v) => v && !entrega.elementos.includes(v) && setEntrega({ ...entrega, elementos: [...entrega.elementos, v] })} grupos={[{ titulo: "Catálogo de EPP", opciones: catalogoEpp.map((x) => ({ valor: x })) }]} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-4">
                <Field><FieldLabel htmlFor="e-f">Fecha</FieldLabel><Input id="e-f" type="date" value={entrega.fecha} onChange={(e) => setEntrega({ ...entrega, fecha: e.target.value })} /></Field>
                <Field><FieldLabel htmlFor="e-c">Cantidad</FieldLabel><Input id="e-c" type="number" min={1} value={entrega.cantidad} onChange={(e) => setEntrega({ ...entrega, cantidad: Number(e.target.value) })} /></Field>
                <Field><FieldLabel>Tipo</FieldLabel><Selector value={entrega.tipo} onChange={(v) => setEntrega({ ...entrega, tipo: v })} opciones={[{ valor: "dotacion", etiqueta: "Dotación" }, { valor: "reposicion", etiqueta: "Reposición" }]} /></Field>
                <Field><FieldLabel htmlFor="e-r">Próxima reposición</FieldLabel><Input id="e-r" type="date" value={entrega.proximaReposicion} onChange={(e) => setEntrega({ ...entrega, proximaReposicion: e.target.value })} /></Field>
              </div>
              <label className="flex items-center gap-2 text-sm"><Checkbox checked={entrega.capacitado} onCheckedChange={(v) => setEntrega({ ...entrega, capacitado: !!v })} /> Se capacitó en el uso y mantenimiento</label>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEntrega(null)}>Cancelar</Button><Button disabled={pend || !entrega?.trabajadorIds.length || !entrega?.elementos.length} onClick={() => entrega && start(async () => { const r = await A.guardarEntregas(empresaId, entrega); if ("error" in r) toast.error(r.error); else { toast.success(`${r.n} entrega(s) registradas`); setEntrega(null); } })}>{pend && <Spinner />} Registrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Capacitación ───── */}
      <Dialog open={!!cap} onOpenChange={(o) => !o && setCap(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{cap?.id ? "Editar capacitación" : "Registrar capacitación"}</DialogTitle><DialogDescription>Con la lista de asistencia. Suba las evidencias (lista firmada, fotos) en la actividad del plan o en Evidencias.</DialogDescription></DialogHeader>
          {cap && (
            <div className="space-y-4">
              <Field><FieldLabel>Tema</FieldLabel><Combo value={cap.tema} onChange={(v) => setCap({ ...cap, tema: v })} grupos={[{ titulo: "Catálogo de capacitaciones", opciones: catalogoCapacitaciones.map((x) => ({ valor: x })) }]} /></Field>
              <div className="grid gap-4 sm:grid-cols-4">
                <Field><FieldLabel htmlFor="c-f">Fecha</FieldLabel><Input id="c-f" type="date" value={cap.fecha} onChange={(e) => setCap({ ...cap, fecha: e.target.value })} /></Field>
                <Field><FieldLabel htmlFor="c-h">Horas</FieldLabel><Input id="c-h" type="number" min={0.5} step={0.5} value={cap.horas} onChange={(e) => setCap({ ...cap, horas: Number(e.target.value) })} /></Field>
                <Field><FieldLabel>Modalidad</FieldLabel><Selector value={cap.modalidad} onChange={(v) => setCap({ ...cap, modalidad: v })} opciones={[{ valor: "presencial", etiqueta: "Presencial" }, { valor: "virtual", etiqueta: "Virtual" }]} /></Field>
                <Field><FieldLabel htmlFor="c-fa">Facilitador</FieldLabel><Input id="c-fa" value={cap.facilitador} onChange={(e) => setCap({ ...cap, facilitador: e.target.value })} /></Field>
              </div>
              <Field><FieldLabel>Actividad del plan anual (opcional)</FieldLabel><Selector value={cap.actividadId} onChange={(v) => setCap({ ...cap, actividadId: v })} placeholder="Sin ligar a una actividad" opciones={[{ valor: "", etiqueta: "Sin ligar a una actividad" }, ...actividades.map((a) => ({ valor: a.id, etiqueta: `${a.periodo} · ${a.nombre}` }))]} /><FieldDescription>Al guardar, la actividad queda ejecutada.</FieldDescription></Field>
              <Field>
                <div className="flex items-center gap-2"><FieldLabel className="flex-1">Asistentes ({cap.asistentes.length} de {activos.length})</FieldLabel><Button type="button" size="xs" variant="ghost" onClick={() => setCap({ ...cap, asistentes: activos.map((t) => t.id) })}>Todos</Button><Button type="button" size="xs" variant="ghost" onClick={() => setCap({ ...cap, asistentes: [] })}>Ninguno</Button></div>
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-2">
                  {activos.map((t) => <label key={t.id} className="flex items-center gap-2 text-sm"><Checkbox checked={cap.asistentes.includes(t.id)} onCheckedChange={(v) => setCap({ ...cap, asistentes: v ? [...cap.asistentes, t.id] : cap.asistentes.filter((x) => x !== t.id) })} />{t.nombres} <span className="text-xs text-muted-foreground">{t.cargo}</span></label>)}
                </div>
              </Field>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setCap(null)}>Cancelar</Button><Button disabled={pend || !cap?.tema.trim()} onClick={() => cap && run(() => A.guardarCapacitacion(empresaId, cap), "Capacitación guardada", () => setCap(null))}>{pend && <Spinner />} Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
