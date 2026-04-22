"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/app/lib/cart";

type Session = {
  name?: string;
  email?: string;
  role?: "customer" | "admin";
  token?: string;
};

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [mounted, setMounted] = useState(false);
  const { totalItems } = useCart();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem("session");
      if (raw) setSession(JSON.parse(raw));
    } catch {}
  }, []);

  const logout = () => {
    localStorage.removeItem("session");
    localStorage.removeItem("token");
    setSession(null);
    router.push("/");
  };

  return (
    <nav className="bg-gray-800 p-4 border-b border-gray-700">
      <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap gap-4">
        <Link href="/" className="text-2xl font-bold">
          🛍️ Univalle Shop
        </Link>

        <div className="flex items-center gap-4 flex-wrap">
          <Link href="/products" className="hover:text-blue-400">
            Productos
          </Link>

          {mounted && session && (
            <Link href="/orders" className="hover:text-blue-400">
              Mis órdenes
            </Link>
          )}

          {mounted && session?.role === "admin" && (
            <Link href="/admin" className="text-yellow-400 hover:text-yellow-300">
              Admin
            </Link>
          )}

          <Link
            href="/cart"
            className="relative px-3 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            🛒 Carrito
            {mounted && totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {mounted && session ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm hidden sm:inline">
                {session.name}
              </span>
              <button
                onClick={logout}
                className="px-3 py-2 bg-red-600 rounded hover:bg-red-700 text-sm"
              >
                Salir
              </button>
            </div>
          ) : (
            mounted && (
              <div className="space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 text-sm"
                >
                  Registro
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
