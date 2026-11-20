import { EsqueletoFormulario, EsqueletoPagina } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoPagina acciones={0}><EsqueletoFormulario campos={4} secciones={2} /></EsqueletoPagina>;
}
