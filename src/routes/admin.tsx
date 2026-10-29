import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/lib/supabase";

type Producto = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  talles: string | null;
  stock: number;
  activo: boolean;
  imagen_url: string | null;
};

const productoVacio = {
  nombre: "",
  categoria: "camisas",
  precio: "",
  talles: "",
  stock: "0",
  activo: true,
};

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [cargando, setCargando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState<number | null>(null);
  const [nuevo, setNuevo] = useState(productoVacio);
  const [creando, setCreando] = useState(false);
  const [imagenNueva, setImagenNueva] = useState<File | null>(null);
  const [imagenesProducto, setImagenesProducto] = useState<
    Record<number, File | null>
  >({});

  async function subirImagen(archivo: File, prefijo: string) {
    if (!archivo.type.startsWith("image/")) {
      throw new Error("Elegí un archivo de imagen válido.");
    }

    if (archivo.size > 5 * 1024 * 1024) {
      throw new Error("La imagen debe pesar menos de 5 MB.");
    }

    const extension =
      archivo.name.split(".").pop()?.toLowerCase() || "jpg";

    const nombreArchivo =
      `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

    const { error: errorSubida } = await supabase.storage
      .from("productos")
      .upload(nombreArchivo, archivo, {
        cacheControl: "3600",
        upsert: false,
        contentType: archivo.type,
      });

    if (errorSubida) throw errorSubida;

    const { data } = supabase.storage
      .from("productos")
      .getPublicUrl(nombreArchivo);

    return data.publicUrl;
  }

  async function cargarProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select(
        "id, nombre, categoria, precio, talles, stock, activo, imagen_url",
      )
      .order("id");

    if (error) {
      setError("No se pudieron cargar los productos: " + error.message);
      return;
    }

    setProductos((data ?? []) as Producto[]);
  }

  async function verificarUsuario() {
    setCargando(true);
    setAutorizado(false);

    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setCargando(false);
      return;
    }

    setEmail(data.session.user.email ?? "");

    const { data: esAdmin, error: adminError } =
      await supabase.rpc("is_admin");

    if (adminError || esAdmin !== true) {
      await supabase.auth.signOut();
      setError("Tu cuenta no tiene permisos de administrador.");
      setCargando(false);
      return;
    }

    setAutorizado(true);
    setCargando(false);
    await cargarProductos();
  }

  useEffect(() => {
    void verificarUsuario();

    const { data } = supabase.auth.onAuthStateChange(() => {
      void verificarUsuario();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function iniciarSesion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMensaje("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        "No se pudo iniciar sesión. Revisá tus datos e intentá de nuevo.",
      );
      return;
    }

    setPassword("");
    await verificarUsuario();
  }

  async function cerrarSesion() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setError("No se pudo cerrar la sesión. Intentá nuevamente.");
      return;
    }

    setAutorizado(false);
    setProductos([]);
    setMensaje("");
    setError("");
  }

  function cambiarProducto(
    id: number,
    campo: "precio" | "stock" | "talles" | "activo",
    valor: number | string | boolean | null,
  ) {
    setProductos((actuales) =>
      actuales.map((p) =>
        p.id === id ? { ...p, [campo]: valor } : p,
      ),
    );
  }

  function elegirImagenProducto(
    id: number,
    e: ChangeEvent<HTMLInputElement>,
  ) {
    const archivo = e.target.files?.[0] ?? null;

    setImagenesProducto((actuales) => ({
      ...actuales,
      [id]: archivo,
    }));
  }

  async function guardarProducto(producto: Producto) {
    setGuardando(producto.id);
    setError("");
    setMensaje("");

    if (
      !Number.isFinite(Number(producto.precio)) ||
      Number(producto.precio) < 0 ||
      !Number.isInteger(Number(producto.stock)) ||
      Number(producto.stock) < 0
    ) {
      setError(
        "El precio debe ser positivo y el stock un número entero no negativo.",
      );
      setGuardando(null);
      return;
    }

    try {
      let imagen_url = producto.imagen_url;
      const archivo = imagenesProducto[producto.id];

      if (archivo) {
        imagen_url = await subirImagen(
          archivo,
          `producto-${producto.id}`,
        );
      }

      const { error } = await supabase
        .from("productos")
        .update({
          precio: Number(producto.precio),
          talles: producto.talles,
          stock: Number(producto.stock),
          activo: producto.activo,
          imagen_url,
        })
        .eq("id", producto.id);

      if (error) throw error;

      setImagenesProducto((actuales) => ({
        ...actuales,
        [producto.id]: null,
      }));

      setMensaje(`Se guardaron los cambios de ${producto.nombre}.`);
      await cargarProductos();
    } catch (e) {
      setError(
        "No se pudieron guardar los cambios: " +
          (e instanceof Error ? e.message : "Error desconocido."),
      );
    } finally {
      setGuardando(null);
    }
  }

  async function crearProducto(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMensaje("");

    const precio = Number(nuevo.precio);
    const stock = Number(nuevo.stock);

    if (!nuevo.nombre.trim()) {
      setError("Escribí el nombre del producto.");
      return;
    }

    if (
      nuevo.precio.trim() === "" ||
      !Number.isFinite(precio) ||
      precio < 0
    ) {
      setError("Ingresá un precio válido, igual o mayor que cero.");
      return;
    }

    if (
      nuevo.stock.trim() === "" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setError(
        "El stock debe ser un número entero igual o mayor que cero.",
      );
      return;
    }

    setCreando(true);

    try {
      let imagen_url: string | null = null;

      if (imagenNueva) {
        imagen_url = await subirImagen(imagenNueva, "producto-nuevo");
      }

      const { error } = await supabase.from("productos").insert({
        nombre: nuevo.nombre.trim(),
        categoria: nuevo.categoria,
        precio,
        talles: nuevo.talles.trim() || null,
        stock,
        activo: nuevo.activo,
        imagen_url,
      });

      if (error) throw error;

      setMensaje(
        `¡Producto "${nuevo.nombre.trim()}" creado correctamente!`,
      );
      setNuevo({ ...productoVacio });
      setImagenNueva(null);

      const selector = document.getElementById(
        "imagen-nuevo-producto",
      ) as HTMLInputElement | null;

      if (selector) selector.value = "";

      await cargarProductos();
    } catch (e) {
      setError(
        "No se pudo crear el producto: " +
          (e instanceof Error ? e.message : "Error desconocido."),
      );
    } finally {
      setCreando(false);
    }
  }

  async function eliminarProducto(producto: Producto) {
    const confirmar = window.confirm(
      `¿Seguro que querés eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmar) return;

    setError("");
    setMensaje("");
    setGuardando(producto.id);

    const { error } = await supabase
      .from("productos")
      .delete()
      .eq("id", producto.id);

    setGuardando(null);

    if (error) {
      setError("No se pudo eliminar el producto: " + error.message);
      return;
    }

    setMensaje(`Se eliminó "${producto.nombre}".`);
    await cargarProductos();
  }

  if (cargando) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-6 py-20">
          Verificando acceso...
        </div>
      </Layout>
    );
  }

  if (!autorizado) {
    return (
      <Layout>
        <section className="mx-auto max-w-md px-6 py-20">
          <p className="eyebrow">LAPROA · Administración</p>
          <h1 className="mt-3 font-display text-4xl">
            Iniciar sesión
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Ingresá con tu cuenta autorizada para administrar la tienda.
          </p>

          <form onSubmit={iniciarSesion} className="mt-8 grid gap-5">
            <label className="grid gap-2 text-sm">
              Correo electrónico
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border bg-background px-4 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Contraseña
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border bg-background px-4 py-3"
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button type="submit" className="btn-line w-full">
              Entrar al administrador
            </button>

            <Link to="/" className="text-center text-sm hover:underline">
              Volver a la tienda
            </Link>
          </form>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">LAPROA · Administración</p>
            <h1 className="mt-2 font-display text-4xl">
              Panel de control
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sesión iniciada: {email || "Administrador"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/" className="btn-line">
              Ver tienda
            </Link>
            <button onClick={cerrarSesion} className="btn-line">
              Cerrar sesión
            </button>
          </div>
        </div>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="border bg-background p-5">
            <p className="text-sm text-muted-foreground">
              Productos cargados
            </p>
            <p className="mt-2 font-display text-3xl">
              {productos.length}
            </p>
          </div>

          <div className="border bg-background p-5">
            <p className="text-sm text-muted-foreground">
              Productos activos
            </p>
            <p className="mt-2 font-display text-3xl">
              {productos.filter((p) => p.activo).length}
            </p>
          </div>

          <div className="border bg-background p-5">
            <p className="text-sm text-muted-foreground">
              Unidades en stock
            </p>
            <p className="mt-2 font-display text-3xl">
              {productos.reduce(
                (total, p) => total + Number(p.stock),
                0,
              )}
            </p>
          </div>
        </section>

        {error && (
          <p role="alert" className="mb-5 text-sm text-red-600">
            {error}
          </p>
        )}

        {mensaje && (
          <p role="status" className="mb-5 text-sm">
            {mensaje}
          </p>
        )}

        <section className="mb-8 border bg-background p-5 sm:p-7">
          <h2 className="font-display text-2xl">Agregar producto</h2>
          <p className="mt-1 mb-6 text-sm text-muted-foreground">
            Completá los datos y elegí una foto desde tu computadora.
            Máximo 5 MB por imagen.
          </p>

          <form
            onSubmit={crearProducto}
            className="grid gap-4 sm:grid-cols-2"
          >
            <label className="grid gap-2 text-sm sm:col-span-2">
              Nombre del producto
              <input
                required
                value={nuevo.nombre}
                onChange={(e) =>
                  setNuevo({ ...nuevo, nombre: e.target.value })
                }
                placeholder="Ej. Camisa de lino blanca"
                className="w-full border bg-background px-3 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Categoría
              <select
                value={nuevo.categoria}
                onChange={(e) =>
                  setNuevo({ ...nuevo, categoria: e.target.value })
                }
                className="w-full border bg-background px-3 py-3"
              >
                <option value="camisas">Camisas</option>
                <option value="pantalones">Pantalones</option>
                <option value="abrigos">Abrigos</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              Precio ($)
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={nuevo.precio}
                onChange={(e) =>
                  setNuevo({ ...nuevo, precio: e.target.value })
                }
                placeholder="45000"
                className="w-full border bg-background px-3 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Talles disponibles
              <input
                value={nuevo.talles}
                onChange={(e) =>
                  setNuevo({ ...nuevo, talles: e.target.value })
                }
                placeholder="Ej. S - XXL o 38 - 50"
                className="w-full border bg-background px-3 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Unidades en stock
              <input
                type="number"
                min="0"
                step="1"
                required
                value={nuevo.stock}
                onChange={(e) =>
                  setNuevo({ ...nuevo, stock: e.target.value })
                }
                className="w-full border bg-background px-3 py-3"
              />
            </label>

            <label className="grid gap-2 text-sm sm:col-span-2">
              Foto del producto
              <input
                id="imagen-nuevo-producto"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImagenNueva(e.target.files?.[0] ?? null)
                }
                className="w-full border bg-background px-3 py-3"
              />
              {imagenNueva && (
                <span className="text-xs text-muted-foreground">
                  Seleccionada: {imagenNueva.name}
                </span>
              )}
            </label>

            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                checked={nuevo.activo}
                onChange={(e) =>
                  setNuevo({ ...nuevo, activo: e.target.checked })
                }
              />
              Mostrar este producto en la tienda
            </label>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={creando}
                className="btn-line"
              >
                {creando ? "Creando producto..." : "Agregar producto"}
              </button>
            </div>
          </form>
        </section>

        <section className="border bg-background p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">
                Productos y stock
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Modificá los datos y elegí una foto si querés cambiarla.
                Después guardá los cambios.
              </p>
            </div>

            <button
              onClick={() => void cargarProductos()}
              className="btn-line"
            >
              Actualizar lista
            </button>
          </div>

          {productos.length === 0 ? (
            <p className="py-8 text-sm text-muted-foreground">
              No hay productos para mostrar.
            </p>
          ) : (
            <div className="grid gap-5">
              {productos.map((producto) => (
                <article
                  key={producto.id}
                  className="border p-4 sm:p-5"
                >
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="h-24 w-20 border object-cover"
                        />
                      ) : (
                        <div className="flex h-24 w-20 items-center justify-center border text-xs text-muted-foreground">
                          Sin foto
                        </div>
                      )}

                      <div>
                        <h3 className="font-display text-xl">
                          {producto.nombre}
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                          {producto.categoria}
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={producto.activo}
                        onChange={(e) =>
                          cambiarProducto(
                            producto.id,
                            "activo",
                            e.target.checked,
                          )
                        }
                      />
                      Producto activo
                    </label>
                  </div>

                  <label className="mb-4 grid gap-2 text-sm">
                    Cambiar foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        elegirImagenProducto(producto.id, e)
                      }
                      className="w-full border bg-background px-3 py-3"
                    />

                    {imagenesProducto[producto.id] && (
                      <span className="text-xs text-muted-foreground">
                        Nueva foto: {imagenesProducto[producto.id]?.name}
                      </span>
                    )}
                  </label>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <label className="grid gap-2 text-sm">
                      Precio ($)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={producto.precio}
                        onChange={(e) =>
                          cambiarProducto(
                            producto.id,
                            "precio",
                            e.target.value === ""
                              ? 0
                              : Number(e.target.value),
                          )
                        }
                        className="w-full border bg-background px-3 py-2"
                      />
                    </label>

                    <label className="grid gap-2 text-sm">
                      Talles
                      <input
                        value={producto.talles ?? ""}
                        onChange={(e) =>
                          cambiarProducto(
                            producto.id,
                            "talles",
                            e.target.value,
                          )
                        }
                        placeholder="Ej. S - XXL"
                        className="w-full border bg-background px-3 py-2"
                      />
                    </label>

                    <label className="grid gap-2 text-sm">
                      Stock (unidades)
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={producto.stock}
                        onChange={(e) =>
                          cambiarProducto(
                            producto.id,
                            "stock",
                            e.target.value === ""
                              ? 0
                              : Number(e.target.value),
                          )
                        }
                        className="w-full border bg-background px-3 py-2"
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      className="btn-line"
                      disabled={guardando === producto.id}
                      onClick={() => void eliminarProducto(producto)}
                    >
                      {guardando === producto.id
                        ? "Procesando..."
                        : "Eliminar producto"}
                    </button>

                    <button
                      type="button"
                      className="btn-line"
                      disabled={guardando === producto.id}
                      onClick={() => void guardarProducto(producto)}
                    >
                      {guardando === producto.id
                        ? "Guardando..."
                        : "Guardar cambios"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-6 text-xs leading-5 text-muted-foreground">
          Los pedidos y pagos todavía no están conectados a un proceso de
          compra real. Los cambios de productos e imágenes se guardan
          en Supabase.
        </p>
      </main>
    </Layout>
  );
}