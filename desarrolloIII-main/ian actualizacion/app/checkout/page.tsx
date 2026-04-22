"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
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
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-400">Tu carrito está vacío.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <section className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Envío</h2>
              <div className="grid gap-4">
                <input
                  required
                  name="fullName"
                  placeholder="Nombre completo"
                  value={form.fullName}
                  onChange={handleChange}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
                />
                <input
                  required
                  name="address"
                  placeholder="Dirección"
                  value={form.address}
                  onChange={handleChange}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
                />
                <input
                  required
                  name="city"
                  placeholder="Ciudad"
                  value={form.city}
                  onChange={handleChange}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
                />
                <input
                  required
                  name="phone"
                  placeholder="Teléfono"
                  value={form.phone}
                  onChange={handleChange}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
                />
              </div>
            </section>

            <section className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-bold mb-2">💳 Pago (simulado)</h2>
              <p className="text-xs text-gray-400 mb-4">
                Pago simulado: una tarjeta terminada en dígito par se aprueba.
              </p>
              <div className="grid gap-4">
                <input
                  required
                  name="cardHolder"
                  placeholder="Titular de la tarjeta"
                  value={form.cardHolder}
                  onChange={handleChange}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
                />
                <input
                  required
                  name="cardNumber"
                  placeholder="Número de tarjeta"
                  value={form.cardNumber}
                  onChange={handleChange}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 rounded"
                />
              </div>
            </section>

            {error && <p className="text-red-400">{error}</p>}
          </div>

          <aside className="bg-gray-800 p-6 rounded-lg h-fit">
            <h2 className="text-xl font-bold mb-4">Resumen</h2>
            {items.map((i) => (
              <div
                key={i.productId}
                className="flex justify-between text-sm mb-2"
              >
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span>{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
            <hr className="border-gray-700 my-4" />
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 rounded hover:bg-green-700 font-semibold disabled:bg-gray-600"
            >
              {loading ? "Procesando..." : "Pagar ahora"}
            </button>
          </aside>
        </form>
      </main>
    </div>
  );
}
