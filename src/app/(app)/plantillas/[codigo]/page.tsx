import Link from "next/link";
import { Eye } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { usuarioActual } from "@/lib/auth/sesion";
import { plantillaDe } from "@/lib/plantillas";
import { db } from "@/lib/db";
import { Page, PageHeader, NormaRef } from "@/components/app/ui";
import { PlantillaEditor } from "@/components/biblioteca/plantilla-editor";

export const dynamic = "force-dynamic";

export default async function PlantillaPage({ params }: PageProps<"/plantillas/[codigo]">) {
  const { codigo } = await params;
  const p = await plantillaDe((await usuarioActual()).consultoraId, codigo);
  if (!p) notFound();
  const contrato = await readFile(join(process.cwd(), "prisma/seed/plantillas/_CONTRATO.md"), "utf8").catch(() => "");
  return (
    <Page>
      <PageHeader title={`${p.codigo} · ${p.nombre}`} description={<span className="flex flex-wrap gap-1">{p.normas.map((n) => <NormaRef key={n}>{n}</NormaRef>)}</span>} actions={<Link href={`/plantillas/${p.codigo}/ver`} className={buttonVariants({ size: "sm" })}><Eye /> Ver documento</Link>} />
      <PlantillaEditor id={p.id} contenido={p.contenidoMd} version={p.version} contrato={contrato} propia={p.propia} baseCambio={p.propia && p.baseVersion !== null && p.versionBase > p.baseVersion} base={p.propia ? (await db.plantilla.findUniqueOrThrow({ where: { id: p.id }, select: { contenidoMd: true } })).contenidoMd : undefined} />
    </Page>
  );
}
