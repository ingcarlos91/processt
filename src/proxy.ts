import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verificarToken } from "@/lib/auth/token";

// Verificación optimista: solo lee la cookie firmada. La verificación completa contra la base de datos
// se hace en el layout protegido (usuarioActual).
const PUBLICAS = ["/login"];

export default async function proxy(req: NextRequest) {
  const ruta = req.nextUrl.pathname;
  const publica = PUBLICAS.some((p) => ruta === p || ruta.startsWith(p + "/"));
  const sesion = await verificarToken(req.cookies.get(COOKIE)?.value);

  if (!publica && !sesion) {
    if (ruta.startsWith("/api/")) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    const url = new URL("/login", req.nextUrl);
    if (ruta !== "/") url.searchParams.set("desde", ruta);
    return NextResponse.redirect(url);
  }
  if (publica && sesion) return NextResponse.redirect(new URL("/", req.nextUrl));
  return NextResponse.next();
}

export const config = {
  // Todo excepto archivos estáticos, imágenes y la marca.
  matcher: ["/((?!_next/static|_next/image|brand/|fonts/|icon.png|favicon.ico).*)"],
};
