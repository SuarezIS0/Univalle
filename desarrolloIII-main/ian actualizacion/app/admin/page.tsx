"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { formatPrice } from "@/app/lib/cart";

type Metrics = {
  users: number;
  products: number;
  totalSales: number;
  orders: {
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    total: number;
  };
};

export default function AdminHome() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetch("/api/admin/metrics", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setMetrics(json.data);
        else setError(json.error ?? "Acceso denegado");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Panel de administrador</h1>

        {error && <p className="text-red-400 mb-6">{error}</p>}

        {metrics && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card label="Usuarios" value={metrics.users.toString()} />
              <Card label="Productos" value={metrics.products.toString()} />
              <Card label="Órdenes" value={metrics.orders.total.toString()} />
              <Card
                label="Ventas totales"
                value={formatPrice(metrics.totalSales)}
              />
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-4">Estado de órdenes</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Badge label="Pendientes" value={metrics.orders.pending} color="yellow" />
                <Badge label="Confirmadas" value={metrics.orders.confirmed} color="blue" />
                <Badge label="Enviadas" value={metrics.orders.shipped} color="purple" />
                <Badge label="Entregadas" value={metrics.orders.delivered} color="green" />
                <Badge label="Canceladas" value={metrics.orders.cancelled} color="red" />
              </div>
            </div>
          </>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/admin/products"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700"
          >
            <h3 className="text-xl font-bold mb-2">📦 Productos</h3>
            <p className="text-gray-400">Gestionar catálogo (crear, editar, eliminar)</p>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-gray-800 p-6 rounded-lg hover:bg-gray-700"
          >
            <h3 className="text-xl font-bold mb-2">📋 Órdenes</h3>
            <p className="text-gray-400">Ver todas las órdenes y actualizar estados</p>
          </Link>
        </div>
      </main>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Badge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    yellow: "bg-yellow-600",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    green: "bg-green-600",
    red: "bg-red-600",
  };
  return (
    <div
      className={`${colors[color]} rounded-lg p-4 text-center`}
    >
      <p className="text-xs opacity-90">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
