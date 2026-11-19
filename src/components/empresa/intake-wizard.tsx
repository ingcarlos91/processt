"use client";
import { Selector } from "@/components/app/selector";
import { Combo } from "@/components/app/combo";
import type { Entidades } from "@/lib/entidades";
import { CampoDocumento } from "@/components/app/campo-documento";
import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ChevronLeft, ChevronRight, Check, ImagePlus, UserCheck, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { NormaRef } from "@/components/app/ui";
import { Ayuda } from "@/components/app/ayuda";
import { Buscador } from "@/components/app/buscador";
import { TURNOS, DIAS } from "@/lib/ayuda";
import { Porque } from "@/components/app/porque";
import { explicarNivel } from "@/lib/reglas/explicar";
import { crearDiagnostico } from "@/app/actions/diagnostico";
import { crearEmpresa, actualizarEmpresa, subirLogo, quitarLogo, type IntakeData } from "@/app/actions/empresas";
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

function Campo({ id, label, children, desc, className, ayuda }: { id: string; label: string; children: React.ReactNode; desc?: React.ReactNode; className?: string; ayuda?: string }) {
  return <Field className={className}><FieldLabel htmlFor={id} className="gap-1">{label}{ayuda && <Ayuda k={ayuda} />}</FieldLabel>{children}{desc && <FieldDescription>{desc}</FieldDescription>}</Field>;
}

/** Horario estructurado: días + hora de entrada y salida. Se guarda como texto legible. */
function parseHorario(h?: string) {
  const m = (h ?? "").match(/^(.*?),\s*(\d{1,2}:\d{2})\s*a\s*(\d{1,2}:\d{2})$/);
  return m ? { dias: m[1], entrada: m[2].padStart(5, "0"), salida: m[3].padStart(5, "0") } : { dias: h && !h.includes(":") ? h : "Lunes a viernes", entrada: "08:00", salida: "17:00" };
}
const horarioTexto = (x: { dias: string; entrada: string; salida: string }) => `${x.dias}, ${x.entrada.replace(/^0/, "")} a ${x.salida.replace(/^0/, "")}`;

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


export type Profesional = { nombre: string; tipoDoc?: string; cedula: string; cargo: string; perfil: string; licencia: string; licenciaFecha: string; curso50h: boolean; curso50hFecha: string; curso20hFecha?: string; rol?: string; experienciaAnios?: string };

export function IntakeWizard({ sectores, cargosTipo, ciius, inicial, empresaId, profesional, tieneLogo, entidades }: { sectores: Sector[]; cargosTipo: CargoTipo[]; ciius: Ciiu[]; inicial?: IntakeData; empresaId?: string; profesional: Profesional; tieneLogo?: boolean; entidades?: Entidades }) {
  const router = useRouter();
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(tieneLogo && empresaId ? `/api/empresas/${empresaId}/logo` : null);
  const fileRef = useRef<HTMLInputElement>(null);
  function elegirLogo(f: File | null) {
    if (!f) return;
    if (!["image/png", "image/jpeg"].includes(f.type)) return toast.error("El logo debe ser PNG o JPG.");
    if (f.size > 2 * 1024 * 1024) return toast.error("El logo no puede superar 2 MB.");
    setLogo(f);
    setLogoPreview(URL.createObjectURL(f));
    if (empresaId) start(async () => {
      const fd = new FormData(); fd.append("logo", f);
      const r = await subirLogo(empresaId, fd);
      if ("error" in r) toast.error(r.error); else toast.success("Logo guardado. Aparece en el encabezado de los documentos en Word y PDF.");
    });
  }
  const [paso, setPaso] = useState(0);
  const [pend, start] = useTransition();
  const [d, setD] = useState<IntakeData>(inicial ?? {
    razonSocial: "", nit: "", claseRiesgo: 1, nTrabajadoresPlanta: 1, nContratistas: 0, nAprendices: 0, nEnMision: 0, nVehiculos: 0, nConductores: 0,
    sedes: [{ nombre: "Sede principal" }], cargos: [{ nombre: "", nPersonas: 1 }], disparadores: {}, estadoActual: {}, responsableSst: { ...profesional },
  });
  const set = <K extends keyof IntakeData>(k: K, v: IntakeData[K]) => setD((x) => ({ ...x, [k]: v }));
  const [hor, setHorState] = useState(() => parseHorario(d.horario));
  const setHor = (h: typeof hor) => { setHorState(h); set("horario", horarioTexto(h)); };
  const turnos = (d.turnos ?? "").split(",").filter((x) => TURNOS.some((t) => t.valor === x));
  const setTurnos = (xs: string[]) => set("turnos", xs.join(","));
  const setR = (k: keyof IntakeData["responsableSst"], v: string | boolean) => setD((x) => ({ ...x, responsableSst: { ...x.responsableSst, [k]: v } }));
  const [busq, setBusq] = useState("");
  const filtro = useMemo(() => {
    const q = busq.toLowerCase();
    return q.length < 2 ? [] : ciius.filter((c) => c.codigo.startsWith(q) || c.descripcion.toLowerCase().includes(q)).slice(0, 8);
  }, [busq, ciius]);
  const trab = (Number(d.nTrabajadoresPlanta) || 0) + (Number(d.nEnMision) || 0);
  const prev = nivelPreview(trab, d.claseRiesgo);
  const sumaCargos = d.cargos.reduce((s, c) => s + (Number(c.nPersonas) || 0), 0);

  function elegirCiiu(c: Ciiu) {
    // Primero la clase exacta de 4 dígitos (más específica), luego la división de 2 dígitos.
    const sector = sectores.find((s) => s.ciius.includes(c.codigo)) ?? sectores.find((s) => s.ciius.includes(c.codigo.slice(0, 2)));
    setD((x) => ({ ...x, ciiu: c.codigo, descripcionActividad: c.descripcion, claseRiesgo: c.claseRiesgo, sectorTipoId: sector?.id ?? x.sectorTipoId }));
    setBusq("");
  }

  function guardar(modo: "completo" | "diagnostico" = "completo") {
    start(async () => {
      if (empresaId) {
        const r = await actualizarEmpresa(empresaId, d);
        if (r?.ok) toast.success("Datos guardados. Se recalcularon el nivel, los comités y las normas.");
      } else {
        const r = await crearEmpresa(d, modo);
        if ("error" in r) return void toast.error(r.error);
        if (logo) {
          const fd = new FormData(); fd.append("logo", logo);
          const l = await subirLogo(r.id, fd);
          if ("error" in l) toast.error(l.error);
        }
        if (modo === "diagnostico") {
          const dg = await crearDiagnostico(r.id);
          router.push(`/empresas/${r.id}/diagnostico/${dg.id}`);
        } else router.push(`/empresas/${r.id}`);
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
              <Campo id="rs" ayuda="razonSocial" label="Razón social *" className="md:col-span-2"><Input id="rs" placeholder="Ej.: Ferretería El Tornillo S.A.S." value={d.razonSocial} onChange={(e) => set("razonSocial", e.target.value)} /></Campo>
              <div className="grid grid-cols-[1fr_80px] gap-2">
                <Campo id="nit" ayuda="nit" label="NIT *"><Input id="nit" placeholder="Ej.: 900123456" value={d.nit} onChange={(e) => set("nit", e.target.value)} /></Campo>
                <Campo id="dv" ayuda="dv" label="DV"><Input id="dv" placeholder="Ej.: 7" value={d.digitoVerificacion ?? ""} onChange={(e) => set("digitoVerificacion", e.target.value)} /></Campo>
              </div>
              <Campo id="tel" ayuda="telefono" label="Teléfono"><Input id="tel" placeholder="Ej.: 300 123 4567" value={d.telefono ?? ""} onChange={(e) => set("telefono", e.target.value)} /></Campo>
              <Campo id="dir" ayuda="direccion" label="Dirección"><Input id="dir" placeholder="Ej.: Calle 10 # 5-20" value={d.direccion ?? ""} onChange={(e) => set("direccion", e.target.value)} /></Campo>
              <Campo id="mail" ayuda="correo" label="Correo"><Input id="mail" placeholder="contacto@empresa.com" type="email" value={d.correo ?? ""} onChange={(e) => set("correo", e.target.value)} /></Campo>
              <Campo id="ciu" ayuda="ciudad" label="Ciudad"><Input id="ciu" placeholder="Ej.: Medellín" value={d.ciudad ?? ""} onChange={(e) => set("ciudad", e.target.value)} /></Campo>
              <Campo id="dep" ayuda="departamento" label="Departamento"><Input id="dep" placeholder="Ej.: Antioquia" value={d.departamento ?? ""} onChange={(e) => set("departamento", e.target.value)} /></Campo>
              <Campo id="rl" ayuda="representanteLegal" label="Representante legal"><Input id="rl" placeholder="Nombres y apellidos" value={d.representanteLegal ?? ""} onChange={(e) => set("representanteLegal", e.target.value)} /></Campo>
              <Campo id="rlc" ayuda="representanteCedula" label="Documento del representante legal"><CampoDocumento id="rlc" tipo={d.representanteTipoDoc} numero={d.representanteCedula} onTipo={(v) => set("representanteTipoDoc", v)} onNumero={(v) => set("representanteCedula", v)} /></Campo>
              <Field className="md:col-span-2">
                <FieldLabel className="gap-1">Logo de la empresa <Ayuda k="logo" /></FieldLabel>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-40 items-center justify-center rounded-lg border border-dashed bg-muted/40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob) */}
                    {logoPreview ? <img src={logoPreview} alt="Logo" className="max-h-14 max-w-36 object-contain" /> : <ImagePlus className="size-6 text-muted-foreground" />}
                  </div>
                  <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(e) => elegirLogo(e.target.files?.[0] ?? null)} />
                  <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><ImagePlus /> {logoPreview ? "Cambiar logo" : "Subir logo"}</Button>
                  {logoPreview && <Button variant="ghost" size="sm" onClick={() => { setLogo(null); setLogoPreview(null); if (empresaId) start(() => quitarLogo(empresaId)); }}><Trash2 /> Quitar</Button>}
                </div>
                <FieldDescription>PNG o JPG, máximo 2 MB. Aparece en el encabezado de todos los documentos y formatos.</FieldDescription>
              </Field>
            </FieldGroup>
          )}

          {paso === 1 && (
            <FieldGroup className="grid md:grid-cols-2 gap-4">
              <Campo id="busq" ayuda="busquedaCiiu" label="Buscar actividad económica" className="md:col-span-2" desc="Escriba el código CIIU o una palabra. La clase de riesgo se sugiere según la tabla del Decreto 768/2022 (CIIU Rev. 4 A.C.); confírmela con el certificado de la ARL.">
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
              <Campo id="ciiu" ayuda="ciiu" label="Código CIIU"><Input id="ciiu" placeholder="Ej.: 4752" value={d.ciiu ?? ""} onChange={(e) => set("ciiu", e.target.value)} /></Campo>
              <Campo id="cr" ayuda="claseRiesgo" label="Clase de riesgo (según ARL)">
                <NativeSelect id="cr" className="w-full" value={d.claseRiesgo} onChange={(e) => set("claseRiesgo", Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((r) => <NativeSelectOption key={r} value={r}>Clase {R[r]}</NativeSelectOption>)}
                </NativeSelect>
              </Campo>
              <Campo id="act" ayuda="descripcionActividad" label="Descripción de la actividad" className="md:col-span-2"><Input id="act" placeholder="Ej.: Venta al por menor de artículos de ferretería" value={d.descripcionActividad ?? ""} onChange={(e) => set("descripcionActividad", e.target.value)} /></Campo>
              <Campo id="sec" ayuda="sector" label="Sector" desc="Precarga procesos, zonas, cargos y peligros desde la biblioteca.">
                <NativeSelect id="sec" className="w-full" value={d.sectorTipoId ?? ""} onChange={(e) => set("sectorTipoId", e.target.value || null)}>
                  <NativeSelectOption value="">— Seleccione —</NativeSelectOption>
                  {sectores.map((s) => <NativeSelectOption key={s.id} value={s.id}>{s.nombre}</NativeSelectOption>)}
                </NativeSelect>
              </Campo>
              <Campo id="arl" ayuda="arl" label="ARL">
                <Combo id="arl" placeholder="Seleccione o escriba la ARL" value={d.arl} onChange={(v) => set("arl", v)} grupos={[{ titulo: "ARL (Biblioteca → Entidades)", opciones: (entidades?.arl.length ? entidades.arl : ARLS).map((a) => ({ valor: a })) }]} />
              </Campo>
              <Campo id="eps" ayuda="eps" label="EPS principal"><Combo id="eps" placeholder="Seleccione o escriba la EPS" value={d.epsPrincipal} onChange={(v) => set("epsPrincipal", v)} grupos={[{ titulo: "EPS (Biblioteca → Entidades)", opciones: (entidades?.eps ?? []).map((a) => ({ valor: a })) }]} /></Campo>
              <Campo id="just" ayuda="justificacion" label="Justificación si cambió la clase sugerida"><Input id="just" placeholder="Explique por qué la clase de riesgo difiere de la sugerida" value={d.claseRiesgoJustificacion ?? ""} onChange={(e) => set("claseRiesgoJustificacion", e.target.value)} /></Campo>
              <div className="md:col-span-2"><Opcion id="upa" checked={!!d.esUpa} onChange={(v) => set("esUpa", v)} extra={<><NormaRef>Res. 0312/2019 art. 7</NormaRef><Ayuda k="esUpa" /></>}>Es unidad de producción agropecuaria (UPA)</Opcion></div>
            </FieldGroup>
          )}

          {paso === 2 && (
            <div className="space-y-6">
              <FieldGroup className="grid md:grid-cols-5 gap-4">
                <Campo id="np" ayuda="planta" label="Planta *" desc="10 o más: COPASST y reglamento; 11 a 50: 21 estándares; más de 50: 60"><Input id="np" placeholder="Ej.: 12" type="number" min={0} value={d.nTrabajadoresPlanta} onChange={(e) => set("nTrabajadoresPlanta", Number(e.target.value))} /></Campo>
                <Campo id="nm" ayuda="enMision" label="En misión"><Input id="nm" placeholder="Ej.: 0" type="number" min={0} value={d.nEnMision} onChange={(e) => set("nEnMision", Number(e.target.value))} /></Campo>
                <Campo id="nc" ayuda="contratistas" label="Contratistas" desc="1 o más: afiliación a ARL por el contratante"><Input id="nc" placeholder="Ej.: 2" type="number" min={0} value={d.nContratistas} onChange={(e) => set("nContratistas", Number(e.target.value))} /></Campo>
                <Campo id="na" ayuda="aprendices" label="Aprendices" desc="1 o más: ARL desde la fase lectiva; 15 o más trabajadores: cuota SENA"><Input id="na" placeholder="Ej.: 1" type="number" min={0} value={d.nAprendices} onChange={(e) => set("nAprendices", Number(e.target.value))} /></Campo>
                <Campo id="nv" ayuda="vehiculos" label="Vehículos" desc="Más de 10: PESV"><Input id="nv" placeholder="Ej.: 3" type="number" min={0} value={d.nVehiculos} onChange={(e) => set("nVehiculos", Number(e.target.value))} /></Campo>
                <Campo id="ncd" ayuda="conductores" label="Conductores" desc="2 o más: PESV"><Input id="ncd" placeholder="Ej.: 0" type="number" min={0} value={d.nConductores ?? 0} onChange={(e) => set("nConductores", Number(e.target.value))} /></Campo>
                <Campo id="hor-dias" ayuda="horario" label="Días de trabajo" className="md:col-span-2">
                  <NativeSelect id="hor-dias" className="w-full" value={hor.dias} onChange={(e) => setHor({ ...hor, dias: e.target.value })}>
                    {DIAS.map((x) => <NativeSelectOption key={x.valor} value={x.valor}>{x.etiqueta}</NativeSelectOption>)}
                  </NativeSelect>
                </Campo>
                <Campo id="hor-ent" label="Hora de entrada"><Input id="hor-ent" type="time" value={hor.entrada} onChange={(e) => setHor({ ...hor, entrada: e.target.value })} /></Campo>
                <Campo id="hor-sal" label="Hora de salida"><Input id="hor-sal" type="time" value={hor.salida} onChange={(e) => setHor({ ...hor, salida: e.target.value })} /></Campo>
                <Field className="md:col-span-1"><FieldLabel>Resultado</FieldLabel><Badge variant="outline" className="h-8 justify-start font-normal">{horarioTexto(hor)}</Badge></Field>
                <FieldSet className="md:col-span-5">
                  <FieldLegend variant="label" className="flex items-center gap-1">Turnos <Ayuda k="turnos" /></FieldLegend>
                  <FieldDescription>Marque todas las que apliquen. El trabajo nocturno o rotativo activa el peligro psicosocial por jornada.</FieldDescription>
                  <div className="grid md:grid-cols-3 gap-2">
                    {TURNOS.map((t) => (
                      <Opcion key={t.valor} id={`tur-${t.valor}`} checked={turnos.includes(t.valor)} onChange={(v) => setTurnos(v ? [...turnos, t.valor] : turnos.filter((x) => x !== t.valor))}>
                        <span><span className="font-medium">{t.etiqueta}</span><span className="block text-xs text-muted-foreground">{t.explica}</span></span>
                      </Opcion>
                    ))}
                  </div>
                </FieldSet>
              </FieldGroup>
              {!empresaId && (
                <FieldSet>
                  <FieldLegend className="flex items-center gap-1">Cargos <Ayuda k="cargos" /></FieldLegend>
                  <FieldDescription>Cada cargo trae sus tareas y peligros desde la biblioteca. <span className={cn(sumaCargos !== trab && "text-amber-600")}>Personas en cargos: {sumaCargos} de {trab}.</span></FieldDescription>
                  <div className="hidden md:grid md:grid-cols-[1fr_90px_1fr_auto] gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">Nombre del cargo <Ayuda k="cargos" /></span><span className="flex items-center gap-1">Personas <Ayuda k="nPersonas" /></span><span className="flex items-center gap-1">Tipo de cargo <Ayuda k="cargoTipo" /></span><span className="w-8" />
                  </div>
                  <div className="space-y-2">
                    {d.cargos.map((c, i) => (
                      <div key={i} className="grid md:grid-cols-[1fr_90px_1fr_auto] gap-2">
                        <Input placeholder="Nombre del cargo" value={c.nombre} onChange={(e) => set("cargos", d.cargos.map((x, j) => (j === i ? { ...x, nombre: e.target.value } : x)))} />
                        <Input type="number" min={1} value={c.nPersonas} placeholder="Ej.: 4" onChange={(e) => set("cargos", d.cargos.map((x, j) => (j === i ? { ...x, nPersonas: Number(e.target.value) } : x)))} />
                        <Buscador className="w-full" value={c.cargoTipoId ?? undefined} placeholder="Buscar cargo tipo…" textoBoton="Detectar automáticamente"
                          opciones={cargosTipo.map((t) => ({ valor: t.id, etiqueta: t.nombre, relevancia: d.sectorTipoId ? (t.sectorTipoId === d.sectorTipoId ? "sector" as const : "otro" as const) : undefined }))}
                          onSelect={(v) => set("cargos", d.cargos.map((x, j) => (j === i ? { ...x, cargoTipoId: v, nombre: x.nombre || cargosTipo.find((t) => t.id === v)?.nombre.split(" / ")[0] || "" } : x)))} />
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
              <p className="flex items-center gap-1 text-sm font-medium">Sedes o centros de trabajo <Ayuda k="sedes" /></p>
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
              <p className="md:col-span-2 flex items-center gap-1 text-sm font-medium">Marque lo que ocurre en la empresa <Ayuda k="disparadores" /></p>
              {DISPARADORES.map((x) => (
                <Opcion key={x.clave} id={`dis-${x.clave}`} checked={!!d.disparadores[x.clave]} onChange={(v) => set("disparadores", { ...d.disparadores, [x.clave]: v })} extra={x.norma && <NormaRef>{x.norma}</NormaRef>}>{x.etiqueta}</Opcion>
              ))}
            </div>
          )}

          {paso === 5 && (
            <div className="grid md:grid-cols-2 gap-2">
              <p className="md:col-span-2 flex items-center gap-1 text-sm font-medium">Marque lo que la empresa ya tiene funcionando <Ayuda k="estadoActual" /></p>
              {ESTADO_ACTUAL.map((x) => (
                <Opcion key={x.k} id={`ea-${x.k}`} checked={!!d.estadoActual[x.k]} onChange={(v) => set("estadoActual", { ...d.estadoActual, [x.k]: v })} extra={<NormaRef>{x.e}</NormaRef>}>{x.t}</Opcion>
              ))}
            </div>
          )}

          {paso === 6 && (
            <FieldGroup className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                <span className="flex-1">En una empresa nueva se precargan sus datos de “Mi consultora”. Cámbielos solo si en esta empresa la responsable es otra persona. Aparecen en la designación (DOC-03), las firmas y el “Elaboró” de cada formato.</span>
                {profesional.nombre
                  ? <Button variant="outline" size="sm" onClick={() => set("responsableSst", { ...profesional })}><UserCheck /> Copiar mis datos ({profesional.nombre})</Button>
                  : <Link href="/configuracion" className="text-xs underline underline-offset-2">Registre sus datos en “Mi consultora” para copiarlos con un clic</Link>}
              </div>
              <Campo id="rn" ayuda="respNombre" label="Nombre"><Input id="rn" placeholder="Nombres y apellidos" value={d.responsableSst.nombre ?? ""} onChange={(e) => setR("nombre", e.target.value)} /></Campo>
              <Campo id="rc" ayuda="documentoIdentidad" label="Documento de identidad"><CampoDocumento id="rc" tipo={d.responsableSst.tipoDoc} numero={d.responsableSst.cedula} onTipo={(v) => setR("tipoDoc", v)} onNumero={(v) => setR("cedula", v)} /></Campo>
              <Campo id="rcar" ayuda="cargoProfesional" label="Cargo o vínculo"><Input id="rcar" placeholder="Asesora externa SST" value={d.responsableSst.cargo ?? ""} onChange={(e) => setR("cargo", e.target.value)} /></Campo>
              <Campo id="rp" ayuda="perfil" label="Perfil">
                <NativeSelect id="rp" className="w-full" value={d.responsableSst.perfil ?? ""} onChange={(e) => setR("perfil", e.target.value)}>
                  <NativeSelectOption value="">— Seleccione —</NativeSelectOption>
                  <NativeSelectOption value="tecnico">Técnico en SST</NativeSelectOption>
                  <NativeSelectOption value="tecnologo">Tecnólogo en SST</NativeSelectOption>
                  <NativeSelectOption value="profesional">Profesional en SST</NativeSelectOption>
                  <NativeSelectOption value="especialista">Profesional con posgrado en SST</NativeSelectOption>
                </NativeSelect>
              </Campo>
              <Campo id="rl2" ayuda="licencia" label="Licencia en SST (resolución)"><Input id="rl2" placeholder="Número de la resolución que otorgó la licencia" value={d.responsableSst.licencia ?? ""} onChange={(e) => setR("licencia", e.target.value)} /></Campo>
              <Campo id="rlf" ayuda="licenciaFecha" label="Fecha de la licencia"><Input id="rlf" type="date" value={d.responsableSst.licenciaFecha ?? ""} onChange={(e) => setR("licenciaFecha", e.target.value)} /></Campo>
              <Opcion id="c50" checked={!!d.responsableSst.curso50h} onChange={(v) => setR("curso50h", v)} extra={<><NormaRef>Decreto 1072 art. 2.2.4.6.35</NormaRef><Ayuda k="curso50h" /></>}>Tiene el curso virtual de 50 horas</Opcion>
              <Campo id="c50f" ayuda="curso50h" label="Fecha del curso de 50 horas" desc="Se actualiza cada 3 años con el curso de 20 horas"><Input id="c50f" type="date" value={d.responsableSst.curso50hFecha ?? ""} onChange={(e) => setR("curso50hFecha", e.target.value)} /></Campo>
              <Campo id="c20f" ayuda="curso20h" label="Fecha del último curso de 20 horas"><Input id="c20f" type="date" value={d.responsableSst.curso20hFecha ?? ""} onChange={(e) => setR("curso20hFecha", e.target.value)} /></Campo>
              <Campo id="rrol" ayuda="rolResponsable" label="Rol frente al SG-SST" desc="Quien diseña necesita licencia; quien solo ejecuta en empresas de 10 o menos trabajadores (riesgo I-III) no (Res. 4927/2016 art. 14)">
                <Selector id="rrol" value={d.responsableSst.rol ?? "disenador"} onChange={(v) => setR("rol", v)} opciones={[{ valor: "disenador", etiqueta: "Diseña y firma el SG-SST" }, { valor: "ejecutor", etiqueta: "Solo administra y ejecuta (diseña la consultora)" }]} />
              </Campo>
              <Campo id="rexp" ayuda="experienciaSst" label="Años de experiencia certificada en SST" desc="Técnico: mínimo 1 año (7 estándares); tecnólogo: mínimo 2 años (21 estándares)"><Input id="rexp" type="number" min={0} placeholder="Ej.: 3" value={d.responsableSst.experienciaAnios ?? ""} onChange={(e) => setR("experienciaAnios", e.target.value === "" ? "" : String(Number(e.target.value)))} /></Campo>
            </FieldGroup>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t">
          <Button variant="outline" disabled={paso === 0} onClick={() => setPaso(paso - 1)}><ChevronLeft /> Anterior</Button>
          <div className="flex gap-2">
            {empresaId && <Button variant="outline" disabled={pend} onClick={() => guardar()}>{pend ? <Spinner /> : <Check />} Guardar</Button>}
            {paso < PASOS.length - 1 ? (
              <Button onClick={() => setPaso(paso + 1)}>Siguiente <ChevronRight /></Button>
            ) : !empresaId ? (
              <>
              <Button variant="outline" disabled={pend || !d.razonSocial || !d.nit} onClick={() => guardar("diagnostico")} tooltip="Primero evalúa el estado actual de la empresa y entrega el informe de diagnóstico; el SG-SST se monta después, desde el diagnóstico"><ClipboardList /> Empezar con diagnóstico</Button>
              <Button disabled={pend || !d.razonSocial || !d.nit} onClick={() => guardar()} tooltip="Crea la empresa y arma de una vez la matriz por cargos; luego genere documentos y plan">{pend ? <><Spinner /> Creando y generando…</> : <><Check /> Crear SG-SST completo</>}</Button>
              </>
            ) : null}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
