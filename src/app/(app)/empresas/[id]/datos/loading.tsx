import { EsqueletoContenido, EsqueletoFormulario } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando datos…"><EsqueletoFormulario campos={8} secciones={2} /></EsqueletoContenido>;
}
