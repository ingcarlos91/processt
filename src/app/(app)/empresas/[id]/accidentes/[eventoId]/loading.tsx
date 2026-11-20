import { EsqueletoContenido, EsqueletoFormulario } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando el evento…"><EsqueletoFormulario campos={10} secciones={3} /></EsqueletoContenido>;
}
