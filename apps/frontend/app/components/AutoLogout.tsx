"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken } from "../lib/auth";

// 15 minutos en milisegundos
const TIMEOUT_MS = 15 * 60 * 1000;

export function AutoLogout() {
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const logout = useCallback(() => {
        if (getToken()) {
            clearToken();
            router.push("/login");
        }
    }, [router]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // inicia el timer si hay sesión
        if (getToken()) {
            timerRef.current = setTimeout(logout, TIMEOUT_MS);
        }
    }, [logout]);

    useEffect(() => {
        // Eventos que se consideran actividad: mouse, teclado, scroll, toque
        const events = ["mousedown", "keydown", "scroll", "touchstart"];

        resetTimer();

        const handleActivity = () => resetTimer();

        events.forEach((event) => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return null;
    // Componente logico, no renderiza nada
}
