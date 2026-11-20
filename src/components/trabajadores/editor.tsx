"use client";
import { TIPOS_EXAMEN, REGIMENES_ESPECIALES, conceptosPermitidos, requiereAdaptacion, limiteAdaptacion, sumarMeses, textoPeriodicidad, DIAS_ADAPTACION } from "@/lib/examenes";
import { Ayuda } from "@/components/app/ayuda";
import type { Entidades } from "@/lib/entidades";
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
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PanelFormulario, SeccionFormulario, SeccionesFormulario } from "@/components/app/formulario-largo";
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
import { cn, hoyLocal } from "@/lib/utils";
import { AvisoTareas, type TareaAviso } from "@/components/plazos/aviso-tareas";
import { toastTareas } from "@/components/plazos/toast-tareas";
import { avisoFecha, avisoPlazo, deInput } from "@/lib/plazos";

type Examen = { id: string; tipo: string; fecha: string; ips: string; concepto: string; regimen?: string; restricciones: string; restriccionHasta: string; restriccionPermanente: boolean; adaptacionFecha: string; comunicadoTrabajador: string; proximo: string; borrable?: boolean };
type Entrega = { id: string; fecha: string; elemento: string; cantidad: number; tipo: string; capacitado: boolean; proximaReposicion: string };
type T = { id: string; nombres: string; tipoDoc: string; documento: string; cargoId: string; cargo: string; vinculacion: string; fechaIngreso: string; fechaRetiro: string; activo: boolean; sexo: string; fechaNacimiento: string; escolaridad: string; telefono: string; correo: string; eps: string; afp: string; conduce: boolean; modalidad: string; turnoNocturno: boolean; altoRiesgoPension: boolean; manipulaAlimentos: boolean; examenes: Examen[]; entregas: Entrega[]; capacitaciones: number };
type Cap = { id: string; fecha: string; tema: string; horas: number; facilitador: string; modalidad: string; actividadId: string; actividad: string; asistentes: string[] };
type Res = { error?: string } | { ok: true };

const VINC: Record<string, string> = { planta: "Planta", contratista: "Contratista", aprendiz: "Aprendiz", mision: "En misión" };
const TIPO_EX = TIPOS_EXAMEN;
const CONCEPTO: Record<string, { t: string; c: string }> = { apto: { t: "Apto", c: "border-emerald-300 bg-emerald-50 text-emerald-700" }, apto_recomendaciones: { t: "Apto con recomendaciones", c: "border-emerald-300 bg-emerald-50 text-emerald-700" }, apto_restricciones: { t: "Apto con restricciones", c: "border-amber-300 bg-amber-50 text-amber-800" }, aplazado: { t: "Aplazado", c: "border-slate-300 text-slate-700" }, no_apto: { t: "No apto", c: "border-red-300 bg-red-50 text-red-700" } };
const ESCOLARIDAD = ["Primaria", "Bachillerato", "Técnico", "Tecnólogo", "Profesional", "Posgrado", "Ninguna"];
const hoy = () => hoyLocal();
const fecha = (f: string) => (f ? new Date(f + "T12:00:00Z").toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }) : "—");
const vacioT = (): Omit<T, "id" | "examenes" | "entregas" | "capacitaciones" | "cargo" | "activo" | "fechaRetiro"> & { id?: string } => ({ nombres: "", tipoDoc: "CC", documento: "", cargoId: "", vinculacion: "planta", fechaIngreso: "", sexo: "", fechaNacimiento: "", escolaridad: "", telefono: "", correo: "", eps: "", afp: "", conduce: false, modalidad: "presencial", turnoNocturno: false, altoRiesgoPension: false, manipulaAlimentos: false });

export function TrabajadoresEditor({ empresaId, trabajadores, cargos, sugeridos, catalogoEpp, catalogoCapacitaciones, actividades, capacitaciones, entidades, ipsPorDefecto = "" }: {
  ipsPorDefecto?: string;
  empresaId: string; trabajadores: T[]; cargos: { id: string; nombre: string; nPersonas: number; periodicidadMeses: number | null }[]; sugeridos: Record<string, { epp: string[]; capacitaciones: string[] }>;
  catalogoEpp: string[]; catalogoCapacitaciones: string[]; actividades: { id: string; nombre: string; anio: number; periodo: string }[]; capacitaciones: Cap[]; entidades: Entidades;
}) {
  const [pend, start] = useTransition();
  const run = (fn: () => Promise<Res>, ok: string, despues?: () => void, tareas?: TareaAviso[]) => start(async () => { const r = await fn(); if ("error" in r && r.error) toast.error(r.error); else { if (tareas?.length) toastTareas(ok, tareas); else toast.success(ok); despues?.(); } });
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

  // Próximo examen según la periodicidad que la empresa definió para el cargo (Res. 1843/2025 art. 15); sin periodicidad, queda vacío.
  const periodicidadDe = (trabajadorId: string) => cargos.find((c) => c.id === trabajadores.find((t) => t.id === trabajadorId)?.cargoId)?.periodicidadMeses ?? null;
  const proximoPara = (trabajadorId: string, f: string, tipo: string) => { const m = periodicidadDe(trabajadorId); return tipo === "retiro" || !m || !f ? "" : sumarMeses(f, m); };
  const abrirExamen = (trabajadorId: string, x?: Examen) => setExamen(x ? { ...x, trabajadorId } : { trabajadorId, tipo: "periodico", fecha: hoy(), ips: ipsPorDefecto, concepto: "apto", restricciones: "", restriccionHasta: "", restriccionPermanente: false, adaptacionFecha: "", comunicadoTrabajador: "", proximo: proximoPara(trabajadorId, hoy(), "periodico") });
  // Tareas que se programan al guardar (catálogo src/lib/plazos.ts).
  const tareasExamen = (x: { fecha: string; concepto: string; restricciones: string; adaptacionFecha: string; proximo: string }): TareaAviso[] => [
    ...(requiereAdaptacion(x.concepto, x.restricciones) && !x.adaptacionFecha && x.fecha ? [avisoPlazo("adaptacion", deInput(x.fecha))] : []),
    ...(x.proximo ? [avisoFecha("examen_periodico", "Examen médico periódico", x.proximo, "fecha de próximo examen, según la periodicidad del cargo")] : []),
  ];
  const tareasEntrega = (e: { proximaReposicion: string }): TareaAviso[] => (e.proximaReposicion ? [avisoFecha("epp_reposicion", "Reposición de EPP", e.proximaReposicion, "fecha de próxima reposición, según la vida útil del elemento")] : []);
  const tareasCap = (c: { tema: string; fecha: string; asistentes: string[] }): TareaAviso[] => {
    if (!c.asistentes.length) return [];
    const f = deInput(c.fecha);
    return [...(/altura/i.test(c.tema) ? [avisoPlazo("alturas_reentrenamiento", f)] : []), ...(/confinad/i.test(c.tema) ? [avisoPlazo("confinados_actualizacion", f)] : [])];
  };
  const limite = (f: string) => (f ? limiteAdaptacion(new Date(f + "T12:00:00Z")).toISOString().slice(0, 10) : "");
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
                      <TableCell>{VINC[t.vinculacion]}<div className="mt-0.5 flex flex-wrap gap-1">{t.conduce && <Badge variant="outline" className="text-[10px]">Conduce</Badge>}{t.modalidad !== "presencial" && <Badge variant="outline" className="text-[10px]">{t.modalidad === "trabajo_en_casa" ? "Trabajo en casa" : t.modalidad === "remoto" ? "Remoto" : "Teletrabajo"}</Badge>}{t.turnoNocturno && <Badge variant="outline" className="text-[10px]">Nocturno</Badge>}{t.manipulaAlimentos && <Badge variant="outline" className="text-[10px]">Alimentos</Badge>}{t.altoRiesgoPension && <Badge variant="outline" className="text-[10px]">Alto riesgo</Badge>}</div></TableCell>
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
        <p className="text-sm text-muted-foreground">Solo el concepto de aptitud y las recomendaciones de la IPS; nunca diagnósticos (dato sensible, Ley 1581/2012). Alimenta el registro FOR-02 y el planeador avisa el próximo examen, que sale de la periodicidad definida en cada cargo (Res. 1843/2025 art. 15). Los exámenes no se borran: se conservan veinte (20) años (Decreto 1072/2015 art. 2.2.4.6.13); solo un error de captura se puede eliminar el mismo día.</p>
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
                  <TableCell className={cn("text-xs", x && vencido(x.proximo) && "font-medium text-red-600")}>{x?.proximo ? fecha(x.proximo) : x && x.tipo !== "retiro" && !periodicidadDe(t.id) ? <span className="text-amber-700">Defina la periodicidad del cargo</span> : "—"}</TableCell>
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
                    ? <Pedir trigger={<Button size="sm" variant="outline" />} titulo="Retirar trabajador" descripcion="Queda en el historial (sus registros se conservan) y deja de contar como activo. Recuerde el examen de retiro." label="Fecha de retiro" tipo="date" inicial={hoy()} accion="Retirar" extra={(f) => <AvisoTareas tareas={f ? [avisoPlazo("egreso", deInput(f))] : []} />} onConfirm={(f) => run(() => A.retirarTrabajador(empresaId, tFicha.id, f), "Trabajador retirado", undefined, [avisoPlazo("egreso", deInput(f))])}><UserMinus /> Retirar</Pedir>
                    : <Button size="sm" variant="outline" onClick={() => run(() => A.reactivarTrabajador(empresaId, tFicha.id), "Trabajador reactivado")}><UserCheck /> Reactivar</Button>}
                  <Confirmar trigger={<Button size="sm" variant="ghost" />} titulo="Eliminar trabajador" descripcion="Se borran sus exámenes, entregas y asistencias. Si solo dejó la empresa, mejor use Retirar." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarTrabajador(empresaId, tFicha.id), "Trabajador eliminado", () => setFicha(null))}><Trash2 /> Eliminar</Confirmar>
                </div>
              </SheetHeader>
              <div className="space-y-6 p-5">
                <section className="space-y-2">
                  <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Exámenes médicos</h3><Button size="xs" onClick={() => abrirExamen(tFicha.id)}><Plus /> Registrar</Button></div>
                  {tFicha.examenes.length === 0 ? <p className="text-sm text-muted-foreground">Sin exámenes.</p> : tFicha.examenes.map((x) => (
                    <div key={x.id} className="flex items-start gap-2 rounded-lg border p-2.5 text-sm">
                      <div className="flex-1"><div><span className="font-medium">{TIPO_EX[x.tipo]}</span> · {fecha(x.fecha)}{x.ips ? ` · ${x.ips}` : ""}</div><Badge variant="outline" className={cn("mt-1", CONCEPTO[x.concepto].c)}>{CONCEPTO[x.concepto].t}</Badge>{x.restricciones && <div className="mt-1 text-xs text-muted-foreground">{x.restricciones}{x.restriccionPermanente ? " · permanente" : x.restriccionHasta ? ` · hasta ${fecha(x.restriccionHasta)}` : ""}</div>}{requiereAdaptacion(x.concepto, x.restricciones) && <div className={cn("mt-1 text-xs", !x.adaptacionFecha && limite(x.fecha) < hoy() && "text-red-600")}>{x.adaptacionFecha ? `Puesto adaptado: ${fecha(x.adaptacionFecha)}` : `Adaptar el puesto antes del ${fecha(limite(x.fecha))}`}</div>}{x.proximo && <div className="mt-1 text-xs">Próximo: {fecha(x.proximo)}</div>}</div>
                      <Button size="icon-xs" variant="ghost" aria-label="Editar examen" onClick={() => abrirExamen(tFicha.id, x)}><Pencil /></Button>
                      {x.borrable
                        ? <Confirmar trigger={<Button size="icon-xs" variant="ghost" aria-label="Eliminar examen (error de captura de hoy)" />} titulo="Eliminar examen" descripcion="Solo para corregir un error de captura de hoy. Después de un día el examen ya no se puede borrar: los registros de evaluaciones médicas se conservan veinte (20) años (Decreto 1072/2015 art. 2.2.4.6.13)." accion="Eliminar" destructivo onConfirm={() => run(() => A.eliminarExamen(empresaId, x.id), "Examen eliminado")}><Trash2 /></Confirmar>
                        : <Tip texto="No se puede borrar: el registro se conserva veinte (20) años (Decreto 1072/2015 art. 2.2.4.6.13). Si tiene un error, corríjalo con Editar."><Button size="icon-xs" variant="ghost" aria-label="Eliminar examen (no disponible)" disabled><Trash2 /></Button></Tip>}
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
      <PanelFormulario open={!!form} onOpenChange={(o) => !o && setForm(null)}
        titulo={form?.id ? "Editar trabajador" : "Agregar trabajador"}
        descripcion="Datos mínimos (Ley 1581/2012). Sexo, nacimiento y escolaridad alimentan el perfil sociodemográfico (FOR-01)."
        pie={<><Button variant="outline" onClick={() => setForm(null)}>Cancelar</Button><Button disabled={pend || !form?.nombres.trim()} tooltip={!form?.nombres.trim() ? "Escriba el nombre del trabajador" : undefined} onClick={() => form && run(() => A.guardarTrabajador(empresaId, form), form.id ? "Trabajador actualizado" : "Trabajador agregado", () => setForm(null))}>{pend && <Spinner />} Guardar</Button></>}>
        {form && (
          <>
            <SeccionFormulario titulo="Identificación" descripcion="Nombre y documento tal como aparecen en la afiliación a la ARL." columnas={2}>
              <Field className="sm:col-span-2"><FieldLabel htmlFor="t-n">Nombre completo</FieldLabel><Input id="t-n" placeholder="Nombres y apellidos" value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} /></Field>
              <Field><FieldLabel>Documento</FieldLabel><CampoDocumento tipo={form.tipoDoc} numero={form.documento} onTipo={(v) => setForm({ ...form, tipoDoc: v })} onNumero={(v) => setForm({ ...form, documento: v })} /></Field>
              <Field><FieldLabel>Sexo</FieldLabel><Selector value={form.sexo} onChange={(v) => setForm({ ...form, sexo: v })} opciones={[{ valor: "F", etiqueta: "Mujer" }, { valor: "M", etiqueta: "Hombre" }, { valor: "O", etiqueta: "Otro / prefiere no decir" }]} /></Field>
              <Field><FieldLabel htmlFor="t-fn">Fecha de nacimiento</FieldLabel><Input id="t-fn" type="date" value={form.fechaNacimiento} onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })} /></Field>
              <Field><FieldLabel>Escolaridad</FieldLabel><Selector value={form.escolaridad} onChange={(v) => setForm({ ...form, escolaridad: v })} opciones={(entidades.escolaridad.length ? entidades.escolaridad : ESCOLARIDAD).map((x) => ({ valor: x, etiqueta: x }))} /></Field>
            </SeccionFormulario>

            <SeccionFormulario titulo="Vinculación" descripcion="El cargo trae los EPP, exámenes y capacitaciones de la matriz de peligros." columnas={2}>
              <Field className="sm:col-span-2"><FieldLabel>Cargo</FieldLabel><Selector value={form.cargoId} onChange={(v) => setForm({ ...form, cargoId: v })} opciones={cargos.map((c) => ({ valor: c.id, etiqueta: c.nombre }))} /></Field>
              <Field><FieldLabel>Vinculación</FieldLabel><Selector value={form.vinculacion} onChange={(v) => setForm({ ...form, vinculacion: v })} opciones={Object.entries(VINC).map(([k, v]) => ({ valor: k, etiqueta: v }))} /></Field>
              <Field><FieldLabel htmlFor="t-i">Fecha de ingreso</FieldLabel><Input id="t-i" type="date" value={form.fechaIngreso} onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })} /></Field>
            </SeccionFormulario>

            <SeccionFormulario titulo="Contacto y seguridad social" descripcion="EPS y fondo de pensiones se eligen de Biblioteca → Entidades; también puede escribir uno nuevo." columnas={2}>
              <Field className="sm:col-span-2"><FieldLabel htmlFor="t-t">Teléfono</FieldLabel><Input id="t-t" className="sm:max-w-xs" placeholder="Ej.: 300 123 4567" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></Field>
              <Field><FieldLabel htmlFor="t-e">EPS</FieldLabel><Combo id="t-e" placeholder="Seleccione o escriba la EPS" value={form.eps} onChange={(v) => setForm({ ...form, eps: v })} grupos={[{ titulo: "EPS (Biblioteca → Entidades)", opciones: entidades.eps.map((x) => ({ valor: x })) }]} /></Field>
              <Field><FieldLabel htmlFor="t-a">Fondo de pensiones</FieldLabel><Combo id="t-a" placeholder="Seleccione o escriba el fondo" value={form.afp} onChange={(v) => setForm({ ...form, afp: v })} grupos={[{ titulo: "Fondos de pensiones (Biblioteca → Entidades)", opciones: entidades.afp.map((x) => ({ valor: x })) }]} /></Field>
            </SeccionFormulario>

            <SeccionFormulario titulo="Condiciones que activan normas" ayuda={<Ayuda k="condicionesTrabajador" />} descripcion="Según lo que marque, el sistema exige documentos adicionales (PESV, teletrabajo, trabajo nocturno, alimentos, alto riesgo).">
              <Field className="sm:max-w-md"><FieldLabel>Modalidad de trabajo</FieldLabel><Selector value={form.modalidad} onChange={(v) => setForm({ ...form, modalidad: v })} opciones={[{ valor: "presencial", etiqueta: "Presencial" }, { valor: "teletrabajo", etiqueta: "Teletrabajo (Ley 1221/2008)" }, { valor: "remoto", etiqueta: "Trabajo remoto (Ley 2121/2021)" }, { valor: "trabajo_en_casa", etiqueta: "Trabajo en casa temporal (Ley 2088/2021)" }]} /></Field>
              <div className="grid gap-x-6 gap-y-2.5 text-sm sm:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-2"><Checkbox className="mt-0.5" checked={form.conduce} onCheckedChange={(v) => setForm({ ...form, conduce: !!v })} /><span>Conduce vehículos para la empresa <span className="text-muted-foreground">(PESV desde 2 conductores)</span></span></label>
                <label className="flex cursor-pointer items-start gap-2"><Checkbox className="mt-0.5" checked={form.turnoNocturno} onCheckedChange={(v) => setForm({ ...form, turnoNocturno: !!v })} /><span>Trabaja de noche o por turnos <span className="text-muted-foreground">(7:00 p. m. a 6:00 a. m.)</span></span></label>
                <label className="flex cursor-pointer items-start gap-2"><Checkbox className="mt-0.5" checked={form.manipulaAlimentos} onCheckedChange={(v) => setForm({ ...form, manipulaAlimentos: !!v })} /><span>Manipula alimentos <span className="text-muted-foreground">(certificado médico anual, Res. 2674/2013)</span></span></label>
                <label className="flex cursor-pointer items-start gap-2"><Checkbox className="mt-0.5" checked={form.altoRiesgoPension} onCheckedChange={(v) => setForm({ ...form, altoRiesgoPension: !!v })} /><span>Actividad de alto riesgo pensional <span className="text-muted-foreground">(Decreto 2090/2003 art. 2)</span></span></label>
              </div>
            </SeccionFormulario>
          </>
        )}
      </PanelFormulario>

      {/* ───── Importar ───── */}
      <Dialog open={importar !== null} onOpenChange={(o) => !o && setImportar(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Importar trabajadores desde Excel</DialogTitle><DialogDescription>Copie las filas en Excel y péguelas aquí. Columnas, en este orden: <b>nombre</b>, <b>documento</b>, <b>cargo</b>, fecha de ingreso (opcional) y vinculación (opcional: planta, contratista, aprendiz, misión). Si el documento ya existe, se actualiza.</DialogDescription></DialogHeader>
          <Textarea rows={10} className="font-mono text-xs" placeholder={"Ana Pérez\t1061234567\tVendedor\t2024-03-01\tplanta\nLuis Gómez\t1062345678\tAuxiliar de bodega"} value={importar ?? ""} onChange={(e) => setImportar(e.target.value)} />
          <FieldDescription>{(importar ?? "").split(/\r?\n/).filter((l) => l.trim()).length} fila(s). Los cargos deben llamarse igual que en Cargos y matriz: {cargos.map((c) => c.nombre).join(", ") || "aún no hay cargos"}.</FieldDescription>
          <DialogFooter><Button variant="outline" onClick={() => setImportar(null)}>Cancelar</Button>
            <Button disabled={pend || !importar?.trim()} onClick={() => start(async () => { const r = await A.importarTrabajadores(empresaId, importar ?? ""); toast.success(`${r.creados} agregados y ${r.actualizados} actualizados${r.sinCargo.length ? `. Cargos no encontrados: ${r.sinCargo.join(", ")}` : ""}`); setImportar(null); })}>{pend ? <><Spinner /> Importando…</> : "Importar"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Examen ───── */}
      <Dialog open={!!examen} onOpenChange={(o) => !o && setExamen(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>Examen médico ocupacional — {examen && nombre(examen.trabajadorId)}</DialogTitle><DialogDescription>Registre solo el concepto y las recomendaciones; nunca el diagnóstico.</DialogDescription></DialogHeader>
          {examen && (
            <DialogBody>
              <SeccionesFormulario>
                <SeccionFormulario titulo="Examen" descripcion="Tipo, fecha e IPS que lo practicó (Res. 1843/2025)." columnas={2}>
                  <Field><FieldLabel>Tipo</FieldLabel><Selector value={examen.tipo} onChange={(v) => setExamen({ ...examen, tipo: v, proximo: examen.id ? examen.proximo : proximoPara(examen.trabajadorId, examen.fecha, v) })} opciones={Object.entries(TIPO_EX).map(([k, v]) => ({ valor: k, etiqueta: v }))} /></Field>
                  <Field><FieldLabel htmlFor="x-f">Fecha</FieldLabel><Input id="x-f" type="date" value={examen.fecha} onChange={(e) => setExamen({ ...examen, fecha: e.target.value, proximo: examen.id ? examen.proximo : proximoPara(examen.trabajadorId, e.target.value, examen.tipo) })} /></Field>
                  <Field className="sm:col-span-2"><FieldLabel htmlFor="x-i">IPS</FieldLabel><Input id="x-i" placeholder="Ej.: IPS Salud Ocupacional" value={examen.ips} onChange={(e) => setExamen({ ...examen, ips: e.target.value })} /></Field>
                </SeccionFormulario>
                <SeccionFormulario titulo="Concepto y seguimiento" descripcion="El concepto de aptitud es el único dato de salud que se guarda (Ley 1581/2012)." columnas={2}>
                  <Field><FieldLabel>Certificado de régimen especial</FieldLabel><Selector value={examen.regimen || "ninguno"} onChange={(v) => setExamen({ ...examen, regimen: v === "ninguno" ? "" : v, concepto: v === "ninguno" && examen.concepto === "no_apto" ? "apto_restricciones" : examen.concepto })} opciones={[{ valor: "ninguno", etiqueta: "Ninguno (evaluación general)" }, ...Object.entries(REGIMENES_ESPECIALES).map(([k, v]) => ({ valor: k, etiqueta: v }))]} /><FieldDescription>Alturas, conducción, alimentos, armas, electricidad o espacios confinados (Res. 1843/2025 art. 2).</FieldDescription></Field>
                  <Field><FieldLabel>Concepto de aptitud</FieldLabel><Selector value={examen.concepto} onChange={(v) => setExamen({ ...examen, concepto: v })} opciones={conceptosPermitidos(examen.regimen).map((k) => ({ valor: k, etiqueta: CONCEPTO[k].t }))} /><FieldDescription>{examen.regimen ? "En este certificado se admite \"no apto\"." : "\"No apto\" no se usa en la evaluación general (Res. 1843/2025 art. 19 par.)."}</FieldDescription></Field>
                  <Field className="sm:col-span-2"><FieldLabel htmlFor="x-r">Restricciones y recomendaciones</FieldLabel><Textarea id="x-r" rows={3} value={examen.restricciones} placeholder="Ej: Evitar levantar más de 12 kg durante 3 meses" onChange={(e) => setExamen({ ...examen, restricciones: e.target.value })} /></Field>
                  {(requiereAdaptacion(examen.concepto, examen.restricciones) || !!examen.restricciones.trim()) && <>
                    <Field><FieldLabel htmlFor="x-v">Vigencia de la restricción</FieldLabel><Input id="x-v" type="date" disabled={examen.restriccionPermanente} value={examen.restriccionPermanente ? "" : examen.restriccionHasta} onChange={(e) => setExamen({ ...examen, restriccionHasta: e.target.value })} /><FieldDescription>Hasta qué fecha es temporal (Res. 1843/2025 art. 19 par.).</FieldDescription></Field>
                    <Field><FieldLabel className="flex items-center gap-2 font-normal"><Checkbox checked={examen.restriccionPermanente} onCheckedChange={(v) => setExamen({ ...examen, restriccionPermanente: !!v, restriccionHasta: v ? "" : examen.restriccionHasta })} /> Permanente</FieldLabel><FieldDescription>Marque si el concepto la indica sin fecha de terminación.</FieldDescription></Field>
                    <Field><FieldLabel htmlFor="x-a">Puesto adaptado el</FieldLabel><Input id="x-a" type="date" value={examen.adaptacionFecha} onChange={(e) => setExamen({ ...examen, adaptacionFecha: e.target.value })} /><FieldDescription className={cn(!examen.adaptacionFecha && limite(examen.fecha) < hoy() && "text-red-600")}>Fecha límite: {fecha(limite(examen.fecha))} ({DIAS_ADAPTACION} días hábiles después del examen, Res. 1843/2025 art. 5 lit. f).</FieldDescription></Field>
                  </>}
                  <Field><FieldLabel htmlFor="x-c">Comunicado al trabajador</FieldLabel><Input id="x-c" type="date" value={examen.comunicadoTrabajador} onChange={(e) => setExamen({ ...examen, comunicadoTrabajador: e.target.value })} /></Field>
                  <Field><FieldLabel htmlFor="x-p">Próximo examen</FieldLabel><Input id="x-p" type="date" value={examen.proximo} onChange={(e) => setExamen({ ...examen, proximo: e.target.value })} /><FieldDescription className={cn(!periodicidadDe(examen.trabajadorId) && examen.tipo !== "retiro" && "text-amber-700")}>{periodicidadDe(examen.trabajadorId) ? `${textoPeriodicidad(periodicidadDe(examen.trabajadorId))}, según la periodicidad del cargo (Res. 1843/2025 art. 15).` : "Defina la periodicidad del cargo en la matriz de peligros (Cargos) para calcularlo; la define la empresa con justificación técnica (Res. 1843/2025 art. 15)."}</FieldDescription></Field>
                </SeccionFormulario>
              </SeccionesFormulario>
              <AvisoTareas className="mt-4" tareas={tareasExamen(examen)} />
            </DialogBody>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setExamen(null)}>Cancelar</Button><Button disabled={pend} onClick={() => examen && run(() => A.guardarExamen(empresaId, examen), "Examen guardado", () => setExamen(null), tareasExamen(examen))}>{pend && <Spinner />} Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Entrega de EPP ───── */}
      <Dialog open={!!entrega} onOpenChange={(o) => !o && setEntrega(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Registrar entrega de EPP</DialogTitle><DialogDescription>Para uno o varios trabajadores a la vez. Para un solo trabajador se precargan los EPP de su cargo según la matriz.</DialogDescription></DialogHeader>
          {entrega && (
            <DialogBody>
              <SeccionesFormulario>
                <SeccionFormulario titulo={`Trabajadores (${entrega.trabajadorIds.length})`} descripcion="Marque a quiénes se les entrega. Se crea un registro por trabajador y elemento."
                  acciones={<><Button type="button" size="xs" variant="ghost" onClick={() => setEntrega({ ...entrega, trabajadorIds: activos.map((t) => t.id) })}>Todos</Button><Button type="button" size="xs" variant="ghost" onClick={() => setEntrega({ ...entrega, trabajadorIds: [] })}>Ninguno</Button></>}>
                  <div className="grid max-h-44 gap-x-6 gap-y-1.5 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
                    {activos.map((t) => <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={entrega.trabajadorIds.includes(t.id)} onCheckedChange={(v) => setEntrega({ ...entrega, trabajadorIds: v ? [...entrega.trabajadorIds, t.id] : entrega.trabajadorIds.filter((x) => x !== t.id) })} /><span className="truncate">{t.nombres} <span className="text-xs text-muted-foreground">{t.cargo}</span></span></label>)}
                  </div>
                </SeccionFormulario>
                <SeccionFormulario titulo={`Elementos (${entrega.elementos.length})`} descripcion="Del catálogo de EPP (Biblioteca); también puede escribir uno nuevo.">
                  <Field>
                    {entrega.elementos.length > 0 && <div className="flex flex-wrap gap-2">{entrega.elementos.map((x) => <Badge key={x} variant="secondary" className="gap-1 pr-1 font-normal">{x}<Button type="button" size="icon-xs" variant="ghost" className="size-4" aria-label={`Quitar ${x}`} onClick={() => setEntrega({ ...entrega, elementos: entrega.elementos.filter((y) => y !== x) })}>×</Button></Badge>)}</div>}
                    <Combo value="" placeholder="Agregar elemento…" onChange={(v) => v && !entrega.elementos.includes(v) && setEntrega({ ...entrega, elementos: [...entrega.elementos, v] })} grupos={[{ titulo: "Catálogo de EPP", opciones: catalogoEpp.map((x) => ({ valor: x })) }]} />
                  </Field>
                </SeccionFormulario>
                <SeccionFormulario titulo="Entrega" descripcion="Si indica la próxima reposición, el planeador la avisa." contenidoClassName="sm:grid-cols-4">
                  <Field><FieldLabel htmlFor="e-f">Fecha</FieldLabel><Input id="e-f" type="date" value={entrega.fecha} onChange={(e) => setEntrega({ ...entrega, fecha: e.target.value })} /></Field>
                  <Field><FieldLabel htmlFor="e-c">Cantidad</FieldLabel><Input id="e-c" placeholder="Ej.: 2" type="number" min={1} value={entrega.cantidad} onChange={(e) => setEntrega({ ...entrega, cantidad: Number(e.target.value) })} /></Field>
                  <Field><FieldLabel>Tipo</FieldLabel><Selector value={entrega.tipo} onChange={(v) => setEntrega({ ...entrega, tipo: v })} opciones={[{ valor: "dotacion", etiqueta: "Dotación" }, { valor: "reposicion", etiqueta: "Reposición" }]} /></Field>
                  <Field><FieldLabel htmlFor="e-r">Próxima reposición</FieldLabel><Input id="e-r" type="date" value={entrega.proximaReposicion} onChange={(e) => setEntrega({ ...entrega, proximaReposicion: e.target.value })} /></Field>
                  <label className="flex cursor-pointer items-center gap-2 text-sm sm:col-span-4"><Checkbox checked={entrega.capacitado} onCheckedChange={(v) => setEntrega({ ...entrega, capacitado: !!v })} /> Se capacitó en el uso y mantenimiento</label>
                </SeccionFormulario>
              </SeccionesFormulario>
              <AvisoTareas className="mt-4" tareas={tareasEntrega(entrega)} />
            </DialogBody>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEntrega(null)}>Cancelar</Button><Button disabled={pend || !entrega?.trabajadorIds.length || !entrega?.elementos.length} tooltip={entrega && (!entrega.trabajadorIds.length || !entrega.elementos.length) ? "Marque al menos un trabajador y un elemento" : undefined} onClick={() => entrega && start(async () => { const r = await A.guardarEntregas(empresaId, entrega); if ("error" in r) toast.error(r.error); else { toastTareas(`${r.n} entrega(s) registradas`, tareasEntrega(entrega)); setEntrega(null); } })}>{pend && <Spinner />} Registrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ───── Capacitación ───── */}
      <Dialog open={!!cap} onOpenChange={(o) => !o && setCap(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{cap?.id ? "Editar capacitación" : "Registrar capacitación"}</DialogTitle><DialogDescription>Con la lista de asistencia. Suba las evidencias (lista firmada, fotos) en la actividad del plan o en Evidencias.</DialogDescription></DialogHeader>
          {cap && (
            <DialogBody>
              <SeccionesFormulario>
                <SeccionFormulario titulo="Sesión" descripcion="Tema del catálogo de capacitaciones (o uno propio), fecha, duración y quién la dictó." columnas={2}>
                  <Field className="sm:col-span-2"><FieldLabel>Tema</FieldLabel><Combo value={cap.tema} placeholder="Seleccione o escriba el tema" onChange={(v) => setCap({ ...cap, tema: v })} grupos={[{ titulo: "Catálogo de capacitaciones", opciones: catalogoCapacitaciones.map((x) => ({ valor: x })) }]} /></Field>
                  <Field><FieldLabel htmlFor="c-f">Fecha</FieldLabel><Input id="c-f" type="date" value={cap.fecha} onChange={(e) => setCap({ ...cap, fecha: e.target.value })} /></Field>
                  <Field><FieldLabel htmlFor="c-h">Horas</FieldLabel><Input id="c-h" placeholder="Ej.: 2" type="number" min={0.5} step={0.5} value={cap.horas} onChange={(e) => setCap({ ...cap, horas: Number(e.target.value) })} /></Field>
                  <Field><FieldLabel>Modalidad</FieldLabel><Selector value={cap.modalidad} onChange={(v) => setCap({ ...cap, modalidad: v })} opciones={[{ valor: "presencial", etiqueta: "Presencial" }, { valor: "virtual", etiqueta: "Virtual" }]} /></Field>
                  <Field><FieldLabel htmlFor="c-fa">Facilitador</FieldLabel><Input id="c-fa" placeholder="Ej.: Instructor de la ARL" value={cap.facilitador} onChange={(e) => setCap({ ...cap, facilitador: e.target.value })} /></Field>
                </SeccionFormulario>
                <SeccionFormulario titulo="Plan anual" descripcion="Opcional. Al guardar, la actividad ligada queda ejecutada.">
                  <Field><FieldLabel>Actividad del plan anual</FieldLabel><Selector value={cap.actividadId} onChange={(v) => setCap({ ...cap, actividadId: v })} placeholder="Sin ligar a una actividad" opciones={[{ valor: "", etiqueta: "Sin ligar a una actividad" }, ...[...actividades].sort((x, y) => Number(y.anio === Number(cap.fecha.slice(0, 4))) - Number(x.anio === Number(cap.fecha.slice(0, 4))) || x.anio - y.anio).map((a) => ({ valor: a.id, etiqueta: `${a.periodo} · ${a.nombre}` }))]} /></Field>
                </SeccionFormulario>
                <SeccionFormulario titulo={`Asistentes (${cap.asistentes.length} de ${activos.length})`} descripcion="Cada asistente queda con la capacitación en su ficha."
                  acciones={<><Button type="button" size="xs" variant="ghost" onClick={() => setCap({ ...cap, asistentes: activos.map((t) => t.id) })}>Todos</Button><Button type="button" size="xs" variant="ghost" onClick={() => setCap({ ...cap, asistentes: [] })}>Ninguno</Button></>}>
                  <div className="grid max-h-52 gap-x-6 gap-y-1.5 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
                    {activos.map((t) => <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm"><Checkbox checked={cap.asistentes.includes(t.id)} onCheckedChange={(v) => setCap({ ...cap, asistentes: v ? [...cap.asistentes, t.id] : cap.asistentes.filter((x) => x !== t.id) })} /><span className="truncate">{t.nombres} <span className="text-xs text-muted-foreground">{t.cargo}</span></span></label>)}
                  </div>
                </SeccionFormulario>
              </SeccionesFormulario>
              <AvisoTareas className="mt-4" titulo="Al guardar se programa en el planeador (si la empresa tiene este riesgo)" tareas={tareasCap(cap)} />
            </DialogBody>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setCap(null)}>Cancelar</Button><Button disabled={pend || !cap?.tema.trim()} tooltip={!cap?.tema.trim() ? "Indique el tema" : undefined} onClick={() => cap && run(() => A.guardarCapacitacion(empresaId, cap), "Capacitación guardada", () => setCap(null), tareasCap(cap))}>{pend && <Spinner />} Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  );
}
