import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Layout, PageHeader } from "@/components/Layout";
import { tienda, linkInstagram } from "@/data/tienda";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: `Contacto — ${tienda.nombre}` },
      { name: "description", content: `Escribinos por Instagram o visitanos en ${tienda.direccion}.` },
      { property: "og:title", content: `Contacto — ${tienda.nombre}` },
      { property: "og:description", content: `Escribinos por Instagram o visitanos en ${tienda.direccion}.` },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const field = "border-t pt-4";
  return (
    <Layout>
      <PageHeader eyebrow="Hablemos" title="Contacto">Consultanos por Instagram o pasate por el local.</PageHeader>
      <section className="mx-auto grid max-w-6xl gap-16 px-6 pb-24 md:grid-cols-2">
        <dl className="space-y-6 text-sm">
          <div className={field}>
            <dt className="eyebrow">Instagram</dt>
            <dd className="mt-2 text-base">
              <a href={linkInstagram()} target="_blank" rel="noreferrer" className="hover:text-foreground underline underline-offset-4">@{tienda.instagram}</a>
            </dd>
          </div>
          <div className={field}>
            <dt className="eyebrow">Dirección</dt>
            <dd className="mt-2 text-base">{tienda.direccion}</dd>
          </div>
          <div className={field}>
            <dt className="eyebrow">Horarios</dt>
            <dd className="mt-2 space-y-1 text-base">
              {tienda.horarios.map((h) => <p key={h.dias}>{h.dias}: {h.horas}</p>)}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col justify-center gap-4">
          <a href={linkInstagram()} target="_blank" rel="noreferrer" className="btn-solid w-fit">Escribinos por Instagram</a>
          <Link to="/ubicacion" className="btn-line w-fit">Cómo llegar</Link>
        </div>
      </section>
    </Layout>
  );
}
