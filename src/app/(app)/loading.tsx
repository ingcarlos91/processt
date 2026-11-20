import { EsqueletoPagina, EsqueletoTablero } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoPagina acciones={1}><EsqueletoTablero /></EsqueletoPagina>;
}
