import { EsqueletoContenido, EsqueletoIndicadores, EsqueletoSeccion } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando la auditoría…"><EsqueletoIndicadores n={4} /><EsqueletoSeccion lineas={6} /><EsqueletoSeccion lineas={6} /></EsqueletoContenido>;
}
