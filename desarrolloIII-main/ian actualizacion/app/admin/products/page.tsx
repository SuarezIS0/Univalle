"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
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
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de productos</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 p-6 rounded-lg mb-8 grid md:grid-cols-2 gap-4"
        >
          <h2 className="md:col-span-2 text-xl font-bold">
            {editingId ? "Editar producto" : "Nuevo producto"}
          </h2>
          <input
            required
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
          >
            <option value="ropa">Ropa</option>
            <option value="accesorios">Accesorios</option>
            <option value="libros">Libros</option>
            <option value="papeleria">Papelería</option>
            <option value="tecnologia">Tecnología</option>
            <option value="otros">Otros</option>
          </select>
          <textarea
            required
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="md:col-span-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded"
          />
          <input
            required
            type="number"
            placeholder="Precio"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
          />
          <input
            required
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
          />
          <input
            placeholder="URL de imagen"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="md:col-span-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded"
          />
          {error && <p className="md:col-span-2 text-red-400">{error}</p>}
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 rounded hover:bg-green-700"
            >
              {editingId ? "Guardar cambios" : "Crear"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(EMPTY);
                }}
                className="px-6 py-2 bg-gray-600 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3 text-left">Nombre</th>
                <th className="p-3 text-left">Categoría</th>
                <th className="p-3 text-right">Precio</th>
                <th className="p-3 text-right">Stock</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-700">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-sm text-gray-400">{p.category}</td>
                  <td className="p-3 text-right">{formatPrice(p.price)}</td>
                  <td className="p-3 text-right">{p.stock}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
