import { Link } from "@tanstack/react-router";
import type { Categoria } from "@/data/tienda";

export function CategoriaCard({ c }: { c: Categoria }) {
  return (
    <Link to="/productos/$categoria" params={{ categoria: c.slug }} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-card">
        <img src={c.imagen} alt={c.nombre} loading="lazy" width={800} height={1008} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-2xl">{c.nombre}</h3>
        <span className="eyebrow">Ver →</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{c.descripcion}</p>
    </Link>
  );
}
