import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verificarToken } from "@/lib/auth/token";
import { db } from "@/lib/db";

// Primera barrera: cookie firmada, área del super administrador y, para /empresas/{id} y /api/empresas/{id},
// que la empresa sea de la consultora del usuario. Las páginas y las acciones verifican de nuevo contra la base
// de datos (src/lib/auth/sesion.ts y src/lib/auth/acceso.ts).
const PUBLICAS = ["/login"];
const ADMIN = ["/admin", "/cuenta", "/api/admin"];
const RUTA_EMPRESA = /^\/(?:api\/)?empresas\/([^/]+)(?:\/|$)/;

export default async function proxy(req: NextRequest) {
  const ruta = req.nextUrl.pathname;
  const publica = PUBLICAS.some((p) => ruta === p || ruta.startsWith(p + "/"));
  const sesion = await verificarToken(req.cookies.get(COOKIE)?.value);
  const api = ruta.startsWith("/api/");

  if (!publica && !sesion) {
    if (api) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    const url = new URL("/login", req.nextUrl);
    if (ruta !== "/") url.searchParams.set("desde", ruta);
    return NextResponse.redirect(url);
  }
  if (publica && sesion) return NextResponse.redirect(new URL(sesion.rol === "superadmin" ? "/admin" : "/", req.nextUrl));
  if (!sesion || publica) return NextResponse.next();

  // El super administrador solo administra consultoras: no entra a las empresas ni a sus datos.
  const enAdmin = ADMIN.some((p) => ruta === p || ruta.startsWith(p + "/"));
  if (sesion.rol === "superadmin" && !enAdmin) {
    return api ? NextResponse.json({ error: "Sin acceso" }, { status: 403 }) : NextResponse.redirect(new URL("/admin", req.nextUrl));
  }
  if (sesion.rol !== "superadmin" && (ruta === "/admin" || ruta.startsWith("/admin/") || ruta.startsWith("/api/admin"))) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  const m = ruta.match(RUTA_EMPRESA);
  if (m && m[1] !== "nueva") {
    const [u, e] = await Promise.all([
      db.usuario.findUnique({ where: { id: sesion.usuarioId }, select: { consultoraId: true } }),
      db.empresa.findUnique({ where: { id: decodeURIComponent(m[1]) }, select: { consultoraId: true } }),
    ]);
    if (!u?.consultoraId || !e || e.consultoraId !== u.consultoraId) {
      return api ? NextResponse.json({ error: "No encontrado" }, { status: 404 }) : NextResponse.rewrite(new URL("/no-encontrado", req.nextUrl));
    }
  }
  return NextResponse.next();
}

export const config = {
  // Todo excepto archivos estáticos, imágenes y la marca.
  matcher: ["/((?!_next/static|_next/image|brand/|fonts/|icon.png|favicon.ico).*)"],
};
