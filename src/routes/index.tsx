import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import { Layout } from "@/components/Layout";
import { CategoriaCard } from "@/components/CategoriaCard";
import { categorias, tienda, linkInstagram } from "@/data/tienda";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${tienda.nombre} — Indumentaria masculina` },
      { name: "description", content: "Ropa de hombre: camisas, pantalones y abrigos. Visitanos en el local o consultanos por Instagram." },
      { property: "og:title", content: `${tienda.nombre} — Indumentaria masculina` },
      { property: "og:description", content: "Ropa de hombre: camisas, pantalones y abrigos." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <Layout>
      <section className="relative">
        <img src={hero} alt="Colección de temporada" width={1600} height={1008} className="h-[80vh] w-full object-cover object-right" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-center px-6">
          <p className="eyebrow">{"\n"}</p>
          <h1 className="mt-4 max-w-md text-6xl leading-[0.95] md:text-8xl">Vestir bien, sin esfuerzo.</h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/productos" className="btn-solid">Ver productos</Link>
            <a href={linkInstagram()} target="_blank" rel="noreferrer" className="btn-line">Consultar por Instagram</a>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 flex items-end justify-between">
          <h2 className="text-4xl md:text-5xl">Categorías</h2>
          <Link to="/productos" className="eyebrow hover:text-foreground">Ver todo</Link>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          {categorias.map((c) => <CategoriaCard key={c.slug} c={c} />)}
        </div>
      </section>
      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2">
          <h2 className="text-4xl md:text-5xl">Te esperamos en el local.</h2>
          <div className="text-muted-foreground">
            <p>{tienda.direccion}</p>
            {tienda.horarios.map((h) => <p key={h.dias} className="mt-1">{h.dias}: {h.horas}</p>)}
            <Link to="/ubicacion" className="btn-line mt-8">Cómo llegar</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
