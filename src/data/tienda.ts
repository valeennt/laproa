// ✏️ Editá este archivo para cambiar textos, productos y datos del local.
import camisas from "@/assets/camisas.jpg";
import pantalones from "@/assets/pantalones.jpg";
import abrigos from "@/assets/abrigos.jpg";

export const tienda = {
  nombre: "LAPROA",
  lema: "Indumentaria masculina",
  instagram: "laproaalberdi",
  direccion: "Av. Alberdi 727, Rosario, Santa Fe",
  horarios: [
    { dias: "Lunes a sábados", horas: "9:00 – 13:00 y 16:00 – 20:00" },
    { dias: "Domingos", horas: "Cerrado" },
  ],
};

export type Producto = { nombre: string; precio: number; talles: string };
export type Categoria = { slug: string; nombre: string; descripcion: string; imagen: string; productos: Producto[] };

export const categorias: Categoria[] = [
  {
    slug: "camisas",
    nombre: "Camisas",
    descripcion: "Algodón, lino y oxford. Cortes clásicos y slim.",
    imagen: camisas,
    productos: [
      { nombre: "Camisa Oxford blanca", precio: 45000, talles: "S – XXL" },
      { nombre: "Camisa lino celeste", precio: 52000, talles: "S – XL" },
      { nombre: "Camisa algodón arena", precio: 48000, talles: "M – XXL" },
    ],
  },
  {
    slug: "pantalones",
    nombre: "Pantalones",
    descripcion: "Jeans, chinos y pantalones de vestir.",
    imagen: pantalones,
    productos: [
      { nombre: "Jean recto índigo", precio: 58000, talles: "38 – 50" },
      { nombre: "Chino gabardina beige", precio: 54000, talles: "38 – 50" },
      { nombre: "Pantalón sastrero gris", precio: 66000, talles: "40 – 52" },
    ],
  },
  {
    slug: "abrigos",
    nombre: "Abrigos",
    descripcion: "Sacos, camperas y tapados para cada temporada.",
    imagen: abrigos,
    productos: [
      { nombre: "Campera de paño carbón", precio: 120000, talles: "S – XL" },
      { nombre: "Tapado lana camel", precio: 160000, talles: "M – XXL" },
      { nombre: "Saco sport azul", precio: 135000, talles: "46 – 56" },
    ],
  },
];

export const precio = (n: number) => "$ " + n.toLocaleString("es-AR");
export const linkInstagram = () => `https://instagram.com/${tienda.instagram}`;
