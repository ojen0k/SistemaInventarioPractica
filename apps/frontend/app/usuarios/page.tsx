"use client";

import { useEffect, useState } from "react";
import { useRequireRole } from "../lib/useRequireRole";
import { getToken } from "../lib/auth";

type UsuarioRow = {
    id: number;
    username: string;
    correo: string | null;
    activo: boolean;
    ultimoAcceso: string | null;
    roles: string[];
};

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function UsuariosPage() {
    const ready = useRequireRole("Administrador");
    const [rows, setRows] = useState<UsuarioRow[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ready) return;

        (async () => {
            try {
                const token = getToken();
                const res = await fetch(`${API}/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setRows(Array.isArray(data) ? data : []);
            } catch (e: any) {
                setError(e?.message ?? "Error");
            }
        })();
    }, [ready]);

    if (!ready) return <div className="p-6">Cargando…</div>;

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">Usuarios</h1>

            {error && (
                <div className="border border-red-300 bg-red-50 text-red-800 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                    <thead className="border-b bg-gray-50">
                        <tr>
                            <th className="text-left p-2">ID</th>
                            <th className="text-left p-2">Usuario</th>
                            <th className="text-left p-2">Correo</th>
                            <th className="text-left p-2">Roles</th>
                            <th className="text-left p-2">Último acceso</th>
                            <th className="text-left p-2">Activo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((u) => (
                            <tr key={u.id} className="border-b">
                                <td className="p-2">{u.id}</td>
                                <td className="p-2">{u.username}</td>
                                <td className="p-2">{u.correo ?? "-"}</td>
                                <td className="p-2">{u.roles?.join(", ") ?? "-"}</td>
                                <td className="p-2">
                                    {u.ultimoAcceso
                                        ? new Date(u.ultimoAcceso).toLocaleString("es-CL", {
                                            timeZone: "America/Santiago",
                                        })
                                        : "-"}
                                </td>
                                <td className="p-2">{u.activo ? "Sí" : "No"}</td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td className="p-3" colSpan={6}>
                                    Sin usuarios.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
