import Link from "next/link";
import { Download, FileText, PenLine } from "lucide-react";
import { db } from "@/lib/db";
import { recalcularEmpresa } from "@/lib/empresa";
import { Section, NormaRef } from "@/components/app/ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { BotonGenerarTodo } from "@/components/empresa/acciones";

export const dynamic = "force-dynamic";
const ESTADO: Record<string, "outline" | "secondary" | "default"> = { BORRADOR: "outline", APROBADO: "secondary", FIRMADO: "default" };

export default async function Documentos({ params }: PageProps<"/empresas/[id]/documentos">) {
  const { id } = await params;
  const rr = await recalcularEmpresa(id);
  const [docs, plantillas] = await Promise.all([
    db.documento.findMany({ where: { empresaId: id }, include: { secciones: { select: { requiereRevision: true, contenidoEditado: true } } } }),
    db.plantilla.findMany({ where: { codigo: { in: rr.documentos.map((d) => d.codigo) } }, orderBy: { codigo: "asc" } }),
  ]);
  const carpetas = [...new Set(plantillas.map((p) => p.carpeta ?? "Otros"))].sort();
  const acciones = (
    <div className="flex gap-2">
      <BotonGenerarTodo empresaId={id} />
      <a href={`/api/empresas/${id}/paquete.zip`} className={buttonVariants({ variant: "outline" })}><Download /> Descargar todo (ZIP)</a>
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
        <span className="text-sm text-muted-foreground">{docs.length} de {rr.documentos.length} documentos generados · se conservan las ediciones manuales al regenerar</span>
        <div className="flex-1" />{acciones}
      </div>
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
                      <div className="font-medium">{p.nombre}</div>
                      <div className="flex gap-1 mt-1">{editadas > 0 && <Badge variant="secondary">{editadas} secciones editadas</Badge>}{revisar > 0 && <Badge variant="destructive">{revisar} por revisar</Badge>}</div>
                    </TableCell>
                    <TableCell><div className="flex flex-wrap gap-1">{p.estandares.map((e) => <NormaRef key={e}>{e}</NormaRef>)}</div></TableCell>
                    <TableCell>{d ? `v${d.version}` : "—"}</TableCell>
                    <TableCell>{d ? <Badge variant={ESTADO[d.estado]}>{d.estado.toLowerCase()}</Badge> : <Badge variant="outline">sin generar</Badge>}</TableCell>
                    <TableCell className="pr-6 text-right">
                      {d && <div className="flex justify-end gap-1">
                        <Link href={`/empresas/${id}/documentos/${p.codigo}`} className={buttonVariants({ size: "sm", variant: "outline" })}><PenLine /> Ver y editar</Link>
                        <a href={`/api/empresas/${id}/documentos/${p.codigo}`} className={buttonVariants({ size: "icon-sm", variant: "ghost" })} aria-label="Descargar Word"><Download /></a>
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
