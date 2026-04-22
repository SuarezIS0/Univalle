"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
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
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && <p className="text-gray-400">Cargando...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {product && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg overflow-hidden aspect-square">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  📦
                </div>
              )}
            </div>
            <div>
              <span className="text-sm uppercase text-blue-400">
                {product.category}
              </span>
              <h1 className="text-3xl font-bold mt-2 mb-4">{product.name}</h1>
              <p className="text-2xl font-bold mb-4">
                {formatPrice(product.price)}
              </p>
              <p className="text-gray-400 mb-6">{product.description}</p>
              <p
                className={`mb-6 ${
                  product.stock > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {product.stock > 0
                  ? `Disponible: ${product.stock} unidades`
                  : "Agotado"}
              </p>

              {product.stock > 0 && (
                <div className="flex items-center gap-4">
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
                    className="w-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-center"
                  />
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-6 py-3 bg-blue-600 rounded hover:bg-blue-700 font-semibold"
                  >
                    Agregar al carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
