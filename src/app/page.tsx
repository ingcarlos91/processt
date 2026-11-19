import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { Page, PageHeader, Section, Stat } from "@/components/app/ui";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export const dynamic = "force-dynamic";

const VARIANTE: Record<string, "destructive" | "secondary" | "default"> = { "CRÍTICO": "destructive", "MODERADAMENTE ACEPTABLE": "secondary", ACEPTABLE: "default" };

export default async function Home() {
  const empresas = await db.empresa.findMany({
    orderBy: { razonSocial: "asc" },
    include: { evaluaciones: { orderBy: { fecha: "desc" }, take: 1 }, actividades: { select: { estado: true, mes: true, anio: true } }, _count: { select: { documentos: true, peligros: true } } },
  });
  const mes = new Date().getMonth() + 1;
  const anio = new Date().getFullYear();
  const pendientesMes = empresas.reduce((s, e) => s + e.actividades.filter((a) => a.anio === anio && a.mes === mes && a.estado === "PENDIENTE").length, 0);
  const vencidas = empresas.reduce((s, e) => s + e.actividades.filter((a) => a.anio === anio && a.mes < mes && a.estado === "PENDIENTE").length, 0);
  const nueva = <Link href="/empresas/nueva" className={buttonVariants()}><Plus /> Nueva empresa</Link>;

  return (
    <Page>
      <PageHeader title="Empresas" description="Cada empresa cliente con su SG-SST: nivel de estándares mínimos (Res. 0312/2019), evaluación, matriz de peligros, documentos y plan anual." actions={nueva} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Empresas activas" value={empresas.length} />
        <Stat label="Actividades pendientes este mes" value={pendientesMes} />
        <Stat label="Actividades vencidas" value={vencidas} tone={vencidas ? "bad" : "ok"} />
        <Stat label="Documentos generados" value={empresas.reduce((s, e) => s + e._count.documentos, 0)} />
      </div>
      {empresas.length === 0 ? (
        <Empty className="border bg-background">
          <EmptyHeader>
            <EmptyMedia><Image src="/brand/icono.png" alt="" width={56} height={52} /></EmptyMedia>
            <EmptyTitle>Aún no hay empresas</EmptyTitle>
            <EmptyDescription>Cree la primera empresa y el sistema generará su SG-SST completo según la norma.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>{nueva}</EmptyContent>
        </Empty>
      ) : (
        <Section contentClassName="px-0">
          <Table>
            <TableHeader>
              <TableRow><TableHead className="pl-6">Empresa</TableHead><TableHead>Riesgo</TableHead><TableHead>Trabajadores</TableHead><TableHead>Estándares</TableHead><TableHead>Última evaluación</TableHead><TableHead>Plan anual</TableHead><TableHead>Matriz</TableHead><TableHead className="pr-6">Documentos</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {empresas.map((e) => {
                const ev = e.evaluaciones[0];
                const p = ev ? (ev.nivel === 60 ? ev.puntajeBruto : ev.puntajeAjustado) : null;
                const acts = e.actividades.filter((a) => a.anio === anio);
                const ej = acts.filter((a) => a.estado === "EJECUTADA").length;
                return (
                  <TableRow key={e.id}>
                    <TableCell className="pl-6"><Link href={`/empresas/${e.id}`} className="font-medium hover:underline">{e.razonSocial}</Link><div className="text-xs text-muted-foreground">NIT {e.nit}{e.digitoVerificacion ? `-${e.digitoVerificacion}` : ""} · {e.ciudad}</div></TableCell>
                    <TableCell>{["", "I", "II", "III", "IV", "V"][e.claseRiesgo]}</TableCell>
                    <TableCell>{e.nTrabajadoresPlanta + e.nEnMision}</TableCell>
                    <TableCell><Badge variant="outline">{e.nivelEstandares}</Badge></TableCell>
                    <TableCell>{ev?.valoracion ? <Badge variant={VARIANTE[ev.valoracion]}>{p}% · {ev.valoracion}</Badge> : <span className="text-xs text-muted-foreground">{ev ? "En curso" : "Sin evaluar"}</span>}</TableCell>
                    <TableCell>{acts.length ? `${Math.round((ej / acts.length) * 100)}% (${ej}/${acts.length})` : <span className="text-xs text-muted-foreground">Sin plan</span>}</TableCell>
                    <TableCell>{e._count.peligros} peligros</TableCell>
                    <TableCell className="pr-6">{e._count.documentos}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Section>
      )}
    </Page>
  );
}
