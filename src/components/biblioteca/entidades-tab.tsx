"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Simple } from "@/components/biblioteca/accidentes-tab";
import type { ItemSimple } from "@/lib/catalogo-accidentes";

/** Biblioteca global de entidades: ARL, EPS, fondos de pensiones y escolaridad. */
export function EntidadesTab({ items }: { items: Record<"ARL" | "EPS" | "AFP" | "ESCOLARIDAD", ItemSimple[]> }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Listas que se ofrecen al registrar empresas y trabajadores. Lo que cambie aquí aplica a todas las empresas; siempre se puede escribir otro valor.</p>
      <Tabs defaultValue="EPS">
        <TabsList variant="line">
          <TabsTrigger value="EPS">EPS ({items.EPS.length})</TabsTrigger>
          <TabsTrigger value="AFP">Fondos de pensiones ({items.AFP.length})</TabsTrigger>
          <TabsTrigger value="ARL">ARL ({items.ARL.length})</TabsTrigger>
          <TabsTrigger value="ESCOLARIDAD">Escolaridad ({items.ESCOLARIDAD.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="EPS" className="mt-4"><Simple tipo="EPS" titulo="EPS" items={items.EPS} descripcion="Entidades promotoras de salud. Verifique que sigan habilitadas por la Superintendencia de Salud." /></TabsContent>
        <TabsContent value="AFP" className="mt-4"><Simple tipo="AFP" titulo="Fondos de pensiones" items={items.AFP} descripcion="Administradoras de pensiones (Colpensiones y fondos privados)." /></TabsContent>
        <TabsContent value="ARL" className="mt-4"><Simple tipo="ARL" titulo="ARL" items={items.ARL} descripcion="Administradoras de riesgos laborales." /></TabsContent>
        <TabsContent value="ESCOLARIDAD" className="mt-4"><Simple tipo="ESCOLARIDAD" titulo="Niveles de escolaridad" items={items.ESCOLARIDAD} descripcion="Para el perfil sociodemográfico (FOR-01)." /></TabsContent>
      </Tabs>
    </div>
  );
}
