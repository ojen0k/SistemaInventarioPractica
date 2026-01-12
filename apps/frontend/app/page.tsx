"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "./lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? "/activos" : "/login");
  }, [router]);

  return <div className="p-6 text-sm text-gray-600">Cargando...</div>;
}
