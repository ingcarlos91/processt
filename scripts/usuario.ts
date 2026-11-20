// Crea un usuario o restablece su contraseña desde la terminal.
// Uso: npx tsx scripts/usuario.ts <correo> "<Nombre completo>" <contraseña> [superadmin|admin|consultor] [NIT de la consultora]
// - superadmin: administra las consultoras (no pertenece a ninguna).
// - admin o consultor: de la consultora con ese NIT; sin NIT, de la consultora original.
import { db, consultoraActual } from "../src/lib/db";
import { cifrarPassword, validarPassword } from "../src/lib/auth/password";

async function main() {
  const [email, nombre, password, rol = "admin", nit] = process.argv.slice(2);
  if (!email || !nombre || !password || !["superadmin", "admin", "consultor"].includes(rol)) {
    console.log('Uso: npx tsx scripts/usuario.ts <correo> "<Nombre completo>" <contraseña> [superadmin|admin|consultor] [NIT de la consultora]');
    process.exit(1);
  }
  const e = validarPassword(password);
  if (e) { console.error(e); process.exit(1); }
  let consultoraId: string | null = null;
  if (rol !== "superadmin") {
    const c = nit ? await db.consultora.findFirst({ where: { nit } }) : await consultoraActual();
    if (!c) { console.error(`No hay una consultora con NIT ${nit}.`); process.exit(1); }
    consultoraId = c.id;
  }
  const hash = await cifrarPassword(password);
  const u = await db.usuario.upsert({
    where: { email: email.toLowerCase() },
    update: { nombre, passwordHash: hash, rol, activo: true, consultoraId, sesionesDesde: new Date() },
    create: { consultoraId, email: email.toLowerCase(), nombre, passwordHash: hash, rol },
  });
  console.log(`Usuario listo: ${u.email} (${u.rol}). Ya puede ingresar en /login.`);
}
main().then(() => db.$disconnect());
