
import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { CategoriaCard } from "@/components/CategoriaCard";
import { categorias, tienda } from "@/data/tienda";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/productos/")({
  head: () => ({
    meta: [
      { title: `Productos — ${tienda.nombre}` },
      {
        name: "description",
        content: "Explorá nuestras categorías de ropa de hombre.",
      },
      { property: "og:title", content: `Productos — ${tienda.nombre}` },
      {
        property: "og:description",
        content: "Explorá nuestras categorías de ropa de hombre.",
      },
    ],
  }),
  component: ProductosPage,
});

function ProductosPage() {
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarProductos() {
      const { data, error } = await supabase
        .from("productos")
        .select("categoria")
        .eq("activo", true);

      if (error) {
        setError("No pudimos cargar los productos. Intentá nuevamente más tarde.");
        return;
      }

      const conteo: Record<string, number> = {};

      for (const producto of data ?? []) {
        conteo[producto.categoria] = (conteo[producto.categoria] ?? 0) + 1;
      }

      setCantidades(conteo);
    }

    void cargarProductos();
  }, []);

  const categoriasVisibles = categorias.filter(
    (categoria) => (cantidades[categoria.slug] ?? 0) > 0,
  );

  return (
    <Layout>
      <PageHeader eyebrow="Catálogo" title="Productos" />

      {error ? (
        <p className="mx-auto max-w-6xl px-6 pb-24 text-sm text-muted-foreground">
          {error}
        </p>
      ) : (
        <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 md:grid-cols-3">
          {categoriasVisibles.map((categoria) => (
            <CategoriaCard key={categoria.slug} c={categoria} />
          ))}
        </section>
      )}
    </Layout>
  );
}
