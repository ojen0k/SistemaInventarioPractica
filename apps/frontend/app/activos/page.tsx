"use client";

import { useEffect, useState } from "react";
import { fetchActivos, type ActivoRow } from "./nuevo/lib/activos";

import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

//Proteccion de logeo
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../lib/useRequireAuth";

export default function ActivosPage() {
    //Hooks
    const router = useRouter();
    const token = useRequireAuth();



    //Estado de la página
    const [rows, setRows] = useState<ActivoRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    //Carga de datos
    const loadData = async () => {
        try {
            setLoading(true);
            setErr(null);
            const data = await fetchActivos();
            setRows(data);
        } catch (e: any) {
            setErr(e?.message ?? "Error cargando activos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        loadData();
    }, [token]);

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
                                </tr>
                            ))}

                            {rows.length === 0 && (
                                <tr>
                                    <td className="p-3 text-gray-600" colSpan={12}>
                                        No hay activos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
