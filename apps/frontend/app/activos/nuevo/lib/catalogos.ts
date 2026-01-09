import type { CatalogItem } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL;

function pickId(row: any): string {
    const key = Object.keys(row).find((k) => k.toLowerCase().startsWith("id"));
    const val = key ? row[key] : row.nombre;
    return String(val);
}

async function getJSON<T>(path: string): Promise<T> {
    if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definida.");
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
    return res.json();
}

export async function fetchCatalog(key: string): Promise<CatalogItem[]> {
    const data = await getJSON<any[]>(`/catalogos/${key}`);
    return (Array.isArray(data) ? data : []).map((row: any) => ({
        id: pickId(row),
        nombre: row.nombre,
        activo: row.activo,
    }));
}
