import { EsqueletoDocumento, EsqueletoPagina } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoPagina acciones={1}><EsqueletoDocumento /></EsqueletoPagina>;
}
