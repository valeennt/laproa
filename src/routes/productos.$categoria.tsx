
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout, PageHeader } from "@/components/Layout";
import { categorias, precio, linkInstagram, tienda } from "@/data/tienda";
import { supabase } from "@/lib/supabase";

type ProductoDB = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  talles: string | null;
  stock: number;
  imagen_url: string | null;
};

export const Route = createFileRoute("/productos/$categoria")({
  loader: ({ params }) => {
    const categoria = categorias.find((x) => x.slug === params.categoria);
    if (!categoria) throw notFound();
    return { slug: categoria.slug };
  },
  head: ({ loaderData }) => {
    const categoria = categorias.find((x) => x.slug === loaderData?.slug);
    const titulo = categoria
      ? `${categoria.nombre} — ${tienda.nombre}`
      : "Categoría no encontrada";

    return {
      meta: [
        { title: titulo },
        { name: "description", content: categoria?.descripcion ?? "" },
        { property: "og:title", content: titulo },
        { property: "og:description", content: categoria?.descripcion ?? "" },
      ],
    };
  },
  component: CategoriaPage,
});

function CategoriaPage() {
  const { slug } = Route.useLoaderData();
  const categoria = categorias.find((x) => x.slug === slug)!;

  const [productos, setProductos] = useState<ProductoDB[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let vigente = true;

    async function cargarProductos() {
      setCargando(true);
      setError("");

      const { data, error } = await supabase
        .from("productos")
        .select(
          "id, nombre, categoria, precio, talles, stock, imagen_url",
        )
        .eq("categoria", slug)
        .eq("activo", true)
        .order("id");

      if (!vigente) return;

      if (error) {
        setError(
          "No pudimos cargar los productos. Intentá nuevamente más tarde.",
        );
      } else {
        setProductos((data ?? []) as ProductoDB[]);
      }

      setCargando(false);
    }

    void cargarProductos();

    return () => {
      vigente = false;
    };
  }, [slug]);

  return (
    <Layout>
      <PageHeader eyebrow="Productos" title={categoria.nombre}>
        {categoria.descripcion}
      </PageHeader>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {cargando && (
          <p className="py-6 text-sm text-muted-foreground">
            Cargando productos...
          </p>
        )}

        {error && (
          <p className="py-6 text-sm text-muted-foreground">{error}</p>
        )}

        {!cargando && !error && productos.length === 0 && (
          <p className="py-6 text-sm text-muted-foreground">
            No hay productos disponibles en esta categoría.
          </p>
        )}

        {!error && productos.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <article key={producto.id} className="min-w-0">
                <div className="aspect-[4/5] overflow-hidden bg-muted">
                  {producto.imagen_url ? (
                    <img
                      src={producto.imagen_url}
                      alt={producto.nombre}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                      Foto próximamente
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <h2 className="font-display text-2xl">
                    {producto.nombre}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Talles {producto.talles || "Consultar"}
                  </p>

                  <p className="mt-1 font-medium">
                    {precio(Number(producto.precio))}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {producto.stock > 0
                      ? `${producto.stock} unidades disponibles`
                      : "Consultar disponibilidad"}
                  </p>

                  <a
                    href={linkInstagram()}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-line mt-4 inline-flex"
                  >
                    Consultar por Instagram
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="py-8">
          <Link to="/productos" className="eyebrow hover:text-foreground">
            ← Todas las categorías
          </Link>
        </div>
      </section>
    </Layout>
  );
}