"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "session",
        JSON.stringify({
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role,
        })
      );
      router.push(data.role === "admin" ? "/admin" : "/products");
    } catch (err) {
      setError("Error de conexión");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Iniciar Sesión
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:bg-gray-600 transition"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-4">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-blue-400 hover:text-blue-300">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
