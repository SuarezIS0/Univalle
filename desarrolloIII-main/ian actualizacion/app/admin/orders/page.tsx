"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { formatPrice } from "@/app/lib/cart";

type Order = {
  id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
  shipping: { fullName: string; city: string };
};

const NEXT_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const load = (t: string) => {
    fetch("/api/orders?scope=all", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => r.json())
      .then((json) => setOrders(json.data ?? []));
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    load(t);
  }, [router]);

  const handleUpdate = async (id: string, status: string) => {
    if (!token) return;
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    load(token);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Gestión de órdenes</h1>

        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-sm text-gray-400">
                    <code>{o.id.slice(0, 10)}</code> · {o.shipping.fullName} ({o.shipping.city})
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleString("es-CO")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded text-xs bg-gray-700">
                    {o.status}
                  </span>
                  {NEXT_STATUS[o.status]?.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleUpdate(o.id, s)}
                      className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-xs"
                    >
                      → {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-300 mb-2">
                {o.items.map((i, idx) => (
                  <span key={idx} className="mr-3">
                    {i.name} × {i.quantity}
                  </span>
                ))}
              </div>
              <p className="text-right font-bold">{formatPrice(o.total)}</p>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-400">No hay órdenes aún.</p>
          )}
        </div>
      </main>
    </div>
  );
}
