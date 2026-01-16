import type { CatalogItem, FormState } from "../../lib/types";
import { Field } from "../Field";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

type ProvLookup = {
    found: boolean;
    nombre?: string;
};

export function StepCompra({
    form,
    set,
    loading,
    tipoAdquisicion,
    modalidades,
}: {
    form: FormState;
    set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
    loading: boolean;
    tipoAdquisicion: CatalogItem[];
    modalidades: CatalogItem[];
}) {

    const [nombreTouched, setNombreTouched] = useState(false);
    const [provInfo, setProvInfo] = useState<ProvLookup | null>(null);
    const [rutError, setRutError] = useState<string | null>(null);

    useEffect(() => {
        const rut = (form.rutProveedor ?? "").trim();


        if (!rut) {
            setProvInfo(null);
            return;
        }

        const t = setTimeout(async () => {
            try {
                if (!API) return; // no tirar error en UI, solo no autocompletar

                const res = await fetch(
                    `${API}/proveedores/by-rut?rut=${encodeURIComponent(rut)}`,
                    { cache: "no-store" }
                );

                if (!res.ok) return;

                const data = (await res.json()) as ProvLookup;
                setProvInfo(data);

                // solo se autocompleta si:
                // - existe proveedor
                // - viene nombre
                // - el usuario no ha escrito manualmente el nombre
                if (data.found && data.nombre && !nombreTouched) {
                    set("nombreProveedor", data.nombre);
                }
            } catch {

            }
        }, 500);

        return () => clearTimeout(t);
    }, [form.rutProveedor, nombreTouched, set]);

    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold">Orden de compra</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Orden de compra">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.ordenCompra}
                        onChange={(e) => set("ordenCompra", e.target.value)}
                        placeholder="Ej: OC-2026-001"
                        disabled={loading}
                    />
                </Field>

                <Field label="Año">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.anio}
                        onChange={(e) => set("anio", e.target.value)}
                        placeholder="2026"
                        disabled={loading}
                    />
                </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Tipo de adquisición">
                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.tipoAdquisicionId}
                        onChange={(e) => set("tipoAdquisicionId", e.target.value)}
                        disabled={loading || tipoAdquisicion.length === 0}
                    >
                        {tipoAdquisicion.map((x) => (
                            <option key={x.id} value={x.id}>
                                {x.nombre}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Modalidad">
                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.modalidadId}
                        onChange={(e) => set("modalidadId", e.target.value)}
                        disabled={loading || modalidades.length === 0}
                    >
                        {modalidades.map((x) => (
                            <option key={x.id} value={x.id}>
                                {x.nombre}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="Número factura (opcional)">
                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.numeroFactura}
                    onChange={(e) => set("numeroFactura", e.target.value)}
                    placeholder="Ej: 12345"
                    disabled={loading}
                />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="RUT proveedor">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.rutProveedor}
                        onChange={(e) => {
                            const val = e.target.value;
                            setNombreTouched(false);
                            set("rutProveedor", val);

                            // Validación estricta formato visual
                            // x.xxx.xxx-x ó xx.xxx.xxx-x
                            const regex = /^\d{1,2}\.\d{3}\.\d{3}-\d$/;
                            if (val && !regex.test(val)) {
                                setRutError("Ingrese correctamente el RUT");
                            } else {
                                setRutError(null);
                            }
                        }}
                        placeholder="Ej: 12.345.678-9"
                        disabled={loading}
                    />
                    {rutError && (
                        <p className="mt-1 text-xs text-red-600 font-medium">
                            {rutError}
                        </p>
                    )}
                </Field>

                <Field label="Nombre proveedor">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.nombreProveedor}
                        onChange={(e) => {
                            setNombreTouched(true);
                            set("nombreProveedor", e.target.value);
                        }}
                        placeholder="Ej: Proveedor SpA"
                        disabled={loading}
                    />
                    {provInfo?.found && (
                        <p className="mt-1 text-xs text-gray-600">Proveedor encontrado por RUT.</p>
                    )}
                </Field>
            </div>
        </div>
    );
}
