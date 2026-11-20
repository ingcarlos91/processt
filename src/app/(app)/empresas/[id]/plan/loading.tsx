import { EsqueletoAgenda, EsqueletoContenido, EsqueletoIndicadores } from "@/components/app/esqueletos";

// Esqueleto con la forma de la pantalla mientras cargan los datos.
export default function Loading() {
  return <EsqueletoContenido texto="Cargando el plan anual…"><EsqueletoIndicadores n={4} /><EsqueletoAgenda grupos={3} porGrupo={5} /></EsqueletoContenido>;
}
