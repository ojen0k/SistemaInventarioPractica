"use client";

import { useEffect, useState, Suspense } from "react";
import { fetchActivos, type ActivoRow } from "./nuevo/lib/activos";

import { Pencil, Trash2, Filter } from "lucide-react";
import Link from "next/link";
import { SearchTagsInput } from "./components/SearchTagsInput";
import { FiltersPanel, type FilterState } from "./components/FiltersPanel";

//Proteccion de logeo
import { useRouter, useSearchParams } from "next/navigation";
import { useRequireAuth } from "../lib/useRequireAuth";

function ActivosContent() {
    //Hooks
    const router = useRouter();
    const token = useRequireAuth();



    //Estado de la página
    const [rows, setRows] = useState<ActivoRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const searchParams = useSearchParams();

    // Filtros UI
    const [tags, setTags] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        estadoId: "",
        clasificacionId: "",
        areaId: "",
        direccionId: "",
        departamentoId: "",
        oficinaId: "",
        seccionId: "",
    });
    // Filtro especial "Mis activos"
    const [onlyMine, setOnlyMine] = useState(false);

    //Carga de datos
    const loadData = async () => {
        try {
            setLoading(true);
            setErr(null);

            const params = new URLSearchParams();
            // Tags
            if (tags.length > 0) params.set("tags", tags.join(","));

            // Filters
            if (filters.estadoId) params.set("estadoId", filters.estadoId);
            if (filters.clasificacionId) params.set("clasificacionId", filters.clasificacionId);

            if (filters.seccionId) params.set("seccionId", filters.seccionId);
            else if (filters.oficinaId) params.set("oficinaId", filters.oficinaId);
            else if (filters.departamentoId) params.set("departamentoId", filters.departamentoId);
            else if (filters.direccionId) params.set("direccionId", filters.direccionId);
            else if (filters.areaId) params.set("areaId", filters.areaId);

            // My Assets
            if (onlyMine && token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.sub) params.set("creadoPorId", payload.sub);
                } catch (e) {
                    console.error("Error parsing token", e);
                }
            }

            const data = await fetchActivos(params);
            setRows(data);
        } catch (e: any) {
            setErr(e?.message ?? "Error cargando activos");
        } finally {
            setLoading(false);
        }
    };

    // Recargar cuando el filtro cambia
    useEffect(() => {
        if (!token) return;
        loadData();
    }, [token, tags, filters, onlyMine]);

    useEffect(() => {
        const created = searchParams.get('created');
        if (created) {
            setToastMsg(`Activo ingresado: ${created}`);
            // Limpiar URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('created');
            window.history.replaceState({}, '', newUrl.toString());

            const t = setTimeout(() => setToastMsg(null), 4000);
            return () => clearTimeout(t);
        }
    }, [searchParams]);

    async function handleDelete(id: number) {
        if (!confirm("¿Estás seguro de eliminar este activo? Esta acción no se puede deshacer.")) return;

        try {
            const API = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${API}/activos/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Error eliminando activo");

            // Recargar datos
            await loadData();
        } catch (error) {
            alert("No se pudo eliminar el activo");
            console.error(error);
        }
    }

    if (!token) return null;

    //UI
    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold">Activos</h1>

            <div className="flex flex-col gap-4 mb-4 mt-2">
                <div className="flex items-start gap-2">
                    <div className="flex-1">
                        <SearchTagsInput
                            tags={tags}
                            onTagsChange={setTags}
                            placeholder="Buscar por serie, modelo, marca, responsable... (Enter para agregar)"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(true)}
                        className={`p-2 border rounded-md flex items-center gap-2 hover:bg-gray-50 ${Object.values(filters).some(x => x) || onlyMine ? "border-blue-500 text-blue-600 bg-blue-50" : "text-gray-600 border-gray-300"
                            }`}
                        title="Filtros avanzados"
                    >
                        <Filter size={20} />
                        <span className="hidden sm:inline">Filtros</span>
                    </button>
                </div>

                {/* Active Filters Display / Quick Toggles */}
                <div className="flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={onlyMine}
                            onChange={e => setOnlyMine(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>Mis activos creados</span>
                    </label>
                </div>
            </div>

            <FiltersPanel
                open={showFilters}
                onClose={() => setShowFilters(false)}
                filters={filters}
                onChange={setFilters}
            />

            {loading && <p className="mt-3 text-sm text-gray-600">Cargando...</p>}

            {err && (
                <div className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm">
                    {err}
                </div>
            )}

            {!loading && !err && (
                <div className="mt-4 overflow-auto">
                    <table className="min-w-[1100px] w-full text-left text-sm overflow-auto border">
                        <thead className="bg-gray-50">
                            <tr className="border-b">
                                <th className="p-3 w-24">Acciones</th>
                                <th className="p-3">ID</th>
                                <th className="p-3">Producto</th>
                                <th className="p-3">IP</th>
                                <th className="p-3">Clasificación</th>
                                <th className="p-3">Estado</th>
                                <th className="p-3">Marca</th>
                                <th className="p-3">Modelo</th>
                                <th className="p-3">Serie</th>
                                <th className="p-3">OC</th>
                                <th className="p-3">Proveedor</th>
                                <th className="p-3">Responsable</th>
                                <th className="p-3">Sección</th>
                                <th className="p-3">Creado Por</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((r) => (
                                <tr key={r.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 flex gap-2">
                                        <Link
                                            href={`/activos/${r.id}/editar`}
                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                            title="Editar"
                                        >
                                            <Pencil size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(r.id)}
                                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                    <td className="p-3">{r.id}</td>
                                    <td className="p-3">{r.producto ?? "-"}</td>
                                    <td className="p-3">{r.ip ?? "-"}</td>
                                    <td className="p-3">{r.clasificacion ?? "-"}</td>
                                    <td className="p-3">{r.estado ?? "-"}</td>
                                    <td className="p-3">{r.marca ?? "-"}</td>
                                    <td className="p-3">{r.modelo ?? "-"}</td>
                                    <td className="p-3">{r.serie ?? "-"}</td>
                                    <td className="p-3">{r.oc ?? "-"}</td>
                                    <td className="p-3">
                                        {r.proveedorNombre ?? "-"}
                                        {r.proveedorRut ? ` (${r.proveedorRut})` : ""}
                                    </td>
                                    <td className="p-3">{r.responsable ?? "-"}</td>
                                    <td className="p-3">{r.seccion ?? "-"}</td>
                                    <td className="p-3 text-xs text-gray-500">
                                        {r.creadoPor ? r.creadoPor : "-"}
                                        <br />
                                        <span className="text-[10px]">
                                            {r.fechaRegistro ? new Date(r.fechaRegistro).toLocaleDateString() : ""}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {rows.length === 0 && !loading && (
                                <tr>
                                    <td className="p-3 text-gray-600 text-center py-8" colSpan={13}>
                                        No se encontraron activos con los filtros seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {toastMsg && (
                <div className="fixed bottom-4 right-4 bg-green-800 text-white px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
                    {toastMsg}
                </div>
            )}
        </div>
    );
}

export default function ActivosPage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <ActivosContent />
        </Suspense>
    );
}
