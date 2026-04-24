"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

function Content() {
  const params = useSearchParams();
  const order = params.get("order");
  const tx = params.get("tx");

  return (
    <main className="max-w-2xl mx-auto px-6 py-24 text-center flex-1 w-full">
      <div className="w-12 h-12 rounded-full bg-[var(--uv-red)]/10 mx-auto mb-8 flex items-center justify-center">
        <svg
          className="w-6 h-6 text-[var(--uv-red)]"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-display text-black mb-4 leading-tight">
        Pago confirmado.
      </h1>
      <p className="text-gray-500 text-lg leading-relaxed mb-10">
        Tu orden fue procesada correctamente. Hemos enviado los detalles a tu
        correo.
      </p>

      {(order || tx) && (
        <div className="inline-block text-left border border-gray-100 rounded-xl px-6 py-5 mb-10 bg-white">
          {order && (
            <p className="text-sm text-gray-500 mb-1.5">
              Orden{" "}
              <code className="text-black font-mono text-[13px]">{order}</code>
            </p>
          )}
          {tx && (
            <p className="text-sm text-gray-500">
              Transacción{" "}
              <code className="text-black font-mono text-[13px]">{tx}</code>
            </p>
          )}
        </div>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/orders" className="uv-btn-primary">
          Ver mis órdenes
        </Link>
        <Link href="/products" className="uv-btn-ghost">
          Seguir comprando
        </Link>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <Suspense
        fallback={<p className="p-8 text-gray-500">Cargando…</p>}
      >
        <Content />
      </Suspense>
      <Footer />
    </div>
  );
}
