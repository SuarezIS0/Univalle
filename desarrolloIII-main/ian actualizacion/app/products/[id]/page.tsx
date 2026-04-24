"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useCart, formatPrice } from "@/app/lib/cart";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addItem } = useCart();
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProduct(json.data);
        else setError(json.error ?? "Producto no encontrado");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      quantity
    );
    router.push("/cart");
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-16 w-full flex-1">
        <Link
          href="/products"
          className="text-sm text-gray-500 hover:text-black mb-8 inline-flex items-center gap-1"
        >
          ← Volver al catálogo
        </Link>

        {loading && <p className="text-gray-500 mt-8">Cargando…</p>}
        {error && <p className="text-[var(--uv-red)] mt-8">{error}</p>}
        {product && (
          <div className="grid md:grid-cols-2 gap-12 mt-4">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden aspect-square">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                  ◼
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-gray-500">
                {product.category}
              </span>
              <h1 className="text-4xl font-semibold tracking-display text-black mt-3 mb-6 leading-tight">
                {product.name}
              </h1>
              <p className="text-gray-500 leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="border-t border-gray-100 pt-6 mb-8">
                <span className="text-[11px] uppercase tracking-wider text-gray-500">
                  Inversión
                </span>
                <p className="text-4xl font-semibold tracking-display text-black mt-1">
                  {formatPrice(product.price)}
                </p>
              </div>

              <p
                className={`mb-8 text-sm flex items-center gap-2 ${
                  product.stock > 0 ? "text-gray-700" : "text-[var(--uv-red)]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    product.stock > 0
                      ? "bg-[var(--uv-red)]"
                      : "bg-[var(--uv-red)]"
                  }`}
                />
                {product.stock > 0
                  ? `Disponibles: ${product.stock} cupos`
                  : "Agotado"}
              </p>

              {product.stock > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-200 rounded-md h-12">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-full text-gray-600 hover:text-black"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={product.stock}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(
                            1,
                            Math.min(product.stock, Number(e.target.value))
                          )
                        )
                      }
                      className="w-12 h-full text-center bg-transparent outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      className="w-10 h-full text-gray-600 hover:text-black"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={handleAdd}
                    className="uv-btn-primary flex-1 h-12"
                  >
                    Agregar al carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
