import Link from "next/link";
import { ArrowLeft, Download, Eye, GitCompareArrows, AlertTriangle, Info } from "lucide-react";
import { db } from "@/lib/db";
import { cargarEmpresa, filasMatriz } from "@/lib/generador/contexto";
import { filasDeVersion, resumenFilas, compararFilas, avisosActualizacion, type FilaMatriz } from "@/lib/matriz/versiones";
import { Section, NormaRef } from "@/components/app/ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const NIVEL: Record<string, string> = { I: "bg-red-600 text-white", II: "bg-orange-500 text-white", III: "bg-amber-300 text-amber-950", IV: "bg-emerald-600 text-white" };
const fecha = (d: Date) => d.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Bogota" });
function Nivel({ n }: { n: string }) { return <span className={cn("inline-flex min-w-7 justify-center rounded px-1.5 py-0.5 text-xs font-semibold", NIVEL[n] ?? "bg-muted")}>{n}</span>; }

function TablaFilas({ filas, vacio }: { filas: FilaMatriz[]; vacio: string }) {
  if (!filas.length) return <p className="px-6 py-4 text-sm text-muted-foreground">{vacio}</p>;
  return (
    <Table className="[&_td]:align-top [&_td]:whitespace-normal">
      <TableHeader><TableRow><TableHead className="pl-6">Proceso / zona</TableHead><TableHead>Tarea y cargos</TableHead><TableHead>Peligro</TableHead><TableHead>NR</TableHead><TableHead className="pr-6">Medidas de intervención</TableHead></TableRow></TableHeader>
      <TableBody>
        {filas.map((f) => (
          <TableRow key={f.id}>
            <TableCell className="pl-6 text-xs"><div>{f.proceso}</div><div className="text-muted-foreground">{f.zona}</div></TableCell>
            <TableCell className="text-xs"><div>{f.tarea}</div><div className="text-muted-foreground">{f.cargos.join(", ")}</div></TableCell>
            <TableCell className="text-xs"><div className="font-medium">{f.descripcion}</div><div className="text-muted-foreground">{f.clasificacion}</div></TableCell>
            <TableCell><div className="flex items-center gap-1.5"><Nivel n={f.nivelRiesgo} /><span className="text-xs tabular-nums text-muted-foreground">{f.nr}</span></div><div className="mt-0.5 text-[11px] text-muted-foreground">{f.aceptabilidad}</div></TableCell>
            <TableCell className="pr-6 text-xs text-muted-foreground">{[f.eliminacion, f.sustitucion, f.ingenieria, f.administrativa, f.epp].filter(Boolean).join(" · ") || "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function Versiones({ params, searchParams }: PageProps<"/empresas/[id]/matriz/versiones">) {
  const { id } = await params;
  const sp = await searchParams;
  const ver = Number(sp.v) || 0, comparar = Number(sp.comparar) || 0;
  const [versiones, avisos] = await Promise.all([
    db.matrizVersion.findMany({ where: { empresaId: id }, orderBy: { numero: "desc" } }),
    avisosActualizacion(id),
  ]);
  const actual = filasMatriz(await cargarEmpresa(id));
  const resumenes = await Promise.all(versiones.map(async (v) => (v.resumen as ReturnType<typeof resumenFilas> | null) ?? resumenFilas(await filasDeVersion(id, v.snapshot))));
  const vista = ver ? versiones.find((v) => v.numero === ver) : null;
  const filasVista = vista ? await filasDeVersion(id, vista.snapshot) : [];
  const base = comparar ? versiones.find((v) => v.numero === comparar) : null;
  const diff = base ? compararFilas(await filasDeVersion(id, base.snapshot), actual) : null;
  const esAntigua = (s: unknown) => Array.isArray(s);

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/empresas/${id}/matriz`} className={buttonVariants({ variant: "ghost", size: "sm" })}><ArrowLeft /> Cargos y matriz</Link>
        <div className="flex-1" />
        <BotonDescarga href={`/api/empresas/${id}/matriz.xlsx`} tooltip="Matriz vigente (con los cambios aún no cerrados en una versión)"><Download /> Excel de la matriz vigente</BotonDescarga>
      </div>
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">Cada versión es una copia congelada de la matriz: soporte de que se revisa y actualiza. Se puede consultar, descargar y comparar con la matriz vigente. <NormaRef>Decreto 1072/2015 art. 2.2.4.6.15</NormaRef><NormaRef>Res. 0312/2019 estándar 4.1.2</NormaRef></p>

      {avisos.map((a, i) => (
        <Alert key={i} variant={a.nivel === "obligatorio" ? "destructive" : "default"}>
          {a.nivel === "obligatorio" ? <AlertTriangle /> : <Info />}
          <AlertTitle>{a.nivel === "obligatorio" ? "Actualización obligatoria" : "Actualización recomendada"}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">{a.texto} <NormaRef>{a.normaRef}</NormaRef></AlertDescription>
        </Alert>
      ))}

      {versiones.length === 0 ? (
        <EstadoVacio ilustracion="matriz" titulo="Aún no hay versiones cerradas" descripcion="Cuando la matriz esté revisada y aprobada, use “Cerrar versión” en Cargos y matriz. Cada cierre queda aquí con su fecha, motivo y quién la cerró.">
          <Link href={`/empresas/${id}/matriz`} className={buttonVariants()}>Ir a Cargos y matriz</Link>
        </EstadoVacio>
      ) : (
        <Section title="Versiones cerradas" contentClassName="px-0">
          <Table>
            <TableHeader><TableRow><TableHead className="pl-6">Versión</TableHead><TableHead>Fecha</TableHead><TableHead>Motivo</TableHead><TableHead>Cerró</TableHead><TableHead>Peligros</TableHead><TableHead>Prioritarios (I-II)</TableHead><TableHead className="pr-6 text-right">Acciones</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow className="bg-muted/30">
                <TableCell className="pl-6 font-medium">Vigente</TableCell><TableCell className="text-muted-foreground">Hoy</TableCell><TableCell className="text-muted-foreground">Con los cambios aún no cerrados</TableCell><TableCell /><TableCell>{resumenFilas(actual).total}</TableCell><TableCell>{resumenFilas(actual).prioritarios}</TableCell><TableCell className="pr-6" />
              </TableRow>
              {versiones.map((v, i) => (
                <TableRow key={v.id} className={cn((ver === v.numero || comparar === v.numero) && "bg-sky-50/60")}>
                  <TableCell className="pl-6 font-medium">v{v.numero}{i === 0 && <Badge variant="secondary" className="ml-2">Última</Badge>}</TableCell>
                  <TableCell>{fecha(v.fecha)}</TableCell>
                  <TableCell className="whitespace-normal">{v.motivo}{esAntigua(v.snapshot) && <div className="text-[11px] text-muted-foreground">Copia antigua: procesos, zonas y cargos con sus nombres actuales</div>}</TableCell>
                  <TableCell className="text-muted-foreground">{v.cerradoPor ?? "—"}</TableCell>
                  <TableCell>{resumenes[i].total}</TableCell>
                  <TableCell>{resumenes[i].prioritarios}</TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end gap-1">
                      <Link href={`?v=${v.numero}`} className={buttonVariants({ size: "sm", variant: ver === v.numero ? "secondary" : "ghost" })}><Eye /> Ver</Link>
                      <Link href={`?comparar=${v.numero}`} className={buttonVariants({ size: "sm", variant: comparar === v.numero ? "secondary" : "ghost" })}><GitCompareArrows /> Comparar con vigente</Link>
                      <BotonDescarga href={`/api/empresas/${id}/matriz.xlsx?version=${v.numero}`} size="icon-sm" variant="ghost" aria-label={`Descargar v${v.numero} en Excel`}><Download /></BotonDescarga>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      )}

      {vista && (
        <Section title={`Versión ${vista.numero} — ${fecha(vista.fecha)}`} description={`${vista.motivo}. Solo lectura: así quedó la matriz al cerrar esta versión.`} contentClassName="px-0">
          <TablaFilas filas={filasVista} vacio="Esta versión no tenía peligros aprobados." />
        </Section>
      )}

      {base && diff && (
        <Section title={`Cambios desde v${base.numero} (${fecha(base.fecha)}) hasta hoy`} description={`${diff.agregados.length} peligro(s) agregados, ${diff.quitados.length} quitados y ${diff.cambiados.length} con cambios.`} contentClassName="px-0 space-y-4">
          <div>
            <div className="px-6 pb-1 text-sm font-medium text-emerald-700">Agregados ({diff.agregados.length})</div>
            <TablaFilas filas={diff.agregados} vacio="Ninguno." />
          </div>
          <div>
            <div className="px-6 pb-1 text-sm font-medium text-destructive">Quitados ({diff.quitados.length})</div>
            <TablaFilas filas={diff.quitados} vacio="Ninguno." />
          </div>
          <div>
            <div className="px-6 pb-1 text-sm font-medium text-amber-700">Con cambios ({diff.cambiados.length})</div>
            {diff.cambiados.length === 0 ? <p className="px-6 py-2 text-sm text-muted-foreground">Ninguno.</p> : (
              <Table className="[&_td]:align-top [&_td]:whitespace-normal">
                <TableHeader><TableRow><TableHead className="pl-6">Peligro</TableHead><TableHead>Qué cambió</TableHead><TableHead>Antes</TableHead><TableHead className="pr-6">Ahora</TableHead></TableRow></TableHeader>
                <TableBody>
                  {diff.cambiados.flatMap(({ fila, cambios }) => cambios.map((c, j) => (
                    <TableRow key={fila.id + c.campo}>
                      {j === 0 && <TableCell className="pl-6 text-xs" rowSpan={cambios.length}><div className="font-medium">{fila.descripcion}</div><div className="text-muted-foreground">{fila.tarea} · {fila.cargos.join(", ")}</div></TableCell>}
                      <TableCell className="text-xs">{c.campo}</TableCell>
                      <TableCell className="text-xs text-muted-foreground line-through decoration-destructive/40">{c.campo === "Nivel de riesgo" ? <Nivel n={c.antes} /> : c.antes || "—"}</TableCell>
                      <TableCell className="pr-6 text-xs">{c.campo === "Nivel de riesgo" ? <Nivel n={c.despues} /> : c.despues || "—"}</TableCell>
                    </TableRow>
                  )))}
                </TableBody>
              </Table>
            )}
          </div>
        </Section>
      )}
    </>
  );
}
