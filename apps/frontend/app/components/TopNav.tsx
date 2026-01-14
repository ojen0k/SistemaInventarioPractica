"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { clearToken, getToken, AUTH_EVENT_NAME } from "../lib/auth";
import { useRouter } from "next/navigation";

type Me = { id: number; username: string; roles: string[] };

export function TopNav() {
    const router = useRouter();
    const [authed, setAuthed] = useState(false);
    const [me, setMe] = useState<Me | null>(null);

    //Const de roles para las vistas
    const rolesRaw = typeof window !== "undefined" ? localStorage.getItem("roles") : null;
    const roles: string[] = rolesRaw ? JSON.parse(rolesRaw) : [];

    //Confirma si el logeo es de admin
    const isAdmin = !!me?.roles?.includes("Administrador");

    const checkAuth = useCallback(async () => {
        const token = getToken();
        setAuthed(!!token);

        if (!token) {
            setMe(null);
            return;
        }

        try {
            const base = process.env.NEXT_PUBLIC_API_URL;
            if (!base) return;

            const res = await fetch(`${base}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });

            if (!res.ok) {
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
    }, []);

    useEffect(() => {
        checkAuth();
        window.addEventListener(AUTH_EVENT_NAME, checkAuth);
        return () => window.removeEventListener(AUTH_EVENT_NAME, checkAuth);
    }, [checkAuth]);

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

                    {/* links admin */}
                    {isAdmin && (
                        <>
                            <Link className="hover:underline" href="/usuarios">
                                Usuarios
                            </Link>
                            <Link className="hover:underline" href="/usuarios/crear">
                                Crear usuario
                            </Link>
                        </>
                    )}

                    {/* Usuario logeado */}
                    <span className="text-xs opacity-70">
                        {me ? `Conectado: ${me.username}` : "Cargando..."}
                    </span>

                    <button
                        className="rounded border px-2 py-1 bg-red-400

                        "
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
