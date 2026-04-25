"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

type LoginResponse = {
  token: string;
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const r = await apiFetch<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (!r.ok || !r.data) {
      setError(r.error || "Error al iniciar sesión");
      setLoading(false);
      return;
    }

    const data = r.data;
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "session",
      JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role })
    );
    setLoading(false);
    router.push(data.role === "admin" ? "/admin" : "/products");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* LEFT — form */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[14px] text-gray-500 hover:text-black transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M15 6l-6 6 6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Volver al inicio
          </Link>
          <Link
            href="/register"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            ¿No tienes cuenta?{" "}
            <span style={{ color: "#BE1622" }} className="font-medium">
              Regístrate
            </span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-[400px]">
            <div className="mb-10">
              <h1 className="text-[34px] font-bold tracking-display text-gray-900 mb-2 leading-[1.15]">
                Bienvenido de nuevo
              </h1>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Inicia sesión para continuar con tu compra.
              </p>
            </div>

            {error && (
              <div
                className="mb-5 flex gap-2.5 p-3 rounded-lg text-sm"
                style={{
                  border: "1px solid rgba(190,22,34,0.25)",
                  background: "rgba(190,22,34,0.05)",
                  color: "#BE1622",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="flex-shrink-0 mt-0.5"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M12 8v4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="uv-label">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="uv-input h-12"
                  style={{ borderRadius: 8 }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[13px] font-medium text-gray-700">
                    Contraseña
                  </label>
                  <a
                    href="#"
                    className="text-[12px] text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="uv-input h-12 pr-11"
                    style={{ borderRadius: 8 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <path
                          d="m3 3 18 18"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 inline-flex items-center justify-center text-white text-[15px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{
                  background: "#BE1622",
                  borderRadius: 8,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = "#a01220";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#BE1622";
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                        opacity="0.25"
                      />
                      <path
                        d="M12 2a10 10 0 0 1 10 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                    Iniciando…
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="text-[12px] text-gray-400">
          © {new Date().getFullYear()} Universidad del Valle
        </footer>
      </div>

      {/* RIGHT — brand panel with sede image */}
      <div
        className="hidden lg:block relative overflow-hidden"
        style={{
          backgroundImage: "url('/brand/univalle_login.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(190,22,34,0.3), rgba(190,22,34,0.9))",
          }}
        />
        <div className="relative h-full flex items-center justify-center p-14">
          <img
            src="/brand/logo-univalle.png"
            alt="Universidad del Valle"
            className="max-w-[320px] w-full h-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>
      </div>
    </div>
  );
}
