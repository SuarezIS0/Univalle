"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { formatPrice } from "@/app/lib/cart";

type Order = {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-600",
  confirmed: "bg-blue-600",
  shipped: "bg-purple-600",
  delivered: "bg-green-600",
  cancelled: "bg-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada",
};

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
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mis órdenes</h1>

        {loading ? (
          <p className="text-gray-400">Cargando...</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-400">Aún no tienes órdenes.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <div>
                    <p className="text-sm text-gray-400">
                      Orden <code>{o.id.slice(0, 8)}</code>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(o.createdAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      STATUS_COLORS[o.status] ?? "bg-gray-600"
                    }`}
                  >
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </div>
                <div className="text-sm text-gray-300 mb-3">
                  {o.items.map((i, idx) => (
                    <div key={idx}>
                      {i.name} × {i.quantity}
                    </div>
                  ))}
                </div>
                <p className="text-right font-bold text-lg">
                  {formatPrice(o.total)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
