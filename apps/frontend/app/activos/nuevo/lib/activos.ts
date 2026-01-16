export type ActivoRow = {
    id: number;
    producto: string | null;
    marca: string | null;
    modelo: string | null;
    serie: string | null;
    estado: string | null;
    clasificacion: string | null;
    oc: string | null;
    anio: number | null;
    proveedorRut: string | null;
    proveedorNombre: string | null;
    responsable: string | null;
    ubicacion: string | null;
    seccion: string | null;
    ip: string | null;
    fechaRegistro: string;
    creadoPor?: string | null;
};

const API = process.env.NEXT_PUBLIC_API_URL;

async function getJSON<T>(path: string): Promise<T> {
    if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definida.");
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
    return res.json();
}

export function fetchActivos(search?: URLSearchParams) {
    const q = search ? `?${search.toString()}` : "";
    return getJSON<ActivoRow[]>(`/activos${q}`);
}
