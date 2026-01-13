"use client";

import { useEffect, useState } from "react";
import { fetchActivos, type ActivoRow } from "./nuevo/lib/activos";

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
    useEffect(() => {
        if (!token) return;

        let alive = true;

        (async () => {
            try {
                setLoading(true);
                setErr(null);
                const data = await fetchActivos();
                if (alive) setRows(data);
            } catch (e: any) {
                if (alive) setErr(e?.message ?? "Error cargando activos");
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [token]);

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
                <div className="mt-4 overflow-auto rounded-lg border">
                    <table className="min-w-[1100px] w-full text-left text-sm">
                        <thead className="bg-gray-50">
                            <tr className="border-b">
                                <th className="p-3">ID</th>
                                <th className="p-3">Producto</th>
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
                                <tr key={r.id} className="border-b">
                                    <td className="p-3">{r.id}</td>
                                    <td className="p-3">{r.producto ?? "-"}</td>
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
                                    <td className="p-3 text-gray-600" colSpan={11}>
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
