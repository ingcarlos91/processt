import { EsqueletoContenido, EsqueletoSeccion, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando comités…"><EsqueletoSeccion lineas={5} /><EsqueletoTabla filas={4} columnas={5} filtros={false} titulo={true} /><EsqueletoSeccion lineas={3} /></EsqueletoContenido>;
}
