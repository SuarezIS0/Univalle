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
  const [open, setOpen] = useState(false);
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="Universidad del Valle — Inicio">
          <img
            src="/brand/logo-univalle.png"
            alt="Universidad del Valle"
            className="h-9 w-auto object-contain"
          />
          <span className="hidden sm:inline text-[15px] font-semibold tracking-display text-black">
            Univalle Shop
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-7 text-[14px] text-gray-600">
          <Link
            href="/products"
            className="hover:text-black transition-colors"
          >
            Catálogo
          </Link>
          <Link
            href="/products?ofertas=1"
            className="inline-flex items-center gap-1.5 hover:text-black transition-colors"
          >
            <span className="px-2 py-0.5 rounded-full bg-[var(--uv-red)] text-white text-[11px] font-semibold uppercase tracking-wider">
              Ofertas
            </span>
          </Link>
          <Link
            href="/orders"
            className="hover:text-black transition-colors"
          >
            Seguir pedido
          </Link>
          {mounted && session?.role === "admin" && (
            <Link
              href="/admin"
              className="text-[var(--uv-red)] hover:text-[var(--uv-red-dark)]"
            >
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative w-9 h-9 rounded-md hover:bg-gray-50 flex items-center justify-center text-gray-700 transition-colors"
            aria-label="Carrito"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
              />
            </svg>
            {mounted && totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[var(--uv-red)] text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </Link>

          {mounted && session ? (
            <div className="hidden md:flex items-center gap-2 pl-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-black flex items-center justify-center text-xs font-semibold">
                  {(session.name ?? "U").charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] text-gray-700 hidden lg:inline">
                  {session.name}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-[13px] text-gray-600 hover:text-black transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            mounted && (
              <div className="hidden md:flex items-center gap-1">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-[14px] text-gray-700 hover:text-black transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-[14px] bg-[var(--uv-red)] text-white rounded-md hover:bg-[var(--uv-red-dark)] transition-colors font-medium"
                >
                  Registrarme
                </Link>
              </div>
            )
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-50"
            aria-label="Menú"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="px-6 py-5 flex flex-col gap-4 text-[14px] text-gray-700">
            <Link href="/products" onClick={() => setOpen(false)}>
              Catálogo
            </Link>
            <Link
              href="/products?ofertas=1"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2"
            >
              <span className="px-2 py-0.5 rounded-full bg-[var(--uv-red)] text-white text-[11px] font-semibold uppercase tracking-wider">
                Ofertas
              </span>
            </Link>
            <Link href="/orders" onClick={() => setOpen(false)}>
              Seguir pedido
            </Link>
            {mounted && session?.role === "admin" && (
              <Link
                href="/admin"
                className="text-[var(--uv-red)]"
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            )}
            {mounted && !session && (
              <div className="flex gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center px-4 py-2 border border-gray-200 rounded-md"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex-1 text-center px-4 py-2 bg-[var(--uv-red)] text-white rounded-md"
                >
                  Registrarme
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
