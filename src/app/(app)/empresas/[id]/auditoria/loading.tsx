import { EsqueletoContenido, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando auditorías…"><EsqueletoTabla filas={4} columnas={6} filtros={true} titulo={true} /></EsqueletoContenido>;
}
