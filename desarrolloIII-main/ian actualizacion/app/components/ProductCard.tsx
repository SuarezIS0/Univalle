"use client";

import Link from "next/link";
import { useCart, formatPrice } from "@/app/lib/cart";

type Props = {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    category: string;
  };
};

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      },
      1
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden flex flex-col hover:shadow-lg hover:shadow-blue-500/10 transition">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-video bg-gray-900 overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              📦
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        <span className="text-xs uppercase text-blue-400 mb-1">
          {product.category}
        </span>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-lg mb-2 hover:text-blue-400">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold">{formatPrice(product.price)}</span>
          <span
            className={`text-xs ${
              product.stock > 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className="w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
