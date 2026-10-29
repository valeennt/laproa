import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { tienda, linkInstagram } from "@/data/tienda";

const nav = [
  { to: "/productos", label: "Productos" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/ubicacion", label: "Ubicación" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="font-display text-2xl tracking-[0.2em]">{tienda.nombre}</Link>
          <nav className="hidden gap-8 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="eyebrow hover:text-foreground" activeProps={{ className: "text-foreground" }}>{n.label}</Link>
            ))}
          </nav>
          <button className="eyebrow md:hidden" onClick={() => setOpen(!open)}>{open ? "Cerrar" : "Menú"}</button>
        </div>
        {open && (
          <nav className="flex flex-col gap-4 border-t px-6 py-6 md:hidden">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="eyebrow">{n.label}</Link>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 text-sm md:grid-cols-3">
          <div>
            <p className="font-display text-2xl tracking-[0.2em]">{tienda.nombre}</p>
            <p className="mt-2 text-muted-foreground">{tienda.lema}</p>
          </div>
          <div className="text-muted-foreground">
            <p>{tienda.direccion}</p>
            {tienda.horarios.map((h) => <p key={h.dias} className="mt-1">{h.dias}: {h.horas}</p>)}
          </div>
          <div className="flex flex-col gap-1 text-muted-foreground md:items-end">
            <a href={linkInstagram()} target="_blank" rel="noreferrer" className="hover:text-foreground">Instagram: @{tienda.instagram}</a>
          </div>
        </div>
      </footer>
      <a href={linkInstagram()} target="_blank" rel="noreferrer" className="btn-solid fixed bottom-5 right-5 z-50 shadow-lg">Instagram</a>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-12 pt-20">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-4 text-5xl md:text-7xl">{title}</h1>
      {children && <div className="mt-6 max-w-xl text-muted-foreground">{children}</div>}
    </section>
  );
}
