import Image from "next/image";
import { LoginForm } from "@/components/app/login-form";

export const metadata = { title: "Ingresar — PROCESST" };

export default async function Login({ searchParams }: PageProps<"/login">) {
  const desde = (await searchParams).desde;
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Image src="/brand/logo-sm.png" alt="PROCESST" width={160} height={24} priority />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm"><LoginForm desde={typeof desde === "string" ? desde : "/"} /></div>
        </div>
      </div>
      <div className="relative hidden lg:flex items-center justify-center bg-sidebar p-12">
        <div className="max-w-md space-y-6 text-sidebar-foreground">
          <Image src="/brand/icono.png" alt="" width={96} height={88} className="h-auto" />
          <h2 className="text-3xl font-semibold leading-tight">El SG-SST de cada cliente, generado y explicado según la norma.</h2>
          <p className="text-sidebar-foreground/70">Decreto 1072 de 2015 · Resolución 0312 de 2019 · GTC 45</p>
        </div>
      </div>
    </div>
  );
}
