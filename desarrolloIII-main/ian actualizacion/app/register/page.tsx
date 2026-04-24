"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/app/lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const pwScore = (() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const pwLabel = ["", "Débil", "Aceptable", "Buena", "Fuerte"][pwScore];
  const pwColor = [
    "bg-gray-200",
    "bg-red-400",
    "bg-amber-400",
    "bg-lime-400",
    "bg-green-500",
  ][pwScore];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const r = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    if (!r.ok) {
      setError(r.error || "Error al registrar");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setName("");
    setEmail("");
    setPassword("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* LEFT — brand panel with sede2 image */}
      <div
        className="hidden lg:block relative overflow-hidden order-1"
        style={{
          backgroundImage: "url('/brand/univalle-sede2.jpg')",
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

      {/* RIGHT — form */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16 order-2">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[14px] text-gray-500 hover:text-black transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
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
            href="/login"
            className="text-sm text-gray-600 hover:text-black transition-colors"
          >
            ¿Ya tienes cuenta?{" "}
            <span style={{ color: "#BE1622" }} className="font-medium">
              Inicia sesión
            </span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center py-12">
          <div className="w-full max-w-[400px]">
            <div className="mb-10">
              <h1 className="text-[34px] font-bold tracking-display text-gray-900 mb-2 leading-[1.15]">
                Crea tu cuenta
              </h1>
              <p className="text-gray-500 text-[15px] leading-relaxed">
                Regístrate para empezar a comprar en segundos.
              </p>
            </div>

            {success && (
              <div className="mb-5 flex gap-2.5 p-3 border border-green-200 bg-green-50 text-green-800 rounded-lg text-sm">
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
                    d="m8 12 3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Usuario creado exitosamente. Ya puedes iniciar sesión.</span>
              </div>
            )}

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
                <label className="uv-label">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="uv-input h-12"
                  style={{ borderRadius: 8 }}
                />
              </div>

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
                <label className="uv-label">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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

                {password.length > 0 && (
                  <div className="mt-2.5">
                    <div className="flex gap-1 mb-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= pwScore ? pwColor : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500">
                      <span>Seguridad: {pwLabel || "—"}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 inline-flex items-center justify-center text-white text-[15px] font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                style={{ background: "#BE1622", borderRadius: 8 }}
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
                    Creando…
                  </span>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="text-[12px] text-gray-400">
          © {new Date().getFullYear()} Universidad del Valle
        </footer>
      </div>
    </div>
  );
}
