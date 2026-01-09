import type { FormState } from "../../lib/types";
import { Field } from "../Field";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

type IpCheck = {
    ip: string;
    available: boolean;
    reason: string;
    assignedToActivoId?: number | null;
}

export function StepPcSpecs({
    form,
    set,
}: {
    form: FormState;
    set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}) {
    const [ipInfo, setIpInfo] = useState<IpCheck | null>(null);
    const [ipLoading, setIpLoading] = useState(false);
    const [ipError, setIpError] = useState<string | null>(null);

    useEffect(() => {
        const ip = (form.ip ?? "").trim();
        setIpError(null);

        // vacío => no valida y NO bloquea
        if (!ip) {
            setIpInfo(null);
            set("ipDisponible", null);
            return;
        }

        // valida formato rápido (x.x.x.x + 0-255)
        const parts = ip.split(".");
        const formatOk =
            parts.length === 4 &&
            parts.every(p => /^\d+$/.test(p) && Number(p) >= 0 && Number(p) <= 255);

        if (!formatOk) {
            setIpInfo(null);
            setIpError("Formato de IP inválido (ej: 192.168.1.50)");
            set("ipDisponible", false);
            return;
        }

        // debounce + fetch
        set("ipDisponible", null);
        const t = setTimeout(async () => {
            try {
                if (!API) throw new Error("NEXT_PUBLIC_API_URL no está definida.");
                setIpLoading(true);

                const res = await fetch(`${API}/ips/check?ip=${encodeURIComponent(ip)}`);
                const data = (await res.json()) as IpCheck;
                if (!res.ok) throw new Error((data as any)?.message ?? `HTTP ${res.status}`);

                setIpInfo(data);
                set("ipDisponible", data.available);
            } catch (e: any) {
                setIpInfo(null);
                setIpError(e?.message ?? "Error validando IP");
                set("ipDisponible", false);
            } finally {
                setIpLoading(false);
            }
        }, 500);

        return () => clearTimeout(t);
    }, [form.ip]);


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
                        value={form.ip ?? ""}
                        onChange={(e) => set("ip", e.target.value)}
                        placeholder="Ej: 192.168.1.10"
                    />

                    {ipLoading && <p className="mt-1 text-xs text-gray-500">Validando IP...</p>}
                    {ipError && <p className="mt-1 text-xs text-red-600">{ipError}</p>}

                    {ipInfo && !ipInfo.available && (
                        <p className="mt-1 text-xs text-red-600">
                            ⚠️ IP ocupada{ipInfo.assignedToActivoId ? ` (activo #${ipInfo.assignedToActivoId})` : ""}. Cambia la IP para continuar.
                        </p>
                    )}

                    {ipInfo && ipInfo.available && (
                        <p className="mt-1 text-xs text-green-700">✅ IP disponible.</p>
                    )}
                </Field>
            </div>
        </div>
    );
}
