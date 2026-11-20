import { EsqueletoAgenda, EsqueletoIndicadores, EsqueletoPagina } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoPagina acciones={2}><EsqueletoIndicadores n={4} /><EsqueletoAgenda grupos={3} porGrupo={4} /></EsqueletoPagina>;
}
