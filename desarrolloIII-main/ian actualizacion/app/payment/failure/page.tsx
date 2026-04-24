"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

function Content() {
  const params = useSearchParams();
  const msg = params.get("msg") ?? "Tu pago no pudo ser procesado.";
  const order = params.get("order");

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
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-display text-black mb-4 leading-tight">
        Pago fallido.
      </h1>
      <p className="text-gray-500 text-lg leading-relaxed mb-10">{msg}</p>

      {order && (
        <div className="inline-block text-left border border-gray-100 rounded-xl px-6 py-5 mb-10 bg-white">
          <p className="text-sm text-gray-500">
            Orden{" "}
            <code className="text-black font-mono text-[13px]">{order}</code>{" "}
            <span className="text-gray-400">(cancelada)</span>
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/checkout" className="uv-btn-primary">
          Reintentar
        </Link>
        <Link href="/cart" className="uv-btn-ghost">
          Ver carrito
        </Link>
      </div>
    </main>
  );
}

export default function FailurePage() {
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
