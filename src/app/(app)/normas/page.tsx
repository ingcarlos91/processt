import { TablaPlazos } from "@/components/plazos/tabla-plazos";
import { PLAZOS } from "@/lib/plazos";
import { parametrosPlazos } from "@/lib/plazos-servidor";
import { db } from "@/lib/db";
import { Page, PageHeader, Section } from "@/components/app/ui";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

function cond(c: unknown) {
  const x = (c ?? {}) as Record<string, unknown>;
  if (x.siempre) return "Todas las empresas";
  if (x.nunca) return "No aplica (derogada)";
  const p: string[] = [];
  if (x.trabajadoresMin) p.push(`≥ ${x.trabajadoresMin} trabajadores`);
  if (x.vehiculosMin) p.push(`≥ ${x.vehiculosMin} vehículos`);
  if (x.disparador) p.push(`si hay ${x.disparador}`);
  if (x.aprendicesMin) p.push("si hay aprendices");
  return p.join(", ") || "Según condición";
}

export default async function Normas({ searchParams }: PageProps<"/normas">) {
  const tab = (await searchParams).tab;
  const [normas, estandares, reglas] = await Promise.all([
    db.norma.findMany({ orderBy: [{ vigente: "desc" }, { anio: "desc" }] }),
    db.estandar.findMany({ orderBy: { orden: "asc" } }),
    db.reglaAplicabilidad.findMany({ orderBy: [{ prioridad: "desc" }, { codigo: "asc" }] }),
  ]);
  return (
    <Page>
      <PageHeader title="Normas y estándares" description="Base normativa del sistema. Toda conclusión, documento y actividad cita una de estas normas. Corte: noviembre de 2026." />
      <Tabs defaultValue={tab === "plazos" ? "plazos" : "normas"}>
        <TabsList><TabsTrigger value="normas">Normas ({normas.length})</TabsTrigger><TabsTrigger value="estandares">Estándares mínimos (60)</TabsTrigger><TabsTrigger value="reglas">Reglas de aplicabilidad ({reglas.length})</TabsTrigger><TabsTrigger value="plazos">Plazos y tareas automáticas ({PLAZOS.length})</TabsTrigger></TabsList>
        <TabsContent value="plazos" className="mt-4"><TablaPlazos parametros={await parametrosPlazos()} /></TabsContent>
        <TabsContent value="normas" className="mt-4">
          <Section contentClassName="px-0">
            <Table className="[&_td]:whitespace-normal [&_td]:align-top">
              <TableHeader><TableRow><TableHead className="pl-6">Norma</TableHead><TableHead>Tema</TableHead><TableHead>Resumen</TableHead><TableHead>Aplica a</TableHead><TableHead className="pr-6">Estado</TableHead></TableRow></TableHeader>
              <TableBody>
                {normas.map((n) => (
                  <TableRow key={n.codigo}>
                    <TableCell className="pl-6 min-w-56"><div className="font-medium">{n.tipo === "Resolucion" ? "Resolución" : n.tipo === "GuiaTecnica" ? "Guía técnica" : n.tipo} {n.numero} de {n.anio}</div><div className="text-xs text-muted-foreground">{n.entidad}</div>{n.urlOficial && <a href={n.urlOficial} target="_blank" rel="noreferrer" className="text-xs underline">Texto</a>}</TableCell>
                    <TableCell><Badge variant="outline">{n.tema}</Badge></TableCell>
                    <TableCell className="text-xs min-w-96"><div className="font-medium">{n.nombre}</div>{n.resumen}{n.articulosClave && <div className="text-muted-foreground mt-1">{n.articulosClave}</div>}</TableCell>
                    <TableCell className="text-xs">{cond(n.condicionAplicabilidad)}</TableCell>
                    <TableCell className="pr-6">{n.vigente ? <Badge variant="secondary">Vigente</Badge> : <Badge variant="destructive">Derogada</Badge>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </TabsContent>
        <TabsContent value="estandares" className="mt-4">
          <Section description="Tabla de valores, Resolución 0312 de 2019 art. 27. Columnas 7 y 21: ítems que aplican a empresas pequeñas (arts. 3 y 9)." contentClassName="px-0">
            <Table className="[&_td]:whitespace-normal [&_td]:align-top">
              <TableHeader><TableRow><TableHead className="pl-6">Ítem</TableHead><TableHead>Ciclo</TableHead><TableHead>Estándar</TableHead><TableHead>Valor</TableHead><TableHead>7</TableHead><TableHead>21</TableHead><TableHead className="pr-6">Modo de verificación</TableHead></TableRow></TableHeader>
              <TableBody>
                {estandares.map((e) => (
                  <TableRow key={e.codigo}>
                    <TableCell className="pl-6 font-mono text-xs">{e.codigo}</TableCell><TableCell className="text-xs">{e.ciclo}</TableCell>
                    <TableCell className="min-w-72"><div className="text-xs text-muted-foreground">{e.grupo}</div>{e.descripcion}</TableCell>
                    <TableCell>{e.puntaje}</TableCell><TableCell>{e.aplica7 ? "✓" : ""}</TableCell><TableCell>{e.aplica21 ? "✓" : ""}</TableCell>
                    <TableCell className="pr-6 text-xs min-w-80">{e.modoVerificacion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </TabsContent>
        <TabsContent value="reglas" className="mt-4">
          <Section contentClassName="px-0">
            <Table className="[&_td]:whitespace-normal">
              <TableHeader><TableRow><TableHead className="pl-6">Regla</TableHead><TableHead>Condición</TableHead><TableHead>Efecto</TableHead><TableHead className="pr-6">Fundamento</TableHead></TableRow></TableHeader>
              <TableBody>
                {reglas.map((r) => (
                  <TableRow key={r.codigo}>
                    <TableCell className="pl-6 font-medium">{r.nombre}</TableCell>
                    <TableCell><code className="text-[11px]">{JSON.stringify(r.condicion)}</code></TableCell>
                    <TableCell className="text-xs">{(r.efecto as { mensaje?: string }).mensaje}</TableCell>
                    <TableCell className="pr-6"><Badge variant="secondary">{r.normaRef}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Section>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
