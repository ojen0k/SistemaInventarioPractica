import type { CatalogItem } from "./types";

function pickId(row: any): string {
    const key = Object.keys(row).find((k) => k.toLowerCase().startsWith("id"));
    const val = key ? row[key] : row.nombre;
    return String(val);
}

export async function fetchCatalog(key: string): Promise<CatalogItem[]> {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL no está definida.");

    const res = await fetch(`${base}/catalogos/${key}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Error cargando catálogo ${key}: ${res.status}`);

    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((row: any) => ({
        id: pickId(row),
        nombre: row.nombre,
        activo: row.activo,
    }));
}
