import Link from "next/link";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { Download, FileText, PenLine } from "lucide-react";
import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { Section, NormaRef } from "@/components/app/ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { BotonGenerarTodo } from "@/components/empresa/acciones";
import { Porque } from "@/components/app/porque";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { faltantes, SECCIONES, type Complementarios } from "@/lib/complementarios";

export const dynamic = "force-dynamic";
const ESTADO: Record<string, "outline" | "secondary" | "default"> = { BORRADOR: "outline", APROBADO: "secondary", FIRMADO: "default" };

export default async function Documentos({ params }: PageProps<"/empresas/[id]/documentos">) {
  const { id } = await params;
  const rr = await recalcularEmpresa(id);
  const [docs, plantillas] = await Promise.all([
    db.documento.findMany({ where: { empresaId: id }, include: { secciones: { select: { requiereRevision: true, contenidoEditado: true } }, archivos: { where: { activo: true, tipo: "DOCUMENTO_FIRMADO" }, orderBy: { subidoEn: "desc" }, take: 1 } } }),
    db.plantilla.findMany({ where: { codigo: { in: rr.documentos.map((d) => d.codigo) } }, orderBy: { codigo: "asc" } }),
  ]);
  const carpetas = [...new Set(plantillas.map((p) => p.carpeta ?? "Otros"))].sort();
  const emp = await db.empresa.findUniqueOrThrow({ where: { id }, select: { datosComplementarios: true, disparadores: true, responsableSst: true, comites: { select: { tipo: true, _count: { select: { miembros: true } } } } } });
  const resp = (emp.responsableSst ?? {}) as { nombre?: string; licencia?: string; cedula?: string };
  const faltaResp = [!resp.nombre?.trim() && "nombre", !resp.cedula?.trim() && "cédula", !resp.licencia?.trim() && "licencia"].filter(Boolean) as string[];
  const falta = faltantes((emp.datosComplementarios ?? {}) as Complementarios, (emp.disparadores ?? {}) as Record<string, boolean>, rr.documentos.map((d) => d.codigo));
  const comitesSinIntegrantes = [...new Set(rr.comites)].filter((c) => !emp.comites.some((x) => (x.tipo === c || (c === "COPASST" && x.tipo === "VIGIA")) && x._count.miembros > 0));
  const NOMBRE_COMITE: Record<string, string> = { COPASST: "COPASST", VIGIA: "Vigía de SST", CCL: "Comité de Convivencia Laboral", BRIGADA: "Brigada de emergencias" };
  const DOCS_COMITE: Record<string, string[]> = { COPASST: ["ACT-01", "ACT-02"], VIGIA: ["ACT-01", "ACT-02"], CCL: ["ACT-04"], BRIGADA: ["ACT-05", "PLN-04"] };
  const seccionDe = (k: string) => SECCIONES.find((x) => x.campos.some((c) => c.k === k));
  const grupos = [
    ...(faltaResp.length ? [{ titulo: "Responsable del SG-SST", boton: "Ir a Datos", href: `/empresas/${id}/datos`, items: [{ t: `Falta: ${faltaResp.join(", ")}`, docs: ["DOC-03", "Firmas", "Elaboró"] }] }] : []),
    ...SECCIONES.map((sec) => ({ sec, items: falta.filter((f) => seccionDe(f.k)?.id === sec.id) })).filter((x) => x.items.length)
      .map(({ sec, items }) => ({ titulo: sec.titulo, boton: "Completar datos", href: `/empresas/${id}/datos#complementarios`, items: items.map((f) => ({ t: f.etiqueta, docs: f.documentos })) })),
    ...(comitesSinIntegrantes.length ? [{ titulo: "Comités", boton: "Ir a Comités", href: `/empresas/${id}/comites`, items: comitesSinIntegrantes.map((c) => ({ t: `Integrantes: ${NOMBRE_COMITE[c] ?? c}`, docs: DOCS_COMITE[c] ?? [] })) }] : []),
  ];
  const totalFaltantes = grupos.reduce((n, g) => n + g.items.length, 0);
  const acciones = (
    <div className="flex gap-2">
      <BotonGenerarTodo empresaId={id} />
      <BotonDescarga href={`/api/empresas/${id}/paquete.zip`} variant="outline" texto="Armando el ZIP…" tooltip="Todos los documentos en Word organizados por carpetas, con la matriz y la evaluación en Excel"><Download /> Descargar todo (ZIP)</BotonDescarga>
    </div>
  );
  if (!docs.length) return (
    <Empty className="border bg-background">
      <EmptyHeader>
        <EmptyMedia variant="icon"><FileText /></EmptyMedia>
        <EmptyTitle>{rr.documentos.length} documentos aplicables, ninguno generado</EmptyTitle>
        <EmptyDescription>El sistema los redacta con los datos de la empresa, la matriz de peligros, la evaluación y el plan anual. Todo queda editable.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent><BotonGenerarTodo empresaId={id} /></EmptyContent>
    </Empty>
  );
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{docs.length} de {rr.documentos.length} documentos generados · se actualizan solos al guardar Datos y Comités</span>
        <div className="flex-1" />{acciones}
      </div>
      {grupos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="size-4 text-muted-foreground" /> Faltan {totalFaltantes} datos para que los documentos salgan completos</CardTitle>
            <CardDescription>No tiene que volver a generar: al guardar estos datos, los documentos se actualizan solos. Mientras tanto salen con espacios en blanco para llenar a mano.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {grupos.map((g) => (
              <div key={g.titulo} className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
                <div className="text-sm font-medium">{g.titulo}</div>
                <ul className="flex-1 space-y-2.5">
                  {g.items.map((it) => (
                    <li key={it.t} className="text-sm leading-snug">
                      <div>{it.t}</div>
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
            <TableHeader><TableRow><TableHead className="pl-6 w-20">Código</TableHead><TableHead>Documento</TableHead><TableHead>Fundamento</TableHead><TableHead className="w-16">Versión</TableHead><TableHead className="w-28">Estado</TableHead><TableHead className="pr-6 w-48" /></TableRow></TableHeader>
            <TableBody>
              {plantillas.filter((p) => (p.carpeta ?? "Otros") === c).map((p) => {
                const d = docs.find((x) => x.codigo === p.codigo);
                const editadas = d?.secciones.filter((s) => s.contenidoEditado).length ?? 0;
                const revisar = d?.secciones.filter((s) => s.requiereRevision).length ?? 0;
                return (
                  <TableRow key={p.codigo}>
                    <TableCell className="pl-6 font-mono text-xs">{p.codigo}</TableCell>
                    <TableCell>
                      <div className="font-medium">{p.nombre} <Porque titulo={`¿Por qué ${p.codigo}?`} normas={p.normas}>{rr.documentos.find((x) => x.codigo === p.codigo)?.porque}</Porque></div>
                      <div className="flex gap-1 mt-1">{editadas > 0 && <Badge variant="secondary">{editadas} secciones editadas</Badge>}{revisar > 0 && <Badge variant="destructive">{revisar} por revisar</Badge>}</div>
                    </TableCell>
                    <TableCell><div className="flex flex-wrap gap-1">{p.estandares.map((e) => <NormaRef key={e}>{e}</NormaRef>)}</div></TableCell>
                    <TableCell>{d ? `v${d.version}` : "—"}</TableCell>
                    <TableCell>
                      {d ? <Badge variant={ESTADO[d.estado]}>{d.estado.toLowerCase()}{d.archivos[0] ? ` v${d.archivos[0].documentoVersion}` : ""}</Badge> : <Badge variant="outline">sin generar</Badge>}
                      {d?.archivos[0]?.documentoVersion && d.archivos[0].documentoVersion < d.version && <Badge variant="destructive" className="ml-1">cambió después de firmar</Badge>}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {d && <div className="flex justify-end gap-1">
                        <Link href={`/empresas/${id}/documentos/${p.codigo}`} title="Ver el documento, editar sus secciones y subir la versión firmada" className={buttonVariants({ size: "sm", variant: "outline" })}><PenLine /> Ver y editar</Link>
                        <BotonDescarga href={`/api/empresas/${id}/documentos/${p.codigo}`} size="icon-sm" variant="ghost" aria-label="Descargar en Word"><Download /></BotonDescarga>
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
