"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "../lib/auth";
import { useRouter } from "next/navigation";

export function TopNav() {
    const router = useRouter();
    const [authed, setAuthed] = useState(false);

    useEffect(() => {
        setAuthed(!!getToken());
    }, []);

    return (
        <nav className="flex gap-4 text-sm items-center">
            {authed ? (
                <>
                    <Link className="hover:underline" href="/activos">Activos</Link>
                    <Link className="hover:underline" href="/activos/nuevo">Registrar activo</Link>
                    <button
                        className="rounded border px-2 py-1"
                        onClick={() => {
                            clearToken();
                            router.push("/login");
                        }}
                    >
                        Salir
                    </button>
                </>
            ) : (
                <Link className="hover:underline" href="/login">Login</Link>
            )}
        </nav>
    );
}
