"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import { useCart, formatPrice } from "@/app/lib/cart";

export default function CartPage() {
  const { items, subtotal, isEmpty, updateQuantity, removeItem } = useCart();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">🛒 Carrito</h1>

        {isEmpty ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">Tu carrito está vacío.</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 rounded hover:bg-blue-700"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-gray-800 rounded-lg p-4 flex gap-4"
                >
                  <div className="w-24 h-24 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        📦
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {formatPrice(item.price)} c/u
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-8 h-8 bg-gray-700 rounded hover:bg-gray-600"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-4 text-red-400 hover:text-red-300 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="text-right font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800 rounded-lg p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">Resumen</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-4 text-gray-400 text-sm">
                <span>Envío</span>
                <span>Calculado en el checkout</span>
              </div>
              <hr className="border-gray-700 my-4" />
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <Link
                href="/checkout"
                className="block w-full text-center px-6 py-3 bg-green-600 rounded hover:bg-green-700 font-semibold"
              >
                Finalizar compra
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
