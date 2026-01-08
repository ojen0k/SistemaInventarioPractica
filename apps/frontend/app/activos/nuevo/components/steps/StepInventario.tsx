import type { CatalogItem, FormState } from "../../lib/types";
import { Field } from "../Field";

export function StepInventario({
    form,
    set,
    loading,
    clasificaciones,
    estados,
    needsPcSpecs,
}: {
    form: FormState;
    set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
    loading: boolean;
    clasificaciones: CatalogItem[];
    estados: CatalogItem[];
    needsPcSpecs: boolean;
}) {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold">Inventario</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Clasificación">
                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.clasificacionId}
                        onChange={(e) => set("clasificacionId", e.target.value)}
                        disabled={loading || clasificaciones.length === 0}
                    >
                        {clasificaciones.map((x) => (
                            <option key={x.id} value={x.id}>
                                {x.nombre}
                            </option>
                        ))}
                    </select>
                    {needsPcSpecs && (
                        <div className="mt-1 text-xs text-gray-600">
                            Esta clasificación requiere specs de computador (Paso 3).
                        </div>
                    )}
                </Field>

                <Field label="Estado">
                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.estadoId}
                        onChange={(e) => set("estadoId", e.target.value)}
                        disabled={loading || estados.length === 0}
                    >
                        {estados.map((x) => (
                            <option key={x.id} value={x.id}>
                                {x.nombre}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="Nombre del activo">
                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.nombreActivo}
                    onChange={(e) => set("nombreActivo", e.target.value)}
                    placeholder="Ej: Notebook Dell Latitude 5420"
                    disabled={loading}
                />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field label="Marca (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.marca}
                        onChange={(e) => set("marca", e.target.value)}
                        placeholder="Ej: Dell"
                        disabled={loading}
                    />
                </Field>

                <Field label="Modelo (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.modelo}
                        onChange={(e) => set("modelo", e.target.value)}
                        placeholder="Ej: Latitude 5420"
                        disabled={loading}
                    />
                </Field>

                <Field label="Serial number (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.serialNumber}
                        onChange={(e) => set("serialNumber", e.target.value)}
                        placeholder="Ej: ABC123XYZ"
                        disabled={loading}
                    />
                </Field>
            </div>

            <Field label="Ubicación (texto libre por ahora)">
                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.ubicacionTexto}
                    onChange={(e) => set("ubicacionTexto", e.target.value)}
                    placeholder="Ej: Bodega TI / Oficina 12"
                    disabled={loading}
                />
            </Field>

            <Field label="Observación (opcional)">
                <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.observacionActivo}
                    onChange={(e) => set("observacionActivo", e.target.value)}
                    rows={3}
                    placeholder="Opcional..."
                    disabled={loading}
                />
            </Field>
        </div>
    );
}
