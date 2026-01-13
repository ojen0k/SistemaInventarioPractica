"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "./auth";

export function useRequireAuth() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const t = getToken();
        if (!t) {
            router.replace("/login");
        } else {
            setToken(t);
        }
    }, [router]);

    return token;
}
