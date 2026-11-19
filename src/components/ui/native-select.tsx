"use client"

// Antes: <select> nativo del navegador. Ahora dibuja el Select de shadcn (Base UI)
// con la misma API (value / defaultValue / onChange(e.target.value) y <NativeSelectOption>),
// para que todos los selectores de la app se vean igual sin cambiar cada pantalla.
import * as React from "react"
import { cn } from "cn"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size" | "onChange"> & {
  size?: "sm" | "default"
  onChange?: (e: { target: { value: string }; currentTarget: { value: string } }) => void
}

const VACIO = "__vacio__"
type Op = { value: string; label: string; disabled?: boolean }
type Grupo = { label?: string; options: Op[] }

function texto(n: React.ReactNode): string {
  if (n == null || typeof n === "boolean") return ""
  if (typeof n === "string" || typeof n === "number") return String(n)
  if (Array.isArray(n)) return n.map(texto).join("")
  if (React.isValidElement<{ children?: React.ReactNode }>(n)) return texto(n.props.children)
  return ""
}

function leer(children: React.ReactNode, grupos: Grupo[], actual: Grupo) {
  React.Children.forEach(children, (c) => {
    if (!React.isValidElement(c)) return
    const p = c.props as { value?: string | number; children?: React.ReactNode; disabled?: boolean; label?: string }
    if (c.type === React.Fragment) return leer(p.children, grupos, actual)
    if (c.type === NativeSelectOptGroup || c.type === "optgroup") {
      const g: Grupo = { label: p.label, options: [] }
      grupos.push(g)
      leer(p.children, grupos, g)
      return
    }
    const label = texto(p.children)
    const v = p.value !== undefined ? String(p.value) : label
    actual.options.push({ value: v === "" ? VACIO : v, label, disabled: p.disabled })
  })
}

function NativeSelect({ className, size = "default", children, value, defaultValue, onChange, disabled, id, name, ...rest }: NativeSelectProps) {
  const grupos: Grupo[] = []
  const base: Grupo = { options: [] }
  grupos.push(base)
  leer(children, grupos, base)
  const todas = grupos.flatMap((g) => g.options)
  const controlado = value !== undefined
  const [interno, setInterno] = React.useState(() => String(defaultValue ?? todas[0]?.value ?? ""))
  const crudo = controlado ? String(value ?? "") : interno
  const actual = crudo === "" ? (todas.some((o) => o.value === VACIO) ? VACIO : null) : crudo
  const items = Object.fromEntries(todas.map((o) => [o.value, o.label]))
  const placeholder = todas.find((o) => o.value === VACIO)?.label ?? "Seleccione…"
  return (
    <Select
      value={actual}
      items={items}
      disabled={disabled}
      name={name}
      onValueChange={(v) => {
        const val = v == null || v === VACIO ? "" : String(v)
        // Solo avisa cuando el valor realmente cambia (evita recargas en bucle al montar).
        if (val === crudo) return
        if (!controlado) setInterno(val)
        onChange?.({ target: { value: val }, currentTarget: { value: val } })
      }}
    >
      <SelectTrigger id={id} size={size} aria-label={rest["aria-label"]} className={cn("w-fit min-w-0", className)} data-slot="native-select">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {grupos.filter((g) => g.options.length).map((g, i) =>
          g.label ? (
            <SelectGroup key={i}>
              <SelectLabel>{g.label}</SelectLabel>
              {g.options.map((o) => <SelectItem key={o.value} value={o.value} disabled={o.disabled}>{o.label}</SelectItem>)}
            </SelectGroup>
          ) : (
            g.options.map((o) => <SelectItem key={o.value} value={o.value} disabled={o.disabled}>{o.label}</SelectItem>)
          )
        )}
      </SelectContent>
    </Select>
  )
}

function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option {...props} />
}

function NativeSelectOptGroup(props: React.ComponentProps<"optgroup">) {
  return <optgroup {...props} />
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
