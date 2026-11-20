import Link from "next/link";
import { Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";
import { Page, PageHeader, NormaRef } from "@/components/app/ui";
import { PlantillaEditor } from "@/components/biblioteca/plantilla-editor";

export const dynamic = "force-dynamic";

export default async function PlantillaPage({ params }: PageProps<"/plantillas/[codigo]">) {
  const { codigo } = await params;
  const p = await db.plantilla.findUnique({ where: { codigo } });
  if (!p) notFound();
  const contrato = await readFile(join(process.cwd(), "prisma/seed/plantillas/_CONTRATO.md"), "utf8").catch(() => "");
  return (
    <Page>
      <PageHeader title={`${p.codigo} · ${p.nombre}`} description={<span className="flex flex-wrap gap-1">{p.normas.map((n) => <NormaRef key={n}>{n}</NormaRef>)}</span>} actions={<Link href={`/plantillas/${p.codigo}/ver`} className={buttonVariants({ size: "sm" })}><Eye /> Ver documento</Link>} />
      <PlantillaEditor id={p.id} contenido={p.contenidoMd} version={p.version} contrato={contrato} />
    </Page>
  );
}
