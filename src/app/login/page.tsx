import Image from "next/image";
import { LoginForm } from "@/components/app/login-form";

export const metadata = { title: "Ingresar — PROCESST" };

export default async function Login({ searchParams }: PageProps<"/login">) {
  const desde = (await searchParams).desde;
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col bg-muted/40 px-4 py-8 sm:px-6 md:px-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-8">
            <Image src="/brand/logo-sm.png" alt="PROCESST" width={176} height={26} priority className="h-auto" />
            <LoginForm desde={typeof desde === "string" ? desde : "/"} />
            <p className="px-4 text-center text-xs leading-relaxed text-muted-foreground">
              Herramienta interna para la gestión del SG-SST de sus empresas cliente.
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden items-center justify-center bg-sidebar p-12 lg:flex">
        <div className="max-w-md space-y-6 text-sidebar-foreground">
          <Image src="/brand/icono.png" alt="" width={96} height={88} className="h-auto" />
          <h2 className="text-3xl font-semibold leading-tight text-balance">El SG-SST de cada cliente, generado y explicado según la norma.</h2>
          <p className="text-sidebar-foreground/70">Decreto 1072 de 2015 · Resolución 0312 de 2019 · GTC 45</p>
        </div>
      </div>
    </div>
  );
}
