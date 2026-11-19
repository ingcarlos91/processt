// Corre en cada build de Vercel (después de las migraciones):
// 1. Si la base está vacía (sin normas), siembra catálogos, normas, estándares, plantillas y biblioteca.
//    Si ya tiene datos no toca nada, para no pisar lo que la consultora haya editado.
// 2. Si están ADMIN_EMAIL, ADMIN_NOMBRE y ADMIN_PASSWORD y ese usuario no existe, lo crea como administrador.
//    Después del primer despliegue se puede borrar ADMIN_PASSWORD de Vercel.
import { execSync } from "node:child_process";
import { db, consultoraActual } from "../src/lib/db";
import { cifrarPassword, validarPassword } from "../src/lib/auth/password";

async function main() {
  if (!process.env.DATABASE_URL) { console.log("[sembrar] Sin DATABASE_URL: se omite."); return; }
  // Siembra completa en cada despliegue: es idempotente (upserts de estándares, normas, reglas y CIIU; plantillas
  // respetando las editadas por la consultora; biblioteca aditiva que solo actualiza lo no validado).
  console.log("[sembrar] Sincronizando catálogos, normas, reglas, plantillas y biblioteca…");
  execSync("npx tsx prisma/seed/index.ts", { stdio: "inherit" });

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(), nombre = process.env.ADMIN_NOMBRE?.trim(), password = process.env.ADMIN_PASSWORD;
  if (email && nombre && password) {
    if (await db.usuario.findUnique({ where: { email } })) { console.log("[sembrar] El usuario inicial ya existe."); return; }
    const err = validarPassword(password);
    if (err) throw new Error(`[sembrar] ADMIN_PASSWORD no es válida: ${err}`);
    const c = await consultoraActual();
    await db.usuario.create({ data: { consultoraId: c.id, email, nombre, passwordHash: await cifrarPassword(password), rol: "admin" } });
    console.log(`[sembrar] Usuario inicial creado: ${email}`);
  }
}
main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
