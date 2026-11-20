import { EsqueletoContenido, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando versiones…"><EsqueletoTabla filas={5} columnas={5} filtros={true} titulo={true} /></EsqueletoContenido>;
}
