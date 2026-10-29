import { createFileRoute } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { tienda } from "@/data/tienda";

export const Route = createFileRoute("/nosotros")({
  head: () => ({
    meta: [
      { title: `Nosotros — ${tienda.nombre}` },
      { name: "description", content: "Conocé nuestra historia y forma de trabajar." },
      { property: "og:title", content: `Nosotros — ${tienda.nombre}` },
      { property: "og:description", content: "Conocé nuestra historia y forma de trabajar." },
    ],
  }),
  component: () => (
    <Layout>
      <PageHeader eyebrow="Información" title="Nosotros" />
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 md:grid-cols-3">
        {[
          ["Calidad", "Elegimos telas y confecciones que duran, para que cada prenda acompañe muchas temporadas."],
          ["Atención", "Te asesoramos en talles y combinaciones, en el local o por Instagram."],
          ["Cambios", "Podés cambiar tu prenda dentro de los 30 días presentando el ticket."],
        ].map(([t, d]) => (
          <div key={t} className="border-t pt-6">
            <h2 className="text-3xl">{t}</h2>
            <p className="mt-3 text-muted-foreground">{d}</p>
          </div>
        ))}
      </section>
    </Layout>
  ),
});
