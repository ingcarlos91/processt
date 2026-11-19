import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/app-sidebar";
import { SiteHeader } from "@/components/app/site-header";
import { db, consultoraActual } from "@/lib/db";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = { title: "PROCESST — SG-SST", description: "Gestión del SG-SST para consultoras en Colombia" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [empresas, consultora] = await Promise.all([
    db.empresa.findMany({ orderBy: { razonSocial: "asc" }, select: { id: true, razonSocial: true } }),
    consultoraActual(),
  ]);
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar empresas={empresas} consultora={{ nombre: consultora.nombre, profesional: consultora.profesional }} />
            <SidebarInset className="bg-muted/30 min-w-0">
              <SiteHeader empresas={empresas} />
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
