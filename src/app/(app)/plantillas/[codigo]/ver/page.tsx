import Link from "next/link";
import { notFound } from "next/navigation";
import { PenLine } from "lucide-react";
import { db } from "@/lib/db";
import { Page, PageHeader, NormaRef } from "@/components/app/ui";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { construirContexto } from "@/lib/generador/contexto";
import { render, dividirSecciones } from "@/lib/generador/plantilla";
import { mdAHtml } from "@/lib/generador/exportar";
import { SustentoNormativo } from "@/components/trazabilidad/sustento-normativo";
import { REQUISITOS, coberturaRequisitos, perfilDe, type PerfilRequisitos } from "@/lib/requisitos";
import { SelectorEmpresaVista } from "@/components/biblioteca/selector-empresa-vista";

export const dynamic = "force-dynamic";

/** Vista de lectura de una plantilla: se arma con los datos de una empresa real, como la verá el cliente. */
export default async function VerPlantilla({ params, searchParams }: PageProps<"/plantillas/[codigo]/ver">) {
  const { codigo } = await params;
  const sp = await searchParams;
  const p = await db.plantilla.findUnique({ where: { codigo } });
  if (!p) notFound();
  const empresas = await db.empresa.findMany({ orderBy: { razonSocial: "asc" }, select: { id: true, razonSocial: true } });
  const empresaId = (typeof sp.empresa === "string" && empresas.some((e) => e.id === sp.empresa) ? sp.empresa : empresas[0]?.id) ?? null;

  const normas = await db.norma.findMany({ where: { codigo: { in: [...new Set([...p.normas, ...(REQUISITOS[codigo] ?? []).map((r) => r.norma)])] } }, select: { codigo: true, tipo: true, numero: true, anio: true } });
  const corta = (c: string) => { const n = normas.find((x) => x.codigo === c); return n ? `${n.tipo === "Resolucion" ? "Res." : n.tipo === "GuiaTecnica" ? "GTC" : n.tipo} ${n.numero}/${n.anio}` : c; };

  let contenido: React.ReactNode;
  let aplica: boolean | null = null;
  let perfil: PerfilRequisitos | undefined;
  let secciones: { titulo: string; contenido: string }[] = [];
  if (!empresaId) {
    contenido = <Alert><AlertTitle>No hay empresas para armar la vista</AlertTitle><AlertDescription>La plantilla se muestra con los datos de una empresa. Registre una empresa y vuelva a esta página.</AlertDescription></Alert>;
  } else {
    let md: string;
    try {
      const ctx = await construirContexto(empresaId);
      aplica = ctx._reglas.documentos.some((d) => d.codigo === codigo);
      perfil = perfilDe(ctx._reglas);
      md = render(p.contenidoMd, ctx);
    } catch (e) {
      md = `**No se pudo armar la plantilla con los datos de esta empresa.** ${e instanceof Error ? e.message : ""}`;
    }
    secciones = dividirSecciones(md);
    const html = await mdAHtml(md);
    contenido = (
      <article className="mx-auto w-full max-w-4xl rounded-lg border bg-white px-6 py-8 shadow-sm sm:px-12 sm:py-10 dark:bg-card">
        <header className="mb-6 border-b pb-4">
          <p className="font-mono text-xs text-muted-foreground">{p.codigo} · versión {p.version}</p>
          <h1 className="text-xl font-semibold">{p.nombre}</h1>
        </header>
        <div className="prose-doc [&_h2]:mt-6 [&_h2]:border-b [&_h2]:pb-1 [&_h2]:text-base [&_h2]:font-semibold" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    );
  }
  const cobertura = coberturaRequisitos(codigo, secciones, perfil);

  return (
    <Page>
      <PageHeader
        title={`${p.codigo} · ${p.nombre}`}
        description={<span className="flex flex-wrap gap-1">{p.normas.map((n) => <NormaRef key={n}>{corta(n)}</NormaRef>)}</span>}
        actions={<Link href={`/plantillas/${p.codigo}`} className={buttonVariants({ variant: "outline", size: "sm" })}><PenLine /> Editar plantilla</Link>}
      />
      <div className="space-y-4">
        {empresaId && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Vista con los datos de</span>
            <SelectorEmpresaVista codigo={p.codigo} empresas={empresas} actual={empresaId} />
            {aplica === false && <Badge variant="outline" className="border-amber-300 text-amber-800">A esta empresa no le aplica este documento</Badge>}
          </div>
        )}
        {empresaId && <SustentoNormativo requisitos={cobertura.map((r) => ({ id: r.id, texto: r.texto, cita: `${corta(r.norma)} ${r.articulo}`, seccion: r.seccion, cubierto: r.cubierto, motivo: r.motivo }))} />}
        {contenido}
      </div>
    </Page>
  );
}
