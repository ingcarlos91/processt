"use client";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { NormaRef } from "@/components/app/ui";
import { Porque } from "@/components/app/porque";
import { explicarNivel } from "@/lib/reglas/explicar";
import { crearEmpresa, actualizarEmpresa, type IntakeData } from "@/app/actions/empresas";
import { DISPARADORES } from "@/lib/reglas/condicion";
import { cn } from "@/lib/utils";

type Sector = { id: string; nombre: string; ciius: string[] };
type CargoTipo = { id: string; nombre: string; sectorTipoId: string | null };
type Ciiu = { codigo: string; descripcion: string; claseRiesgo: number };

const R = ["", "I", "II", "III", "IV", "V"];
const PASOS = [
  { t: "Identificación", d: "Datos legales de la empresa y su representante." },
  { t: "Actividad y riesgo", d: "La actividad económica define la clase de riesgo y el sector de la biblioteca." },
  { t: "Personas y cargos", d: "El número de trabajadores y la clase de riesgo definen los estándares mínimos aplicables." },
  { t: "Sedes", d: "Centros de trabajo. El Comité de Convivencia se conforma por centro de trabajo (Res. 3461/2025)." },
  { t: "Peligros especiales", d: "Cada opción activa normas, programas, documentos y capacitaciones específicas." },
  { t: "Estado actual", d: "Lo que la empresa ya tiene. Precarga la evaluación inicial; luego se verifica ítem por ítem." },
  { t: "Responsable del SG-SST", d: "Perfil exigido: nivel 7 técnico, 21 tecnólogo, 60 profesional (Res. 0312/2019 arts. 4, 10, 17)." },
];

const ESTADO_ACTUAL: { k: string; t: string; e: string }[] = [
  { k: "responsable", t: "Tiene responsable del SG-SST designado por escrito", e: "1.1.1" },
  { k: "afiliacion", t: "Todos los trabajadores afiliados a salud, pensión y ARL", e: "1.1.4" },
  { k: "copasst", t: "COPASST o Vigía conformado y vigente", e: "1.1.6" },
  { k: "convivencia", t: "Comité de Convivencia Laboral conformado", e: "1.1.8" },
  { k: "capacitacion", t: "Programa de capacitación en SST ejecutado", e: "1.2.1" },
  { k: "induccion", t: "Hace inducción en SST a todo trabajador nuevo", e: "1.2.2" },
  { k: "curso50h", t: "El responsable tiene el curso de 50 horas", e: "1.2.3" },
  { k: "politica", t: "Política de SST firmada y divulgada", e: "2.1.1" },
  { k: "planAnual", t: "Plan anual de trabajo firmado", e: "2.4.1" },
  { k: "examenes", t: "Realiza exámenes médicos ocupacionales", e: "3.1.4" },
  { k: "reporteAT", t: "Reporta accidentes a la ARL en 2 días hábiles", e: "3.2.1" },
  { k: "investigacion", t: "Investiga incidentes y accidentes", e: "3.2.2" },
  { k: "matriz", t: "Tiene matriz de peligros actualizada", e: "4.1.2" },
  { k: "mantenimiento", t: "Hace mantenimiento de instalaciones y equipos", e: "4.2.5" },
  { k: "epp", t: "Entrega EPP con registro", e: "4.2.6" },
  { k: "emergencias", t: "Tiene plan de emergencias y hace simulacro", e: "5.1.1" },
  { k: "brigada", t: "Tiene brigada conformada y capacitada", e: "5.1.2" },
  { k: "revision", t: "La gerencia revisa el SG-SST anualmente", e: "6.1.3" },
];

const ARLS = ["ARL SURA", "Positiva Compañía de Seguros", "Colmena Seguros", "Seguros Bolívar", "AXA Colpatria", "Seguros de Vida Alfa", "La Equidad Seguros", "Liberty / HDI Seguros"];

export function nivelPreview(trab: number, riesgo: number) {
  if (trab > 50 || riesgo >= 4) return { nivel: 60, ref: trab > 50 ? "Res. 0312/2019 art. 16" : "Res. 0312/2019 arts. 8, 15, 16" };
  if (trab >= 11) return { nivel: 21, ref: "Res. 0312/2019 art. 9" };
  return { nivel: 7, ref: "Res. 0312/2019 art. 3" };
}

function Campo({ id, label, children, desc, className }: { id: string; label: string; children: React.ReactNode; desc?: React.ReactNode; className?: string }) {
  return <Field className={className}><FieldLabel htmlFor={id}>{label}</FieldLabel>{children}{desc && <FieldDescription>{desc}</FieldDescription>}</Field>;
}

function Opcion({ id, checked, onChange, children, extra }: { id: string; checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <FieldLabel htmlFor={id}>
      <Field orientation="horizontal">
        <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(!!v)} />
        <div className="flex flex-1 flex-wrap items-center gap-2 font-normal">{children}{extra}</div>
      </Field>
    </FieldLabel>
  );
}

export function IntakeWizard({ sectores, cargosTipo, ciius, inicial, empresaId }: { sectores: Sector[]; cargosTipo: CargoTipo[]; ciius: Ciiu[]; inicial?: IntakeData; empresaId?: string }) {
  const [paso, setPaso] = useState(0);
  const [pend, start] = useTransition();
  const [d, setD] = useState<IntakeData>(inicial ?? {
    razonSocial: "", nit: "", claseRiesgo: 1, nTrabajadoresPlanta: 1, nContratistas: 0, nAprendices: 0, nEnMision: 0, nVehiculos: 0,
    sedes: [{ nombre: "Sede principal" }], cargos: [{ nombre: "", nPersonas: 1 }], disparadores: {}, estadoActual: {}, responsableSst: {},
  });
  const set = <K extends keyof IntakeData>(k: K, v: IntakeData[K]) => setD((x) => ({ ...x, [k]: v }));
  const setR = (k: keyof IntakeData["responsableSst"], v: string | boolean) => setD((x) => ({ ...x, responsableSst: { ...x.responsableSst, [k]: v } }));
  const [busq, setBusq] = useState("");
  const filtro = useMemo(() => {
    const q = busq.toLowerCase();
    return q.length < 2 ? [] : ciius.filter((c) => c.codigo.startsWith(q) || c.descripcion.toLowerCase().includes(q)).slice(0, 8);
  }, [busq, ciius]);
  const trab = (Number(d.nTrabajadoresPlanta) || 0) + (Number(d.nEnMision) || 0);
  const prev = nivelPreview(trab, d.claseRiesgo);
  const delSector = cargosTipo.filter((c) => !d.sectorTipoId || c.sectorTipoId === d.sectorTipoId);
  const otros = cargosTipo.filter((c) => d.sectorTipoId && c.sectorTipoId !== d.sectorTipoId);
  const sumaCargos = d.cargos.reduce((s, c) => s + (Number(c.nPersonas) || 0), 0);

  function elegirCiiu(c: Ciiu) {
    const sector = sectores.find((s) => s.ciius.includes(c.codigo.slice(0, 2)));
    setD((x) => ({ ...x, ciiu: c.codigo, descripcionActividad: c.descripcion, claseRiesgo: c.claseRiesgo, sectorTipoId: sector?.id ?? x.sectorTipoId }));
    setBusq("");
  }

  function guardar() {
    start(async () => {
      if (empresaId) {
        const r = await actualizarEmpresa(empresaId, d);
        if (r?.ok) toast.success("Datos guardados. Se recalcularon el nivel, los comités y las normas.");
      } else {
        const r = await crearEmpresa(d);
        if (r && "error" in r) toast.error(r.error);
      }
    });
  }

  return (
    <div className="grid lg:grid-cols-[230px_1fr] gap-6 items-start">
      <div className="space-y-4">
        <div className="flex flex-col gap-1">
          {PASOS.map((p, i) => (
            <Button key={p.t} variant={i === paso ? "default" : "ghost"} className="justify-start" onClick={() => setPaso(i)}>
              <Badge variant={i === paso ? "secondary" : "outline"} className="size-5 p-0 justify-center">{i + 1}</Badge>{p.t}
            </Button>
          ))}
        </div>
        <Card size="sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-1">Estándares mínimos aplicables <Porque normas={[prev.ref]}>{explicarNivel(prev.nivel, trab, d.claseRiesgo)} Se cuentan trabajadores de planta y en misión; contratistas y aprendices no suman para el nivel.</Porque></CardDescription>
            <CardTitle className="text-3xl tabular-nums">{prev.nivel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs text-muted-foreground">
            <div>{trab} trabajadores · riesgo {R[d.claseRiesgo]}</div>
            <NormaRef>{prev.ref}</NormaRef>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{PASOS[paso].t}</CardTitle>
          <CardDescription>{PASOS[paso].d}</CardDescription>
        </CardHeader>
        <CardContent>
          {paso === 0 && (
            <FieldGroup className="grid md:grid-cols-2 gap-4">
              <Campo id="rs" label="Razón social *" className="md:col-span-2"><Input id="rs" value={d.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} /></Campo>
              <div className="grid grid-cols-[1fr_80px] gap-2">
                <Campo id="nit" label="NIT *"><Input id="nit" value={d.nit} onChange={(e) => set("nit", e.target.value)} /></Campo>
                <Campo id="dv" label="DV"><Input id="dv" value={d.digitoVerificacion ?? ""} onChange={(e) => set("digitoVerificacion", e.target.value)} /></Campo>
              </div>
              <Campo id="tel" label="Teléfono"><Input id="tel" value={d.telefono ?? ""} onChange={(e) => set("telefono", e.target.value)} /></Campo>
              <Campo id="dir" label="Dirección"><Input id="dir" value={d.direccion ?? ""} onChange={(e) => set("direccion", e.target.value)} /></Campo>
              <Campo id="mail" label="Correo"><Input id="mail" type="email" value={d.correo ?? ""} onChange={(e) => set("correo", e.target.value)} /></Campo>
              <Campo id="ciu" label="Ciudad"><Input id="ciu" value={d.ciudad ?? ""} onChange={(e) => set("ciudad", e.target.value)} /></Campo>
              <Campo id="dep" label="Departamento"><Input id="dep" value={d.departamento ?? ""} onChange={(e) => set("departamento", e.target.value)} /></Campo>
              <Campo id="rl" label="Representante legal"><Input id="rl" value={d.representanteLegal ?? ""} onChange={(e) => set("representanteLegal", e.target.value)} /></Campo>
              <Campo id="rlc" label="Cédula del representante legal"><Input id="rlc" value={d.representanteCedula ?? ""} onChange={(e) => set("representanteCedula", e.target.value)} /></Campo>
            </FieldGroup>
          )}

          {paso === 1 && (
            <FieldGroup className="grid md:grid-cols-2 gap-4">
              <Campo id="busq" label="Buscar actividad económica" className="md:col-span-2" desc="Escriba el código CIIU o una palabra. La clase de riesgo se sugiere según el Decreto 1607/2002 (actualizado por el Decreto 768/2022); confírmela con el certificado de la ARL.">
                <Input id="busq" placeholder="Ej: 5611 o restaurante" value={busq} onChange={(e) => setBusq(e.target.value)} />
                {filtro.length > 0 && (
                  <Card size="sm" className="py-1 gap-0">
                    {filtro.map((c) => (
                      <Button key={c.codigo} variant="ghost" className="justify-start h-auto py-1.5 whitespace-normal text-left" onClick={() => elegirCiiu(c)}>
                        <Badge variant="outline">{c.codigo}</Badge><span className="flex-1">{c.descripcion}</span><Badge variant="secondary">Riesgo {R[c.claseRiesgo]}</Badge>
                      </Button>
                    ))}
                  </Card>
                )}
              </Campo>
              <Campo id="ciiu" label="Código CIIU"><Input id="ciiu" value={d.ciiu ?? ""} onChange={(e) => set("ciiu", e.target.value)} /></Campo>
              <Campo id="cr" label="Clase de riesgo (según ARL)">
                <NativeSelect id="cr" className="w-full" value={d.claseRiesgo} onChange={(e) => set("claseRiesgo", Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((r) => <NativeSelectOption key={r} value={r}>Clase {R[r]}</NativeSelectOption>)}
                </NativeSelect>
              </Campo>
              <Campo id="act" label="Descripción de la actividad" className="md:col-span-2"><Input id="act" value={d.descripcionActividad ?? ""} onChange={(e) => set("descripcionActividad", e.target.value)} /></Campo>
              <Campo id="sec" label="Sector" desc="Precarga procesos, zonas, cargos y peligros desde la biblioteca.">
                <NativeSelect id="sec" className="w-full" value={d.sectorTipoId ?? ""} onChange={(e) => set("sectorTipoId", e.target.value || null)}>
                  <NativeSelectOption value="">— Seleccione —</NativeSelectOption>
                  {sectores.map((s) => <NativeSelectOption key={s.id} value={s.id}>{s.nombre}</NativeSelectOption>)}
                </NativeSelect>
              </Campo>
              <Campo id="arl" label="ARL">
                <Input id="arl" list="arls" value={d.arl ?? ""} onChange={(e) => set("arl", e.target.value)} />
                <datalist id="arls">{ARLS.map((a) => <option key={a} value={a} />)}</datalist>
              </Campo>
              <Campo id="eps" label="EPS principal"><Input id="eps" value={d.epsPrincipal ?? ""} onChange={(e) => set("epsPrincipal", e.target.value)} /></Campo>
              <Campo id="just" label="Justificación si cambió la clase sugerida"><Input id="just" value={d.claseRiesgoJustificacion ?? ""} onChange={(e) => set("claseRiesgoJustificacion", e.target.value)} /></Campo>
              <div className="md:col-span-2"><Opcion id="upa" checked={!!d.esUpa} onChange={(v) => set("esUpa", v)} extra={<NormaRef>Res. 0312/2019 art. 7</NormaRef>}>Es unidad de producción agropecuaria (UPA)</Opcion></div>
            </FieldGroup>
          )}

          {paso === 2 && (
            <div className="space-y-6">
              <FieldGroup className="grid md:grid-cols-5 gap-4">
                <Campo id="np" label="Planta *"><Input id="np" type="number" min={0} value={d.nTrabajadoresPlanta} onChange={(e) => set("nTrabajadoresPlanta", Number(e.target.value))} /></Campo>
                <Campo id="nm" label="En misión"><Input id="nm" type="number" min={0} value={d.nEnMision} onChange={(e) => set("nEnMision", Number(e.target.value))} /></Campo>
                <Campo id="nc" label="Contratistas"><Input id="nc" type="number" min={0} value={d.nContratistas} onChange={(e) => set("nContratistas", Number(e.target.value))} /></Campo>
                <Campo id="na" label="Aprendices"><Input id="na" type="number" min={0} value={d.nAprendices} onChange={(e) => set("nAprendices", Number(e.target.value))} /></Campo>
                <Campo id="nv" label="Vehículos" desc="10 o más: PESV"><Input id="nv" type="number" min={0} value={d.nVehiculos} onChange={(e) => set("nVehiculos", Number(e.target.value))} /></Campo>
                <Campo id="hor" label="Horario" className="md:col-span-3"><Input id="hor" value={d.horario ?? ""} onChange={(e) => set("horario", e.target.value)} placeholder="Lunes a viernes 8:00 a 17:00" /></Campo>
                <Campo id="tur" label="Turnos" className="md:col-span-2"><Input id="tur" value={d.turnos ?? ""} onChange={(e) => set("turnos", e.target.value)} placeholder="Un turno / rotativos" /></Campo>
              </FieldGroup>
              {!empresaId && (
                <FieldSet>
                  <FieldLegend>Cargos</FieldLegend>
                  <FieldDescription>Cada cargo trae sus tareas y peligros desde la biblioteca. <span className={cn(sumaCargos !== trab && "text-amber-600")}>Personas en cargos: {sumaCargos} de {trab}.</span></FieldDescription>
                  <div className="space-y-2">
                    {d.cargos.map((c, i) => (
                      <div key={i} className="grid md:grid-cols-[1fr_90px_1fr_auto] gap-2">
                        <Input placeholder="Nombre del cargo" value={c.nombre} onChange={(e) => set("cargos", d.cargos.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} />
                        <Input type="number" min={1} value={c.nPersonas} onChange={(e) => set("cargos", d.cargos.map((x, j) => (j === i ? { ...x, nPersonas: Number(e.target.value) } : x)))} />
                        <NativeSelect className="w-full" value={c.cargoTipoId ?? ""} onChange={(e) => set("cargos", d.cargos.map((x, j) => (j === i ? { ...x, cargoTipoId: e.target.value || null, nombre: x.nombre || cargosTipo.find((t) => t.id === e.target.value)?.nombre.split(" / ")[0] || "" } : x)))}>
                          <NativeSelectOption value="">Tipo: detectar automáticamente</NativeSelectOption>
                          {delSector.map((t) => <NativeSelectOption key={t.id} value={t.id}>{t.nombre}</NativeSelectOption>)}
                          {otros.length > 0 && <NativeSelectOptGroup label="Otros sectores">{otros.map((t) => <NativeSelectOption key={t.id} value={t.id}>{t.nombre}</NativeSelectOption>)}</NativeSelectOptGroup>}
                        </NativeSelect>
                        <Button variant="ghost" size="icon" aria-label="Quitar cargo" onClick={() => set("cargos", d.cargos.filter((_, j) => j !== i))}><Trash2 /></Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-fit" onClick={() => set("cargos", [...d.cargos, { nombre: "", nPersonas: 1 }])}><Plus /> Agregar cargo</Button>
                </FieldSet>
              )}
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-2">
              {d.sedes.map((s, i) => (
                <div key={i} className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-2">
                  <Input placeholder="Nombre" value={s.nombre} onChange={(e) => set("sedes", d.sedes.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} />
                  <Input placeholder="Dirección" value={s.direccion ?? ""} onChange={(e) => set("sedes", d.sedes.map((x, j) => (j === i ? { ...x, direccion: e.target.value } : x)))} />
                  <Input placeholder="Ciudad" value={s.ciudad ?? ""} onChange={(e) => set("sedes", d.sedes.map((x, j) => (j === i ? { ...x, ciudad: e.target.value } : x)))} />
                  <Button variant="ghost" size="icon" aria-label="Quitar sede" onClick={() => set("sedes", d.sedes.filter((_, j) => j !== i))}><Trash2 /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => set("sedes", [...d.sedes, { nombre: "" }])}><Plus /> Agregar sede</Button>
            </div>
          )}

          {paso === 4 && (
            <div className="grid md:grid-cols-2 gap-2">
              {DISPARADORES.map((x) => (
                <Opcion key={x.clave} id={`dis-${x.clave}`} checked={!!d.disparadores[x.clave]} onChange={(v) => set("disparadores", { ...d.disparadores, [x.clave]: v })} extra={x.norma && <NormaRef>{x.norma}</NormaRef>}>{x.etiqueta}</Opcion>
              ))}
            </div>
          )}

          {paso === 5 && (
            <div className="grid md:grid-cols-2 gap-2">
              {ESTADO_ACTUAL.map((x) => (
                <Opcion key={x.k} id={`ea-${x.k}`} checked={!!d.estadoActual[x.k]} onChange={(v) => set("estadoActual", { ...d.estadoActual, [x.k]: v })} extra={<NormaRef>{x.e}</NormaRef>}>{x.t}</Opcion>
              ))}
            </div>
          )}

          {paso === 6 && (
            <FieldGroup className="grid md:grid-cols-2 gap-4">
              <Campo id="rn" label="Nombre"><Input id="rn" value={d.responsableSst.nombre ?? ""} onChange={(e) => setR("nombre", e.target.value)} /></Campo>
              <Campo id="rc" label="Cédula"><Input id="rc" value={d.responsableSst.cedula ?? ""} onChange={(e) => setR("cedula", e.target.value)} /></Campo>
              <Campo id="rcar" label="Cargo o vínculo"><Input id="rcar" placeholder="Asesora externa SST" value={d.responsableSst.cargo ?? ""} onChange={(e) => setR("cargo", e.target.value)} /></Campo>
              <Campo id="rp" label="Perfil">
                <NativeSelect id="rp" className="w-full" value={d.responsableSst.perfil ?? ""} onChange={(e) => setR("perfil", e.target.value)}>
                  <NativeSelectOption value="">— Seleccione —</NativeSelectOption>
                  <NativeSelectOption value="tecnico">Técnico en SST</NativeSelectOption>
                  <NativeSelectOption value="tecnologo">Tecnólogo en SST</NativeSelectOption>
                  <NativeSelectOption value="profesional">Profesional en SST</NativeSelectOption>
                  <NativeSelectOption value="especialista">Profesional con posgrado en SST</NativeSelectOption>
                </NativeSelect>
              </Campo>
              <Campo id="rl2" label="Licencia en SST (resolución)"><Input id="rl2" value={d.responsableSst.licencia ?? ""} onChange={(e) => setR("licencia", e.target.value)} /></Campo>
              <Campo id="rlf" label="Fecha de la licencia"><Input id="rlf" type="date" value={d.responsableSst.licenciaFecha ?? ""} onChange={(e) => setR("licenciaFecha", e.target.value)} /></Campo>
              <Opcion id="c50" checked={!!d.responsableSst.curso50h} onChange={(v) => setR("curso50h", v)} extra={<NormaRef>Decreto 1072 art. 2.2.4.6.35</NormaRef>}>Tiene el curso virtual de 50 horas</Opcion>
              <Campo id="c50f" label="Fecha del curso de 50 horas"><Input id="c50f" type="date" value={d.responsableSst.curso50hFecha ?? ""} onChange={(e) => setR("curso50hFecha", e.target.value)} /></Campo>
            </FieldGroup>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t">
          <Button variant="outline" disabled={paso === 0} onClick={() => setPaso(paso - 1)}><ChevronLeft /> Anterior</Button>
          <div className="flex gap-2">
            {empresaId && <Button variant="outline" disabled={pend} onClick={guardar}>{pend ? <Spinner /> : <Check />} Guardar</Button>}
            {paso < PASOS.length - 1 ? (
              <Button onClick={() => setPaso(paso + 1)}>Siguiente <ChevronRight /></Button>
            ) : !empresaId ? (
              <Button disabled={pend || !d.razonSocial || !d.nit} onClick={guardar}>{pend ? <><Spinner /> Creando y generando…</> : <><Check /> Crear empresa</>}</Button>
            ) : null}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
