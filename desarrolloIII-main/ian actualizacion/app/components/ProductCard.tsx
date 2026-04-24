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
    <article className="group uv-card overflow-hidden flex flex-col">
      <Link href={`/products/${product.id}`} className="relative block">
        <div className="aspect-[4/3] bg-gray-50 overflow-hidden relative">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
              ◼
            </div>
          )}
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="px-3 py-1 bg-black text-white text-[11px] uppercase tracking-wider rounded-md">
                Agotado
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6 flex-1 flex flex-col">
        <span className="text-[11px] uppercase tracking-wider text-gray-500 mb-2">
          {product.category}
        </span>
        <Link href={`/products/${product.id}`}>
          <h3 className="text-[17px] font-semibold tracking-display text-black mb-2 leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-end justify-between mb-5">
          <span className="text-2xl font-semibold tracking-display text-black leading-none">
            {formatPrice(product.price)}
          </span>
          {product.stock > 0 && (
            <span className="text-[12px] text-gray-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[var(--uv-red)] rounded-full" />
              {product.stock} disponibles
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className="uv-btn-primary w-full gap-2"
        >
          {product.stock > 0 ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
                />
              </svg>
              Añadir al carrito
            </>
          ) : (
            "No disponible"
          )}
        </button>
      </div>
    </article>
  );
}
