export type OrgItem = { id: string; nombre: string };

async function fetchOrg(path: string): Promise<OrgItem[]> {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) throw new Error("NEXT_PUBLIC_API_BASE_URL no está definida.");

    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Error org ${path}: ${res.status}`);

    const data = await res.json();
    return (Array.isArray(data) ? data : []).map((r: any) => ({
        id: String(r.id),
        nombre: r.nombre,
    }));
}

export const orgApi = {
    areas: () => fetchOrg("/org/areas"),
    direcciones: (areaId: string) => fetchOrg(`/org/direcciones?areaId=${encodeURIComponent(areaId)}`),
    departamentos: (direccionId: string) =>
        fetchOrg(`/org/departamentos?direccionId=${encodeURIComponent(direccionId)}`),
    oficinas: (departamentoId: string) =>
        fetchOrg(`/org/oficinas?departamentoId=${encodeURIComponent(departamentoId)}`),
    seccionesPrograma: (oficinaId: string) =>
        fetchOrg(`/org/secciones-programa?oficinaId=${encodeURIComponent(oficinaId)}`),
};
