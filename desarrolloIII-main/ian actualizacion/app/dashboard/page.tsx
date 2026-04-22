"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("http://localhost:3001/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Error al obtener usuarios");
        }

        const data = await res.json();
        setUsers(data.data);
      } catch (err) {
        setError("Error de conexión");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          Salir
        </button>
      </nav>

      <div className="p-6">
        <h2 className="text-3xl font-bold mb-6">Lista de Usuarios</h2>

        {loading && <p className="text-gray-400">Cargando...</p>}

        {error && <p className="text-red-400">❌ {error}</p>}

        {users.length === 0 && !loading && (
          <p className="text-gray-400">No hay usuarios registrados</p>
        )}

        {users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full bg-gray-800 rounded">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Nombre</th>
                  <th className="p-4 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="p-4">{user.id}</td>
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
