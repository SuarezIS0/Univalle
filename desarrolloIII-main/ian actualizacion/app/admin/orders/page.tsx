"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
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

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  shipped: "Enviada",
  delivered: "Entregada",
  cancelled: "Cancelada",
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
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-16 w-full flex-1">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-wider text-gray-500">
            Administración
          </span>
          <h1 className="text-4xl font-semibold tracking-display text-black mt-2">
            Gestión de órdenes
          </h1>
        </div>

        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {orders.map((o) => (
            <div key={o.id} className="py-6">
              <div className="flex justify-between items-start mb-3 flex-wrap gap-3">
                <div>
                  <p className="text-[13px] text-gray-500">
                    <code className="text-black font-mono">
                      {o.id.slice(0, 10)}
                    </code>{" "}
                    · {o.shipping.fullName}{" "}
                    <span className="text-gray-400">({o.shipping.city})</span>
                  </p>
                  <p className="text-[12px] text-gray-400 mt-0.5">
                    {new Date(o.createdAt).toLocaleString("es-CO")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[12px] border border-gray-200 text-black bg-white">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        o.status === "cancelled"
                          ? "bg-gray-300"
                          : o.status === "delivered"
                          ? "bg-black"
                          : "bg-[var(--uv-red)]"
                      }`}
                    />
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                  {NEXT_STATUS[o.status]?.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleUpdate(o.id, s)}
                      className="px-3 h-8 text-[12px] text-black border border-gray-200 rounded-md hover:border-black transition-colors"
                    >
                      → {STATUS_LABELS[s] ?? s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-700 mb-3 flex flex-wrap gap-x-4 gap-y-1">
                {o.items.map((i, idx) => (
                  <span key={idx}>
                    {i.name}{" "}
                    <span className="text-gray-400">× {i.quantity}</span>
                  </span>
                ))}
              </div>
              <p className="text-right text-lg font-semibold tracking-display text-black">
                {formatPrice(o.total)}
              </p>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="py-10 text-center text-gray-500">
              No hay órdenes aún.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
