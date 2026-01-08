import type { FormState } from "../../lib/types";
import { Field } from "../Field";

export function StepPcSpecs({
    form,
    set,
}: {
    form: FormState;
    set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold">Specs (computador)</h2>
            <p className="text-sm text-gray-600">Campos opcionales.</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Procesador (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.procesador}
                        onChange={(e) => set("procesador", e.target.value)}
                        placeholder="Ej: i5-11400"
                    />
                </Field>

                <Field label="Memoria (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.memoria}
                        onChange={(e) => set("memoria", e.target.value)}
                        placeholder="Ej: 16 GB"
                    />
                </Field>

                <Field label="Almacenamiento (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.almacenamiento}
                        onChange={(e) => set("almacenamiento", e.target.value)}
                        placeholder="Ej: 512 GB SSD"
                    />
                </Field>

                <Field label="Placa madre (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.placaMadre}
                        onChange={(e) => set("placaMadre", e.target.value)}
                        placeholder="Opcional"
                    />
                </Field>

                <Field label="Fuente de poder (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.fuentePoder}
                        onChange={(e) => set("fuentePoder", e.target.value)}
                        placeholder="Opcional"
                    />
                </Field>

                <div />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="MAC LAN (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.macLan}
                        onChange={(e) => set("macLan", e.target.value)}
                        placeholder="AA:BB:CC:DD:EE:FF"
                    />
                </Field>

                <Field label="MAC WiFi (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.macWifi}
                        onChange={(e) => set("macWifi", e.target.value)}
                        placeholder="AA:BB:CC:DD:EE:FF"
                    />
                </Field>

                <Field label="IP (opcional)">
                    <input
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        value={form.ip}
                        onChange={(e) => set("ip", e.target.value)}
                        placeholder="192.168.1.50"
                    />
                    <div className="mt-1 text-xs text-gray-600">
                        Luego validaremos disponibilidad desde backend.
                    </div>
                </Field>
            </div>
        </div>
    );
}
