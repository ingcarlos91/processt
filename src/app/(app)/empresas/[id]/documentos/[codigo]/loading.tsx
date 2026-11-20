import { EsqueletoContenido, EsqueletoDocumento } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando el documento…"><EsqueletoDocumento /></EsqueletoContenido>;
}
