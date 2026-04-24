"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { formatPrice } from "@/app/lib/cart";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

function StatusPill({ status }: { status: string }) {
  const isActive = status === "pending" || status === "confirmed" || status === "shipped";
  const isCancelled = status === "cancelled";
  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[12px] border ${
        isCancelled
          ? "border-gray-200 text-gray-500 bg-white"
          : "border-gray-200 text-black bg-white"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isCancelled
            ? "bg-gray-400"
            : isActive
            ? "bg-[var(--uv-red)]"
            : "bg-black"
        }`}
      />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => setOrders(json.data ?? []))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-16 w-full flex-1">
        <h1 className="text-4xl font-semibold tracking-display text-black mb-3">
          Mis órdenes
        </h1>
        <p className="text-gray-500 mb-12">
          Seguimiento e historial de tus inscripciones.
        </p>

        {loading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 border border-gray-100 rounded-2xl">
            <p className="text-gray-500 mb-6">Aún no tienes órdenes.</p>
            <Link href="/products" className="uv-btn-primary inline-flex">
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {orders.map((o) => (
              <div
                key={o.id}
                className="py-6 grid md:grid-cols-[1fr_auto] gap-4 items-start"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <p className="text-[13px] text-gray-500">
                      Orden{" "}
                      <code className="text-black font-mono">
                        {o.id.slice(0, 8)}
                      </code>
                    </p>
                    <StatusPill status={o.status} />
                  </div>
                  <p className="text-[12px] text-gray-400 mb-3">
                    {new Date(o.createdAt).toLocaleString("es-CO")}
                  </p>
                  <div className="text-sm text-gray-700 space-y-1">
                    {o.items.map((i, idx) => (
                      <div key={idx}>
                        {i.name}{" "}
                        <span className="text-gray-400">× {i.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-lg font-semibold tracking-display text-black md:text-right">
                  {formatPrice(o.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
