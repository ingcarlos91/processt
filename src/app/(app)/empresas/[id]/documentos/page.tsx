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
import { Porque } from "@/components/app/porque";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardList } from "lucide-react";
import { faltantes, type Complementarios } from "@/lib/complementarios";

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
  const emp = await db.empresa.findUniqueOrThrow({ where: { id }, select: { datosComplementarios: true, disparadores: true, comites: { select: { tipo: true, _count: { select: { miembros: true } } } } } });
  const falta = faltantes((emp.datosComplementarios ?? {}) as Complementarios, (emp.disparadores ?? {}) as Record<string, boolean>, rr.documentos.map((d) => d.codigo));
  const comitesSinIntegrantes = rr.comites.filter((c) => !emp.comites.some((x) => (x.tipo === c || (c === "COPASST" && x.tipo === "VIGIA")) && x._count.miembros > 0));
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
      {(falta.length > 0 || comitesSinIntegrantes.length > 0) && (
        <Alert>
          <ClipboardList />
          <AlertTitle>Para que los documentos salgan completos faltan algunos datos</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-0.5">
              {falta.map((f) => <li key={f.k}>{f.etiqueta} <span className="text-muted-foreground">({f.documentos.join(", ")})</span></li>)}
              {comitesSinIntegrantes.map((c) => <li key={c}>Integrantes de {c === "COPASST" ? "COPASST o Vigía" : c === "CCL" ? "Comité de Convivencia" : "brigada"} <span className="text-muted-foreground">(se registran en Comités)</span></li>)}
            </ul>
            Mientras tanto, los documentos salen con espacios en blanco para llenar a mano.
          </AlertDescription>
          <AlertAction className="flex flex-col gap-1">
            {falta.length > 0 && <Link href={`/empresas/${id}/datos#complementarios`} className={buttonVariants({ size: "sm" })}>Completar datos</Link>}
            {comitesSinIntegrantes.length > 0 && <Link href={`/empresas/${id}/comites`} className={buttonVariants({ size: "sm", variant: "outline" })}>Ir a Comités</Link>}
          </AlertAction>
        </Alert>
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
