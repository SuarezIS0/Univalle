"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProductCard from "@/app/components/ProductCard";
import { apiFetch } from "@/app/lib/api";

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
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const r = await apiFetch<Product[]>("/api/products");
      if (!r.ok) {
        setProducts([]);
        setError(r.error || "Error al cargar productos");
      } else {
        setProducts(r.data ?? []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of products) map[p.category] = (map[p.category] ?? 0) + 1;
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    return products.filter((p) => {
      if (selectedCats.length && !selectedCats.includes(p.category)) return false;
      if (min !== null && !Number.isNaN(min) && p.price < min) return false;
      if (max !== null && !Number.isNaN(max) && p.price > max) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (q) {
        const hay = `${p.name} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, search, selectedCats, minPrice, maxPrice, inStockOnly]);

  const activeFiltersCount =
    (search ? 1 : 0) +
    selectedCats.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const clearAll = () => {
    setSearch("");
    setSelectedCats([]);
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
  };

  const toggleCat = (value: string) => {
    setSelectedCats((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const FiltersPanel = (
    <aside className="w-full lg:w-[280px] lg:shrink-0">
      <div className="lg:sticky lg:top-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-semibold tracking-display text-black">
            Filtros
          </h2>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAll}
              className="text-[12px] text-[var(--uv-red)] hover:text-[var(--uv-red-dark)] font-medium"
            >
              Limpiar ({activeFiltersCount})
            </button>
          )}
        </div>

        <div className="mb-7">
          <label className="uv-label">Buscar</label>
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.6}
              stroke="currentColor"
              className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              placeholder="Nombre o descripción…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="uv-input h-11 pl-10"
            />
          </div>
        </div>

        <div className="mb-7">
          <label className="uv-label">Categorías</label>
          <ul className="space-y-1">
            {CATEGORIES.map((c) => {
              const checked = selectedCats.includes(c.value);
              const count = counts[c.value] ?? 0;
              return (
                <li key={c.value}>
                  <label className="flex items-center gap-3 py-1.5 px-1 rounded-md hover:bg-gray-50 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCat(c.value)}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--uv-red)] focus:ring-[var(--uv-red)]/30 accent-[var(--uv-red)]"
                    />
                    <span className="flex-1 text-[14px] text-gray-700 group-hover:text-black">
                      {c.label}
                    </span>
                    <span className="text-[11px] text-gray-400">{count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mb-7">
          <label className="uv-label">Rango de precio</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Mín"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="uv-input h-11"
            />
            <span className="text-gray-400 text-sm">—</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Máx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="uv-input h-11"
            />
          </div>
        </div>

        <div>
          <label className="uv-label">Disponibilidad</label>
          <label className="flex items-center gap-3 py-1.5 px-1 rounded-md hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-[var(--uv-red)]"
            />
            <span className="text-[14px] text-gray-700">Solo en stock</span>
          </label>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
          <span className="text-[11px] uppercase tracking-wider text-gray-500">
            Catálogo
          </span>
          <h1 className="text-5xl font-semibold tracking-display text-black mt-3 mb-4">
            Tienda Univalle
          </h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed">
            Ropa, accesorios, libros y más, con el sello oficial de la
            Universidad del Valle.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10 flex-1 w-full">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
          <div className="hidden lg:block">{FiltersPanel}</div>

          <div>
            <div className="flex items-center justify-between mb-6 gap-3">
              <p className="text-[13px] text-gray-500">
                {loading
                  ? "Cargando catálogo…"
                  : `Mostrando ${filtered.length} ${
                      filtered.length === 1 ? "producto" : "productos"
                    }${
                      filtered.length !== products.length
                        ? ` de ${products.length}`
                        : ""
                    }`}
              </p>
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 h-10 px-4 border border-gray-200 rounded-lg text-[13px] font-medium text-gray-700 hover:border-black transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.6}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v18m-9-9h18M6.75 6.75h.008v.008H6.75V6.75Zm10.5 10.5h.008v.008h-.008v-.008Z"
                  />
                </svg>
                Filtros
                {activeFiltersCount > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--uv-red)] text-white text-[11px] font-semibold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 border border-gray-100 rounded-2xl h-96 animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-24">
                <p className="text-2xl font-semibold tracking-display text-black mb-2">
                  No pudimos cargar el catálogo
                </p>
                <p className="text-gray-500 text-sm">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.6}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
                <p className="text-xl font-semibold tracking-display text-black mb-2">
                  No encontramos productos que coincidan con tu búsqueda
                </p>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                  Ajusta los filtros o prueba con otros términos para descubrir
                  más productos.
                </p>
                <button
                  onClick={clearAll}
                  className="inline-flex items-center h-10 px-5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-black transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-[340px] bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 flex items-center justify-between px-5 h-14">
              <span className="text-[15px] font-semibold tracking-display">
                Filtros
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar filtros"
                className="w-9 h-9 rounded-md hover:bg-gray-50 flex items-center justify-center text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.6}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-5 py-5">{FiltersPanel}</div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="uv-btn-primary w-full h-11"
              >
                Ver {filtered.length} resultado
                {filtered.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
