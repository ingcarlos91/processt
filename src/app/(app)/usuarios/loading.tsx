import { EsqueletoPagina, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoPagina acciones={1}><EsqueletoTabla filas={5} columnas={5} filtros={true} titulo={true} /></EsqueletoPagina>;
}
