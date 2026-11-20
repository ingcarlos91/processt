import { EsqueletoContenido, EsqueletoIndicadores, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando evidencias…"><EsqueletoIndicadores n={3} /><EsqueletoTabla filas={10} columnas={4} filtros={true} titulo={true} /></EsqueletoContenido>;
}
