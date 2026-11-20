"use client";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Building2, KeyRound, Sparkles, MoreHorizontal, Pencil, Plus, Power, Search, UserCheck, UserPlus, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SeccionFormulario, SeccionesFormulario } from "@/components/app/formulario-largo";
import { Selector } from "@/components/app/selector";
import { Section } from "@/components/app/ui";
import { CampoClave } from "@/components/app/usuarios-editor";
import * as A from "@/app/actions/admin";

type Usuario = { id: string; nombre: string; email: string; rol: string; activo: boolean; ultimoAcceso: string | null };
type Consultora = { id: string; nombre: string; nit: string; activa: boolean; creadoEn: string; empresas: number; iaUsd: number; iaUsos: number; iaTope: number | null; usuarios: Usuario[] };
type Res = { ok: true } | { error: string };
type Modal =
  | { tipo: "nueva" } | { tipo: "editar"; c: Consultora } | { tipo: "estado"; c: Consultora }
  | { tipo: "usuario"; c: Consultora } | { tipo: "clave"; u: Usuario } | { tipo: "ia"; c: Consultora } | null;

const ROLES = [{ valor: "admin", etiqueta: "Administrador" }, { valor: "consultor", etiqueta: "Consultor" }];
const fecha = (f: string | null) => (f ? new Date(f).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "Nunca");
const ultimo = (us: Usuario[]) => us.map((u) => u.ultimoAcceso).filter(Boolean).sort().at(-1) ?? null;
const vacio = { nombre: "", nit: "", aNombre: "", aEmail: "", aPassword: "", rol: "admin", tope: "" };

export function ConsultorasAdmin({ consultoras }: { consultoras: Consultora[] }) {
  const [pend, start] = useTransition();
  const [modal, setModal] = useState<Modal>(null);
  const [verUsuarios, setVerUsuarios] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [f, setF] = useState(vacio);
  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return consultoras.filter((c) => !t || c.nombre.toLowerCase().includes(t) || c.nit.includes(t) || c.usuarios.some((u) => u.email.includes(t) || u.nombre.toLowerCase().includes(t)));
  }, [consultoras, q]);
  const actual = consultoras.find((c) => c.id === verUsuarios) ?? null;

  const abrir = (m: Modal) => {
    setF(m && "c" in m ? { ...vacio, nombre: m.c.nombre, nit: m.c.nit, tope: m.c.iaTope != null ? String(m.c.iaTope) : "" } : vacio);
    setModal(m);
  };
  const run = (fn: () => Promise<Res>, ok: string, cerrar = true) => start(async () => {
    const r = await fn();
    if ("error" in r) toast.error(r.error); else { toast.success(ok); if (cerrar) setModal(null); }
  });

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-80">
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput placeholder="Buscar consultora, NIT o usuario" value={q} onChange={(e) => setQ(e.target.value)} />
        </InputGroup>
        <div className="flex-1" />
        <Button onClick={() => abrir({ tipo: "nueva" })}><Plus /> Nueva consultora</Button>
      </div>

      <Section contentClassName="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Consultora</TableHead><TableHead>Administradores</TableHead><TableHead className="text-right">Empresas</TableHead>
              <TableHead className="text-right">Usuarios</TableHead><TableHead className="text-right">IA este mes</TableHead><TableHead>Último acceso</TableHead><TableHead>Estado</TableHead><TableHead className="w-12 pr-6" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((c) => {
              const admins = c.usuarios.filter((u) => u.rol === "admin");
              return (
                <TableRow key={c.id} className={c.activa ? "" : "opacity-60"}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted"><Building2 className="size-4 text-muted-foreground" /></div>
                      <div><div className="font-medium">{c.nombre}</div><div className="text-xs text-muted-foreground">{c.nit ? `NIT ${c.nit}` : "Sin NIT"} · desde {new Date(c.creadoEn).toLocaleDateString("es-CO", { dateStyle: "medium" })}</div></div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-64 text-sm">{admins.length ? admins.map((u) => <div key={u.id} className="truncate" title={u.email}>{u.nombre} <span className="text-xs text-muted-foreground">{u.email}</span></div>) : <span className="text-muted-foreground">Sin administrador</span>}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.empresas}</TableCell>
                  <TableCell className="text-right tabular-nums">{c.usuarios.filter((u) => u.activo).length}/{c.usuarios.length}</TableCell>
                  <TableCell className="text-right text-sm tabular-nums">USD {c.iaUsd.toFixed(2)}<div className="text-xs text-muted-foreground">{c.iaTope != null ? `tope ${c.iaTope.toFixed(2)}` : "sin tope"} · {c.iaUsos} uso(s)</div></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{fecha(ultimo(c.usuarios))}</TableCell>
                  <TableCell>{c.activa ? <Badge variant="secondary">Activa</Badge> : <Badge variant="outline">Desactivada</Badge>}</TableCell>
                  <TableCell className="pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Acciones" />}><MoreHorizontal /></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => setVerUsuarios(c.id)}><Users /> Usuarios</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => abrir({ tipo: "usuario", c })}><UserPlus /> Agregar usuario</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => abrir({ tipo: "editar", c })}><Pencil /> Editar nombre y NIT</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => abrir({ tipo: "ia", c })}><Sparkles /> Tope de IA</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant={c.activa ? "destructive" : "default"} onClick={() => abrir({ tipo: "estado", c })}><Power /> {c.activa ? "Desactivar" : "Activar"}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {lista.length === 0 && <TableRow><TableCell colSpan={8} className="py-8 pl-6 text-center text-muted-foreground">{consultoras.length ? "No hay consultoras que coincidan." : "Aún no hay consultoras. Cree la primera."}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Section>

      {/* Usuarios de una consultora */}
      <Sheet open={!!actual} onOpenChange={(o) => !o && setVerUsuarios(null)}>
        <SheetContent className="w-full data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
          {actual && (
            <>
              <SheetHeader>
                <SheetTitle>Usuarios de {actual.nombre}</SheetTitle>
                <SheetDescription>El administrador de la consultora también puede gestionar sus usuarios desde «Usuarios». Debe quedar al menos un administrador activo.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-6">
                <div className="flex justify-end"><Button size="sm" onClick={() => abrir({ tipo: "usuario", c: actual })}><UserPlus /> Agregar usuario</Button></div>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader><TableRow><TableHead className="pl-4">Usuario</TableHead><TableHead className="w-40">Rol</TableHead><TableHead>Último acceso</TableHead><TableHead className="w-12 pr-4" /></TableRow></TableHeader>
                    <TableBody>
                      {actual.usuarios.map((u) => (
                        <TableRow key={u.id} className={u.activo ? "" : "opacity-60"}>
                          <TableCell className="pl-4"><div className="font-medium">{u.nombre} {!u.activo && <Badge variant="outline" className="ml-1">Inactivo</Badge>}</div><div className="text-xs text-muted-foreground">{u.email}</div></TableCell>
                          <TableCell><Selector value={u.rol} onChange={(v) => run(() => A.cambiarRolUsuarioConsultora(u.id, v), "Rol actualizado", false)} opciones={ROLES} disabled={pend} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{fecha(u.ultimoAcceso)}</TableCell>
                          <TableCell className="pr-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Acciones" />}><MoreHorizontal /></DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => { setF({ ...vacio, aPassword: "" }); setModal({ tipo: "clave", u }); }}><KeyRound /> Restablecer contraseña</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => run(() => A.cambiarEstadoUsuarioConsultora(u.id, !u.activo), u.activo ? "Usuario desactivado" : "Usuario activado", false)}>{u.activo ? <><UserX /> Desactivar</> : <><UserCheck /> Activar</>}</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                      {actual.usuarios.length === 0 && <TableRow><TableCell colSpan={4} className="py-6 text-center text-muted-foreground">Sin usuarios.</TableCell></TableRow>}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className={modal?.tipo === "nueva" || modal?.tipo === "usuario" ? "sm:max-w-xl" : "sm:max-w-md"}>
          {modal?.tipo === "nueva" && (
            <>
              <DialogHeader>
                <DialogTitle>Nueva consultora</DialogTitle>
                <DialogDescription>Se crea con su administrador. Entréguele la contraseña inicial por un medio seguro; al entrar completa los datos de la consultora (licencia, firma y logo) en «Mi consultora» y crea sus usuarios.</DialogDescription>
              </DialogHeader>
              <DialogBody>
                <SeccionesFormulario>
                  <SeccionFormulario titulo="Consultora" columnas={2}>
                    <Field><FieldLabel htmlFor="c-n">Nombre</FieldLabel><Input id="c-n" placeholder="Ej.: Seguridad Integral SAS" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
                    <Field><FieldLabel htmlFor="c-nit">NIT o cédula</FieldLabel><Input id="c-nit" placeholder="Ej.: 900123456-7" value={f.nit} onChange={(e) => setF({ ...f, nit: e.target.value })} /><FieldDescription>Opcional. No se puede repetir.</FieldDescription></Field>
                  </SeccionFormulario>
                  <SeccionFormulario titulo="Administrador de la consultora" descripcion="Gestiona los usuarios y los datos de su consultora." columnas={2}>
                    <Field><FieldLabel htmlFor="c-an">Nombre completo</FieldLabel><Input id="c-an" placeholder="Nombres y apellidos" value={f.aNombre} onChange={(e) => setF({ ...f, aNombre: e.target.value })} /></Field>
                    <Field><FieldLabel htmlFor="c-ae">Correo</FieldLabel><Input id="c-ae" type="email" placeholder="nombre@consultora.com" value={f.aEmail} onChange={(e) => setF({ ...f, aEmail: e.target.value })} /><FieldDescription>Es su usuario para entrar.</FieldDescription></Field>
                    <Field className="sm:col-span-2"><FieldLabel htmlFor="c-ap">Contraseña inicial</FieldLabel><CampoClave id="c-ap" value={f.aPassword} onChange={(v) => setF({ ...f, aPassword: v })} /><FieldDescription>Mínimo 8 caracteres, con letras y números. Podrá cambiarla en «Mi cuenta».</FieldDescription></Field>
                  </SeccionFormulario>
                </SeccionesFormulario>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend} onClick={() => run(() => A.crearConsultora({ nombre: f.nombre, nit: f.nit, admin: { nombre: f.aNombre, email: f.aEmail, password: f.aPassword } }), "Consultora creada")}>{pend && <Spinner />} Crear consultora</Button>
              </DialogFooter>
            </>
          )}
          {modal?.tipo === "editar" && (
            <>
              <DialogHeader><DialogTitle>Editar {modal.c.nombre}</DialogTitle><DialogDescription>Los demás datos (licencia, profesional que firma, logo) los gestiona la consultora en «Mi consultora».</DialogDescription></DialogHeader>
              <div className="grid gap-4">
                <Field><FieldLabel htmlFor="e-n">Nombre</FieldLabel><Input id="e-n" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
                <Field><FieldLabel htmlFor="e-nit">NIT o cédula</FieldLabel><Input id="e-nit" value={f.nit} onChange={(e) => setF({ ...f, nit: e.target.value })} /></Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend} onClick={() => run(() => A.actualizarConsultora(modal.c.id, { nombre: f.nombre, nit: f.nit }), "Consultora actualizada")}>{pend && <Spinner />} Guardar</Button>
              </DialogFooter>
            </>
          )}
          {modal?.tipo === "estado" && (
            <>
              <DialogHeader>
                <DialogTitle>{modal.c.activa ? "Desactivar" : "Activar"} {modal.c.nombre}</DialogTitle>
                <DialogDescription>{modal.c.activa
                  ? `Ninguno de sus ${modal.c.usuarios.length} usuario(s) podrá entrar y las sesiones abiertas se cierran de inmediato. Sus ${modal.c.empresas} empresa(s) y todos sus datos se conservan; puede activarla de nuevo cuando quiera.`
                  : "Sus usuarios activos podrán volver a entrar con su contraseña."}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend} variant={modal.c.activa ? "destructive" : "default"} onClick={() => run(() => A.cambiarEstadoConsultora(modal.c.id, !modal.c.activa), modal.c.activa ? "Consultora desactivada" : "Consultora activada")}>{pend && <Spinner />} {modal.c.activa ? "Desactivar" : "Activar"}</Button>
              </DialogFooter>
            </>
          )}
          {modal?.tipo === "usuario" && (
            <>
              <DialogHeader><DialogTitle>Agregar usuario a {modal.c.nombre}</DialogTitle><DialogDescription>Entregue la contraseña inicial por un medio seguro; la persona podrá cambiarla en «Mi cuenta».</DialogDescription></DialogHeader>
              <DialogBody>
                <SeccionesFormulario>
                  <SeccionFormulario titulo="Usuario" columnas={2}>
                    <Field><FieldLabel htmlFor="n-n">Nombre completo</FieldLabel><Input id="n-n" placeholder="Nombres y apellidos" value={f.aNombre} onChange={(e) => setF({ ...f, aNombre: e.target.value })} /></Field>
                    <Field><FieldLabel htmlFor="n-e">Correo</FieldLabel><Input id="n-e" type="email" placeholder="nombre@consultora.com" value={f.aEmail} onChange={(e) => setF({ ...f, aEmail: e.target.value })} /></Field>
                    <Field><FieldLabel htmlFor="n-r">Rol</FieldLabel><Selector id="n-r" value={f.rol} onChange={(v) => setF({ ...f, rol: v })} opciones={ROLES} /><FieldDescription>{f.rol === "admin" ? "Trabaja empresas y además gestiona usuarios y datos de la consultora." : "Trabaja empresas, documentos, biblioteca y plantillas."}</FieldDescription></Field>
                    <Field><FieldLabel htmlFor="n-p">Contraseña inicial</FieldLabel><CampoClave id="n-p" value={f.aPassword} onChange={(v) => setF({ ...f, aPassword: v })} /></Field>
                  </SeccionFormulario>
                </SeccionesFormulario>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend} onClick={() => run(() => A.agregarUsuarioConsultora(modal.c.id, { nombre: f.aNombre, email: f.aEmail, password: f.aPassword, rol: f.rol }), "Usuario creado")}>{pend && <Spinner />} Crear usuario</Button>
              </DialogFooter>
            </>
          )}
          {modal?.tipo === "ia" && (
            <>
              <DialogHeader><DialogTitle>Tope de IA de {modal.c.nombre}</DialogTitle><DialogDescription>Gasto máximo de IA por mes calendario, en USD, con la llave de PROCESST. Al alcanzarlo, la consultora sigue trabajando con las sugerencias de la biblioteca. Este mes lleva USD {modal.c.iaUsd.toFixed(2)} en {modal.c.iaUsos} uso(s).</DialogDescription></DialogHeader>
              <Field><FieldLabel htmlFor="t-ia">Tope mensual (USD)</FieldLabel><Input id="t-ia" inputMode="decimal" placeholder="Vacío = sin tope" value={f.tope} onChange={(e) => setF({ ...f, tope: e.target.value })} /><FieldDescription>Referencia con Haiku: un análisis de accidente cuesta cerca de USD 0,002 y la matriz de un cargo cerca de USD 0,01 (con Sonnet, unas 15 veces más).</FieldDescription></Field>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend} onClick={() => run(() => A.fijarTopeIA(modal.c.id, f.tope.trim() === "" ? null : Number(f.tope.replace(",", "."))), "Tope de IA guardado")}>{pend && <Spinner />} Guardar</Button>
              </DialogFooter>
            </>
          )}
          {modal?.tipo === "clave" && (
            <>
              <DialogHeader><DialogTitle>Restablecer contraseña</DialogTitle><DialogDescription>Asigne una contraseña nueva a {modal.u.nombre}. Sus sesiones abiertas se cierran. Entréguesela por un medio seguro.</DialogDescription></DialogHeader>
              <Field><FieldLabel htmlFor="k-p">Contraseña nueva</FieldLabel><CampoClave id="k-p" value={f.aPassword} onChange={(v) => setF({ ...f, aPassword: v })} /><FieldDescription>Mínimo 8 caracteres, con letras y números.</FieldDescription></Field>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend || !f.aPassword} onClick={() => run(() => A.restablecerPasswordUsuario(modal.u.id, f.aPassword), "Contraseña restablecida")}>{pend && <Spinner />} Restablecer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
