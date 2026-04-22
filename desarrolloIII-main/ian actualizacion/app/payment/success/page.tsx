"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/app/components/Navbar";

function Content() {
  const params = useSearchParams();
  const order = params.get("order");
  const tx = params.get("tx");

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-3xl font-bold mb-4">¡Pago exitoso!</h1>
      <p className="text-gray-400 mb-2">Tu orden fue confirmada correctamente.</p>
      {order && (
        <p className="text-sm text-gray-500 mb-1">
          Orden: <code>{order}</code>
        </p>
      )}
      {tx && (
        <p className="text-sm text-gray-500 mb-8">
          Transacción: <code>{tx}</code>
        </p>
      )}
      <div className="flex gap-4 justify-center">
        <Link
          href="/orders"
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-700"
        >
          Ver mis órdenes
        </Link>
        <Link
          href="/products"
          className="px-6 py-3 bg-gray-700 rounded hover:bg-gray-600"
        >
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <Suspense fallback={<p className="p-8">Cargando...</p>}>
        <Content />
      </Suspense>
    </div>
  );
}
