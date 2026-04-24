"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
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
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-16 w-full flex-1">
        <div className="mb-12">
          <span className="text-[11px] uppercase tracking-wider text-gray-500">
            Administración
          </span>
          <h1 className="text-4xl font-semibold tracking-display text-black mt-2">
            Panel de control
          </h1>
        </div>

        {error && (
          <p className="text-[var(--uv-red)] border border-[var(--uv-red)]/20 bg-[var(--uv-red)]/5 rounded-md p-3 text-sm mb-8">
            {error}
          </p>
        )}

        {metrics && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <Metric label="Usuarios" value={metrics.users.toString()} />
              <Metric label="Productos" value={metrics.products.toString()} />
              <Metric
                label="Órdenes"
                value={metrics.orders.total.toString()}
              />
              <Metric
                label="Ventas totales"
                value={formatPrice(metrics.totalSales)}
              />
            </div>

            <div className="border border-gray-100 rounded-2xl p-8 mb-12">
              <h2 className="text-[13px] uppercase tracking-wider text-gray-500 mb-6">
                Estado de órdenes
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <StatusMetric label="Pendientes" value={metrics.orders.pending} accent />
                <StatusMetric
                  label="Confirmadas"
                  value={metrics.orders.confirmed}
                />
                <StatusMetric label="Enviadas" value={metrics.orders.shipped} />
                <StatusMetric
                  label="Entregadas"
                  value={metrics.orders.delivered}
                />
                <StatusMetric
                  label="Canceladas"
                  value={metrics.orders.cancelled}
                  muted
                />
              </div>
            </div>
          </>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/admin/products"
            className="uv-card p-8 block group"
          >
            <h3 className="text-xl font-semibold tracking-display text-black mb-2 group-hover:text-[var(--uv-red)] transition-colors">
              Productos
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Gestiona el catálogo: crea, edita y elimina programas.
            </p>
          </Link>
          <Link
            href="/admin/orders"
            className="uv-card p-8 block group"
          >
            <h3 className="text-xl font-semibold tracking-display text-black mb-2 group-hover:text-[var(--uv-red)] transition-colors">
              Órdenes
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Revisa todas las órdenes y actualiza sus estados.
            </p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-xl p-6">
      <p className="text-[12px] uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-display text-black mt-2">
        {value}
      </p>
    </div>
  );
}

function StatusMetric({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="text-[12px] text-gray-500 mb-2 flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            muted ? "bg-gray-300" : accent ? "bg-[var(--uv-red)]" : "bg-black"
          }`}
        />
        {label}
      </p>
      <p className="text-2xl font-semibold tracking-display text-black">
        {value}
      </p>
    </div>
  );
}
