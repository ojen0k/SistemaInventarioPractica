export type OrgItem = { id: string; nombre: string; activo?: boolean };

const API = process.env.NEXT_PUBLIC_API_URL;

async function getJSON<T>(path: string): Promise<T> {
    if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definida.");
    const res = await fetch(`${API}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
    return res.json();
}

export const orgApi = {
    areas: () => getJSON<OrgItem[]>("/org/areas"),
    direcciones: (areaId: string) =>
        getJSON<OrgItem[]>(`/org/direcciones?areaId=${encodeURIComponent(areaId)}`),
    departamentos: (direccionId: string) =>
        getJSON<OrgItem[]>(`/org/departamentos?direccionId=${encodeURIComponent(direccionId)}`),
    oficinas: (departamentoId: string) =>
        getJSON<OrgItem[]>(`/org/oficinas?departamentoId=${encodeURIComponent(departamentoId)}`),
    seccionesPrograma: (oficinaId: string) =>
        getJSON<OrgItem[]>(`/org/secciones-programa?oficinaId=${encodeURIComponent(oficinaId)}`),
};
