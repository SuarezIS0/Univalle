"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useCart, formatPrice } from "@/app/lib/cart";

export default function CartPage() {
  const { items, subtotal, isEmpty, updateQuantity, removeItem } = useCart();

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-16 w-full flex-1">
        <h1 className="text-4xl font-semibold tracking-display text-black mb-10">
          Carrito
        </h1>

        {isEmpty ? (
          <div className="text-center py-24 border border-gray-100 rounded-2xl">
            <p className="text-gray-500 mb-6">Tu carrito está vacío.</p>
            <Link href="/products" className="uv-btn-primary inline-flex">
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            <div className="md:col-span-2 divide-y divide-gray-100 border-y border-gray-100">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="py-6 flex gap-5 items-start"
                >
                  <div className="w-24 h-24 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
                        ◼
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-medium text-black leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-gray-200 rounded-md h-9">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="w-8 h-full text-gray-600 hover:text-black"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="w-8 h-full text-gray-600 hover:text-black"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-sm text-gray-500 hover:text-[var(--uv-red)]"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="text-right text-[15px] font-medium text-black whitespace-nowrap">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit border border-gray-100 rounded-2xl p-6">
              <h2 className="text-[13px] uppercase tracking-wider text-gray-500 mb-5">
                Resumen
              </h2>
              <div className="flex justify-between text-sm mb-3">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-black">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mb-6">
                <span className="text-gray-500">Envío</span>
                <span className="text-gray-500">Calculado en checkout</span>
              </div>
              <div className="flex justify-between text-lg font-semibold tracking-display text-black mb-6 pt-4 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                className="uv-btn-primary w-full h-12"
              >
                Finalizar compra
              </Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
