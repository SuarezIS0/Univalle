"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { apiFetch } from "@/app/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const r = await apiFetch<User[]>("/api/users");
      if (!r.ok) {
        setError(r.error || "Error al obtener usuarios");
      } else {
        setUsers(r.data ?? []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-16 w-full flex-1">
        <h1 className="text-4xl font-semibold tracking-display text-black mb-3">
          Usuarios
        </h1>
        <p className="text-gray-500 mb-12">
          Listado de usuarios registrados en la plataforma.
        </p>

        {loading && <p className="text-gray-500">Cargando…</p>}

        {error && (
          <p className="text-[var(--uv-red)] border border-[var(--uv-red)]/20 bg-[var(--uv-red)]/5 rounded-md p-3 text-sm">
            {error}
          </p>
        )}

        {users.length === 0 && !loading && !error && (
          <p className="text-gray-500">No hay usuarios registrados.</p>
        )}

        {users.length > 0 && (
          <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium">
                    ID
                  </th>
                  <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium">
                    Nombre
                  </th>
                  <th className="py-3 px-5 text-[12px] uppercase tracking-wider text-gray-500 font-medium">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-5 text-gray-500 font-mono text-[12px]">
                      {user.id}
                    </td>
                    <td className="py-4 px-5 text-black">{user.name}</td>
                    <td className="py-4 px-5 text-gray-700">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
