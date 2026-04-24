"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useCart, formatPrice } from "@/app/lib/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, isEmpty, clear } = useCart();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "Cali",
    phone: "",
    cardNumber: "",
    cardHolder: "",
  });

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) router.push("/login");
    else setToken(t);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          shipping: {
            fullName: form.fullName,
            address: form.address,
            city: form.city,
            phone: form.phone,
          },
        }),
      });
      const orderJson = await orderRes.json();
      if (!orderJson.success) {
        throw new Error(orderJson.error ?? "Error creando orden");
      }

      const payRes = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: orderJson.data.id,
          cardNumber: form.cardNumber,
          cardHolder: form.cardHolder,
        }),
      });
      const payJson = await payRes.json();

      clear();

      if (payJson.success) {
        router.push(
          `/payment/success?order=${orderJson.data.id}&tx=${payJson.data.transactionId}`
        );
      } else {
        router.push(
          `/payment/failure?order=${orderJson.data.id}&msg=${encodeURIComponent(
            payJson.data?.message ?? "Pago rechazado"
          )}`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-24 text-center flex-1">
          <p className="text-gray-500">Tu carrito está vacío.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-16 w-full flex-1">
        <h1 className="text-4xl font-semibold tracking-display text-black mb-10">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-12">
            <section>
              <h2 className="text-[13px] uppercase tracking-wider text-gray-500 mb-6">
                Envío
              </h2>
              <div className="grid gap-6">
                <div>
                  <label className="uv-label">Nombre completo</label>
                  <input
                    required
                    name="fullName"
                    placeholder="Tu nombre"
                    value={form.fullName}
                    onChange={handleChange}
                    className="uv-input h-12"
                  />
                </div>
                <div>
                  <label className="uv-label">Dirección</label>
                  <input
                    required
                    name="address"
                    placeholder="Calle, número, detalles"
                    value={form.address}
                    onChange={handleChange}
                    className="uv-input h-12"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="uv-label">Ciudad</label>
                    <input
                      required
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="uv-input h-12"
                    />
                  </div>
                  <div>
                    <label className="uv-label">Teléfono</label>
                    <input
                      required
                      name="phone"
                      placeholder="+57 300 000 0000"
                      value={form.phone}
                      onChange={handleChange}
                      className="uv-input h-12"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[13px] uppercase tracking-wider text-gray-500 mb-2">
                Pago
              </h2>
              <p className="text-[12px] text-gray-500 mb-6">
                Pago simulado: una tarjeta terminada en dígito par se aprueba.
              </p>
              <div className="grid gap-6">
                <div>
                  <label className="uv-label">Titular de la tarjeta</label>
                  <input
                    required
                    name="cardHolder"
                    placeholder="Nombre del titular"
                    value={form.cardHolder}
                    onChange={handleChange}
                    className="uv-input h-12"
                  />
                </div>
                <div>
                  <label className="uv-label">Número de tarjeta</label>
                  <input
                    required
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={form.cardNumber}
                    onChange={handleChange}
                    className="uv-input h-12"
                  />
                </div>
              </div>
            </section>

            {error && (
              <p className="text-[var(--uv-red)] text-sm border border-[var(--uv-red)]/20 bg-[var(--uv-red)]/5 rounded-md p-3">
                {error}
              </p>
            )}
          </div>

          <aside className="border border-gray-100 rounded-2xl p-6 h-fit">
            <h2 className="text-[13px] uppercase tracking-wider text-gray-500 mb-5">
              Resumen
            </h2>
            <div className="space-y-3 mb-6">
              {items.map((i) => (
                <div
                  key={i.productId}
                  className="flex justify-between text-sm gap-3"
                >
                  <span className="text-gray-700 leading-snug">
                    {i.name}{" "}
                    <span className="text-gray-400">× {i.quantity}</span>
                  </span>
                  <span className="text-black whitespace-nowrap">
                    {formatPrice(i.price * i.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold tracking-display text-lg text-black pt-4 border-t border-gray-100 mb-6">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="uv-btn-primary w-full h-12"
            >
              {loading ? "Procesando…" : "Pagar ahora"}
            </button>
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}
