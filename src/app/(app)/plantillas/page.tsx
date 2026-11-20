import Link from "next/link";
import { PenLine, Eye } from "lucide-react";
import { db } from "@/lib/db";
import { usuarioActual } from "@/lib/auth/sesion";
import { plantillasDe } from "@/lib/plantillas";
import { Page, PageHeader, Section, NormaRef } from "@/components/app/ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function Plantillas() {
  const u = await usuarioActual();
  const [ps, usos] = await Promise.all([
    plantillasDe(u.consultoraId),
    // Documentos generados con cada plantilla, solo de las empresas de esta consultora.
    db.documento.groupBy({ by: ["plantillaId"], where: { empresa: { consultoraId: u.consultoraId } }, _count: { _all: true } }),
  ]);
  const nDocs = new Map(usos.map((x) => [x.plantillaId, x._count._all]));
  const carpetas = [...new Set(ps.map((p) => p.carpeta ?? "Otros"))].sort();
  return (
    <Page>
      <PageHeader title="Plantillas" description="Texto de cada documento del SG-SST. La base la mantiene PROCESST y se actualiza con las normas; si ajusta una plantilla, su consultora usa su versión propia (las demás consultoras no la ven). Lo que cambie llega a sus empresas al regenerar los documentos; las secciones editadas a mano se conservan." />
      {carpetas.map((c) => (
        <Section key={c} title={c} contentClassName="px-0">
          <Table className="[&_td]:whitespace-normal">
            <TableHeader><TableRow><TableHead className="pl-6 w-20">Código</TableHead><TableHead>Plantilla</TableHead><TableHead>Aplica desde</TableHead><TableHead>Estándares</TableHead><TableHead className="text-right">Versión</TableHead><TableHead className="text-right">Usos</TableHead><TableHead className="pr-6" /></TableRow></TableHeader>
            <TableBody>
              {ps.filter((p) => (p.carpeta ?? "Otros") === c).map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-6 font-mono text-xs">{p.codigo}</TableCell>
                  <TableCell className="font-medium">{p.nombre}{p.condicion ? <Badge variant="secondary" className="ml-2">condicional</Badge> : null}{p.propia ? <Badge className="ml-2">versión propia</Badge> : null}{p.propia && p.baseVersion !== null && p.versionBase > p.baseVersion ? <Badge variant="outline" className="ml-2 border-amber-300 text-amber-800">la base cambió</Badge> : null}</TableCell>
                  <TableCell><Badge variant="outline">nivel {p.nivelMin}</Badge></TableCell>
                  <TableCell><div className="flex flex-wrap gap-1">{p.estandares.map((e) => <NormaRef key={e}>{e}</NormaRef>)}</div></TableCell>
                  <TableCell className="text-right tabular-nums">v{p.version}</TableCell>
                  <TableCell className="text-right tabular-nums">{nDocs.get(p.id) ?? 0}</TableCell>
                  <TableCell className="pr-6 text-right"><div className="inline-flex gap-1.5"><Link href={`/plantillas/${p.codigo}/ver`} className={buttonVariants({ size: "sm" })}><Eye /> Ver</Link><Link href={`/plantillas/${p.codigo}`} className={buttonVariants({ size: "sm", variant: "outline" })}><PenLine /> Editar</Link></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      ))}
    </Page>
  );
}
