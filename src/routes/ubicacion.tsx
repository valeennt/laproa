import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { tienda } from "@/data/tienda";

export const Route = createFileRoute("/ubicacion")({
  head: () => ({
    meta: [
      { title: `Ubicación y horarios — ${tienda.nombre}` },
      { name: "description", content: `Encontranos en ${tienda.direccion}.` },
      { property: "og:title", content: `Ubicación — ${tienda.nombre}` },
      { property: "og:description", content: `Encontranos en ${tienda.direccion}.` },
    ],
  }),
  component: () => (
    <Layout>
      <PageHeader eyebrow="Visitanos" title="Ubicación">{tienda.direccion}</PageHeader>
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 md:grid-cols-[2fr_1fr]">
        <iframe title="Mapa" className="aspect-video w-full grayscale" loading="lazy"
          src={`https://www.google.com/maps?q=${encodeURIComponent(tienda.direccion)}&output=embed`} />
        <div>
          <p className="eyebrow">Horarios</p>
          <ul className="mt-4 divide-y border-y">
            {tienda.horarios.map((h) => (
              <li key={h.dias} className="flex justify-between py-3 text-sm"><span>{h.dias}</span><span className="text-muted-foreground">{h.horas}</span></li>
            ))}
          </ul>
          <a className="btn-solid mt-8" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(tienda.direccion)}`}>Cómo llegar</a>
        </div>
      </section>
    </Layout>
  ),
});
