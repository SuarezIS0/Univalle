"use client";

import { useEffect, useState } from "react";
import Navbar from "@/app/components/Navbar";
import ProductCard from "@/app/components/ProductCard";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
};

const CATEGORIES = [
  { value: "", label: "Todas" },
  { value: "ropa", label: "Ropa" },
  { value: "accesorios", label: "Accesorios" },
  { value: "libros", label: "Libros" },
  { value: "papeleria", label: "Papelería" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "otros", label: "Otros" },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (search) params.set("search", search);
        const res = await fetch(`/api/products?${params.toString()}`);
        const json = await res.json();
        setProducts(json.data ?? []);
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [category, search]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Catálogo</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-blue-500 outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded focus:border-blue-500 outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-gray-400">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-400">No se encontraron productos.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
