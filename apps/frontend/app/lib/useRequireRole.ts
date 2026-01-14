"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "./auth";

type Me = { username: string; roles: string[] };

export function useRequireRole(role?: string) {
    const router = useRouter();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const token = getToken();

        if (!token) {
            router.replace("/login");
            return;
        }

        (async () => {
            try {
                const API = process.env.NEXT_PUBLIC_API_URL;
                if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definida.");

                const res = await fetch(`${API}/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store",
                });

                if (!res.ok) {
                    router.replace("/login");
                    return;
                }

                const me = (await res.json()) as Me;

                if (role && !me.roles?.includes(role)) {
                    router.replace("/activos");
                    return;
                }

                //sincroniza localStorage para otras partes
                localStorage.setItem("roles", JSON.stringify(me.roles));

                setReady(true);
            } catch {
                router.replace("/login");
            }
        })();
    }, [router, role]);

    return ready;
}
