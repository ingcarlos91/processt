"use client";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { KeyRound, MoreHorizontal, Pencil, Plus, Search, Trash2, UserCheck, UserX, Wand2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Section } from "@/components/app/ui";
import * as A from "@/app/actions/usuarios";

type U = { id: string; nombre: string; email: string; rol: string; activo: boolean; ultimoAcceso: string | null; creadoEn: string };
const ROLES: Record<string, { t: string; d: string }> = {
  admin: { t: "Administrador", d: "Trabaja empresas y documentos, y además gestiona usuarios." },
  consultor: { t: "Consultor", d: "Trabaja empresas, documentos, biblioteca y plantillas. No gestiona usuarios." },
};
type Modal = { tipo: "nuevo" } | { tipo: "editar"; u: U } | { tipo: "clave"; u: U } | { tipo: "estado"; u: U } | { tipo: "eliminar"; u: U } | null;
type Res = { error?: string } | { ok: boolean };

const fechaHora = (f: string | null) => (f ? new Date(f).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "Nunca ha entrado");
const iniciales = (n: string) => n.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();

/** Genera una contraseña temporal que cumple la política (letras y números). */
function generarClave() {
  const letras = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", nums = "23456789";
  const r = (s: string) => s[crypto.getRandomValues(new Uint32Array(1))[0] % s.length];
  return Array.from({ length: 8 }, () => r(letras)).join("") + r(nums) + r(nums) + r(nums);
}

function CampoClave({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  const [ver, setVer] = useState(false);
  return (
    <InputGroup>
      <InputGroupInput id={id} type={ver ? "text" : "password"} autoComplete="new-password" value={value} onChange={(e) => onChange(e.target.value)} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label={ver ? "Ocultar" : "Mostrar"} onClick={() => setVer(!ver)}>{ver ? <EyeOff /> : <Eye />}</InputGroupButton>
        <InputGroupButton size="xs" onClick={() => { onChange(generarClave()); setVer(true); }}><Wand2 /> Generar</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export function UsuariosEditor({ usuarios, yoId }: { usuarios: U[]; yoId: string }) {
  const [pend, start] = useTransition();
  const [modal, setModal] = useState<Modal>(null);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [f, setF] = useState({ nombre: "", email: "", rol: "consultor", password: "" });
  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return usuarios.filter((u) => (!t || u.nombre.toLowerCase().includes(t) || u.email.includes(t))
      && (filtro === "todos" || (filtro === "activos" ? u.activo : filtro === "inactivos" ? !u.activo : u.rol === filtro)));
  }, [usuarios, q, filtro]);

  const abrir = (m: Modal) => {
    if (m && "u" in m) setF({ nombre: m.u.nombre, email: m.u.email, rol: m.u.rol, password: "" });
    else setF({ nombre: "", email: "", rol: "consultor", password: "" });
    setModal(m);
  };
  const run = (fn: () => Promise<Res>, ok: string) => start(async () => {
    const r = await fn();
    if ("error" in r && r.error) toast.error(r.error); else { toast.success(ok); setModal(null); }
  });
  const activos = usuarios.filter((u) => u.activo).length;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup className="w-72">
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput placeholder="Buscar por nombre o correo" value={q} onChange={(e) => setQ(e.target.value)} />
        </InputGroup>
        <NativeSelect value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar">
          <NativeSelectOption value="todos">Todos ({usuarios.length})</NativeSelectOption>
          <NativeSelectOption value="activos">Activos ({activos})</NativeSelectOption>
          <NativeSelectOption value="inactivos">Inactivos ({usuarios.length - activos})</NativeSelectOption>
          <NativeSelectOption value="admin">Administradores</NativeSelectOption>
          <NativeSelectOption value="consultor">Consultores</NativeSelectOption>
        </NativeSelect>
        <div className="flex-1" />
        <Button onClick={() => abrir({ tipo: "nuevo" })}><Plus /> Nuevo usuario</Button>
      </div>

      <Section contentClassName="px-0">
        <Table>
          <TableHeader><TableRow><TableHead className="pl-6">Usuario</TableHead><TableHead>Rol</TableHead><TableHead>Estado</TableHead><TableHead>Último acceso</TableHead><TableHead className="pr-6 w-12" /></TableRow></TableHeader>
          <TableBody>
            {lista.map((u) => (
              <TableRow key={u.id} className={u.activo ? "" : "opacity-60"}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">{iniciales(u.nombre)}</div>
                    <div><div className="font-medium">{u.nombre} {u.id === yoId && <Badge variant="secondary" className="ml-1">usted</Badge>}</div><div className="text-xs text-muted-foreground">{u.email}</div></div>
                  </div>
                </TableCell>
                <TableCell><Badge variant={u.rol === "admin" ? "default" : "outline"}>{ROLES[u.rol]?.t ?? u.rol}</Badge></TableCell>
                <TableCell>{u.activo ? <Badge variant="secondary">Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{fechaHora(u.ultimoAcceso)}</TableCell>
                <TableCell className="pr-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label="Acciones" />}><MoreHorizontal /></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => abrir({ tipo: "editar", u })}><Pencil /> Editar datos y rol</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => abrir({ tipo: "clave", u })}><KeyRound /> Restablecer contraseña</DropdownMenuItem>
                      </DropdownMenuGroup>
                      {u.id !== yoId && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => abrir({ tipo: "estado", u })}>{u.activo ? <><UserX /> Desactivar</> : <><UserCheck /> Activar</>}</DropdownMenuItem>
                            <DropdownMenuItem variant="destructive" onClick={() => abrir({ tipo: "eliminar", u })}><Trash2 /> Eliminar</DropdownMenuItem>
                          </DropdownMenuGroup>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {lista.length === 0 && <TableRow><TableCell colSpan={5} className="pl-6 py-8 text-center text-muted-foreground">No hay usuarios que coincidan.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </Section>

      <Dialog open={!!modal} onOpenChange={(o) => !o && setModal(null)}>
        <DialogContent className="sm:max-w-md">
          {(modal?.tipo === "nuevo" || modal?.tipo === "editar") && (
            <>
              <DialogHeader>
                <DialogTitle>{modal.tipo === "nuevo" ? "Nuevo usuario" : `Editar a ${modal.u.nombre}`}</DialogTitle>
                <DialogDescription>{modal.tipo === "nuevo" ? "Entregue la contraseña inicial a la persona por un medio seguro; podrá cambiarla en “Mi cuenta”." : "Los cambios de rol aplican de inmediato."}</DialogDescription>
              </DialogHeader>
              <FieldGroup>
                <Field><FieldLabel htmlFor="u-n">Nombre completo</FieldLabel><Input id="u-n" placeholder="Nombres y apellidos" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
                <Field><FieldLabel htmlFor="u-e">Correo</FieldLabel><Input id="u-e" placeholder="nombre@empresa.com" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /><FieldDescription>Es el usuario con el que inicia sesión.</FieldDescription></Field>
                <Field>
                  <FieldLabel htmlFor="u-r">Rol</FieldLabel>
                  <NativeSelect id="u-r" className="w-full" value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })} disabled={modal.tipo === "editar" && modal.u.id === yoId}>
                    {Object.entries(ROLES).map(([k, r]) => <NativeSelectOption key={k} value={k}>{r.t}</NativeSelectOption>)}
                  </NativeSelect>
                  <FieldDescription>{ROLES[f.rol]?.d}{modal.tipo === "editar" && modal.u.id === yoId ? " No puede cambiar su propio rol." : ""}</FieldDescription>
                </Field>
                {modal.tipo === "nuevo" && (
                  <Field><FieldLabel htmlFor="u-p">Contraseña inicial</FieldLabel><CampoClave id="u-p" value={f.password} onChange={(v) => setF({ ...f, password: v })} /><FieldDescription>Mínimo 8 caracteres, con letras y números.</FieldDescription></Field>
                )}
              </FieldGroup>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend} onClick={() => run(() => modal.tipo === "nuevo" ? A.crearUsuario(f) : A.actualizarUsuario(modal.u.id, f), modal.tipo === "nuevo" ? "Usuario creado" : "Cambios guardados")}>{pend && <Spinner />} {modal.tipo === "nuevo" ? "Crear usuario" : "Guardar"}</Button>
              </DialogFooter>
            </>
          )}
          {modal?.tipo === "clave" && (
            <>
              <DialogHeader>
                <DialogTitle>Restablecer contraseña</DialogTitle>
                <DialogDescription>Asigne una contraseña nueva a {modal.u.nombre}. Sus sesiones abiertas se cerrarán y deberá entrar con la nueva. Entréguesela por un medio seguro.</DialogDescription>
              </DialogHeader>
              <Field><FieldLabel htmlFor="u-np">Contraseña nueva</FieldLabel><CampoClave id="u-np" value={f.password} onChange={(v) => setF({ ...f, password: v })} /><FieldDescription>Mínimo 8 caracteres, con letras y números.</FieldDescription></Field>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend || !f.password} onClick={() => run(() => A.restablecerPassword(modal.u.id, f.password), "Contraseña restablecida")}>{pend && <Spinner />} Restablecer</Button>
              </DialogFooter>
            </>
          )}
          {modal?.tipo === "estado" && (
            <>
              <DialogHeader>
                <DialogTitle>{modal.u.activo ? "Desactivar" : "Activar"} a {modal.u.nombre}</DialogTitle>
                <DialogDescription>{modal.u.activo ? "No podrá entrar a PROCESST y sus sesiones abiertas se cierran. Se puede volver a activar en cualquier momento." : "Podrá volver a entrar con su contraseña."}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend} variant={modal.u.activo ? "destructive" : "default"} onClick={() => run(() => A.cambiarEstadoUsuario(modal.u.id, !modal.u.activo), modal.u.activo ? "Usuario desactivado" : "Usuario activado")}>{pend && <Spinner />} {modal.u.activo ? "Desactivar" : "Activar"}</Button>
              </DialogFooter>
            </>
          )}
          {modal?.tipo === "eliminar" && (
            <>
              <DialogHeader>
                <DialogTitle>Eliminar a {modal.u.nombre}</DialogTitle>
                <DialogDescription>Se borra el usuario ({modal.u.email}) y no se puede deshacer. Las empresas, documentos y archivos no se pierden. Si solo quiere quitarle el acceso por un tiempo, mejor desactívelo.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModal(null)}>Cancelar</Button>
                <Button disabled={pend} variant="destructive" onClick={() => run(() => A.eliminarUsuario(modal.u.id), "Usuario eliminado")}>{pend && <Spinner />} Eliminar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
