"use client";

import { useState } from "react";
import { useRequireRole } from "../../lib/useRequireRole";
import { getToken } from "../../lib/auth";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL!;

export default function CrearUsuarioPage() {
    const ready = useRequireRole("Administrador");
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [correo, setCorreo] = useState("");
    const [password, setPassword] = useState("");

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState(false);

    if (!ready) return <div className="p-6">Cargando…</div>;

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setOk(false);

        try {
            const token = getToken();
            const res = await fetch(`${API}/usuarios`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username,
                    correo: correo.trim() ? correo : undefined,
                    password,
                    roles: ["Soporte"],
                }),
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `HTTP ${res.status}`);
            }

            setOk(true);
            router.push("/usuarios");
        } catch (e: any) {
            setError(e?.message ?? "Error");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="p-6 max-w-xl">
            <h1 className="text-xl font-semibold mb-4">Crear usuario</h1>

            {error && (
                <div className="border border-red-300 bg-red-50 text-red-800 p-3 rounded mb-4">
                    {error}
                </div>
            )}
            {ok && (
                <div className="border border-green-300 bg-green-50 text-green-800 p-3 rounded mb-4">
                    Usuario creado.
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-3 border rounded p-4">
                <div>
                    <label className="block text-sm mb-1">Username</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Correo (opcional)</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        type="email"
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Password</label>
                    <input
                        className="w-full border rounded px-3 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        required
                        minLength={6}
                    />
                </div>

                <button
                    className="rounded bg-black text-white px-4 py-2 disabled:opacity-60"
                    disabled={saving}
                >
                    {saving ? "Creando..." : "Crear"}
                </button>
            </form>
        </div>
    );
}
