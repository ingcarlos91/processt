import { EsqueletoPagina, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoPagina acciones={0}><EsqueletoTabla filas={10} columnas={5} filtros={false} titulo={true} /></EsqueletoPagina>;
}
