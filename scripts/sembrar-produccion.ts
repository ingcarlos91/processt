// Corre en cada build de Vercel (después de las migraciones):
// 1. Corre la siembra completa (idempotente y aditiva): lo nuevo de la biblioteca y los catálogos llega a
//    producción sin pisar lo que la consultora haya editado.
// 2. Después actualiza las empresas existentes (scripts/actualizar-empresas.ts).
// 3. Si están ADMIN_EMAIL, ADMIN_NOMBRE y ADMIN_PASSWORD y ese usuario no existe, lo crea como administrador.
//    Después del primer despliegue se puede borrar ADMIN_PASSWORD de Vercel.
// 4. Igual con SUPERADMIN_EMAIL, SUPERADMIN_NOMBRE y SUPERADMIN_PASSWORD: crea el super administrador (administra
//    las consultoras). Después del primer despliegue se puede borrar SUPERADMIN_PASSWORD de Vercel.
import { execSync } from "node:child_process";
import { db, consultoraActual } from "../src/lib/db";
import { cifrarPassword, validarPassword } from "../src/lib/auth/password";

async function main() {
  if (!process.env.DATABASE_URL) { console.log("[sembrar] Sin DATABASE_URL: se omite."); return; }
  // Siembra completa en cada despliegue: es idempotente (upserts de estándares, normas, reglas y CIIU; plantillas
  // respetando las editadas por la consultora; biblioteca aditiva que solo actualiza lo no validado).
  console.log("[sembrar] Sincronizando catálogos, normas, reglas, plantillas y biblioteca…");
  execSync("npx tsx prisma/seed/index.ts", { stdio: "inherit" });
  // 2. Empresas existentes: reglas, documentos y puntajes al día con lo sembrado.
  console.log("[sembrar] Actualizando empresas existentes…");
  execSync("npx tsx scripts/actualizar-empresas.ts", { stdio: "inherit" });

  await usuarioInicial("ADMIN", "admin");
  await usuarioInicial("SUPERADMIN", "superadmin");
}

/** Crea el usuario de las variables {PREFIJO}_EMAIL, _NOMBRE y _PASSWORD si no existe (nunca cambia uno existente). */
async function usuarioInicial(prefijo: string, rol: "admin" | "superadmin") {
  const email = process.env[`${prefijo}_EMAIL`]?.trim().toLowerCase(), nombre = process.env[`${prefijo}_NOMBRE`]?.trim(), password = process.env[`${prefijo}_PASSWORD`];
  if (!email || !nombre || !password) return;
  if (await db.usuario.findUnique({ where: { email } })) { console.log(`[sembrar] El usuario ${rol} inicial ya existe.`); return; }
  const err = validarPassword(password);
  if (err) throw new Error(`[sembrar] ${prefijo}_PASSWORD no es válida: ${err}`);
  const consultoraId = rol === "superadmin" ? null : (await consultoraActual()).id;
  await db.usuario.create({ data: { consultoraId, email, nombre, passwordHash: await cifrarPassword(password), rol } });
  console.log(`[sembrar] Usuario ${rol} inicial creado: ${email}`);
}
main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
