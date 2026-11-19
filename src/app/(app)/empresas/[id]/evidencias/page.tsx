import Link from "next/link";
import { BotonDescarga } from "@/components/app/boton-descarga";
import { Download, FileCheck2, FileWarning } from "lucide-react";
import { expedientePorEstandar } from "@/lib/expediente";
import { aArchivoUI } from "@/lib/archivos-ui";
import { Section, Stat, NormaRef } from "@/components/app/ui";
import { Badge } from "@/components/ui/badge";

import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SubirArchivo, ListaArchivos } from "@/components/app/adjuntos";

export const dynamic = "force-dynamic";
const ESTADO: Record<string, { t: string; v: "default" | "secondary" | "destructive" | "outline" }> = { CUMPLE: { t: "Cumple", v: "default" }, NO_CUMPLE: { t: "No cumple", v: "destructive" }, NO_APLICA: { t: "No aplica", v: "secondary" }, PENDIENTE: { t: "Sin evaluar", v: "outline" } };

export default async function Evidencias({ params }: PageProps<"/empresas/[id]/evidencias">) {
  const { id } = await params;
  const exp = await expedientePorEstandar(id);
  const con = exp.filter((x) => x.conSoporte).length;
  const docs = exp.flatMap((x) => x.documentos);
  const unicos = [...new Map(docs.map((d) => [d.codigo, d])).values()];
  const firmados = unicos.filter((d) => d.firmado).length;
  const grupos = [...new Set(exp.map((x) => x.grupo))];
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted-foreground max-w-3xl text-pretty">Soportes del cumplimiento, organizados por estándar como los revisa el inspector (Res. 0312/2019 art. 16). Los archivos retirados quedan en el historial.</p>
        <div className="flex-1" />
        <BotonDescarga variant="default" texto="Armando el expediente…" href={`/api/empresas/${id}/expediente.zip`} tooltip="Una carpeta por estándar con documentos firmados, evidencias e índice; lista para una visita del Ministerio o la ARL"><Download /> Descargar expediente (ZIP)</BotonDescarga>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat label="Estándares con soporte" value={`${con} / ${exp.length}`} hint={<Progress value={(con / Math.max(1, exp.length)) * 100} className="w-full" />} tone={con === exp.length ? "ok" : undefined} />
        <Stat label="Documentos firmados" value={`${firmados} / ${unicos.length}`} hint="Suba el firmado desde cada documento" />
        <Stat label="Evidencias de ejecución" value={exp.reduce((s, x) => s + x.evidencias.length, 0)} hint="Listas de asistencia, fotos, actas, informes" />
      </div>
      {grupos.map((g) => (
        <Section key={g} title={g} contentClassName="px-0">
          <Table className="[&_td]:whitespace-normal [&_td]:align-top">
            <TableHeader><TableRow><TableHead className="pl-6 w-16">Ítem</TableHead><TableHead>Estándar y lo que pide el inspector</TableHead><TableHead className="w-72">Documentos</TableHead><TableHead className="pr-6 w-96">Evidencias</TableHead></TableRow></TableHeader>
            <TableBody>
              {exp.filter((x) => x.grupo === g).map((x) => (
                <TableRow key={x.codigo} className={x.conSoporte ? "" : "bg-amber-50/50"}>
                  <TableCell className="pl-6 font-mono text-xs">{x.codigo}{x.conSoporte ? <FileCheck2 className="size-4 text-emerald-600 mt-1" /> : <FileWarning className="size-4 text-amber-600 mt-1" />}</TableCell>
                  <TableCell><div className="font-medium text-sm">{x.descripcion}</div><div className="text-xs text-muted-foreground mt-1">{x.modo}</div><Badge variant={ESTADO[x.estado].v} className="mt-1">{ESTADO[x.estado].t}</Badge></TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {x.documentos.map((d) => (
                        <Link key={d.codigo} href={`/empresas/${id}/documentos/${d.codigo}`} className="text-xs hover:underline">
                          <Badge variant={d.firmado ? "default" : "outline"} className="mr-1">{d.firmado ? "firmado" : "sin firmar"}</Badge>{d.codigo} {d.nombre}
                        </Link>
                      ))}
                      {!x.documentos.length && <span className="text-xs text-muted-foreground">No requiere documento propio</span>}
                    </div>
                  </TableCell>
                  <TableCell className="pr-6 space-y-2">
                    <ListaArchivos empresaId={id} archivos={x.evidencias.map(aArchivoUI)} compacta vacio="Sin evidencias." />
                    <SubirArchivo empresaId={id} ctx={{ tipo: "EVIDENCIA", estandarCodigo: x.codigo }} titulo={`Subir evidencia del ítem ${x.codigo}`} ayuda={x.modo} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>
      ))}
      <p className="text-xs text-muted-foreground">Las evidencias del plan anual y las actas de comités aparecen aquí en el estándar que les corresponde. <NormaRef>Res. 0312/2019 art. 16</NormaRef></p>
    </>
  );
}
