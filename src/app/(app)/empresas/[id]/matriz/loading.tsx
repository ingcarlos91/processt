import { EsqueletoContenido, EsqueletoSeccion, EsqueletoTabla } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando la matriz…"><div className="grid gap-4 lg:grid-cols-2"><EsqueletoSeccion lineas={5} /><EsqueletoSeccion lineas={5} /></div><EsqueletoTabla filas={8} columnas={8} filtros={true} titulo={true} /></EsqueletoContenido>;
}
