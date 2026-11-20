import { EsqueletoContenido, EsqueletoIndicadores, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando el diagnóstico…"><EsqueletoIndicadores n={4} /><EsqueletoTabla filas={6} columnas={5} filtros={true} titulo={true} /></EsqueletoContenido>;
}
