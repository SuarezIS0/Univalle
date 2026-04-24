"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { formatPrice } from "@/app/lib/cart";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
};

const EMPTY = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
  category: "otros",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const load = async () => {
    const res = await fetch("/api/products");
    const json = await res.json();
    setProducts(json.data ?? []);
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(t.split(".")[1]));
      if (payload.role !== "admin") {
        router.push("/");
        return;
      }
    } catch {
      router.push("/login");
      return;
    }
    setToken(t);
    load();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const url = editingId ? `/api/products/${editingId}` : "/api/products";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      }),
    });
    const json = await res.json();
    if (!json.success) {
      setError(json.error ?? "Error");
      return;
    }
    setForm(EMPTY);
    setEditingId(null);
    load();
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm(p);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-16 w-full flex-1">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-wider text-gray-500">
            Administración
          </span>
          <h1 className="text-4xl font-semibold tracking-display text-black mt-2">
            Gestión de productos
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border border-gray-100 rounded-2xl p-8 mb-14"
        >
          <h2 className="text-[13px] uppercase tracking-wider text-gray-500 mb-6">
            {editingId ? "Editar producto" : "Nuevo producto"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="uv-label">Nombre</label>
              <input
                required
                placeholder="Nombre del programa"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="uv-input h-11"
              />
            </div>
            <div>
              <label className="uv-label">Categoría</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
                className="uv-input h-11"
              >
                <option value="maestrias">Maestrías</option>
                <option value="diplomados">Diplomados</option>
                <option value="cursos">Cursos</option>
                <option value="ropa">Ropa</option>
                <option value="accesorios">Accesorios</option>
                <option value="libros">Libros</option>
                <option value="papeleria">Papelería</option>
                <option value="tecnologia">Tecnología</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="uv-label">Descripción</label>
              <textarea
                required
                placeholder="Breve descripción del programa"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="uv-input min-h-[96px] py-3"
              />
            </div>
            <div>
              <label className="uv-label">Precio (COP)</label>
              <input
                required
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="uv-input h-11"
              />
            </div>
            <div>
              <label className="uv-label">Stock / cupos</label>
              <input
                required
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="uv-input h-11"
              />
            </div>
            <div className="md:col-span-2">
              <label className="uv-label">URL de imagen</label>
              <input
                placeholder="https://…"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="uv-input h-11"
              />
            </div>
          </div>

          {error && (
            <p className="text-[var(--uv-red)] border border-[var(--uv-red)]/20 bg-[var(--uv-red)]/5 rounded-md p-3 text-sm mt-6">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button type="submit" className="uv-btn-primary">
              {editingId ? "Guardar cambios" : "Crear producto"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY);
                }}
                className="uv-btn-ghost"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="border border-gray-100 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium">
                  Nombre
                </th>
                <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium">
                  Categoría
                </th>
                <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium text-right">
                  Precio
                </th>
                <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium text-right">
                  Stock
                </th>
                <th className="py-3 px-5"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-5 text-black">{p.name}</td>
                  <td className="py-4 px-5 text-gray-500">{p.category}</td>
                  <td className="py-4 px-5 text-right text-black">
                    {formatPrice(p.price)}
                  </td>
                  <td className="py-4 px-5 text-right text-gray-700">
                    {p.stock}
                  </td>
                  <td className="py-4 px-5 text-right space-x-4 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-sm text-black hover:text-[var(--uv-red)]"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-sm text-gray-500 hover:text-[var(--uv-red)]"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 px-5 text-center text-gray-500"
                  >
                    Aún no has creado productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}
