import Link from "next/link";
import { Tip } from "@/components/app/tip";
import { EstadoDocumento } from "@/components/documentos/estado-documento";
import { estadoDocumento, ESTADOS_DOC, type EstadoDoc } from "@/lib/estado-documento";
import { cn } from "@/lib/utils";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { Download, FileDown, PenLine } from "lucide-react";
import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { Section, NormaRef } from "@/components/app/ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoVacio } from "@/components/app/ilustraciones";
import { BotonGenerarTodo } from "@/components/empresa/acciones";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { completitud } from "@/lib/completitud";

export const dynamic = "force-dynamic";

export default async function Documentos({ params, searchParams }: PageProps<"/empresas/[id]/documentos">) {
  const { id } = await params;
  const filtro = (await searchParams).estado as EstadoDoc | undefined;
  const rr = await recalcularEmpresa(id);
  const [docs, plantillas] = await Promise.all([
    db.documento.findMany({ where: { empresaId: id }, include: { secciones: { select: { requiereRevision: true, contenidoEditado: true } }, archivos: { where: { activo: true, tipo: "DOCUMENTO_FIRMADO" }, orderBy: { subidoEn: "desc" }, take: 1 } } }),
    db.plantilla.findMany({ where: { codigo: { in: rr.documentos.map((d) => d.codigo) } }, orderBy: { codigo: "asc" } }),
  ]);
  // Estado efectivo de cada documento (generado, revisado, aprobado, firmado, por volver a firmar).
  const estadoDe = (codigo: string): EstadoDoc => {
    const d = docs.find((x) => x.codigo === codigo);
    return estadoDocumento(d ? { estado: d.estado, version: d.version, firmadoVersion: d.archivos[0]?.documentoVersion, revisar: d.secciones.some((s) => s.requiereRevision) } : null);
  };
  const conteo = Object.fromEntries((Object.keys(ESTADOS_DOC) as EstadoDoc[]).map((k) => [k, plantillas.filter((p) => estadoDe(p.codigo) === k).length])) as Record<EstadoDoc, number>;
  const visibles = filtro ? plantillas.filter((p) => estadoDe(p.codigo) === filtro) : plantillas;
  const carpetas = [...new Set(visibles.map((p) => p.carpeta ?? "Otros"))].sort();
  // Trazabilidad: cada dato faltante, dónde se llena y qué documentos afecta (calculado desde las plantillas).
  const comp = await completitud(id);
  const grupos = [...new Set(comp.faltantes.map((f) => f.grupo))].map((g) => {
    const xs = comp.faltantes.filter((f) => f.grupo === g);
    return { titulo: g, boton: xs[0].boton, href: xs[0].href, items: xs.map((f) => ({ t: f.detalle ? `${f.dato} — ${f.detalle}` : f.dato, docs: f.docs, href: f.href })) };
  });
  const totalFaltantes = grupos.reduce((n, g) => n + g.items.length, 0);
  const acciones = (
    <div className="flex gap-2">
      <BotonGenerarTodo empresaId={id} />
      <BotonDescarga href={`/api/empresas/${id}/paquete.zip`} variant="outline" texto="Armando el ZIP…" tooltip="Todos los documentos en Word organizados por carpetas, con la matriz y la evaluación en Excel"><Download /> Descargar todo (ZIP)</BotonDescarga>
    </div>
  );
  if (!docs.length) return (
    <EstadoVacio ilustracion="documentos" titulo={<>{rr.documentos.length} documentos aplicables, ninguno generado</>} descripcion={<>El sistema los redacta con los datos de la empresa, la matriz de peligros, la evaluación y el plan anual. Todo queda editable.</>}><BotonGenerarTodo empresaId={id} /></EstadoVacio>
  );
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{docs.length} de {rr.documentos.length} documentos generados · se actualizan solos al guardar Datos y Comités</span>
        <div className="flex-1" />{acciones}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-muted-foreground">Filtrar por estado:</span>
        <Link href="?" className={buttonVariants({ size: "xs", variant: filtro ? "ghost" : "secondary" })}>Todos ({plantillas.length})</Link>
        {(Object.keys(ESTADOS_DOC) as EstadoDoc[]).filter((k) => conteo[k] > 0).map((k) => (
          <Link key={k} href={filtro === k ? "?" : `?estado=${k}`} className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-opacity", ESTADOS_DOC[k].clase, filtro && filtro !== k && "opacity-50 hover:opacity-100", filtro === k && "ring-2 ring-ring/40")}>
            <span className={cn("size-1.5 rounded-full", ESTADOS_DOC[k].punto)} />{ESTADOS_DOC[k].t} · {conteo[k]}
          </Link>
        ))}
      </div>
      {grupos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="size-4 text-muted-foreground" /> Faltan {totalFaltantes} datos para que los documentos salgan completos · {comp.docsCompletos} de {comp.aplicables} documentos sin datos pendientes</CardTitle>
            <CardDescription>No tiene que volver a generar: al guardar estos datos, los documentos se actualizan solos. Mientras tanto salen con espacios en blanco o «Por definir». Cada documento muestra al abrirlo qué le falta.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {grupos.map((g) => (
              <div key={g.titulo} className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
                <div className="text-sm font-medium">{g.titulo}</div>
                <ul className="flex-1 space-y-2.5">
                  {g.items.map((it) => (
                    <li key={it.t} className="text-sm leading-snug">
                      <Link href={it.href} className="hover:underline">{it.t}</Link>
                      <div className="mt-1 flex flex-wrap gap-1">{it.docs.map((d) => <Badge key={d} variant="outline" className="font-mono text-[10px]">{d}</Badge>)}</div>
                    </li>
                  ))}
                </ul>
                <Link href={g.href} className={buttonVariants({ size: "sm", variant: "outline", className: "w-full" })}>{g.boton}</Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      {carpetas.map((c) => (
        <Section key={c} title={c} contentClassName="px-0">
          <Table className="[&_td]:whitespace-normal">
            <TableHeader><TableRow><TableHead className="pl-6 w-20">Código</TableHead><TableHead>Documento</TableHead><TableHead>Fundamento</TableHead><TableHead className="w-16">Versión</TableHead><TableHead className="w-40">Estado</TableHead><TableHead className="pr-6 w-48" /></TableRow></TableHeader>
            <TableBody>
              {visibles.filter((p) => (p.carpeta ?? "Otros") === c).map((p) => {
                const d = docs.find((x) => x.codigo === p.codigo);
                const editadas = d?.secciones.filter((s) => s.contenidoEditado).length ?? 0;
                const revisar = d?.secciones.filter((s) => s.requiereRevision).length ?? 0;
                return (
                  <TableRow key={p.codigo}>
                    <TableCell className="pl-6 font-mono text-xs">{p.codigo}</TableCell>
                    <TableCell>
                      <div className="font-medium"><Tip texto={<>{rr.documentos.find((x) => x.codigo === p.codigo)?.porque}{p.normas.length ? ` (${p.normas.join(", ")})` : ""}</>}><span>{p.nombre}</span></Tip></div>
                      <div className="flex gap-1 mt-1">{(comp.porDocumento[p.codigo]?.length ?? 0) > 0 && <Tip texto={comp.porDocumento[p.codigo].map((f) => f.dato).join(" · ")}><Badge variant="outline" className="border-amber-300 text-amber-800">Faltan {comp.porDocumento[p.codigo].length} dato(s)</Badge></Tip>}{editadas > 0 && <Badge variant="secondary">{editadas} secciones editadas</Badge>}{revisar > 0 && <Badge variant="outline" className="border-amber-300 text-amber-800">{revisar} sección(es) por revisar</Badge>}</div>
                    </TableCell>
                    <TableCell><div className="flex flex-wrap gap-1">{p.estandares.map((e) => <NormaRef key={e}>{e}</NormaRef>)}</div></TableCell>
                    <TableCell>{d ? `v${d.version}` : "—"}</TableCell>
                    <TableCell>
                      <EstadoDocumento estado={estadoDe(p.codigo)} version={d?.version} firmadoVersion={d?.archivos[0]?.documentoVersion} />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {d && <div className="flex justify-end gap-1">
                        <Link href={`/empresas/${id}/documentos/${p.codigo}`} title="Ver el documento, editar sus secciones y subir la versión firmada" className={buttonVariants({ size: "sm", variant: "outline" })}><PenLine /> Ver y editar</Link>
                        <BotonDescarga href={`/api/empresas/${id}/documentos/${p.codigo}`} size="icon-sm" variant="ghost" aria-label="Descargar en Word"><Download /></BotonDescarga>
                        <BotonDescarga href={`/api/empresas/${id}/documentos/${p.codigo}?formato=pdf`} size="icon-sm" variant="ghost" aria-label="Descargar en PDF"><FileDown /></BotonDescarga>
                      </div>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Section>
      ))}
    </>
  );
}
