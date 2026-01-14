"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, setToken, apiFetch } from "../lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (getToken()) router.replace("/activos");
    }, [router]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);

        try {
            setLoading(true);

            const res = await apiFetch("/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.message ?? "Credenciales inválidas");

            setToken(data.accessToken);
            router.push("/activos");

        } catch (e: any) {
            setErr(e?.message ?? "Error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-60px)] flex items-center w-full justify-center p-6">
            <div className="w-full max-w-md p-8 rounded-xl bg-white shadow-lg">
                <h1 className="text-2xl font-semibold text-center mb-2">Iniciar sesión</h1>

                {err && (
                    <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                        {err}
                    </div>
                )}

                <form className="mt-4 space-y-3" onSubmit={onSubmit}>
                    <div>
                        <label className="text-sm font-medium">Usuario</label>
                        <input
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Contraseña</label>
                        <input
                            className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        className="w-full rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Ingresando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
