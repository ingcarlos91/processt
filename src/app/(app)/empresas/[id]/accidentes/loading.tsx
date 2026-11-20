import { EsqueletoContenido, EsqueletoIndicadores, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando accidentes…"><EsqueletoIndicadores n={6} /><EsqueletoTabla filas={6} columnas={6} filtros={true} titulo={true} /></EsqueletoContenido>;
}
