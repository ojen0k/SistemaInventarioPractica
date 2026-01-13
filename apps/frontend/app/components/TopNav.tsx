"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "../lib/auth";
import { useRouter } from "next/navigation";

type Me = { id: number; username: string; roles: string[] };

export function TopNav() {
    const router = useRouter();
    const [authed, setAuthed] = useState(false);
    const [me, setMe] = useState<Me | null>(null);

    useEffect(() => {
        const token = getToken();
        setAuthed(!!token);

        if (!token) {
            setMe(null);
            return;
        }

        // Cargar usuario logeado
        (async () => {
            try {
                // Check correct environment variable (matching lib/activos.ts)
                const base = process.env.NEXT_PUBLIC_API_URL;
                if (!base) {
                    console.error("NEXT_PUBLIC_API_URL no está definida en .env.local");
                    throw new Error("NEXT_PUBLIC_API_URL no está definida.");
                }

                const res = await fetch(`${base}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                if (!res.ok) {
                    console.error("Error fetching user:", res.status, res.statusText);
                    // token invalido/expirado -> limpiamos sesión
                    clearToken();
                    setAuthed(false);
                    setMe(null);
                    return;
                }

                const data = (await res.json()) as Me;
                setMe(data);
            } catch (err) {
                console.error("Error loading user in TopNav:", err);
                setMe(null);
            }
        })();
    }, []);

    return (
        <nav className="flex gap-4 text-sm items-center">
            {authed ? (
                <>
                    <Link className="hover:underline" href="/activos">
                        Activos
                    </Link>
                    <Link className="hover:underline" href="/activos/nuevo">
                        Registrar activo
                    </Link>

                    {/* Usuario logeado */}
                    <span className="text-xs opacity-70">
                        {me ? `Conectado: ${me.username}` : "Cargando..."}
                    </span>

                    <button
                        className="rounded border px-2 py-1"
                        onClick={() => {
                            clearToken();
                            setAuthed(false);
                            setMe(null);
                            router.push("/login");
                        }}
                    >
                        Salir
                    </button>
                </>
            ) : (
                <Link className="hover:underline" href="/login">
                    Login
                </Link>
            )}
        </nav>
    );
}
