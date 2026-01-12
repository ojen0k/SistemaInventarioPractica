"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "./auth";

export function useRequireAuth() {
    const router = useRouter();
    const token = getToken();

    useEffect(() => {
        if (!token) router.replace("/login");
    }, [router, token]);

    return token;
}
