import Link from "next/link";
import { PenLine } from "lucide-react";
import { db } from "@/lib/db";
import { Page, PageHeader, Section, NormaRef } from "@/components/app/ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function Plantillas() {
  const ps = await db.plantilla.findMany({ orderBy: { codigo: "asc" }, include: { _count: { select: { documentos: true } } } });
  const carpetas = [...new Set(ps.map((p) => p.carpeta ?? "Otros"))].sort();
  return (
    <Page>
      <PageHeader title="Plantillas" description="Texto base de cada documento, escrito sobre la norma. Al editar una plantilla, los documentos de las empresas se actualizan cuando los regenere (sus ediciones manuales por sección se conservan)." />
      {carpetas.map((c) => (
        <Section key={c} title={c} contentClassName="px-0">
          <Table className="[&_td]:whitespace-normal">
            <TableHeader><TableRow><TableHead className="pl-6 w-20">Código</TableHead><TableHead>Plantilla</TableHead><TableHead>Aplica desde</TableHead><TableHead>Estándares</TableHead><TableHead>Versión</TableHead><TableHead>Usos</TableHead><TableHead className="pr-6" /></TableRow></TableHeader>
            <TableBody>
              {ps.filter((p) => (p.carpeta ?? "Otros") === c).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-6 font-mono text-xs">{p.codigo}</TableCell>
                  <TableCell className="font-medium">{p.nombre}{p.condicion ? <Badge variant="secondary" className="ml-2">condicional</Badge> : null}</TableCell>
                  <TableCell><Badge variant="outline">nivel {p.nivelMin}</Badge></TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{p.estandares.map((e) => <NormaRef key={e}>{e}</NormaRef>)}</div></TableCell>
                  <TableCell>v{p.version}</TableCell>
                  <TableCell>{p._count.documentos}</TableCell>
                  <TableCell className="pr-6 text-right"><Link href={`/plantillas/${p.codigo}`} className={buttonVariants({ size: "sm", variant: "outline" })}><PenLine /> Editar</Link></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      ))}
    </Page>
  );
}
