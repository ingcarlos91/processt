// Crea un usuario o restablece su contraseña desde la terminal.
// Uso: npx tsx scripts/usuario.ts <correo> "<Nombre completo>" <contraseña> [admin|consultor]
import { db, consultoraActual } from "../src/lib/db";
import { cifrarPassword, validarPassword } from "../src/lib/auth/password";

async function main() {
  const [email, nombre, password, rol = "admin"] = process.argv.slice(2);
  if (!email || !nombre || !password) {
    console.log('Uso: npx tsx scripts/usuario.ts <correo> "<Nombre completo>" <contraseña> [admin|consultor]');
    process.exit(1);
  }
  const e = validarPassword(password);
  if (e) { console.error(e); process.exit(1); }
  const c = await consultoraActual();
  const hash = await cifrarPassword(password);
  const u = await db.usuario.upsert({
    where: { email: email.toLowerCase() },
    update: { nombre, passwordHash: hash, rol, activo: true },
    create: { consultoraId: c.id, email: email.toLowerCase(), nombre, passwordHash: hash, rol },
  });
  console.log(`Usuario listo: ${u.email} (${u.rol}). Ya puede ingresar en /login.`);
}
main().then(() => db.$disconnect());
