import type { CatalogItem, FormState } from "../../lib/types";
import { Field } from "../Field";

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
                        onChange={(e) => set("rutProveedor", e.target.value)}
                        placeholder="Ej: 12.345.678-9"
                        disabled={loading}
                    />
                </Field>

                <Field label="Nombre proveedor">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.nombreProveedor}
                        onChange={(e) => set("nombreProveedor", e.target.value)}
                        placeholder="Ej: Proveedor SpA"
                        disabled={loading}
                    />
                </Field>
            </div>
        </div>
    );
}
