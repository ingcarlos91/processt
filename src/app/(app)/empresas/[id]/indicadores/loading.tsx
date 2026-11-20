import { EsqueletoContenido, EsqueletoIndicadores, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando indicadores…"><EsqueletoIndicadores n={5} /><EsqueletoTabla filas={12} columnas={6} filtros={false} titulo={true} /></EsqueletoContenido>;
}
