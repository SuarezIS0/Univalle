"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">🎓 Univalle Shop</h2>
        <p className="text-xl text-gray-400 mb-10">
          El ecommerce oficial de la Universidad del Valle
        </p>

        <div className="grid md:grid-cols-3 gap-8 my-20">
          <div className="bg-gray-800 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">🔐 Seguro</h3>
            <p className="text-gray-400">
              Autenticación JWT y acceso exclusivo para miembros de Univalle.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">🛒 Completo</h3>
            <p className="text-gray-400">
              Catálogo, carrito, checkout, pagos simulados y gestión de órdenes.
            </p>
          </div>

          <div className="bg-gray-800 p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">✨ Profesional</h3>
            <p className="text-gray-400">
              Arquitectura hexagonal, principios SOLID y monolito limpio.
            </p>
          </div>
        </div>

        <div className="space-x-4">
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 text-lg font-semibold"
          >
            Ver catálogo
          </Link>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-green-600 rounded-lg hover:bg-green-700 text-lg font-semibold"
          >
            Comienza ahora
          </Link>
        </div>
      </main>
    </div>
  );
}
