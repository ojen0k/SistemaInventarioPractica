import type { CatalogItem, FormState } from "../../lib/types";
import { Field } from "../Field";

export function StepAsignacion({
    form,
    set,
    loading,
    cargos,
    tiposAsignacion,
}: {
    form: FormState;
    set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
    loading: boolean;
    cargos: CatalogItem[];
    tiposAsignacion: CatalogItem[];
}) {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold">Asignación</h2>

            <Field label="Unidad organizacional (placeholder por ahora)">
                <input
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.orgPathTexto}
                    onChange={(e) => set("orgPathTexto", e.target.value)}
                    placeholder="Ej: Área / Dirección / Depto / Oficina / Sección (temporal)"
                />
                <div className="mt-1 text-xs text-gray-600">
                    Próximo paso: selects en cascada con tus tablas de unidad organizacional.
                </div>
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Nombre responsable">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.responsableNombre}
                        onChange={(e) => set("responsableNombre", e.target.value)}
                        placeholder="Ej: Juan Pérez"
                    />
                </Field>

                <Field label="Cargo">
                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.cargoId}
                        onChange={(e) => set("cargoId", e.target.value)}
                        disabled={loading || cargos.length === 0}
                    >
                        {cargos.map((x) => (
                            <option key={x.id} value={x.id}>
                                {x.nombre}
                            </option>
                        ))}
                    </select>
                </Field>

                <Field label="Fecha asignación">
                    <input
                        type="date"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.fechaAsignacion}
                        onChange={(e) => set("fechaAsignacion", e.target.value)}
                    />
                </Field>

                <Field label="Tipo de asignación">
                    <select
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.tipoAsignacionId}
                        onChange={(e) => set("tipoAsignacionId", e.target.value)}
                        disabled={loading || tiposAsignacion.length === 0}
                    >
                        {tiposAsignacion.map((x) => (
                            <option key={x.id} value={x.id}>
                                {x.nombre}
                            </option>
                        ))}
                    </select>
                </Field>
            </div>

            <Field label="Observación (opcional)">
                <textarea
                    className="w-full rounded-md border px-3 py-2 text-sm"
                    value={form.observacionAsignacion}
                    onChange={(e) => set("observacionAsignacion", e.target.value)}
                    rows={3}
                    placeholder="Opcional..."
                />
            </Field>
        </div>
    );
}
