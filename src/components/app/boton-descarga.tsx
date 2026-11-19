"use client";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

/** Nombre del archivo a partir de Content-Disposition (filename*=UTF-8'' o filename="..."). */
function nombreArchivo(cd: string | null, url: string) {
  const m = cd?.match(/filename\*=UTF-8''([^;]+)/i) ?? cd?.match(/filename="?([^";]+)"?/i);
  if (m) { try { return decodeURIComponent(m[1]); } catch { return m[1]; } }
  return url.split("/").pop()?.split("?")[0] || "archivo";
}

/**
 * Botón de descarga: pide el archivo en segundo plano y muestra el isotipo girando
 * mientras el servidor lo prepara (los ZIP y los Word pueden tardar varios segundos).
 */
export function BotonDescarga({ href, children, tooltip, variant = "outline", size = "default", className, "aria-label": ariaLabel, texto = "Preparando…" }: {
  href: string; children: ReactNode; tooltip?: ReactNode; className?: string; "aria-label"?: string; texto?: string;
} & VariantProps<typeof buttonVariants>) {
  const [cargando, setCargando] = useState(false);
  const soloIcono = String(size).startsWith("icon");
  const descargar = async () => {
    if (cargando) return;
    setCargando(true);
    try {
      const r = await fetch(href);
      if (!r.ok) throw new Error(r.status === 401 ? "Su sesión expiró; inicie sesión de nuevo." : `No se pudo generar el archivo (error ${r.status}).`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = nombreArchivo(r.headers.get("Content-Disposition"), href);
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo descargar el archivo.");
    } finally {
      setCargando(false);
    }
  };
  return (
    <Button type="button" variant={variant} size={size} className={className} aria-label={ariaLabel} aria-busy={cargando}
      tooltip={cargando ? false : tooltip} onClick={descargar}>
      {cargando ? (soloIcono ? <Spinner /> : <><Spinner /> {texto}</>) : children}
    </Button>
  );
}
